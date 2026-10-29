import {reservationWork} from './reservation-work';
export function partyPlans(task:any){
 if(![1,2].includes(task.category)||!/파티룸|party/i.test(task.title||'')||/청소|세팅|셋팅/.test(task.title||''))return [];
 if(!/^\d{4}-\d{2}-\d{2}$/.test(task.date)||!/^\d{2}:\d{2}$/.test(task.start)||!/^\d{2}:\d{2}$/.test(task.end))return [];
 const start=new Date(task.date+'T00:00:00+09:00');const end=new Date(start);const mins=(t:string)=>Number(t.slice(0,2))*60+Number(t.slice(3));start.setTime(start.getTime()+mins(task.start)*60000);end.setTime(end.getTime()+mins(task.end)*60000);if(end<=start)return [];
 return reservationWork({name:'파티룸',category:2},{uid:task.id,checkin:task.date,checkout:task.date,startAt:start.toISOString(),endAt:end.toISOString(),title:task.title,cancelled:false}).filter(p=>p.kind!=='booking');
}
export async function syncPartyWork(db:any,parent:string,task:any,owner:string){
 if(task.automationParent||task.sourceName||parent.startsWith('airbnb-'))return;
 const plans=partyPlans(task);const now=new Date().toISOString();const writes=[];
 for(const kind of ['before','after']){
 const id='party-auto-'+parent+'-'+kind;const old=await db.prepare('SELECT * FROM tasks WHERE id=?').bind(id).first();const p=old?JSON.parse(old.payload):null;
 if(p?.status==='완료')continue;const plan=plans.find(p=>p.kind===kind);
 if(!plan){if(old)writes.push(db.prepare('UPDATE tasks SET payload=?,updated=? WHERE id=? AND updated=?').bind(JSON.stringify({...p,sourceCancelled:1}),now,id,old.updated));continue}
 const payload=JSON.stringify({...p,title:plan.title,date:plan.date,start:plan.start,end:plan.end,category:2,assignee:task.assignee||'',assignmentEmails:task.assignmentEmails||[],request:plan.request,note:p?.note||'',status:p?.status||'미진행',automationParent:parent,automationKind:kind,sourceCancelled:0});
 if(old)writes.push(db.prepare('UPDATE tasks SET payload=?,updated=? WHERE id=? AND updated=?').bind(payload,now,id,old.updated));
 else writes.push(db.prepare('INSERT OR IGNORE INTO tasks(id,owner,private,payload,updated) VALUES(?,?,0,?,?)').bind(id,owner,payload,now));
 }
 if(writes.length)await db.batch(writes);
}
