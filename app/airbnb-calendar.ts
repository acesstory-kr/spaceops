export type Reservation={uid:string;checkin:string;checkout:string;cancelled:boolean};
export function checkAirbnbURL(value:string){let u:URL;try{u=new URL(value.trim())}catch{throw Error('올바른 에어비앤비 iCal 주소를 입력해주세요.')}if(u.protocol!=='https:'||!['www.airbnb.com','airbnb.com','www.airbnb.co.kr','airbnb.co.kr'].includes(u.hostname)||!/^\/calendar\/ical\/[\w-]+\.ics$/.test(u.pathname)||u.username||u.password||u.port)throw Error('에어비앤비에서 내보낸 https://…airbnb…/calendar/ical/…ics 링크를 입력해주세요.');return u.toString()}
export function parseAirbnbICS(raw:string){if(!raw.includes('BEGIN:VCALENDAR')||!raw.includes('END:VCALENDAR'))throw Error('예약 달력 형식이 아닙니다. iCal 내보내기 링크를 확인해주세요.');const lines=raw.replace(/\r\n/g,'\n').replace(/\n[ \t]/g,'').split('\n');let current:Record<string,string>|null=null;const reservations:Reservation[]=[];let excluded=0;const seen=new Set<string>();
for(const line of lines){if(line==='BEGIN:VEVENT'){if(current)throw Error('올바르지 않은 달력입니다.');current={};continue}if(line==='END:VEVENT'){if(!current)continue;const e=current;current=null;const summary=(e.SUMMARY||'').replace(/\\n/g,' ').trim();if(!/^(reserved|reservation|booked|예약|예약됨|예약 완료|확정된 예약)$/i.test(summary)&&e.STATUS!=='CANCELLED'){if(!/(not available|unavailable|blocked|이용 불가|예약 불가|차단)/i.test(summary))throw Error('예약과 차단 일정을 구분할 수 없는 달력입니다. 에어비앤비 원본 링크를 확인해주세요.');excluded++;continue}if(e.RRULE||e['RECURRENCE-ID'])throw Error('반복 예약 형식은 지원하지 않습니다. 숙소별 에어비앤비 원본 달력으로 연결해주세요.');if(!e.UID||seen.has(e.UID))throw Error('예약 식별자가 없거나 중복되었습니다.');seen.add(e.UID);const end=e.DTEND;const start=e.DTSTART;if(!/^\d{8}$/.test(end||'')||!/^\d{8}$/.test(start||''))throw Error('숙박 예약의 체크인·체크아웃 날짜를 확인할 수 없습니다.');const date=end.slice(0,4)+'-'+end.slice(4,6)+'-'+end.slice(6,8);const d=new Date(date+'T12:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==date||end<=start)throw Error('올바르지 않은 체크아웃 날짜입니다.');const checkin=start.slice(0,4)+'-'+start.slice(4,6)+'-'+start.slice(6,8);const arrival=new Date(checkin+'T12:00:00Z');if(!Number.isFinite(arrival.getTime())||arrival.toISOString().slice(0,10)!==checkin)throw Error('올바르지 않은 체크인 날짜입니다.');reservations.push({uid:e.UID,checkin,checkout:date,cancelled:e.STATUS==='CANCELLED'});continue}if(current){const at=line.indexOf(':');if(at<0)continue;const key=line.slice(0,at).split(';')[0].toUpperCase();current[key]=line.slice(at+1)}}
if(current)throw Error('불완전한 달력입니다. 다시 동기화해주세요.');return {reservations,excluded};}

export async function fetchCalendar(value:string){
 let url=checkAirbnbURL(value);let response:Response|undefined;
 try{for(let hop=0;hop<4;hop++){
 response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(20000),headers:{Accept:'text/calendar'}});
 if([301,302,303,307,308].includes(response.status)){
 const location=response.headers.get('location');await response.body?.cancel();
 if(!location||hop===3)throw Error('달력 주소 이동을 처리하지 못했습니다. 에어비앤비에서 링크를 새로 복사해주세요.');
 url=checkAirbnbURL(new URL(location,url).toString());continue;
 }break;
 }}catch(e){if(e instanceof Error&&/달력 주소|에어비앤비에서/.test(e.message))throw e;throw Error('서버에서 에어비앤비에 연결하지 못했습니다. 브라우저에서 다운로드가 된다면 아래 ICS 파일 가져오기를 사용해주세요.');}
 if(!response?.ok)throw Error(`에어비앤비가 서버 요청을 거절했습니다 (HTTP ${response?.status||0}). 링크를 새로 복사하거나 ICS 파일을 가져와주세요.`);
 if(Number(response.headers.get('content-length'))>2000000)throw Error('달력 파일은 2MB 이하만 지원합니다.');
 const reader=response.body?.getReader();if(!reader)throw Error('달력 내용이 없습니다.');
 let total=0,text='';const decoder=new TextDecoder();
 while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>2000000){await reader.cancel();throw Error('달력 파일은 2MB 이하만 지원합니다.');}text+=decoder.decode(value,{stream:true});}
 return parseAirbnbICS(text+decoder.decode());
}
