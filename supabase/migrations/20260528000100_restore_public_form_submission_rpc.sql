-- Allow the public website to save form submissions without exposing table write access.
-- The function validates the payload and only inserts the limited fields used by forms.

create or replace function public.submit_form_submission(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_id uuid;
  safe_form_type text;
begin
  safe_form_type := left(coalesce(payload->>'form_type', 'contact'), 80);

  if safe_form_type not in ('contact', 'course_signup', 'investor', 'land', 'recruiting') then
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
$$;

create or replace function public.update_form_submission_email_status(
  submission_id uuid,
  email_sent_value boolean,
  submitter_email_sent_value boolean default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.form_submissions
  set
    email_sent = coalesce(email_sent_value, false),
    metadata = jsonb_set(
      coalesce(metadata, '{}'::jsonb),
      '{submitter_email_sent}',
      to_jsonb(coalesce(submitter_email_sent_value, false)),
      true
    ),
    updated_at = now()
  where id = submission_id;
end;
$$;

revoke all on function public.submit_form_submission(jsonb) from public;
revoke all on function public.update_form_submission_email_status(uuid, boolean, boolean) from public;

grant execute on function public.submit_form_submission(jsonb) to anon, authenticated, service_role;
grant execute on function public.update_form_submission_email_status(uuid, boolean, boolean) to anon, authenticated, service_role;
