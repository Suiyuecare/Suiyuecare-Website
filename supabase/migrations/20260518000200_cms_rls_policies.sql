-- Suiyuecare CMS RLS policies.
-- This migration is safe to re-run after the base CMS schema because it drops
-- the named policies before recreating them.

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
  select role
  from public.profiles
  where user_id = auth.uid()
    and is_active = true
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

revoke all on schema private from public;
grant usage on schema private to authenticated;
grant execute on function private.current_profile_id() to authenticated;
grant execute on function private.current_admin_role() to authenticated;
grant execute on function private.can_manage_cms() to authenticated;
grant execute on function private.can_publish_cms() to authenticated;

alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.media enable row level security;
alter table public.article_categories enable row level security;
alter table public.articles enable row level security;
alter table public.admins enable row level security;

-- Profiles
drop policy if exists "Profiles can read own profile" on public.profiles;
drop policy if exists "Users can create own viewer profile" on public.profiles;
drop policy if exists "Admins can manage profiles" on public.profiles;

create policy "Profiles can read own profile"
on public.profiles
for select
to authenticated
using (
  user_id = auth.uid()
  or private.current_admin_role() in ('owner', 'admin')
);

create policy "Users can create own viewer profile"
on public.profiles
for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'viewer'
  and is_active = true
);

create policy "Admins can manage profiles"
on public.profiles
for all
to authenticated
using (private.current_admin_role() in ('owner', 'admin'))
with check (private.current_admin_role() in ('owner', 'admin'));

-- Pages
drop policy if exists "Published pages are public" on public.pages;
drop policy if exists "CMS users can manage pages" on public.pages;

create policy "Published pages are public"
on public.pages
for select
to anon, authenticated
using (
  is_enabled = true
  and status = 'published'
  and published_at <= now()
);

create policy "CMS users can manage pages"
on public.pages
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

-- Page sections
drop policy if exists "Published page sections are public" on public.page_sections;
drop policy if exists "CMS users can manage page sections" on public.page_sections;

create policy "Published page sections are public"
on public.page_sections
for select
to anon, authenticated
using (
  is_enabled = true
  and status = 'published'
  and published_at <= now()
);

create policy "CMS users can manage page sections"
on public.page_sections
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

-- Media metadata
drop policy if exists "Public media is readable" on public.media;
drop policy if exists "CMS users can manage media" on public.media;

create policy "Public media is readable"
on public.media
for select
to anon, authenticated
using (
  is_enabled = true
  and visibility = 'public'
);

create policy "CMS users can manage media"
on public.media
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

-- Article categories
drop policy if exists "Enabled article categories are public" on public.article_categories;
drop policy if exists "CMS users can manage article categories" on public.article_categories;

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

-- Articles
drop policy if exists "Published articles are public" on public.articles;
drop policy if exists "CMS users can manage articles" on public.articles;

create policy "Published articles are public"
on public.articles
for select
to anon, authenticated
using (
  is_enabled = true
  and status = 'published'
  and published_at <= now()
);

create policy "CMS users can manage articles"
on public.articles
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

-- Admin permission records
drop policy if exists "Admins can read admin records" on public.admins;
drop policy if exists "Owners and admins can manage admin records" on public.admins;

create policy "Admins can read admin records"
on public.admins
for select
to authenticated
using (
  profile_id = private.current_profile_id()
  or private.current_admin_role() in ('owner', 'admin')
);

create policy "Owners and admins can manage admin records"
on public.admins
for all
to authenticated
using (private.current_admin_role() in ('owner', 'admin'))
with check (private.current_admin_role() in ('owner', 'admin'));

-- Storage object policies
-- Public buckets are readable by the website. Private investor/internal buckets
-- are only accessible through authenticated CMS managers or server-side signed URLs.
drop policy if exists "Public CMS storage objects are readable" on storage.objects;
drop policy if exists "CMS users can manage CMS storage objects" on storage.objects;

create policy "Public CMS storage objects are readable"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id in (
    'public-images',
    'article-covers',
    'page-heroes',
    'course-images',
    'job-images'
  )
);

create policy "CMS users can manage CMS storage objects"
on storage.objects
for all
to authenticated
using (
  private.can_manage_cms()
  and bucket_id in (
    'public-images',
    'article-covers',
    'page-heroes',
    'course-images',
    'job-images',
    'investor-files',
    'private-documents'
  )
)
with check (
  private.can_manage_cms()
  and bucket_id in (
    'public-images',
    'article-covers',
    'page-heroes',
    'course-images',
    'job-images',
    'investor-files',
    'private-documents'
  )
);

-- API privileges. RLS still controls row-level access.
grant usage on schema public to anon, authenticated;
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
