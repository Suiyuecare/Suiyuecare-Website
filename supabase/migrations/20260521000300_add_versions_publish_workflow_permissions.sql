-- CMS governance: content version history, publishing workflow, and role permissions.
-- Apply after the core CMS, courses/files/forms, and home modules migrations.

create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  entity_table text not null,
  entity_id uuid not null,
  action text not null check (action in ('insert', 'update', 'delete', 'publish', 'archive')),
  version_number integer not null,
  row_snapshot jsonb not null default '{}'::jsonb,
  change_summary text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (entity_table, entity_id, version_number)
);

create table if not exists public.publish_requests (
  id uuid primary key default gen_random_uuid(),
  entity_table text not null,
  entity_id uuid not null,
  entity_title text,
  target_status public.cms_publish_status not null default 'published',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  request_note text,
  review_note text,
  requested_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_table text,
  entity_id uuid,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admins
  add column if not exists can_edit_pages boolean not null default true,
  add column if not exists can_edit_articles boolean not null default true,
  add column if not exists can_edit_courses boolean not null default true,
  add column if not exists can_manage_files boolean not null default true,
  add column if not exists can_view_forms boolean not null default true,
  add column if not exists can_view_analytics boolean not null default true,
  add column if not exists can_review_publish boolean not null default false;

create index if not exists content_versions_entity_idx on public.content_versions(entity_table, entity_id, version_number desc);
create index if not exists content_versions_created_idx on public.content_versions(created_at desc);
create index if not exists publish_requests_status_idx on public.publish_requests(status, requested_at desc);
create index if not exists publish_requests_entity_idx on public.publish_requests(entity_table, entity_id);
create index if not exists admin_activity_logs_profile_idx on public.admin_activity_logs(profile_id, created_at desc);
create index if not exists admin_activity_logs_entity_idx on public.admin_activity_logs(entity_table, entity_id, created_at desc);

drop trigger if exists set_publish_requests_updated_at on public.publish_requests;
create trigger set_publish_requests_updated_at
before update on public.publish_requests
for each row execute function public.set_updated_at();

create or replace function private.can_review_publish_cms()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    left join public.admins a on a.profile_id = p.id and a.is_active = true
    where p.user_id = auth.uid()
      and p.is_active = true
      and (
        p.role in ('owner', 'admin')
        or coalesce(a.can_review_publish, false) = true
      )
  )
$$;

create or replace function private.current_admin_permissions()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_build_object(
      'profile_id', p.id,
      'role', p.role,
      'display_name', p.display_name,
      'email', p.email,
      'can_manage_users', coalesce(a.can_manage_users, p.role in ('owner', 'admin')),
      'can_publish', coalesce(a.can_publish, p.role in ('owner', 'admin')),
      'can_review_publish', coalesce(a.can_review_publish, p.role in ('owner', 'admin')),
      'can_manage_media', coalesce(a.can_manage_media, p.role in ('owner', 'admin', 'editor')),
      'can_edit_pages', coalesce(a.can_edit_pages, p.role in ('owner', 'admin', 'editor')),
      'can_edit_articles', coalesce(a.can_edit_articles, p.role in ('owner', 'admin', 'editor')),
      'can_edit_courses', coalesce(a.can_edit_courses, p.role in ('owner', 'admin', 'editor')),
      'can_manage_files', coalesce(a.can_manage_files, p.role in ('owner', 'admin', 'editor')),
      'can_view_forms', coalesce(a.can_view_forms, p.role in ('owner', 'admin', 'editor')),
      'can_view_analytics', coalesce(a.can_view_analytics, p.role in ('owner', 'admin'))
    ),
    '{}'::jsonb
  )
  from public.profiles p
  left join public.admins a on a.profile_id = p.id and a.is_active = true
  where p.user_id = auth.uid()
    and p.is_active = true
  limit 1
$$;

create or replace function private.enforce_publish_permission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
    and new.status = 'published'
    and (tg_op = 'INSERT' or old.status is distinct from new.status)
    and not private.can_publish_cms()
  then
    raise exception 'Only users with publishing permission can publish CMS content.';
  end if;

  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;

  if auth.uid() is not null and new.updated_by is null then
    new.updated_by = private.current_profile_id();
  end if;

  return new;
end;
$$;

create or replace function private.capture_content_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_id uuid;
  snapshot jsonb;
  next_version integer;
  action_name text;
begin
  affected_id := coalesce(new.id, old.id);
  snapshot := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  action_name := lower(tg_op);
  if tg_op = 'UPDATE' and old.status is distinct from new.status and new.status = 'published' then
    action_name := 'publish';
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status and new.status = 'archived' then
    action_name := 'archive';
  end if;

  select coalesce(max(version_number), 0) + 1
  into next_version
  from public.content_versions
  where entity_table = tg_table_name
    and entity_id = affected_id;

  insert into public.content_versions (
    entity_table,
    entity_id,
    action,
    version_number,
    row_snapshot,
    created_by,
    change_summary
  )
  values (
    tg_table_name,
    affected_id,
    action_name,
    next_version,
    snapshot,
    private.current_profile_id(),
    case
      when tg_op = 'DELETE' then 'Deleted content'
      when action_name = 'publish' then 'Published content'
      when action_name = 'archive' then 'Archived content'
      else 'Saved content'
    end
  );

  return coalesce(new, old);
end;
$$;

create or replace function private.create_content_governance_triggers(target_table regclass)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  table_name text := split_part(target_table::text, '.', 2);
begin
  if table_name = '' then
    table_name := target_table::text;
  end if;

  execute format('drop trigger if exists enforce_publish_permission_%I on %s', table_name, target_table);
  execute format('drop trigger if exists capture_content_version_%I on %s', table_name, target_table);

  execute format(
    'create trigger enforce_publish_permission_%I before insert or update on %s for each row execute function private.enforce_publish_permission()',
    table_name,
    target_table
  );
  execute format(
    'create trigger capture_content_version_%I after insert or update or delete on %s for each row execute function private.capture_content_version()',
    table_name,
    target_table
  );
end;
$$;

create or replace function public.get_current_admin_permissions()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select private.current_admin_permissions()
$$;

create or replace function public.review_publish_request(
  request_id uuid,
  next_status text,
  reviewer_note text default null
)
returns public.publish_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.publish_requests;
  result_row public.publish_requests;
  allowed_tables text[] := array['pages', 'page_sections', 'articles', 'courses', 'downloadable_files', 'content_modules'];
begin
  if not private.can_review_publish_cms() then
    raise exception 'Only reviewers can approve or reject publish requests.';
  end if;

  if next_status not in ('approved', 'rejected', 'cancelled') then
    raise exception 'Invalid publish request status.';
  end if;

  select *
  into request_row
  from public.publish_requests
  where id = request_id
  for update;

  if not found then
    raise exception 'Publish request not found.';
  end if;

  if request_row.status <> 'pending' then
    raise exception 'Only pending publish requests can be reviewed.';
  end if;

  if request_row.entity_table <> all(allowed_tables) then
    raise exception 'Unsupported publish request table.';
  end if;

  if next_status = 'approved' then
    execute format('update public.%I set status = $1, published_at = coalesce(published_at, now()), updated_by = private.current_profile_id() where id = $2', request_row.entity_table)
    using request_row.target_status, request_row.entity_id;

    if request_row.entity_table = 'pages' then
      update public.page_sections
      set
        status = 'published',
        published_at = coalesce(published_at, now()),
        updated_by = private.current_profile_id()
      where page_id = request_row.entity_id
        and is_enabled = true;
    end if;
  end if;

  update public.publish_requests
  set
    status = next_status,
    review_note = reviewer_note,
    reviewed_by = private.current_profile_id(),
    reviewed_at = now()
  where id = request_id
  returning *
  into result_row;

  insert into public.admin_activity_logs (profile_id, action, entity_table, entity_id, message, metadata)
  values (
    private.current_profile_id(),
    'publish_request_' || next_status,
    request_row.entity_table,
    request_row.entity_id,
    coalesce(reviewer_note, request_row.entity_title, 'Publish request reviewed'),
    jsonb_build_object('publish_request_id', request_id)
  );

  return result_row;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'public.pages',
    'public.page_sections',
    'public.articles',
    'public.courses',
    'public.downloadable_files',
    'public.content_modules'
  ]
  loop
    if to_regclass(table_name) is not null then
      perform private.create_content_governance_triggers(table_name::regclass);
    end if;
  end loop;
end $$;

alter table public.content_versions enable row level security;
alter table public.publish_requests enable row level security;
alter table public.admin_activity_logs enable row level security;

drop policy if exists "CMS users can read content versions" on public.content_versions;
drop policy if exists "CMS users can insert content versions" on public.content_versions;
drop policy if exists "CMS users can read publish requests" on public.publish_requests;
drop policy if exists "CMS users can create publish requests" on public.publish_requests;
drop policy if exists "Publish reviewers can update publish requests" on public.publish_requests;
drop policy if exists "CMS users can read activity logs" on public.admin_activity_logs;
drop policy if exists "CMS users can insert activity logs" on public.admin_activity_logs;

create policy "CMS users can read content versions"
on public.content_versions
for select
to authenticated
using (private.can_manage_cms());

create policy "CMS users can insert content versions"
on public.content_versions
for insert
to authenticated
with check (private.can_manage_cms());

create policy "CMS users can read publish requests"
on public.publish_requests
for select
to authenticated
using (private.can_manage_cms());

create policy "CMS users can create publish requests"
on public.publish_requests
for insert
to authenticated
with check (private.can_manage_cms());

create policy "Publish reviewers can update publish requests"
on public.publish_requests
for update
to authenticated
using (private.can_review_publish_cms())
with check (private.can_review_publish_cms());

create policy "CMS users can read activity logs"
on public.admin_activity_logs
for select
to authenticated
using (private.can_manage_cms());

create policy "CMS users can insert activity logs"
on public.admin_activity_logs
for insert
to authenticated
with check (private.can_manage_cms());

grant execute on function private.can_review_publish_cms() to authenticated;
grant execute on function private.current_admin_permissions() to authenticated;
grant execute on function public.get_current_admin_permissions() to authenticated;
grant execute on function public.review_publish_request(uuid, text, text) to authenticated;
grant select, insert on public.content_versions to authenticated;
grant select, insert, update on public.publish_requests to authenticated;
grant select, insert on public.admin_activity_logs to authenticated;
