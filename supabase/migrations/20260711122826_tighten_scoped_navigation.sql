-- Scoped editors go directly to their fixed-layout manager instead of seeing
-- generic page modules that do not belong to their department.
create or replace function private.current_admin_permissions()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_build_object(
    'profile_id', p.id, 'role', p.role, 'display_name', p.display_name, 'email', p.email,
    'content_scopes', coalesce((select jsonb_agg(s.scope_key order by s.scope_key) from public.admin_content_scopes s where s.profile_id = p.id), '[]'::jsonb),
    'can_manage_users', private.has_admin_permission('can_manage_users'), 'can_publish', private.has_admin_permission('can_publish'), 'can_review_publish', private.has_admin_permission('can_review_publish'), 'can_edit_site_settings', private.has_admin_permission('can_edit_site_settings'),
    'can_view_pages', private.has_admin_permission('can_view_pages'), 'can_edit_pages', private.has_admin_permission('can_edit_pages'), 'can_delete_pages', private.has_admin_permission('can_delete_pages'),
    'can_edit_service_content', private.has_content_scope('service:home-care') or private.has_content_scope('service:day-care') or private.has_content_scope('service:community') or private.has_content_scope('service:nursing') or private.has_content_scope('service:migrant-training') or private.has_content_scope('service:quality') or private.has_content_scope('service:software'),
    'can_view_articles', private.has_admin_permission('can_view_articles') or private.has_content_scope('health'), 'can_edit_articles', private.has_content_scope('health'), 'can_delete_articles', private.has_content_scope('health'),
    'can_view_media', private.has_admin_permission('can_view_media') or private.has_any_content_scope(), 'can_manage_media', private.has_admin_permission('can_manage_media') or private.has_any_content_scope(), 'can_delete_media', private.has_admin_permission('can_delete_media'),
    'can_view_courses', private.has_admin_permission('can_view_courses') or private.has_content_scope('courses'), 'can_edit_courses', private.has_content_scope('courses'), 'can_delete_courses', private.has_content_scope('courses'),
    'can_view_files', private.has_admin_permission('can_view_files'), 'can_manage_files', private.has_admin_permission('can_manage_files'), 'can_delete_files', private.has_admin_permission('can_delete_files'), 'can_view_forms', private.has_admin_permission('can_view_forms'), 'can_edit_forms', private.has_admin_permission('can_edit_forms'), 'can_export_forms', private.has_admin_permission('can_export_forms'),
    'can_view_recruiting', private.has_admin_permission('can_view_recruiting') or private.has_content_scope('recruiting:talent') or private.has_content_scope('recruiting:partnership'), 'can_edit_recruiting', private.has_content_scope('recruiting:talent') or private.has_content_scope('recruiting:partnership'), 'can_delete_recruiting', private.has_content_scope('recruiting:talent') or private.has_content_scope('recruiting:partnership'), 'can_edit_talent_recruiting', private.has_content_scope('recruiting:talent'), 'can_edit_partnership_recruiting', private.has_content_scope('recruiting:partnership'),
    'can_view_investor', private.has_admin_permission('can_view_investor') or private.has_content_scope('investor'), 'can_edit_investor', private.has_content_scope('investor'), 'can_delete_investor', private.has_content_scope('investor'), 'can_edit_brand_content', private.has_content_scope('brand'),
    'can_view_analytics', private.has_admin_permission('can_view_analytics'), 'can_export_analytics', private.has_admin_permission('can_export_analytics'), 'can_view_content_health', private.has_admin_permission('can_view_content_health'), 'can_manage_backups', private.has_admin_permission('can_manage_backups')
  ), '{}'::jsonb) from public.profiles p where p.user_id = auth.uid() and p.is_active = true limit 1
$$;
