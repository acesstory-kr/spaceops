import type {Actor} from './access';
import postgres from 'postgres';
let client:ReturnType<typeof postgres>|undefined;
function sql(){return client??=postgres(process.env.POSTGRES_URL!,{ssl:'require',prepare:false,max:3,idle_timeout:20,connect_timeout:15});}
let ready:Promise<void>|undefined;
const schema=`
CREATE SCHEMA IF NOT EXISTS spaceops;
SET LOCAL search_path TO spaceops;
CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY,owner TEXT NOT NULL,private INTEGER NOT NULL DEFAULT 0,payload TEXT NOT NULL,updated TEXT NOT NULL,series_id TEXT,rowid BIGSERIAL);
CREATE TABLE IF NOT EXISTS photos(id TEXT PRIMARY KEY,task TEXT NOT NULL,name TEXT NOT NULL,type TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS calendar_sources(id TEXT PRIMARY KEY,owner TEXT NOT NULL,name TEXT NOT NULL,category INTEGER NOT NULL,url TEXT NOT NULL,enabled INTEGER NOT NULL DEFAULT 1,last_sync TEXT,last_error TEXT,result TEXT);
CREATE TABLE IF NOT EXISTS sync_items(id TEXT PRIMARY KEY,source TEXT NOT NULL,task TEXT NOT NULL,checkout TEXT NOT NULL,cancelled INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS sync_runs(id TEXT PRIMARY KEY,result TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS payroll_rates(owner TEXT PRIMARY KEY,data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS weekly_checks(id TEXT PRIMARY KEY,owner TEXT NOT NULL,category INTEGER NOT NULL,week TEXT NOT NULL,title TEXT NOT NULL,done INTEGER NOT NULL DEFAULT 0,note TEXT NOT NULL DEFAULT '',rowid BIGSERIAL,UNIQUE(owner,category,week,title));
CREATE TABLE IF NOT EXISTS check_template_settings(owner TEXT NOT NULL,category INTEGER NOT NULL,data TEXT NOT NULL,PRIMARY KEY(owner,category));
CREATE OR REPLACE FUNCTION json_extract(doc text,path text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT doc::jsonb ->> substring(path from 3) $$;
CREATE OR REPLACE FUNCTION json_extract(doc jsonb,path text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT doc ->> substring(path from 3) $$;
CREATE OR REPLACE FUNCTION json_each(doc text) RETURNS TABLE(value jsonb) LANGUAGE sql IMMUTABLE AS $$ SELECT jsonb_array_elements(doc::jsonb) $$;
CREATE OR REPLACE FUNCTION json_set(doc text,VARIADIC pairs text[]) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE result jsonb:=doc::jsonb; i integer; k text;
BEGIN FOR i IN 1..array_length(pairs,1) BY 2 LOOP k:=substring(pairs[i] from 3); result:=jsonb_set(result,ARRAY[k],CASE WHEN k='category' THEN to_jsonb(pairs[i+1]::integer) ELSE to_jsonb(pairs[i+1]) END,true); END LOOP; RETURN result::text; END $$;
REVOKE ALL ON SCHEMA spaceops FROM anon,authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA spaceops FROM anon,authenticated;
`;
async function ensure(){if(process.env.VERCEL_ENV==='preview')return;if(!ready){ready=sql().begin(async tx=>{await tx.unsafe("SELECT pg_advisory_xact_lock(739120052)");await tx.unsafe(schema);}).then(()=>{}).catch(e=>{ready=undefined;throw e});}await ready;}
export function translate(input:string){let n=0,inString=false,out='';for(let i=0;i<input.length;i++){const c=input[i];if(c==="'"){out+=c;if(inString&&input[i+1]==="'"){out+="'";i++;}else inString=!inString;}else out+=c==='?'&&!inString?'$'+(++n):c;}
 if(/^INSERT OR IGNORE /i.test(out))out=out.replace(/^INSERT OR IGNORE /i,'INSERT ')+' ON CONFLICT DO NOTHING';
 // SQLite accepts untyped null category placeholders; Postgres needs an explicit type.
 out=out.replace(/(\$\d+) IS NOT NULL/g,'$1::integer IS NOT NULL');
 out=out.replace(/CASE WHEN (\$\d+)=6/g,'CASE WHEN $1::integer=6');
 return out;}
class Statement{constructor(public query:string,public args:any[]=[],public actor?:Actor){ }bind(...args:any[]){return new Statement(this.query,args,this.actor);}async all(){const r=await DB.batch([this]);return r[0];}async first(){return (await this.all()).results[0]??null;}async run(){return this.all();}}
const DB={prepare:(query:string)=>new Statement(query),async batch(statements:Statement[]){await ensure();return sql().begin(async tx=>{if(process.env.VERCEL_ENV==='preview')await tx.unsafe('SET TRANSACTION READ ONLY');await tx.unsafe('SET LOCAL search_path TO spaceops');const actor=statements[0]?.actor;if(process.env.SPACEOPS_ADMIN_V2==='1'&&actor){await tx.unsafe('SET LOCAL ROLE spaceops_runtime');await tx.unsafe("SELECT set_config('spaceops.email',$1,true),set_config('spaceops.user_id',$2,true),set_config('spaceops.role',$3,true),set_config('spaceops.spaces',$4,true)",[actor.email,actor.userId,actor.role,JSON.stringify(actor.spaces)]);}const results=[];for(const s of statements){const rows=await tx.unsafe(translate(s.query),s.args);results.push({results:Array.from(rows),meta:{changes:rows.count}});}return results;});}};
function storageHeaders(){return {apikey:process.env.SUPABASE_SERVICE_ROLE_KEY!,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY!};}
let bucketReady:Promise<void>|undefined;
async function bucket(){if(process.env.VERCEL_ENV==='preview')return;await (bucketReady??=fetch(process.env.SUPABASE_URL+'/storage/v1/bucket',{method:'POST',headers:{...storageHeaders(),'Content-Type':'application/json'},body:JSON.stringify({id:'spaceops-photos',name:'spaceops-photos',public:false,file_size_limit:8388608,allowed_mime_types:['image/jpeg','image/png','image/webp']})}).then(async r=>{if(!r.ok&&r.status!==409){const b=await r.json();if(!String(b.message||b.error).includes('already exists'))throw Error('사진 저장소를 초기화하지 못했습니다.');}}).catch(e=>{bucketReady=undefined;throw e}));}
const BUCKET={async put(id:string,body:ArrayBuffer,options:any){await bucket();const r=await fetch(process.env.SUPABASE_URL+'/storage/v1/object/spaceops-photos/'+encodeURIComponent(id),{method:'POST',headers:{...storageHeaders(),'Content-Type':options.httpMetadata.contentType},body});if(!r.ok)throw Error('사진을 저장하지 못했습니다.');},async get(id:string){const r=await fetch(process.env.SUPABASE_URL+'/storage/v1/object/authenticated/spaceops-photos/'+encodeURIComponent(id),{headers:storageHeaders(),cache:'no-store'});if(r.status===404)return null;if(!r.ok)throw Error('사진을 불러오지 못했습니다.');return {body:r.body};},async delete(id:string){const r=await fetch(process.env.SUPABASE_URL+'/storage/v1/object/spaceops-photos',{method:'DELETE',headers:{...storageHeaders(),'Content-Type':'application/json'},body:JSON.stringify({prefixes:[id]})});if(!r.ok&&r.status!==404)throw Error('사진을 삭제하지 못했습니다.');}};
export const env={DB,BUCKET};

export async function verifyStorage(){await bucket();const r=await fetch(process.env.SUPABASE_URL+"/storage/v1/bucket/spaceops-photos",{headers:storageHeaders(),cache:"no-store"});if(!r.ok)throw Error("Storage check failed");const b=await r.json();return b.public===false;}

export function dbFor(actor:Actor){return {prepare:(query:string)=>new Statement(query,[],actor),batch:(statements:Statement[])=>DB.batch(statements)}}
