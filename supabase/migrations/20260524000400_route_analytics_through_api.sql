-- Route public analytics writes through /api/analytics.
-- The browser no longer writes directly to Supabase; Vercel uses service_role.

drop policy if exists "Public can insert analytics page views" on public.analytics_page_views;
drop policy if exists "Public can insert analytics events" on public.analytics_events;

revoke insert on public.analytics_page_views from anon, authenticated;
revoke insert on public.analytics_events from anon, authenticated;

revoke execute on function public.track_page_view(jsonb) from public;
revoke execute on function public.track_page_view(jsonb) from anon;
revoke execute on function public.track_page_view(jsonb) from authenticated;
grant execute on function public.track_page_view(jsonb) to service_role;

revoke execute on function public.track_analytics_event(jsonb) from public;
revoke execute on function public.track_analytics_event(jsonb) from anon;
revoke execute on function public.track_analytics_event(jsonb) from authenticated;
grant execute on function public.track_analytics_event(jsonb) to service_role;
