import {supabase,allowedEmail} from '@/lib/supabase';
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return new Response(null,{status:403});
 const {email:raw,password}=await req.json();const email=String(raw||'').trim().toLowerCase();
 if(!allowedEmail(email))return Response.json({error:'초대된 이메일인지 확인해주세요.'},{status:403});
 const s=await supabase();
 if(password){const {error}=await s.auth.signInWithPassword({email,password});return error?Response.json({error:'이메일 또는 비밀번호를 확인해주세요.'},{status:400}):Response.json({ok:true});}
 const {error}=await s.auth.signInWithOtp({email,options:{emailRedirectTo:new URL('/auth/callback',req.url).toString()}});
 return error?Response.json({error:'로그인 메일 발송에 실패했습니다. Supabase 이메일 설정 또는 발송 제한을 확인해주세요.'},{status:429}):Response.json({message:'이메일의 로그인 링크를 눌러주세요. 스팸함도 확인해주세요.'});
}
