-- Connect remaining Health 3.0 blocks and investor page fixed copy to CMS data.

insert into public.article_categories (name, slug, description, type, sort_order, is_enabled)
values
  ('懶人包', 'lazy-pack', '把家屬最常問的長照流程整理成可快速閱讀的文章。', 'article', 60, true),
  ('活動專區', 'activity', '課程、講座、參觀日與照顧活動文章。', 'article', 70, true),
  ('影音', 'video', '健康3.0影片文章與長照觀念影片。', 'article', 80, true),
  ('短影片', 'short-video', '短影音形式的照顧提醒與安全檢查。', 'article', 90, true)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    type = excluded.type,
    sort_order = excluded.sort_order,
    is_enabled = true,
    updated_at = now();

insert into public.media (bucket, storage_path, public_url, file_name, mime_type, alt_text, visibility, is_enabled, image_usage, focal_point)
values
  ('site-assets', 'assets/homepage-batch/01-care-home-greeting-fast.jpg', '/assets/homepage-batch/01-care-home-greeting-fast.jpg', '01-care-home-greeting-fast.jpg', 'image/jpeg', '照顧服務員到宅問候長輩', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/family-consultation-clear.jpg', '/assets/homepage-batch/family-consultation-clear.jpg', 'family-consultation-clear.jpg', 'image/jpeg', '家屬照顧諮詢情境', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/08-orange-apron-walking-fast.jpg', '/assets/homepage-batch/08-orange-apron-walking-fast.jpg', '08-orange-apron-walking-fast.jpg', 'image/jpeg', '橘色圍裙照顧服務員陪伴行走', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/12-community-health-class-hires.jpg', '/assets/homepage-batch/12-community-health-class-hires.jpg', '12-community-health-class-hires.jpg', 'image/jpeg', '社區健康課程活動', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/13-rehab-walking-practice-fast.jpg', '/assets/homepage-batch/13-rehab-walking-practice-fast.jpg', '13-rehab-walking-practice-fast.jpg', 'image/jpeg', '復能行走練習', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/14-care-notes-fast.jpg', '/assets/homepage-batch/14-care-notes-fast.jpg', '14-care-notes-fast.jpg', 'image/jpeg', '照顧紀錄與家屬回報', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/15-phone-consultation-fast.jpg', '/assets/homepage-batch/15-phone-consultation-fast.jpg', '15-phone-consultation-fast.jpg', 'image/jpeg', '電話諮詢照顧需求', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/19-health-dementia-cover-fast.jpg', '/assets/homepage-batch/19-health-dementia-cover-fast.jpg', '19-health-dementia-cover-fast.jpg', 'image/jpeg', '失智照顧封面', 'public', true, 'article_cover', 'center')
on conflict (bucket, storage_path) do update
set public_url = excluded.public_url,
    alt_text = excluded.alt_text,
    is_enabled = true,
    image_usage = excluded.image_usage,
    focal_point = excluded.focal_point,
    updated_at = now();

with category_map as (
  select slug, id from public.article_categories
  where slug in ('lazy-pack', 'activity', 'video', 'short-video')
),
media_map as (
  select storage_path, id from public.media
  where storage_path in (
    'assets/homepage-batch/01-care-home-greeting-fast.jpg',
    'assets/homepage-batch/family-consultation-clear.jpg',
    'assets/homepage-batch/08-orange-apron-walking-fast.jpg',
    'assets/homepage-batch/12-community-health-class-hires.jpg',
    'assets/homepage-batch/13-rehab-walking-practice-fast.jpg',
    'assets/homepage-batch/14-care-notes-fast.jpg',
    'assets/homepage-batch/15-phone-consultation-fast.jpg',
    'assets/homepage-batch/19-health-dementia-cover-fast.jpg'
  )
)
insert into public.articles (
  category_id, slug, title, subtitle, excerpt, content, cover_image_id,
  author_name, tags, sort_order, is_featured, is_enabled, status, published_at,
  seo_title, seo_description
)
values
  ((select id from category_map where slug = 'lazy-pack'), 'longterm-care-apply', '長照申請懶人包：從評估到第一次服務', '把長照申請、補助、服務媒合與第一次到宅整理成清楚步驟。', '從評估、補助、服務媒合到第一次到宅，照著順序看就懂。', '## 什麼時候該申請長照？\n當家人開始需要移位、用餐、沐浴、陪同就醫或日常安全提醒，就可以先諮詢。\n\n## 申請流程\n- 撥打 1966 或由家屬提出長照需求\n- 接受照管中心評估\n- 與服務單位討論照顧計畫\n- 安排第一次服務與回報方式\n\n## 歲悅怎麼協助\n我們會協助家屬把需求說清楚，並把服務紀錄、督導追蹤與家屬回報串起來。', (select id from media_map where storage_path = 'assets/homepage-batch/family-consultation-clear.jpg'), '歲悅照顧編輯部', array['懶人包','長照申請','家屬支持'], 10, true, true, 'published', now() - interval '9 days', '長照申請懶人包｜歲悅長照', '從評估到服務媒合，快速理解長照申請流程。'),
  ((select id from category_map where slug = 'lazy-pack'), 'family-care-story', '出院返家照顧包：家屬每天要觀察什麼', '把出院返家前準備、移位、用餐與每日觀察整理成家屬清單。', '把返家前準備、移位、用餐與每日觀察整理成家屬清單。', '## 出院返家的第一週\n家屬最需要的是清楚知道每天要觀察什麼。\n\n## 每日觀察重點\n- 食量與喝水量\n- 精神狀態與睡眠\n- 移位是否安全\n- 傷口、疼痛或跌倒風險\n\n## 怎麼降低焦慮\n固定回報格式可以讓家屬不用一直猜，也能讓照顧服務員、督導與家屬對齊。', (select id from media_map where storage_path = 'assets/homepage-batch/01-care-home-greeting-fast.jpg'), '歲悅照顧編輯部', array['懶人包','出院返家','居家照顧'], 20, false, true, 'published', now() - interval '8 days', '出院返家照顧包｜歲悅長照', '家屬返家照顧的每日觀察清單。'),
  ((select id from category_map where slug = 'lazy-pack'), 'dementia-response', '失智陪伴懶人包：重複提問怎麼回應', '用簡單句子、固定節奏與環境提示，降低家屬和長輩的摩擦。', '重複提問、情緒不安與日常安全，用簡單方法降低摩擦。', '## 先回應情緒，再回答問題\n失智長輩重複提問時，很多時候是在確認安全感。\n\n## 可以這樣做\n- 用短句回答\n- 避免爭辯對錯\n- 用便條、照片或日曆輔助\n- 轉移到熟悉活動\n\n## 家屬也需要休息\n照顧不是一個人硬撐，安排喘息服務與日照活動可以讓家庭走得更久。', (select id from media_map where storage_path = 'assets/homepage-batch/19-health-dementia-cover-fast.jpg'), '歲悅照顧編輯部', array['懶人包','失智照顧','家屬支持'], 30, false, true, 'published', now() - interval '7 days', '失智陪伴懶人包｜歲悅長照', '重複提問與情緒不安的照顧回應方式。'),
  ((select id from category_map where slug = 'activity'), 'family-care-course', '家屬照顧技巧課：移位、用餐與跌倒預防', '用一堂課理解家庭照顧最常遇到的安全情境。', '移位、用餐、跌倒預防與照顧溝通。', '## 課程重點\n本活動適合剛開始照顧家人的家庭。\n\n## 你會學到\n- 安全起身與移位\n- 用餐觀察與吞嚥提醒\n- 居家跌倒風險檢查\n- 如何和照顧服務員溝通', (select id from media_map where storage_path = 'assets/homepage-batch/12-community-health-class-hires.jpg'), '歲悅教育品管部', array['活動專區','家屬課程','照顧技巧'], 40, false, true, 'published', now() - interval '6 days', '家屬照顧技巧課｜歲悅長照', '移位、用餐與跌倒預防活動文章。'),
  ((select id from category_map where slug = 'activity'), 'day-care-respite', '日照體驗參觀日：認識白天照顧與家庭喘息', '帶家屬理解日照中心的一日節奏、活動設計與回報方式。', '認識日間照顧流程與家庭喘息安排。', '## 為什麼安排體驗參觀\n很多家屬擔心長輩不適應日照，其實先看見環境與流程會安心很多。\n\n## 參觀重點\n- 活動安排\n- 共餐與休息\n- 家屬回報\n- 交通接送與適應期', (select id from media_map where storage_path = 'assets/homepage-batch/12-community-health-class-hires.jpg'), '歲悅日間照顧部', array['活動專區','日間照顧','喘息'], 50, false, true, 'published', now() - interval '5 days', '日照體驗參觀日｜歲悅長照', '認識日照中心與家庭喘息安排。'),
  ((select id from category_map where slug = 'activity'), 'reablement-workshop', '復能照顧工作坊：一步一步恢復生活能力', '從安全行走、肌力觀察到家中練習，理解復能不是催促。', '讓長輩一步一步恢復生活能力。', '## 復能不是要求長輩快一點\n復能的核心是讓長輩在安全範圍內找回生活能力。\n\n## 工作坊內容\n- 行走安全\n- 起身與平衡\n- 日常活動練習\n- 家屬陪伴方式', (select id from media_map where storage_path = 'assets/homepage-batch/13-rehab-walking-practice-fast.jpg'), '歲悅護理復能部', array['活動專區','護理復能','工作坊'], 60, false, true, 'published', now() - interval '4 days', '復能照顧工作坊｜歲悅長照', '復能照顧與家庭陪伴工作坊。'),
  ((select id from category_map where slug = 'video'), 'home-care-video-guide', '影片：三分鐘理解居家照顧安排流程', '從需求初談、服務媒合到每日回報，快速理解居家照顧怎麼開始。', '三分鐘理解居家照顧安排流程。', '## 影片重點\n這支影片用簡短方式說明居家照顧的開始流程。\n\n## 你會看到\n- 初談要準備哪些資訊\n- 如何安排服務人員\n- 每日紀錄怎麼回報\n- 督導如何追蹤品質', (select id from media_map where storage_path = 'assets/homepage-batch/15-phone-consultation-fast.jpg'), '歲悅照顧編輯部', array['影音','居家照顧','服務流程'], 70, false, true, 'published', now() - interval '3 days', '居家照顧安排流程影片｜歲悅長照', '三分鐘理解居家照顧安排流程。'),
  ((select id from category_map where slug = 'video'), 'day-care-video-guide', '影片：日間照顧如何讓家庭喘息', '用影像理解白天活動、共餐、休息與家屬回報。', '日間照顧如何讓家庭喘息。', '## 日照的價值\n白天有人陪伴、活動有節奏，家屬也能保有工作與休息。\n\n## 影片內容\n- 活動安排\n- 共餐服務\n- 家屬回報\n- 適應期觀察', (select id from media_map where storage_path = 'assets/homepage-batch/12-community-health-class-hires.jpg'), '歲悅日間照顧部', array['影音','日間照顧','喘息'], 80, false, true, 'published', now() - interval '2 days', '日間照顧家庭喘息影片｜歲悅長照', '日間照顧如何支援家庭喘息。'),
  ((select id from category_map where slug = 'short-video'), 'fall-observation', '短影片：跌倒後 24 小時觀察重點', '跌倒後不要只看有沒有外傷，也要觀察精神、疼痛與行走狀態。', '跌倒後 24 小時觀察重點。', '## 跌倒後先確認\n短影片整理跌倒後一天內家屬可以觀察的重點。\n\n## 注意事項\n- 意識與精神\n- 疼痛位置\n- 是否頭暈\n- 行走是否和平常不同', (select id from media_map where storage_path = 'assets/homepage-batch/14-care-notes-fast.jpg'), '歲悅照顧編輯部', array['短影片','跌倒預防','居家安全'], 90, false, true, 'published', now() - interval '1 days', '跌倒後觀察短影片｜歲悅長照', '跌倒後 24 小時家屬觀察重點。'),
  ((select id from category_map where slug = 'short-video'), 'bathroom-safety', '短影片：浴室安全的快速檢查', '扶手、防滑、照明與動線，是浴室安全最容易先改善的地方。', '浴室安全的快速檢查。', '## 浴室是跌倒高風險區\n短影片帶你快速檢查浴室環境。\n\n## 四個重點\n- 防滑墊是否固定\n- 扶手位置是否順手\n- 夜間照明是否足夠\n- 地面是否容易積水', (select id from media_map where storage_path = 'assets/homepage-batch/08-orange-apron-walking-fast.jpg'), '歲悅照顧編輯部', array['短影片','浴室安全','跌倒預防'], 100, false, true, 'published', now(), '浴室安全短影片｜歲悅長照', '浴室安全快速檢查與跌倒預防。')
on conflict (slug) do update
set category_id = excluded.category_id,
    title = excluded.title,
    subtitle = excluded.subtitle,
    excerpt = excluded.excerpt,
    content = excluded.content,
    cover_image_id = excluded.cover_image_id,
    author_name = excluded.author_name,
    tags = excluded.tags,
    sort_order = excluded.sort_order,
    is_enabled = true,
    status = 'published',
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    updated_at = now();

insert into public.site_settings (
  setting_group, setting_key, setting_label, value_text, value_json, help_text, sort_order, is_enabled
)
values (
  'investor',
  'investor_pages',
  '投資人專區文案/KPI/FAQ',
  null,
  '{
    "investors": {
      "eyebrow": "Investor Relations",
      "title": "投資人專區",
      "body": "以清楚、穩定、可信任的資訊揭露，讓投資人理解歲悅長照集團的服務網絡、治理節奏與成長策略。",
      "primary_cta_text": "聯絡投資人窗口",
      "primary_cta_url": "#contact",
      "secondary_cta_text": "下載資料",
      "secondary_cta_url": "#investor-downloads",
      "snapshot_label": "Suiyuecare Corps.",
      "snapshot_title": "照顧服務網絡持續擴張",
      "snapshot": [
        { "value": "3", "label": "核心縣市" },
        { "value": "6", "label": "服務事業" },
        { "value": "95%", "label": "服務滿意度" }
      ]
    },
    "ir-finance": {
      "eyebrow": "Financial Information",
      "title": "財務資訊",
      "body": "財務資料來自後台投資人資料中心，月營收、財報與下載檔可獨立更新。",
      "snapshot_label": "Revenue Trend",
      "snapshot_value": "更新中",
      "snapshot_note": "最近月營收",
      "kpis": [
        { "label": "Monthly Revenue", "value": "--", "note": "最近月營收" },
        { "label": "Growth", "value": "--", "note": "成長率" },
        { "label": "Reports", "value": "0", "note": "季度財報" },
        { "label": "Files", "value": "0", "note": "下載檔" }
      ]
    },
    "ir-governance": {
      "eyebrow": "Corporate Governance",
      "title": "公司治理",
      "body": "治理公告、制度文件與下載檔由後台管理，協助投資人理解公司治理節奏。",
      "snapshot_label": "Governance",
      "snapshot_value": "91",
      "snapshot_unit": "Index",
      "snapshot_note": "治理成熟度",
      "kpis": [
        { "label": "Notices", "value": "0", "note": "治理公告" },
        { "label": "Files", "value": "0", "note": "治理下載" },
        { "label": "Audit", "value": "92%", "note": "稽核完成率" },
        { "label": "Cases", "value": "0", "note": "重大未結" }
      ]
    },
    "ir-shareholders": {
      "eyebrow": "Shareholders",
      "title": "股東專區",
      "body": "股務資訊、股東會、法說會與常見問答由後台管理。",
      "snapshot_label": "Shareholder Service",
      "snapshot_value": "0",
      "snapshot_note": "已上架股東文件",
      "kpis": [
        { "label": "Notices", "value": "0", "note": "股東公告" },
        { "label": "Files", "value": "0", "note": "股東文件" },
        { "label": "Contact", "value": "IR", "note": "投資人窗口" },
        { "label": "FAQ", "value": "Online", "note": "常見問答" }
      ],
      "faq_intro": "股東常見問題可由後台全站設定更新。",
      "faqs": [
        { "question": "股東文件在哪裡下載？", "answer": "請在股東會或下載檔區塊查看已發布文件。" },
        { "question": "如何聯絡投資人窗口？", "answer": "可由聯絡我們表單選擇投資洽談。" }
      ]
    }
  }'::jsonb,
  '控制投資人首頁、財務資訊、公司治理、股東專區的 Hero、KPI、FAQ 與 CTA。',
  130,
  true
)
on conflict (setting_key) do update
set setting_group = excluded.setting_group,
    setting_label = excluded.setting_label,
    value_json = excluded.value_json,
    help_text = excluded.help_text,
    sort_order = excluded.sort_order,
    is_enabled = true,
    updated_at = now();
