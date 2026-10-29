'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {MoreHorizontal} from 'lucide-react';
export default function MobileMenu({label,children}:{label:string;children:ReactNode}){
 const [open,O]=useState(false),ref=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(!open)return;const outside=(e:PointerEvent)=>{if(!ref.current?.contains(e.target as Node))O(false)};const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){O(false);trigger.current?.focus()}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key)}},[open]);
 return <div className="mobile-menu" ref={ref}><button className="mobile-icon-button" ref={trigger} aria-label={label} aria-expanded={open} onClick={()=>O(v=>!v)}><MoreHorizontal size={23} strokeWidth={2}/></button>{open&&<nav className="mobile-menu-panel" aria-label={label} onClick={e=>{if((e.target as Element).closest('button,a'))O(false)}}>{children}</nav>}</div>
}
