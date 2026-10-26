const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript'),{JSDOM}=require('jsdom');
const dom=new JSDOM('<div id="root"></div>',{url:'https://example.invalid/review'});
Object.assign(global,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true});
Object.defineProperty(global,'navigator',{value:dom.window.navigator,configurable:true});
const React=require('react'),{createRoot}=require('react-dom/client'),{act}=React;
let desktop=true;
const noop=()=>null, spaces=['홍대연습실','합정연습실','파티룸','밍글룸','혜화','상수','개인'];
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require:n=>{
 if(n==='./demo-data')return {demoTasks:()=>[{id:'a',title:'청소',date:'2026-10-27',start:'10:00',category:0,status:'미진행',note:'메모',photos:[]}]};
 if(n==='./space-labels')return {spaceNames:spaces};
 if(n==='./scheduling')return {moveDay:(key,n)=>{let d=new Date(key+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)},scheduleDates:()=>[]};
 if(n.startsWith('./'))return {default:noop};
 return require(n);
 },window,document,location:window.location,sessionStorage:window.sessionStorage,navigator,matchMedia:()=>({matches:desktop,addEventListener(){},removeEventListener(){}}),addEventListener(){},removeEventListener(){},setInterval:()=>1,clearInterval(){},setTimeout,clearTimeout,Date,URLSearchParams,console});return exports.default}
(async()=>{const root=createRoot(document.getElementById('root')),Dashboard=load('app/dashboard.tsx');
await act(async()=>root.render(React.createElement(Dashboard,{demo:true})));
assert(document.querySelector('.calendar'));assert(document.querySelector('.calendar-daily .home-daily-work'));
assert.deepEqual([...document.querySelectorAll('.sidebar nav button')].map(b=>b.textContent),['달력','주간업무','점검항목','관리자']);
const day=document.querySelector('.day[aria-label="2026-10-27"]');
if(day){await act(async()=>day.click());assert(document.querySelector('.calendar'));assert(document.querySelector('.calendar-daily').textContent.includes('청소'));}
await act(async()=>root.unmount());
desktop=false;const r=createRoot(document.getElementById('root'));await act(async()=>r.render(React.createElement(Dashboard,{demo:true})));
assert(!document.querySelector('.calendar'));assert(document.querySelector('.today-summary'));
const next=document.querySelector('[aria-label="다음 날 업무"]');await act(async()=>next.click());
assert(document.querySelector('.progressline').textContent.includes('선택한 날'));
await act(async()=>[...document.querySelectorAll('.monthnav button')].find(b=>b.textContent==='오늘').click());
assert(document.querySelector('.day-controls .is-today'));
await act(async()=>document.querySelector('[aria-label="표시할 월 선택"]').click());assert(document.querySelector('input[type=month]'));
assert.deepEqual([...document.querySelectorAll('.mobile-bottom-nav span')].map(x=>x.textContent),['홈','달력','주간업무','점검항목']);
await act(async()=>r.unmount());console.log('PASS: desktop calendar + shared daily cards, four sidebar items, mobile navigation unchanged, day/today controls, month picker.');
})().catch(e=>{console.error(e);process.exitCode=1});
