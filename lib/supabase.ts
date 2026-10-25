import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
export async function supabase(){
 const jar=await cookies();
 return createServerClient(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>jar.getAll(),setAll:values=>{try{values.forEach(({name,value,options})=>jar.set(name,value,options))}catch{}}}});
}
export function allowedEmail(email:string){return (process.env.ALLOWED_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).includes(email.toLowerCase());}
