-- Fine-grained CMS permissions.
-- Safe to apply even when optional CMS modules are not installed yet.

alter table if exists public.admins
  add column if not exists can_edit_pages boolean not null default true,
  add column if not exists can_edit_articles boolean not null default true,
  add column if not exists can_edit_courses boolean not null default true,
  add column if not exists can_manage_files boolean not null default true,
  add column if not exists can_view_forms boolean not null default true,
  add column if not exists can_view_analytics boolean not null default true,
  add column if not exists can_review_publish boolean not null default false;

create or replace function private.has_admin_permission(permission_key text)
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
        p.role = 'owner'
        or case permission_key
          when 'can_manage_users' then coalesce(a.can_manage_users, p.role = 'admin')
          when 'can_publish' then coalesce(a.can_publish, p.role = 'admin')
          when 'can_review_publish' then coalesce(a.can_review_publish, p.role = 'admin')
          when 'can_manage_media' then coalesce(a.can_manage_media, p.role in ('admin', 'editor'))
          when 'can_edit_pages' then coalesce(a.can_edit_pages, p.role in ('admin', 'editor'))
          when 'can_edit_articles' then coalesce(a.can_edit_articles, p.role in ('admin', 'editor'))
          when 'can_edit_courses' then coalesce(a.can_edit_courses, p.role in ('admin', 'editor'))
          when 'can_manage_files' then coalesce(a.can_manage_files, p.role in ('admin', 'editor'))
          when 'can_view_forms' then coalesce(a.can_view_forms, p.role in ('admin', 'editor'))
          when 'can_view_analytics' then coalesce(a.can_view_analytics, p.role = 'admin')
          else false
        end
      )
  )
$$;

create or replace function private.can_manage_users_cms()
returns boolean language sql stable security definer set search_path = public as $$ select private.has_admin_permission('can_manage_users') $$;
create or replace function private.can_edit_pages_cms()
returns boolean language sql stable security definer set search_path = public as $$ select private.has_admin_permission('can_edit_pages') $$;
create or replace function private.can_edit_articles_cms()
returns boolean language sql stable security definer set search_path = public as $$ select private.has_admin_permission('can_edit_articles') $$;
create or replace function private.can_edit_courses_cms()
returns boolean language sql stable security definer set search_path = public as $$ select private.has_admin_permission('can_edit_courses') $$;
create or replace function private.can_manage_files_cms()
returns boolean language sql stable security definer set search_path = public as $$ select private.has_admin_permission('can_manage_files') $$;
create or replace function private.can_manage_media_cms()
returns boolean language sql stable security definer set search_path = public as $$ select private.has_admin_permission('can_manage_media') $$;
create or replace function private.can_view_forms_cms()
returns boolean language sql stable security definer set search_path = public as $$ select private.has_admin_permission('can_view_forms') $$;
create or replace function private.can_view_analytics_cms()
returns boolean language sql stable security definer set search_path = public as $$ select private.has_admin_permission('can_view_analytics') $$;
create or replace function private.can_review_publish_cms()
returns boolean language sql stable security definer set search_path = public as $$ select private.has_admin_permission('can_review_publish') $$;
create or replace function private.can_publish_cms()
returns boolean language sql stable security definer set search_path = public as $$ select private.has_admin_permission('can_publish') $$;

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
      'can_manage_users', private.has_admin_permission('can_manage_users'),
      'can_publish', private.has_admin_permission('can_publish'),
      'can_review_publish', private.has_admin_permission('can_review_publish'),
      'can_manage_media', private.has_admin_permission('can_manage_media'),
      'can_edit_pages', private.has_admin_permission('can_edit_pages'),
      'can_edit_articles', private.has_admin_permission('can_edit_articles'),
      'can_edit_courses', private.has_admin_permission('can_edit_courses'),
      'can_manage_files', private.has_admin_permission('can_manage_files'),
      'can_view_forms', private.has_admin_permission('can_view_forms'),
      'can_view_analytics', private.has_admin_permission('can_view_analytics')
    ),
    '{}'::jsonb
  )
  from public.profiles p
  where p.user_id = auth.uid()
    and p.is_active = true
  limit 1
$$;

create or replace function public.get_current_admin_permissions()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$ select private.current_admin_permissions() $$;

create or replace function private.apply_admin_all_policy(table_name text, policy_name text, permission_function text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if to_regclass(table_name) is null then
    return;
  end if;
  execute format('drop policy if exists %I on %s', policy_name, table_name);
  execute format(
    'create policy %I on %s for all to authenticated using (private.%I()) with check (private.%I())',
    policy_name,
    table_name,
    permission_function,
    permission_function
  );
end;
$$;

create or replace function private.apply_admin_select_policy(table_name text, policy_name text, permission_function text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if to_regclass(table_name) is null then
    return;
  end if;
  execute format('drop policy if exists %I on %s', policy_name, table_name);
  execute format(
    'create policy %I on %s for select to authenticated using (private.%I())',
    policy_name,
    table_name,
    permission_function
  );
end;
$$;

select private.apply_admin_all_policy('public.profiles', 'Admins can manage profiles', 'can_manage_users_cms');
select private.apply_admin_all_policy('public.admins', 'Owners and admins can manage admin records', 'can_manage_users_cms');

select private.apply_admin_all_policy('public.pages', 'CMS users can manage pages', 'can_edit_pages_cms');
select private.apply_admin_all_policy('public.page_sections', 'CMS users can manage page sections', 'can_edit_pages_cms');
select private.apply_admin_all_policy('public.site_settings', 'CMS users can manage site settings', 'can_edit_pages_cms');
select private.apply_admin_all_policy('public.content_modules', 'CMS users can manage content modules', 'can_edit_pages_cms');
select private.apply_admin_all_policy('public.page_template_fields', 'CMS users can manage page template fields', 'can_edit_pages_cms');
select private.apply_admin_all_policy('public.recruiting_pages', 'CMS users can manage recruiting pages', 'can_edit_pages_cms');
select private.apply_admin_all_policy('public.recruiting_departments', 'CMS users can manage recruiting departments', 'can_edit_pages_cms');
select private.apply_admin_all_policy('public.recruiting_openings', 'CMS users can manage recruiting openings', 'can_edit_pages_cms');
select private.apply_admin_all_policy('public.investor_notices', 'CMS users can manage investor notices', 'can_edit_pages_cms');
select private.apply_admin_all_policy('public.investor_financial_items', 'CMS users can manage investor financial items', 'can_edit_pages_cms');
select private.apply_admin_all_policy('public.investor_chart_datasets', 'CMS users can manage investor chart datasets', 'can_edit_pages_cms');

select private.apply_admin_all_policy('public.media', 'CMS users can manage media', 'can_manage_media_cms');

select private.apply_admin_all_policy('public.articles', 'CMS users can manage articles', 'can_edit_articles_cms');
select private.apply_admin_all_policy('public.article_categories', 'CMS users can manage article categories', 'can_edit_articles_cms');
select private.apply_admin_all_policy('public.care_stories', 'CMS users can manage care stories', 'can_edit_articles_cms');
select private.apply_admin_all_policy('public.expert_talks', 'CMS users can manage expert talks', 'can_edit_articles_cms');
select private.apply_admin_all_policy('public.content_templates', 'CMS users can manage content templates', 'can_edit_articles_cms');

select private.apply_admin_all_policy('public.courses', 'CMS users can manage courses', 'can_edit_courses_cms');
select private.apply_admin_all_policy('public.downloadable_files', 'CMS users can manage downloadable files', 'can_manage_files_cms');
select private.apply_admin_all_policy('public.form_submissions', 'CMS users can manage form submissions', 'can_view_forms_cms');

select private.apply_admin_select_policy('public.analytics_page_views', 'CMS users can read analytics page views', 'can_view_analytics_cms');
select private.apply_admin_select_policy('public.analytics_events', 'CMS users can read analytics events', 'can_view_analytics_cms');
select private.apply_admin_all_policy('public.analytics_alerts', 'CMS users can manage analytics alerts', 'can_view_analytics_cms');
select private.apply_admin_all_policy('public.analytics_health_checks', 'CMS users can manage analytics health checks', 'can_view_analytics_cms');
select private.apply_admin_all_policy('public.analytics_report_schedules', 'CMS users can manage report schedules', 'can_view_analytics_cms');

select private.apply_admin_select_policy('public.content_versions', 'CMS users can read content versions', 'can_review_publish_cms');
select private.apply_admin_all_policy('public.publish_requests', 'Publish reviewers can manage publish requests', 'can_review_publish_cms');
select private.apply_admin_select_policy('public.admin_activity_logs', 'CMS users can read activity logs', 'can_review_publish_cms');

do $$
begin
  if to_regclass('storage.objects') is not null then
    drop policy if exists "CMS users can manage CMS storage objects" on storage.objects;
    create policy "CMS users can manage CMS storage objects"
    on storage.objects for all to authenticated
    using (
      bucket_id in ('public-images', 'article-covers', 'page-heroes', 'course-images', 'job-images', 'investor-files', 'private-documents')
      and private.can_manage_media_cms()
    )
    with check (
      bucket_id in ('public-images', 'article-covers', 'page-heroes', 'course-images', 'job-images', 'investor-files', 'private-documents')
      and private.can_manage_media_cms()
    );
  end if;
end $$;

grant execute on function private.has_admin_permission(text) to authenticated;
grant execute on function private.can_manage_users_cms() to authenticated;
grant execute on function private.can_edit_pages_cms() to authenticated;
grant execute on function private.can_edit_articles_cms() to authenticated;
grant execute on function private.can_edit_courses_cms() to authenticated;
grant execute on function private.can_manage_files_cms() to authenticated;
grant execute on function private.can_manage_media_cms() to authenticated;
grant execute on function private.can_view_forms_cms() to authenticated;
grant execute on function private.can_view_analytics_cms() to authenticated;
grant execute on function private.can_review_publish_cms() to authenticated;
grant execute on function private.can_publish_cms() to authenticated;
grant execute on function public.get_current_admin_permissions() to authenticated;
