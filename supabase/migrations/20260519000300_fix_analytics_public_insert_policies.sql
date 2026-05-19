-- Allow anonymous browser analytics inserts.
-- Public visitors can only insert rows; analytics reads remain admin-only.

drop policy if exists "Public can insert analytics page views" on public.analytics_page_views;
drop policy if exists "Public can insert analytics events" on public.analytics_events;

create policy "Public can insert analytics page views"
on public.analytics_page_views
for insert
to anon, authenticated
with check (true);

create policy "Public can insert analytics events"
on public.analytics_events
for insert
to anon, authenticated
with check (true);
