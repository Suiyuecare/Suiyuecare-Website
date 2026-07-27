update public.page_template_fields
set
  text_value = 'assets/about/about-team-group-hero-v2.jpg',
  image_id = null,
  updated_at = now()
where page_slug = 'about'
  and template_key = 'service_page'
  and field_key = 'hero_image'
  and is_enabled = true;
