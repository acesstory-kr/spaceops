export const taskStatuses=['미진행','진행중','완료','일정 변경','보류'];
export function taskMetadata(previous:any,next:any,actor:string,now:string){
 const fields=['assignmentEmails','title','date','start','end','category','assignee','request','note','status'];
 const changes=fields.filter(key=>JSON.stringify(previous?.[key])!==JSON.stringify(next[key]));
 const completedAt=next.status==='완료'?(previous?.status==='완료'?previous.completedAt||null:now):null;
 const history=Array.isArray(previous?.history)?previous.history.slice(-99):[];
 if(changes.length)history.push({at:now,actor,action:previous?'updated':'created',changes});
 return {completedAt,history};
}
