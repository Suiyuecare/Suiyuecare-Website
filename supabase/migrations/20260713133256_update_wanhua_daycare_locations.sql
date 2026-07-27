update public.content_modules
set
  title = case item_key
    when 'wanhua-a' then '歲悅萬華社區長照機構'
    when 'wanhua-b' then '歲悅萬華二館社區長照機構'
  end,
  subtitle = '臺北市｜日間照顧中心',
  body = case item_key
    when 'wanhua-a' then '萬華一館提供日間照顧服務，支持長輩白天生活照顧、活動參與與家庭照顧安排。'
    when 'wanhua-b' then '萬華二館提供日間照顧服務，支持長輩白天生活照顧、活動參與與家庭照顧安排。'
  end,
  badge_label = '日間照顧、生活支持、家屬諮詢',
  metadata = coalesce(metadata, '{}'::jsonb) || case item_key
    when 'wanhua-a' then jsonb_build_object(
      'image_alt', '歲悅萬華社區長照機構一館照片',
      'address', '108 臺北市萬華區康定路43號2樓',
      'tab_group', 'wanhua',
      'tab_label', '一館'
    )
    when 'wanhua-b' then jsonb_build_object(
      'image_alt', '歲悅萬華二館社區長照機構照片',
      'address', '108 臺北市萬華區西門里成都路159號2樓（雅香石頭火鍋二樓）',
      'tab_group', 'wanhua',
      'tab_label', '二館'
    )
  end,
  updated_at = now()
where target_slug = 'home'
  and module_key = 'location'
  and item_key in ('wanhua-a', 'wanhua-b');
