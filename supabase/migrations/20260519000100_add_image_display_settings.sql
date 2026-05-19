-- Image display controls for CMS-managed media.
-- These fields let the CMS preserve front-end layout while allowing editors to choose image use case and crop focus.

alter table public.media
  add column if not exists image_usage text not null default 'card',
  add column if not exists focal_point text not null default 'center';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'media_image_usage_check'
      and conrelid = 'public.media'::regclass
  ) then
    alter table public.media
      add constraint media_image_usage_check
      check (image_usage in ('hero', 'service_hero', 'article_cover', 'card', 'square', 'avatar', 'logo', 'map', 'freeform'))
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'media_focal_point_check'
      and conrelid = 'public.media'::regclass
  ) then
    alter table public.media
      add constraint media_focal_point_check
      check (focal_point in ('center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'))
      not valid;
  end if;
end $$;

create index if not exists media_image_usage_idx on public.media(image_usage);
