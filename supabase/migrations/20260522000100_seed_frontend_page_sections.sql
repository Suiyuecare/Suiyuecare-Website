-- Seed page_sections so the page editor is not empty. These rows mirror the current frontend copy
-- while keeping the visual layout controlled by the frontend templates/CSS.
with section_seed(slug, section_key, title, subtitle, eyebrow, body, layout, sort_order, content_json) as (
  values
    ('home','hero','把長照變成家人看得懂、也放得下心的日常系統。','照顧就像去超商，買牛奶一樣簡單。','Professional Care Network','歲悅長照集團整合居家、日照、社區、復能、培訓與品質管理，讓每一次照顧都能被安排、被追蹤，也被溫柔地完成。','home_hero',10,'{"background_image_url":"assets/hero-care-hero-fast.jpg","button_text":"預約諮詢","button_href":"#contact","secondary_button_text":"觀看照顧系統","secondary_button_href":"#care-system"}'::jsonb),
    ('home','updates','最新動態',null,'Updates','最新消息、得標紀錄與員工招募可以由後台首頁模組管理。','home_updates',20,'{"managed_by":"content_modules","module_keys":["news","awards","recruit"]}'::jsonb),
    ('home','care-system','我們相信，真正的照顧，是讓人重新感覺自己仍被生活溫柔接住。',null,'Care Philosophy','歲悅長照集團不只提供服務，而是用專業、尊嚴、陪伴與信任，承接家庭在照顧路上的不安。每一次服務都從理解人開始，讓長輩保有選擇、家屬保有喘息，照顧者也能被制度支持。','home_philosophy',30,'{"image_url":"assets/homepage-batch/02-daycare-group-exercise-hires.jpg"}'::jsonb),
    ('home','video','單位影片',null,'Video','單位影片連結可由後台首頁模組管理。','home_video',40,'{"managed_by":"content_modules","module_key":"video"}'::jsonb),
    ('home','network','單位分佈',null,'Care Network','用居家站、日照中心、社區據點與護理復能團隊，形成多點支援的照顧網絡。','home_network',50,'{"managed_by":"content_modules","module_key":"location"}'::jsonb),
    ('home','services','營業項目',null,'Services','八大服務項目以固定版型呈現，文字、圖片、卡片、流程、FAQ 由服務頁模板欄位管理。','home_services',60,'{"managed_by":"page_template_fields","button_text":"我需要服務","button_href":"#contact"}'::jsonb),
    ('home','care-stories','真實照顧情境',null,'Care Stories','家屬最真實的安心，來自照顧被看見、被回報，也有人一起承擔。','home_stories',70,'{"managed_by":"care_stories"}'::jsonb),
    ('home','home-health','照顧知識，也要讓家屬一看就懂。',null,'Health 3.0','健康3.0文章、影片與短影片由文章資料庫與分類管理。','home_health',80,'{"managed_by":"articles","button_text":"進入健康3.0","button_href":"/health"}'::jsonb),
    ('home','contact','先留下需求，讓我們協助判斷適合的照顧方向。',null,'Contact','服務諮詢、課程報名、人才招募、土地合作與投資洽談，都可以從這裡開始。','home_contact',90,'{"recipient":"generalaffairs@suiyuecare.com"}'::jsonb),

    ('about','hero','關於歲悅','讓長照變成家庭看得懂、找得到、用得起，也能被追蹤的日常支持。','About Suiyuecare','歲悅長照集團以「歲月安心，悅享生活」為核心，整合多元長照服務，陪伴家庭走過照顧決策與日常執行。','detail_hero',10,'{"image_url":"assets/homepage-batch/04-admin-team-office-fast.jpg","button_text":"聯絡我們","button_href":"#contact"}'::jsonb),
    ('about','brand-values','品牌理念',null,'Brand Values','我們相信照顧不是單點服務，而是一套讓家屬看得懂、照顧者能執行、團隊可追蹤的系統。','detail_cards',20,'{"items":[{"title":"歲月安心","body":"用專業與制度守護長輩健康安全。"},{"title":"悅享生活","body":"讓長輩保有生活選擇與日常尊嚴。"},{"title":"陪伴成長","body":"與家庭、照顧者與合作夥伴一起前進。"}]}'::jsonb),
    ('milestones','hero','大記事','一路往下看見歲悅如何把照顧網絡慢慢長出來。','Milestones','從服務據點、團隊建立到內容與品質系統，歲悅持續把照顧做得更清楚、更穩定。','detail_hero',10,'{"image_url":"assets/homepage-batch/16-taipei-service-office-fast.jpg"}'::jsonb),
    ('milestones','timeline','發展歷程',null,'Timeline','大記事版面保留互動式時間軸，後續可再拆成 milestones 資料表。','timeline',20,'{"items":[{"year":"2024","title":"服務網絡起步"},{"year":"2025","title":"北北桃服務布局"},{"year":"2026","title":"CMS 與健康3.0內容中心上線"}]}'::jsonb),

    ('home-care','hero','居家照顧',null,'Home Care','到宅服務、督導陪跑、家屬溝通與服務紀錄，串成家庭看得懂的照顧流程。','service_hero',10,'{"managed_by":"page_template_fields"}'::jsonb),
    ('day-care','hero','日間照顧',null,'Day Care','白天有安全、有活動、有同伴，晚上仍能回到熟悉的家。','service_hero',10,'{"managed_by":"page_template_fields"}'::jsonb),
    ('community','hero','社區據點',null,'Community Care','把健康促進、共餐活動與預防延緩失能帶進生活圈。','service_hero',10,'{"managed_by":"page_template_fields"}'::jsonb),
    ('nursing','hero','護理復能',null,'Nursing Reablement','用護理評估與復能目標，陪長輩一步一步重新建立生活把握。','service_hero',10,'{"managed_by":"page_template_fields"}'::jsonb),
    ('migrant-training','hero','移工培訓',null,'Migrant Training','把照顧技巧、家庭溝通與安全流程變成可練習的課程。','service_hero',10,'{"managed_by":"page_template_fields"}'::jsonb),
    ('quality','hero','教育品管',null,'Teaching Quality','把服務紀錄、督導檢核與教育訓練串成可改善的品質系統。','service_hero',10,'{"managed_by":"page_template_fields"}'::jsonb),

    ('talent','hero','人才招募','加入歲悅，把照顧變成一份能長久發展的專業。','Talent Recruiting','招募頁由 recruiting_pages、recruiting_departments、recruiting_openings 管理。','recruiting_hero',10,'{"managed_by":"recruiting_pages"}'::jsonb),
    ('land','hero','土地招募','尋找適合日照、社區據點與複合式長照服務的場域。','Land Partnership','場域、土地與建物合作內容由招募 CMS 管理。','recruiting_hero',10,'{"managed_by":"recruiting_pages"}'::jsonb),
    ('investor-recruiting','hero','投資人招募','尋找理解長照產業、認同長期服務網絡的投資夥伴。','Investor Recruiting','投資合作入口內容由招募 CMS 管理。','recruiting_hero',10,'{"managed_by":"recruiting_pages"}'::jsonb),

    ('investors','hero','投資人專區',null,'Investor Relations','整合最新動態、營運進度、財務資訊、公司治理與股東專區。','investor_hero',10,'{"managed_by":"investor_notices"}'::jsonb),
    ('ir-finance','hero','財務資訊',null,'Financial Information','每月營收、財務分析、季度財報與股東會年報由投資人資料管理。','investor_finance',10,'{"managed_by":"investor_financial_items"}'::jsonb),
    ('ir-governance','hero','公司治理',null,'Corporate Governance','重要訊息、治理運作、管理階層與風險管理資料由投資人資料管理。','investor_governance',10,'{"managed_by":"investor_notices"}'::jsonb),
    ('ir-shareholders','hero','股東專區',null,'Shareholder Services','股務資訊、股東會、法說會與常見問答由投資人資料管理。','investor_shareholders',10,'{"managed_by":"downloadable_files"}'::jsonb),

    ('contact','hero','聯絡我們',null,'Contact','留下需求，我們會協助判斷適合的服務、課程、招募或合作窗口。','contact',10,'{"recipient":"generalaffairs@suiyuecare.com"}'::jsonb)
)
insert into public.page_sections (page_id, section_key, title, subtitle, eyebrow, body, layout, sort_order, is_enabled, status, published_at, content_json)
select p.id, s.section_key, s.title, s.subtitle, s.eyebrow, s.body, s.layout, s.sort_order, true, 'published', now(), s.content_json
from section_seed s
join public.pages p on p.slug = s.slug
on conflict (page_id, section_key) do update
set title = excluded.title,
    subtitle = excluded.subtitle,
    eyebrow = excluded.eyebrow,
    body = excluded.body,
    layout = excluded.layout,
    sort_order = excluded.sort_order,
    is_enabled = true,
    status = 'published',
    published_at = coalesce(public.page_sections.published_at, excluded.published_at),
    content_json = excluded.content_json,
    updated_at = now();
