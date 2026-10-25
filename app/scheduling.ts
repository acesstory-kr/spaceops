export function dateKey(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function moveDay(key:string,amount:number){const d=new Date(key+'T12:00:00');d.setDate(d.getDate()+amount);return dateKey(d)}
export function scheduleDates(input:{date:string;repeat?:string;until?:string;weekdays?:number[];dates?:string[]}){
const valid=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&dateKey(new Date(s+'T12:00:00'))===s;
if(!valid(input.date))throw Error('시작 날짜를 확인해주세요.');
const mode=input.repeat||'없음';if(mode==='없음')return [input.date];
if(mode==='날짜 선택'){const dates=[...new Set(input.dates||[])].sort();if(!dates.length)throw Error('달력에서 날짜를 하나 이상 선택해주세요.');if(dates.length>366||dates.some(d=>!valid(d)))throw Error('올바른 날짜를 366개 이하로 선택해주세요.');return dates;}
if(!input.until||!valid(input.until)||input.until<input.date)throw Error('반복 종료일은 시작일 이후로 설정해주세요.');
const weekdays=input.weekdays||[];if(mode==='요일 선택'&&!weekdays.length)throw Error('반복할 요일을 하나 이상 선택해주세요.');
const dates:string[]=[];let key=input.date;let count=0;while(key<=input.until){if(count++>366)throw Error('반복 기간은 최대 1년으로 설정해주세요.');if(mode==='매일'||mode==='요일 선택'&&weekdays.includes(new Date(key+'T12:00:00').getDay()))dates.push(key);key=moveDay(key,1);}
if(!dates.length)throw Error('선택한 기간에 해당 요일이 없습니다.');return dates;
}
