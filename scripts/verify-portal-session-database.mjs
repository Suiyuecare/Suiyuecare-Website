import {PGlite}from'@electric-sql/pglite';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import{randomUUID}from'node:crypto';
const db=new PGlite();const user=randomUUID(),other=randomUUID(),sid=randomUUID(),otherSid=randomUUID();
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create table auth.identities(user_id uuid,provider text,provider_id text,identity_data jsonb);create table auth.sessions(id uuid primary key,user_id uuid,not_after timestamptz);create function auth.jwt()returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;create function auth.uid()returns uuid language sql stable as $$select nullif(auth.jwt()->>'sub','')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.jwt(),auth.uid() to authenticated;`);
await db.exec(await readFile(new URL('../supabase/migrations/20260927181008_portal_module_logout.sql',import.meta.url),'utf8'));
await db.exec(await readFile(new URL('../supabase/migrations/20261007183019_portal_logout_outbox.sql',import.meta.url),'utf8'));
for(const[id,email,sub]of[[user,'qa@suiyuecare.com','synthetic-sub'],[other,'other@suiyuecare.com','other-sub']]){await db.query('insert into auth.users values($1,$2,now())',[id,email]);await db.query("insert into auth.identities values($1,'google',$2,$3)",[id,sub,{sub,email,email_verified:true}]);}
await db.query('insert into auth.sessions values($1,$2,null),($3,$4,null)',[sid,user,otherSid,other]);
async function active(sessionId){await db.exec('begin');try{await db.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:user,session_id:sessionId})]);await db.exec('set local role authenticated');const result=await db.query('select public.portal_session_status() v');await db.exec('commit');return result.rows[0].v;}catch(e){await db.exec('rollback');throw e;}}
assert.equal((await active(sid)).active,true);for(const wrong of[null,'bad',otherSid])await assert.rejects(()=>active(wrong),/PORTAL_SESSION_REVOKED/);
await db.exec('begin;set local role authenticated');await assert.rejects(()=>db.query("select public.portal_revoke_google_sessions('synthetic-sub','qa@suiyuecare.com')"),/permission denied/);await db.exec('rollback');
await db.exec('begin;set local role service_role');await db.query("select public.portal_revoke_google_sessions('different-sub','qa@suiyuecare.com')");await db.exec('commit');assert.equal((await db.query('select count(*)::int n from auth.sessions')).rows[0].n,2);
await db.exec('begin;set local role service_role');await db.query("select public.portal_revoke_google_sessions('synthetic-sub','qa@suiyuecare.com')");await db.exec('commit');await assert.rejects(()=>active(sid),/PORTAL_SESSION_REVOKED/);assert.equal((await db.query('select user_id from auth.sessions')).rows[0].user_id,other);
assert.equal((await db.query("select has_function_privilege('anon','public.portal_session_status()','execute') v")).rows[0].v,false);
await db.exec('begin;set local role authenticated');await assert.rejects(()=>db.query("select public.portal_logout_enqueue('synthetic-sub','qa@suiyuecare.com','hr')"),/permission denied/);await db.exec('rollback');
await db.exec('begin;set local role service_role');
const queued=(await db.query("select public.portal_logout_enqueue('synthetic-sub','qa@suiyuecare.com','hr') v")).rows[0].v;
await db.exec('commit');
const receiptId=queued.receiptId;assert.ok(receiptId);
async function callService(sql,params=[]){await db.exec('begin;set local role service_role');try{const result=await db.query(sql,params);await db.exec('commit');return result.rows[0].v;}catch(error){await db.exec('rollback');throw error;}}
let receipt=await callService('select public.portal_logout_receipt($1) v',[receiptId]);
assert.deepEqual(receipt.pendingModules,['portal','hr','finance','apm']);assert.equal(receipt.sourceRevoked,false);
assert.deepEqual(await callService('select public.portal_logout_claim(8) v'),[]); // The initial request owns the first 90 seconds.
receipt=await callService("select public.portal_logout_record($1,'hr',true) v",[receiptId]);
assert.equal(receipt.sourceRevoked,true);assert.deepEqual(receipt.revokedModules,['hr']);
receipt=await callService("select public.portal_logout_record($1,'apm',false) v",[receiptId]);
assert.deepEqual(receipt.pendingModules,['portal','finance','apm']);
await db.query("update private.portal_logout_targets set next_attempt_at=now()-interval '1 minute' where job_id=$1",[receiptId]);
const batch=await callService('select public.portal_logout_claim(8) v');
assert.deepEqual(batch.map(target=>target.moduleId).sort(),['apm','finance','portal']);
for(const target of batch)await callService('select public.portal_logout_record($1,$2,true) v',[receiptId,target.moduleId]);
receipt=await callService('select public.portal_logout_receipt($1) v',[receiptId]);assert.equal(receipt.ok,true);assert.deepEqual(receipt.pendingModules,[]);
const ticket=randomUUID();await db.query("insert into private.portal_logout_worker_tickets(ticket,expires_at) values($1,now()+interval '1 minute')",[ticket]);
assert.equal(await callService('select public.portal_logout_consume_worker_ticket($1) v',[ticket]),true);
assert.equal(await callService('select public.portal_logout_consume_worker_ticket($1) v',[ticket]),false);
assert.equal((await db.query('select enabled from private.portal_logout_worker_config')).rows[0].enabled,false);
await db.exec("create schema net;create table net.requests(url text,headers jsonb,body jsonb);create function net.http_post(url text,headers jsonb,body jsonb,timeout_milliseconds integer) returns bigint language plpgsql as $$begin insert into net.requests values(url,headers,body);return 1;end$$;");
assert.equal((await db.query('select private.portal_logout_dispatch_worker() v')).rows[0].v,false);
await db.exec('update private.portal_logout_worker_config set enabled=true');
await db.query("update private.portal_logout_targets set completed_at=null,next_attempt_at=now()-interval '1 minute' where job_id=$1 and module_id='finance'",[receiptId]);
assert.equal((await db.query('select private.portal_logout_dispatch_worker() v')).rows[0].v,true);
const dispatched=(await db.query('select * from net.requests')).rows[0];
assert.equal(dispatched.url,'https://login.suiyuecare.com/api/portal-logout-worker');
assert.deepEqual(Object.keys(dispatched.headers),['Content-Type']);
assert.equal(await callService('select public.portal_logout_consume_worker_ticket($1) v',[dispatched.body.ticket]),true);
assert.equal((await db.query("select has_function_privilege('anon','public.portal_logout_claim(integer)','execute') v")).rows[0].v,false);
console.log('ok - Portal session revocation, durable source-first logout outbox, single-use worker ticket and least-privilege grants');await db.close();
