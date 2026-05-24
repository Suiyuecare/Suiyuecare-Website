-- Tighten exposed RPC grants before production launch.
-- PUBLIC grants are inherited by anon/authenticated, so revoke from PUBLIC first.

revoke execute on function public.get_current_admin_permissions() from public;
revoke execute on function public.get_current_admin_permissions() from anon;
grant execute on function public.get_current_admin_permissions() to authenticated;

revoke execute on function public.review_publish_request(uuid, text, text) from public;
revoke execute on function public.review_publish_request(uuid, text, text) from anon;
grant execute on function public.review_publish_request(uuid, text, text) to authenticated;

-- Forms now go through /api/send-email with SUPABASE_SERVICE_ROLE_KEY.
-- Do not allow browsers to call this write RPC directly.
revoke execute on function public.submit_form_submission(jsonb) from public;
revoke execute on function public.submit_form_submission(jsonb) from anon;
revoke execute on function public.submit_form_submission(jsonb) from authenticated;
grant execute on function public.submit_form_submission(jsonb) to service_role;
