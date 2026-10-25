import {supabase} from '@/lib/supabase';
export async function GET(req:Request){const s=await supabase();await s.auth.signOut();return Response.redirect(new URL('/login',req.url));}
