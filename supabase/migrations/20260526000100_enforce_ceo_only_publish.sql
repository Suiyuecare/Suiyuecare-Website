-- Enforce CEO/owner-only publishing.
-- Everyone else must create a publish request and wait for owner approval.

update public.admins a
set
  can_publish = p.role = 'owner',
  can_review_publish = p.role = 'owner'
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
          when 'can_publish' then false
          when 'can_review_publish' then false
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

create or replace function private.enforce_publish_permission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_public_payload jsonb;
  new_public_payload jsonb;
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;

  if auth.uid() is not null and new.updated_by is null then
    new.updated_by = private.current_profile_id();
  end if;

  if auth.uid() is not null and new.status = 'published' then
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
    and not private.has_admin_permission('can_publish')
    then
      raise exception 'Only CEO/owner can directly publish CMS content. Please submit a publish request.';
    end if;
  end if;

  return new;
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
set search_path = public
as $$
declare
  request_row public.publish_requests;
  result_row public.publish_requests;
  allowed_tables text[] := array[
    'pages',
    'page_sections',
    'articles',
    'courses',
    'downloadable_files',
    'content_modules',
    'site_settings',
    'page_template_fields',
    'care_stories',
    'expert_talks',
    'recruiting_pages',
    'recruiting_departments',
    'recruiting_openings',
    'investor_notices',
    'investor_financial_items',
    'investor_chart_datasets'
  ];
begin
  if not private.has_admin_permission('can_publish') then
    raise exception 'Only CEO/owner can approve or reject publish requests.';
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

grant execute on function private.has_admin_permission(text) to authenticated;
grant execute on function private.current_admin_permissions() to authenticated;
grant execute on function public.get_current_admin_permissions() to authenticated;
grant execute on function private.enforce_publish_permission() to authenticated;
grant execute on function public.review_publish_request(uuid, text, text) to authenticated;
