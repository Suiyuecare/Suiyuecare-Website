update public.page_template_fields
set
  text_value = case field_key
    when 'hero_body' then '白天有人陪伴、活動、共餐與照顧；晚上仍能回到熟悉的家。先參觀，再決定是否試上一日。'
    when 'primary_cta_text' then '預約參觀與試上一日'
    when 'secondary_cta_text' then '先看入托規範'
    when 'secondary_cta_url' then '#day-care-start'
  end,
  updated_at = now()
where page_slug = 'day-care'
  and field_key in ('hero_body', 'primary_cta_text', 'secondary_cta_text', 'secondary_cta_url');
