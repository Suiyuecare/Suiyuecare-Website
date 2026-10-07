import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../src/portal/login.js',import.meta.url),'utf8');
const start=source.indexOf('async function performPortalLogout(){');
const end=source.indexOf('\nsignOutButton?.addEventListener',start);
assert.ok(start>=0&&end>start);
const functionSource=source.slice(start,end);

async function runCase({status,body,sourceActive}){
 const storage=new Map(),messages=[],calls=[];
 const sessionStorage={setItem:(key,value)=>storage.set(key,value),getItem:key=>storage.get(key)||null,removeItem:key=>storage.delete(key)};
 const context={
  portalLogoutRunning:false,portalLogoutPendingKey:'pending',pendingModuleLaunchKey:'launch',
  window:{sessionStorage},userSummary:{textContent:'sensitive'},
  clearStoredProfile:()=>calls.push('clear'),renderSession:value=>calls.push(['render',value]),
  showPortalLogoutProgress:(message,mode)=>messages.push({message,mode}),
  supabase:{auth:{getSession:async()=>({data:{session:{access_token:'synthetic-jwt'}}}),signOut:async()=>{calls.push('signOut');return{error:null};}},rpc:async()=>({data:{active:sourceActive}})},
  fetch:async()=>({ok:status===200,status,json:async()=>body}),
  AbortSignal,console
 };
 vm.createContext(context);vm.runInContext(functionSource+'\nthis.performPortalLogout=performPortalLogout;',context);
 await context.performPortalLogout();
 return{storage,messages,calls};
}
const pending=await runCase({status:202,body:{ok:false,pending:true,receiptId:'ticket',pendingModules:['finance'],sourceRevoked:true},sourceActive:false});
assert.ok(pending.calls.includes('signOut'));assert.equal(pending.storage.has('pending'),false);assert.equal(pending.messages.at(-1).mode,'pending');
assert.match(pending.messages.at(-1).message,/不能視為全部登出/);
const sourcePending=await runCase({status:202,body:{ok:false,pending:true,receiptId:'ticket',pendingModules:['portal','finance'],sourceRevoked:false},sourceActive:true});
assert.equal(sourcePending.messages.at(-1).mode,'retry');assert.equal(sourcePending.storage.get('pending'),'1');assert.ok(!sourcePending.calls.includes('signOut'));
const complete=await runCase({status:200,body:{ok:true,revokedModules:['portal','hr','finance','apm']},sourceActive:false});
assert.equal(complete.messages.at(-1).mode,'complete');assert.ok(complete.calls.includes('signOut'));
const retry=await runCase({status:503,body:{ok:false},sourceActive:true});
assert.equal(retry.messages.at(-1).mode,'retry');assert.equal(retry.storage.get('pending'),'1');assert.ok(!retry.calls.includes('signOut'));
const unknown=await runCase({status:503,body:{ok:false},sourceActive:false});
assert.equal(unknown.messages.at(-1).mode,'pending');assert.ok(unknown.calls.includes('signOut'));
const bootStart=source.indexOf('async function bootPortalLogin() {');
const bootEnd=source.indexOf('\nfunction portalLogoutIsPending()',bootStart);
assert.ok(bootStart>=0&&bootEnd>bootStart);
const externalCalls=[],externalMessages=[],externalStorage=new Map([['pending','1']]);
const externalContext={
 URLSearchParams,window:{location:{search:'?logout=pending'},sessionStorage:{removeItem:key=>externalStorage.delete(key)}},
 portalLogoutPendingKey:'pending',pendingModuleLaunchKey:'launch',
 clearStoredProfile:()=>externalCalls.push('clear'),renderSession:()=>externalCalls.push('render'),
 userSummary:{textContent:'sensitive'},supabase:{auth:{signOut:async()=>{externalCalls.push('signOut');return{error:null};}}},
 showPortalLogoutProgress:(message,mode)=>externalMessages.push({message,mode}),
 rememberRequestedModuleLaunch:()=>{throw Error('private launch should not run');}
};
vm.createContext(externalContext);vm.runInContext(source.slice(bootStart,bootEnd)+'\nthis.bootPortalLogin=bootPortalLogin;',externalContext);
await externalContext.bootPortalLogin();
assert.deepEqual(externalCalls,['clear','render','signOut']);assert.equal(externalContext.userSummary.textContent,'');
assert.equal(externalMessages.at(-1).mode,'pending');assert.match(externalMessages.at(-1).message,/其他系統登出處理中/);
console.log('ok - Portal client clears local session after durable pending logout and preserves retry only while source is active');
