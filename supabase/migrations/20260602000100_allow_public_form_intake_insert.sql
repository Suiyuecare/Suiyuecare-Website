-- Allow public website forms to create submissions even when the Vercel API
-- falls back to the publishable/anon key. RLS still blocks anonymous reads,
-- updates, and deletes because this policy grants INSERT only.

grant insert on public.form_submissions to anon;

drop policy if exists "Public can create form submissions" on public.form_submissions;
create policy "Public can create form submissions"
on public.form_submissions
for insert
to anon
with check (
  form_type in ('contact', 'course_signup', 'investor', 'land', 'recruiting')
  and status = 'new'
  and length(coalesce(name, '')) between 1 and 160
  and length(coalesce(phone, '')) between 1 and 80
  and length(coalesce(email, '')) between 3 and 180
);
