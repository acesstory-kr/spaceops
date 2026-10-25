import {env} from '@/lib/storage';
import {createHash,timingSafeEqual} from 'node:crypto';
export const maxDuration=60;
export async function POST(req:Request){
 const token=req.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 const expected=process.env.MIGRATION_KEY||'';
 if(!expected||!process.env.MIGRATION_EXPIRES_AT||Date.now()>Number(process.env.MIGRATION_EXPIRES_AT)||Buffer.byteLength(token)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(token),Buffer.from(expected)))return new Response(null,{status:401});
 const db=env.DB;
 await db.prepare('CREATE TABLE IF NOT EXISTS migrations(id TEXT PRIMARY KEY)').run();
 if(await db.prepare("SELECT id FROM migrations WHERE id='legacy-v1'").first())return Response.json({error:'이전 완료된 요청입니다.'},{status:410});
 const raw=await req.text();if(Buffer.byteLength(raw)>2000000||createHash('sha256').update(raw).digest('hex')!=='9aabc9540ae8849583264fe15ac5eff218cc8e12e263f44cdeb24ab08beb1ef1')return new Response(null,{status:400});
 const data=JSON.parse(raw);if(data.tasks.length!==80||data.weekly_checks.length!==50)return new Response(null,{status:400});
 const statements=[db.prepare('SELECT pg_advisory_xact_lock(739120053)')];
 for(const r of data.tasks)statements.push(db.prepare('INSERT OR IGNORE INTO tasks(id,owner,private,payload,updated,series_id) VALUES(?,?,?,?,?,?)').bind(r.id,r.owner,r.private,r.payload,r.updated,r.series_id));
 for(const r of data.weekly_checks)statements.push(db.prepare('INSERT OR IGNORE INTO weekly_checks(id,owner,category,week,title,done,note) VALUES(?,?,?,?,?,?,?)').bind(r.id,'workspace',r.category,r.week,r.title,r.done,r.note));
 statements.push(db.prepare("INSERT OR IGNORE INTO migrations(id) VALUES('legacy-v1')"));
 await db.batch(statements);
 const taskRows=(await db.prepare('SELECT * FROM tasks').all()).results;
 const checkRows=(await db.prepare('SELECT * FROM weekly_checks').all()).results;
 const taskMap=new Map(taskRows.map((x:any)=>[x.id,x]));const checkMap=new Map(checkRows.map((x:any)=>[x.id,x]));
 let tasks=0,checks=0;
 for(const r of data.tasks){const x:any=taskMap.get(r.id);if(x&&x.owner===r.owner&&x.private===r.private&&x.payload===r.payload&&x.updated===r.updated&&x.series_id===r.series_id)tasks++;}
 for(const r of data.weekly_checks){const x:any=checkMap.get(r.id);if(x&&x.category===r.category&&x.week===r.week&&x.title===r.title&&x.done===r.done&&x.note===r.note)checks++;}
 return Response.json({ok:tasks===80&&checks===50,verifiedTasks:tasks,verifiedChecks:checks},{headers:{'Cache-Control':'no-store'}});
}
