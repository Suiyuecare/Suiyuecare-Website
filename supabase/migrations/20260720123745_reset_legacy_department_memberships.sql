-- Legacy Admin/Editor accounts previously had broad module permissions. Do not
-- silently translate those grants into cross-department access. The Owner must
-- explicitly assign every non-Owner account from the visible permission matrix.
delete from public.department_memberships membership
using public.profiles profile
where profile.id = membership.profile_id
  and profile.role <> 'owner';
