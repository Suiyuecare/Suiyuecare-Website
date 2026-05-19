-- Public analytics tracking RPCs.
-- Inserts are routed through security definer functions so browser clients can
-- record anonymous analytics while table reads remain protected by RLS.

create or replace function public.track_page_view(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_id uuid;
begin
  insert into public.analytics_page_views (
    session_id,
    visitor_id,
    page_path,
    page_title,
    referrer,
    source,
    medium,
    campaign,
    device_type,
    browser_language,
    user_agent,
    duration_seconds,
    is_bounce,
    metadata
  )
  values (
    left(coalesce(payload->>'session_id', gen_random_uuid()::text), 160),
    left(coalesce(payload->>'visitor_id', gen_random_uuid()::text), 160),
    left(coalesce(payload->>'page_path', '#unknown'), 500),
    left(nullif(payload->>'page_title', ''), 300),
    left(nullif(payload->>'referrer', ''), 800),
    left(coalesce(payload->>'source', 'direct'), 120),
    left(coalesce(payload->>'medium', 'none'), 120),
    left(nullif(payload->>'campaign', ''), 180),
    left(nullif(payload->>'device_type', ''), 40),
    left(nullif(payload->>'browser_language', ''), 80),
    left(nullif(payload->>'user_agent', ''), 500),
    nullif(payload->>'duration_seconds', '')::numeric,
    coalesce((payload->>'is_bounce')::boolean, false),
    coalesce(payload->'metadata', '{}'::jsonb)
  )
  returning id into inserted_id;

  return inserted_id;
end;
$$;

create or replace function public.track_analytics_event(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_id uuid;
begin
  insert into public.analytics_events (
    session_id,
    visitor_id,
    event_type,
    event_label,
    page_path,
    target_url,
    source,
    medium,
    campaign,
    value,
    metadata
  )
  values (
    left(coalesce(payload->>'session_id', gen_random_uuid()::text), 160),
    left(coalesce(payload->>'visitor_id', gen_random_uuid()::text), 160),
    left(coalesce(payload->>'event_type', 'unknown'), 80),
    left(nullif(payload->>'event_label', ''), 240),
    left(nullif(payload->>'page_path', ''), 500),
    left(nullif(payload->>'target_url', ''), 800),
    left(coalesce(payload->>'source', 'direct'), 120),
    left(coalesce(payload->>'medium', 'none'), 120),
    left(nullif(payload->>'campaign', ''), 180),
    nullif(payload->>'value', '')::numeric,
    coalesce(payload->'metadata', '{}'::jsonb)
  )
  returning id into inserted_id;

  return inserted_id;
end;
$$;

revoke all on function public.track_page_view(jsonb) from public;
revoke all on function public.track_analytics_event(jsonb) from public;
grant execute on function public.track_page_view(jsonb) to anon, authenticated;
grant execute on function public.track_analytics_event(jsonb) to anon, authenticated;
