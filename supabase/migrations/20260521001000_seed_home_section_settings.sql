-- Homepage fixed section settings.
-- These rows control section headings, helper copy, links, and safe visibility without changing layout code.

insert into public.content_modules (
  target_slug, module_key, item_key, title, subtitle, eyebrow, body, link_text, link_url,
  metadata, sort_order, is_featured, is_enabled, status, published_at
)
select * from (
  values
    ('home', 'section_setting', 'updates', '最新動態', 'NEWS 與得標紀錄會在此區塊以 tab 呈現。', 'Updates', null, null, null, '{"selector":"[data-cms-section=\"updates\"]"}'::jsonb, 10, false, true, 'published'::public.cms_publish_status, now()),
    ('home', 'section_setting', 'care-system', '我們相信，真正的照顧，是讓人重新感覺自己仍被生活溫柔接住。', null, 'Care Philosophy', '歲悅長照集團不只提供服務，而是用專業、尊嚴、陪伴與信任，承接家庭在照顧路上的不安。每一次服務都從理解人開始，讓長輩保有選擇、家屬保有喘息，照顧者也能被制度支持。', null, null, '{"selector":"[data-cms-section=\"care-system\"]"}'::jsonb, 20, false, true, 'published'::public.cms_publish_status, now()),
    ('home', 'section_setting', 'service-scene', '在日照中心，我們把活動設計成長輩願意期待的日常。', null, 'Service Scene', null, null, null, '{"selector":"[data-cms-section=\"service-scene\"]"}'::jsonb, 30, false, true, 'published'::public.cms_publish_status, now()),
    ('home', 'section_setting', 'video', '單位影片', null, 'Video', null, null, null, '{"selector":"[data-cms-section=\"video\"]"}'::jsonb, 40, false, true, 'published'::public.cms_publish_status, now()),
    ('home', 'section_setting', 'network', '單位分佈', null, 'Care Network', '用居家站、日照中心、社區據點與護理復能團隊，形成多點支援的照顧網絡。', null, null, '{"selector":"[data-cms-section=\"network\"]"}'::jsonb, 50, false, true, 'published'::public.cms_publish_status, now()),
    ('home', 'section_setting', 'services', '營業項目', null, 'Services', null, null, null, '{"selector":"[data-cms-section=\"services\"]"}'::jsonb, 60, false, true, 'published'::public.cms_publish_status, now()),
    ('home', 'section_setting', 'care-stories', '真實照顧情境', '家屬最真實的安心，來自照顧被看見、被回報，也有人一起承擔。', 'Care Stories', null, null, null, '{"selector":"[data-cms-section=\"care-stories\"]"}'::jsonb, 70, false, true, 'published'::public.cms_publish_status, now()),
    ('home', 'section_setting', 'home-health', '照顧知識，也要讓家屬一看就懂。', null, 'Health 3.0', null, null, null, '{"selector":"[data-cms-section=\"home-health\"]"}'::jsonb, 80, false, true, 'published'::public.cms_publish_status, now()),
    ('home', 'section_setting', 'master-talk', '名人講堂', null, 'Master Talk', null, null, null, '{"selector":".celebrity-head"}'::jsonb, 90, false, true, 'published'::public.cms_publish_status, now()),
    ('home', 'section_setting', 'contact', '聯絡我們', '不論是服務諮詢、課程報名、人才合作或投資洽談，都可以從這裡開始。', 'Contact', null, null, null, '{"selector":"[data-cms-section=\"contact\"]"}'::jsonb, 100, false, true, 'published'::public.cms_publish_status, now()),
    ('home', 'section_setting', 'partners', '合作單位', null, 'Partners', null, null, null, '{"selector":".partners-strip"}'::jsonb, 110, false, true, 'published'::public.cms_publish_status, now())
) as seed(target_slug, module_key, item_key, title, subtitle, eyebrow, body, link_text, link_url, metadata, sort_order, is_featured, is_enabled, status, published_at)
where not exists (
  select 1
  from public.content_modules existing
  where existing.target_slug = seed.target_slug
    and existing.module_key = seed.module_key
    and existing.item_key = seed.item_key
);
