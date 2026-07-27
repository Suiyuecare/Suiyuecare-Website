-- Milestones are page content, but permanent deletion remains an owner/admin action.
drop policy if exists "CMS users can delete milestones" on public.milestones;

create policy "CMS users can delete milestones"
on public.milestones
for delete
to authenticated
using ((select private.can_delete_pages_cms()));

-- The prior migration added the expanded image usage check as NOT VALID so it
-- could be deployed safely. Existing rows are compatible, so finish validation.
alter table public.media validate constraint media_image_usage_check;

-- page_template_fields has no draft/status columns: an UPDATE is immediately
-- visible to anonymous visitors. Only users with publishing permission may make
-- that immediate change. Editors continue to have read access.
drop policy if exists "CMS users can insert page template fields" on public.page_template_fields;
drop policy if exists "CMS users can update page template fields" on public.page_template_fields;
drop policy if exists "CMS users can delete page template fields" on public.page_template_fields;

create policy "Publishers can insert page template fields"
on public.page_template_fields
for insert
to authenticated
with check ((select private.has_admin_permission('can_publish')));

create policy "Publishers can update page template fields"
on public.page_template_fields
for update
to authenticated
using ((select private.has_admin_permission('can_publish')))
with check ((select private.has_admin_permission('can_publish')));

create policy "Publishers can delete page template fields"
on public.page_template_fields
for delete
to authenticated
using ((select private.has_admin_permission('can_publish')));
