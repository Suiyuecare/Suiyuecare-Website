-- Suiyuecare CMS schema for Supabase.
-- Apply in Supabase SQL Editor or with the Supabase CLI.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'cms_admin_role') then
    create type public.cms_admin_role as enum ('owner', 'admin', 'editor', 'viewer');
  end if;

  if not exists (select 1 from pg_type where typname = 'cms_publish_status') then
    create type public.cms_publish_status as enum ('draft', 'scheduled', 'published', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'cms_media_visibility') then
    create type public.cms_media_visibility as enum ('public', 'private');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  email text,
  role public.cms_admin_role not null default 'viewer',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  menu_label text,
  hero_title text,
  hero_subtitle text,
  hero_body text,
  hero_image_id uuid,
  content_json jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  status public.cms_publish_status not null default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  seo_keywords text[] not null default '{}'::text[],
  og_title text,
  og_description text,
  og_image_id uuid,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pages_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint pages_published_at_required check (status <> 'published' or published_at is not null)
);

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  section_key text not null,
  title text,
  subtitle text,
  eyebrow text,
  body text,
  image_id uuid,
  content_json jsonb not null default '{}'::jsonb,
  layout text not null default 'default',
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  status public.cms_publish_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, section_key),
  constraint page_sections_key_format check (section_key ~ '^[a-z0-9][a-z0-9_-]*$')
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  storage_path text not null,
  public_url text,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  width integer,
  height integer,
  alt_text text,
  caption text,
  credit text,
  visibility public.cms_media_visibility not null default 'public',
  metadata jsonb not null default '{}'::jsonb,
  is_enabled boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, storage_path),
  constraint media_size_nonnegative check (size_bytes is null or size_bytes >= 0),
  constraint media_dimensions_nonnegative check (
    (width is null or width >= 0) and (height is null or height >= 0)
  )
);

alter table public.pages
  add constraint pages_hero_image_id_fkey
  foreign key (hero_image_id) references public.media(id) on delete set null;

alter table public.pages
  add constraint pages_og_image_id_fkey
  foreign key (og_image_id) references public.media(id) on delete set null;

alter table public.page_sections
  add constraint page_sections_image_id_fkey
  foreign key (image_id) references public.media(id) on delete set null;

create table if not exists public.article_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.article_categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  type text not null default 'article',
  color text,
  image_id uuid references public.media(id) on delete set null,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  seo_title text,
  seo_description text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint article_categories_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]*$')
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.article_categories(id) on delete set null,
  slug text not null unique,
  title text not null,
  subtitle text,
  excerpt text,
  content text,
  content_json jsonb not null default '{}'::jsonb,
  cover_image_id uuid references public.media(id) on delete set null,
  author_name text,
  author_title text,
  author_avatar_id uuid references public.media(id) on delete set null,
  tags text[] not null default '{}'::text[],
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_enabled boolean not null default true,
  status public.cms_publish_status not null default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  seo_keywords text[] not null default '{}'::text[],
  og_title text,
  og_description text,
  og_image_id uuid references public.media(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint articles_published_at_required check (status <> 'published' or published_at is not null)
);

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  role public.cms_admin_role not null default 'editor',
  can_manage_users boolean not null default false,
  can_publish boolean not null default false,
  can_manage_media boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_role_idx on public.profiles(role);

create index if not exists pages_status_enabled_sort_idx on public.pages(status, is_enabled, sort_order);
create index if not exists pages_published_at_idx on public.pages(published_at desc);

create index if not exists page_sections_page_sort_idx on public.page_sections(page_id, sort_order);
create index if not exists page_sections_status_enabled_idx on public.page_sections(status, is_enabled);

create index if not exists media_bucket_path_idx on public.media(bucket, storage_path);
create index if not exists media_enabled_visibility_idx on public.media(is_enabled, visibility);

create index if not exists article_categories_type_sort_idx on public.article_categories(type, sort_order);
create index if not exists article_categories_enabled_idx on public.article_categories(is_enabled);

create index if not exists articles_category_status_idx on public.articles(category_id, status, is_enabled);
create index if not exists articles_featured_sort_idx on public.articles(is_featured, sort_order);
create index if not exists articles_published_at_idx on public.articles(published_at desc);
create index if not exists articles_tags_gin_idx on public.articles using gin(tags);
create index if not exists articles_content_json_gin_idx on public.articles using gin(content_json);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_pages_updated_at on public.pages;
create trigger set_pages_updated_at
before update on public.pages
for each row execute function public.set_updated_at();

drop trigger if exists set_page_sections_updated_at on public.page_sections;
create trigger set_page_sections_updated_at
before update on public.page_sections
for each row execute function public.set_updated_at();

drop trigger if exists set_media_updated_at on public.media;
create trigger set_media_updated_at
before update on public.media
for each row execute function public.set_updated_at();

drop trigger if exists set_article_categories_updated_at on public.article_categories;
create trigger set_article_categories_updated_at
before update on public.article_categories
for each row execute function public.set_updated_at();

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

drop trigger if exists set_admins_updated_at on public.admins;
create trigger set_admins_updated_at
before update on public.admins
for each row execute function public.set_updated_at();

create schema if not exists private;

create or replace function private.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.profiles
  where user_id = auth.uid()
    and is_active = true
  limit 1
$$;

create or replace function private.current_admin_role()
returns public.cms_admin_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.user_id = auth.uid()
    and p.is_active = true
    and p.role in ('owner', 'admin', 'editor', 'viewer')
  limit 1
$$;

create or replace function private.can_manage_cms()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.is_active = true
      and p.role in ('owner', 'admin', 'editor')
  )
$$;

create or replace function private.can_publish_cms()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    left join public.admins a on a.profile_id = p.id
    where p.user_id = auth.uid()
      and p.is_active = true
      and (
        p.role in ('owner', 'admin')
        or coalesce(a.can_publish, false) = true
      )
  )
$$;

alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.media enable row level security;
alter table public.article_categories enable row level security;
alter table public.articles enable row level security;
alter table public.admins enable row level security;

create policy "Profiles can read own profile"
on public.profiles
for select
to authenticated
using (user_id = auth.uid() or private.current_admin_role() in ('owner', 'admin'));

create policy "Users can create own viewer profile"
on public.profiles
for insert
to authenticated
with check (user_id = auth.uid() and role = 'viewer');

create policy "Admins can manage profiles"
on public.profiles
for all
to authenticated
using (private.current_admin_role() in ('owner', 'admin'))
with check (private.current_admin_role() in ('owner', 'admin'));

create policy "Published pages are public"
on public.pages
for select
to anon, authenticated
using (is_enabled = true and status = 'published' and published_at <= now());

create policy "CMS users can manage pages"
on public.pages
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

create policy "Published page sections are public"
on public.page_sections
for select
to anon, authenticated
using (is_enabled = true and status = 'published' and published_at <= now());

create policy "CMS users can manage page sections"
on public.page_sections
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

create policy "Public media is readable"
on public.media
for select
to anon, authenticated
using (is_enabled = true and visibility = 'public');

create policy "CMS users can manage media"
on public.media
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

create policy "Enabled article categories are public"
on public.article_categories
for select
to anon, authenticated
using (is_enabled = true);

create policy "CMS users can manage article categories"
on public.article_categories
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

create policy "Published articles are public"
on public.articles
for select
to anon, authenticated
using (is_enabled = true and status = 'published' and published_at <= now());

create policy "CMS users can manage articles"
on public.articles
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

create policy "Admins can read admin records"
on public.admins
for select
to authenticated
using (private.current_admin_role() in ('owner', 'admin') or profile_id = private.current_profile_id());

create policy "Owners and admins can manage admin records"
on public.admins
for all
to authenticated
using (private.current_admin_role() in ('owner', 'admin'))
with check (private.current_admin_role() in ('owner', 'admin'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-images', 'public-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('article-covers', 'article-covers', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('page-heroes', 'page-heroes', true, 15728640, array['image/jpeg', 'image/png', 'image/webp']),
  ('course-images', 'course-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('job-images', 'job-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('investor-files', 'investor-files', false, 20971520, array['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp']),
  ('private-documents', 'private-documents', false, 20971520, array['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public CMS storage objects are readable"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id in ('public-images', 'article-covers', 'page-heroes', 'course-images', 'job-images')
);

create policy "CMS users can manage CMS storage objects"
on storage.objects
for all
to authenticated
using (
  bucket_id in ('public-images', 'article-covers', 'page-heroes', 'course-images', 'job-images', 'investor-files', 'private-documents')
  and private.can_manage_cms()
)
with check (
  bucket_id in ('public-images', 'article-covers', 'page-heroes', 'course-images', 'job-images', 'investor-files', 'private-documents')
  and private.can_manage_cms()
);

grant usage on schema public to anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.current_profile_id() to authenticated;
grant execute on function private.current_admin_role() to authenticated;
grant execute on function private.can_manage_cms() to authenticated;
grant execute on function private.can_publish_cms() to authenticated;
grant select on public.pages to anon, authenticated;
grant select on public.page_sections to anon, authenticated;
grant select on public.media to anon, authenticated;
grant select on public.article_categories to anon, authenticated;
grant select on public.articles to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.pages to authenticated;
grant select, insert, update, delete on public.page_sections to authenticated;
grant select, insert, update, delete on public.media to authenticated;
grant select, insert, update, delete on public.article_categories to authenticated;
grant select, insert, update, delete on public.articles to authenticated;
grant select, insert, update, delete on public.admins to authenticated;
