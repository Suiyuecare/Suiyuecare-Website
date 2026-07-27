-- Public forms now collect only the contact information needed for a callback.
-- Keep RLS validation aligned with the server API while accepting legacy clients
-- that may still include an optional email address.

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
    and (email is null or length(email) between 3 and 180)
  );

create or replace function public.submit_form_submission(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
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
    left(nullif(trim(payload->>'name'), ''), 160),
    left(nullif(trim(payload->>'phone'), ''), 80),
    left(nullif(trim(payload->>'email'), ''), 180),
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

revoke all on function public.submit_form_submission(jsonb) from public, anon, authenticated;
grant execute on function public.submit_form_submission(jsonb) to service_role;
