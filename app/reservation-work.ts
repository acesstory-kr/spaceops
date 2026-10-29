import {koreaSlot} from './space-calendar';
import {shortSpaceName} from './space-labels';
import type {Reservation} from './airbnb-calendar';
export function reservationWork(source:{name:string;category:number},reservation:Reservation){
 if([1,2,3].includes(source.category)){
 if(!reservation.startAt||!reservation.endAt)throw Error('외부 예약 시작·종료 시각이 필요합니다.');
 const start=new Date(reservation.startAt),end=new Date(reservation.endAt);
 const slot=(kind:string,from:Date,to:Date,title:string,category:number)=>{const a=koreaSlot(from),b=koreaSlot(to);return {kind,date:a.date,start:a.time,end:b.date===a.date?b.time:String(Number(b.time.slice(0,2))+24).padStart(2,'0')+b.time.slice(2),title,category,request:'예약 자동 업무 · '+(reservation.title||'외부 예약')}};
 const party=source.category===2||source.category===1&&/파티룸|party/i.test(reservation.title||'');
 if(party)return [slot('before',new Date(start.getTime()-7200000),start,'파티룸 예약 전 청소',2),slot('booking',start,end,reservation.title||'파티룸 예약',2),slot('after',end,new Date(end.getTime()+7200000),'파티룸 예약 후 청소',2)];
 if(source.category===3)return [slot('booking',start,end,reservation.title||'밍글룸 예약',3),slot('after',end,new Date(end.getTime()+3600000),'밍글룸 청소',3)];
 return [slot('booking',start,end,reservation.title||'합정 예약',1)];
 }

 const plans:{kind:string;date:string;start:string;end:string;title:string;request:string;category?:number}[]=[{kind:'checkout',date:reservation.checkout,start:'11:00',end:'15:00',title:shortSpaceName(source.name)+' 체크아웃 청소',request:'에어비앤비 체크아웃 후 청소 · 4시간'}];
 if([4,5].includes(source.category))plans.push({kind:'checkin',date:reservation.checkin,start:'15:00',end:'16:00',title:(source.category===4?'혜화':'상수')+' 입실 체크',request:'에어비앤비 체크인 당일 · 입실 준비와 출입 안내 확인'});
 return plans;
}
