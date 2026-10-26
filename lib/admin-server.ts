import {getChatGPTUser} from '@/app/chatgpt-auth';
import {adminV2} from './access';
export async function ownerAccess(){const user=await getChatGPTUser();if(!user)return {error:Response.json({error:'로그인이 필요합니다.'},{status:401})};if(user.role!=='owner')return {error:Response.json({error:'최고 관리자만 이용할 수 있습니다.'},{status:403})};if(!adminV2())return {error:Response.json({error:'관리자 확장 기능은 백업과 데이터베이스 적용 승인 후 활성화됩니다.'},{status:503})};return {user};}
export const json=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
