-- Recruiting CMS: page settings, departments / tracks, opening cards, and application form data.

create table if not exists public.recruiting_pages (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null unique,
  eyebrow text,
  title text not null,
  subtitle text,
  body text,
  hero_image_id uuid references public.media(id) on delete set null,
  hero_image_url text,
  hero_badge text,
  hero_card_title text,
  primary_cta_text text,
  primary_cta_url text,
  secondary_cta_text text,
  secondary_cta_url text,
  form_recipient_email text,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  status public.cms_publish_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruiting_pages_slug_format check (page_slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint recruiting_pages_published_at_required check (status <> 'published' or published_at is not null)
);

create table if not exists public.recruiting_departments (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null references public.recruiting_pages(page_slug) on delete cascade,
  department_slug text not null,
  eyebrow text,
  title text not null,
  description text,
  image_id uuid references public.media(id) on delete set null,
  image_url text,
  highlights jsonb not null default '[]'::jsonb,
  gallery jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  status public.cms_publish_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_slug, department_slug),
  constraint recruiting_departments_slug_format check (department_slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint recruiting_departments_published_at_required check (status <> 'published' or published_at is not null)
);

create table if not exists public.recruiting_openings (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null references public.recruiting_pages(page_slug) on delete cascade,
  department_id uuid references public.recruiting_departments(id) on delete set null,
  opening_slug text not null,
  title text not null,
  subtitle text,
  summary text,
  employment_type text,
  location text,
  salary_text text,
  capacity_label text,
  image_id uuid references public.media(id) on delete set null,
  image_url text,
  duties jsonb not null default '[]'::jsonb,
  requirements jsonb not null default '[]'::jsonb,
  benefits jsonb not null default '[]'::jsonb,
  apply_button_text text not null default '申請應徵',
  apply_form_enabled boolean not null default true,
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
  unique (page_slug, opening_slug),
  constraint recruiting_openings_slug_format check (opening_slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint recruiting_openings_published_at_required check (status <> 'published' or published_at is not null)
);

create index if not exists recruiting_pages_public_idx on public.recruiting_pages(page_slug, status, is_enabled, sort_order);
create index if not exists recruiting_departments_public_idx on public.recruiting_departments(page_slug, status, is_enabled, sort_order);
create index if not exists recruiting_openings_public_idx on public.recruiting_openings(page_slug, department_id, status, is_enabled, sort_order);

drop trigger if exists set_recruiting_pages_updated_at on public.recruiting_pages;
create trigger set_recruiting_pages_updated_at
before update on public.recruiting_pages
for each row execute function public.set_updated_at();

drop trigger if exists set_recruiting_departments_updated_at on public.recruiting_departments;
create trigger set_recruiting_departments_updated_at
before update on public.recruiting_departments
for each row execute function public.set_updated_at();

drop trigger if exists set_recruiting_openings_updated_at on public.recruiting_openings;
create trigger set_recruiting_openings_updated_at
before update on public.recruiting_openings
for each row execute function public.set_updated_at();

alter table public.recruiting_pages enable row level security;
alter table public.recruiting_departments enable row level security;
alter table public.recruiting_openings enable row level security;

drop policy if exists "Published recruiting pages are public" on public.recruiting_pages;
drop policy if exists "CMS users can manage recruiting pages" on public.recruiting_pages;
drop policy if exists "Published recruiting departments are public" on public.recruiting_departments;
drop policy if exists "CMS users can manage recruiting departments" on public.recruiting_departments;
drop policy if exists "Published recruiting openings are public" on public.recruiting_openings;
drop policy if exists "CMS users can manage recruiting openings" on public.recruiting_openings;

create policy "Published recruiting pages are public"
on public.recruiting_pages
for select
to anon, authenticated
using (is_enabled = true and status = 'published' and published_at <= now());

create policy "CMS users can manage recruiting pages"
on public.recruiting_pages
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

create policy "Published recruiting departments are public"
on public.recruiting_departments
for select
to anon, authenticated
using (is_enabled = true and status = 'published' and published_at <= now());

create policy "CMS users can manage recruiting departments"
on public.recruiting_departments
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

create policy "Published recruiting openings are public"
on public.recruiting_openings
for select
to anon, authenticated
using (is_enabled = true and status = 'published' and published_at <= now());

create policy "CMS users can manage recruiting openings"
on public.recruiting_openings
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

grant select on public.recruiting_pages to anon, authenticated;
grant select on public.recruiting_departments to anon, authenticated;
grant select on public.recruiting_openings to anon, authenticated;
grant select, insert, update, delete on public.recruiting_pages to authenticated;
grant select, insert, update, delete on public.recruiting_departments to authenticated;
grant select, insert, update, delete on public.recruiting_openings to authenticated;

insert into public.media (bucket, storage_path, public_url, file_name, mime_type, alt_text, visibility, is_enabled, image_usage, focal_point)
values
  ('site-assets', 'assets/recruit-home-care-worker-fast.jpg', '/assets/recruit-home-care-worker-fast.jpg', 'recruit-home-care-worker-fast.jpg', 'image/jpeg', '居家照顧服務員招募形象照', 'public', true, 'card', 'center'),
  ('site-assets', 'assets/recruit-home-care-supervisor-fast.jpg', '/assets/recruit-home-care-supervisor-fast.jpg', 'recruit-home-care-supervisor-fast.jpg', 'image/jpeg', '居家服務督導招募形象照', 'public', true, 'card', 'center'),
  ('site-assets', 'assets/daycare-recruit-02-exercise-clear.jpg', '/assets/daycare-recruit-02-exercise-clear.jpg', 'daycare-recruit-02-exercise-clear.jpg', 'image/jpeg', '日照照顧服務員帶領活動招募形象照', 'public', true, 'card', 'center'),
  ('site-assets', 'assets/homepage-batch/service-card-05-migrant-training-clear.jpg', '/assets/homepage-batch/service-card-05-migrant-training-clear.jpg', 'service-card-05-migrant-training-clear.jpg', 'image/jpeg', '移工培訓課堂招募形象照', 'public', true, 'card', 'center'),
  ('site-assets', 'assets/quality-recruit-04-quality-meeting-clear.jpg', '/assets/quality-recruit-04-quality-meeting-clear.jpg', 'quality-recruit-04-quality-meeting-clear.jpg', 'image/jpeg', '教育品管品質會議招募形象照', 'public', true, 'card', 'center'),
  ('site-assets', 'assets/admin-recruit-05-meeting-clear.jpg', '/assets/admin-recruit-05-meeting-clear.jpg', 'admin-recruit-05-meeting-clear.jpg', 'image/jpeg', '行政部跨部門會議招募形象照', 'public', true, 'card', 'center'),
  ('site-assets', 'assets/homepage-batch/04-admin-team-office-fast.jpg', '/assets/homepage-batch/04-admin-team-office-fast.jpg', '04-admin-team-office-fast.jpg', 'image/jpeg', '歲悅長照營運與合作會議', 'public', true, 'service_hero', 'center'),
  ('site-assets', 'assets/homepage-batch/16-taipei-service-office-fast.jpg', '/assets/homepage-batch/16-taipei-service-office-fast.jpg', '16-taipei-service-office-fast.jpg', 'image/jpeg', '長照服務場域與辦公空間', 'public', true, 'service_hero', 'center')
on conflict (bucket, storage_path) do update
set public_url = excluded.public_url,
    alt_text = excluded.alt_text,
    image_usage = excluded.image_usage,
    focal_point = excluded.focal_point,
    is_enabled = true,
    visibility = 'public',
    updated_at = now();

insert into public.recruiting_pages (
  page_slug, eyebrow, title, subtitle, body, hero_image_id, hero_image_url, hero_badge, hero_card_title,
  primary_cta_text, primary_cta_url, secondary_cta_text, secondary_cta_url, form_recipient_email,
  metadata, sort_order, is_enabled, status, published_at
)
values
  (
    'talent', 'Talent Recruiting', '人才招募', '加入歲悅，把照顧變成一份能長久發展的專業。',
    '歲悅需要願意理解家庭、支持長輩，也願意在制度中成長的夥伴。後台可以管理部門、職缺卡片、圖片與應徵表單。',
    (select id from public.media where storage_path = 'assets/recruit-home-care-worker-fast.jpg'), '/assets/recruit-home-care-worker-fast.jpg',
    'We want you', '讓照顧專業被看見，也讓夥伴有路可以走。',
    '查看職缺', '#career-openings', '聯絡我們', '#contact', 'generalaffairs@suiyuecare.com',
    '{"layout":"department_tabs","form_type":"recruiting"}'::jsonb, 10, true, 'published', now()
  ),
  (
    'land', 'Land Partnership', '土地招募', '尋找適合日照、社區據點與複合式長照服務的場域。',
    '如果你有土地、建物、閒置空間或區域合作機會，歲悅可協助評估基地條件、服務半徑與合作模式。',
    (select id from public.media where storage_path = 'assets/homepage-batch/16-taipei-service-office-fast.jpg'), '/assets/homepage-batch/16-taipei-service-office-fast.jpg',
    'Site Partnership', '把合適的空間，變成地方真正用得到的照顧服務。',
    '提交場域資料', '#recruiting-openings', '聯絡我們', '#contact', 'generalaffairs@suiyuecare.com',
    '{"layout":"opportunity_cards","form_type":"land"}'::jsonb, 20, true, 'published', now()
  ),
  (
    'investor-recruiting', 'Investor Recruiting', '投資人招募', '尋找理解長照產業、認同長期服務網絡的投資夥伴。',
    '歲悅長照集團以北北桃為核心，整合居家、日照、社區據點、護理復能、培訓與品管，建立可治理、可複製的照顧網絡。',
    (select id from public.media where storage_path = 'assets/homepage-batch/04-admin-team-office-fast.jpg'), '/assets/homepage-batch/04-admin-team-office-fast.jpg',
    'Suiyuecare Growth', '把長照需求，變成可治理、可複製、可長期信任的服務網絡。',
    '預約投資洽談', '#recruiting-openings', '投資人專區', '#investors', 'generalaffairs@suiyuecare.com',
    '{"layout":"opportunity_cards","form_type":"investor"}'::jsonb, 30, true, 'published', now()
  )
on conflict (page_slug) do update
set eyebrow = excluded.eyebrow,
    title = excluded.title,
    subtitle = excluded.subtitle,
    body = excluded.body,
    hero_image_url = excluded.hero_image_url,
    hero_badge = excluded.hero_badge,
    hero_card_title = excluded.hero_card_title,
    primary_cta_text = excluded.primary_cta_text,
    primary_cta_url = excluded.primary_cta_url,
    secondary_cta_text = excluded.secondary_cta_text,
    secondary_cta_url = excluded.secondary_cta_url,
    form_recipient_email = excluded.form_recipient_email,
    metadata = excluded.metadata,
    is_enabled = true,
    status = 'published',
    published_at = now(),
    updated_at = now();

insert into public.recruiting_departments (
  page_slug, department_slug, eyebrow, title, description, image_id, image_url, highlights, gallery, metadata, sort_order, is_enabled, status, published_at
)
values
  ('talent', 'home-care-team', 'Home Care Team', '居家照顧部門', '最靠近家庭的一線服務，把身體照顧、生活支持、家屬溝通與服務紀錄串成穩定流程。', (select id from public.media where storage_path = 'assets/recruit-home-care-worker-fast.jpg'), '/assets/recruit-home-care-worker-fast.jpg', '["到宅服務","督導陪跑","家屬溝通"]'::jsonb, '[{"image":"/assets/recruit-home-care-worker-fast.jpg","caption":"居家照顧服務員到宅服務"},{"image":"/assets/recruit-home-care-supervisor-fast.jpg","caption":"督導陪同討論照顧計畫"}]'::jsonb, '{}'::jsonb, 10, true, 'published', now()),
  ('talent', 'day-care-team', 'Day Care Team', '日間照顧部', '讓長輩白天有安全、有活動、有同伴，也讓家庭有喘息空間。', (select id from public.media where storage_path = 'assets/daycare-recruit-02-exercise-clear.jpg'), '/assets/daycare-recruit-02-exercise-clear.jpg', '["活動陪伴","餐食照顧","日常紀錄"]'::jsonb, '[{"image":"/assets/daycare-recruit-02-exercise-clear.jpg","caption":"帶領團體活動"},{"image":"/assets/daycare-detail-02-meal-fast.jpg","caption":"餐食與營養支持"}]'::jsonb, '{}'::jsonb, 20, true, 'published', now()),
  ('talent', 'migrant-team', 'Migrant Training', '移工培訓部', '把家庭照顧技能整理成可聽懂、可練習、回家能執行的課程。', (select id from public.media where storage_path = 'assets/homepage-batch/service-card-05-migrant-training-clear.jpg'), '/assets/homepage-batch/service-card-05-migrant-training-clear.jpg', '["情境課程","安全移位","家庭溝通"]'::jsonb, '[{"image":"/assets/homepage-batch/service-card-05-migrant-training-clear.jpg","caption":"移工培訓課堂"},{"image":"/assets/migrant-detail-02-transfer-fast.jpg","caption":"安全移位練習"}]'::jsonb, '{}'::jsonb, 30, true, 'published', now()),
  ('talent', 'quality-team', 'Teaching Quality', '教學品管部', '把前線照顧經驗變成可學習、可檢核、可改善的制度。', (select id from public.media where storage_path = 'assets/quality-recruit-04-quality-meeting-clear.jpg'), '/assets/quality-recruit-04-quality-meeting-clear.jpg', '["教材設計","紀錄檢核","品質改善"]'::jsonb, '[{"image":"/assets/quality-recruit-04-quality-meeting-clear.jpg","caption":"品質改善會議"},{"image":"/assets/quality-detail-03-audit-fast.jpg","caption":"服務紀錄檢核"}]'::jsonb, '{}'::jsonb, 40, true, 'published', now()),
  ('talent', 'admin-team', 'Administration', '行政部', '支援招募、營運調度、財務行政、客服總務與跨部門專案。', (select id from public.media where storage_path = 'assets/admin-recruit-05-meeting-clear.jpg'), '/assets/admin-recruit-05-meeting-clear.jpg', '["營運支援","資料管理","跨部門協作"]'::jsonb, '[{"image":"/assets/admin-recruit-05-meeting-clear.jpg","caption":"跨部門會議"},{"image":"/assets/admin-recruit-02-operations-hires.jpg","caption":"營運調度支援"}]'::jsonb, '{}'::jsonb, 50, true, 'published', now()),
  ('land', 'site-evaluation', 'Site Evaluation', '場域條件評估', '針對土地、建物、樓層、坪數、動線與周邊服務需求進行初步評估。', (select id from public.media where storage_path = 'assets/homepage-batch/16-taipei-service-office-fast.jpg'), '/assets/homepage-batch/16-taipei-service-office-fast.jpg', '["基地條件","服務半徑","合作模式"]'::jsonb, '[]'::jsonb, '{}'::jsonb, 10, true, 'published', now()),
  ('investor-recruiting', 'investment-partnership', 'Investment Partnership', '投資合作洽談', '提供公司簡介、展店模型、營運進度與合作架構說明。', (select id from public.media where storage_path = 'assets/homepage-batch/04-admin-team-office-fast.jpg'), '/assets/homepage-batch/04-admin-team-office-fast.jpg', '["展店模型","營運數據","合作治理"]'::jsonb, '[]'::jsonb, '{}'::jsonb, 10, true, 'published', now())
on conflict (page_slug, department_slug) do update
set eyebrow = excluded.eyebrow,
    title = excluded.title,
    description = excluded.description,
    image_url = excluded.image_url,
    highlights = excluded.highlights,
    gallery = excluded.gallery,
    is_enabled = true,
    status = 'published',
    published_at = now(),
    updated_at = now();

insert into public.recruiting_openings (
  page_slug, department_id, opening_slug, title, subtitle, summary, employment_type, location, salary_text, capacity_label,
  image_id, image_url, duties, requirements, benefits, apply_button_text, apply_form_enabled,
  metadata, sort_order, is_featured, is_enabled, status, published_at
)
values
  ('talent', (select id from public.recruiting_departments where page_slug = 'talent' and department_slug = 'home-care-team'), 'home-care-worker', '居家照顧服務員', '居家照顧部門', '到宅陪伴長輩，提供身體照顧、生活支持與照顧紀錄。', '全職 / 兼職', '臺北、新北、桃園', '面議，依服務時數與證照條件', '持續招募', (select id from public.media where storage_path = 'assets/recruit-home-care-worker-fast.jpg'), '/assets/recruit-home-care-worker-fast.jpg', '["身體照顧與生活照顧","服務紀錄與異常回報","陪同外出與日常安全觀察"]'::jsonb, '["具照顧服務員訓練結業證明尤佳","願意溝通、守時、重視服務紀錄","可配合服務區域排班"]'::jsonb, '["完整新人訓練","督導支持","彈性排班"]'::jsonb, '申請應徵', true, '{}'::jsonb, 10, true, true, 'published', now()),
  ('talent', (select id from public.recruiting_departments where page_slug = 'talent' and department_slug = 'home-care-team'), 'home-care-supervisor', '居家服務督導', '居家照顧部門', '協助服務媒合、品質追蹤、家屬溝通與照顧計畫管理。', '全職', '臺北、新北、桃園', '面議', '2 名', (select id from public.media where storage_path = 'assets/recruit-home-care-supervisor-fast.jpg'), '/assets/recruit-home-care-supervisor-fast.jpg', '["個案訪視與服務品質追蹤","照服員支持與排班協調","家屬溝通與異常事件處理"]'::jsonb, '["長照或社福相關背景佳","具溝通協調與紀錄能力","能理解家庭照顧壓力"]'::jsonb, '["督導培訓","升遷路徑","跨部門合作"]'::jsonb, '申請應徵', true, '{}'::jsonb, 20, true, true, 'published', now()),
  ('talent', (select id from public.recruiting_departments where page_slug = 'talent' and department_slug = 'day-care-team'), 'day-care-caregiver', '日照照顧服務員', '日間照顧部', '帶領活動、協助餐食、陪伴長輩並完成日常照顧紀錄。', '全職', '臺北 / 新北據點', '面議', '3 名', (select id from public.media where storage_path = 'assets/daycare-recruit-02-exercise-clear.jpg'), '/assets/daycare-recruit-02-exercise-clear.jpg', '["日照活動陪伴與安全觀察","餐食、如廁與日常照顧協助","服務紀錄與交班"]'::jsonb, '["喜歡與長輩互動","具照服員訓練證明尤佳","能配合日照中心作息"]'::jsonb, '["規律班表","團隊支持","課程訓練"]'::jsonb, '申請應徵', true, '{}'::jsonb, 30, false, true, 'published', now()),
  ('talent', (select id from public.recruiting_departments where page_slug = 'talent' and department_slug = 'migrant-team'), 'migrant-training-specialist', '移工培訓講師', '移工培訓部', '設計照顧技能課程，帶領移工與家庭照顧者進行情境練習。', '兼職 / 專案', '臺北 / 線上', '依課程專案', '合作招募', (select id from public.media where storage_path = 'assets/homepage-batch/service-card-05-migrant-training-clear.jpg'), '/assets/homepage-batch/service-card-05-migrant-training-clear.jpg', '["照顧技能教學與實作示範","教材整理與課後回饋","家庭照顧情境諮詢"]'::jsonb, '["具照顧、護理、復能或教學背景","能把專業說成好懂的語言","重視安全與實作"]'::jsonb, '["課程合作","教材共創","專案彈性"]'::jsonb, '申請應徵', true, '{}'::jsonb, 40, false, true, 'published', now()),
  ('talent', (select id from public.recruiting_departments where page_slug = 'talent' and department_slug = 'quality-team'), 'quality-education-specialist', '教育品管專員', '教學品管部', '協助教材、訓練、服務紀錄檢核與品質改善專案。', '全職', '臺北辦公室', '面議', '1-2 名', (select id from public.media where storage_path = 'assets/quality-recruit-04-quality-meeting-clear.jpg'), '/assets/quality-recruit-04-quality-meeting-clear.jpg', '["教材與檢核表整理","服務紀錄與回饋資料分析","協助內部訓練與品質改善會議"]'::jsonb, '["細心、邏輯清楚、重視文件品質","具長照、護理、教育或品管經驗佳","能跨部門溝通"]'::jsonb, '["專業訓練","制度參與","跨部門成長"]'::jsonb, '申請應徵', true, '{}'::jsonb, 50, false, true, 'published', now()),
  ('talent', (select id from public.recruiting_departments where page_slug = 'talent' and department_slug = 'admin-team'), 'admin-operations-specialist', '營運行政專員', '行政部', '支援營運資料、客服總務、表單整理與跨部門行政流程。', '全職', '臺北辦公室', '面議', '1-2 名', (select id from public.media where storage_path = 'assets/admin-recruit-05-meeting-clear.jpg'), '/assets/admin-recruit-05-meeting-clear.jpg', '["營運資料與表單整理","客服與總務支援","跨部門會議與專案追蹤"]'::jsonb, '["熟悉文書與表格工具","溝通清楚、細心負責","願意理解長照服務流程"]'::jsonb, '["穩定職涯","行政訓練","跨部門視野"]'::jsonb, '申請應徵', true, '{}'::jsonb, 60, false, true, 'published', now()),
  ('land', (select id from public.recruiting_departments where page_slug = 'land' and department_slug = 'site-evaluation'), 'daycare-site', '日間照顧中心場域', '土地招募', '適合規劃日間照顧、共餐活動與長者活動空間的建物或樓層。', '合作洽談', '北北桃優先', '依場域條件洽談', '開放提案', (select id from public.media where storage_path = 'assets/homepage-batch/16-taipei-service-office-fast.jpg'), '/assets/homepage-batch/16-taipei-service-office-fast.jpg', '["提供基地基本資料與照片","協助初步評估坪數、動線與交通","討論租賃、合作或共同開發模式"]'::jsonb, '["北北桃生活圈優先","交通便利、出入安全","可配合長照法規評估"]'::jsonb, '["專人初評","合作模式討論","區域需求分析"]'::jsonb, '提交場域資料', true, '{"form_type":"land"}'::jsonb, 10, true, true, 'published', now()),
  ('land', (select id from public.recruiting_departments where page_slug = 'land' and department_slug = 'site-evaluation'), 'community-hub-site', '社區據點合作空間', '土地招募', '適合健康促進、共餐、課程與社區服務的合作場域。', '合作洽談', '臺北、新北、桃園', '依合作模式洽談', '開放提案', (select id from public.media where storage_path = 'assets/homepage-batch/12-community-health-class-hires.jpg'), '/assets/homepage-batch/12-community-health-class-hires.jpg', '["盤點空間使用情境","規劃社區服務與課程活動","協助串接地方資源"]'::jsonb, '["鄰近社區或長者生活圈","可承接活動與課程","具合作意願"]'::jsonb, '["活動規劃","品牌合作","服務導入"]'::jsonb, '提交合作空間', true, '{"form_type":"land"}'::jsonb, 20, false, true, 'published', now()),
  ('investor-recruiting', (select id from public.recruiting_departments where page_slug = 'investor-recruiting' and department_slug = 'investment-partnership'), 'strategic-investor', '策略投資夥伴', '投資人招募', '適合認同長照長期需求、願意參與服務網絡擴張的投資夥伴。', '投資洽談', '不限地區', '依投資架構洽談', '預約洽談', (select id from public.media where storage_path = 'assets/homepage-batch/04-admin-team-office-fast.jpg'), '/assets/homepage-batch/04-admin-team-office-fast.jpg', '["了解投資人背景與合作期待","提供展店模型與營運進度說明","討論投資架構與治理安排"]'::jsonb, '["認同長照產業長期價值","理解服務業擴張與品質管理需求","可進入正式資料說明流程"]'::jsonb, '["公司簡介","展店模型","治理與風險說明"]'::jsonb, '預約投資洽談', true, '{"form_type":"investor"}'::jsonb, 10, true, true, 'published', now()),
  ('investor-recruiting', (select id from public.recruiting_departments where page_slug = 'investor-recruiting' and department_slug = 'investment-partnership'), 'corporate-partner', '企業策略合作', '投資人招募', '適合想與歲悅共同推動照顧服務、員工照顧福利或區域服務合作的企業。', '策略合作', '北北桃優先', '依合作內容洽談', '開放洽談', (select id from public.media where storage_path = 'assets/homepage-batch/family-consultation-clear.jpg'), '/assets/homepage-batch/family-consultation-clear.jpg', '["盤點企業合作需求","規劃員工家庭照顧支持或場域合作","建立合作成效追蹤"]'::jsonb, '["認同長照服務與家庭支持","具企業資源或區域合作機會","可配合專案討論"]'::jsonb, '["合作企劃","品牌曝光","服務導入"]'::jsonb, '洽談企業合作', true, '{"form_type":"investor"}'::jsonb, 20, false, true, 'published', now())
on conflict (page_slug, opening_slug) do update
set title = excluded.title,
    subtitle = excluded.subtitle,
    summary = excluded.summary,
    employment_type = excluded.employment_type,
    location = excluded.location,
    salary_text = excluded.salary_text,
    capacity_label = excluded.capacity_label,
    image_url = excluded.image_url,
    duties = excluded.duties,
    requirements = excluded.requirements,
    benefits = excluded.benefits,
    apply_button_text = excluded.apply_button_text,
    apply_form_enabled = excluded.apply_form_enabled,
    metadata = excluded.metadata,
    is_featured = excluded.is_featured,
    is_enabled = true,
    status = 'published',
    published_at = now(),
    updated_at = now();
