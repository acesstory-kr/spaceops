'use client';
import {useEffect,useRef,useState} from 'react';
import {inspectionSamples} from '@/lib/inspection-presets';
import {spaceNames,spaceColors} from './space-labels';
import {periodKey} from '@/lib/inspection';
import Checklists from './checklists';
const today=()=>new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
const cycles={daily:'일간',weekly:'주간',monthly:'월간'};
export default function InspectionBoard({role,demo=false}:{role:string;demo?:boolean}){
 const [day,D]=useState(today),[space,C]=useState(0),[cycle,Y]=useState('all'),[data,S]=useState<any>({definitions:[],records:[]}),[error,E]=useState(''),[busy,B]=useState(false),[legacy,L]=useState(false);
 const sample=useRef<any>({definitions:inspectionSamples(),records:[]});
 const request=useRef(0);
 async function load(){const id=++request.current;E('');try{if(demo){S({...sample.current});return}const r=await fetch('/api/admin/inspections?day='+day,{cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error||'점검표를 불러오지 못했습니다.');if(id===request.current)S(d)}catch(e:any){if(id===request.current)E(e.message)}}
 useEffect(()=>{load();return()=>{request.current++}},[day,demo]);
 const categories=Array.from(new Set<number>(data.definitions.map((d:any)=>d.category))).sort();
 const selectedSpace=categories.includes(space)?space:categories[0];
 const defs=data.definitions.filter((d:any)=>d.active&&d.category===selectedSpace&&(cycle==='all'||d.cycle===cycle));
 const record=(d:any)=>data.records.find((r:any)=>r.definition===d.id&&r.period===periodKey(day,d.cycle));
 async function save(def:any,done:boolean,note:string){B(true);E('');try{if(demo){sample.current.records=[...sample.current.records.filter((r:any)=>!(r.definition===def.id&&r.period===periodKey(day,def.cycle))),{definition:def.id,period:periodKey(day,def.cycle),done,note,actor:'예시 사용자',updated:new Date().toISOString()}];S({...sample.current});return}
 const r=await fetch('/api/admin/inspections',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({definition:def.id,day,done,note})});if(!r.ok){const d=await r.json();throw Error(d.error||'점검 저장에 실패했습니다.')}await load()}catch(e:any){E(e.message)}finally{B(false)}}
 function shift(n:number){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);D(d.toISOString().slice(0,10))}
 return <section className="weekly-tasks inspection-board">
 {demo&&<p className="hint">점검 전용 예시 화면 · 실제 점검 기록에는 반영되지 않습니다.</p>}
 <div className="weekly-nav"><button onClick={()=>shift(-7)}>‹ 이전 주</button><b>{day}</b><button onClick={()=>shift(7)}>다음 주 ›</button><button onClick={()=>D(today())}>오늘</button><input aria-label="점검 날짜" type="date" value={day} onChange={e=>{if(e.target.value)D(e.target.value)}}/></div>
 <div className="inspection-spaces" role="group" aria-label="점검할 공간 선택">{categories.map(i=><button key={i} aria-pressed={selectedSpace===i} style={{borderColor:spaceColors[i],background:selectedSpace===i?spaceColors[i]:undefined}} onClick={()=>C(i)}>{spaceNames[i]}</button>)}</div>
 <div className="inspection-cycle"><label>점검 주기<select aria-label="점검 주기" value={cycle} onChange={e=>Y(e.target.value)}><option value="all">전체 주기</option>{Object.entries(cycles).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><button onClick={()=>L(!legacy)}>{legacy?'현재 점검표':'이전 주간점검 기록'}</button></div>
 {error&&<p className="admin-error" role="alert">{error}<button onClick={load}>다시 시도</button></p>}
 {legacy?<Checklists/>:<section className="weekly-day"><div className="weekly-day-title"><h3>{spaceNames[selectedSpace]||'점검항목'} <strong>점검 현황</strong></h3><span className="day-checks">{defs.filter((d:any)=>record(d)?.done).length}/{defs.length} 완료</span></div>
 {defs.map((d:any)=>{const r=record(d);return <article className={'weekly-row inspection-row '+(r?.done?'completed':'')} key={d.id}><input className="weekly-check" aria-label={d.title+' 완료'} type="checkbox" disabled={busy||role==='staff'} checked={!!r?.done} onChange={e=>save(d,e.target.checked,r?.note||'')}/><div className="inspection-body"><div className="weekly-row-head"><span className="space-tag" style={{background:spaceColors[d.category]}}>{spaceNames[d.category]}</span><strong>{d.title}</strong></div><p className="weekly-meta">{cycles[d.cycle as keyof typeof cycles]} · {d.required?'필수':'선택'} · {r?.done?'완료':'미완료'} · {periodKey(day,d.cycle)}</p><form onSubmit={e=>{e.preventDefault();save(d,!!r?.done,String(new FormData(e.currentTarget).get('note')||''))}}><textarea key={d.id+day+(r?.updated||'')} name="note" rows={1} defaultValue={r?.note||''} aria-label={d.title+' 메모'} placeholder="특이사항 메모" maxLength={2000} disabled={role==='staff'}/><button disabled={busy||role==='staff'}>메모 저장</button></form>{r?.updated&&<small>{r.actor} · {new Date(r.updated).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}</small>}</div></article>})}
 {!defs.length&&<p className="weekly-no-task">이 공간·주기에 등록된 점검항목이 없습니다. 항목 추가·수정은 최고 관리자 화면에서 진행합니다.</p>}</section>}
 </section>
}
