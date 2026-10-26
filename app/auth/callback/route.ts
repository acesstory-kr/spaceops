import {memberFor} from '@/lib/members';
import {supabase,allowedEmail} from '@/lib/supabase';
import {cookies} from 'next/headers';
export async function GET(req:Request){
 const url=new URL(req.url),code=url.searchParams.get('code'),jar=await cookies();
 const recovery=url.searchParams.get('next')==='/reset-password'||jar.get('spaceops-recovery')?.value==='1';
 const s=await supabase();
 if(code){const {data,error}=await s.auth.exchangeCodeForSession(code);if(!error&&data.user?.email&&(await memberFor(data.user.email))){jar.delete('spaceops-recovery');return Response.redirect(new URL(recovery?'/reset-password':'/',req.url));}await s.auth.signOut();}
 return Response.redirect(new URL(recovery?'/forgot-password?error=expired':'/login?error=callback',req.url));
}
