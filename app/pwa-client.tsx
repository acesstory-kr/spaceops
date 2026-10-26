'use client';
import {useEffect,useState} from 'react';
type InstallPrompt=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
export default function PwaClient(){
 const [online,setOnline]=useState(true),[prompt,setPrompt]=useState<InstallPrompt|null>(null),[installed,setInstalled]=useState(false),[waiting,setWaiting]=useState<ServiceWorker|null>(null),[error,setError]=useState('');
 useEffect(()=>{
  const connection=()=>{setOnline(navigator.onLine);document.documentElement.dataset.offline=String(!navigator.onLine)};
  connection();setInstalled(matchMedia('(display-mode: standalone)').matches||!!(navigator as Navigator&{standalone?:boolean}).standalone);
  const before=(event:Event)=>{event.preventDefault();setPrompt(event as InstallPrompt)};
  const done=()=>{setInstalled(true);setPrompt(null)};
  addEventListener('online',connection);addEventListener('offline',connection);addEventListener('beforeinstallprompt',before);addEventListener('appinstalled',done);
  let disposed=false;let reg:ServiceWorkerRegistration|undefined;
  const inspect=()=>{if(!disposed&&reg?.waiting)setWaiting(reg.waiting)};
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).then(r=>{reg=r;inspect();r.addEventListener('updatefound',()=>{r.installing?.addEventListener('statechange',inspect)});}).catch(()=>setError('설치 준비를 완료하지 못했습니다. 온라인에서 다시 열어주세요.'));
  return()=>{disposed=true;removeEventListener('online',connection);removeEventListener('offline',connection);removeEventListener('beforeinstallprompt',before);removeEventListener('appinstalled',done)};
 },[]);
 async function install(){if(!prompt)return;try{await prompt.prompt();await prompt.userChoice;setPrompt(null)}catch{setError('브라우저 메뉴에서 홈 화면에 추가를 선택해주세요.')}}
 return <div className="pwa-status">{!online&&<div className="connection-banner" role="status">오프라인 · 열린 화면은 마지막 조회 내용입니다. 연결 후 새로고침하세요. 수정·업로드는 잠시 멈춰주세요.</div>}{error&&<div role="status">{error}</div>}{waiting&&<div className="update-banner">새 버전이 준비되었습니다. 입력 중인 내용을 저장한 후 적용해주세요.<button onClick={()=>{navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});waiting.postMessage({type:'ACTIVATE_UPDATE'})}}>새 버전 적용</button></div>}{!installed&&<div className="install-strip"><span>SpaceOps를 홈 화면에서 바로 열어보세요</span>{prompt?<button onClick={install}>앱 설치</button>:<a href="/install">설치 방법</a>}</div>}</div>;
}
