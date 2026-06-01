-- Keep entrepreneur@suiyuecare.com as the only owner-level CMS account.
-- Other accounts can be admins, but cannot directly publish or approve publish requests.

update public.profiles
set role = 'admin'::public.cms_admin_role,
    updated_at = now()
where role = 'owner'::public.cms_admin_role
  and lower(coalesce(email, '')) <> 'entrepreneur@suiyuecare.com';

update public.admins a
set role = 'admin'::public.cms_admin_role,
    can_publish = false,
    can_review_publish = false,
    updated_at = now()
from public.profiles p
where a.profile_id = p.id
  and lower(coalesce(p.email, '')) <> 'entrepreneur@suiyuecare.com'
  and a.role = 'owner'::public.cms_admin_role;
