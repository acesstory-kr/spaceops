import {getChatGPTUser} from '../../../chatgpt-auth';
import {syncAll} from '../../../calendar-sync';
export async function POST(){const u=await getChatGPTUser();if(!u)return new Response(null,{status:401});if(u.role!=='owner')return new Response(null,{status:403});return Response.json(await syncAll());}
export async function GET(){const u=await getChatGPTUser();if(!u)return new Response(null,{status:401});if(u.role!=='owner')return new Response(null,{status:403});return Response.json({lastRun:null});}
