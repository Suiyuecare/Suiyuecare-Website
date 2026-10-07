import assert from 'node:assert/strict';
import crypto,{randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {createPortalLogoutHandler}=require('../server/portal-logout.js');
const {createPortalLogoutWorker}=require('../server/portal-logout-worker.js');
const {normalizePayload,createPortalApiHandler}=require('../api/portal-handoff.js');

const projects={portal:'ussnmxdpxeoshlrdchov',hr:'eswdhynrbzrjgetnmhit',finance:'udtlppnrugmtzhigdsxo',apm:'abcdefghijklmnopqrst'};
const modules=['portal','hr','finance','apm'];
const identity={id:'80000000-0000-4000-8000-000000000001',email:'qa@suiyuecare.com',email_confirmed_at:'2026-01-01',identities:[{provider:'google',identity_data:{sub:'synthetic-google-sub',email:'qa@suiyuecare.com',email_verified:true}}]};
const createdBefore='2026-10-07T18:00:00.123456Z';
const environment={VERCEL_ENV:'production',APM_SOURCE_SUPABASE_REF:projects.apm,APM_PORTAL_LOGOUT_SECRET:'synthetic-apm-logout-secret-with-at-least-32-characters'};
for(const[id,ref]of Object.entries(projects)){const prefix=id==='portal'?'PORTAL':id.toUpperCase()+'_SOURCE';environment[prefix+'_SUPABASE_URL']='https://'+ref+'.supabase.co';environment[prefix+'_SUPABASE_PUBLISHABLE_KEY']=id+'-public';if(id!=='apm')environment[prefix+'_SUPABASE_SERVICE_ROLE_KEY']=id+'-service';}
function response(){return{statusCode:0,headers:{},body:'',setHeader(key,value){this.headers[key]=value;},end(value=''){this.body=value;}};}
function request(source){return{method:'POST',headers:{origin:{portal:'https://login.suiyuecare.com',hr:'https://hr.suiyuecare.com',finance:'https://finance.suiyuecare.com',apm:'https://apm.suiyuecare.com'}[source],authorization:'Bearer synthetic-jwt'},body:{source}};}
function fixture({failure=null,unmatched=null,recordFailureSource=false,revoked=false,user=identity,apmBound=true,env=environment}={}){
 const calls=[],events=[],jobs=new Map(),tickets=new Set();
 let targetFailure=failure;
 const receipt=id=>{const job=jobs.get(id),revokedModules=modules.filter(module=>job.done.has(module)),pendingModules=modules.filter(module=>!job.done.has(module));return{receiptId:id,createdBefore:job.createdBefore,source:job.source,ok:pendingModules.length===0,sourceRevoked:job.done.has(job.source),revokedModules,pendingModules};};
 const clientFactory=(url,key)=>{
  calls.push(['client',url,key]);
  return{auth:{getUser:async()=>({data:{user},error:null})},rpc:async(name,args)=>{
   calls.push(['rpc',name,args,key]);
   if(name.endsWith('session_status'))return{data:{active:!revoked,userId:user.id}};
   if(name==='portal_logout_enqueue'){const id=randomUUID();jobs.set(id,{source:args.source,done:new Set(),subject:args.google_subject,email:args.verified_email,createdBefore});events.push('enqueue');return{data:{receiptId:id,createdBefore}};}
   if(name==='portal_logout_record'){if(recordFailureSource&&args.target_module===jobs.get(args.receipt_id).source)return{error:{message:'synthetic record failure'}};if(args.succeeded)jobs.get(args.receipt_id).done.add(args.target_module);events.push('record:'+args.target_module+':'+args.succeeded);return{data:receipt(args.receipt_id)};}
   if(name==='portal_logout_receipt')return{data:receipt(args.receipt_id)};
   if(name==='portal_logout_consume_worker_ticket'){const valid=tickets.delete(args.request_ticket);return{data:valid};}
   if(name==='portal_logout_claim'){const batch=[];for(const[id,job]of jobs){for(const module of modules){if(!job.done.has(module)&&(module===job.source||job.done.has(job.source)))batch.push({receiptId:id,moduleId:module,source:job.source,googleSubject:job.subject,verifiedEmail:job.email,createdBefore:job.createdBefore});}}return{data:batch.slice(0,args.batch_size)};}
   if(name==='portal_revoke_google_sessions'){assert.equal(args.created_before,createdBefore);const module=key.replace('-service','');events.push('revoke:'+module);return key===targetFailure+'-service'?{error:{message:'synthetic failure'}}:{data:{revoked:true,matched:module!==unmatched}};}
   throw Error('unexpected RPC '+name);
  }};
 };
 const fetchImplementation=async(url,options)=>{
  assert.equal(url,'https://apm.suiyuecare.com/api/internal/portal-logout');
  assert.equal(options.method,'POST');assert.equal(options.redirect,'error');
  const header=options.headers,body=JSON.parse(options.body),hash=crypto.createHash('sha256').update(options.body).digest('hex');
  const message=['apm-portal-logout-v1',header['x-apm-portal-timestamp'],header['x-apm-portal-nonce'],hash].join('\n');
  assert.equal(header['x-apm-portal-signature'],crypto.createHmac('sha256',env.APM_PORTAL_LOGOUT_SECRET).update(message).digest('base64url'));
  assert.equal(body.action==='resolve'||body.action==='revoke',true);
  if(body.action==='revoke')assert.equal(body.createdBefore,createdBefore);
  events.push('apm:'+body.action);
  if(body.action==='resolve')return{ok:apmBound,json:async()=>({googleSubject:'synthetic-google-sub',verifiedEmail:'qa@suiyuecare.com'})};
  return{ok:targetFailure!=='apm',json:async()=>({revoked:true,matched:unmatched!=='apm'})};
 };
 return{handler:createPortalLogoutHandler({environment:env,clientFactory,fetchImplementation}),worker:createPortalLogoutWorker({environment:env,clientFactory,fetchImplementation}),apiHandler:createPortalApiHandler({environment:env,clientFactory,fetchImplementation}),calls,events,jobs,tickets,setFailure:value=>{targetFailure=value;}};
}

for(const source of modules){
 const f=fixture(),res=response();await f.handler(request(source),res);
 assert.equal(res.statusCode,200);assert.deepEqual(JSON.parse(res.body).revokedModules,modules);
 assert.equal(JSON.parse(res.body).createdBefore,createdBefore);
 assert.ok(f.events.indexOf('enqueue')<f.events.indexOf(source==='apm'?'apm:revoke':'revoke:'+source));
 const sourceEvent=source==='apm'?'apm:revoke':'revoke:'+source;
 for(const id of modules.filter(id=>id!==source))assert.ok(f.events.indexOf(sourceEvent)<f.events.indexOf(id==='apm'?'apm:revoke':'revoke:'+id));
 assert.ok(!f.calls.some(call=>call[2]==='apm-service'||call[3]==='apm-service'));
 assert.ok(!res.body.includes(identity.email));
}
for(const change of[{headers:{origin:'https://evil.test'}},{method:'GET'},{body:{source:'edoc'}}]){
 const f=fixture(),res=response();await f.handler({...request('hr'),...change},res);assert.ok(res.statusCode>=400);assert.equal(f.jobs.size,0);
}
for(const options of[{revoked:true},{user:{...identity,email_confirmed_at:null}},{user:{...identity,identities:[...identity.identities,{provider:'google',identity_data:{sub:'second-google-sub',email:'other@suiyuecare.com',email_verified:true}}]}},{user:{...identity,identities:[{provider:'google',identity_data:{sub:'synthetic-google-sub',email:'qa@example.com',email_verified:true}}]}},{user:{...identity,identities:[{provider:'google',identity_data:{sub:'synthetic-google-sub',email:'qa@suiyuecare.com',email_verified:false}}]}}]){
 const f=fixture(options),res=response();await f.handler(request('hr'),res);assert.equal(res.statusCode,401);assert.equal(f.jobs.size,0);
}
const partial=fixture({failure:'finance'}),partialResponse=response();await partial.handler(request('hr'),partialResponse);
assert.equal(partialResponse.statusCode,202);const pending=JSON.parse(partialResponse.body);assert.equal(pending.sourceRevoked,true);assert.deepEqual(pending.pendingModules,['finance']);assert.ok(partial.jobs.has(pending.receiptId));
assert.equal(pending.createdBefore,createdBefore);
assert.ok(partial.events.indexOf('revoke:hr')<partial.events.indexOf('revoke:finance'));
const ticket=randomUUID();partial.tickets.add(ticket);partial.setFailure(null);const workerResponse=response();await partial.apiHandler({method:'POST',url:'/api/portal-handoff?action=logout-worker',body:{ticket}},workerResponse);
assert.equal(workerResponse.statusCode,200);assert.equal(JSON.parse(workerResponse.body).completed,1);assert.equal(partial.jobs.get(pending.receiptId).done.size,4);
const unmatchedSource=fixture({unmatched:'hr'}),unmatchedResponse=response();await unmatchedSource.handler(request('hr'),unmatchedResponse);
assert.equal(unmatchedResponse.statusCode,202);assert.equal(JSON.parse(unmatchedResponse.body).sourceRevoked,false);
assert.ok(!unmatchedSource.events.includes('apm:revoke'));assert.ok(!unmatchedSource.events.includes('revoke:finance'));
const recordFailure=fixture({recordFailureSource:true}),recordFailureResponse=response();await recordFailure.handler(request('hr'),recordFailureResponse);
assert.equal(recordFailureResponse.statusCode,202);assert.equal(JSON.parse(recordFailureResponse.body).sourceRevoked,true);
assert.deepEqual(JSON.parse(recordFailureResponse.body).pendingModules,modules);assert.ok(recordFailure.events.includes('revoke:hr'));
const replay=response();await partial.worker({method:'POST',body:{ticket}},replay);assert.equal(replay.statusCode,401);
const unbound=fixture({apmBound:false}),unboundResponse=response();await unbound.handler(request('apm'),unboundResponse);assert.ok(unboundResponse.statusCode>=400);assert.equal(unbound.jobs.size,0);
const misconfigured=fixture({env:{...environment,APM_PORTAL_LOGOUT_SECRET:''}}),misconfiguredResponse=response();await misconfigured.handler(request('hr'),misconfiguredResponse);assert.equal(misconfiguredResponse.statusCode,503);assert.equal(misconfigured.jobs.size,0);
const preview=fixture({env:{...environment,VERCEL_ENV:'preview'}}),previewResponse=response();await preview.handler(request('hr'),previewResponse);assert.equal(previewResponse.statusCode,503);assert.equal(preview.jobs.size,0);
const wrongSource=fixture(),wrongSourceResponse=response();await wrongSource.handler({...request('hr'),body:{source:'portal'}},wrongSourceResponse);assert.equal(wrongSourceResponse.statusCode,403);assert.equal(wrongSource.jobs.size,0);
const routed=response();await createPortalApiHandler({environment})({...request('hr'),url:'/api/portal-handoff?action=logout',headers:{origin:'https://evil.test'}},routed);assert.equal(routed.statusCode,403);
const handoff=normalizePayload({roles:['owner'],googleSubject:'forged'},identity,'hr',2000000000,()=> '80000000-0000-4000-8000-000000000001');assert.equal(handoff.exp-handoff.iat,60);assert.equal(handoff.googleSubject,'synthetic-google-sub');assert.equal(handoff.roles,undefined);assert.throws(()=>normalizePayload({email:'other@suiyuecare.com'},identity,'hr',2000000000,()=>''));
console.log('ok - signed APM endpoint, source-first durable logout, retry worker and four-project contracts');
