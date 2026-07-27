-- Private storage for optional recruiting resumes. Public visitors never receive
-- bucket access; the website API uses the server-only service key to upload.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recruiting-resumes',
  'recruiting-resumes',
  false,
  3145728,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "CMS users can read recruiting resumes" on storage.objects;
create policy "CMS users can read recruiting resumes"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'recruiting-resumes'
  and (select private.can_manage_cms())
);
