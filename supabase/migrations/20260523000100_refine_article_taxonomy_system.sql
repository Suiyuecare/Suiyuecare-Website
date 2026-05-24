-- Refine Health 3.0 article and category taxonomy for a more practical CMS workflow.
-- This migration is additive and keeps the current frontend layout stable.

alter table public.article_categories
  add column if not exists section_key text not null default 'health',
  add column if not exists display_label text,
  add column if not exists icon text,
  add column if not exists audience text,
  add column if not exists show_in_nav boolean not null default true,
  add column if not exists is_featured boolean not null default false,
  add column if not exists seo_keywords text[] not null default '{}'::text[],
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.articles
  add column if not exists content_type text not null default 'article',
  add column if not exists reading_minutes integer,
  add column if not exists difficulty text,
  add column if not exists target_audience text,
  add column if not exists related_service text,
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists canonical_url text,
  add column if not exists recommended_slots text[] not null default '{}'::text[],
  add column if not exists summary_points text[] not null default '{}'::text[],
  add column if not exists related_article_ids uuid[] not null default '{}'::uuid[],
  add column if not exists faq_json jsonb not null default '[]'::jsonb,
  add column if not exists cta_text text,
  add column if not exists cta_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'articles_content_type_check'
      and conrelid = 'public.articles'::regclass
  ) then
    alter table public.articles
      add constraint articles_content_type_check
      check (content_type in ('article', 'lazy_pack', 'event', 'video', 'short_video', 'interview', 'news'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'articles_reading_minutes_check'
      and conrelid = 'public.articles'::regclass
  ) then
    alter table public.articles
      add constraint articles_reading_minutes_check
      check (reading_minutes is null or reading_minutes between 1 and 180);
  end if;
end $$;

create index if not exists article_categories_section_sort_idx
  on public.article_categories(section_key, show_in_nav, sort_order);

create index if not exists article_categories_featured_idx
  on public.article_categories(is_featured, sort_order);

create index if not exists articles_content_type_status_idx
  on public.articles(content_type, status, is_enabled, published_at desc);

create index if not exists articles_related_service_idx
  on public.articles(related_service, status, is_enabled);

create index if not exists articles_recommended_slots_gin_idx
  on public.articles using gin(recommended_slots);

create index if not exists articles_summary_points_gin_idx
  on public.articles using gin(summary_points);

update public.article_categories
set
  section_key = case
    when slug in ('lazy-pack', 'guide') then 'lazy_pack'
    when slug in ('activity', 'event') then 'activity'
    when slug in ('video') then 'video'
    when slug in ('short-video', 'shorts') then 'short_video'
    when slug in ('master-talk') then 'master_talk'
    else coalesce(nullif(section_key, ''), 'health')
  end,
  type = case
    when slug in ('lazy-pack', 'guide') then 'lazy_pack'
    when slug in ('activity', 'event') then 'event'
    when slug in ('video') then 'video'
    when slug in ('short-video', 'shorts') then 'short_video'
    when slug in ('master-talk') then 'interview'
    else type
  end,
  display_label = coalesce(display_label, name),
  show_in_nav = true
where slug in ('lazy-pack', 'guide', 'activity', 'event', 'video', 'short-video', 'shorts', 'master-talk');

update public.articles
set content_type = case
  when category_id in (select id from public.article_categories where slug in ('lazy-pack', 'guide')) then 'lazy_pack'
  when category_id in (select id from public.article_categories where slug in ('activity', 'event')) then 'event'
  when category_id in (select id from public.article_categories where slug = 'video') then 'video'
  when category_id in (select id from public.article_categories where slug in ('short-video', 'shorts')) then 'short_video'
  when category_id in (select id from public.article_categories where slug = 'master-talk') then 'interview'
  else content_type
end
where content_type = 'article';
