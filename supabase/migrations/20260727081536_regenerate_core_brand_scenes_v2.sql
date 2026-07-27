-- Replace the five soft/undersized shared scenes with the regenerated 16:9 assets.
update public.media
set
  storage_path = case storage_path
    when 'assets/homepage-batch/03-supervisor-care-plan.png' then 'assets/brand-scenes/care-team-v2.jpg'
    when 'assets/homepage-batch/13-rehab-walking-practice.png' then 'assets/brand-scenes/rehab-v2.jpg'
    when 'assets/homepage-batch/15-phone-consultation.png' then 'assets/brand-scenes/phone-v2.jpg'
    when 'assets/migrant-recruit-01-classroom.png' then 'assets/brand-scenes/migrant-v2.jpg'
    when 'assets/quality-recruit-04-quality-meeting.png' then 'assets/brand-scenes/quality-v2.jpg'
    else storage_path
  end,
  public_url = case storage_path
    when 'assets/homepage-batch/03-supervisor-care-plan.png' then '/assets/brand-scenes/care-team-v2.jpg'
    when 'assets/homepage-batch/13-rehab-walking-practice.png' then '/assets/brand-scenes/rehab-v2.jpg'
    when 'assets/homepage-batch/15-phone-consultation.png' then '/assets/brand-scenes/phone-v2.jpg'
    when 'assets/migrant-recruit-01-classroom.png' then '/assets/brand-scenes/migrant-v2.jpg'
    when 'assets/quality-recruit-04-quality-meeting.png' then '/assets/brand-scenes/quality-v2.jpg'
    else public_url
  end,
  file_name = case storage_path
    when 'assets/homepage-batch/03-supervisor-care-plan.png' then 'care-team-v2.jpg'
    when 'assets/homepage-batch/13-rehab-walking-practice.png' then 'rehab-v2.jpg'
    when 'assets/homepage-batch/15-phone-consultation.png' then 'phone-v2.jpg'
    when 'assets/migrant-recruit-01-classroom.png' then 'migrant-v2.jpg'
    when 'assets/quality-recruit-04-quality-meeting.png' then 'quality-v2.jpg'
    else file_name
  end,
  mime_type = 'image/jpeg',
  size_bytes = case storage_path
    when 'assets/homepage-batch/03-supervisor-care-plan.png' then 914009
    when 'assets/homepage-batch/13-rehab-walking-practice.png' then 962006
    when 'assets/homepage-batch/15-phone-consultation.png' then 847166
    when 'assets/migrant-recruit-01-classroom.png' then 985579
    when 'assets/quality-recruit-04-quality-meeting.png' then 854942
    else size_bytes
  end,
  width = 3200,
  height = 1801,
  alt_text = case storage_path
    when 'assets/homepage-batch/03-supervisor-care-plan.png' then '歲悅跨專業照顧團隊共同討論照顧計畫'
    when 'assets/homepage-batch/13-rehab-walking-practice.png' then '歲悅護理復能人員陪伴長輩進行步行練習'
    when 'assets/homepage-batch/15-phone-consultation.png' then '歲悅服務窗口接聽家庭照顧諮詢'
    when 'assets/migrant-recruit-01-classroom.png' then '歲悅移工照顧技能與安全移位培訓'
    when 'assets/quality-recruit-04-quality-meeting.png' then '歲悅教育品管團隊進行品質改善會議'
    else alt_text
  end,
  focal_point = 'center',
  updated_at = now()
where storage_path in (
  'assets/homepage-batch/03-supervisor-care-plan.png',
  'assets/homepage-batch/13-rehab-walking-practice.png',
  'assets/homepage-batch/15-phone-consultation.png',
  'assets/migrant-recruit-01-classroom.png',
  'assets/quality-recruit-04-quality-meeting.png'
);

update public.page_template_fields
set
  text_value = case page_slug
    when 'nursing' then 'assets/brand-scenes/rehab-v2.jpg'
    when 'migrant-training' then 'assets/brand-scenes/migrant-v2.jpg'
    when 'quality' then 'assets/brand-scenes/quality-v2.jpg'
    else text_value
  end,
  image_id = null,
  updated_at = now()
where template_key = 'service_page'
  and field_key = 'hero_image'
  and page_slug in ('nursing', 'migrant-training', 'quality');

update public.content_modules
set
  metadata = replace(
    metadata::text,
    'assets/homepage-batch/13-rehab-walking-practice.png',
    'assets/brand-scenes/rehab-v2.jpg'
  )::jsonb,
  updated_at = now()
where metadata::text like '%assets/homepage-batch/13-rehab-walking-practice.png%';

update public.care_stories
set
  cover_image_url = replace(
    coalesce(cover_image_url, ''),
    '/assets/homepage-batch/13-rehab-walking-practice.png',
    '/assets/brand-scenes/rehab-v2.jpg'
  ),
  avatar_image_url = replace(
    coalesce(avatar_image_url, ''),
    '/assets/homepage-batch/13-rehab-walking-practice.png',
    '/assets/brand-scenes/rehab-v2.jpg'
  ),
  updated_at = now()
where coalesce(cover_image_url, '') like '%13-rehab-walking-practice%'
   or coalesce(avatar_image_url, '') like '%13-rehab-walking-practice%';

update public.expert_talks
set
  image_url = replace(
    coalesce(image_url, ''),
    '/assets/homepage-batch/13-rehab-walking-practice.png',
    '/assets/brand-scenes/rehab-v2.jpg'
  ),
  updated_at = now()
where coalesce(image_url, '') like '%13-rehab-walking-practice%';

update public.recruiting_departments
set
  image_url = replace(
    replace(
      coalesce(image_url, ''),
      '/assets/migrant-recruit-01-classroom.png',
      '/assets/brand-scenes/migrant-v2.jpg'
    ),
    '/assets/quality-recruit-04-quality-meeting.png',
    '/assets/brand-scenes/quality-v2.jpg'
  ),
  gallery = replace(
    replace(
      gallery::text,
      '/assets/migrant-recruit-01-classroom.png',
      '/assets/brand-scenes/migrant-v2.jpg'
    ),
    '/assets/quality-recruit-04-quality-meeting.png',
    '/assets/brand-scenes/quality-v2.jpg'
  )::jsonb,
  updated_at = now()
where to_jsonb(recruiting_departments)::text ~ '(migrant-recruit-01-classroom|quality-recruit-04-quality-meeting)';

update public.recruiting_openings
set
  image_url = replace(
    replace(
      replace(
        replace(
          coalesce(image_url, ''),
          '/assets/homepage-batch/13-rehab-walking-practice-fast.jpg',
          '/assets/brand-scenes/rehab-v2.jpg'
        ),
        '/assets/migrant-recruit-01-classroom.png',
        '/assets/brand-scenes/migrant-v2.jpg'
      ),
      '/assets/quality-recruit-04-quality-meeting-clear.jpg',
      '/assets/brand-scenes/quality-v2.jpg'
    ),
    '/assets/quality-recruit-04-quality-meeting.png',
    '/assets/brand-scenes/quality-v2.jpg'
  ),
  updated_at = now()
where coalesce(image_url, '') ~ '(13-rehab-walking-practice|migrant-recruit-01-classroom|quality-recruit-04-quality-meeting)';
