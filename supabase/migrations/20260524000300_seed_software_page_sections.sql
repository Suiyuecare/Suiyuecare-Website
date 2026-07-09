-- Add CMS-managed sections for the software service page so it behaves like the
-- other service detail pages in the admin/content health workflow.

insert into public.page_sections (
  page_id,
  section_key,
  title,
  eyebrow,
  body,
  content_json,
  layout,
  sort_order,
  is_enabled,
  status,
  published_at
)
select
  p.id,
  seed.section_key,
  seed.title,
  seed.eyebrow,
  seed.body,
  seed.content_json,
  seed.layout,
  seed.sort_order,
  true,
  'published',
  now()
from public.pages p
cross join (
  values
    (
      'software-modules',
      '可客製化的營運系統',
      'System Modules',
      '會計、人資、電子公文交換、專案管理、PDF 工具，以及居家與日照業務系統，都能依照單位既有流程與權限分工調整。',
      jsonb_build_object(
        'image_url', 'assets/admin-recruit-02-operations-hires.jpg',
        'image_alt', '歲悅軟體系統營運儀表板示意',
        'image_usage', 'service_hero',
        'focal_point', 'center',
        'items', jsonb_build_array(
          jsonb_build_object('title', '會計與財務管理'),
          jsonb_build_object('title', '人資排班與員工資料'),
          jsonb_build_object('title', '電子公文交換'),
          jsonb_build_object('title', '專案與任務管理'),
          jsonb_build_object('title', 'PDF 文件工具'),
          jsonb_build_object('title', '居家與日照業務系統')
        )
      ),
      'media-left',
      10
    ),
    (
      'software-proof',
      '實際畫面佐證',
      'Product Screens',
      '後台可放置實際系統截圖與說明，讓合作單位看得懂系統能解決哪些日常行政與服務管理問題。',
      jsonb_build_object(
        'image_url', 'assets/homepage-batch/family-consultation-clear.jpg',
        'image_alt', '照顧服務系統畫面示意',
        'image_usage', 'card',
        'focal_point', 'center',
        'button_text', '洽詢系統客製',
        'button_href', '#contact',
        'items', jsonb_build_array(
          jsonb_build_object('title', '服務紀錄集中管理'),
          jsonb_build_object('title', '主管審核與追蹤'),
          jsonb_build_object('title', '文件下載與稽核留痕')
        )
      ),
      'media-right',
      20
    )
) as seed(section_key, title, eyebrow, body, content_json, layout, sort_order)
where p.slug = 'software'
on conflict (page_id, section_key) do update set
  title = excluded.title,
  eyebrow = excluded.eyebrow,
  body = excluded.body,
  content_json = excluded.content_json,
  layout = excluded.layout,
  sort_order = excluded.sort_order,
  is_enabled = true,
  status = 'published',
  published_at = coalesce(public.page_sections.published_at, now()),
  updated_at = now();
