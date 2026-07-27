insert into public.media (
  bucket,
  storage_path,
  public_url,
  file_name,
  mime_type,
  alt_text,
  visibility,
  is_enabled,
  image_usage,
  focal_point
)
values (
  'site-assets',
  'assets/milestones/trademark-registration.jpg',
  '/assets/milestones/trademark-registration.jpg',
  'trademark-registration.jpg',
  'image/jpeg',
  '歲悅商標註冊完成',
  'public',
  true,
  'milestone',
  'center'
)
on conflict (bucket, storage_path) do update
set public_url = excluded.public_url,
    file_name = excluded.file_name,
    mime_type = excluded.mime_type,
    alt_text = excluded.alt_text,
    visibility = excluded.visibility,
    is_enabled = excluded.is_enabled,
    image_usage = excluded.image_usage,
    focal_point = excluded.focal_point,
    updated_at = now();

insert into public.milestones (
  year,
  month,
  title,
  tag,
  summary,
  status_label,
  image_id,
  image_url,
  sort_order,
  is_enabled,
  status,
  published_at
)
select
  2026::smallint,
  4::smallint,
  '歲悅商標註冊完成',
  '註冊',
  '歲悅商標於 115 年 4 月 16 日完成註冊，涵蓋養老院、日間托老服務與居家看護服務等類別，讓品牌服務識別更完整。',
  '已完成',
  media.id,
  '/assets/milestones/trademark-registration.jpg',
  65,
  true,
  'published'::public.cms_publish_status,
  now()
from public.media media
where media.bucket = 'site-assets'
  and media.storage_path = 'assets/milestones/trademark-registration.jpg'
on conflict (year, month, title) do update
set tag = excluded.tag,
    summary = excluded.summary,
    status_label = excluded.status_label,
    image_id = excluded.image_id,
    image_url = excluded.image_url,
    sort_order = excluded.sort_order,
    is_enabled = excluded.is_enabled,
    status = excluded.status,
    published_at = coalesce(public.milestones.published_at, excluded.published_at),
    updated_at = now();
