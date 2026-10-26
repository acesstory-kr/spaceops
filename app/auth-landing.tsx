'use client';
import {useEffect} from 'react';
import {createBrowserClient} from '@supabase/ssr';
export default function AuthLanding(){useEffect(()=>{
 const url=new URL(window.location.href);
 if(url.pathname==='/'&&url.searchParams.has('code')){window.location.replace('/auth/callback'+url.search);return;}
 const hash=new URLSearchParams(url.hash.slice(1));
 if(hash.get('type')!=='recovery')return;
 if(hash.has('error')||!hash.get('access_token')||!hash.get('refresh_token')){window.history.replaceState(null,'',url.pathname);window.location.replace('/forgot-password?error=expired');return;}
 const client=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
 // Let the official SDK validate and store the recovery session before navigating.
 client.auth.getSession().then(({data,error})=>{window.history.replaceState(null,'',url.pathname);window.location.replace(!error&&data.session?'/reset-password':'/forgot-password?error=expired');}).catch(()=>{window.history.replaceState(null,'',url.pathname);window.location.replace('/forgot-password?error=expired');});
 },[]);return null;}
