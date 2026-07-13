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
  ('day-care', 'service_page', 'enrollment_eyebrow', '入托準備眉標', 'text', 'Enrollment Checklist', '{}'::jsonb, 225, '入托準備區塊的英文眉標。'),
  ('day-care', 'service_page', 'enrollment_title', '入托準備標題', 'text', '入托準備清單', '{}'::jsonb, 226, '體檢完成後的入托準備區塊標題。'),
  ('day-care', 'service_page', 'enrollment_body', '入托準備說明', 'textarea', '體檢完成後，請依長輩平時生活習慣準備以下用品。', '{}'::jsonb, 227, '入托準備區塊的簡短提醒。'),
  (
    'day-care',
    'service_page',
    'enrollment_items',
    '入托準備清單',
    'json',
    '',
    jsonb_build_array(
      jsonb_build_object('label', '01', 'title', '衛生紙、濕紙巾', 'body', ''),
      jsonb_build_object('label', '02', 'title', '個人物品', 'body', '如：牙籤牙線、梳子等。'),
      jsonb_build_object('label', '03', 'title', '保溫瓶', 'body', ''),
      jsonb_build_object('label', '04', 'title', '牙刷、牙膏等盥洗用品', 'body', ''),
      jsonb_build_object('label', '05', 'title', '棉被或薄毯', 'body', ''),
      jsonb_build_object('label', '06', 'title', '替換衣物', 'body', '備用。'),
      jsonb_build_object('label', '07', 'title', '沐浴用品', 'body', '浴巾、毛巾、洗髮沐浴乳；請盡量選用按壓式瓶裝。'),
      jsonb_build_object('label', '08', 'title', '藥盒', 'body', '請事先分裝好並附上服藥說明。'),
      jsonb_build_object('label', '09', 'title', '尿布、看護墊等衛生用品', 'body', '')
    ),
    228,
    '正式入托前需準備的個人物品。'
  )
on conflict (page_slug, template_key, field_key) do update
set
  field_label = excluded.field_label,
  field_type = excluded.field_type,
  text_value = excluded.text_value,
  json_value = excluded.json_value,
  sort_order = excluded.sort_order,
  help_text = excluded.help_text,
  updated_at = now();
