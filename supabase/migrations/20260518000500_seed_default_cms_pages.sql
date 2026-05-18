-- Seed page records so the CMS page list has editable entries.
-- These rows do not create page_sections, so they do not override the current
-- static homepage until editors intentionally add/publish sections.

insert into public.pages (slug, title, menu_label, sort_order, is_enabled, status, published_at, seo_title, seo_description, content_json)
values
  ('home', '首頁', '首頁', 10, true, 'published', now(), '歲悅長照集團｜Suiyuecare Corps.', '歲悅長照集團整合居家照顧、日間照顧、社區據點、護理復能、移工培訓與教育品管服務。', '{}'::jsonb),
  ('about', '關於歲悅', '關於歲悅', 20, true, 'published', now(), '關於歲悅｜歲悅長照集團', '認識歲悅長照集團的品牌理念、照顧系統與服務精神。', '{}'::jsonb),
  ('milestones', '大記事', '大記事', 30, true, 'published', now(), '大記事｜歲悅長照集團', '歲悅長照集團的重要發展歷程與里程碑。', '{}'::jsonb),
  ('home-care', '居家照顧', '居家照顧', 40, true, 'published', now(), '居家照顧｜歲悅長照集團', '提供到宅照顧、生活支持與家屬安心回報。', '{}'::jsonb),
  ('day-care', '日間照顧', '日間照顧', 50, true, 'published', now(), '日間照顧｜歲悅長照集團', '日間照顧中心服務、活動安排與復能支持。', '{}'::jsonb),
  ('community', '社區據點', '社區據點', 60, true, 'published', now(), '社區健康促進、共餐、活動與照顧支持據點。', '{}'::jsonb),
  ('nursing', '護理復能', '護理復能', 70, true, 'published', now(), '護理復能｜歲悅長照集團', '護理觀察、復能訓練與家庭照顧建議。', '{}'::jsonb),
  ('migrant-training', '移工培訓', '移工培訓', 80, true, 'published', now(), '移工培訓｜歲悅長照集團', '移工照顧技能、家庭溝通與安全照顧培訓。', '{}'::jsonb),
  ('quality', '教育品管', '教育品管', 90, true, 'published', now(), '教育品管｜歲悅長照集團', '照顧服務教育訓練、品質管理與服務督導制度。', '{}'::jsonb),
  ('talent', '人才招募', '人才招募', 100, true, 'published', now(), '人才招募｜歲悅長照集團', '加入歲悅長照集團，了解部門職缺、福利制度與升遷發展。', '{}'::jsonb),
  ('health', '健康3.0', '健康3.0', 110, true, 'published', now(), '健康3.0｜歲悅長照集團', '長照知識、照顧技巧、健康文章與照顧者支持內容。', '{}'::jsonb),
  ('courses', '課程報名', '課程報名', 120, true, 'published', now(), '課程報名｜歲悅長照集團', '照顧課程、訓練活動與線上報名資訊。', '{}'::jsonb),
  ('investors', '投資人專區', '投資人專區', 130, true, 'published', now(), '投資人專區｜歲悅長照集團', '歲悅長照集團投資人資訊、最新動態與公司發展資訊。', '{}'::jsonb),
  ('ir-finance', '財務資訊', '財務資訊', 140, true, 'published', now(), '財務資訊｜歲悅長照集團', '每月營收、財務分析、季度財報與股東會年報。', '{}'::jsonb),
  ('ir-governance', '公司治理', '公司治理', 150, true, 'published', now(), '公司治理｜歲悅長照集團', '公司治理運作、重要管理階層、內部稽核與風險管理。', '{}'::jsonb),
  ('ir-shareholders', '股東專區', '股東專區', 160, true, 'published', now(), '股東專區｜歲悅長照集團', '股務資訊、股東會、法說會與常見問答。', '{}'::jsonb),
  ('contact', '聯絡我們', '聯絡我們', 170, true, 'published', now(), '聯絡我們｜歲悅長照集團', '聯絡歲悅長照集團，預約服務諮詢、合作洽談與課程詢問。', '{}'::jsonb)
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
  updated_at = now();
