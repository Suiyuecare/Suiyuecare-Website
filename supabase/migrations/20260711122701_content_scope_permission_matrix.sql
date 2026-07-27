-- Content responsibilities are intentionally separate from broad back-office roles.
-- A department only receives the front-end content areas listed in its scope rows.
create table public.admin_content_scopes (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  scope_key text not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, scope_key),
  constraint admin_content_scopes_key_check check (scope_key in (
    'courses',
    'health',
    'investor',
    'recruiting:talent',
    'recruiting:partnership',
    'brand',
    'service:home-care',
    'service:day-care',
    'service:community',
    'service:nursing',
    'service:migrant-training',
    'service:quality',
    'service:software'
  ))
);

create index admin_content_scopes_scope_key_idx on public.admin_content_scopes(scope_key);

alter table public.admin_content_scopes enable row level security;
revoke all on table public.admin_content_scopes from public, anon, authenticated, service_role;
grant select, insert, delete on table public.admin_content_scopes to authenticated, service_role;

create policy "Managers can read content scopes"
on public.admin_content_scopes for select to authenticated
using (private.can_manage_users_cms());

create policy "Managers can insert content scopes"
on public.admin_content_scopes for insert to authenticated
with check (private.can_manage_users_cms());

create policy "Managers can delete content scopes"
on public.admin_content_scopes for delete to authenticated
using (private.can_manage_users_cms());

create or replace function private.has_content_scope(requested_scope text)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.is_active = true
      and (
        p.role = 'owner'
        or exists (
          select 1
          from public.admin_content_scopes s
          where s.profile_id = p.id
            and s.scope_key = requested_scope
        )
      )
  )
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
    from public.profiles p
    where p.user_id = auth.uid()
      and p.is_active = true
      and (
        p.role = 'owner'
        or exists (select 1 from public.admin_content_scopes s where s.profile_id = p.id)
      )
  )
$$;

create or replace function private.can_manage_recruiting_page(target_page_slug text)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select case target_page_slug
    when 'talent' then private.has_content_scope('recruiting:talent')
    when 'land' then private.has_content_scope('recruiting:partnership')
    when 'investor-recruiting' then private.has_content_scope('recruiting:partnership')
    else false
  end
$$;

create or replace function private.can_manage_service_page(target_page_slug text)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select private.has_content_scope('service:' || target_page_slug)
$$;

create or replace function private.can_manage_brand_content()
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select private.has_content_scope('brand')
$$;

-- Existing active administrators retain their current access. New department users
-- receive only the rows explicitly selected in the back-office matrix.
insert into public.admin_content_scopes (profile_id, scope_key)
select p.id, scopes.scope_key
from public.profiles p
join public.admins a on a.profile_id = p.id
cross join (
  values
    ('courses'), ('health'), ('investor'), ('recruiting:talent'),
    ('recruiting:partnership'), ('brand'), ('service:home-care'),
    ('service:day-care'), ('service:community'), ('service:nursing'),
    ('service:migrant-training'), ('service:quality'), ('service:software')
) as scopes(scope_key)
where p.role = 'admin'
  and p.is_active = true
  and a.is_active = true
on conflict do nothing;

-- The permission payload is the single source used by the navigation and page UI.
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
      'content_scopes', coalesce((
        select jsonb_agg(s.scope_key order by s.scope_key)
        from public.admin_content_scopes s
        where s.profile_id = p.id
      ), '[]'::jsonb),
      'can_manage_users', private.has_admin_permission('can_manage_users'),
      'can_publish', private.has_admin_permission('can_publish'),
      'can_review_publish', private.has_admin_permission('can_review_publish'),
      'can_edit_site_settings', private.has_admin_permission('can_edit_site_settings'),
      'can_view_pages', private.has_admin_permission('can_view_pages') or private.has_content_scope('brand') or private.has_any_content_scope(),
      'can_edit_pages', private.has_admin_permission('can_edit_pages'),
      'can_delete_pages', private.has_admin_permission('can_delete_pages'),
      'can_view_articles', private.has_admin_permission('can_view_articles') or private.has_content_scope('health'),
      'can_edit_articles', private.has_content_scope('health'),
      'can_delete_articles', private.has_content_scope('health'),
      'can_view_media', private.has_admin_permission('can_view_media') or private.has_any_content_scope(),
      'can_manage_media', private.has_admin_permission('can_manage_media') or private.has_any_content_scope(),
      'can_delete_media', private.has_admin_permission('can_delete_media'),
      'can_view_courses', private.has_admin_permission('can_view_courses') or private.has_content_scope('courses'),
      'can_edit_courses', private.has_content_scope('courses'),
      'can_delete_courses', private.has_content_scope('courses'),
      'can_view_files', private.has_admin_permission('can_view_files'),
      'can_manage_files', private.has_admin_permission('can_manage_files'),
      'can_delete_files', private.has_admin_permission('can_delete_files'),
      'can_view_forms', private.has_admin_permission('can_view_forms'),
      'can_edit_forms', private.has_admin_permission('can_edit_forms'),
      'can_export_forms', private.has_admin_permission('can_export_forms'),
      'can_view_recruiting', private.has_admin_permission('can_view_recruiting') or private.has_content_scope('recruiting:talent') or private.has_content_scope('recruiting:partnership'),
      'can_edit_recruiting', private.has_content_scope('recruiting:talent') or private.has_content_scope('recruiting:partnership'),
      'can_delete_recruiting', private.has_content_scope('recruiting:talent') or private.has_content_scope('recruiting:partnership'),
      'can_edit_talent_recruiting', private.has_content_scope('recruiting:talent'),
      'can_edit_partnership_recruiting', private.has_content_scope('recruiting:partnership'),
      'can_view_investor', private.has_admin_permission('can_view_investor') or private.has_content_scope('investor'),
      'can_edit_investor', private.has_content_scope('investor'),
      'can_delete_investor', private.has_content_scope('investor'),
      'can_edit_brand_content', private.has_content_scope('brand'),
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

-- All of these tables are edited directly by their matching public front-end module.
drop policy if exists "Authenticated can read courses" on public.courses;
create policy "Course users can read courses" on public.courses for select to authenticated using (private.has_content_scope('courses'));
drop policy if exists "CMS users can insert courses" on public.courses;
drop policy if exists "CMS users can update courses" on public.courses;
drop policy if exists "CMS users can delete courses" on public.courses;
create policy "Scoped users can insert courses" on public.courses for insert to authenticated with check (private.has_content_scope('courses'));
create policy "Scoped users can update courses" on public.courses for update to authenticated using (private.has_content_scope('courses')) with check (private.has_content_scope('courses'));
create policy "Scoped users can delete courses" on public.courses for delete to authenticated using (private.has_content_scope('courses'));

do $$
declare
  target_table text;
begin
  foreach target_table in array array['articles', 'article_categories', 'care_stories', 'expert_talks']
  loop
    execute format('drop policy if exists %I on public.%I', 'Authenticated can read ' || replace(target_table, '_', ' '), target_table);
    execute format('drop policy if exists %I on public.%I', 'CMS users can insert ' || replace(target_table, '_', ' '), target_table);
    execute format('drop policy if exists %I on public.%I', 'CMS users can update ' || replace(target_table, '_', ' '), target_table);
    execute format('drop policy if exists %I on public.%I', 'CMS users can delete ' || replace(target_table, '_', ' '), target_table);
    execute format('create policy %I on public.%I for select to authenticated using (private.has_content_scope(''health''))', 'Health users can read ' || replace(target_table, '_', ' '), target_table);
    execute format('create policy %I on public.%I for insert to authenticated with check (private.has_content_scope(''health''))', 'Health users can insert ' || replace(target_table, '_', ' '), target_table);
    execute format('create policy %I on public.%I for update to authenticated using (private.has_content_scope(''health'')) with check (private.has_content_scope(''health''))', 'Health users can update ' || replace(target_table, '_', ' '), target_table);
    execute format('create policy %I on public.%I for delete to authenticated using (private.has_content_scope(''health''))', 'Health users can delete ' || replace(target_table, '_', ' '), target_table);
  end loop;
end
$$;

drop policy if exists "Authenticated can read investor notices" on public.investor_notices;
create policy "Investor users can read investor notices" on public.investor_notices for select to authenticated using (private.has_content_scope('investor'));
drop policy if exists "CMS users can insert investor notices" on public.investor_notices;
drop policy if exists "CMS users can update investor notices" on public.investor_notices;
drop policy if exists "CMS users can delete investor notices" on public.investor_notices;
create policy "Scoped users can insert investor notices" on public.investor_notices for insert to authenticated with check (private.has_content_scope('investor'));
create policy "Scoped users can update investor notices" on public.investor_notices for update to authenticated using (private.has_content_scope('investor')) with check (private.has_content_scope('investor'));
create policy "Scoped users can delete investor notices" on public.investor_notices for delete to authenticated using (private.has_content_scope('investor'));

drop policy if exists "Authenticated can read investor financial items" on public.investor_financial_items;
create policy "Investor users can read investor financial items" on public.investor_financial_items for select to authenticated using (private.has_content_scope('investor'));
drop policy if exists "CMS users can insert investor financial items" on public.investor_financial_items;
drop policy if exists "CMS users can update investor financial items" on public.investor_financial_items;
drop policy if exists "CMS users can delete investor financial items" on public.investor_financial_items;
create policy "Scoped users can insert investor financial items" on public.investor_financial_items for insert to authenticated with check (private.has_content_scope('investor'));
create policy "Scoped users can update investor financial items" on public.investor_financial_items for update to authenticated using (private.has_content_scope('investor')) with check (private.has_content_scope('investor'));
create policy "Scoped users can delete investor financial items" on public.investor_financial_items for delete to authenticated using (private.has_content_scope('investor'));

drop policy if exists "Authenticated can read investor chart datasets" on public.investor_chart_datasets;
create policy "Investor users can read investor chart datasets" on public.investor_chart_datasets for select to authenticated using (private.has_content_scope('investor'));
drop policy if exists "CMS users can insert investor chart datasets" on public.investor_chart_datasets;
drop policy if exists "CMS users can update investor chart datasets" on public.investor_chart_datasets;
drop policy if exists "CMS users can delete investor chart datasets" on public.investor_chart_datasets;
create policy "Scoped users can insert investor chart datasets" on public.investor_chart_datasets for insert to authenticated with check (private.has_content_scope('investor'));
create policy "Scoped users can update investor chart datasets" on public.investor_chart_datasets for update to authenticated using (private.has_content_scope('investor')) with check (private.has_content_scope('investor'));
create policy "Scoped users can delete investor chart datasets" on public.investor_chart_datasets for delete to authenticated using (private.has_content_scope('investor'));

drop policy if exists "Authenticated can read recruiting pages" on public.recruiting_pages;
create policy "Scoped users can read recruiting pages" on public.recruiting_pages for select to authenticated using (private.can_manage_recruiting_page(page_slug));
drop policy if exists "CMS users can insert recruiting pages" on public.recruiting_pages;
drop policy if exists "CMS users can update recruiting pages" on public.recruiting_pages;
drop policy if exists "CMS users can delete recruiting pages" on public.recruiting_pages;
create policy "Scoped users can insert recruiting pages" on public.recruiting_pages for insert to authenticated with check (private.can_manage_recruiting_page(page_slug));
create policy "Scoped users can update recruiting pages" on public.recruiting_pages for update to authenticated using (private.can_manage_recruiting_page(page_slug)) with check (private.can_manage_recruiting_page(page_slug));
create policy "Scoped users can delete recruiting pages" on public.recruiting_pages for delete to authenticated using (private.can_manage_recruiting_page(page_slug));

drop policy if exists "Authenticated can read recruiting departments" on public.recruiting_departments;
create policy "Scoped users can read recruiting departments" on public.recruiting_departments for select to authenticated using (private.can_manage_recruiting_page(page_slug));
drop policy if exists "CMS users can insert recruiting departments" on public.recruiting_departments;
drop policy if exists "CMS users can update recruiting departments" on public.recruiting_departments;
drop policy if exists "CMS users can delete recruiting departments" on public.recruiting_departments;
create policy "Scoped users can insert recruiting departments" on public.recruiting_departments for insert to authenticated with check (private.can_manage_recruiting_page(page_slug));
create policy "Scoped users can update recruiting departments" on public.recruiting_departments for update to authenticated using (private.can_manage_recruiting_page(page_slug)) with check (private.can_manage_recruiting_page(page_slug));
create policy "Scoped users can delete recruiting departments" on public.recruiting_departments for delete to authenticated using (private.can_manage_recruiting_page(page_slug));

drop policy if exists "Authenticated can read recruiting openings" on public.recruiting_openings;
create policy "Scoped users can read recruiting openings" on public.recruiting_openings for select to authenticated using (private.can_manage_recruiting_page(page_slug));
drop policy if exists "CMS users can insert recruiting openings" on public.recruiting_openings;
drop policy if exists "CMS users can update recruiting openings" on public.recruiting_openings;
drop policy if exists "CMS users can delete recruiting openings" on public.recruiting_openings;
create policy "Scoped users can insert recruiting openings" on public.recruiting_openings for insert to authenticated with check (private.can_manage_recruiting_page(page_slug));
create policy "Scoped users can update recruiting openings" on public.recruiting_openings for update to authenticated using (private.can_manage_recruiting_page(page_slug)) with check (private.can_manage_recruiting_page(page_slug));
create policy "Scoped users can delete recruiting openings" on public.recruiting_openings for delete to authenticated using (private.can_manage_recruiting_page(page_slug));

drop policy if exists "Authenticated can read milestones" on public.milestones;
drop policy if exists "CMS users can insert milestones" on public.milestones;
drop policy if exists "CMS users can update milestones" on public.milestones;
drop policy if exists "CMS users can delete milestones" on public.milestones;
drop policy if exists "Publishers can delete milestones" on public.milestones;
create policy "Brand users can read milestones" on public.milestones for select to authenticated using (private.can_manage_brand_content());
create policy "Brand users can insert milestones" on public.milestones for insert to authenticated with check (private.can_manage_brand_content());
create policy "Brand users can update milestones" on public.milestones for update to authenticated using (private.can_manage_brand_content()) with check (private.can_manage_brand_content());
create policy "Brand users can delete milestones" on public.milestones for delete to authenticated using (private.can_manage_brand_content());

drop policy if exists "Authenticated can read page template fields" on public.page_template_fields;
drop policy if exists "Publishers can insert page template fields" on public.page_template_fields;
drop policy if exists "Publishers can update page template fields" on public.page_template_fields;
drop policy if exists "Publishers can delete page template fields" on public.page_template_fields;
create policy "Service users can read page template fields" on public.page_template_fields for select to authenticated using (private.can_manage_service_page(page_slug));
create policy "Service users can insert page template fields" on public.page_template_fields for insert to authenticated with check (private.can_manage_service_page(page_slug));
create policy "Service users can update page template fields" on public.page_template_fields for update to authenticated using (private.can_manage_service_page(page_slug)) with check (private.can_manage_service_page(page_slug));
create policy "Service users can delete page template fields" on public.page_template_fields for delete to authenticated using (private.can_manage_service_page(page_slug));

-- The editor needs to upload images for the pages it owns. Existing full media managers
-- retain their old rights; scoped editors cannot delete the shared library.
create or replace function private.can_upload_content_media_cms()
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$ select private.has_admin_permission('can_manage_media') or private.has_any_content_scope() $$;

drop policy if exists "CMS users can insert media" on public.media;
drop policy if exists "CMS users can update media" on public.media;
drop policy if exists "CMS users can delete media" on public.media;
create policy "CMS users can insert media" on public.media for insert to authenticated with check (private.can_upload_content_media_cms());
create policy "CMS users can update media" on public.media for update to authenticated using (private.has_admin_permission('can_manage_media')) with check (private.has_admin_permission('can_manage_media'));
create policy "CMS users can delete media" on public.media for delete to authenticated using (private.has_admin_permission('can_delete_media'));

drop policy if exists "CMS users can manage CMS storage objects" on storage.objects;
create policy "CMS users can upload CMS storage objects" on storage.objects for insert to authenticated
with check (bucket_id = any (array['public-images','article-covers','page-heroes','course-images','job-images','investor-files','private-documents']) and private.can_upload_content_media_cms());
create policy "CMS managers can update CMS storage objects" on storage.objects for update to authenticated
using (bucket_id = any (array['public-images','article-covers','page-heroes','course-images','job-images','investor-files','private-documents']) and private.has_admin_permission('can_manage_media'))
with check (bucket_id = any (array['public-images','article-covers','page-heroes','course-images','job-images','investor-files','private-documents']) and private.has_admin_permission('can_manage_media'));
create policy "CMS managers can delete CMS storage objects" on storage.objects for delete to authenticated
using (bucket_id = any (array['public-images','article-covers','page-heroes','course-images','job-images','investor-files','private-documents']) and private.has_admin_permission('can_delete_media'));

create or replace function private.can_submit_publish_request(target_table text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case target_table
    when 'page_template_fields' then private.has_any_content_scope()
    when 'milestones' then private.can_manage_brand_content()
    when 'articles' then private.has_content_scope('health')
    when 'article_categories' then private.has_content_scope('health')
    when 'care_stories' then private.has_content_scope('health')
    when 'expert_talks' then private.has_content_scope('health')
    when 'courses' then private.has_content_scope('courses')
    when 'recruiting_pages' then private.has_content_scope('recruiting:talent') or private.has_content_scope('recruiting:partnership')
    when 'recruiting_departments' then private.has_content_scope('recruiting:talent') or private.has_content_scope('recruiting:partnership')
    when 'recruiting_openings' then private.has_content_scope('recruiting:talent') or private.has_content_scope('recruiting:partnership')
    when 'investor_notices' then private.has_content_scope('investor')
    when 'investor_financial_items' then private.has_content_scope('investor')
    when 'investor_chart_datasets' then private.has_content_scope('investor')
    else false
  end
$$;

revoke all on function private.has_content_scope(text) from public, anon;
revoke all on function private.has_any_content_scope() from public, anon;
revoke all on function private.can_manage_recruiting_page(text) from public, anon;
revoke all on function private.can_manage_service_page(text) from public, anon;
revoke all on function private.can_manage_brand_content() from public, anon;
revoke all on function private.can_upload_content_media_cms() from public, anon;
grant execute on function private.has_content_scope(text), private.has_any_content_scope(), private.can_manage_recruiting_page(text), private.can_manage_service_page(text), private.can_manage_brand_content(), private.can_upload_content_media_cms() to authenticated, service_role;
