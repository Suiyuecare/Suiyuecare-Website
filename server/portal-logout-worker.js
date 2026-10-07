const {createClient}=require('@supabase/supabase-js');
const crypto=require('node:crypto');
const {validConfiguration,createPortalAdmin,checkedRpc,processTarget}=require('./portal-logout.js');

function createPortalLogoutWorker({environment=process.env,clientFactory=createClient,fetchImplementation=globalThis.fetch,now=Date.now,randomUUID=crypto.randomUUID}={}){
 return async(request,response)=>{
  response.setHeader('Cache-Control','no-store');response.setHeader('X-Content-Type-Options','nosniff');
  const reply=(status,value)=>{response.statusCode=status;response.setHeader('Content-Type','application/json; charset=utf-8');response.end(JSON.stringify(value));};
  if(request.method!=='POST')return reply(405,{ok:false});
  const ticket=(typeof request.body==='string'?(()=>{try{return JSON.parse(request.body)?.ticket;}catch{return null;}})():request.body?.ticket);
  if(typeof ticket!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ticket))return reply(401,{ok:false});
  const configs=validConfiguration(environment);if(!configs)return reply(503,{ok:false});
  try{
   const admin=createPortalAdmin(configs,clientFactory);
   const consumed=await checkedRpc(admin,'portal_logout_consume_worker_ticket',{request_ticket:ticket});
   if(consumed!==true)return reply(401,{ok:false});
   const batch=await checkedRpc(admin,'portal_logout_claim',{batch_size:8});
   if(!Array.isArray(batch))throw Error('Invalid outbox batch');
   const dependencies={configs,environment,clientFactory,fetchImplementation,now,randomUUID};
   const settled=await Promise.allSettled(batch.map(job=>processTarget(admin,job.receiptId,job.moduleId,{subject:job.googleSubject,email:job.verifiedEmail,createdBefore:job.createdBefore},dependencies,job.moduleId===job.source)));
   const completed=settled.filter(result=>result.status==='fulfilled'&&result.value===true).length;
   return reply(200,{ok:true,claimed:batch.length,completed,pending:batch.length-completed});
  }catch{return reply(503,{ok:false});}
 };
}
const handler=createPortalLogoutWorker();
module.exports=handler;
module.exports.createPortalLogoutWorker=createPortalLogoutWorker;
