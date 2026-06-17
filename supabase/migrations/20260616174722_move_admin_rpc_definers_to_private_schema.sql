create or replace function private.review_publish_request_internal(
  p_request_id uuid,
  p_next_status text,
  p_reviewer_note text default null::text
)
returns public.publish_requests
language plpgsql
security definer
set search_path to 'public'
as $function$
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
  if not private.has_admin_permission('can_review_publish') then
    raise exception 'Only reviewers can approve or reject publish requests.';
  end if;

  if p_next_status not in ('approved', 'rejected', 'cancelled') then
    raise exception 'Invalid publish request status.';
  end if;

  select *
  into request_row
  from public.publish_requests
  where id = p_request_id
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

  if p_next_status = 'approved' then
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
    status = p_next_status,
    review_note = p_reviewer_note,
    reviewed_by = private.current_profile_id(),
    reviewed_at = now()
  where id = p_request_id
  returning *
  into result_row;

  insert into public.admin_activity_logs (profile_id, action, entity_table, entity_id, message, metadata)
  values (
    private.current_profile_id(),
    'publish_request_' || p_next_status,
    request_row.entity_table,
    request_row.entity_id,
    coalesce(p_reviewer_note, request_row.entity_title, 'Publish request reviewed'),
    jsonb_build_object('publish_request_id', p_request_id)
  );

  return result_row;
end;
$function$;

create or replace function public.get_current_admin_permissions()
returns jsonb
language sql
stable
security invoker
set search_path to 'public'
as $function$
  select private.current_admin_permissions()
$function$;

create or replace function public.review_publish_request(
  request_id uuid,
  next_status text,
  reviewer_note text default null::text
)
returns public.publish_requests
language sql
security invoker
set search_path to 'public'
as $function$
  select private.review_publish_request_internal($1, $2, $3)
$function$;

revoke execute on function public.get_current_admin_permissions() from public, anon;
grant execute on function public.get_current_admin_permissions() to authenticated;

revoke execute on function public.review_publish_request(uuid, text, text) from public, anon;
grant execute on function public.review_publish_request(uuid, text, text) to authenticated;

revoke execute on function private.current_admin_permissions() from public, anon;
grant execute on function private.current_admin_permissions() to authenticated, service_role;

revoke execute on function private.review_publish_request_internal(uuid, text, text) from public, anon;
grant execute on function private.review_publish_request_internal(uuid, text, text) to authenticated, service_role;
