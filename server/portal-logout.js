const crypto=require('node:crypto');
const {createClient}=require('@supabase/supabase-js');
const origins={portal:'https://login.suiyuecare.com',hr:'https://hr.suiyuecare.com',finance:'https://finance.suiyuecare.com',apm:'https://apm.suiyuecare.com'};
const refs={portal:'ussnmxdpxeoshlrdchov',hr:'eswdhynrbzrjgetnmhit',finance:'udtlppnrugmtzhigdsxo'};
const moduleIds=Object.keys(origins),apmUrl='https://apm.suiyuecare.com/api/internal/portal-logout';
function projectConfiguration(env){
 return Object.fromEntries(moduleIds.map(id=>{
  const ref=id==='apm'?env.APM_SOURCE_SUPABASE_REF:refs[id],prefix=id==='portal'?'PORTAL':id.toUpperCase()+'_SOURCE';
  return[id,{url:env[prefix+'_SUPABASE_URL']||(id==='portal'?env.SUPABASE_URL:null),publicKey:env[prefix+'_SUPABASE_PUBLISHABLE_KEY']||(id==='portal'?env.VITE_SUPABASE_ANON_KEY:null),service:id==='apm'?null:env[prefix+'_SUPABASE_SERVICE_ROLE_KEY']||(id==='portal'?env.SUPABASE_SERVICE_ROLE_KEY:null),expectedUrl:/^[a-z0-9]{20}$/.test(ref||'')?'https://'+ref+'.supabase.co':null}];
 }));
}
function validConfiguration(env){
 const configs=projectConfiguration(env);
 if(moduleIds.some(id=>!configs[id].expectedUrl||configs[id].url!==configs[id].expectedUrl||!configs[id].publicKey||(id!=='apm'&&!configs[id].service)))return null;
 if(typeof env.APM_PORTAL_LOGOUT_SECRET!=='string'||env.APM_PORTAL_LOGOUT_SECRET.length<32)return null;
 return configs;
}
function confirmedGoogleIdentity(user){
 if(!user?.email_confirmed_at)return null;
 const identities=(user.identities||[]).filter(i=>i.provider==='google'&&i.identity_data?.email_verified===true&&typeof i.identity_data.sub==='string'&&i.identity_data.sub.length>0&&i.identity_data.sub.length<=256&&typeof i.identity_data.email==='string');
 if(identities.length!==1)return null;
 const email=identities[0].identity_data.email.trim().toLowerCase();
 return /^[^\s@]+@suiyuecare\.com$/.test(email)?{subject:identities[0].identity_data.sub,email}:null;
}
function clientOptions(){return{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.any([...(init?.signal?[init.signal]:[]),AbortSignal.timeout(10000)])})}};}
function createPortalAdmin(configs,clientFactory){return clientFactory(configs.portal.url,configs.portal.service,clientOptions());}
async function checkedRpc(client,name,args){const result=await client.rpc(name,args);if(result.error||result.data==null)throw Error('Portal RPC failed: '+name);return result.data;}
function apmHeaders(body,secret,now,randomUUID){
 const timestamp=String(Math.floor(now()/1000)),nonce=randomUUID(),hash=crypto.createHash('sha256').update(body).digest('hex');
 const message=['apm-portal-logout-v1',timestamp,nonce,hash].join('\n');
 return{'Content-Type':'application/json','x-apm-portal-timestamp':timestamp,'x-apm-portal-nonce':nonce,'x-apm-portal-signature':crypto.createHmac('sha256',secret).update(message).digest('base64url')};
}
async function callApm(action,values,env,fetchImplementation,now,randomUUID){
 const body=JSON.stringify({action,...values});
 const response=await fetchImplementation(apmUrl,{method:'POST',headers:apmHeaders(body,env.APM_PORTAL_LOGOUT_SECRET,now,randomUUID),body,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('APM logout endpoint failed');
 const result=await response.json();if(!result||typeof result!=='object')throw Error('APM logout endpoint returned invalid data');
 return result;
}
async function revokeModule(id,identity,{configs,environment,clientFactory,fetchImplementation,now,randomUUID},mustMatch=false){
 if(id==='apm'){const result=await callApm('revoke',{googleSubject:identity.subject,verifiedEmail:identity.email,createdBefore:identity.createdBefore},environment,fetchImplementation,now,randomUUID);return result.revoked===true&&(!mustMatch||result.matched===true);}
 const admin=clientFactory(configs[id].url,configs[id].service,clientOptions());
 const result=await admin.rpc('portal_revoke_google_sessions',{google_subject:identity.subject,verified_email:identity.email,created_before:identity.createdBefore});
 return !result.error&&result.data?.revoked===true&&(!mustMatch||result.data?.matched===true);
}
async function processTarget(admin,receiptId,id,identity,dependencies,mustMatch=false){
 let succeeded=false;try{succeeded=await revokeModule(id,identity,dependencies,mustMatch);}catch{/* The outbox retries the target. */}
 await checkedRpc(admin,'portal_logout_record',{receipt_id:receiptId,target_module:id,succeeded});
 return succeeded;
}
function createPortalLogoutHandler({environment=process.env,clientFactory=createClient,fetchImplementation=globalThis.fetch,now=Date.now,randomUUID=crypto.randomUUID}={}){
 return async(request,response)=>{
  response.setHeader('Cache-Control','no-store');response.setHeader('Vary','Origin, Authorization');response.setHeader('X-Content-Type-Options','nosniff');
  const reply=(code,value)=>{response.statusCode=code;response.setHeader('Content-Type','application/json; charset=utf-8');response.end(JSON.stringify(value));};
  const origin=request.headers?.origin;if(!Object.values(origins).includes(origin))return reply(403,{ok:false,reason:'origin'});
  response.setHeader('Access-Control-Allow-Origin',origin);response.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');response.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');
  if(request.method==='OPTIONS'){response.statusCode=204;return response.end();}
  if(request.method!=='POST')return reply(405,{ok:false,reason:'method'});
  let source;try{source=(typeof request.body==='string'?JSON.parse(request.body):request.body)?.source;}catch{return reply(400,{ok:false,reason:'input'});}
  if(!Object.hasOwn(origins,source))return reply(400,{ok:false,reason:'source'});
  if(origins[source]!==origin)return reply(403,{ok:false,reason:'source'});
  const token=String(request.headers.authorization||'').match(/^Bearer ([^\s]+)$/)?.[1];if(!token)return reply(401,{ok:false,reason:'auth'});
  const configs=validConfiguration(environment);if(!configs)return reply(503,{ok:false,reason:'configuration'});
  const dependencies={configs,environment,clientFactory,fetchImplementation,now,randomUUID};let receiptId,createdBefore,sourceRevoked=false;
  try{
   const options=clientOptions();options.global.headers={Authorization:'Bearer '+token};
   const userClient=clientFactory(configs[source].url,configs[source].publicKey,options);
   const verified=await userClient.auth.getUser(token);if(verified.error||!verified.data?.user?.id)return reply(401,{ok:false,reason:'auth'});
   const active=await userClient.rpc(source==='hr'?'hr_session_status':source==='apm'?'apm_session_status':'portal_session_status');
   if(active.error||active.data?.active!==true||active.data?.userId!==verified.data.user.id)return reply(401,{ok:false,reason:'session'});
   let identity;
   if(source==='apm'){
    const resolved=await callApm('resolve',{authUserId:verified.data.user.id},environment,fetchImplementation,now,randomUUID);
    if(typeof resolved.googleSubject!=='string'||resolved.googleSubject.length<1||resolved.googleSubject.length>256||typeof resolved.verifiedEmail!=='string'||!/^[^\s@]+@suiyuecare\.com$/.test(resolved.verifiedEmail))return reply(403,{ok:false,reason:'identity'});
    identity={subject:resolved.googleSubject,email:resolved.verifiedEmail};
   }else{identity=confirmedGoogleIdentity(verified.data.user);if(!identity)return reply(401,{ok:false,reason:'auth'});}
   const admin=createPortalAdmin(configs,clientFactory);
   const queued=await checkedRpc(admin,'portal_logout_enqueue',{google_subject:identity.subject,verified_email:identity.email,source});
   receiptId=queued.receiptId;
   if(typeof receiptId!=='string'||typeof queued.createdBefore!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}Z$/.test(queued.createdBefore))throw Error('Outbox receipt missing');
   createdBefore=queued.createdBefore;identity.createdBefore=createdBefore;
   sourceRevoked=await processTarget(admin,receiptId,source,identity,dependencies,true);
   if(sourceRevoked)await Promise.allSettled(moduleIds.filter(id=>id!==source).map(id=>processTarget(admin,receiptId,id,identity,dependencies)));
   const receipt=await checkedRpc(admin,'portal_logout_receipt',{receipt_id:receiptId});
   if(receipt.ok===true&&moduleIds.every(id=>receipt.revokedModules?.includes(id)))return reply(200,{ok:true,receiptId,createdBefore,revokedModules:moduleIds});
   return reply(202,{ok:false,pending:true,receiptId,createdBefore,sourceRevoked:receipt.sourceRevoked===true||sourceRevoked,revokedModules:receipt.revokedModules||[],pendingModules:receipt.pendingModules||moduleIds});
  }catch{return reply(503,{ok:false,reason:'unavailable',...(receiptId?{receiptId,createdBefore,sourceRevoked}:{})});}
 };
}
module.exports={createPortalLogoutHandler,confirmedGoogleIdentity,projectConfiguration,validConfiguration,createPortalAdmin,checkedRpc,revokeModule,processTarget,apmHeaders,callApm,moduleIds};
