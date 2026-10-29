const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert/strict');
let user=null,reads=0,writes=0;
function load(path,mocks){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>mocks[n]||require(n),Response,Request,URL,console});return exports;}
const auth={getChatGPTUser:async()=>user};
const storage={dbFor:()=>({prepare:()=>({bind(){return this},first:async()=>{reads++;return {data:'{"base":[1,2,3,4,5],"people":{}}'}},all:async()=>{reads++;return {results:[]}},run:async()=>{writes++}})})};
const access=load('lib/admin-server.ts',{'@/app/chatgpt-auth':auth,'./access':{adminV2:()=>true}});
const rates=load('app/api/payroll/route.ts',{'../../chatgpt-auth':auth,'@/lib/storage':storage});
const payments=load('app/api/payroll/payments/route.ts',{'@/lib/admin-server':access,'@/lib/storage':storage});
(async()=>{for(const role of [null,'staff','manager','owner']){user=role?{role}:null;const status=role===null?401:role==='staff'?403:200;assert.equal((await rates.GET()).status,status);assert.equal((await payments.GET()).status,status);if(role!=='owner'){const request=()=>new Request('https://test/api/payroll',{method:'POST',body:'{}'});assert.equal((await rates.POST(request())).status,role?403:401);assert.equal((await payments.POST(request())).status,role?403:401)}}assert.equal(writes,0);assert.equal(reads,4);console.log('PASS: rate/payment APIs allow Owner/Manager reads, deny Staff/anonymous; Manager writes rejected before DB access.');})().catch(e=>{console.error(e);process.exitCode=1});
