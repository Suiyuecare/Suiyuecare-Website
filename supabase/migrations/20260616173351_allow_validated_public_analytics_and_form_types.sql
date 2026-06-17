drop policy if exists "Public can create form submissions" on public.form_submissions;

create policy "Public can create form submissions"
  on public.form_submissions
  for insert
  to anon
  with check (
    form_type = any (array[
      'contact'::text,
      'course_signup'::text,
      'investor'::text,
      'land'::text,
      'marketing'::text,
      'system'::text,
      'recruiting'::text
    ])
    and status = 'new'::text
    and length(coalesce(name, ''::text)) between 1 and 160
    and length(coalesce(phone, ''::text)) between 1 and 80
    and length(coalesce(email, ''::text)) between 3 and 180
  );

create or replace function public.submit_form_submission(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  inserted_id uuid;
  safe_form_type text;
begin
  safe_form_type := left(coalesce(payload->>'form_type', 'contact'), 80);

  if safe_form_type not in ('contact', 'course_signup', 'investor', 'land', 'marketing', 'system', 'recruiting') then
    safe_form_type := 'contact';
  end if;

  if nullif(trim(coalesce(payload->>'name', '')), '') is null
    or nullif(trim(coalesce(payload->>'phone', '')), '') is null
    or nullif(trim(coalesce(payload->>'email', '')), '') is null
  then
    raise exception 'Missing required form fields';
  end if;

  insert into public.form_submissions (
    form_type,
    name,
    phone,
    email,
    subject,
    message,
    source_path,
    metadata,
    recipient_email,
    email_sent
  )
  values (
    safe_form_type,
    left(nullif(payload->>'name', ''), 160),
    left(nullif(payload->>'phone', ''), 80),
    left(nullif(payload->>'email', ''), 180),
    left(nullif(payload->>'subject', ''), 220),
    left(nullif(payload->>'message', ''), 2000),
    left(nullif(payload->>'source_path', ''), 500),
    coalesce(payload->'metadata', '{}'::jsonb),
    left(nullif(payload->>'recipient_email', ''), 180),
    false
  )
  returning id into inserted_id;

  return inserted_id;
end;
$function$;

grant insert on table public.analytics_page_views to anon;
grant insert on table public.analytics_events to anon;

drop policy if exists "Public can create analytics page views" on public.analytics_page_views;

create policy "Public can create analytics page views"
  on public.analytics_page_views
  for insert
  to anon
  with check (
    length(coalesce(session_id, ''::text)) between 1 and 160
    and length(coalesce(visitor_id, ''::text)) between 1 and 160
    and length(coalesce(page_path, ''::text)) between 1 and 500
    and (page_title is null or length(page_title) <= 300)
    and (referrer is null or length(referrer) <= 800)
    and (source is null or length(source) <= 120)
    and (medium is null or length(medium) <= 120)
    and (campaign is null or length(campaign) <= 180)
    and (device_type is null or length(device_type) <= 40)
    and (browser_language is null or length(browser_language) <= 80)
    and (user_agent is null or length(user_agent) <= 500)
    and (duration_seconds is null or (duration_seconds >= 0 and duration_seconds <= 86400))
    and jsonb_typeof(metadata) = 'object'::text
    and octet_length(metadata::text) <= 5000
  );

drop policy if exists "Public can create analytics events" on public.analytics_events;

create policy "Public can create analytics events"
  on public.analytics_events
  for insert
  to anon
  with check (
    length(coalesce(session_id, ''::text)) between 1 and 160
    and length(coalesce(visitor_id, ''::text)) between 1 and 160
    and event_type = any (array[
      'page_engagement'::text,
      'frontend_error'::text,
      'error_404'::text,
      'error_500'::text,
      'phone_click'::text,
      'email_click'::text,
      'line_click'::text,
      'join_line_click'::text,
      'google_maps_click'::text,
      'pdf_download'::text,
      'cta_click'::text,
      'reservation_click'::text,
      'form_submit'::text
    ])
    and (event_label is null or length(event_label) <= 240)
    and (page_path is null or length(page_path) <= 500)
    and (target_url is null or length(target_url) <= 800)
    and (source is null or length(source) <= 120)
    and (medium is null or length(medium) <= 120)
    and (campaign is null or length(campaign) <= 180)
    and (value is null or (value >= -1000000000 and value <= 1000000000))
    and jsonb_typeof(metadata) = 'object'::text
    and octet_length(metadata::text) <= 5000
  );
