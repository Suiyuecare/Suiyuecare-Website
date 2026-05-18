-- Cover foreign keys used by CMS relations to avoid slow deletes/updates
-- once pages, articles, and media records grow.

create index if not exists pages_hero_image_id_idx on public.pages(hero_image_id);
create index if not exists pages_og_image_id_idx on public.pages(og_image_id);
create index if not exists pages_created_by_idx on public.pages(created_by);
create index if not exists pages_updated_by_idx on public.pages(updated_by);

create index if not exists page_sections_image_id_idx on public.page_sections(image_id);
create index if not exists page_sections_created_by_idx on public.page_sections(created_by);
create index if not exists page_sections_updated_by_idx on public.page_sections(updated_by);

create index if not exists media_created_by_idx on public.media(created_by);
create index if not exists media_updated_by_idx on public.media(updated_by);

create index if not exists article_categories_parent_id_idx on public.article_categories(parent_id);
create index if not exists article_categories_image_id_idx on public.article_categories(image_id);
create index if not exists article_categories_created_by_idx on public.article_categories(created_by);
create index if not exists article_categories_updated_by_idx on public.article_categories(updated_by);

create index if not exists articles_cover_image_id_idx on public.articles(cover_image_id);
create index if not exists articles_author_avatar_id_idx on public.articles(author_avatar_id);
create index if not exists articles_og_image_id_idx on public.articles(og_image_id);
create index if not exists articles_created_by_idx on public.articles(created_by);
create index if not exists articles_updated_by_idx on public.articles(updated_by);
