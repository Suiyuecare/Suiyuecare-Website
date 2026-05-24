-- Add the software system service page and homepage/menu entries.

insert into public.pages (
  slug,
  title,
  menu_label,
  sort_order,
  is_enabled,
  status,
  published_at,
  seo_title,
  seo_description,
  content_json
)
values (
  'software',
  '軟體系統',
  '軟體系統',
  95,
  true,
  'published',
  now(),
  '軟體系統｜歲悅長照集團',
  '歲悅提供可客製化軟體系統，包含會計、人資、電子公文交換、專案管理、PDF 工具，以及居家與日照業務系統。',
  '{"cms_mode": false, "static_renderer": "software"}'::jsonb
)
on conflict (slug) do update
set
  title = excluded.title,
  menu_label = excluded.menu_label,
  sort_order = excluded.sort_order,
  is_enabled = excluded.is_enabled,
  status = excluded.status,
  published_at = coalesce(public.pages.published_at, excluded.published_at),
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  content_json = public.pages.content_json || excluded.content_json,
  updated_at = now();

delete from public.content_modules
where target_slug = 'home'
  and module_key = 'service_item'
  and item_key = 'software';

insert into public.content_modules (
  target_slug,
  module_key,
  item_key,
  title,
  subtitle,
  eyebrow,
  body,
  link_url,
  badge_label,
  sort_order,
  is_featured,
  is_enabled,
  status,
  published_at,
  metadata
)
values (
  'home',
  'service_item',
  'software',
  '軟體系統',
  null,
  'Services',
  '會計、人資、公文、專案、PDF 與長照業務系統。',
  '#software',
  '07',
  70,
  false,
  true,
  'published',
  now(),
  '{"image_url":"assets/admin-recruit-02-operations.png","image_alt":"軟體系統營運儀表板情境"}'::jsonb
);

update public.site_settings
set
  value_json = '[
    {"type":"group","label":"服務項目","items":[
      {"label":"關於歲悅","href":"#about"},
      {"label":"大記事","href":"#milestones"},
      {"label":"居家照顧","href":"#home-care"},
      {"label":"日間照顧","href":"#day-care"},
      {"label":"社區據點","href":"#community"},
      {"label":"護理復能","href":"#nursing"},
      {"label":"移工培訓","href":"#migrant-training"},
      {"label":"教育品管","href":"#quality"},
      {"label":"軟體系統","href":"#software"}
    ]},
    {"type":"group","label":"招募與合作","items":[
      {"label":"人才招募","href":"#talent"},
      {"label":"土地招募","href":"#land"},
      {"label":"投資人招募","href":"#investor-recruiting"}
    ]},
    {"type":"link","label":"健康3.0","href":"#health"},
    {"type":"link","label":"課程報名","href":"#courses"},
    {"type":"group","label":"投資人專區","items":[
      {"label":"投資人首頁","href":"#investors"},
      {"label":"財務資訊","href":"#ir-finance"},
      {"label":"公司治理","href":"#ir-governance"},
      {"label":"股東專區","href":"#ir-shareholders"}
    ]},
    {"type":"cta","label":"聯絡我們","href":"#contact"}
  ]'::jsonb,
  updated_at = now()
where setting_key = 'primary_nav';

update public.site_settings
set
  value_json = '[
    {"title":"營業項目","items":[
      {"label":"居家照顧","href":"#home-care"},
      {"label":"日間照顧","href":"#day-care"},
      {"label":"社區據點","href":"#community"},
      {"label":"護理復能","href":"#nursing"},
      {"label":"軟體系統","href":"#software"}
    ]},
    {"title":"合作入口","items":[
      {"label":"人才招募","href":"#talent"},
      {"label":"土地招募","href":"#land"},
      {"label":"投資人招募","href":"#investor-recruiting"},
      {"label":"教育品管","href":"#quality"}
    ]},
    {"title":"資訊內容","items":[
      {"label":"健康3.0","href":"#health"},
      {"label":"課程報名","href":"#courses"},
      {"label":"投資人專區","href":"#investors"},
      {"label":"財務資訊","href":"#ir-finance"},
      {"label":"聯絡我們","href":"#contact"}
    ]}
  ]'::jsonb,
  updated_at = now()
where setting_key = 'footer_columns';
