import {env,verifyStorage} from '@/lib/storage';
export const dynamic='force-dynamic';
export async function GET(){try{await env.DB.prepare('SELECT 1 AS ok').first();return Response.json({ok:true,database:true,auth:!!(process.env.SUPABASE_URL&&process.env.SUPABASE_ANON_KEY&&process.env.ALLOWED_EMAILS),privatePhotoStorage:await verifyStorage()});}catch(e){console.error('Health check failed',e instanceof Error?e.message:'unknown');return Response.json({ok:false},{status:503});}}
