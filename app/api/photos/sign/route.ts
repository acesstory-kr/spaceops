import {getChatGPTUser} from '../../../chatgpt-auth';
import {env,dbFor} from '@/lib/storage';
import {canWorkTask,adminV2} from '@/lib/access';
import {validPhotoMeta} from '@/lib/photo-policy';
import {receipt,signPhoto} from '@/lib/photo-storage';
export async function POST(req:Request){const u=await getChatGPTUser();if(!u)return Response.json({error:'로그인 후 사진을 올려주세요.'},{status:401});let b:any;try{b=await req.json()}catch{return Response.json({error:'파일 정보를 확인해주세요.'},{status:400})}if(!validPhotoMeta(b))return Response.json({error:'JPG, PNG, WebP 사진을 8MB 이하로 선택해주세요. HEIC 사진은 JPG로 변환해주세요.'},{status:400});const task:any=await dbFor(u).prepare('SELECT * FROM tasks WHERE id=?').bind(b.task).first();if(!canWorkTask(u,task))return Response.json({error:'사진을 올릴 수 있는 업무가 아닙니다.'},{status:403});try{const id=crypto.randomUUID();const url=await signPhoto(id);const token=receipt({id,task:b.task,user:u.userId,name:b.name,type:b.type,size:b.size,phase:b.phase,expires:Date.now()+10*60*1000});return Response.json({id,url,receipt:token,metadataEnabled:adminV2()},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'사진 저장소에 연결하지 못했습니다. 다시 시도해주세요.'},{status:503})}}
