
'use client';
import {useState} from 'react';
type Photo={id:string;name:string;url?:string;uploaded_at?:string;uploader?:string};
export default function PhotoSelection({photos,busy,onDelete,compact=false,canDelete=true}:{photos:Photo[];busy:boolean;onDelete:(ids:string[])=>Promise<void>;compact?:boolean;canDelete?:boolean}){
 const [position,S]=useState(1),[selecting,setSelecting]=useState(false),[selected,setSelected]=useState<string[]>([]);
 const ids=selected.filter(id=>photos.some(p=>p.id===id));
 if(!photos.length)return null;
 return <div className={'photo-selection '+(compact?'compact':'')}>
 {canDelete&&<div className="photo-selection-actions"><button type="button" disabled={busy} onClick={()=>{setSelecting(!selecting);setSelected([])}}>{selecting?'선택 취소':'사진 선택 / 삭제'}</button>{selecting&&<><span>{ids.length}장 선택</span><button type="button" className="danger" disabled={busy||!ids.length} onClick={async()=>{if(!window.confirm(`선택한 사진 ${ids.length}장을 삭제할까요? 삭제한 사진은 복구할 수 없습니다.`))return;await onDelete(ids);setSelected([])}}>선택 사진 삭제</button></>}</div>}
 <div className="selectable-photo-grid" onScroll={e=>{const el=e.currentTarget;const first=el.firstElementChild as HTMLElement|null;if(first)S(Math.min(photos.length,Math.max(1,Math.round(el.scrollLeft/(first.offsetWidth+8))+1)))}}>{photos.map(p=><div className={'selectable-photo '+(ids.includes(p.id)?'selected':'')} key={p.id}>{selecting?<label><input type="checkbox" disabled={busy} checked={ids.includes(p.id)} aria-label={p.name+' 선택'} onChange={e=>setSelected(current=>e.target.checked?[...current,p.id]:current.filter(id=>id!==p.id))}/><img loading="lazy" src={p.url||'/api/photos?id='+p.id} alt={p.name}/></label>:<a href={p.url||'/api/photos?id='+p.id} target="_blank" rel="noreferrer"><img loading="lazy" src={p.url||'/api/photos?id='+p.id} alt={p.name}/></a>}{p.uploaded_at&&<small className="photo-uploaded-time">{new Date(p.uploaded_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}</small>}</div>)}</div>{photos.length>1&&<small className="photo-position">{position} / {photos.length} · 좌우로 넘겨보세요</small>}
 </div>;
}
