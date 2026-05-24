-- Pre-launch security hardening.
-- Keep public-facing RPCs that are intentionally used by the website, but close
-- anonymous access to admin/reviewer functions and protect legacy backup data.

do $$
begin
  if to_regclass('public.cms_mojibake_backup_20260523') is not null then
    alter table public.cms_mojibake_backup_20260523 enable row level security;
    revoke all on table public.cms_mojibake_backup_20260523 from anon, authenticated;
  end if;
end $$;

revoke execute on function public.get_current_admin_permissions() from anon;
grant execute on function public.get_current_admin_permissions() to authenticated;

revoke execute on function public.review_publish_request(uuid, text, text) from anon;
grant execute on function public.review_publish_request(uuid, text, text) to authenticated;
