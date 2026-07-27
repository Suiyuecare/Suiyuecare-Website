-- Stage department edits without changing the public row. Every department
-- change is queued for Owner approval; only the Owner applies the snapshot.

alter table public.publish_requests
  add column if not exists base_snapshot jsonb,
  add column if not exists proposed_snapshot jsonb,
  add column if not exists change_action text not null default 'upsert';

alter table public.publish_requests
  drop constraint if exists publish_requests_change_action_check;

alter table public.publish_requests
  add constraint publish_requests_change_action_check
  check (change_action in ('upsert', 'delete'));

with ranked_pending as (
  select
    id,
    row_number() over (
      partition by entity_table, entity_id
      order by requested_at desc, id desc
    ) as row_rank
  from public.publish_requests
  where status = 'pending'
)
update public.publish_requests request
set
  status = 'cancelled',
  review_note = coalesce(request.review_note, '已由較新的送審內容取代'),
  reviewed_at = coalesce(request.reviewed_at, now()),
  updated_at = now()
from ranked_pending ranked
where request.id = ranked.id
  and ranked.row_rank > 1;

create unique index if not exists publish_requests_one_pending_entity_idx
on public.publish_requests(entity_table, entity_id)
where status = 'pending';

create or replace function private.publish_request_title(row_snapshot jsonb, fallback_table text)
returns text
language sql
immutable
set search_path = public, private
as $$
  select coalesce(
    nullif(row_snapshot->>'title', ''),
    nullif(row_snapshot->>'setting_label', ''),
    nullif(row_snapshot->>'field_label', ''),
    nullif(row_snapshot->>'section_key', ''),
    nullif(row_snapshot->>'item_key', ''),
    fallback_table || ' 內容更新'
  )
$$;

create or replace function private.set_publish_request_requester()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  existing_request_id uuid;
  snapshot_scope text;
  snapshot_id uuid;
begin
  if auth.uid() is not null then
    new.requested_by := private.current_profile_id();
  end if;

  new.status := 'pending';
  snapshot_scope := private.scope_for_entity_snapshot(new.entity_table, new.proposed_snapshot);
  new.scope_key := coalesce(
    private.entity_scope_key(new.entity_table, new.entity_id),
    snapshot_scope
  );

  if new.scope_key is null then
    raise exception 'The publish request does not point to a supported CMS record.';
  end if;

  if snapshot_scope is not null and snapshot_scope <> new.scope_key then
    raise exception 'The proposed content belongs to a different responsibility scope.';
  end if;

  if new.proposed_snapshot is not null then
    begin
      snapshot_id := nullif(new.proposed_snapshot->>'id', '')::uuid;
    exception when invalid_text_representation then
      raise exception 'The proposed content has an invalid record id.';
    end;
    if snapshot_id is distinct from new.entity_id then
      raise exception 'The proposed content id does not match the publish request.';
    end if;
  end if;

  new.department_id := private.department_for_scope(new.scope_key);

  if auth.uid() is not null and not private.can_edit_content_scope(new.scope_key) then
    raise exception 'You cannot submit content owned by another department.';
  end if;

  -- Existing editors still have explicit "送審" buttons. If saving already
  -- queued the request, refresh its note instead of creating a duplicate.
  if new.proposed_snapshot is null and new.change_action <> 'delete' then
    select request.id
    into existing_request_id
    from public.publish_requests request
    where request.entity_table = new.entity_table
      and request.entity_id = new.entity_id
      and request.status = 'pending'
    order by request.requested_at desc
    limit 1;

    if existing_request_id is not null then
      update public.publish_requests
      set
        entity_title = coalesce(new.entity_title, entity_title),
        request_note = coalesce(new.request_note, request_note),
        requested_by = new.requested_by,
        requested_at = now(),
        updated_at = now()
      where id = existing_request_id;
      return null;
    end if;
  end if;

  return new;
end;
$$;

create or replace function private.stage_department_content_change()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  proposed jsonb;
  base jsonb;
  resolved_scope text;
  target_entity_id uuid;
  requested_action text := case when tg_op = 'DELETE' then 'delete' else 'upsert' end;
  requested_target_status public.cms_publish_status := 'published';
  should_keep_public_row boolean := false;
begin
  if tg_op = 'DELETE' then
    base := to_jsonb(old);
    proposed := null;
    target_entity_id := old.id;
  else
    proposed := to_jsonb(new);
    base := case when tg_op = 'UPDATE' then to_jsonb(old) else null end;
    target_entity_id := new.id;
    if proposed ? 'status' then
      requested_target_status := (proposed->>'status')::public.cms_publish_status;
    end if;
  end if;

  if auth.uid() is null or private.current_profile_is_owner() then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  resolved_scope := private.scope_for_entity_snapshot(tg_table_name, coalesce(proposed, base));
  if resolved_scope is null or not private.can_edit_content_scope(resolved_scope) then
    raise exception 'This content is outside your department responsibility.';
  end if;

  insert into public.publish_requests (
    entity_table,
    entity_id,
    entity_title,
    target_status,
    status,
    request_note,
    requested_by,
    scope_key,
    department_id,
    base_snapshot,
    proposed_snapshot,
    change_action
  )
  values (
    tg_table_name,
    target_entity_id,
    private.publish_request_title(coalesce(proposed, base), tg_table_name),
    requested_target_status,
    'pending',
    case when requested_action = 'delete'
      then '部門申請刪除內容，請執行長確認。'
      else '部門內容已更新，請執行長確認後發布。'
    end,
    private.current_profile_id(),
    resolved_scope,
    private.department_for_scope(resolved_scope),
    base,
    proposed,
    requested_action
  )
  on conflict (entity_table, entity_id) where status = 'pending'
  do update set
    entity_title = excluded.entity_title,
    request_note = excluded.request_note,
    requested_by = excluded.requested_by,
    requested_at = now(),
    updated_at = now(),
    scope_key = excluded.scope_key,
    department_id = excluded.department_id,
    base_snapshot = coalesce(public.publish_requests.base_snapshot, excluded.base_snapshot),
    proposed_snapshot = excluded.proposed_snapshot,
    change_action = excluded.change_action;

  if tg_op = 'DELETE' then
    return null;
  end if;

  -- Rows without a publish status are always public-facing. Non-draft rows and
  -- any attempted status change must remain untouched until Owner approval.
  should_keep_public_row := not (proposed ? 'status')
    or proposed->>'status' <> 'draft'
    or (tg_op = 'UPDATE' and base->>'status' <> 'draft');

  -- Keep a newly created record addressable in the CMS, but never make it
  -- public before approval. The queued snapshot retains the requested status.
  if tg_op = 'INSERT'
    and proposed ? 'status'
    and proposed->>'status' <> 'draft'
  then
    new := jsonb_populate_record(
      new,
      jsonb_build_object('status', 'draft', 'published_at', null)
    );
    return new;
  end if;

  if tg_op = 'INSERT' and not (proposed ? 'status') then
    new := jsonb_populate_record(
      new,
      jsonb_build_object('is_enabled', false)
    );
    return new;
  end if;

  if should_keep_public_row then
    if tg_op = 'UPDATE' then
      return old;
    end if;
    return null;
  end if;

  return new;
end;
$$;

create or replace function private.attach_owner_approval_trigger(target_table regclass)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  table_name text := split_part(target_table::text, '.', 2);
begin
  if table_name = '' then
    table_name := target_table::text;
  end if;

  execute format('drop trigger if exists a_stage_owner_approval_%I on %s', table_name, target_table);
  execute format(
    'create trigger a_stage_owner_approval_%I before insert or update or delete on %s for each row execute function private.stage_department_content_change()',
    table_name,
    target_table
  );
end;
$$;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'public.pages',
    'public.page_sections',
    'public.content_modules',
    'public.page_template_fields',
    'public.site_settings',
    'public.milestones',
    'public.articles',
    'public.article_categories',
    'public.care_stories',
    'public.expert_talks',
    'public.courses',
    'public.downloadable_files',
    'public.recruiting_pages',
    'public.recruiting_departments',
    'public.recruiting_openings',
    'public.investor_notices',
    'public.investor_financial_items',
    'public.investor_chart_datasets'
  ]
  loop
    if to_regclass(target_table) is not null then
      perform private.attach_owner_approval_trigger(target_table::regclass);
    end if;
  end loop;
end
$$;

create or replace function private.apply_content_snapshot(
  target_table text,
  target_entity_id uuid,
  proposed_snapshot jsonb,
  target_status text default 'published'
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  allowed_tables constant text[] := array[
    'pages', 'page_sections', 'content_modules', 'page_template_fields',
    'site_settings', 'milestones', 'articles', 'article_categories',
    'care_stories', 'expert_talks', 'courses', 'downloadable_files',
    'recruiting_pages', 'recruiting_departments', 'recruiting_openings',
    'investor_notices', 'investor_financial_items', 'investor_chart_datasets'
  ];
  target_relation regclass;
  insert_columns text;
  select_columns text;
  update_assignments text;
  normalized_snapshot jsonb := proposed_snapshot;
begin
  if not private.current_profile_is_owner() then
    raise exception 'Only the Owner can apply approved content.';
  end if;

  if target_table is null
    or target_entity_id is null
    or proposed_snapshot is null
    or not (target_table = any(allowed_tables))
  then
    raise exception 'Unsupported content snapshot.';
  end if;

  target_relation := to_regclass(format('public.%I', target_table));
  if target_relation is null then
    raise exception 'The requested CMS table does not exist.';
  end if;

  normalized_snapshot := jsonb_set(normalized_snapshot, '{id}', to_jsonb(target_entity_id), true);
  if normalized_snapshot ? 'status' then
    normalized_snapshot := jsonb_set(normalized_snapshot, '{status}', to_jsonb(target_status), true);
  end if;
  if normalized_snapshot ? 'published_at' and target_status = 'published' then
    normalized_snapshot := jsonb_set(normalized_snapshot, '{published_at}', to_jsonb(now()), true);
  end if;
  if normalized_snapshot ? 'updated_by' then
    normalized_snapshot := jsonb_set(normalized_snapshot, '{updated_by}', to_jsonb(private.current_profile_id()), true);
  end if;

  select
    string_agg(format('%I', attribute.attname), ', ' order by attribute.attnum),
    string_agg(format('proposed.%I', attribute.attname), ', ' order by attribute.attnum),
    string_agg(
      format('%1$I = excluded.%1$I', attribute.attname),
      ', ' order by attribute.attnum
    ) filter (where attribute.attname not in ('id', 'created_at'))
  into insert_columns, select_columns, update_assignments
  from pg_attribute attribute
  where attribute.attrelid = target_relation
    and attribute.attnum > 0
    and not attribute.attisdropped
    and attribute.attidentity = ''
    and attribute.attgenerated = '';

  if insert_columns is null or update_assignments is null then
    raise exception 'Unable to apply the approved content snapshot.';
  end if;

  execute format(
    'insert into public.%1$I (%2$s) select %3$s from jsonb_populate_record(null::public.%1$I, $1) proposed on conflict (id) do update set %4$s',
    target_table,
    insert_columns,
    select_columns,
    update_assignments
  )
  using normalized_snapshot;
end;
$$;

create or replace function public.review_publish_request(
  request_id uuid,
  next_status text,
  reviewer_note text default null
)
returns public.publish_requests
language plpgsql
security definer
set search_path = public, private
as $$
declare
  request_row public.publish_requests;
  child_request public.publish_requests;
  result_row public.publish_requests;
  affected_rows integer;
  allowed_tables constant text[] := array[
    'pages', 'page_sections', 'content_modules', 'page_template_fields',
    'site_settings', 'milestones', 'articles', 'article_categories',
    'care_stories', 'expert_talks', 'courses', 'downloadable_files',
    'recruiting_pages', 'recruiting_departments', 'recruiting_openings',
    'investor_notices', 'investor_financial_items', 'investor_chart_datasets'
  ];
begin
  if next_status not in ('approved', 'rejected', 'cancelled') then
    raise exception 'Invalid publish request status.';
  end if;

  if not private.current_profile_is_owner() then
    raise exception 'Only the Owner or chief executive can review publish requests.';
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
  if not (request_row.entity_table = any(allowed_tables)) then
    raise exception 'Unsupported publish request table.';
  end if;

  if next_status = 'approved' then
    if request_row.change_action = 'delete' then
      execute format(
        'delete from public.%I where id = $1',
        request_row.entity_table
      )
      using request_row.entity_id;

      get diagnostics affected_rows = row_count;
      if affected_rows <> 1 then
        raise exception 'The requested CMS record no longer exists.';
      end if;
    elsif request_row.proposed_snapshot is not null then
      perform private.apply_content_snapshot(
        request_row.entity_table,
        request_row.entity_id,
        request_row.proposed_snapshot,
        request_row.target_status::text
      );
    else
      execute format(
        'update public.%I set status = $1, published_at = coalesce(published_at, now()), updated_by = private.current_profile_id() where id = $2',
        request_row.entity_table
      )
      using request_row.target_status, request_row.entity_id;

      get diagnostics affected_rows = row_count;
      if affected_rows <> 1 then
        raise exception 'The requested CMS record no longer exists.';
      end if;
    end if;
  end if;

  update public.publish_requests
  set
    status = next_status,
    review_note = reviewer_note,
    reviewed_by = private.current_profile_id(),
    reviewed_at = now()
  where id = request_id
  returning * into result_row;

  -- A page edit may include multiple page_sections. Handle those child drafts
  -- with the parent page decision so the chief executive reviews one page flow.
  if request_row.entity_table = 'pages' and request_row.change_action = 'delete' then
    update public.publish_requests child
    set
      status = 'cancelled',
      review_note = '頁面已核准刪除，相關區塊送審單同步取消',
      reviewed_by = private.current_profile_id(),
      reviewed_at = now()
    where child.status = 'pending'
      and child.entity_table = 'page_sections'
      and coalesce(
        child.proposed_snapshot->>'page_id',
        child.base_snapshot->>'page_id'
      ) = request_row.entity_id::text;
  elsif request_row.entity_table = 'pages' then
    for child_request in
      select *
      from public.publish_requests child
      where child.status = 'pending'
        and child.entity_table = 'page_sections'
        and coalesce(
          child.proposed_snapshot->>'page_id',
          child.base_snapshot->>'page_id'
        ) = request_row.entity_id::text
      for update
    loop
      if next_status = 'approved' then
        if child_request.change_action = 'delete' then
          delete from public.page_sections
          where id = child_request.entity_id;
        else
          perform private.apply_content_snapshot(
            child_request.entity_table,
            child_request.entity_id,
            child_request.proposed_snapshot,
            child_request.target_status::text
          );
        end if;
      end if;

      update public.publish_requests
      set
        status = next_status,
        review_note = coalesce(reviewer_note, '隨頁面主送審單一併處理'),
        reviewed_by = private.current_profile_id(),
        reviewed_at = now()
      where id = child_request.id;
    end loop;
  end if;

  insert into public.admin_activity_logs (
    profile_id,
    action,
    entity_table,
    entity_id,
    message,
    metadata,
    scope_key,
    department_id
  )
  values (
    private.current_profile_id(),
    'publish_request_' || next_status,
    request_row.entity_table,
    request_row.entity_id,
    coalesce(reviewer_note, request_row.entity_title, 'Publish request reviewed'),
    jsonb_build_object('publish_request_id', request_id),
    request_row.scope_key,
    request_row.department_id
  );

  return result_row;
end;
$$;

create or replace function private.protect_owner_authority()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if tg_table_name = 'profiles' then
    if tg_op in ('INSERT', 'UPDATE')
      and new.role = 'owner'
      and lower(coalesce(new.email, '')) <> 'entrepreneur@suiyuecare.com'
    then
      raise exception 'Only the chief executive account can hold the Owner role.';
    end if;

    if tg_op = 'DELETE' and old.role = 'owner' then
      raise exception 'The chief executive Owner account cannot be deleted.';
    end if;

    if tg_op = 'UPDATE'
      and old.role = 'owner'
      and (
        new.role <> 'owner'
        or lower(coalesce(new.email, '')) <> 'entrepreneur@suiyuecare.com'
        or new.is_active = false
      )
    then
      raise exception 'The chief executive Owner account cannot be demoted, renamed, or disabled.';
    end if;

    if tg_op = 'INSERT'
      and auth.uid() is not null
      and not private.current_profile_is_owner()
    then
      new.role := 'viewer';
      new.is_active := true;
      return new;
    end if;

    if auth.uid() is null or private.current_profile_is_owner() then
      if tg_op = 'DELETE' then
        return old;
      end if;
      return new;
    end if;

    if tg_op = 'UPDATE'
      and new.role is not distinct from old.role
      and new.is_active is not distinct from old.is_active
      and new.email is not distinct from old.email
    then
      return new;
    end if;

    raise exception 'Only the Owner can change account roles and permission authority.';
  end if;

  if tg_table_name = 'admins' then
    if tg_op in ('INSERT', 'UPDATE')
      and new.role = 'owner'
      and not exists (
        select 1
        from public.profiles profile
        where profile.id = new.profile_id
          and profile.role = 'owner'
          and profile.is_active = true
          and lower(coalesce(profile.email, '')) = 'entrepreneur@suiyuecare.com'
      )
    then
      raise exception 'Only the chief executive profile can hold Owner administration rights.';
    end if;

    if auth.uid() is null or private.current_profile_is_owner() then
      if tg_op = 'DELETE' then
        return old;
      end if;
      return new;
    end if;

    raise exception 'Only the Owner can change administration permissions.';
  end if;

  raise exception 'Unsupported authority trigger table.';
end;
$$;

drop trigger if exists protect_profile_authority_insert on public.profiles;
create trigger protect_profile_authority_insert
before insert on public.profiles
for each row execute function private.protect_owner_authority();

drop trigger if exists protect_profile_authority_update on public.profiles;
create trigger protect_profile_authority_update
before update of role, is_active, email on public.profiles
for each row execute function private.protect_owner_authority();

drop trigger if exists protect_profile_authority_delete on public.profiles;
create trigger protect_profile_authority_delete
before delete on public.profiles
for each row execute function private.protect_owner_authority();

drop trigger if exists protect_admin_authority on public.admins;
create trigger protect_admin_authority
before insert or update or delete on public.admins
for each row execute function private.protect_owner_authority();

create or replace function private.ensure_viewer_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  normalized_email text := lower(trim(coalesce(new.email, '')));
  display_name text;
begin
  if normalized_email = '' or normalized_email = 'entrepreneur@suiyuecare.com' then
    return new;
  end if;

  display_name := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'name', ''),
    split_part(normalized_email, '@', 1),
    '待指派使用者'
  );

  insert into public.profiles (
    user_id,
    display_name,
    email,
    role,
    avatar_url,
    is_active
  )
  values (
    new.id,
    display_name,
    normalized_email,
    'viewer',
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    true
  )
  on conflict (user_id) do update set
    display_name = coalesce(nullif(excluded.display_name, ''), public.profiles.display_name),
    email = excluded.email,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists ensure_viewer_profile_on_auth_user on auth.users;
create trigger ensure_viewer_profile_on_auth_user
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function private.ensure_viewer_profile_for_auth_user();

insert into public.profiles (
  user_id,
  display_name,
  email,
  role,
  avatar_url,
  is_active
)
select
  auth_user.id,
  coalesce(
    nullif(auth_user.raw_user_meta_data->>'full_name', ''),
    nullif(auth_user.raw_user_meta_data->>'name', ''),
    split_part(lower(auth_user.email), '@', 1),
    '待指派使用者'
  ),
  lower(auth_user.email),
  'viewer',
  nullif(auth_user.raw_user_meta_data->>'avatar_url', ''),
  true
from auth.users auth_user
where auth_user.email is not null
  and lower(auth_user.email) <> 'entrepreneur@suiyuecare.com'
on conflict (user_id) do update set
  email = excluded.email,
  avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
  updated_at = now();

-- Migration 20260720090000 converted every legacy direct scope into a
-- department membership. From this point on, only the visible department
-- matrix is authoritative; legacy rows must not remain as hidden access.
delete from public.admin_content_scopes;
revoke insert, update, delete on table public.admin_content_scopes from authenticated;

create or replace function private.profile_content_role(
  target_profile_id uuid,
  requested_scope text
)
returns text
language sql
stable
security definer
set search_path = public, private
as $$
  with active_profile as (
    select profile.id, profile.role
    from public.profiles profile
    where profile.id = target_profile_id
      and profile.is_active = true
  ), access_levels as (
    select 3 as level
    from active_profile profile
    where profile.role = 'owner'

    union all

    select case membership.membership_role
      when 'manager' then 3
      when 'editor' then 2
      else 1
    end as level
    from active_profile profile
    join public.department_memberships membership
      on membership.profile_id = profile.id
     and membership.is_active = true
    join public.cms_content_areas area
      on area.department_id = membership.department_id
     and area.scope_key = requested_scope
     and area.is_active = true
  )
  select case max(level)
    when 3 then 'manager'
    when 2 then 'editor'
    when 1 then 'viewer'
    else null
  end
  from access_levels
$$;

create or replace function public.replace_content_area_assignments(assignments jsonb)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role'
    and not private.current_profile_is_owner()
  then
    raise exception 'Only the Owner can change content responsibility assignments.';
  end if;

  if jsonb_typeof(coalesce(assignments, '[]'::jsonb)) <> 'array'
    or jsonb_array_length(coalesce(assignments, '[]'::jsonb)) = 0
  then
    raise exception 'Content responsibility assignments must be a non-empty JSON array.';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(assignments)
      as assignment(scope_key text, department_id uuid)
    where assignment.scope_key is null
      or assignment.department_id is null
      or not exists (
        select 1
        from public.cms_content_areas area
        where area.scope_key = assignment.scope_key
          and area.is_active = true
      )
      or not exists (
        select 1
        from public.departments department
        where department.id = assignment.department_id
          and department.is_active = true
      )
  ) then
    raise exception 'One or more content responsibility assignments are invalid.';
  end if;

  if (
    select count(*)
    from jsonb_to_recordset(assignments)
      as assignment(scope_key text, department_id uuid)
  ) <> (
    select count(distinct assignment.scope_key)
    from jsonb_to_recordset(assignments)
      as assignment(scope_key text, department_id uuid)
  ) then
    raise exception 'Content responsibility assignments contain duplicate scopes.';
  end if;

  if (
    select count(distinct assignment.scope_key)
    from jsonb_to_recordset(assignments)
      as assignment(scope_key text, department_id uuid)
  ) <> (
    select count(*)
    from public.cms_content_areas area
    where area.is_active = true
  ) then
    raise exception 'Every active content scope must have exactly one responsible department.';
  end if;

  update public.cms_content_areas area
  set department_id = assignment.department_id
  from jsonb_to_recordset(assignments)
    as assignment(scope_key text, department_id uuid)
  where area.scope_key = assignment.scope_key;
end;
$$;

drop policy if exists "Department editors can delete media" on public.media;
create policy "Only Owner can delete media"
on public.media
for delete
to authenticated
using (private.current_profile_is_owner());

drop policy if exists "Department editors can delete CMS storage objects" on storage.objects;
create policy "Only Owner can delete CMS storage objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = any(array[
    'public-images',
    'article-covers',
    'page-heroes',
    'course-images',
    'job-images',
    'investor-files',
    'private-documents'
  ])
  and private.current_profile_is_owner()
);

revoke all on function private.publish_request_title(jsonb, text) from public, anon;
revoke all on function private.stage_department_content_change() from public, anon;
revoke all on function private.attach_owner_approval_trigger(regclass) from public, anon;
revoke all on function private.apply_content_snapshot(text, uuid, jsonb, text) from public, anon;
revoke all on function private.protect_owner_authority() from public, anon;
revoke all on function private.ensure_viewer_profile_for_auth_user() from public, anon;
revoke all on function public.review_publish_request(uuid, text, text) from public, anon;
revoke all on function public.replace_content_area_assignments(jsonb) from public, anon;

grant execute on function private.publish_request_title(jsonb, text) to authenticated, service_role;
grant execute on function private.apply_content_snapshot(text, uuid, jsonb, text) to service_role;
grant execute on function public.review_publish_request(uuid, text, text) to authenticated, service_role;
grant execute on function public.replace_content_area_assignments(jsonb) to authenticated, service_role;
