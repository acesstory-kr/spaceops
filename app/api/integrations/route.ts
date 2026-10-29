import {parseSpaceICS} from '../../space-calendar';
import {shortSpaceName} from '../../space-labels';
import {env,dbFor} from '@/lib/storage';
import {getChatGPTUser} from '../../chatgpt-auth';
import {checkAirbnbURL,parseAirbnbICS} from '../../airbnb-calendar';
import {fetchCalendar,syncSource,syncAll} from '../../calendar-sync';
const json=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){const u=await getChatGPTUser();if(!u)return json({error:'로그인이 필요합니다.'},401);if(u.role!=='owner')return json({error:'운영 권한이 필요합니다.'},403);const rows=await dbFor(u).prepare("SELECT id,name,category,enabled,last_sync,last_error,result,CASE WHEN url LIKE 'manual:%' THEN 'file' ELSE 'url' END AS mode FROM calendar_sources").all();return json({sources:rows.results.map((r:any)=>({...r,name:shortSpaceName(r.name)}))});}
export async function POST(req:Request){const u=await getChatGPTUser();if(!u)return json({error:'로그인이 필요합니다.'},401);if(u.role!=='owner')return json({error:'운영 권한이 필요합니다.'},403);if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return json({error:'요청 출처를 확인해주세요.'},403);
if(req.headers.get('content-type')?.includes('multipart/form-data')){
 const form=await req.formData();const file=form.get('file');const name=String(form.get('name')||'').trim();const category=Number(form.get('category'));const sourceId=String(form.get('sourceId')||'');
 if(!(file instanceof File)||!file.name.toLowerCase().endsWith('.ics')||file.size>2000000||!name||name.length>100||![1,2,3,4,5].includes(category))return json({error:'달력 이름·공간과 2MB 이하의 ICS 파일을 확인해주세요.'},400);
 let parsed;try{parsed=[1,2,3].includes(category)?parseSpaceICS(await file.text()):parseAirbnbICS(await file.text())}catch(e:any){return json({error:e.message},400)}
 let source:any;
 if(sourceId){source=await dbFor(u).prepare('SELECT * FROM calendar_sources WHERE id=?').bind(sourceId).first();if(!source||!source.url.startsWith('manual:'))return json({error:'파일 달력을 찾을 수 없습니다.'},404);}
 else{const id=crypto.randomUUID();source={id,owner:u.userId,name,category,url:'manual:'+id};await dbFor(u).prepare('INSERT INTO calendar_sources(id,owner,name,category,url,enabled) VALUES(?,?,?,?,?,0)').bind(id,u.userId,name,category,source.url).run();}
 const result=await syncSource(source,parsed);return json({id:source.id,result,mode:'file'});
}
const body:any=await req.json();if(body.action==='sync')return json(await syncAll());if(body.action==='toggle'){await dbFor(u).prepare("UPDATE calendar_sources SET enabled=? WHERE id=? AND url NOT LIKE 'manual:%'").bind(body.enabled?1:0,body.id).run();return json({ok:true})}
if(!body.name?.trim()||body.name.length>100||![1,2,3,4,5].includes(body.category))return json({error:'달력 이름과 연결할 숙소를 선택해주세요.'},400);let url:string;try{url=checkAirbnbURL(body.url||'')}catch(e:any){return json({error:e.message},400)}const duplicate=await dbFor(u).prepare('SELECT id FROM calendar_sources WHERE url=?').bind(url).first();if(duplicate)return json({error:'이미 추가한 달력입니다. 기존 달력에서 동기화해주세요.'},400);
let parsed;try{parsed=await fetchCalendar(url,body.category)}catch(e:any){return json({error:e.message||'달력에 연결하지 못했습니다.'},400)}const source={id:crypto.randomUUID(),owner:u.userId,name:body.name.trim(),category:body.category,url};await dbFor(u).prepare('INSERT INTO calendar_sources(id,owner,name,category,url,enabled) VALUES(?,?,?,?,?,1)').bind(source.id,source.owner,source.name,source.category,url).run();try{return json({id:source.id,result:await syncSource(source,parsed)})}catch{await dbFor(u).prepare('UPDATE calendar_sources SET last_error=? WHERE id=?').bind('초기 동기화에 실패했습니다. 다시 동기화해주세요.',source.id).run();return json({id:source.id,error:'달력은 연결되었지만 초기 동기화가 완료되지 않았습니다. 다시 동기화해주세요.'},503)}
}
