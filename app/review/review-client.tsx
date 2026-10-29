'use client';
import {useState} from 'react';
import Dashboard from '../dashboard';
export default function ReviewClient(){const [role,R]=useState('owner');return <><div className="review-role"><b>예시 계정으로 확인</b><button aria-pressed={role==='owner'} onClick={()=>R('owner')}>최고 관리자</button><button aria-pressed={role==='manager'} onClick={()=>R('manager')}>운영 매니저</button><small>실제 로그인·권한은 변경되지 않습니다.</small></div><Dashboard key={role} demo demoRole={role}/></>}
