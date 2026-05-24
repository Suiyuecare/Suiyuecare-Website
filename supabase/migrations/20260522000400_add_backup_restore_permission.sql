-- Add a dedicated permission for backup and restore operations.

alter table if exists public.admins
  add column if not exists can_manage_backups boolean not null default false;

update public.admins a
set can_manage_backups = p.role in ('owner', 'admin') or coalesce(a.can_manage_users, false)
from public.profiles p
where p.id = a.profile_id;

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
          when 'can_edit_site_settings' then coalesce(a.can_edit_site_settings, p.role = 'admin')
          when 'can_view_pages' then coalesce(a.can_view_pages, p.role in ('admin', 'editor', 'viewer'))
          when 'can_edit_pages' then coalesce(a.can_edit_pages, p.role in ('admin', 'editor'))
          when 'can_delete_pages' then coalesce(a.can_delete_pages, p.role = 'admin')
          when 'can_view_articles' then coalesce(a.can_view_articles, p.role in ('admin', 'editor', 'viewer'))
          when 'can_edit_articles' then coalesce(a.can_edit_articles, p.role in ('admin', 'editor'))
          when 'can_delete_articles' then coalesce(a.can_delete_articles, p.role = 'admin')
          when 'can_view_media' then coalesce(a.can_view_media, p.role in ('admin', 'editor', 'viewer'))
          when 'can_manage_media' then coalesce(a.can_manage_media, p.role in ('admin', 'editor'))
          when 'can_delete_media' then coalesce(a.can_delete_media, p.role = 'admin')
          when 'can_view_courses' then coalesce(a.can_view_courses, p.role in ('admin', 'editor', 'viewer'))
          when 'can_edit_courses' then coalesce(a.can_edit_courses, p.role in ('admin', 'editor'))
          when 'can_delete_courses' then coalesce(a.can_delete_courses, p.role = 'admin')
          when 'can_view_files' then coalesce(a.can_view_files, p.role in ('admin', 'editor', 'viewer'))
          when 'can_manage_files' then coalesce(a.can_manage_files, p.role in ('admin', 'editor'))
          when 'can_delete_files' then coalesce(a.can_delete_files, p.role = 'admin')
          when 'can_view_forms' then coalesce(a.can_view_forms, p.role in ('admin', 'editor'))
          when 'can_edit_forms' then coalesce(a.can_edit_forms, p.role in ('admin', 'editor'))
          when 'can_export_forms' then coalesce(a.can_export_forms, p.role = 'admin')
          when 'can_view_recruiting' then coalesce(a.can_view_recruiting, p.role in ('admin', 'editor', 'viewer'))
          when 'can_edit_recruiting' then coalesce(a.can_edit_recruiting, p.role in ('admin', 'editor'))
          when 'can_delete_recruiting' then coalesce(a.can_delete_recruiting, p.role = 'admin')
          when 'can_view_investor' then coalesce(a.can_view_investor, p.role in ('admin', 'editor', 'viewer'))
          when 'can_edit_investor' then coalesce(a.can_edit_investor, p.role in ('admin', 'editor'))
          when 'can_delete_investor' then coalesce(a.can_delete_investor, p.role = 'admin')
          when 'can_view_analytics' then coalesce(a.can_view_analytics, p.role = 'admin')
          when 'can_export_analytics' then coalesce(a.can_export_analytics, p.role = 'admin')
          when 'can_view_content_health' then coalesce(a.can_view_content_health, p.role in ('admin', 'editor', 'viewer'))
          when 'can_manage_backups' then coalesce(a.can_manage_backups, p.role = 'admin')
          else false
        end
      )
  )
$$;

create or replace function private.can_manage_backups_cms()
returns boolean language sql stable security definer set search_path = public as $$ select private.has_admin_permission('can_manage_backups') $$;

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
      'can_edit_site_settings', private.has_admin_permission('can_edit_site_settings'),
      'can_view_pages', private.has_admin_permission('can_view_pages'),
      'can_edit_pages', private.has_admin_permission('can_edit_pages'),
      'can_delete_pages', private.has_admin_permission('can_delete_pages'),
      'can_view_articles', private.has_admin_permission('can_view_articles'),
      'can_edit_articles', private.has_admin_permission('can_edit_articles'),
      'can_delete_articles', private.has_admin_permission('can_delete_articles'),
      'can_view_media', private.has_admin_permission('can_view_media'),
      'can_manage_media', private.has_admin_permission('can_manage_media'),
      'can_delete_media', private.has_admin_permission('can_delete_media'),
      'can_view_courses', private.has_admin_permission('can_view_courses'),
      'can_edit_courses', private.has_admin_permission('can_edit_courses'),
      'can_delete_courses', private.has_admin_permission('can_delete_courses'),
      'can_view_files', private.has_admin_permission('can_view_files'),
      'can_manage_files', private.has_admin_permission('can_manage_files'),
      'can_delete_files', private.has_admin_permission('can_delete_files'),
      'can_view_forms', private.has_admin_permission('can_view_forms'),
      'can_edit_forms', private.has_admin_permission('can_edit_forms'),
      'can_export_forms', private.has_admin_permission('can_export_forms'),
      'can_view_recruiting', private.has_admin_permission('can_view_recruiting'),
      'can_edit_recruiting', private.has_admin_permission('can_edit_recruiting'),
      'can_delete_recruiting', private.has_admin_permission('can_delete_recruiting'),
      'can_view_investor', private.has_admin_permission('can_view_investor'),
      'can_edit_investor', private.has_admin_permission('can_edit_investor'),
      'can_delete_investor', private.has_admin_permission('can_delete_investor'),
      'can_view_analytics', private.has_admin_permission('can_view_analytics'),
      'can_export_analytics', private.has_admin_permission('can_export_analytics'),
      'can_view_content_health', private.has_admin_permission('can_view_content_health'),
      'can_manage_backups', private.has_admin_permission('can_manage_backups')
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

drop policy if exists "CMS users can manage backup manifests" on public.backup_manifests;
create policy "CMS users can manage backup manifests"
on public.backup_manifests
for all
to authenticated
using (private.has_admin_permission('can_manage_backups'))
with check (private.has_admin_permission('can_manage_backups'));

grant execute on function private.has_admin_permission(text) to authenticated;
grant execute on function private.can_manage_backups_cms() to authenticated;
grant execute on function public.get_current_admin_permissions() to authenticated;
