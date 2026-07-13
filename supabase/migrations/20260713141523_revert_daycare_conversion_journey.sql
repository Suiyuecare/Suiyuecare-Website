update public.page_template_fields
set
  text_value = case field_key
    when 'hero_body' then '日間照顧讓長輩白天有活動、有陪伴、有餐食與安全照護，晚上仍能回到熟悉的家，也讓家屬白天能安心工作。'
    when 'primary_cta_text' then '預約諮詢'
    when 'secondary_cta_text' then '查看服務據點'
    when 'secondary_cta_url' then '#network'
  end,
  updated_at = now()
where page_slug = 'day-care'
  and field_key in ('hero_body', 'primary_cta_text', 'secondary_cta_text', 'secondary_cta_url');
