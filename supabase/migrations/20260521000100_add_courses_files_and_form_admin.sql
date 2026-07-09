-- First-priority CMS modules: courses, downloadable files, and richer form handling.

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  excerpt text,
  description text,
  course_type text not null default '實體課',
  location text,
  location_detail text,
  starts_at timestamptz,
  ends_at timestamptz,
  price_text text not null default '免費',
  price_amount numeric(12,2),
  capacity integer,
  seats_label text,
  registration_status text not null default 'open' check (registration_status in ('open', 'full', 'closed', 'coming_soon')),
  registration_url text,
  cover_image_id uuid references public.media(id) on delete set null,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_enabled boolean not null default true,
  status public.cms_publish_status not null default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint courses_capacity_nonnegative check (capacity is null or capacity >= 0),
  constraint courses_published_at_required check (status <> 'published' or published_at is not null)
);

create table if not exists public.downloadable_files (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  category text not null default 'general',
  file_type text not null default 'PDF',
  bucket text,
  storage_path text,
  public_url text,
  file_name text,
  mime_type text,
  size_bytes bigint,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_enabled boolean not null default true,
  is_public boolean not null default true,
  status public.cms_publish_status not null default 'draft',
  published_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint downloadable_files_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint downloadable_files_size_nonnegative check (size_bytes is null or size_bytes >= 0),
  constraint downloadable_files_published_at_required check (status <> 'published' or published_at is not null)
);

alter table public.form_submissions
  add column if not exists assigned_to uuid references public.profiles(id) on delete set null,
  add column if not exists internal_note text,
  add column if not exists handled_at timestamptz,
  add column if not exists email_sent boolean not null default false,
  add column if not exists recipient_email text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists courses_status_enabled_sort_idx on public.courses(status, is_enabled, sort_order);
create index if not exists courses_featured_idx on public.courses(is_featured, sort_order);
create index if not exists courses_starts_at_idx on public.courses(starts_at asc);
create index if not exists courses_cover_image_idx on public.courses(cover_image_id);

create index if not exists downloadable_files_category_idx on public.downloadable_files(category, status, is_enabled);
create index if not exists downloadable_files_sort_idx on public.downloadable_files(sort_order, published_at desc);

create index if not exists form_submissions_updated_at_idx on public.form_submissions(updated_at desc);
create index if not exists form_submissions_assigned_to_idx on public.form_submissions(assigned_to);

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists set_downloadable_files_updated_at on public.downloadable_files;
create trigger set_downloadable_files_updated_at
before update on public.downloadable_files
for each row execute function public.set_updated_at();

drop trigger if exists set_form_submissions_updated_at on public.form_submissions;
create trigger set_form_submissions_updated_at
before update on public.form_submissions
for each row execute function public.set_updated_at();

alter table public.courses enable row level security;
alter table public.downloadable_files enable row level security;

drop policy if exists "Published courses are public" on public.courses;
drop policy if exists "CMS users can manage courses" on public.courses;
drop policy if exists "Published downloadable files are public" on public.downloadable_files;
drop policy if exists "CMS users can manage downloadable files" on public.downloadable_files;

create policy "Published courses are public"
on public.courses
for select
to anon, authenticated
using (
  is_enabled = true
  and status = 'published'
  and published_at <= now()
);

create policy "CMS users can manage courses"
on public.courses
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

create policy "Published downloadable files are public"
on public.downloadable_files
for select
to anon, authenticated
using (
  is_enabled = true
  and is_public = true
  and status = 'published'
  and published_at <= now()
);

create policy "CMS users can manage downloadable files"
on public.downloadable_files
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

grant select on public.courses to anon, authenticated;
grant select on public.downloadable_files to anon, authenticated;
grant select, insert, update, delete on public.courses to authenticated;
grant select, insert, update, delete on public.downloadable_files to authenticated;

create or replace function public.submit_form_submission(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_id uuid;
begin
  insert into public.form_submissions (
    form_type,
    name,
    phone,
    email,
    subject,
    message,
    source_path,
    metadata,
    recipient_email,
    email_sent
  )
  values (
    left(coalesce(payload->>'form_type', 'contact'), 80),
    left(nullif(payload->>'name', ''), 160),
    left(nullif(payload->>'phone', ''), 80),
    left(nullif(payload->>'email', ''), 180),
    left(nullif(payload->>'subject', ''), 220),
    left(nullif(payload->>'message', ''), 2000),
    left(nullif(payload->>'source_path', ''), 500),
    coalesce(payload->'metadata', '{}'::jsonb),
    left(nullif(payload->>'recipient_email', ''), 180),
    coalesce((payload->>'email_sent')::boolean, false)
  )
  returning id into inserted_id;

  return inserted_id;
end;
$$;

revoke all on function public.submit_form_submission(jsonb) from public;
grant execute on function public.submit_form_submission(jsonb) to anon, authenticated;

insert into public.media (bucket, storage_path, public_url, file_name, mime_type, alt_text, visibility, is_enabled, image_usage, focal_point)
values
  ('site-assets', 'assets/homepage-batch/orange-polo-caregiver-clear.jpg', '/assets/homepage-batch/orange-polo-caregiver-clear.jpg', 'orange-polo-caregiver-clear.jpg', 'image/jpeg', '照服員核心訓練課程封面', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/12-community-health-class-hires.jpg', '/assets/homepage-batch/12-community-health-class-hires.jpg', '12-community-health-class-hires.jpg', 'image/jpeg', '家庭照顧者實用課封面', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/19-health-dementia-cover-fast.jpg', '/assets/homepage-batch/19-health-dementia-cover-fast.jpg', '19-health-dementia-cover-fast.jpg', 'image/jpeg', '失智照顧溝通工作坊封面', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/03-supervisor-care-plan-fast.jpg', '/assets/homepage-batch/03-supervisor-care-plan-fast.jpg', '03-supervisor-care-plan-fast.jpg', 'image/jpeg', '移工照顧技能培訓封面', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/04-admin-team-office-fast.jpg', '/assets/homepage-batch/04-admin-team-office-fast.jpg', '04-admin-team-office-fast.jpg', 'image/jpeg', '督導品質管理研習封面', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/13-rehab-walking-practice-fast.jpg', '/assets/homepage-batch/13-rehab-walking-practice-fast.jpg', '13-rehab-walking-practice-fast.jpg', 'image/jpeg', '護理復能基礎課封面', 'public', true, 'article_cover', 'center')
on conflict (bucket, storage_path) do update
set
  public_url = excluded.public_url,
  alt_text = excluded.alt_text,
  image_usage = excluded.image_usage,
  focal_point = excluded.focal_point,
  is_enabled = true,
  visibility = 'public',
  updated_at = now();

insert into public.courses (
  slug,
  title,
  excerpt,
  description,
  course_type,
  location,
  starts_at,
  ends_at,
  price_text,
  capacity,
  seats_label,
  registration_status,
  cover_image_id,
  sort_order,
  is_featured,
  is_enabled,
  status,
  published_at,
  seo_title,
  seo_description
)
values
  ('caregiver-core-training', '照服員核心訓練班', '建立照服員上線前的基本能力。', '從照顧倫理、身體照顧、服務紀錄到家屬溝通，協助新人更穩定地進入第一線服務。', '實體課', '臺北教室', '2026-05-20 09:00:00+08', '2026-05-20 17:00:00+08', 'NT$ 3,600', 24, '剩餘 12 名', 'open', (select id from public.media where storage_path = 'assets/homepage-batch/orange-polo-caregiver-clear.jpg'), 10, true, true, 'published', now(), '照服員核心訓練班｜歲悅課程報名', '照服員上線前核心訓練課程。'),
  ('family-care-practical-class', '家庭照顧者實用課', '快速學會起身、用餐、跌倒預防與照顧溝通。', '適合正在照顧家中長輩的家庭，課程用真實照顧情境拆解每天用得到的方法。', '線上同步課', 'Google Meet', '2026-05-24 19:30:00+08', '2026-05-24 21:00:00+08', '免費', 80, '80 人', 'open', (select id from public.media where storage_path = 'assets/homepage-batch/12-community-health-class-hires.jpg'), 20, true, true, 'published', now(), '家庭照顧者實用課｜歲悅課程報名', '家屬照顧技巧線上課程。'),
  ('dementia-communication-workshop', '失智照顧溝通工作坊', '用情境演練理解重複提問、拒絕洗澡與情緒不安。', '以常見失智照顧情境設計互動演練，協助照顧者降低衝突與焦慮。', '實體課', '新北據點', '2026-06-02 13:30:00+08', '2026-06-02 16:30:00+08', 'NT$ 1,200', 24, '24 人', 'open', (select id from public.media where storage_path = 'assets/homepage-batch/19-health-dementia-cover-fast.jpg'), 30, true, true, 'published', now(), '失智照顧溝通工作坊｜歲悅課程報名', '失智症家庭照顧溝通與情境演練。'),
  ('migrant-care-skills-training', '移工照顧技能培訓', '建立一致的安全移位、用藥提醒與紀錄回報流程。', '針對家庭照顧移工設計，協助移工、家屬與照顧團隊建立共同照顧語言。', '實體課', '臺北教室', '2026-06-08 10:00:00+08', '2026-06-08 15:00:00+08', 'NT$ 2,000', 30, '30 人', 'open', (select id from public.media where storage_path = 'assets/homepage-batch/03-supervisor-care-plan-fast.jpg'), 40, false, true, 'published', now(), '移工照顧技能培訓｜歲悅課程報名', '移工照顧技能與家庭溝通培訓。'),
  ('supervisor-quality-management', '督導品質管理研習', '聚焦服務媒合、異常追蹤、紀錄檢核與團隊支持。', '協助長照督導建立服務品質追蹤、異常回報與團隊支持流程。', '線上同步課', 'Zoom', '2026-06-15 20:00:00+08', '2026-06-15 22:00:00+08', 'NT$ 980', 120, '120 人', 'open', (select id from public.media where storage_path = 'assets/homepage-batch/04-admin-team-office-fast.jpg'), 50, false, true, 'published', now(), '督導品質管理研習｜歲悅課程報名', '長照督導品質管理與服務紀錄研習。'),
  ('nursing-reablement-basic', '護理復能基礎課', '理解復能目標、步態觀察與家屬陪伴方法。', '預錄課程，協助家屬理解復能不是催促，而是陪長輩一步一步重建生活把握。', '預錄課', '線上學習', null, null, 'NT$ 680', null, '不限人數', 'open', (select id from public.media where storage_path = 'assets/homepage-batch/13-rehab-walking-practice-fast.jpg'), 60, false, true, 'published', now(), '護理復能基礎課｜歲悅課程報名', '護理復能與步態觀察基礎課。')
on conflict (slug) do update
set
  title = excluded.title,
  excerpt = excluded.excerpt,
  description = excluded.description,
  course_type = excluded.course_type,
  location = excluded.location,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  price_text = excluded.price_text,
  capacity = excluded.capacity,
  seats_label = excluded.seats_label,
  registration_status = excluded.registration_status,
  cover_image_id = excluded.cover_image_id,
  sort_order = excluded.sort_order,
  is_featured = excluded.is_featured,
  is_enabled = excluded.is_enabled,
  status = excluded.status,
  published_at = coalesce(public.courses.published_at, excluded.published_at),
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = now();
