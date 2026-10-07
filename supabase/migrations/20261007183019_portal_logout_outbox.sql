begin;

-- A logout must survive the request that revokes its initiating Auth session.
-- Keep identity data outside the exposed public schema. Only the narrow,
-- service-role RPCs below may read or change this queue.
create schema if not exists private;

create table private.portal_logout_jobs (
  id uuid primary key default gen_random_uuid(),
  google_subject text not null check (length(google_subject) between 1 and 256),
  verified_email text not null check (verified_email = lower(btrim(verified_email)) and verified_email ~ '^[^[:space:]@]+@suiyuecare[.]com$'),
  source text not null check (source in ('portal', 'hr', 'finance', 'apm')),
  created_at timestamptz not null default now()
);

create table private.portal_logout_targets (
  job_id uuid not null references private.portal_logout_jobs(id) on delete cascade,
  module_id text not null check (module_id in ('portal', 'hr', 'finance', 'apm')),
  completed_at timestamptz,
  next_attempt_at timestamptz not null default now(),
  lease_until timestamptz,
  attempts integer not null default 0 check (attempts >= 0),
  primary key (job_id, module_id)
);
create index portal_logout_targets_due on private.portal_logout_targets(next_attempt_at)
  where completed_at is null;

create table private.portal_logout_worker_tickets (
  ticket uuid primary key default gen_random_uuid(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create table private.portal_logout_worker_config (
  singleton boolean primary key default true check (singleton),
  enabled boolean not null default false
);
insert into private.portal_logout_worker_config(singleton, enabled) values (true, false);

alter table private.portal_logout_jobs enable row level security;
alter table private.portal_logout_targets enable row level security;
alter table private.portal_logout_worker_tickets enable row level security;
alter table private.portal_logout_worker_config enable row level security;
revoke all on private.portal_logout_jobs, private.portal_logout_targets,
  private.portal_logout_worker_tickets, private.portal_logout_worker_config from public, anon, authenticated;

create function public.portal_logout_enqueue(google_subject text, verified_email text, source text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare job_id uuid;
begin
  if length(google_subject) not between 1 and 256
    or verified_email <> lower(btrim(verified_email))
    or verified_email !~ '^[^[:space:]@]+@suiyuecare[.]com$'
    or source not in ('portal', 'hr', 'finance', 'apm') then
    raise exception 'PORTAL_LOGOUT_INVALID' using errcode = '42501';
  end if;
  insert into private.portal_logout_jobs(google_subject, verified_email, source)
    values (google_subject, verified_email, source) returning id into job_id;
  insert into private.portal_logout_targets(job_id, module_id, next_attempt_at)
    select job_id, module_id, statement_timestamp() + interval '90 seconds'
    from unnest(array['portal', 'hr', 'finance', 'apm']) as module_id;
  return jsonb_build_object('receiptId', job_id);
end $$;
revoke all on function public.portal_logout_enqueue(text,text,text) from public, anon, authenticated;
grant execute on function public.portal_logout_enqueue(text,text,text) to service_role;

create function public.portal_logout_record(receipt_id uuid, target_module text, succeeded boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
  if target_module not in ('portal', 'hr', 'finance', 'apm') or succeeded is null then
    raise exception 'PORTAL_LOGOUT_INVALID' using errcode = '42501';
  end if;
  update private.portal_logout_targets
  set completed_at = case when succeeded then statement_timestamp() else null end,
      next_attempt_at = case when succeeded then statement_timestamp() else statement_timestamp() + interval '45 seconds' end,
      lease_until = null
  where job_id = receipt_id and module_id = target_module and completed_at is null;
  get diagnostics changed = row_count;
  if changed = 0 and not exists (
    select 1 from private.portal_logout_targets where job_id = receipt_id and module_id = target_module and completed_at is not null
  ) then raise exception 'PORTAL_LOGOUT_RECEIPT_NOT_FOUND' using errcode = '22023'; end if;
  return public.portal_logout_receipt(receipt_id);
end $$;

create function public.portal_logout_receipt(receipt_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare done jsonb; pending jsonb; source_module text;
begin
  select j.source into source_module from private.portal_logout_jobs j where j.id = receipt_id;
  if source_module is null then raise exception 'PORTAL_LOGOUT_RECEIPT_NOT_FOUND' using errcode = '22023'; end if;
  select coalesce(jsonb_agg(t.module_id order by array_position(array['portal','hr','finance','apm'], t.module_id)) filter (where t.completed_at is not null), '[]'::jsonb),
         coalesce(jsonb_agg(t.module_id order by array_position(array['portal','hr','finance','apm'], t.module_id)) filter (where t.completed_at is null), '[]'::jsonb)
    into done, pending from private.portal_logout_targets t where t.job_id = receipt_id;
  return jsonb_build_object('receiptId', receipt_id, 'source', source_module,
    'ok', jsonb_array_length(pending) = 0,
    'sourceRevoked', done ? source_module,
    'revokedModules', done, 'pendingModules', pending);
end $$;
revoke all on function public.portal_logout_receipt(uuid) from public, anon, authenticated;
grant execute on function public.portal_logout_receipt(uuid) to service_role;
revoke all on function public.portal_logout_record(uuid,text,boolean) from public, anon, authenticated;
grant execute on function public.portal_logout_record(uuid,text,boolean) to service_role;

create function public.portal_logout_claim(batch_size integer default 8)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare batch jsonb;
begin
  with due as (
    select t.job_id, t.module_id
    from private.portal_logout_targets t
    join private.portal_logout_jobs j on j.id = t.job_id
    join private.portal_logout_targets source_target on source_target.job_id = j.id and source_target.module_id = j.source
    where t.completed_at is null and t.next_attempt_at <= statement_timestamp()
      and (t.lease_until is null or t.lease_until <= statement_timestamp())
      and (t.module_id = j.source or source_target.completed_at is not null)
    order by t.next_attempt_at, j.created_at
    for update of t skip locked
    limit least(greatest(coalesce(batch_size, 1), 1), 12)
  ), claimed as (
    update private.portal_logout_targets t
    set lease_until = statement_timestamp() + interval '90 seconds', attempts = attempts + 1
    from due d where t.job_id = d.job_id and t.module_id = d.module_id
    returning t.job_id, t.module_id
  )
  select coalesce(jsonb_agg(jsonb_build_object('receiptId', c.job_id, 'moduleId', c.module_id,
    'googleSubject', j.google_subject, 'verifiedEmail', j.verified_email)), '[]'::jsonb)
    into batch from claimed c join private.portal_logout_jobs j on j.id = c.job_id;
  return batch;
end $$;
revoke all on function public.portal_logout_claim(integer) from public, anon, authenticated;
grant execute on function public.portal_logout_claim(integer) to service_role;

create function public.portal_logout_consume_worker_ticket(request_ticket uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare used uuid;
begin
  update private.portal_logout_worker_tickets
  set used_at = statement_timestamp()
  where ticket = request_ticket and used_at is null and expires_at > statement_timestamp()
  returning ticket into used;
  return used is not null;
end $$;
revoke all on function public.portal_logout_consume_worker_ticket(uuid) from public, anon, authenticated;
grant execute on function public.portal_logout_consume_worker_ticket(uuid) to service_role;

-- Activation is deliberately separate from the migration. The production
-- rollout must enable pg_net/pg_cron and schedule this function only after
-- the Portal worker endpoint and all module revokers pass smoke tests.
create function private.portal_logout_dispatch_worker()
returns boolean language plpgsql security definer set search_path = '' as $$
declare request_ticket uuid;
begin
  if not exists (select 1 from private.portal_logout_worker_config where singleton and enabled) then return false; end if;
  delete from private.portal_logout_worker_tickets where expires_at < statement_timestamp() - interval '1 day';
  delete from private.portal_logout_jobs j where j.created_at < statement_timestamp() - interval '30 days'
    and not exists (select 1 from private.portal_logout_targets t where t.job_id = j.id and t.completed_at is null);
  if not exists (select 1 from private.portal_logout_targets
    where completed_at is null and next_attempt_at <= statement_timestamp()
      and (lease_until is null or lease_until <= statement_timestamp())) then return false; end if;
  insert into private.portal_logout_worker_tickets(expires_at)
    values (statement_timestamp() + interval '2 minutes') returning ticket into request_ticket;
  perform net.http_post(
    url => 'https://login.suiyuecare.com/api/portal-logout-worker',
    headers => jsonb_build_object('Content-Type', 'application/json'),
    body => jsonb_build_object('ticket', request_ticket),
    timeout_milliseconds => 15000
  );
  return true;
end $$;
revoke all on function private.portal_logout_dispatch_worker() from public, anon, authenticated, service_role;

notify pgrst, 'reload schema';
commit;
