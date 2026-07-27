insert into public.page_template_fields (
  page_slug,
  template_key,
  field_key,
  field_label,
  field_type,
  text_value,
  json_value,
  sort_order,
  help_text
)
values
  ('software', 'service_page', 'hero_eyebrow', 'Hero 小標', 'text', 'Software', '{}'::jsonb, 10, '頁首英文小標。'),
  ('software', 'service_page', 'hero_title', 'Hero 標題', 'text', '軟體系統', '{}'::jsonb, 20, '頁首主標題。'),
  ('software', 'service_page', 'hero_body', 'Hero 內文', 'textarea', '把會計、人資、公文、專案、PDF、居家與日照流程整合成後台。', '{}'::jsonb, 30, '頁首服務說明。'),
  ('software', 'service_page', 'hero_image', 'Hero 圖片', 'image', 'assets/admin-recruit-02-operations-hero-hires.jpg', '{}'::jsonb, 40, '頁首背景圖片。'),
  ('software', 'service_page', 'primary_cta_text', '主要按鈕文字', 'text', '洽詢系統客製', '{}'::jsonb, 50, '頁首主要行動按鈕。'),
  ('software', 'service_page', 'primary_cta_url', '主要按鈕連結', 'url', '#service-contact', '{}'::jsonb, 60, '頁首主要行動連結。'),
  ('software', 'service_page', 'secondary_cta_text', '次要按鈕文字', 'text', '了解教育品管', '{}'::jsonb, 70, '頁首先次要行動按鈕。'),
  ('software', 'service_page', 'secondary_cta_url', '次要按鈕連結', 'url', '#quality', '{}'::jsonb, 80, '頁首先次要行動連結。'),
  (
    'software', 'service_page', 'pain_points', '適用情境', 'json', '',
    jsonb_build_array(
      jsonb_build_object('title', '資料散在 Excel 和 LINE', 'body', '把訊息、檔案與表單收回系統，降低漏看與重工。'),
      jsonb_build_object('title', '主管想看進度與報表', 'body', '把任務、案件、費用與文件狀態整理成可追蹤畫面。'),
      jsonb_build_object('title', '多據點或多部門需要權限控管', 'body', '依角色設定可看、可編、可審核的範圍，資料更安全。')
    ),
    90,
    '快速摘要第一欄。'
  ),
  (
    'software', 'service_page', 'service_items', '系統可提供的協助', 'json', '',
    jsonb_build_array(
      jsonb_build_object('title', '表單、檔案、任務與報表集中', 'body', '把日常營運需要的資料放在同一個後台。'),
      jsonb_build_object('title', '角色權限與操作紀錄清楚', 'body', '每個人負責什麼、做過什麼，都能被追蹤。'),
      jsonb_build_object('title', '可依單位流程客製模組', 'body', '不是套一個固定系統，而是依照實際流程逐步導入。')
    ),
    100,
    '快速摘要第二欄。'
  ),
  (
    'software', 'service_page', 'flow_cards', '導入步驟', 'json', '',
    jsonb_build_array(
      jsonb_build_object('step', '01', 'title', '盤點最卡的流程', 'body', '先找出最浪費時間、最容易出錯的一段流程。'),
      jsonb_build_object('step', '02', 'title', '規劃第一階段模組', 'body', '從最有感的功能開始做，避免一次導入太大太重。'),
      jsonb_build_object('step', '03', 'title', '導入後依使用回饋迭代', 'body', '上線後依使用狀況調整，讓系統真正貼近日常工作。')
    ),
    110,
    '快速摘要第三欄。'
  ),
  (
    'software', 'service_page', 'scene_cards', '實際使用畫面', 'json', '',
    jsonb_build_array(
      jsonb_build_object('image', 'assets/admin-recruit-02-operations-hires.jpg', 'title', '營運後台', 'body', '把案件、任務、文件與進度集中，主管不用到處找資料。', 'focal_point', 'center'),
      jsonb_build_object('image', 'assets/quality-detail-04-improvement-fast.jpg', 'title', '改善追蹤', 'body', '把會議決議、稽核缺失與改善期限變成可追蹤任務。', 'focal_point', 'center'),
      jsonb_build_object('image', 'assets/homecare-detail-02-care-plan-fast.jpg', 'title', '照顧流程', 'body', '依居家、日照、行政或專案需求客製表單與權限。', 'focal_point', 'center')
    ),
    120,
    '軟體系統頁的實際使用情境。'
  ),
  ('software', 'service_page', 'enrollment_eyebrow', '申請須知眉標', 'text', 'Before Apply', '{}'::jsonb, 130, '申請服務須知的小標。'),
  ('software', 'service_page', 'enrollment_title', '申請須知標題', 'text', '申請服務須知', '{}'::jsonb, 140, '申請服務須知的標題。'),
  ('software', 'service_page', 'enrollment_body', '申請須知說明', 'textarea', '不用先整理完整需求文件，先說明目前最卡的流程與使用角色即可。', '{}'::jsonb, 150, '申請服務須知的簡短說明。'),
  (
    'software', 'service_page', 'enrollment_items', '申請步驟', 'json', '',
    jsonb_build_array(
      jsonb_build_object('title', '先描述目前最卡的流程', 'text', '告訴我們現在最花時間、最容易出錯，或最常需要人工追蹤的工作。'),
      jsonb_build_object('title', '確認角色、權限與報表需求', 'text', '一起盤點誰需要查看、編輯或審核，以及主管需要掌握的資訊。'),
      jsonb_build_object('title', '提供第一階段導入規劃', 'text', '先從最有感的範圍開始，再依實際使用回饋逐步擴充。')
    ),
    160,
    '申請系統諮詢前的三個步驟。'
  ),
  ('software', 'service_page', 'cta_eyebrow', 'CTA 小標', 'text', 'Contact Us', '{}'::jsonb, 170, '頁尾表單小標。'),
  ('software', 'service_page', 'cta_title', 'CTA 標題', 'text', '想申請軟體系統？直接留下需求，讓歲悅協助你確認下一步。', '{}'::jsonb, 180, '頁尾表單標題。'),
  ('software', 'service_page', 'cta_body', 'CTA 內文', 'textarea', '不用先準備完整資料。先留下姓名、電話與需求類型，我們會依照軟體系統安排合適窗口，原則上 1 個工作天內主動聯繫。', '{}'::jsonb, 190, '頁尾表單說明。'),
  ('software', 'service_page', 'cta_button_text', 'CTA 按鈕文字', 'text', '送出軟體系統諮詢', '{}'::jsonb, 200, '頁尾表單送出按鈕。'),
  ('software', 'service_page', 'cta_button_url', 'CTA 按鈕連結', 'url', '#service-contact', '{}'::jsonb, 210, '保留給共用 CTA 使用。')
on conflict (page_slug, field_key) do update
set
  template_key = excluded.template_key,
  field_label = excluded.field_label,
  field_type = excluded.field_type,
  text_value = excluded.text_value,
  json_value = excluded.json_value,
  sort_order = excluded.sort_order,
  help_text = excluded.help_text,
  is_enabled = true,
  updated_at = now();
