import {memberFor} from '@/lib/members';
import {supabase} from '@/lib/supabase';
export async function getChatGPTUser(){
 const s=await supabase();const {data:{user},error}=await s.auth.getUser();
 if(error||!user?.email)return null;const member=await memberFor(user.email);if(!member)return null;
 return {userId:user.email.toLowerCase()==='keay333@gmail.com'?'FibvcQHOUMniY4XGPod1mzshfaqvbcw75e2vZvaN6ryP7WCKU7HDCJ':user.email.toLowerCase(),email:user.email.toLowerCase(),displayName:member.display_name,role:member.role,spaces:member.spaces,fullName:null};
}
