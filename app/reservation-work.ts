import {shortSpaceName} from './space-labels';
import type {Reservation} from './airbnb-calendar';
export function reservationWork(source:{name:string;category:number},reservation:Reservation){
 const plans=[{kind:'checkout',date:reservation.checkout,start:'11:00',end:'15:00',title:shortSpaceName(source.name)+' 체크아웃 청소',request:'에어비앤비 체크아웃 후 청소 · 4시간'}];
 if(source.category===5)plans.push({kind:'checkin',date:reservation.checkin,start:'15:00',end:'16:00',title:'상수 입실 체크',request:'에어비앤비 체크인 당일 · 입실 준비와 출입 안내 확인'});
 return plans;
}
