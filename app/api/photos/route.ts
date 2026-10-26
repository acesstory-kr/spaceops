import {canReadTask,canWorkTask,canManageTask} from '@/lib/access';
import {signedPhoto} from '@/lib/photo-storage';
import {env,dbFor} from '@/lib/storage';
import {getChatGPTUser} from '../../chatgpt-auth';
export async function POST(req:Request){const u=await getChatGPTUser();if(!u)return new Response(null,{status:401});const f=await req.formData();const file=f.get('file') as File;const task=String(f.get('task'));const t:any=await dbFor(u).prepare('SELECT * FROM tasks WHERE id=?').bind(task).first();if(!canWorkTask(u,t))return new Response(null,{status:404});if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024)return Response.json({error:'JPG, PNG, WebP 파일을 8MB 이하로 올려주세요.'},{status:400});const id=crypto.randomUUID();await env.BUCKET!.put(id,await file.arrayBuffer(),{httpMetadata:{contentType:file.type}});try{await dbFor(u).prepare('INSERT INTO photos(id,task,name,type) VALUES(?,?,?,?)').bind(id,task,file.name,file.type).run();}catch(e){await env.BUCKET!.delete(id);throw e;}return Response.json({id});}
export async function GET(req:Request){const u=await getChatGPTUser();if(!u)return new Response(null,{status:401});const id=new URL(req.url).searchParams.get('id');const p:any=await dbFor(u).prepare('SELECT photos.*,tasks.private,tasks.owner,tasks.payload FROM photos JOIN tasks ON tasks.id=photos.task WHERE photos.id=?').bind(id).first();if(!canReadTask(u,p))return new Response(null,{status:404});try{return new Response(null,{status:307,headers:{Location:await signedPhoto(p.id),'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'}})}catch{return new Response(null,{status:503})}}

export async function DELETE(req:Request){
 const u=await getChatGPTUser();if(!u)return new Response(null,{status:401});
 let body:any;try{body=await req.json()}catch{return Response.json({error:'사진을 선택해주세요.'},{status:400})}
 if(typeof body.id!=='string'||!body.id||body.id.length>100)return Response.json({error:'사진을 선택해주세요.'},{status:400});
 const p:any=await dbFor(u).prepare('SELECT photos.*,tasks.private,tasks.owner,tasks.payload FROM photos JOIN tasks ON tasks.id=photos.task WHERE photos.id=?').bind(body.id).first();
 if(!canManageTask(u,p))return new Response(null,{status:404});
 await env.BUCKET!.delete(p.id);
 await dbFor(u).prepare('DELETE FROM photos WHERE id=?').bind(p.id).run();
 return Response.json({ok:true});
}
