drop policy if exists "Owners and admins can manage admin records" on public.admins;
drop policy if exists "Admins can read admin records" on public.admins;
create policy "Admins can select admin records" on public.admins for select to authenticated using (profile_id = (select private.current_profile_id()) or (select private.can_manage_users_cms()));
create policy "Admins can insert admin records" on public.admins for insert to authenticated with check ((select private.can_manage_users_cms()));
create policy "Admins can update admin records" on public.admins for update to authenticated using ((select private.can_manage_users_cms())) with check ((select private.can_manage_users_cms()));
create policy "Admins can delete admin records" on public.admins for delete to authenticated using ((select private.can_manage_users_cms()));

drop policy if exists "CMS users can manage article categories" on public.article_categories;
drop policy if exists "Enabled article categories are public" on public.article_categories;
create policy "Anon can read enabled article categories" on public.article_categories for select to anon using (is_enabled = true);
create policy "Authenticated can read article categories" on public.article_categories for select to authenticated using (is_enabled = true or (select private.can_edit_articles_cms()));
create policy "CMS users can insert article categories" on public.article_categories for insert to authenticated with check ((select private.can_edit_articles_cms()));
create policy "CMS users can update article categories" on public.article_categories for update to authenticated using ((select private.can_edit_articles_cms())) with check ((select private.can_edit_articles_cms()));
create policy "CMS users can delete article categories" on public.article_categories for delete to authenticated using ((select private.can_edit_articles_cms()));

drop policy if exists "CMS users can manage articles" on public.articles;
drop policy if exists "Published articles are public" on public.articles;
create policy "Anon can read published articles" on public.articles for select to anon using (is_enabled = true and status = 'published'::cms_publish_status and published_at <= now());
create policy "Authenticated can read articles" on public.articles for select to authenticated using ((is_enabled = true and status = 'published'::cms_publish_status and published_at <= now()) or (select private.can_edit_articles_cms()));
create policy "CMS users can insert articles" on public.articles for insert to authenticated with check ((select private.can_edit_articles_cms()));
create policy "CMS users can update articles" on public.articles for update to authenticated using ((select private.can_edit_articles_cms())) with check ((select private.can_edit_articles_cms()));
create policy "CMS users can delete articles" on public.articles for delete to authenticated using ((select private.can_edit_articles_cms()));

drop policy if exists "CMS users can manage care stories" on public.care_stories;
drop policy if exists "Published care stories are public" on public.care_stories;
create policy "Anon can read published care stories" on public.care_stories for select to anon using (is_enabled = true and status = 'published'::cms_publish_status and published_at <= now());
create policy "Authenticated can read care stories" on public.care_stories for select to authenticated using ((is_enabled = true and status = 'published'::cms_publish_status and published_at <= now()) or (select private.can_edit_articles_cms()));
create policy "CMS users can insert care stories" on public.care_stories for insert to authenticated with check ((select private.can_edit_articles_cms()));
create policy "CMS users can update care stories" on public.care_stories for update to authenticated using ((select private.can_edit_articles_cms())) with check ((select private.can_edit_articles_cms()));
create policy "CMS users can delete care stories" on public.care_stories for delete to authenticated using ((select private.can_edit_articles_cms()));

drop policy if exists "CMS users can manage content modules" on public.content_modules;
drop policy if exists "Published content modules are public" on public.content_modules;
create policy "Anon can read published content modules" on public.content_modules for select to anon using (is_enabled = true and status = 'published'::cms_publish_status and published_at <= now());
create policy "Authenticated can read content modules" on public.content_modules for select to authenticated using ((is_enabled = true and status = 'published'::cms_publish_status and published_at <= now()) or (select private.can_edit_pages_cms()));
create policy "CMS users can insert content modules" on public.content_modules for insert to authenticated with check ((select private.can_edit_pages_cms()));
create policy "CMS users can update content modules" on public.content_modules for update to authenticated using ((select private.can_edit_pages_cms())) with check ((select private.can_edit_pages_cms()));
create policy "CMS users can delete content modules" on public.content_modules for delete to authenticated using ((select private.can_edit_pages_cms()));

drop policy if exists "CMS users can manage content templates" on public.content_templates;
drop policy if exists "Enabled content templates are public" on public.content_templates;
create policy "Anon can read enabled content templates" on public.content_templates for select to anon using (is_enabled = true);
create policy "Authenticated can read content templates" on public.content_templates for select to authenticated using (is_enabled = true or (select private.can_edit_articles_cms()));
create policy "CMS users can insert content templates" on public.content_templates for insert to authenticated with check ((select private.can_edit_articles_cms()));
create policy "CMS users can update content templates" on public.content_templates for update to authenticated using ((select private.can_edit_articles_cms())) with check ((select private.can_edit_articles_cms()));
create policy "CMS users can delete content templates" on public.content_templates for delete to authenticated using ((select private.can_edit_articles_cms()));

drop policy if exists "CMS users can manage courses" on public.courses;
drop policy if exists "Published courses are public" on public.courses;
create policy "Anon can read published courses" on public.courses for select to anon using (is_enabled = true and status = 'published'::cms_publish_status and published_at <= now());
create policy "Authenticated can read courses" on public.courses for select to authenticated using ((is_enabled = true and status = 'published'::cms_publish_status and published_at <= now()) or (select private.can_edit_courses_cms()));
create policy "CMS users can insert courses" on public.courses for insert to authenticated with check ((select private.can_edit_courses_cms()));
create policy "CMS users can update courses" on public.courses for update to authenticated using ((select private.can_edit_courses_cms())) with check ((select private.can_edit_courses_cms()));
create policy "CMS users can delete courses" on public.courses for delete to authenticated using ((select private.can_edit_courses_cms()));

drop policy if exists "CMS users can manage downloadable files" on public.downloadable_files;
drop policy if exists "Published downloadable files are public" on public.downloadable_files;
create policy "Anon can read published downloadable files" on public.downloadable_files for select to anon using (is_enabled = true and is_public = true and status = 'published'::cms_publish_status and published_at <= now());
create policy "Authenticated can read downloadable files" on public.downloadable_files for select to authenticated using ((is_enabled = true and is_public = true and status = 'published'::cms_publish_status and published_at <= now()) or (select private.can_manage_files_cms()));
create policy "CMS users can insert downloadable files" on public.downloadable_files for insert to authenticated with check ((select private.can_manage_files_cms()));
create policy "CMS users can update downloadable files" on public.downloadable_files for update to authenticated using ((select private.can_manage_files_cms())) with check ((select private.can_manage_files_cms()));
create policy "CMS users can delete downloadable files" on public.downloadable_files for delete to authenticated using ((select private.can_manage_files_cms()));

drop policy if exists "CMS users can manage expert talks" on public.expert_talks;
drop policy if exists "Published expert talks are public" on public.expert_talks;
create policy "Anon can read published expert talks" on public.expert_talks for select to anon using (is_enabled = true and status = 'published'::cms_publish_status and published_at <= now());
create policy "Authenticated can read expert talks" on public.expert_talks for select to authenticated using ((is_enabled = true and status = 'published'::cms_publish_status and published_at <= now()) or (select private.can_edit_articles_cms()));
create policy "CMS users can insert expert talks" on public.expert_talks for insert to authenticated with check ((select private.can_edit_articles_cms()));
create policy "CMS users can update expert talks" on public.expert_talks for update to authenticated using ((select private.can_edit_articles_cms())) with check ((select private.can_edit_articles_cms()));
create policy "CMS users can delete expert talks" on public.expert_talks for delete to authenticated using ((select private.can_edit_articles_cms()));

drop policy if exists "CMS users can manage investor chart datasets" on public.investor_chart_datasets;
drop policy if exists "Published investor chart datasets are public" on public.investor_chart_datasets;
create policy "Anon can read published investor chart datasets" on public.investor_chart_datasets for select to anon using (is_enabled = true and status = 'published'::cms_publish_status and published_at <= now());
create policy "Authenticated can read investor chart datasets" on public.investor_chart_datasets for select to authenticated using ((is_enabled = true and status = 'published'::cms_publish_status and published_at <= now()) or (select private.can_edit_pages_cms()));
create policy "CMS users can insert investor chart datasets" on public.investor_chart_datasets for insert to authenticated with check ((select private.can_edit_pages_cms()));
create policy "CMS users can update investor chart datasets" on public.investor_chart_datasets for update to authenticated using ((select private.can_edit_pages_cms())) with check ((select private.can_edit_pages_cms()));
create policy "CMS users can delete investor chart datasets" on public.investor_chart_datasets for delete to authenticated using ((select private.can_edit_pages_cms()));

drop policy if exists "CMS users can manage investor financial items" on public.investor_financial_items;
drop policy if exists "Published investor financial items are public" on public.investor_financial_items;
create policy "Anon can read published investor financial items" on public.investor_financial_items for select to anon using (is_enabled = true and status = 'published'::cms_publish_status and published_at <= now());
create policy "Authenticated can read investor financial items" on public.investor_financial_items for select to authenticated using ((is_enabled = true and status = 'published'::cms_publish_status and published_at <= now()) or (select private.can_edit_pages_cms()));
create policy "CMS users can insert investor financial items" on public.investor_financial_items for insert to authenticated with check ((select private.can_edit_pages_cms()));
create policy "CMS users can update investor financial items" on public.investor_financial_items for update to authenticated using ((select private.can_edit_pages_cms())) with check ((select private.can_edit_pages_cms()));
create policy "CMS users can delete investor financial items" on public.investor_financial_items for delete to authenticated using ((select private.can_edit_pages_cms()));

drop policy if exists "CMS users can manage investor notices" on public.investor_notices;
drop policy if exists "Published investor notices are public" on public.investor_notices;
create policy "Anon can read published investor notices" on public.investor_notices for select to anon using (is_enabled = true and status = 'published'::cms_publish_status and published_at <= now());
create policy "Authenticated can read investor notices" on public.investor_notices for select to authenticated using ((is_enabled = true and status = 'published'::cms_publish_status and published_at <= now()) or (select private.can_edit_pages_cms()));
create policy "CMS users can insert investor notices" on public.investor_notices for insert to authenticated with check ((select private.can_edit_pages_cms()));
create policy "CMS users can update investor notices" on public.investor_notices for update to authenticated using ((select private.can_edit_pages_cms())) with check ((select private.can_edit_pages_cms()));
create policy "CMS users can delete investor notices" on public.investor_notices for delete to authenticated using ((select private.can_edit_pages_cms()));

drop policy if exists "CMS users can manage media" on public.media;
drop policy if exists "Public media is readable" on public.media;
create policy "Anon can read public media" on public.media for select to anon using (is_enabled = true and visibility = 'public'::cms_media_visibility);
create policy "Authenticated can read media" on public.media for select to authenticated using ((is_enabled = true and visibility = 'public'::cms_media_visibility) or (select private.can_manage_media_cms()));
create policy "CMS users can insert media" on public.media for insert to authenticated with check ((select private.can_manage_media_cms()));
create policy "CMS users can update media" on public.media for update to authenticated using ((select private.can_manage_media_cms())) with check ((select private.can_manage_media_cms()));
create policy "CMS users can delete media" on public.media for delete to authenticated using ((select private.can_manage_media_cms()));

drop policy if exists "CMS users can manage page sections" on public.page_sections;
drop policy if exists "Published page sections are public" on public.page_sections;
create policy "Anon can read published page sections" on public.page_sections for select to anon using (is_enabled = true and status = 'published'::cms_publish_status and published_at <= now());
create policy "Authenticated can read page sections" on public.page_sections for select to authenticated using ((is_enabled = true and status = 'published'::cms_publish_status and published_at <= now()) or (select private.can_edit_pages_cms()));
create policy "CMS users can insert page sections" on public.page_sections for insert to authenticated with check ((select private.can_edit_pages_cms()));
create policy "CMS users can update page sections" on public.page_sections for update to authenticated using ((select private.can_edit_pages_cms())) with check ((select private.can_edit_pages_cms()));
create policy "CMS users can delete page sections" on public.page_sections for delete to authenticated using ((select private.can_edit_pages_cms()));

drop policy if exists "CMS users can manage page template fields" on public.page_template_fields;
drop policy if exists "Enabled page template fields are public" on public.page_template_fields;
create policy "Anon can read enabled page template fields" on public.page_template_fields for select to anon using (is_enabled = true);
create policy "Authenticated can read page template fields" on public.page_template_fields for select to authenticated using (is_enabled = true or (select private.can_edit_pages_cms()));
create policy "CMS users can insert page template fields" on public.page_template_fields for insert to authenticated with check ((select private.can_edit_pages_cms()));
create policy "CMS users can update page template fields" on public.page_template_fields for update to authenticated using ((select private.can_edit_pages_cms())) with check ((select private.can_edit_pages_cms()));
create policy "CMS users can delete page template fields" on public.page_template_fields for delete to authenticated using ((select private.can_edit_pages_cms()));

drop policy if exists "CMS users can manage pages" on public.pages;
drop policy if exists "Published pages are public" on public.pages;
create policy "Anon can read published pages" on public.pages for select to anon using (is_enabled = true and status = 'published'::cms_publish_status and published_at <= now());
create policy "Authenticated can read pages" on public.pages for select to authenticated using ((is_enabled = true and status = 'published'::cms_publish_status and published_at <= now()) or (select private.can_edit_pages_cms()));
create policy "CMS users can insert pages" on public.pages for insert to authenticated with check ((select private.can_edit_pages_cms()));
create policy "CMS users can update pages" on public.pages for update to authenticated using ((select private.can_edit_pages_cms())) with check ((select private.can_edit_pages_cms()));
create policy "CMS users can delete pages" on public.pages for delete to authenticated using ((select private.can_edit_pages_cms()));

drop policy if exists "Admins can manage profiles" on public.profiles;
drop policy if exists "Profiles can read own profile" on public.profiles;
drop policy if exists "Users can create own viewer profile" on public.profiles;
create policy "Authenticated can read profiles" on public.profiles for select to authenticated using (user_id = (select auth.uid()) or (select private.current_admin_role()) = any (array['owner'::cms_admin_role, 'admin'::cms_admin_role]) or (select private.can_manage_users_cms()));
create policy "Authenticated can insert profiles" on public.profiles for insert to authenticated with check (((user_id = (select auth.uid()) and role = 'viewer'::cms_admin_role and is_active = true) or (select private.can_manage_users_cms())));
create policy "Admins can update profiles" on public.profiles for update to authenticated using ((select private.can_manage_users_cms())) with check ((select private.can_manage_users_cms()));
create policy "Admins can delete profiles" on public.profiles for delete to authenticated using ((select private.can_manage_users_cms()));

drop policy if exists "CMS users can manage recruiting departments" on public.recruiting_departments;
drop policy if exists "Published recruiting departments are public" on public.recruiting_departments;
create policy "Anon can read published recruiting departments" on public.recruiting_departments for select to anon using (is_enabled = true and status = 'published'::cms_publish_status and published_at <= now());
create policy "Authenticated can read recruiting departments" on public.recruiting_departments for select to authenticated using ((is_enabled = true and status = 'published'::cms_publish_status and published_at <= now()) or (select private.can_edit_pages_cms()));
create policy "CMS users can insert recruiting departments" on public.recruiting_departments for insert to authenticated with check ((select private.can_edit_pages_cms()));
create policy "CMS users can update recruiting departments" on public.recruiting_departments for update to authenticated using ((select private.can_edit_pages_cms())) with check ((select private.can_edit_pages_cms()));
create policy "CMS users can delete recruiting departments" on public.recruiting_departments for delete to authenticated using ((select private.can_edit_pages_cms()));

drop policy if exists "CMS users can manage recruiting openings" on public.recruiting_openings;
drop policy if exists "Published recruiting openings are public" on public.recruiting_openings;
create policy "Anon can read published recruiting openings" on public.recruiting_openings for select to anon using (is_enabled = true and status = 'published'::cms_publish_status and published_at <= now());
create policy "Authenticated can read recruiting openings" on public.recruiting_openings for select to authenticated using ((is_enabled = true and status = 'published'::cms_publish_status and published_at <= now()) or (select private.can_edit_pages_cms()));
create policy "CMS users can insert recruiting openings" on public.recruiting_openings for insert to authenticated with check ((select private.can_edit_pages_cms()));
create policy "CMS users can update recruiting openings" on public.recruiting_openings for update to authenticated using ((select private.can_edit_pages_cms())) with check ((select private.can_edit_pages_cms()));
create policy "CMS users can delete recruiting openings" on public.recruiting_openings for delete to authenticated using ((select private.can_edit_pages_cms()));

drop policy if exists "CMS users can manage recruiting pages" on public.recruiting_pages;
drop policy if exists "Published recruiting pages are public" on public.recruiting_pages;
create policy "Anon can read published recruiting pages" on public.recruiting_pages for select to anon using (is_enabled = true and status = 'published'::cms_publish_status and published_at <= now());
create policy "Authenticated can read recruiting pages" on public.recruiting_pages for select to authenticated using ((is_enabled = true and status = 'published'::cms_publish_status and published_at <= now()) or (select private.can_edit_pages_cms()));
create policy "CMS users can insert recruiting pages" on public.recruiting_pages for insert to authenticated with check ((select private.can_edit_pages_cms()));
create policy "CMS users can update recruiting pages" on public.recruiting_pages for update to authenticated using ((select private.can_edit_pages_cms())) with check ((select private.can_edit_pages_cms()));
create policy "CMS users can delete recruiting pages" on public.recruiting_pages for delete to authenticated using ((select private.can_edit_pages_cms()));

drop policy if exists "CMS users can manage site settings" on public.site_settings;
drop policy if exists "Enabled site settings are public" on public.site_settings;
create policy "Anon can read enabled site settings" on public.site_settings for select to anon using (is_enabled = true);
create policy "Authenticated can read site settings" on public.site_settings for select to authenticated using (is_enabled = true or (select private.can_edit_pages_cms()));
create policy "CMS users can insert site settings" on public.site_settings for insert to authenticated with check ((select private.can_edit_pages_cms()));
create policy "CMS users can update site settings" on public.site_settings for update to authenticated using ((select private.can_edit_pages_cms())) with check ((select private.can_edit_pages_cms()));
create policy "CMS users can delete site settings" on public.site_settings for delete to authenticated using ((select private.can_edit_pages_cms()));
