import type {MetadataRoute} from 'next';
export default function manifest():MetadataRoute.Manifest{return {
 id:'/',name:'SpaceOps 공간관리',short_name:'SpaceOps',description:'가족이 함께 관리하는 공간 운영 업무',lang:'ko',start_url:'/?source=pwa',scope:'/',display:'standalone',background_color:'#fbf8fa',theme_color:'#a57186',orientation:'any',
 icons:[{src:'/icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'/icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},{src:'/icons/maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}],
 shortcuts:[{name:'오늘의 업무',url:'/?view=today'},{name:'캘린더',url:'/?view=calendar'}]
};}
