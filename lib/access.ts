export type Role='owner'|'manager'|'staff';
export type Actor={userId:string;email:string;displayName:string;role:Role;spaces:number[]};
export const OWNER_EMAIL='acesstory@gmail.com';
export function taskPayload(row:any){return typeof row?.payload==='string'?JSON.parse(row.payload):row;}
export function canReadTask(u:Actor,row:any){if(!row)return false;if(row.private||taskPayload(row).category===6)return row.owner===u.userId;const p=taskPayload(row);return u.role==='owner'||u.spaces.includes(p.category)&&(u.role==='manager'||Array.isArray(p.assignmentEmails)&&p.assignmentEmails.includes(u.email.toLowerCase()));}
export function canManageTask(u:Actor,row:any){return canReadTask(u,row)&&(row.private?row.owner===u.userId:u.role!=='staff');}
export function canWorkTask(u:Actor,row:any){return canReadTask(u,row);}
export function canUseSpace(u:Actor,category:number){return category===6?['owner','manager'].includes(u.role):u.role==='owner'||u.spaces.includes(category);}
export function adminV2(){return process.env.SPACEOPS_ADMIN_V2==='1';}
