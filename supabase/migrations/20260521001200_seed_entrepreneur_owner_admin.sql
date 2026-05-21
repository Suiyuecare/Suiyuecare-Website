-- Ensure entrepreneur@suiyuecare.com is always the owner-level CMS administrator.

create or replace function private.ensure_owner_admin_for_email(target_user_id uuid, target_email text, target_metadata jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  profile_record_id uuid;
  normalized_email text := lower(trim(target_email));
  display_name text;
begin
  if target_user_id is null or normalized_email <> 'entrepreneur@suiyuecare.com' then
    return;
  end if;

  display_name := coalesce(
    nullif(target_metadata->>'full_name', ''),
    nullif(target_metadata->>'name', ''),
    '歲悅長照 Owner'
  );

  insert into public.profiles (
    user_id,
    display_name,
    email,
    role,
    avatar_url,
    is_active
  )
  values (
    target_user_id,
    display_name,
    normalized_email,
    'owner',
    nullif(target_metadata->>'avatar_url', ''),
    true
  )
  on conflict (user_id) do update set
    display_name = coalesce(nullif(excluded.display_name, ''), public.profiles.display_name),
    email = excluded.email,
    role = 'owner',
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    is_active = true,
    updated_at = now()
  returning id into profile_record_id;

  insert into public.admins (
    profile_id,
    role,
    can_manage_users,
    can_publish,
    can_manage_media,
    can_edit_pages,
    can_edit_articles,
    can_edit_courses,
    can_manage_files,
    can_view_forms,
    can_view_analytics,
    can_review_publish,
    is_active
  )
  values (
    profile_record_id,
    'owner',
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true
  )
  on conflict (profile_id) do update set
    role = 'owner',
    can_manage_users = true,
    can_publish = true,
    can_manage_media = true,
    can_edit_pages = true,
    can_edit_articles = true,
    can_edit_courses = true,
    can_manage_files = true,
    can_view_forms = true,
    can_view_analytics = true,
    can_review_publish = true,
    is_active = true,
    updated_at = now();
end;
$$;

create or replace function private.handle_entrepreneur_owner_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  perform private.ensure_owner_admin_for_email(new.id, new.email, new.raw_user_meta_data);
  return new;
end;
$$;

drop trigger if exists ensure_entrepreneur_owner_on_auth_user on auth.users;
create trigger ensure_entrepreneur_owner_on_auth_user
after insert or update of email, raw_user_meta_data on auth.users
for each row
when (lower(new.email) = 'entrepreneur@suiyuecare.com')
execute function private.handle_entrepreneur_owner_auth_user();

do $$
declare
  user_record record;
begin
  for user_record in
    select id, email, raw_user_meta_data
    from auth.users
    where lower(email) = 'entrepreneur@suiyuecare.com'
  loop
    perform private.ensure_owner_admin_for_email(
      user_record.id,
      user_record.email,
      user_record.raw_user_meta_data
    );
  end loop;
end $$;

grant execute on function private.ensure_owner_admin_for_email(uuid, text, jsonb) to postgres, service_role;
