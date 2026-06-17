revoke execute on function public.submit_form_submission(jsonb) from anon, authenticated, public;
revoke execute on function public.track_analytics_event(jsonb) from anon, authenticated, public;
revoke execute on function public.track_page_view(jsonb) from anon, authenticated, public;
revoke execute on function public.update_form_submission_email_status(uuid, boolean, boolean) from anon, authenticated, public;
