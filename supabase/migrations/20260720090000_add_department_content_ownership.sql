-- Department-owned CMS content.
--
-- This migration keeps the legacy admin_content_scopes table as a compatibility
-- bridge while introducing department memberships and three explicit access
-- levels: viewer, editor, and manager.

-- Preserve the pre-migration authority state inside the non-exposed private
-- schema so the rollout can be audited or reversed without exporting secrets.
create table if not exists private.cms_permission_migration_backups (
  migration_key text primary key,
  captured_at timestamptz not null default now(),
  profiles_snapshot jsonb not null,
  admins_snapshot jsonb not null,
  content_scopes_snapshot jsonb not null,
  publish_requests_snapshot jsonb not null
);

alter table private.cms_permission_migration_backups enable row level security;
revoke all on table private.cms_permission_migration_backups from public, anon, authenticated;

insert into private.cms_permission_migration_backups (
  migration_key,
  profiles_snapshot,
  admins_snapshot,
  content_scopes_snapshot,
  publish_requests_snapshot
)
select
  '20260720_department_content_ownership',
  coalesce((select jsonb_agg(to_jsonb(profile) order by profile.id) from public.profiles profile), '[]'::jsonb),
  coalesce((select jsonb_agg(to_jsonb(admin) order by admin.profile_id) from public.admins admin), '[]'::jsonb),
  coalesce((select jsonb_agg(to_jsonb(scope) order by scope.profile_id, scope.scope_key) from public.admin_content_scopes scope), '[]'::jsonb),
  coalesce((select jsonb_agg(to_jsonb(request) order by request.requested_at, request.id) from public.publish_requests request), '[]'::jsonb)
on conflict (migration_key) do nothing;

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint departments_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]*$')
);

create table if not exists public.department_memberships (
  department_id uuid not null references public.departments(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  membership_role text not null default 'viewer',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (department_id, profile_id),
  constraint department_memberships_role_check check (membership_role in ('viewer', 'editor', 'manager'))
);

create table if not exists public.cms_content_areas (
  scope_key text primary key,
  name text not null,
  description text,
  department_id uuid not null references public.departments(id) on delete restrict,
  frontend_path text,
  admin_path text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cms_content_areas_scope_key_format check (scope_key ~ '^[a-z0-9][a-z0-9:-]*$')
);

create index if not exists department_memberships_profile_idx
on public.department_memberships(profile_id, is_active, department_id);

create index if not exists department_memberships_department_role_idx
on public.department_memberships(department_id, membership_role, is_active);

create index if not exists cms_content_areas_department_idx
on public.cms_content_areas(department_id, is_active, sort_order);

drop trigger if exists set_departments_updated_at on public.departments;
create trigger set_departments_updated_at
before update on public.departments
for each row execute function public.set_updated_at();

drop trigger if exists set_department_memberships_updated_at on public.department_memberships;
create trigger set_department_memberships_updated_at
before update on public.department_memberships
for each row execute function public.set_updated_at();

drop trigger if exists set_cms_content_areas_updated_at on public.cms_content_areas;
create trigger set_cms_content_areas_updated_at
before update on public.cms_content_areas
for each row execute function public.set_updated_at();

insert into public.departments (slug, name, description, sort_order)
values
  ('brand-marketing', '品牌行銷部', '首頁、品牌內容、關於歲悅與健康 3.0。', 10),
  ('home-care', '居家照顧部', '居家照顧服務頁與相關內容。', 20),
  ('day-care', '日間照顧部', '日間照顧服務頁與相關內容。', 30),
  ('community', '社區服務部', '社區據點服務頁與相關內容。', 40),
  ('nursing', '護理復能部', '護理復能服務頁與相關內容。', 50),
  ('migrant-training', '移工培訓部', '移工培訓服務頁與相關內容。', 60),
  ('education-quality', '教育品管部', '教育品管、課程與課程報名。', 70),
  ('human-resources', '人力資源部', '人才招募、職缺與應徵資料。', 80),
  ('partnerships', '合作發展部', '土地合作與投資人招募。', 90),
  ('investor-relations', '投資人關係部', '投資人專區、公告、財務與治理內容。', 100),
  ('systems', '資訊系統部', '全站設定、軟體服務、媒體與系統文件。', 110),
  ('operations', '營運服務部', '聯絡頁、一般服務諮詢與案件分派。', 120)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

insert into public.cms_content_areas (
  scope_key,
  name,
  description,
  department_id,
  frontend_path,
  admin_path,
  sort_order
)
values
  ('page:home', '首頁', '首頁主視覺、模組與固定內容。', (select id from public.departments where slug = 'brand-marketing'), '/', '/admin/home-modules', 10),
  ('page:about', '關於歲悅', '品牌介紹與關於歲悅頁。', (select id from public.departments where slug = 'brand-marketing'), '/about', '/admin/pages', 20),
  ('brand', '品牌大事記', '公司里程碑與品牌大事記。', (select id from public.departments where slug = 'brand-marketing'), '/milestones', '/admin/milestones', 30),
  ('health', '健康 3.0', '文章、照顧故事、名人講堂與分類。', (select id from public.departments where slug = 'brand-marketing'), '/health', '/admin/articles', 40),
  ('service:home-care', '居家照顧', '居家照顧服務頁。', (select id from public.departments where slug = 'home-care'), '/home-care', '/admin/template-fields?page=home-care', 50),
  ('service:day-care', '日間照顧', '日間照顧服務頁。', (select id from public.departments where slug = 'day-care'), '/day-care', '/admin/template-fields?page=day-care', 60),
  ('service:community', '社區據點', '社區據點服務頁。', (select id from public.departments where slug = 'community'), '/community', '/admin/template-fields?page=community', 70),
  ('service:nursing', '護理復能', '護理復能服務頁。', (select id from public.departments where slug = 'nursing'), '/nursing', '/admin/template-fields?page=nursing', 80),
  ('service:migrant-training', '移工培訓', '移工培訓服務頁。', (select id from public.departments where slug = 'migrant-training'), '/migrant-training', '/admin/template-fields?page=migrant-training', 90),
  ('service:quality', '教育品管', '教育品管服務頁。', (select id from public.departments where slug = 'education-quality'), '/quality', '/admin/template-fields?page=quality', 100),
  ('courses', '課程報名', '課程卡片與報名內容。', (select id from public.departments where slug = 'education-quality'), '/courses', '/admin/courses', 110),
  ('recruiting:talent', '人才招募', '人才招募頁、部門與職缺。', (select id from public.departments where slug = 'human-resources'), '/talent', '/admin/recruiting?page=talent', 120),
  ('recruiting:partnership', '土地與投資人招募', '土地合作與投資人招募內容。', (select id from public.departments where slug = 'partnerships'), '/land', '/admin/recruiting?page=land', 130),
  ('investor', '投資人專區', '投資人公告、財務、治理與股東內容。', (select id from public.departments where slug = 'investor-relations'), '/investors', '/admin/investor-data', 140),
  ('service:software', '長照軟體', '長照軟體與系統服務頁。', (select id from public.departments where slug = 'systems'), '/software', '/admin/template-fields?page=software', 150),
  ('site:settings', '全站設定', '品牌、導覽、Footer 與全站聯絡資訊。', (select id from public.departments where slug = 'systems'), null, '/admin/site-settings', 160),
  ('files', '共用下載檔', '尚未指定業務內容的共用下載檔。', (select id from public.departments where slug = 'systems'), null, '/admin/files', 170),
  ('page:contact', '聯絡我們', '聯絡頁與一般服務入口。', (select id from public.departments where slug = 'operations'), '/contact', '/admin/pages', 180),
  ('forms:contact', '一般服務諮詢', '聯絡我們與長照服務諮詢案件。', (select id from public.departments where slug = 'operations'), null, '/admin/forms?type=contact', 190),
  ('forms:courses', '課程報名案件', '課程報名表單案件。', (select id from public.departments where slug = 'education-quality'), null, '/admin/forms?type=course_signup', 200),
  ('forms:talent', '人才應徵案件', '人才招募應徵與履歷案件。', (select id from public.departments where slug = 'human-resources'), null, '/admin/forms?type=recruiting', 210),
  ('forms:partnership', '合作洽談案件', '土地、企業與投資招募洽談案件。', (select id from public.departments where slug = 'partnerships'), null, '/admin/forms?type=land', 220),
  ('forms:brand', '品牌行銷案件', '網站、社群與品牌合作案件。', (select id from public.departments where slug = 'brand-marketing'), null, '/admin/forms?type=marketing', 230),
  ('forms:system', '系統諮詢案件', '軟體、後台與系統合作案件。', (select id from public.departments where slug = 'systems'), null, '/admin/forms?type=system', 240)
on conflict (scope_key) do update
set
  name = excluded.name,
  description = excluded.description,
  department_id = excluded.department_id,
  frontend_path = excluded.frontend_path,
  admin_path = excluded.admin_path,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

-- Allow future content areas without another hard-coded constraint migration.
alter table public.admin_content_scopes
  drop constraint if exists admin_content_scopes_key_check;

alter table public.admin_content_scopes
  drop constraint if exists admin_content_scopes_scope_key_format;

alter table public.admin_content_scopes
  add constraint admin_content_scopes_scope_key_format
  check (scope_key ~ '^[a-z0-9][a-z0-9:-]*$');

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
    select p.id, p.role
    from public.profiles p
    where p.id = target_profile_id
      and p.is_active = true
  ), access_levels as (
    select 3 as level
    from active_profile p
    where p.role = 'owner'

    union all

    select 2 as level
    from active_profile p
    join public.admin_content_scopes legacy_scope
      on legacy_scope.profile_id = p.id
     and legacy_scope.scope_key = requested_scope

    union all

    select case membership.membership_role
      when 'manager' then 3
      when 'editor' then 2
      else 1
    end as level
    from active_profile p
    join public.department_memberships membership
      on membership.profile_id = p.id
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

create or replace function private.current_content_role(requested_scope text)
returns text
language sql
stable
security definer
set search_path = public, private
as $$
  select private.profile_content_role(private.current_profile_id(), requested_scope)
$$;

create or replace function private.can_view_content_scope(requested_scope text)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select requested_scope is not null
    and private.current_content_role(requested_scope) is not null
$$;

create or replace function private.can_edit_content_scope(requested_scope text)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select coalesce(private.current_content_role(requested_scope) in ('editor', 'manager'), false)
$$;

create or replace function private.current_profile_is_owner()
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = private.current_profile_id()
      and p.role = 'owner'
      and p.is_active = true
  )
$$;

create or replace function private.can_publish_content_scope(requested_scope text)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select requested_scope is not null
    and private.current_profile_is_owner()
    and exists (
      select 1
      from public.cms_content_areas area
      where area.scope_key = requested_scope
        and area.is_active = true
    )
$$;

-- Backward-compatible names used by the existing admin application. A viewer
-- must never satisfy this function because older write policies call it.
create or replace function private.has_content_scope(requested_scope text)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select private.can_edit_content_scope(requested_scope)
$$;

create or replace function private.has_any_content_scope()
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.cms_content_areas area
    where area.is_active = true
      and private.can_view_content_scope(area.scope_key)
  )
$$;

create or replace function private.scope_for_page_slug(target_page_slug text)
returns text
language sql
stable
security definer
set search_path = public, private
as $$
  select case lower(coalesce(target_page_slug, ''))
    when 'home' then 'page:home'
    when 'about' then 'page:about'
    when 'contact' then 'page:contact'
    when 'milestones' then 'brand'
    when 'health' then 'health'
    when 'courses' then 'courses'
    when 'home-care' then 'service:home-care'
    when 'day-care' then 'service:day-care'
    when 'community' then 'service:community'
    when 'nursing' then 'service:nursing'
    when 'migrant-training' then 'service:migrant-training'
    when 'quality' then 'service:quality'
    when 'software' then 'service:software'
    when 'talent' then 'recruiting:talent'
    when 'land' then 'recruiting:partnership'
    when 'investor-recruiting' then 'recruiting:partnership'
    when 'investors' then 'investor'
    when 'ir-finance' then 'investor'
    when 'ir-governance' then 'investor'
    when 'ir-shareholders' then 'investor'
    else null
  end
$$;

create or replace function private.scope_for_page_id(target_page_id uuid)
returns text
language sql
stable
security definer
set search_path = public, private
as $$
  select private.scope_for_page_slug(p.slug)
  from public.pages p
  where p.id = target_page_id
  limit 1
$$;

create or replace function private.scope_for_form_type(target_form_type text)
returns text
language sql
stable
security definer
set search_path = public, private
as $$
  select case lower(coalesce(target_form_type, 'contact'))
    when 'course_signup' then 'forms:courses'
    when 'recruiting' then 'forms:talent'
    when 'land' then 'forms:partnership'
    when 'investor' then 'forms:partnership'
    when 'marketing' then 'forms:brand'
    when 'system' then 'forms:system'
    else 'forms:contact'
  end
$$;

create or replace function private.department_for_scope(requested_scope text)
returns uuid
language sql
stable
security definer
set search_path = public, private
as $$
  select area.department_id
  from public.cms_content_areas area
  where area.scope_key = requested_scope
    and area.is_active = true
  limit 1
$$;

create or replace function private.scope_for_site_setting(
  target_setting_group text,
  target_setting_key text
)
returns text
language sql
stable
security definer
set search_path = public, private
as $$
  select case
    when lower(coalesce(target_setting_group, '')) = 'investor'
      or lower(coalesce(target_setting_key, '')) = 'investor_pages'
    then 'investor'
    else 'site:settings'
  end
$$;

create or replace function private.scope_for_entity_snapshot(
  target_table text,
  row_snapshot jsonb
)
returns text
language plpgsql
stable
security definer
set search_path = public, private
as $$
declare
  parent_page_id uuid;
begin
  case target_table
    when 'pages' then
      return private.scope_for_page_slug(row_snapshot->>'slug');
    when 'page_sections' then
      parent_page_id := nullif(row_snapshot->>'page_id', '')::uuid;
      return private.scope_for_page_id(parent_page_id);
    when 'content_modules' then
      return private.scope_for_page_slug(row_snapshot->>'target_slug');
    when 'page_template_fields' then
      return private.scope_for_page_slug(row_snapshot->>'page_slug');
    when 'site_settings' then
      return private.scope_for_site_setting(
        row_snapshot->>'setting_group',
        row_snapshot->>'setting_key'
      );
    when 'milestones' then
      return 'brand';
    when 'articles', 'article_categories', 'care_stories', 'expert_talks' then
      return 'health';
    when 'courses' then
      return 'courses';
    when 'recruiting_pages', 'recruiting_departments', 'recruiting_openings' then
      return private.scope_for_page_slug(row_snapshot->>'page_slug');
    when 'investor_notices', 'investor_financial_items', 'investor_chart_datasets' then
      return 'investor';
    when 'downloadable_files', 'media', 'form_submissions', 'publish_requests', 'content_versions', 'admin_activity_logs' then
      return nullif(row_snapshot->>'scope_key', '');
    else
      return null;
  end case;
end;
$$;

create or replace function private.entity_scope_key(
  target_table text,
  target_entity_id uuid
)
returns text
language plpgsql
stable
security definer
set search_path = public, private
as $$
declare
  result_scope text;
  allowed_tables constant text[] := array[
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
    'form_submissions'
  ];
begin
  if target_table is null
    or target_entity_id is null
    or not (target_table = any(allowed_tables))
  then
    return null;
  end if;

  execute format(
    'select private.scope_for_entity_snapshot($1, to_jsonb(entity_row)) from public.%I entity_row where id = $2',
    target_table
  )
  into result_scope
  using target_table, target_entity_id;

  return result_scope;
end;
$$;

create or replace function private.can_manage_recruiting_page(target_page_slug text)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select private.can_edit_content_scope(private.scope_for_page_slug(target_page_slug))
$$;

create or replace function private.can_manage_service_page(target_page_slug text)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select private.can_edit_content_scope(private.scope_for_page_slug(target_page_slug))
$$;

create or replace function private.can_manage_brand_content()
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select private.can_edit_content_scope('brand')
$$;

-- Preserve all current direct assignments by converting them to department
-- memberships. Direct scope rows remain in place until a manager next saves the
-- user, so the rollout is backward compatible.
insert into public.department_memberships (
  department_id,
  profile_id,
  membership_role,
  is_active
)
select
  area.department_id,
  legacy_scope.profile_id,
  'editor',
  true
from public.admin_content_scopes legacy_scope
join public.cms_content_areas area
  on area.scope_key = legacy_scope.scope_key
group by area.department_id, legacy_scope.profile_id
on conflict (department_id, profile_id) do update
set
  membership_role = case
    when public.department_memberships.membership_role = 'manager' then 'manager'
    else 'editor'
  end,
  is_active = true,
  updated_at = now();

-- Preserve broad legacy module permissions for the newly introduced scopes.
insert into public.department_memberships (department_id, profile_id, membership_role, is_active)
select
  department.id,
  profile.id,
  case
    when coalesce(admin.can_edit_forms, false)
      or coalesce(admin.can_edit_site_settings, false)
      or coalesce(admin.can_manage_files, false)
      or coalesce(admin.can_edit_pages, false)
    then 'editor'
    else 'viewer'
  end,
  true
from public.profiles profile
join public.admins admin
  on admin.profile_id = profile.id
 and admin.is_active = true
cross join public.departments department
where profile.is_active = true
  and profile.role <> 'owner'
  and (
    (department.slug in ('brand-marketing', 'operations') and coalesce(admin.can_edit_pages, false))
    or (department.slug = 'systems' and (coalesce(admin.can_edit_site_settings, false) or coalesce(admin.can_manage_files, false)))
    or (department.slug in ('operations', 'education-quality', 'human-resources', 'partnerships', 'brand-marketing', 'systems') and coalesce(admin.can_view_forms, false))
  )
on conflict (department_id, profile_id) do update
set
  membership_role = case
    when public.department_memberships.membership_role = 'manager' then 'manager'
    when excluded.membership_role = 'editor' then 'editor'
    else public.department_memberships.membership_role
  end,
  is_active = true,
  updated_at = now();

alter table public.media
  add column if not exists scope_key text,
  add column if not exists department_id uuid references public.departments(id) on delete set null,
  add column if not exists is_shared boolean not null default false;

alter table public.downloadable_files
  add column if not exists scope_key text not null default 'files',
  add column if not exists department_id uuid references public.departments(id) on delete set null;

alter table public.form_submissions
  add column if not exists scope_key text,
  add column if not exists assigned_department_id uuid references public.departments(id) on delete set null;

alter table public.publish_requests
  add column if not exists scope_key text,
  add column if not exists department_id uuid references public.departments(id) on delete set null;

alter table public.content_versions
  add column if not exists scope_key text,
  add column if not exists department_id uuid references public.departments(id) on delete set null;

alter table public.admin_activity_logs
  add column if not exists scope_key text,
  add column if not exists department_id uuid references public.departments(id) on delete set null;

-- Existing media is shared because it may already be referenced by several
-- public pages. Every new upload is scoped by the admin application.
update public.media
set is_shared = true
where scope_key is null;

update public.downloadable_files
set scope_key = case
  when category in ('annual_report', 'quarterly_report', 'governance', 'finance', 'financial', 'investor', 'shareholder') then 'investor'
  when category = 'course' then 'courses'
  else coalesce(nullif(scope_key, ''), 'files')
end;

update public.downloadable_files
set department_id = private.department_for_scope(scope_key)
where department_id is distinct from private.department_for_scope(scope_key);

update public.form_submissions
set
  scope_key = private.scope_for_form_type(form_type),
  assigned_department_id = private.department_for_scope(private.scope_for_form_type(form_type));

alter table public.form_submissions
  alter column scope_key set not null;

update public.publish_requests request
set
  scope_key = private.entity_scope_key(request.entity_table, request.entity_id),
  department_id = private.department_for_scope(private.entity_scope_key(request.entity_table, request.entity_id))
where request.scope_key is null;

update public.content_versions version
set
  scope_key = coalesce(
    private.entity_scope_key(version.entity_table, version.entity_id),
    private.scope_for_entity_snapshot(version.entity_table, version.row_snapshot)
  ),
  department_id = private.department_for_scope(coalesce(
    private.entity_scope_key(version.entity_table, version.entity_id),
    private.scope_for_entity_snapshot(version.entity_table, version.row_snapshot)
  ))
where version.scope_key is null;

update public.admin_activity_logs log
set
  scope_key = private.entity_scope_key(log.entity_table, log.entity_id),
  department_id = private.department_for_scope(private.entity_scope_key(log.entity_table, log.entity_id))
where log.scope_key is null
  and log.entity_table is not null
  and log.entity_id is not null;

create index if not exists media_scope_created_idx
on public.media(scope_key, created_at desc)
where is_shared = false;

create index if not exists media_department_idx
on public.media(department_id, created_at desc);

create index if not exists downloadable_files_scope_idx
on public.downloadable_files(scope_key, status, is_enabled, sort_order);

create index if not exists downloadable_files_department_idx
on public.downloadable_files(department_id, updated_at desc);

create index if not exists form_submissions_scope_status_idx
on public.form_submissions(scope_key, status, created_at desc);

create index if not exists form_submissions_department_idx
on public.form_submissions(assigned_department_id, created_at desc);

create index if not exists publish_requests_scope_status_idx
on public.publish_requests(scope_key, status, requested_at desc);

create index if not exists publish_requests_department_idx
on public.publish_requests(department_id, status, requested_at desc);

create index if not exists content_versions_scope_created_idx
on public.content_versions(scope_key, created_at desc);

create index if not exists content_versions_department_idx
on public.content_versions(department_id, created_at desc);

create index if not exists admin_activity_logs_scope_created_idx
on public.admin_activity_logs(scope_key, created_at desc);

create index if not exists admin_activity_logs_department_idx
on public.admin_activity_logs(department_id, created_at desc);

create or replace function private.assign_scoped_row_ownership()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  metadata_scope text;
begin
  if tg_table_name = 'form_submissions' then
    new.scope_key := private.scope_for_form_type(new.form_type);
    new.assigned_department_id := private.department_for_scope(new.scope_key);

    if new.assigned_to is not null
      and private.profile_content_role(new.assigned_to, new.scope_key) is null
    then
      raise exception 'The assigned user is not a member of the responsible department.';
    end if;

    return new;
  end if;

  if tg_table_name = 'downloadable_files' then
    new.scope_key := coalesce(nullif(new.scope_key, ''), 'files');
    new.department_id := private.department_for_scope(new.scope_key);

    if new.department_id is null then
      raise exception 'Unknown content scope for downloadable file: %', new.scope_key;
    end if;

    return new;
  end if;

  if tg_table_name = 'media' then
    if new.is_shared then
      if auth.uid() is not null and not private.current_profile_is_owner() then
        raise exception 'Only the owner can create or change shared media.';
      end if;

      new.scope_key := null;
      new.department_id := null;
      return new;
    end if;

    metadata_scope := nullif(new.metadata->>'scope_key', '');
    new.scope_key := coalesce(nullif(new.scope_key, ''), metadata_scope);

    if new.scope_key is null then
      raise exception 'A content scope is required for new media.';
    end if;

    new.department_id := private.department_for_scope(new.scope_key);
    if new.department_id is null then
      raise exception 'Unknown content scope for media: %', new.scope_key;
    end if;

    new.metadata := jsonb_set(coalesce(new.metadata, '{}'::jsonb), '{scope_key}', to_jsonb(new.scope_key), true);
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists assign_media_scope on public.media;
create trigger assign_media_scope
before insert or update of scope_key, department_id, is_shared, metadata
on public.media
for each row execute function private.assign_scoped_row_ownership();

drop trigger if exists assign_downloadable_file_scope on public.downloadable_files;
create trigger assign_downloadable_file_scope
before insert or update of scope_key, department_id
on public.downloadable_files
for each row execute function private.assign_scoped_row_ownership();

drop trigger if exists assign_form_submission_scope on public.form_submissions;
create trigger assign_form_submission_scope
before insert or update of form_type, scope_key, assigned_department_id, assigned_to
on public.form_submissions
for each row execute function private.assign_scoped_row_ownership();

create or replace function private.set_publish_request_requester()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if auth.uid() is not null and new.requested_by is null then
    new.requested_by := private.current_profile_id();
  end if;

  new.status := coalesce(new.status, 'pending');
  new.scope_key := private.entity_scope_key(new.entity_table, new.entity_id);

  if new.scope_key is null then
    raise exception 'The publish request does not point to a supported CMS record.';
  end if;

  new.department_id := private.department_for_scope(new.scope_key);

  if auth.uid() is not null and not private.can_edit_content_scope(new.scope_key) then
    raise exception 'You cannot submit content owned by another department.';
  end if;

  return new;
end;
$$;

drop trigger if exists set_publish_request_requester on public.publish_requests;
create trigger set_publish_request_requester
before insert on public.publish_requests
for each row execute function private.set_publish_request_requester();

create or replace function private.set_activity_log_scope()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if new.profile_id is null and auth.uid() is not null then
    new.profile_id := private.current_profile_id();
  end if;

  new.scope_key := coalesce(
    nullif(new.scope_key, ''),
    private.entity_scope_key(new.entity_table, new.entity_id),
    nullif(new.metadata->>'scope_key', '')
  );
  new.department_id := private.department_for_scope(new.scope_key);

  return new;
end;
$$;

drop trigger if exists set_activity_log_scope on public.admin_activity_logs;
create trigger set_activity_log_scope
before insert on public.admin_activity_logs
for each row execute function private.set_activity_log_scope();

create or replace function private.current_admin_permissions()
returns jsonb
language sql
stable
security definer
set search_path = public, private
as $$
  select coalesce(jsonb_build_object(
    'profile_id', profile.id,
    'role', profile.role,
    'display_name', profile.display_name,
    'email', profile.email,
    'departments', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', department.id,
        'slug', department.slug,
        'name', department.name,
        'role', membership.membership_role
      ) order by department.sort_order, department.name)
      from public.department_memberships membership
      join public.departments department
        on department.id = membership.department_id
       and department.is_active = true
      where membership.profile_id = profile.id
        and membership.is_active = true
    ), '[]'::jsonb),
    'content_scopes', coalesce((
      select jsonb_agg(area.scope_key order by area.sort_order, area.scope_key)
      from public.cms_content_areas area
      where area.is_active = true
        and private.can_view_content_scope(area.scope_key)
    ), '[]'::jsonb),
    'edit_scopes', coalesce((
      select jsonb_agg(area.scope_key order by area.sort_order, area.scope_key)
      from public.cms_content_areas area
      where area.is_active = true
        and private.can_edit_content_scope(area.scope_key)
    ), '[]'::jsonb),
    'publish_scopes', coalesce((
      select jsonb_agg(area.scope_key order by area.sort_order, area.scope_key)
      from public.cms_content_areas area
      where area.is_active = true
        and private.can_publish_content_scope(area.scope_key)
    ), '[]'::jsonb),
    'can_manage_users', private.current_profile_is_owner(),
    'can_publish', private.current_profile_is_owner(),
    'can_review_publish', private.current_profile_is_owner(),
    'can_view_site_settings', private.can_view_content_scope('site:settings'),
    'can_edit_site_settings', private.can_edit_content_scope('site:settings'),
    'can_view_pages', exists (
      select 1 from public.cms_content_areas area
      where area.scope_key in ('page:home', 'page:about', 'page:contact', 'brand', 'health', 'courses', 'investor', 'recruiting:talent', 'recruiting:partnership', 'service:home-care', 'service:day-care', 'service:community', 'service:nursing', 'service:migrant-training', 'service:quality', 'service:software')
        and private.can_view_content_scope(area.scope_key)
    ),
    'can_edit_pages', exists (
      select 1 from public.cms_content_areas area
      where area.scope_key in ('page:home', 'page:about', 'page:contact')
        and private.can_edit_content_scope(area.scope_key)
    ),
    'can_delete_pages', private.current_profile_is_owner(),
    'can_view_home_content', private.can_view_content_scope('page:home'),
    'can_edit_home_content', private.can_edit_content_scope('page:home'),
    'can_edit_about_content', private.can_edit_content_scope('page:about'),
    'can_edit_contact_content', private.can_edit_content_scope('page:contact'),
    'can_view_service_content', exists (
      select 1 from public.cms_content_areas area
      where area.scope_key like 'service:%'
        and private.can_view_content_scope(area.scope_key)
    ),
    'can_edit_service_content', exists (
      select 1 from public.cms_content_areas area
      where area.scope_key like 'service:%'
        and private.can_edit_content_scope(area.scope_key)
    )
  ) || jsonb_build_object(
    'can_view_articles', private.can_view_content_scope('health'),
    'can_edit_articles', private.can_edit_content_scope('health'),
    'can_delete_articles', private.can_publish_content_scope('health'),
    'can_view_media', private.has_any_content_scope(),
    'can_manage_media', exists (
      select 1 from public.cms_content_areas area where private.can_edit_content_scope(area.scope_key)
    ),
    'can_delete_media', exists (
      select 1 from public.cms_content_areas area where private.can_publish_content_scope(area.scope_key)
    ),
    'can_view_courses', private.can_view_content_scope('courses'),
    'can_edit_courses', private.can_edit_content_scope('courses'),
    'can_delete_courses', private.can_publish_content_scope('courses'),
    'can_view_files', private.has_any_content_scope(),
    'can_manage_files', exists (
      select 1 from public.cms_content_areas area where private.can_edit_content_scope(area.scope_key)
    ),
    'can_delete_files', exists (
      select 1 from public.cms_content_areas area where private.can_publish_content_scope(area.scope_key)
    ),
    'can_view_forms', exists (
      select 1 from public.cms_content_areas area
      where area.scope_key like 'forms:%'
        and private.can_view_content_scope(area.scope_key)
    ),
    'can_edit_forms', exists (
      select 1 from public.cms_content_areas area
      where area.scope_key like 'forms:%'
        and private.can_edit_content_scope(area.scope_key)
    ),
    'can_export_forms', exists (
      select 1 from public.cms_content_areas area
      where area.scope_key like 'forms:%'
        and private.can_publish_content_scope(area.scope_key)
    ),
    'can_view_recruiting', private.can_view_content_scope('recruiting:talent') or private.can_view_content_scope('recruiting:partnership'),
    'can_edit_recruiting', private.can_edit_content_scope('recruiting:talent') or private.can_edit_content_scope('recruiting:partnership'),
    'can_delete_recruiting', private.can_publish_content_scope('recruiting:talent') or private.can_publish_content_scope('recruiting:partnership'),
    'can_edit_talent_recruiting', private.can_edit_content_scope('recruiting:talent'),
    'can_edit_partnership_recruiting', private.can_edit_content_scope('recruiting:partnership'),
    'can_view_investor', private.can_view_content_scope('investor'),
    'can_edit_investor', private.can_edit_content_scope('investor'),
    'can_delete_investor', private.can_publish_content_scope('investor'),
    'can_view_brand_content', private.can_view_content_scope('brand'),
    'can_edit_brand_content', private.can_edit_content_scope('brand'),
    'can_view_analytics', private.has_admin_permission('can_view_analytics'),
    'can_export_analytics', private.has_admin_permission('can_export_analytics'),
    'can_view_content_health', private.has_admin_permission('can_view_content_health'),
    'can_manage_backups', private.has_admin_permission('can_manage_backups')
  ), '{}'::jsonb)
  from public.profiles profile
  where profile.user_id = auth.uid()
    and profile.is_active = true
  limit 1
$$;

create or replace function public.get_current_admin_permissions()
returns jsonb
language sql
stable
security definer
set search_path = public, private
as $$
  select private.current_admin_permissions()
$$;

create or replace function public.replace_department_memberships(
  target_profile_id uuid,
  assignments jsonb
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role'
    and not private.current_profile_is_owner()
  then
    raise exception 'You do not have permission to manage department memberships.';
  end if;

  if target_profile_id is null then
    raise exception 'A target profile is required.';
  end if;

  if jsonb_typeof(coalesce(assignments, '[]'::jsonb)) <> 'array' then
    raise exception 'Department memberships must be a JSON array.';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(coalesce(assignments, '[]'::jsonb))
      as assignment(department_id uuid, membership_role text)
    where assignment.department_id is null
      or assignment.membership_role not in ('viewer', 'editor', 'manager')
      or not exists (
        select 1
        from public.departments department
        where department.id = assignment.department_id
          and department.is_active = true
      )
  ) then
    raise exception 'One or more department membership assignments are invalid.';
  end if;

  delete from public.department_memberships
  where profile_id = target_profile_id;

  insert into public.department_memberships (
    department_id,
    profile_id,
    membership_role,
    is_active,
    created_by
  )
  select distinct on (assignment.department_id)
    assignment.department_id,
    target_profile_id,
    assignment.membership_role,
    true,
    private.current_profile_id()
  from jsonb_to_recordset(coalesce(assignments, '[]'::jsonb))
    as assignment(department_id uuid, membership_role text)
  order by
    assignment.department_id,
    case assignment.membership_role
      when 'manager' then 3
      when 'editor' then 2
      else 1
    end desc;

  -- Once a user is saved in the department model, remove the legacy direct
  -- grants so future department changes cannot leave a hidden bypass behind.
  delete from public.admin_content_scopes
  where profile_id = target_profile_id;
end;
$$;

alter table public.departments enable row level security;
alter table public.department_memberships enable row level security;
alter table public.cms_content_areas enable row level security;

revoke all on table public.departments from public, anon;
revoke all on table public.department_memberships from public, anon;
revoke all on table public.cms_content_areas from public, anon;

grant select on table public.departments to authenticated, service_role;
grant select on table public.department_memberships to authenticated, service_role;
grant select on table public.cms_content_areas to authenticated, service_role;
grant insert, update, delete on table public.departments to authenticated, service_role;
grant insert, update, delete on table public.department_memberships to authenticated, service_role;
grant insert, update, delete on table public.cms_content_areas to authenticated, service_role;

revoke all on function private.profile_content_role(uuid, text) from public, anon;
revoke all on function private.current_content_role(text) from public, anon;
revoke all on function private.can_view_content_scope(text) from public, anon;
revoke all on function private.can_edit_content_scope(text) from public, anon;
revoke all on function private.can_publish_content_scope(text) from public, anon;
revoke all on function private.current_profile_is_owner() from public, anon;
revoke all on function private.has_content_scope(text) from public, anon;
revoke all on function private.has_any_content_scope() from public, anon;
revoke all on function private.scope_for_page_slug(text) from public, anon;
revoke all on function private.scope_for_page_id(uuid) from public, anon;
revoke all on function private.department_for_scope(text) from public, anon;
revoke all on function private.scope_for_site_setting(text, text) from public, anon;
revoke all on function private.scope_for_entity_snapshot(text, jsonb) from public, anon;
revoke all on function private.entity_scope_key(text, uuid) from public, anon;
revoke all on function private.assign_scoped_row_ownership() from public, anon;
revoke all on function private.set_publish_request_requester() from public, anon;
revoke all on function private.set_activity_log_scope() from public, anon;

grant execute on function private.profile_content_role(uuid, text) to authenticated, service_role;
grant execute on function private.current_content_role(text) to authenticated, service_role;
grant execute on function private.can_view_content_scope(text) to authenticated, service_role;
grant execute on function private.can_edit_content_scope(text) to authenticated, service_role;
grant execute on function private.can_publish_content_scope(text) to authenticated, service_role;
grant execute on function private.current_profile_is_owner() to authenticated, service_role;
grant execute on function private.has_content_scope(text) to authenticated, service_role;
grant execute on function private.has_any_content_scope() to authenticated, service_role;
grant execute on function private.scope_for_page_slug(text) to authenticated, service_role;
grant execute on function private.scope_for_page_id(uuid) to authenticated, service_role;
grant execute on function private.scope_for_form_type(text) to anon, authenticated, service_role;
grant execute on function private.department_for_scope(text) to authenticated, service_role;
grant execute on function private.scope_for_site_setting(text, text) to authenticated, service_role;
grant execute on function private.scope_for_entity_snapshot(text, jsonb) to authenticated, service_role;
grant execute on function private.entity_scope_key(text, uuid) to authenticated, service_role;
grant execute on function private.can_manage_recruiting_page(text) to authenticated, service_role;
grant execute on function private.can_manage_service_page(text) to authenticated, service_role;
grant execute on function private.can_manage_brand_content() to authenticated, service_role;
grant execute on function public.get_current_admin_permissions() to authenticated, service_role;
revoke all on function public.replace_department_memberships(uuid, jsonb) from public, anon;
grant execute on function public.replace_department_memberships(uuid, jsonb) to authenticated, service_role;
