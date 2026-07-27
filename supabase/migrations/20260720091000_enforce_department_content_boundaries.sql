-- Enforce department ownership at the database row level.

drop policy if exists "Department members can read departments" on public.departments;
drop policy if exists "Access managers can insert departments" on public.departments;
drop policy if exists "Access managers can update departments" on public.departments;
drop policy if exists "Access managers can delete departments" on public.departments;

create policy "Department members can read departments"
on public.departments
for select
to authenticated
using (
  private.current_profile_is_owner()
  or exists (
    select 1
    from public.department_memberships membership
    where membership.department_id = departments.id
      and membership.profile_id = (select private.current_profile_id())
      and membership.is_active = true
  )
);

create policy "Access managers can insert departments"
on public.departments
for insert
to authenticated
with check (private.current_profile_is_owner());

create policy "Access managers can update departments"
on public.departments
for update
to authenticated
using (private.current_profile_is_owner())
with check (private.current_profile_is_owner());

create policy "Access managers can delete departments"
on public.departments
for delete
to authenticated
using (private.current_profile_is_owner());

drop policy if exists "Members can read department memberships" on public.department_memberships;
drop policy if exists "Access managers can insert department memberships" on public.department_memberships;
drop policy if exists "Access managers can update department memberships" on public.department_memberships;
drop policy if exists "Access managers can delete department memberships" on public.department_memberships;

create policy "Members can read department memberships"
on public.department_memberships
for select
to authenticated
using (
  private.current_profile_is_owner()
  or profile_id = (select private.current_profile_id())
);

create policy "Access managers can insert department memberships"
on public.department_memberships
for insert
to authenticated
with check (private.current_profile_is_owner());

create policy "Access managers can update department memberships"
on public.department_memberships
for update
to authenticated
using (private.current_profile_is_owner())
with check (private.current_profile_is_owner());

create policy "Access managers can delete department memberships"
on public.department_memberships
for delete
to authenticated
using (private.current_profile_is_owner());

drop policy if exists "Members can read content areas" on public.cms_content_areas;
drop policy if exists "Access managers can insert content areas" on public.cms_content_areas;
drop policy if exists "Access managers can update content areas" on public.cms_content_areas;
drop policy if exists "Access managers can delete content areas" on public.cms_content_areas;

create policy "Members can read content areas"
on public.cms_content_areas
for select
to authenticated
using (
  private.current_profile_is_owner()
  or private.can_view_content_scope(scope_key)
);

create policy "Access managers can insert content areas"
on public.cms_content_areas
for insert
to authenticated
with check (private.current_profile_is_owner());

create policy "Access managers can update content areas"
on public.cms_content_areas
for update
to authenticated
using (private.current_profile_is_owner())
with check (private.current_profile_is_owner());

create policy "Access managers can delete content areas"
on public.cms_content_areas
for delete
to authenticated
using (private.current_profile_is_owner());

-- Remove only authenticated CMS policies. Anonymous public-read and validated
-- form-intake policies remain untouched.
do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and 'authenticated'::name = any(roles)
      and tablename = any(array[
        'pages',
        'page_sections',
        'content_modules',
        'page_template_fields',
        'site_settings',
        'milestones',
        'articles',
        'article_categories',
        'care_stories',
        'expert_talks',
        'courses',
        'recruiting_pages',
        'recruiting_departments',
        'recruiting_openings',
        'investor_notices',
        'investor_financial_items',
        'investor_chart_datasets',
        'downloadable_files',
        'media',
        'form_submissions',
        'publish_requests',
        'content_versions',
        'admin_activity_logs'
      ])
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  end loop;
end
$$;

create policy "Department users can read pages"
on public.pages
for select
to authenticated
using (
  (is_enabled = true and status = 'published' and published_at <= now())
  or private.can_view_content_scope(private.scope_for_page_slug(slug))
);

create policy "Department editors can insert pages"
on public.pages
for insert
to authenticated
with check (private.can_edit_content_scope(private.scope_for_page_slug(slug)));

create policy "Department editors can update pages"
on public.pages
for update
to authenticated
using (private.can_edit_content_scope(private.scope_for_page_slug(slug)))
with check (private.can_edit_content_scope(private.scope_for_page_slug(slug)));

create policy "Department editors can delete pages"
on public.pages
for delete
to authenticated
using (private.can_edit_content_scope(private.scope_for_page_slug(slug)));

create policy "Department users can read page sections"
on public.page_sections
for select
to authenticated
using (
  (is_enabled = true and status = 'published' and published_at <= now())
  or private.can_view_content_scope(private.scope_for_page_id(page_id))
);

create policy "Department editors can insert page sections"
on public.page_sections
for insert
to authenticated
with check (private.can_edit_content_scope(private.scope_for_page_id(page_id)));

create policy "Department editors can update page sections"
on public.page_sections
for update
to authenticated
using (private.can_edit_content_scope(private.scope_for_page_id(page_id)))
with check (private.can_edit_content_scope(private.scope_for_page_id(page_id)));

create policy "Department editors can delete page sections"
on public.page_sections
for delete
to authenticated
using (private.can_edit_content_scope(private.scope_for_page_id(page_id)));

create policy "Department users can read content modules"
on public.content_modules
for select
to authenticated
using (
  (is_enabled = true and status = 'published' and published_at <= now())
  or private.can_view_content_scope(private.scope_for_page_slug(target_slug))
);

create policy "Department editors can insert content modules"
on public.content_modules
for insert
to authenticated
with check (private.can_edit_content_scope(private.scope_for_page_slug(target_slug)));

create policy "Department editors can update content modules"
on public.content_modules
for update
to authenticated
using (private.can_edit_content_scope(private.scope_for_page_slug(target_slug)))
with check (private.can_edit_content_scope(private.scope_for_page_slug(target_slug)));

create policy "Department editors can delete content modules"
on public.content_modules
for delete
to authenticated
using (private.can_edit_content_scope(private.scope_for_page_slug(target_slug)));

create policy "Department users can read page template fields"
on public.page_template_fields
for select
to authenticated
using (
  is_enabled = true
  or private.can_view_content_scope(private.scope_for_page_slug(page_slug))
);

create policy "Department editors can insert page template fields"
on public.page_template_fields
for insert
to authenticated
with check (private.can_edit_content_scope(private.scope_for_page_slug(page_slug)));

create policy "Department editors can update page template fields"
on public.page_template_fields
for update
to authenticated
using (private.can_edit_content_scope(private.scope_for_page_slug(page_slug)))
with check (private.can_edit_content_scope(private.scope_for_page_slug(page_slug)));

create policy "Department editors can delete page template fields"
on public.page_template_fields
for delete
to authenticated
using (private.can_edit_content_scope(private.scope_for_page_slug(page_slug)));

create policy "System users can read site settings"
on public.site_settings
for select
to authenticated
using (
  is_enabled = true
  or private.can_view_content_scope(private.scope_for_site_setting(setting_group, setting_key))
);

create policy "System editors can insert site settings"
on public.site_settings
for insert
to authenticated
with check (private.can_edit_content_scope(private.scope_for_site_setting(setting_group, setting_key)));

create policy "System editors can update site settings"
on public.site_settings
for update
to authenticated
using (private.can_edit_content_scope(private.scope_for_site_setting(setting_group, setting_key)))
with check (private.can_edit_content_scope(private.scope_for_site_setting(setting_group, setting_key)));

create policy "System editors can delete site settings"
on public.site_settings
for delete
to authenticated
using (private.can_edit_content_scope(private.scope_for_site_setting(setting_group, setting_key)));

create policy "Brand users can read milestones"
on public.milestones
for select
to authenticated
using (
  (is_enabled = true and status = 'published' and published_at <= now())
  or private.can_view_content_scope('brand')
);

create policy "Brand editors can insert milestones"
on public.milestones
for insert
to authenticated
with check (private.can_edit_content_scope('brand'));

create policy "Brand editors can update milestones"
on public.milestones
for update
to authenticated
using (private.can_edit_content_scope('brand'))
with check (private.can_edit_content_scope('brand'));

create policy "Brand editors can delete milestones"
on public.milestones
for delete
to authenticated
using (private.can_edit_content_scope('brand'));

create policy "Health users can read articles"
on public.articles
for select
to authenticated
using (
  (is_enabled = true and status = 'published' and published_at <= now())
  or private.can_view_content_scope('health')
);

create policy "Health editors can insert articles"
on public.articles
for insert
to authenticated
with check (private.can_edit_content_scope('health'));

create policy "Health editors can update articles"
on public.articles
for update
to authenticated
using (private.can_edit_content_scope('health'))
with check (private.can_edit_content_scope('health'));

create policy "Health editors can delete articles"
on public.articles
for delete
to authenticated
using (private.can_edit_content_scope('health'));

create policy "Health users can read article categories"
on public.article_categories
for select
to authenticated
using (is_enabled = true or private.can_view_content_scope('health'));

create policy "Health editors can insert article categories"
on public.article_categories
for insert
to authenticated
with check (private.can_edit_content_scope('health'));

create policy "Health editors can update article categories"
on public.article_categories
for update
to authenticated
using (private.can_edit_content_scope('health'))
with check (private.can_edit_content_scope('health'));

create policy "Health editors can delete article categories"
on public.article_categories
for delete
to authenticated
using (private.can_edit_content_scope('health'));

do $$
declare
  target_table text;
begin
  foreach target_table in array array['care_stories', 'expert_talks']
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using ((is_enabled = true and status = ''published'' and published_at <= now()) or private.can_view_content_scope(''health''))',
      'Health users can read ' || replace(target_table, '_', ' '),
      target_table
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (private.can_edit_content_scope(''health''))',
      'Health editors can insert ' || replace(target_table, '_', ' '),
      target_table
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (private.can_edit_content_scope(''health'')) with check (private.can_edit_content_scope(''health''))',
      'Health editors can update ' || replace(target_table, '_', ' '),
      target_table
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (private.can_edit_content_scope(''health''))',
      'Health editors can delete ' || replace(target_table, '_', ' '),
      target_table
    );
  end loop;
end
$$;

create policy "Course users can read courses"
on public.courses
for select
to authenticated
using (
  (is_enabled = true and status = 'published' and published_at <= now())
  or private.can_view_content_scope('courses')
);

create policy "Course editors can insert courses"
on public.courses
for insert
to authenticated
with check (private.can_edit_content_scope('courses'));

create policy "Course editors can update courses"
on public.courses
for update
to authenticated
using (private.can_edit_content_scope('courses'))
with check (private.can_edit_content_scope('courses'));

create policy "Course editors can delete courses"
on public.courses
for delete
to authenticated
using (private.can_edit_content_scope('courses'));

do $$
declare
  target_table text;
begin
  foreach target_table in array array['recruiting_pages', 'recruiting_departments', 'recruiting_openings']
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using ((is_enabled = true and status = ''published'' and published_at <= now()) or private.can_view_content_scope(private.scope_for_page_slug(page_slug)))',
      'Department users can read ' || replace(target_table, '_', ' '),
      target_table
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (private.can_edit_content_scope(private.scope_for_page_slug(page_slug)))',
      'Department editors can insert ' || replace(target_table, '_', ' '),
      target_table
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (private.can_edit_content_scope(private.scope_for_page_slug(page_slug))) with check (private.can_edit_content_scope(private.scope_for_page_slug(page_slug)))',
      'Department editors can update ' || replace(target_table, '_', ' '),
      target_table
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (private.can_edit_content_scope(private.scope_for_page_slug(page_slug)))',
      'Department editors can delete ' || replace(target_table, '_', ' '),
      target_table
    );
  end loop;
end
$$;

do $$
declare
  target_table text;
begin
  foreach target_table in array array['investor_notices', 'investor_financial_items', 'investor_chart_datasets']
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using ((is_enabled = true and status = ''published'' and published_at <= now()) or private.can_view_content_scope(''investor''))',
      'Investor users can read ' || replace(target_table, '_', ' '),
      target_table
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (private.can_edit_content_scope(''investor''))',
      'Investor editors can insert ' || replace(target_table, '_', ' '),
      target_table
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (private.can_edit_content_scope(''investor'')) with check (private.can_edit_content_scope(''investor''))',
      'Investor editors can update ' || replace(target_table, '_', ' '),
      target_table
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (private.can_edit_content_scope(''investor''))',
      'Investor editors can delete ' || replace(target_table, '_', ' '),
      target_table
    );
  end loop;
end
$$;

create policy "Department users can read downloadable files"
on public.downloadable_files
for select
to authenticated
using (
  (is_enabled = true and is_public = true and status = 'published' and published_at <= now())
  or private.can_view_content_scope(scope_key)
);

create policy "Department editors can insert downloadable files"
on public.downloadable_files
for insert
to authenticated
with check (private.can_edit_content_scope(scope_key));

create policy "Department editors can update downloadable files"
on public.downloadable_files
for update
to authenticated
using (private.can_edit_content_scope(scope_key))
with check (private.can_edit_content_scope(scope_key));

create policy "Department editors can delete downloadable files"
on public.downloadable_files
for delete
to authenticated
using (private.can_edit_content_scope(scope_key));

create policy "Department users can read media"
on public.media
for select
to authenticated
using (
  (is_enabled = true and visibility = 'public')
  or (is_shared = true and private.has_any_content_scope())
  or private.can_view_content_scope(scope_key)
);

create policy "Department editors can insert media"
on public.media
for insert
to authenticated
with check (
  (is_shared = false and private.can_edit_content_scope(scope_key))
  or (is_shared = true and private.current_profile_is_owner())
);

create policy "Department editors can update media"
on public.media
for update
to authenticated
using (
  (is_shared = false and private.can_edit_content_scope(scope_key))
  or (is_shared = true and private.current_profile_is_owner())
)
with check (
  (is_shared = false and private.can_edit_content_scope(scope_key))
  or (is_shared = true and private.current_profile_is_owner())
);

create policy "Department editors can delete media"
on public.media
for delete
to authenticated
using (
  (is_shared = false and private.can_edit_content_scope(scope_key))
  or (is_shared = true and private.current_profile_is_owner())
);

create policy "Department users can read form submissions"
on public.form_submissions
for select
to authenticated
using (private.can_view_content_scope(scope_key));

create policy "Department editors can insert form submissions"
on public.form_submissions
for insert
to authenticated
with check (private.can_edit_content_scope(scope_key));

create policy "Department editors can update form submissions"
on public.form_submissions
for update
to authenticated
using (private.can_edit_content_scope(scope_key))
with check (private.can_edit_content_scope(scope_key));

create policy "Department managers can delete form submissions"
on public.form_submissions
for delete
to authenticated
using (private.can_publish_content_scope(scope_key));

create or replace function private.can_submit_publish_request(
  target_table text,
  target_entity_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select private.can_edit_content_scope(private.entity_scope_key(target_table, target_entity_id))
$$;

-- Kept only for older clients. Security policies use the entity-aware overload.
create or replace function private.can_submit_publish_request(target_table text)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select target_table = any(array[
    'pages',
    'page_sections',
    'content_modules',
    'milestones',
    'articles',
    'care_stories',
    'expert_talks',
    'courses',
    'downloadable_files',
    'recruiting_pages',
    'recruiting_departments',
    'recruiting_openings',
    'investor_notices',
    'investor_financial_items',
    'investor_chart_datasets'
  ])
  and exists (
    select 1
    from public.cms_content_areas area
    where private.can_edit_content_scope(area.scope_key)
  )
$$;

create or replace function private.capture_content_version()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  affected_id uuid;
  snapshot jsonb;
  next_version integer;
  action_name text;
  resolved_scope text;
begin
  if tg_op = 'DELETE' then
    affected_id := old.id;
    snapshot := to_jsonb(old);
  else
    affected_id := new.id;
    snapshot := to_jsonb(new);
  end if;
  action_name := lower(tg_op);

  if tg_op = 'UPDATE'
    and old.status is distinct from new.status
    and new.status = 'published'
  then
    action_name := 'publish';
  elsif tg_op = 'UPDATE'
    and old.status is distinct from new.status
    and new.status = 'archived'
  then
    action_name := 'archive';
  end if;

  resolved_scope := coalesce(
    private.entity_scope_key(tg_table_name, affected_id),
    private.scope_for_entity_snapshot(tg_table_name, snapshot)
  );

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
    change_summary,
    scope_key,
    department_id
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
    end,
    resolved_scope,
    private.department_for_scope(resolved_scope)
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function private.capture_unpublished_content_version()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  affected_id uuid;
  snapshot jsonb;
  next_version integer;
  resolved_scope text;
begin
  if tg_op = 'DELETE' then
    affected_id := old.id;
    snapshot := to_jsonb(old);
  else
    affected_id := new.id;
    snapshot := to_jsonb(new);
  end if;
  resolved_scope := coalesce(
    private.entity_scope_key(tg_table_name, affected_id),
    private.scope_for_entity_snapshot(tg_table_name, snapshot)
  );

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
    change_summary,
    scope_key,
    department_id
  )
  values (
    tg_table_name,
    affected_id,
    lower(tg_op),
    next_version,
    snapshot,
    private.current_profile_id(),
    case when tg_op = 'DELETE' then 'Deleted content' else 'Saved content' end,
    resolved_scope,
    private.department_for_scope(resolved_scope)
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function private.enforce_publish_permission()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  old_public_payload jsonb;
  new_public_payload jsonb;
  resolved_scope text;
  old_was_published boolean := false;
begin
  resolved_scope := private.scope_for_entity_snapshot(tg_table_name, to_jsonb(new));

  if resolved_scope is null then
    raise exception 'Unable to resolve the responsible department for %.', tg_table_name;
  end if;

  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;

  if auth.uid() is not null then
    new.updated_by := private.current_profile_id();
  end if;

  if tg_op = 'UPDATE' then
    old_was_published := old.status = 'published';
  end if;

  if auth.uid() is not null
    and (
      new.status = 'published'
      or old_was_published
    )
  then
    old_public_payload := case
      when tg_op = 'INSERT' then null
      else to_jsonb(old) - 'updated_at' - 'updated_by' - 'created_at' - 'published_at'
    end;
    new_public_payload := to_jsonb(new) - 'updated_at' - 'updated_by' - 'created_at' - 'published_at';

    if (
      tg_op = 'INSERT'
      or old.status is distinct from new.status
      or old_public_payload is distinct from new_public_payload
    )
    and not private.can_publish_content_scope(resolved_scope)
    then
      raise exception 'Only the responsible department manager can publish this content.';
    end if;
  end if;

  return new;
end;
$$;

create or replace function private.create_content_governance_triggers(target_table regclass)
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

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'public.pages',
    'public.page_sections',
    'public.content_modules',
    'public.milestones',
    'public.articles',
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
      perform private.create_content_governance_triggers(target_table::regclass);
    end if;
  end loop;
end
$$;

drop trigger if exists capture_content_version_page_template_fields on public.page_template_fields;
create trigger capture_content_version_page_template_fields
after insert or update or delete on public.page_template_fields
for each row execute function private.capture_unpublished_content_version();

drop trigger if exists capture_content_version_site_settings on public.site_settings;
create trigger capture_content_version_site_settings
after insert or update or delete on public.site_settings
for each row execute function private.capture_unpublished_content_version();

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
  result_row public.publish_requests;
  affected_rows integer;
  allowed_tables constant text[] := array[
    'pages',
    'page_sections',
    'content_modules',
    'milestones',
    'articles',
    'care_stories',
    'expert_talks',
    'courses',
    'downloadable_files',
    'recruiting_pages',
    'recruiting_departments',
    'recruiting_openings',
    'investor_notices',
    'investor_financial_items',
    'investor_chart_datasets'
  ];
begin
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

  if not (request_row.entity_table = any(allowed_tables)) then
    raise exception 'Unsupported publish request table.';
  end if;

  if request_row.scope_key is null
    or not private.can_publish_content_scope(request_row.scope_key)
  then
    raise exception 'Only the responsible department manager can review this request.';
  end if;

  if next_status = 'approved' then
    execute format(
      'update public.%I set status = $1, published_at = coalesce(published_at, now()), updated_by = private.current_profile_id() where id = $2',
      request_row.entity_table
    )
    using request_row.target_status, request_row.entity_id;

    get diagnostics affected_rows = row_count;
    if affected_rows <> 1 then
      raise exception 'The requested CMS record no longer exists.';
    end if;

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
  returning * into result_row;

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

create policy "Department users can read publish requests"
on public.publish_requests
for select
to authenticated
using (
  requested_by = (select private.current_profile_id())
  or private.can_view_content_scope(scope_key)
);

create policy "Department editors can create publish requests"
on public.publish_requests
for insert
to authenticated
with check (
  private.can_submit_publish_request(entity_table, entity_id)
  and scope_key = private.entity_scope_key(entity_table, entity_id)
  and status = 'pending'
  and requested_by = (select private.current_profile_id())
);

create policy "Department users can read content versions"
on public.content_versions
for select
to authenticated
using (private.can_view_content_scope(scope_key));

create policy "CMS triggers can insert content versions"
on public.content_versions
for insert
to authenticated
with check (
  created_by = (select private.current_profile_id())
  and private.can_edit_content_scope(scope_key)
);

create policy "Department users can read activity logs"
on public.admin_activity_logs
for select
to authenticated
using (
  profile_id = (select private.current_profile_id())
  or private.can_view_content_scope(scope_key)
);

create policy "Department users can insert activity logs"
on public.admin_activity_logs
for insert
to authenticated
with check (
  profile_id = (select private.current_profile_id())
  and (
    scope_key is null
    or private.can_edit_content_scope(scope_key)
  )
);

create or replace function private.storage_object_scope(object_name text)
returns text
language sql
stable
security definer
set search_path = public, storage, private
as $$
  select coalesce(
    case
      when (storage.foldername(object_name))[1] = 'cms'
      then nullif((storage.foldername(object_name))[2], '')
      else null
    end,
    (
      select file.scope_key
      from public.downloadable_files file
      where file.storage_path = object_name
      limit 1
    )
  )
$$;

create or replace function private.can_edit_storage_object(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public, storage, private
as $$
  select private.current_profile_is_owner()
    or private.can_edit_content_scope(private.storage_object_scope(object_name))
$$;

drop policy if exists "CMS users can upload CMS storage objects" on storage.objects;
drop policy if exists "CMS managers can update CMS storage objects" on storage.objects;
drop policy if exists "CMS managers can delete CMS storage objects" on storage.objects;
drop policy if exists "CMS users can read recruiting resumes" on storage.objects;

create policy "Department editors can upload CMS storage objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = any(array[
    'public-images',
    'article-covers',
    'page-heroes',
    'course-images',
    'job-images',
    'investor-files',
    'private-documents'
  ])
  and private.can_edit_storage_object(name)
);

create policy "Department editors can update CMS storage objects"
on storage.objects
for update
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
  and private.can_edit_storage_object(name)
)
with check (
  bucket_id = any(array[
    'public-images',
    'article-covers',
    'page-heroes',
    'course-images',
    'job-images',
    'investor-files',
    'private-documents'
  ])
  and private.can_edit_storage_object(name)
);

create policy "Department editors can delete CMS storage objects"
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
  and private.can_edit_storage_object(name)
);

create policy "Talent users can read recruiting resumes"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'recruiting-resumes'
  and private.can_view_content_scope('forms:talent')
);

revoke all on function private.can_submit_publish_request(text, uuid) from public, anon;
revoke all on function private.can_submit_publish_request(text) from public, anon;
revoke all on function private.capture_content_version() from public, anon;
revoke all on function private.capture_unpublished_content_version() from public, anon;
revoke all on function private.enforce_publish_permission() from public, anon;
revoke all on function private.create_content_governance_triggers(regclass) from public, anon;
revoke all on function private.storage_object_scope(text) from public, anon;
revoke all on function private.can_edit_storage_object(text) from public, anon;
revoke all on function public.review_publish_request(uuid, text, text) from public, anon;

grant execute on function private.can_submit_publish_request(text, uuid) to authenticated, service_role;
grant execute on function private.can_submit_publish_request(text) to authenticated, service_role;
grant execute on function private.storage_object_scope(text) to authenticated, service_role;
grant execute on function private.can_edit_storage_object(text) to authenticated, service_role;
grant execute on function public.review_publish_request(uuid, text, text) to authenticated, service_role;
