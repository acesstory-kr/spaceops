export const spaceNames=['홍대연습실','합정연습실','🎉 파티룸','밍글룸','혜화','상수','개인 일정'];
export const spaceColors=['#ffe0e4','#eae0ff','#ffe5bc','#fff0b8','#dbeaff','#d7efdd','#e9ebef'];
export function shortSpaceName(value:string){return String(value||'').replace(/혜화\s*숙소\s*청소/g,'혜화').replace(/혜화\s*숙소/g,'혜화').replace(/상수\s*숙소\s*청소/g,'상수').replace(/상수\s*숙소/g,'상수');}
export function dayProgress(tasks:{status:string}[]){return {total:tasks.length,done:tasks.filter(t=>t.status==='완료').length,inProgress:tasks.filter(t=>t.status==='진행중').length};}
export function shortTaskTitle(value:string){return String(value||'').replace(/혜화\s*숙소\s*청소/g,'혜화 청소').replace(/혜화\s*숙소/g,'혜화').replace(/상수\s*숙소\s*청소/g,'상수 청소').replace(/상수\s*숙소/g,'상수');}
