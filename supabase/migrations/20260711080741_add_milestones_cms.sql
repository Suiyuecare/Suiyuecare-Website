-- Dedicated CMS collection for the public milestones timeline.

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  year smallint not null,
  month smallint not null,
  title text not null,
  tag text not null,
  summary text not null,
  status_label text not null default '已完成',
  image_id uuid references public.media(id) on delete set null,
  image_url text,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  status public.cms_publish_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint milestones_year_month_title_key unique (year, month, title),
  constraint milestones_year_check check (year between 1900 and 9999),
  constraint milestones_month_check check (month between 1 and 12),
  constraint milestones_title_not_blank check (btrim(title) <> ''),
  constraint milestones_tag_not_blank check (btrim(tag) <> ''),
  constraint milestones_summary_not_blank check (btrim(summary) <> ''),
  constraint milestones_status_label_not_blank check (btrim(status_label) <> ''),
  constraint milestones_image_url_not_blank check (image_url is null or btrim(image_url) <> ''),
  constraint milestones_sort_order_nonnegative check (sort_order >= 0),
  constraint milestones_published_at_required check (status <> 'published' or published_at is not null)
);

create index milestones_public_idx
on public.milestones(status, is_enabled, year desc, month desc, sort_order, published_at desc);

create index milestones_image_id_idx on public.milestones(image_id);
create index milestones_created_by_idx on public.milestones(created_by);
create index milestones_updated_by_idx on public.milestones(updated_by);
create index milestones_updated_at_idx on public.milestones(updated_at desc);

drop trigger if exists set_milestones_updated_at on public.milestones;
create trigger set_milestones_updated_at
before update on public.milestones
for each row execute function public.set_updated_at();

alter table public.milestones enable row level security;

create policy "Anon can read published milestones"
on public.milestones
for select
to anon
using (
  is_enabled = true
  and status = 'published'::public.cms_publish_status
  and published_at <= now()
);

create policy "Authenticated can read milestones"
on public.milestones
for select
to authenticated
using (
  (
    is_enabled = true
    and status = 'published'::public.cms_publish_status
    and published_at <= now()
  )
  or (select private.can_edit_pages_cms())
);

create policy "CMS users can insert milestones"
on public.milestones
for insert
to authenticated
with check ((select private.can_edit_pages_cms()));

create policy "CMS users can update milestones"
on public.milestones
for update
to authenticated
using ((select private.can_edit_pages_cms()))
with check ((select private.can_edit_pages_cms()));

create policy "CMS users can delete milestones"
on public.milestones
for delete
to authenticated
using ((select private.can_edit_pages_cms()));

revoke all on table public.milestones from public, anon, authenticated, service_role;
grant select on table public.milestones to anon;
grant select, insert, update, delete on table public.milestones to authenticated;
grant select, insert, update, delete on table public.milestones to service_role;

-- Keep milestones inside the existing editor -> reviewer publishing workflow.
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
    when 'milestones' then private.has_admin_permission('can_edit_pages')
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
    'milestones',
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
    execute format(
      'update public.%I set status = $1, published_at = coalesce(published_at, now()), updated_by = private.current_profile_id() where id = $2',
      request_row.entity_table
    )
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

  insert into public.admin_activity_logs (
    profile_id,
    action,
    entity_table,
    entity_id,
    message,
    metadata
  )
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

revoke execute on function private.can_submit_publish_request(text) from public, anon;
grant execute on function private.can_submit_publish_request(text) to authenticated, service_role;

revoke execute on function private.review_publish_request_internal(uuid, text, text) from public, anon;
grant execute on function private.review_publish_request_internal(uuid, text, text) to authenticated, service_role;

revoke execute on function public.review_publish_request(uuid, text, text) from public, anon;
grant execute on function public.review_publish_request(uuid, text, text) to authenticated;

-- Preserve all existing image usage values and add the dedicated timeline use case.
alter table public.media
  drop constraint if exists media_image_usage_check;

alter table public.media
  add constraint media_image_usage_check
  check (
    image_usage in (
      'hero',
      'service_hero',
      'article_cover',
      'card',
      'square',
      'avatar',
      'logo',
      'map',
      'freeform',
      'milestone'
    )
  ) not valid;

insert into public.media (
  bucket,
  storage_path,
  public_url,
  file_name,
  mime_type,
  alt_text,
  visibility,
  is_enabled,
  image_usage,
  focal_point
)
values
  ('site-assets', 'assets/milestones/homecare-agency-launch.jpg', '/assets/milestones/homecare-agency-launch.jpg', 'homecare-agency-launch.jpg', 'image/jpeg', '成立臺北市歲悅居家長照機構', 'public', true, 'milestone', 'center'),
  ('site-assets', 'assets/milestones/kaohsiung-caregiver-training.jpg', '/assets/milestones/kaohsiung-caregiver-training.jpg', 'kaohsiung-caregiver-training.jpg', 'image/jpeg', '得標高雄市家庭看護工作補充訓練計畫', 'public', true, 'milestone', 'center'),
  ('site-assets', 'assets/milestones/wanhua-community-care-one.jpg', '/assets/milestones/wanhua-community-care-one.jpg', 'wanhua-community-care-one.jpg', 'image/jpeg', '設立臺北市歲悅社區長照機構萬華一館', 'public', true, 'milestone', 'center'),
  ('site-assets', 'assets/milestones/official-website-v1-launch.jpg', '/assets/milestones/official-website-v1-launch.jpg', 'official-website-v1-launch.jpg', 'image/jpeg', '第一版官方網站上線', 'public', true, 'milestone', 'center'),
  ('site-assets', 'assets/milestones/migrant-digital-learning.jpg', '/assets/milestones/migrant-digital-learning.jpg', 'migrant-digital-learning.jpg', 'image/jpeg', '得標勞動部移工數位學習計畫', 'public', true, 'milestone', 'center'),
  ('site-assets', 'assets/milestones/youth-employment-event.jpg', '/assets/milestones/youth-employment-event.jpg', 'youth-employment-event.jpg', 'image/jpeg', '參與 Team Taipei 挺就業青年畢業啟航', 'public', true, 'milestone', 'center'),
  ('site-assets', 'assets/milestones/trademark-registration.jpg', '/assets/milestones/trademark-registration.jpg', 'trademark-registration.jpg', 'image/jpeg', '歲悅商標註冊完成', 'public', true, 'milestone', 'center'),
  ('site-assets', 'assets/milestones/employer-training.jpg', '/assets/milestones/employer-training.jpg', 'employer-training.jpg', 'image/jpeg', '得標臺北市雇主安心計畫集中訓練', 'public', true, 'milestone', 'center'),
  ('site-assets', 'assets/milestones/accounting-module.jpg', '/assets/milestones/accounting-module.jpg', 'accounting-module.jpg', 'image/jpeg', '歲悅長照系統會計模組上線', 'public', true, 'milestone', 'center'),
  ('site-assets', 'assets/milestones/wanhua-community-care-two.jpg', '/assets/milestones/wanhua-community-care-two.jpg', 'wanhua-community-care-two.jpg', 'image/jpeg', '設立臺北市歲悅社區長照機構萬華二館', 'public', true, 'milestone', 'center'),
  ('site-assets', 'assets/milestones/dementia-community-point.jpg', '/assets/milestones/dementia-community-point.jpg', 'dementia-community-point.jpg', 'image/jpeg', '得標臺北市失智社區服務據點', 'public', true, 'milestone', 'center'),
  ('site-assets', 'assets/milestones/official-website-v2-launch.jpg', '/assets/milestones/official-website-v2-launch.jpg', 'official-website-v2-launch.jpg', 'image/jpeg', '第二版官方網站上線', 'public', true, 'milestone', 'center'),
  ('site-assets', 'assets/milestones/newtaipei-integration.jpg', '/assets/milestones/newtaipei-integration.jpg', 'newtaipei-integration.jpg', 'image/jpeg', '併購新北市愛無限居家長照機構與好窩居家職能治療所', 'public', true, 'milestone', 'center'),
  ('site-assets', 'assets/milestones/project-management-module.jpg', '/assets/milestones/project-management-module.jpg', 'project-management-module.jpg', 'image/jpeg', '歲悅長照系統專案管理模組上線', 'public', true, 'milestone', 'center'),
  ('site-assets', 'assets/milestones/e-seal-module.jpg', '/assets/milestones/e-seal-module.jpg', 'e-seal-module.jpg', 'image/jpeg', '歲悅長照系統電子用印模組上線', 'public', true, 'milestone', 'center')
on conflict (bucket, storage_path) do update
set public_url = excluded.public_url,
    file_name = excluded.file_name,
    mime_type = excluded.mime_type,
    alt_text = excluded.alt_text,
    visibility = excluded.visibility,
    is_enabled = excluded.is_enabled,
    image_usage = excluded.image_usage,
    focal_point = excluded.focal_point,
    updated_at = now();

with milestone_seed (
  year,
  month,
  title,
  tag,
  summary,
  image_url,
  status_label,
  sort_order,
  storage_path
) as (
  values
    (2025::smallint, 6::smallint, '成立臺北市歲悅居家長照機構', '成立', '士林、北投、南港區居家長照服務啟動，建立到宅照顧、督導管理與家庭支持的服務基礎。', '/assets/milestones/homecare-agency-launch.jpg', '已完成', 10, 'assets/milestones/homecare-agency-launch.jpg'),
    (2025::smallint, 10::smallint, '得標高雄市家庭看護工作補充訓練計畫', '得標', '得標高雄市政府勞工局 115 年度「外國人從事家庭看護工作補充訓練計畫」，推動家庭看護照顧技能訓練。', '/assets/milestones/kaohsiung-caregiver-training.jpg', '已完成', 20, 'assets/milestones/kaohsiung-caregiver-training.jpg'),
    (2025::smallint, 12::smallint, '設立臺北市歲悅社區長照機構萬華一館', '設立', '萬華一館完成設立，作為社區長照服務的重要起點，提供長輩日間支持與家屬照顧資源。', '/assets/milestones/wanhua-community-care-one.jpg', '已完成', 30, 'assets/milestones/wanhua-community-care-one.jpg'),
    (2025::smallint, 12::smallint, '第一版官方網站上線', '上線', '第一版官方網站完成上線，建立品牌資訊、服務介紹與聯絡入口，讓家庭能更快了解歲悅服務。', '/assets/milestones/official-website-v1-launch.jpg', '已完成', 40, 'assets/milestones/official-website-v1-launch.jpg'),
    (2026::smallint, 2::smallint, '得標勞動部移工數位學習計畫', '得標', '得標勞動部勞動力發展署 115-116 年度「移工數位學習計劃」，推動移工照顧技能數位化學習。', '/assets/milestones/migrant-digital-learning.jpg', '已完成', 50, 'assets/milestones/migrant-digital-learning.jpg'),
    (2026::smallint, 3::smallint, '參與 Team Taipei 挺就業青年畢業啟航', '參與', '參與臺北市勞工局 115 年度 Team Taipei 挺就業-青年畢業啟航，與青年人才交流長照職涯與服務現場。', '/assets/milestones/youth-employment-event.jpg', '已完成', 60, 'assets/milestones/youth-employment-event.jpg'),
    (2026::smallint, 4::smallint, '歲悅商標註冊完成', '註冊', '歲悅商標於 115 年 4 月 16 日完成註冊，涵蓋養老院、日間托老服務與居家看護服務等類別，讓品牌服務識別更完整。', '/assets/milestones/trademark-registration.jpg', '已完成', 65, 'assets/milestones/trademark-registration.jpg'),
    (2026::smallint, 4::smallint, '得標臺北市雇主安心計畫集中訓練', '得標', '得標臺北市勞動力重建運用處 115 年度「雇主安心計畫-集中訓練」，協助家庭雇主與看護工作者提升照顧品質。', '/assets/milestones/employer-training.jpg', '已完成', 70, 'assets/milestones/employer-training.jpg'),
    (2026::smallint, 5::smallint, '歲悅長照系統會計模組上線', '上線', '會計模組正式上線，串接財務、行政與照顧營運資料，強化內部管理與服務紀錄銜接。', '/assets/milestones/accounting-module.jpg', '已完成', 80, 'assets/milestones/accounting-module.jpg'),
    (2026::smallint, 6::smallint, '設立臺北市歲悅社區長照機構萬華二館', '設立', '萬華二館完成設立，延伸社區長照服務量能，讓臺北市西區家庭有更多在地支持。', '/assets/milestones/wanhua-community-care-two.jpg', '已完成', 90, 'assets/milestones/wanhua-community-care-two.jpg'),
    (2026::smallint, 6::smallint, '得標臺北市失智社區服務據點', '得標', '得標士林、大同、信義區失智社區服務據點，提供失智友善活動、家屬諮詢與社區支持。', '/assets/milestones/dementia-community-point.jpg', '已完成', 100, 'assets/milestones/dementia-community-point.jpg'),
    (2026::smallint, 6::smallint, '第二版官方網站上線', '上線', '第二版官方網站完成上線，優化服務動線、內容架構與視覺呈現，讓使用者更清楚找到所需資訊。', '/assets/milestones/official-website-v2-launch.jpg', '已完成', 110, 'assets/milestones/official-website-v2-launch.jpg'),
    (2026::smallint, 7::smallint, '併購新北市愛無限居家長照機構與好窩居家職能治療所', '併購', '整合新店、中和、永和居家照顧服務，並納入復能與個案管理專業，擴大新北照顧服務網絡。', '/assets/milestones/newtaipei-integration.jpg', '已完成', 120, 'assets/milestones/newtaipei-integration.jpg'),
    (2026::smallint, 8::smallint, '歲悅長照系統專案管理模組上線', '上線', '專案管理模組正式上線，協助照顧服務、政府計畫、內部任務與跨部門進度更清楚被追蹤。', '/assets/milestones/project-management-module.jpg', '已完成', 130, 'assets/milestones/project-management-module.jpg'),
    (2026::smallint, 8::smallint, '歲悅長照系統電子用印模組上線', '上線', '電子用印模組導入行政流程，讓文件申請、核准、用印與紀錄留存更有效率。', '/assets/milestones/e-seal-module.jpg', '已完成', 140, 'assets/milestones/e-seal-module.jpg')
)
insert into public.milestones (
  year,
  month,
  title,
  tag,
  summary,
  status_label,
  image_id,
  image_url,
  sort_order,
  is_enabled,
  status,
  published_at
)
select
  seed.year,
  seed.month,
  seed.title,
  seed.tag,
  seed.summary,
  seed.status_label,
  media.id,
  seed.image_url,
  seed.sort_order,
  true,
  'published'::public.cms_publish_status,
  now()
from milestone_seed seed
join public.media media
  on media.bucket = 'site-assets'
 and media.storage_path = seed.storage_path
on conflict (year, month, title) do update
set tag = excluded.tag,
    summary = excluded.summary,
    status_label = excluded.status_label,
    image_id = excluded.image_id,
    image_url = excluded.image_url,
    sort_order = excluded.sort_order,
    is_enabled = excluded.is_enabled,
    status = excluded.status,
    published_at = coalesce(public.milestones.published_at, excluded.published_at),
    updated_at = now();

select private.create_content_governance_triggers('public.milestones'::regclass);
