'use client';
import {useState} from 'react';
import PhotoIssues from './photo-issues';
import InspectionBoard from './inspection-board';
export default function ManagerConsole({tasks,onChanged,onEdit,onDelete,busy,demo=false}:{tasks:any[];onChanged:()=>Promise<void>;onEdit:(t:any)=>void;onDelete:(ids:string[])=>Promise<void>;busy:boolean;demo?:boolean}){
 const [tab,T]=useState('photos');
 return <section className="admin-panel"><div className="admin-title"><h2>SpaceOps 운영 관리</h2><small>담당 공간 운영 매니저</small></div><nav className="payroll-mode-switch"><button aria-pressed={tab==='photos'} onClick={()=>T('photos')}>사진·이슈</button><button aria-pressed={tab==='inspections'} onClick={()=>T('inspections')}>공간별 점검</button></nav><p className="hint">담당 공간만 표시됩니다. 개인 일정·인건비·사용자 권한 설정은 최고 관리자 전용입니다.</p>{tab==='photos'?<PhotoIssues tasks={tasks} onEdit={onEdit} onDelete={onDelete} busy={busy} onChanged={onChanged} metadataEnabled canDelete demo={demo}/>:<InspectionBoard role="manager" demo={demo}/>}</section>
}
