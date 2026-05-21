-- Dedicated content databases for care stories and master talks.

create table if not exists public.care_stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  person_name text not null,
  person_label text,
  service_type text not null default '居家照顧',
  title text not null,
  quote text,
  praise text,
  story_body text,
  cover_image_id uuid references public.media(id) on delete set null,
  cover_image_url text,
  avatar_image_id uuid references public.media(id) on delete set null,
  avatar_image_url text,
  tags text[] not null default '{}'::text[],
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
  constraint care_stories_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint care_stories_published_at_required check (status <> 'published' or published_at is not null)
);

create table if not exists public.expert_talks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  speaker_name text not null,
  speaker_title text,
  organization text,
  topic text not null,
  title text not null,
  quote text,
  summary text,
  body text,
  image_id uuid references public.media(id) on delete set null,
  image_url text,
  tags text[] not null default '{}'::text[],
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
  constraint expert_talks_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint expert_talks_published_at_required check (status <> 'published' or published_at is not null)
);

create index if not exists care_stories_public_idx on public.care_stories(status, is_enabled, is_featured, sort_order, published_at desc);
create index if not exists expert_talks_public_idx on public.expert_talks(status, is_enabled, is_featured, sort_order, published_at desc);
create index if not exists care_stories_tags_gin_idx on public.care_stories using gin(tags);
create index if not exists expert_talks_tags_gin_idx on public.expert_talks using gin(tags);

drop trigger if exists set_care_stories_updated_at on public.care_stories;
create trigger set_care_stories_updated_at before update on public.care_stories for each row execute function public.set_updated_at();
drop trigger if exists set_expert_talks_updated_at on public.expert_talks;
create trigger set_expert_talks_updated_at before update on public.expert_talks for each row execute function public.set_updated_at();

alter table public.care_stories enable row level security;
alter table public.expert_talks enable row level security;

drop policy if exists "Published care stories are public" on public.care_stories;
drop policy if exists "CMS users can manage care stories" on public.care_stories;
drop policy if exists "Published expert talks are public" on public.expert_talks;
drop policy if exists "CMS users can manage expert talks" on public.expert_talks;

create policy "Published care stories are public"
on public.care_stories for select to anon, authenticated
using (is_enabled = true and status = 'published' and published_at <= now());

create policy "CMS users can manage care stories"
on public.care_stories for all to authenticated
using (private.can_manage_cms()) with check (private.can_manage_cms());

create policy "Published expert talks are public"
on public.expert_talks for select to anon, authenticated
using (is_enabled = true and status = 'published' and published_at <= now());

create policy "CMS users can manage expert talks"
on public.expert_talks for all to authenticated
using (private.can_manage_cms()) with check (private.can_manage_cms());

grant select on public.care_stories to anon, authenticated;
grant select on public.expert_talks to anon, authenticated;
grant select, insert, update, delete on public.care_stories to authenticated;
grant select, insert, update, delete on public.expert_talks to authenticated;

insert into public.media (bucket, storage_path, public_url, file_name, mime_type, alt_text, visibility, is_enabled, image_usage, focal_point)
values
  ('site-assets', 'assets/homepage-batch/05-orange-polo-caregiver.png', '/assets/homepage-batch/05-orange-polo-caregiver.png', '05-orange-polo-caregiver.png', 'image/png', '居家照顧服務員與長輩互動', 'public', true, 'card', 'center'),
  ('site-assets', 'assets/homepage-batch/02-daycare-group-exercise.png', '/assets/homepage-batch/02-daycare-group-exercise.png', '02-daycare-group-exercise.png', 'image/png', '日照長輩團體活動', 'public', true, 'card', 'center'),
  ('site-assets', 'assets/homepage-batch/10-family-consultation.png', '/assets/homepage-batch/10-family-consultation.png', '10-family-consultation.png', 'image/png', '照顧心理講師諮詢情境', 'public', true, 'card', 'center')
on conflict (bucket, storage_path) do update
set public_url = excluded.public_url,
    alt_text = excluded.alt_text,
    is_enabled = true,
    visibility = 'public',
    updated_at = now();

insert into public.care_stories (
  slug, person_name, person_label, service_type, title, quote, praise, story_body,
  cover_image_id, cover_image_url, avatar_image_id, avatar_image_url,
  tags, sort_order, is_featured, is_enabled, status, published_at, seo_title, seo_description
)
values
  (
    'lin-home-care-discharge',
    '林小姐',
    '家屬',
    '居家照顧',
    '「爸爸出院後，我終於知道每天該注意什麼。」',
    '爸爸出院後，我終於知道每天該注意什麼。',
    '稱讚歲悅的每日回報很清楚，從安全移位、用餐狀態到精神狀況都會主動說明，家人不用一直猜。',
    '林小姐的父親出院返家後，家裡最焦慮的是不知道每天哪些狀況需要注意。歲悅團隊先協助盤點移位、用餐、精神狀態與家屬溝通方式，再由照顧服務員與督導持續回報。服務穩定後，家屬不再需要靠猜測判斷狀況，也更能安排自己的工作與休息。',
    (select id from public.media where storage_path = 'assets/homepage-batch/05-orange-polo-caregiver.png'), '/assets/homepage-batch/05-orange-polo-caregiver.png',
    (select id from public.media where storage_path = 'assets/homepage-batch/05-orange-polo-caregiver.png'), '/assets/homepage-batch/05-orange-polo-caregiver.png',
    array['居家照顧','出院返家','家屬支持'], 10, true, true, 'published', now(), '林小姐居家照顧故事｜歲悅長照', '家屬稱讚歲悅每日回報清楚，讓出院返家的照顧更安心。'
  ),
  (
    'chen-day-care-rhythm',
    '陳小姐',
    '家屬',
    '日間照顧',
    '「媽媽白天有人陪，晚上還能回家睡。」',
    '媽媽白天有人陪，晚上還能回家睡。',
    '稱讚日照活動安排有節奏，餐食與休息都被照顧到，媽媽比較有精神，家屬上班也放心。',
    '陳小姐原本擔心母親白天獨自在家太少活動，晚上又容易作息混亂。歲悅日照團隊以固定活動、餐食與休息節奏協助長輩重新建立白天生活感，並把每日狀態回饋給家屬。幾週後，家屬感覺母親精神更穩，也比較願意和人互動。',
    (select id from public.media where storage_path = 'assets/homepage-batch/02-daycare-group-exercise.png'), '/assets/homepage-batch/02-daycare-group-exercise.png',
    (select id from public.media where storage_path = 'assets/homepage-batch/02-daycare-group-exercise.png'), '/assets/homepage-batch/02-daycare-group-exercise.png',
    array['日間照顧','活動陪伴','家屬安心'], 20, true, true, 'published', now(), '陳小姐日間照顧故事｜歲悅長照', '日照活動與餐食照顧讓家屬白天能安心工作。'
  )
on conflict (slug) do update
set title = excluded.title,
    quote = excluded.quote,
    praise = excluded.praise,
    story_body = excluded.story_body,
    cover_image_url = excluded.cover_image_url,
    avatar_image_url = excluded.avatar_image_url,
    is_enabled = true,
    status = 'published',
    published_at = now(),
    updated_at = now();

insert into public.expert_talks (
  slug, speaker_name, speaker_title, organization, topic, title, quote, summary, body,
  image_id, image_url, tags, sort_order, is_featured, is_enabled, status, published_at, seo_title, seo_description
)
values
  (
    'care-psychology-chou',
    '周小姐',
    '照顧心理講師',
    '歲悅健康3.0',
    '照顧心理',
    '好的照顧，是讓長輩和家屬都保有生活感。',
    '照顧不是把所有事情做完，而是讓家庭重新找到可以呼吸的節奏。',
    '她分享家屬在照顧初期最需要的是可理解的資訊與可求助的系統。',
    '周小姐提醒，照顧壓力常來自資訊不清楚與責任感過重。當家庭知道每天要觀察什麼、遇到變化可以問誰、服務如何被紀錄與回報，焦慮就會下降。好的照顧不只是長輩被照顧，也包含家屬被理解。',
    (select id from public.media where storage_path = 'assets/homepage-batch/10-family-consultation.png'), '/assets/homepage-batch/10-family-consultation.png',
    array['名人講堂','照顧心理','家屬支持'], 10, true, true, 'published', now(), '照顧心理講師周小姐｜名人講堂', '名人講堂分享照顧心理與家庭支持觀點。'
  )
on conflict (slug) do update
set title = excluded.title,
    quote = excluded.quote,
    summary = excluded.summary,
    body = excluded.body,
    image_url = excluded.image_url,
    is_enabled = true,
    status = 'published',
    published_at = now(),
    updated_at = now();
