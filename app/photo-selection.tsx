
'use client';
import {useState} from 'react';
type Photo={id:string;name:string};
export default function PhotoSelection({photos,busy,onDelete,compact=false}:{photos:Photo[];busy:boolean;onDelete:(ids:string[])=>Promise<void>;compact?:boolean}){
 const [selecting,setSelecting]=useState(false),[selected,setSelected]=useState<string[]>([]);
 const ids=selected.filter(id=>photos.some(p=>p.id===id));
 if(!photos.length)return null;
 return <div className={'photo-selection '+(compact?'compact':'')}>
 <div className="photo-selection-actions"><button type="button" disabled={busy} onClick={()=>{setSelecting(!selecting);setSelected([])}}>{selecting?'선택 취소':'사진 선택 / 삭제'}</button>{selecting&&<><span>{ids.length}장 선택</span><button type="button" className="danger" disabled={busy||!ids.length} onClick={async()=>{if(!window.confirm(`선택한 사진 ${ids.length}장을 삭제할까요? 삭제한 사진은 복구할 수 없습니다.`))return;await onDelete(ids);setSelected([])}}>선택 사진 삭제</button></>}</div>
 <div className="selectable-photo-grid">{photos.map(p=><div className={'selectable-photo '+(ids.includes(p.id)?'selected':'')} key={p.id}>{selecting?<label><input type="checkbox" disabled={busy} checked={ids.includes(p.id)} aria-label={p.name+' 선택'} onChange={e=>setSelected(current=>e.target.checked?[...current,p.id]:current.filter(id=>id!==p.id))}/><img loading="lazy" src={'/api/photos?id='+p.id} alt={p.name}/></label>:<a href={'/api/photos?id='+p.id} target="_blank" rel="noreferrer"><img loading="lazy" src={'/api/photos?id='+p.id} alt={p.name}/></a>}</div>)}</div>
 </div>;
}
