-- Harden publishing workflow permissions.
-- Editors can create publish requests for modules they can edit.
-- Reviewers can approve/reject requests.
-- Non-publishers cannot directly change live published content.

create or replace function private.can_submit_publish_request(target_table text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case target_table
    when 'pages' then private.has_admin_permission('can_edit_pages')
    when 'page_sections' then private.has_admin_permission('can_edit_pages')
    when 'content_modules' then private.has_admin_permission('can_edit_pages')
    when 'site_settings' then private.has_admin_permission('can_edit_site_settings')
    when 'page_template_fields' then private.has_admin_permission('can_edit_pages')
    when 'articles' then private.has_admin_permission('can_edit_articles')
    when 'article_categories' then private.has_admin_permission('can_edit_articles')
    when 'care_stories' then private.has_admin_permission('can_edit_articles')
    when 'expert_talks' then private.has_admin_permission('can_edit_articles')
    when 'courses' then private.has_admin_permission('can_edit_courses')
    when 'downloadable_files' then private.has_admin_permission('can_manage_files')
    when 'recruiting_pages' then private.has_admin_permission('can_edit_recruiting')
    when 'recruiting_departments' then private.has_admin_permission('can_edit_recruiting')
    when 'recruiting_openings' then private.has_admin_permission('can_edit_recruiting')
    when 'investor_notices' then private.has_admin_permission('can_edit_investor')
    when 'investor_financial_items' then private.has_admin_permission('can_edit_investor')
    when 'investor_chart_datasets' then private.has_admin_permission('can_edit_investor')
    else false
  end
$$;

create or replace function private.set_publish_request_requester()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and new.requested_by is null then
    new.requested_by = private.current_profile_id();
  end if;
  if new.status is null then
    new.status = 'pending';
  end if;
  return new;
end;
$$;

drop trigger if exists set_publish_request_requester on public.publish_requests;
create trigger set_publish_request_requester
before insert on public.publish_requests
for each row execute function private.set_publish_request_requester();

drop index if exists publish_requests_one_pending_per_entity_idx;
create unique index if not exists publish_requests_one_pending_per_entity_idx
on public.publish_requests(entity_table, entity_id)
where status = 'pending';

drop policy if exists "CMS users can read publish requests" on public.publish_requests;
drop policy if exists "CMS users can create publish requests" on public.publish_requests;
drop policy if exists "Publish reviewers can update publish requests" on public.publish_requests;
drop policy if exists "Publish reviewers can manage publish requests" on public.publish_requests;

create policy "CMS users can read publish requests"
on public.publish_requests
for select
to authenticated
using (
  private.has_admin_permission('can_review_publish')
  or requested_by = private.current_profile_id()
);

create policy "CMS editors can create publish requests"
on public.publish_requests
for insert
to authenticated
with check (
  private.can_submit_publish_request(entity_table)
  and status = 'pending'
  and (requested_by is null or requested_by = private.current_profile_id())
);

create policy "Publish reviewers can update publish requests"
on public.publish_requests
for update
to authenticated
using (private.has_admin_permission('can_review_publish'))
with check (private.has_admin_permission('can_review_publish'));

drop policy if exists "CMS users can read content versions" on public.content_versions;
drop policy if exists "CMS users can read activity logs" on public.admin_activity_logs;

create policy "CMS users can read content versions"
on public.content_versions
for select
to authenticated
using (
  private.has_admin_permission('can_review_publish')
  or private.can_submit_publish_request(entity_table)
);

create policy "CMS users can read activity logs"
on public.admin_activity_logs
for select
to authenticated
using (
  private.has_admin_permission('can_review_publish')
  or private.has_admin_permission('can_view_pages')
  or private.has_admin_permission('can_view_articles')
  or private.has_admin_permission('can_view_courses')
  or private.has_admin_permission('can_view_files')
  or private.has_admin_permission('can_view_recruiting')
  or private.has_admin_permission('can_view_investor')
);

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
    and not (
      private.has_admin_permission('can_publish')
      or private.has_admin_permission('can_review_publish')
    )
    then
      raise exception 'Only users with publishing or review permission can create or change published CMS content.';
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
  if not private.has_admin_permission('can_review_publish') then
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
    'public.content_modules',
    'public.care_stories',
    'public.expert_talks',
    'public.recruiting_pages',
    'public.recruiting_departments',
    'public.recruiting_openings',
    'public.investor_notices',
    'public.investor_financial_items',
    'public.investor_chart_datasets'
  ]
  loop
    if to_regclass(table_name) is not null then
      perform private.create_content_governance_triggers(table_name::regclass);
    end if;
  end loop;
end $$;

grant execute on function private.can_submit_publish_request(text) to authenticated;
grant execute on function private.set_publish_request_requester() to authenticated;
grant execute on function private.enforce_publish_permission() to authenticated;
grant execute on function public.review_publish_request(uuid, text, text) to authenticated;
