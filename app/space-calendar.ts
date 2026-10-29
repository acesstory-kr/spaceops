import type {Reservation} from './airbnb-calendar';
function stamp(value:string,key:string){
 if(!/^\d{8}T\d{6}Z?$/.test(value))throw Error('시간이 포함된 ICS 예약만 지원합니다.');
 if(key.includes('TZID=')&&!key.includes('TZID=Asia/Seoul')&&!key.includes('TZID=UTC'))throw Error('Asia/Seoul 또는 UTC 달력을 사용해주세요.');
 const iso=value.slice(0,4)+'-'+value.slice(4,6)+'-'+value.slice(6,8)+'T'+value.slice(9,11)+':'+value.slice(11,13)+':'+value.slice(13,15)+(value.endsWith('Z')||key.includes('TZID=UTC')?'Z':'+09:00');
 const time=new Date(iso);if(!Number.isFinite(time.getTime()))throw Error('예약 시각을 확인해주세요.');return time;
}
export function koreaSlot(date:Date){const parts=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(date).split(' ');return {date:parts[0],time:parts[1]}}
export function parseSpaceICS(raw:string){if(!raw.includes('BEGIN:VCALENDAR')||!raw.includes('END:VCALENDAR'))throw Error('ICS 내보내기 파일이 아닙니다.');const reservations:Reservation[]=[];let row:Record<string,string>|null=null;const seen=new Set<string>();let excluded=0;
 for(const line of raw.replace(/\r\n/g,'\n').replace(/\n[ \t]/g,'').split('\n')){
 if(line==='BEGIN:VEVENT'){row={};continue}
 if(line==='END:VEVENT'&&row){const e=row;row=null;if(e.RRULE||e['RECURRENCE-ID'])throw Error('반복 예약은 개별 일정으로 내보내주세요.');if(!e.UID||seen.has(e.UID))throw Error('예약 식별자가 없거나 중복되었습니다.');seen.add(e.UID);if(/차단|blocked|unavailable/i.test(e.SUMMARY||'')){excluded++;continue}const start=stamp(e.DTSTART||'',e.startKey||''),end=stamp(e.DTEND||'',e.endKey||'');if(end<=start)throw Error('종료 시각이 시작보다 늦어야 합니다.');reservations.push({uid:e.UID,checkin:koreaSlot(start).date,checkout:koreaSlot(end).date,cancelled:e.STATUS==='CANCELLED',startAt:start.toISOString(),endAt:end.toISOString(),title:e.SUMMARY||'외부 예약'});continue}
 if(row){const at=line.indexOf(':');if(at<0)continue;const k=line.slice(0,at),name=k.split(';')[0].toUpperCase();row[name]=line.slice(at+1);if(name==='DTSTART')row.startKey=k;if(name==='DTEND')row.endKey=k}
 }if(row)throw Error('불완전한 달력입니다.');return {reservations,excluded};
}
