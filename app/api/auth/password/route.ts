import {supabase,allowedEmail} from '@/lib/supabase';
const reply=(body:object,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'요청 출처를 확인해주세요.'},403);
 let b:any;try{b=await req.json();}catch{return reply({error:'이메일을 확인해주세요.'},400);}
 const email=typeof b.email==='string'?b.email.trim().toLowerCase():'';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return reply({error:'올바른 이메일을 입력해주세요.'},400);
 const message='등록된 사용 가능한 계정이면 재설정 메일이 발송됩니다. 스팸함도 확인해주세요.';
 if(!allowedEmail(email))return reply({message});
 const s=await supabase();const {error}=await s.auth.resetPasswordForEmail(email,{redirectTo:new URL('/auth/callback?next=/reset-password',req.url).toString()});
 if(error)return reply({error:'메일을 보내지 못했습니다. 잠시 후 다시 시도해주세요. 계속 실패하면 관리자에게 문의해주세요.'},429);
 return reply({message});
}
export async function PATCH(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'요청 출처를 확인해주세요.'},403);
 const s=await supabase();const {data:{user},error:authError}=await s.auth.getUser();
 if(authError||!user?.email||!allowedEmail(user.email))return reply({error:'인증 링크가 만료되었거나 유효하지 않습니다. 재설정 링크를 다시 받아주세요.'},401);
 let b:any;try{b=await req.json();}catch{return reply({error:'비밀번호를 확인해주세요.'},400);}
 if(typeof b.password!=='string'||b.password.length<8||b.password.length>128)return reply({error:'비밀번호를 8~128자로 입력해주세요.'},400);
 const {error}=await s.auth.updateUser({password:b.password});
 if(error)return reply({error:'변경하지 못했습니다. 이전과 다른 비밀번호를 사용하거나 재설정 링크를 다시 받아주세요.'},400);
 await s.auth.signOut();return reply({ok:true});
}
