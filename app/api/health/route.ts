import {env} from '@/lib/storage';
export const dynamic='force-dynamic';
export async function GET(){try{await env.DB.prepare('SELECT 1 AS ok').first();return Response.json({ok:true,database:true,auth:!!(process.env.SUPABASE_URL&&process.env.SUPABASE_ANON_KEY&&process.env.ALLOWED_EMAILS),storage:!!process.env.SUPABASE_SERVICE_ROLE_KEY});}catch{return Response.json({ok:false,database:false},{status:503});}}
