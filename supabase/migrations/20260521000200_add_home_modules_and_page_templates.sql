-- Second-priority CMS modules: fixed home content modules and page template fields.

create table if not exists public.content_modules (
  id uuid primary key default gen_random_uuid(),
  target_slug text not null default 'home',
  module_key text not null,
  item_key text,
  title text not null,
  subtitle text,
  eyebrow text,
  body text,
  image_id uuid references public.media(id) on delete set null,
  link_text text,
  link_url text,
  date_label text,
  badge_label text,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_enabled boolean not null default true,
  status public.cms_publish_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_modules_key_format check (module_key ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint content_modules_target_format check (target_slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint content_modules_published_at_required check (status <> 'published' or published_at is not null)
);

create table if not exists public.page_template_fields (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  template_key text not null,
  field_key text not null,
  field_label text not null,
  field_type text not null default 'text' check (field_type in ('text', 'textarea', 'image', 'url', 'number', 'boolean', 'json')),
  text_value text,
  number_value numeric,
  boolean_value boolean,
  image_id uuid references public.media(id) on delete set null,
  json_value jsonb not null default '{}'::jsonb,
  help_text text,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_slug, template_key, field_key),
  constraint page_template_fields_page_slug_format check (page_slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint page_template_fields_template_key_format check (template_key ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint page_template_fields_field_key_format check (field_key ~ '^[a-z0-9][a-z0-9_-]*$')
);

create index if not exists content_modules_target_module_idx on public.content_modules(target_slug, module_key, status, is_enabled, sort_order);
create index if not exists content_modules_featured_idx on public.content_modules(module_key, is_featured, sort_order);
create index if not exists page_template_fields_page_idx on public.page_template_fields(page_slug, template_key, sort_order);

drop trigger if exists set_content_modules_updated_at on public.content_modules;
create trigger set_content_modules_updated_at
before update on public.content_modules
for each row execute function public.set_updated_at();

drop trigger if exists set_page_template_fields_updated_at on public.page_template_fields;
create trigger set_page_template_fields_updated_at
before update on public.page_template_fields
for each row execute function public.set_updated_at();

alter table public.content_modules enable row level security;
alter table public.page_template_fields enable row level security;

drop policy if exists "Published content modules are public" on public.content_modules;
drop policy if exists "CMS users can manage content modules" on public.content_modules;
drop policy if exists "Enabled page template fields are public" on public.page_template_fields;
drop policy if exists "CMS users can manage page template fields" on public.page_template_fields;

create policy "Published content modules are public"
on public.content_modules
for select
to anon, authenticated
using (
  is_enabled = true
  and status = 'published'
  and published_at <= now()
);

create policy "CMS users can manage content modules"
on public.content_modules
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

create policy "Enabled page template fields are public"
on public.page_template_fields
for select
to anon, authenticated
using (is_enabled = true);

create policy "CMS users can manage page template fields"
on public.page_template_fields
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

grant select on public.content_modules to anon, authenticated;
grant select on public.page_template_fields to anon, authenticated;
grant select, insert, update, delete on public.content_modules to authenticated;
grant select, insert, update, delete on public.page_template_fields to authenticated;

insert into public.content_modules (
  target_slug, module_key, item_key, title, subtitle, eyebrow, body, date_label, badge_label, link_text, link_url,
  image_id, sort_order, is_featured, is_enabled, status, published_at, metadata
)
values
  ('home', 'news', 'service-dispatch', '歲悅長照新增北北桃服務調度窗口', null, 'News', '整合居家照顧、日間照顧與護理復能諮詢，協助家庭更快找到適合服務。', '2026.05', null, null, '/investors', null, 10, true, true, 'published', now(), '{}'::jsonb),
  ('home', 'news', 'health-column', '健康3.0照顧知識專欄上線', null, 'News', '提供家屬可快速理解的照顧技巧、營養衛教與安全提醒。', '2026.04', null, null, '/health', null, 20, false, true, 'published', now(), '{}'::jsonb),
  ('home', 'news', 'migrant-course-open', '移工照顧訓練課程開放報名', null, 'News', '以實作情境、家庭溝通與照顧安全為核心，提升家庭照顧穩定度。', '2026.03', null, null, '/courses', null, 30, false, true, 'published', now(), '{}'::jsonb),
  ('home', 'awards', 'taipei-home-care', '臺北市居家照顧服務合作案', null, 'Awards', '承接區域照顧支持與家屬諮詢服務，建立可追蹤的照顧流程。', '2026', null, null, '/ir-governance', null, 10, true, true, 'published', now(), '{}'::jsonb),
  ('home', 'awards', 'ntpc-community', '新北市社區照顧據點服務案', null, 'Awards', '協助社區健康促進、共餐活動與預防延緩失能課程執行。', '2025', null, null, '/ir-governance', null, 20, false, true, 'published', now(), '{}'::jsonb),
  ('home', 'awards', 'taoyuan-rehab', '桃園市護理復能支持服務案', null, 'Awards', '串接護理評估、復能訓練與服務品質追蹤。', '2025', null, null, '/ir-governance', null, 30, false, true, 'published', now(), '{}'::jsonb),
  ('home', 'recruit', 'home-care-worker', '居家照顧服務員', null, 'We want you', '到宅陪伴、生活支持、照顧紀錄。', null, '居家照顧部門', '立即應徵', '/talent', (select id from public.media where storage_path = 'assets/homepage-batch/orange-polo-caregiver-clear.jpg'), 10, true, true, 'published', now(), '{}'::jsonb),
  ('home', 'recruit', 'home-care-supervisor', '居家服務督導', null, 'We want you', '照顧品質追蹤、服務媒合與團隊支持。', null, '居家照顧部門', '立即應徵', '/talent', (select id from public.media where storage_path = 'assets/homepage-batch/orange-polo-supervisor-clear.jpg'), 20, false, true, 'published', now(), '{}'::jsonb),
  ('home', 'recruit', 'daycare-worker', '日照照顧服務員', null, 'We want you', '活動陪伴、餐食照顧、長輩日常支持。', null, '日間照顧部', '立即應徵', '/talent', (select id from public.media where storage_path = 'assets/homepage-batch/04-admin-team-office-fast.jpg'), 30, false, true, 'published', now(), '{}'::jsonb),
  ('home', 'video', 'main-unit-video', '單位影片', 'Suiyuecare Corps. 單位影片', 'Video', 'https://www.youtube.com/embed/8KfH7t4gk28', null, 'YouTube', '觀看影片', 'https://www.youtube.com/watch?v=8KfH7t4gk28', null, 10, true, true, 'published', now(), '{"provider":"youtube"}'::jsonb),
  ('home', 'care_story', 'lin-home-care', '「爸爸出院後，我終於知道每天該注意什麼。」', '林小姐', 'Care Stories', '稱讚歲悅的每日回報很清楚，從安全移位、用餐狀態到精神狀況都會主動說明，家人不用一直猜。', null, '居家照顧', null, null, (select id from public.media where storage_path = 'assets/homepage-batch/orange-polo-caregiver-clear.jpg'), 10, true, true, 'published', now(), '{}'::jsonb),
  ('home', 'care_story', 'chen-day-care', '「媽媽白天有人陪，晚上還能回家睡。」', '陳小姐', 'Care Stories', '稱讚日照活動安排有節奏，餐食與休息都被照顧到，媽媽比較有精神，家屬上班也放心。', null, '日間照顧', null, null, (select id from public.media where storage_path = 'assets/homepage-batch/02-daycare-group-exercise-hires.jpg'), 20, false, true, 'published', now(), '{}'::jsonb),
  ('home', 'master_talk', 'care-psychology-chou', '好的照顧，是讓長輩和家屬都保有生活感。', '照顧心理講師 周小姐', 'Master Talk', '她分享家屬在照顧初期最需要的是可理解的資訊與可求助的系統。', null, '名人講堂', 'Read More', '/article/master-talk-care-psychology', (select id from public.media where storage_path = 'assets/master-talk/portrait-care-psychology-chou.jpg'), 10, true, true, 'published', now(), '{}'::jsonb)
on conflict do nothing;

insert into public.page_template_fields (page_slug, template_key, field_key, field_label, field_type, text_value, sort_order, help_text)
values
  ('home-care', 'service_hero', 'hero_image', 'Hero 圖片', 'image', null, 5, '服務頁右側圖片，後台會協助裁切為服務頁 Hero 比例。'),
  ('home-care', 'service_hero', 'hero_title', 'Hero 標題', 'text', '居家照顧', 10, '只修改文字，不改版型。'),
  ('home-care', 'service_hero', 'hero_body', 'Hero 內文', 'textarea', '居家照顧是歲悅最靠近家庭的一線服務。', 20, '建議 80-140 字。'),
  ('day-care', 'service_hero', 'hero_image', 'Hero 圖片', 'image', null, 5, '服務頁右側圖片，後台會協助裁切為服務頁 Hero 比例。'),
  ('day-care', 'service_hero', 'hero_title', 'Hero 標題', 'text', '日間照顧', 10, '只修改文字，不改版型。'),
  ('community', 'service_hero', 'hero_image', 'Hero 圖片', 'image', null, 5, '服務頁右側圖片，後台會協助裁切為服務頁 Hero 比例。'),
  ('community', 'service_hero', 'hero_title', 'Hero 標題', 'text', '社區據點', 10, '只修改文字，不改版型。'),
  ('nursing', 'service_hero', 'hero_image', 'Hero 圖片', 'image', null, 5, '服務頁右側圖片，後台會協助裁切為服務頁 Hero 比例。'),
  ('nursing', 'service_hero', 'hero_title', 'Hero 標題', 'text', '護理復能', 10, '只修改文字，不改版型。'),
  ('migrant-training', 'service_hero', 'hero_image', 'Hero 圖片', 'image', null, 5, '服務頁右側圖片，後台會協助裁切為服務頁 Hero 比例。'),
  ('migrant-training', 'service_hero', 'hero_title', 'Hero 標題', 'text', '移工培訓', 10, '只修改文字，不改版型。'),
  ('quality', 'service_hero', 'hero_image', 'Hero 圖片', 'image', null, 5, '服務頁右側圖片，後台會協助裁切為服務頁 Hero 比例。'),
  ('quality', 'service_hero', 'hero_title', 'Hero 標題', 'text', '教育品管', 10, '只修改文字，不改版型。'),
  ('talent', 'recruiting_hero', 'hero_image', 'Hero 圖片', 'image', null, 5, '招募頁 Hero 圖片，建議使用團隊形象照。'),
  ('talent', 'recruiting_hero', 'hero_title', '人才招募 Hero 標題', 'text', '加入歲悅，把照顧變成一份能長久發展的專業。', 10, '人才招募頁固定 Hero 文案。'),
  ('land', 'recruiting_hero', 'hero_image', 'Hero 圖片', 'image', null, 5, '招募頁 Hero 圖片，建議使用場域或空間形象照。'),
  ('land', 'recruiting_hero', 'hero_title', '土地招募 Hero 標題', 'text', '土地招募', 10, '土地招募頁固定 Hero 文案。'),
  ('investor-recruiting', 'recruiting_hero', 'hero_image', 'Hero 圖片', 'image', null, 5, '招募頁 Hero 圖片，建議使用企業簡報或合作形象照。'),
  ('investor-recruiting', 'recruiting_hero', 'hero_title', '投資人招募 Hero 標題', 'text', '投資人招募', 10, '投資人招募頁固定 Hero 文案。')
on conflict (page_slug, template_key, field_key) do nothing;
