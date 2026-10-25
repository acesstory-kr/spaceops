import {supabase,allowedEmail} from '@/lib/supabase';
export async function getChatGPTUser(){
 const s=await supabase();const {data:{user},error}=await s.auth.getUser();
 if(error||!user?.email||!allowedEmail(user.email))return null;
 return {userId:user.email.toLowerCase()==='keay333@gmail.com'?'FibvcQHOUMniY4XGPod1mzshfaqvbcw75e2vZvaN6ryP7WCKU7HDCJ':user.email.toLowerCase(),email:user.email,displayName:user.email,fullName:null};
}
