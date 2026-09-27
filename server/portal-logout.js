const {createClient}=require('@supabase/supabase-js');
const allowedOrigins=new Set(['https://hr.suiyuecare.com','https://finance.suiyuecare.com','https://login.suiyuecare.com']);
const projects={portal:'ussnmxdpxeoshlrdchov',hr:'eswdhynrbzrjgetnmhit',finance:'udtlppnrugmtzhigdsxo'};
function projectConfiguration(environment){return Object.fromEntries(Object.entries(projects).map(([id,ref])=>{
 const prefix=id==='portal'?'PORTAL':id.toUpperCase()+'_SOURCE';
 const url=environment[prefix+'_SUPABASE_URL']||(id==='portal'?environment.SUPABASE_URL:null);
 const service=environment[prefix+'_SUPABASE_SERVICE_ROLE_KEY']||(id==='portal'?environment.SUPABASE_SERVICE_ROLE_KEY:null);
 const publicKey=environment[prefix+'_SUPABASE_PUBLISHABLE_KEY']||(id==='portal'?environment.VITE_SUPABASE_ANON_KEY:null);
 return[id,{url,service,publicKey,expectedUrl:'https://'+ref+'.supabase.co'}];
}));}
function confirmedGoogleIdentity(user){
 if(!user?.email_confirmed_at)return null;
 const candidates=(user.identities||[]).filter(i=>i.provider==='google'&&i.identity_data?.email_verified===true&&typeof i.identity_data.sub==='string'&&i.identity_data.sub.length>0&&i.identity_data.sub.length<=256&&typeof i.identity_data.email==='string');
 if(candidates.length!==1)return null;
 const email=candidates[0].identity_data.email.trim().toLowerCase();
 if(!/^[^\s@]+@suiyuecare\.com$/.test(email))return null;
 return{email,subject:candidates[0].identity_data.sub};
}
function createPortalLogoutHandler({environment=process.env,clientFactory=createClient}={}){
 return async(req,res)=>{
  const origin=req.headers?.origin;res.setHeader('Cache-Control','no-store');res.setHeader('Vary','Origin, Authorization');res.setHeader('X-Content-Type-Options','nosniff');
  const reply=(code,value)=>{res.statusCode=code;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(value));};
  if(!allowedOrigins.has(origin))return reply(403,{ok:false,reason:'origin'});
  res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');
  if(req.method==='OPTIONS'){res.statusCode=204;return res.end();}
  if(req.method!=='POST')return reply(405,{ok:false,reason:'method'});
  let source;try{const body=typeof req.body==='string'?JSON.parse(req.body):req.body;source=body?.source;}catch{return reply(400,{ok:false,reason:'input'});}
  if(!Object.hasOwn(projects,source))return reply(400,{ok:false,reason:'source'});
  // An origin cannot submit another module's Auth credentials as its own scope.
  const sourceOrigin={hr:'https://hr.suiyuecare.com',finance:'https://finance.suiyuecare.com',portal:'https://login.suiyuecare.com'};
  if(sourceOrigin[source]!==origin)return reply(403,{ok:false,reason:'source'});
  const token=String(req.headers.authorization||'').match(/^Bearer ([^\s]+)$/)?.[1];if(!token)return reply(401,{ok:false,reason:'auth'});
  try{
   const configs=projectConfiguration(environment);
   if(Object.values(configs).some(c=>c.url!==c.expectedUrl||!c.service||!c.publicKey))return reply(503,{ok:false,reason:'configuration'});
   const fetchWithDeadline=(input,init)=>fetch(input,{...init,signal:AbortSignal.any([...(init?.signal?[init.signal]:[]),AbortSignal.timeout(10000)])});
   const config={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:fetchWithDeadline}};
   const userClient=clientFactory(configs[source].url,configs[source].publicKey,{...config,global:{...config.global,headers:{Authorization:'Bearer '+token}}});
   const verified=await userClient.auth.getUser(token);const identity=confirmedGoogleIdentity(verified.data?.user);
   if(verified.error||!identity)return reply(401,{ok:false,reason:'auth'});
   const active=await userClient.rpc(source==='hr'?'hr_session_status':'portal_session_status');
   if(active.error||active.data?.active!==true||active.data?.userId!==verified.data.user.id)return reply(401,{ok:false,reason:'session'});
   const revoke=async id=>{try{const c=configs[id];const admin=clientFactory(c.url,c.service,config);const result=await admin.rpc('portal_revoke_google_sessions',{google_subject:identity.subject,verified_email:identity.email});return{id,success:!result.error&&result.data?.revoked===true};}catch{return{id,success:false};}};
   // Preserve the initiating session if another project fails, so a retry can
   // be authenticated. Never report global completion after partial revocation.
   const otherResults=await Promise.all(Object.keys(projects).filter(id=>id!==source).map(revoke));
   const pending=otherResults.filter(r=>!r.success).map(r=>r.id),revoked=otherResults.filter(r=>r.success).map(r=>r.id);
   if(pending.length)return reply(502,{ok:false,revokedModules:revoked,pendingModules:[...pending,source]});
   const ownResult=await revoke(source);
   if(!ownResult.success)return reply(502,{ok:false,revokedModules:revoked,pendingModules:[source]});
   return reply(200,{ok:true,revokedModules:['hr','finance','portal']});
  }catch{return reply(503,{ok:false,reason:'unavailable'});}
 };
}
module.exports={createPortalLogoutHandler,confirmedGoogleIdentity,projectConfiguration};
