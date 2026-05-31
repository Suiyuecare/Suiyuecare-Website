update public.content_modules
set title = case item_key
  when 'shilin' then '歲悅士林失智據點 / 居家長照機構'
  when 'datong' then '歲悅大同失智據點'
  when 'xinyi' then '歲悅信義失智據點'
  when 'wanhua-a' then '歲悅萬華日照1館'
  when 'wanhua-b' then '歲悅萬華日照2館'
  when 'xinzhuang' then '歲悅新莊辦公室'
  when 'xindian' then '歲悅新店居家長照機構 / 歲悅職能治療所'
  when 'luzhu' then '歲悅蘆竹居家長照機構'
  else title
end,
updated_at = now()
where target_slug = 'home'
  and module_key = 'location'
  and item_key in ('shilin', 'datong', 'xinyi', 'wanhua-a', 'wanhua-b', 'xinzhuang', 'xindian', 'luzhu');
