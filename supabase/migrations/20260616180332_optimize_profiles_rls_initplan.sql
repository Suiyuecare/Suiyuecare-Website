drop policy if exists "Profiles can read own profile" on public.profiles;

create policy "Profiles can read own profile"
  on public.profiles
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.current_admin_role()) = any (array['owner'::cms_admin_role, 'admin'::cms_admin_role])
  );

drop policy if exists "Users can create own viewer profile" on public.profiles;

create policy "Users can create own viewer profile"
  on public.profiles
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and role = 'viewer'::cms_admin_role
    and is_active = true
  );
