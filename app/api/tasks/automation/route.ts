import {ownerAccess,json} from '@/lib/admin-server';
import {dbFor} from '@/lib/storage';
import {syncPartyWork,partyPlans} from '../../../party-automation';
export async function POST(){const a=await ownerAccess();if(a.error)return a.error;const db=dbFor(a.user);const today=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});const rows=await db.prepare("SELECT * FROM tasks WHERE private=0 AND json_extract(payload,'$.date')>=?").bind(today).all();let processed=0;for(const r of rows.results as any[]){const task=JSON.parse(r.payload);if(r.id.startsWith('airbnb-')||task.automationParent||!partyPlans({...task,id:r.id}).length)continue;await syncPartyWork(db,r.id,task,r.owner);processed++}return json({ok:true,processed});}
