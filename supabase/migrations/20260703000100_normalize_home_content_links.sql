update public.content_modules
set link_url = case link_url
  when '#' || 'investors' then '/investors'
  when '#' || 'health' then '/health'
  when '#' || 'courses' then '/courses'
  when '#' || 'ir-governance' then '/ir-governance'
  when '#' || 'talent' then '/talent'
  when '#' || 'home-care' then '/home-care'
  when '#' || 'day-care' then '/day-care'
  when '#' || 'community' then '/community'
  when '#' || 'nursing' then '/nursing'
  when '#' || 'migrant-training' then '/migrant-training'
  when '#' || 'quality' then '/quality'
  when '#' || 'article-family-care-story' then '/article/family-care-story'
  when '#' || 'article-master-talk-care-psychology' then '/article/master-talk-care-psychology'
  else link_url
end
where target_slug = 'home'
  and link_url in (
    '#' || 'investors',
    '#' || 'health',
    '#' || 'courses',
    '#' || 'ir-governance',
    '#' || 'talent',
    '#' || 'home-care',
    '#' || 'day-care',
    '#' || 'community',
    '#' || 'nursing',
    '#' || 'migrant-training',
    '#' || 'quality',
    '#' || 'article-family-care-story',
    '#' || 'article-master-talk-care-psychology'
  );

update public.content_modules
set
  link_text = null,
  link_url = null,
  updated_at = now()
where target_slug = 'home'
  and module_key = 'care_story';

update public.page_sections
set metadata = jsonb_set(metadata, '{button_href}', to_jsonb('/health'::text), false)
where page_slug = 'home'
  and section_key = 'home-health'
  and metadata ->> 'button_href' = '#' || 'health';

update public.site_settings
set
  value_json = replace(
    replace(
      replace(
        replace(
          replace(
            replace(
              replace(
                replace(
                  replace(
                    replace(
                      replace(
                        replace(
                          replace(
                            replace(
                              replace(
                                replace(
                                  replace(
                                    replace(value_json::text, '"' || '#' || 'about"', '"/about"'),
                                    '"' || '#' || 'milestones"', '"/milestones"'
                                  ),
                                  '"' || '#' || 'home-care"', '"/home-care"'
                                ),
                                '"' || '#' || 'day-care"', '"/day-care"'
                              ),
                              '"' || '#' || 'community"', '"/community"'
                            ),
                            '"' || '#' || 'nursing"', '"/nursing"'
                          ),
                          '"' || '#' || 'migrant-training"', '"/migrant-training"'
                        ),
                        '"' || '#' || 'quality"', '"/quality"'
                      ),
                      '"' || '#' || 'software"', '"/software"'
                    ),
                    '"' || '#' || 'talent"', '"/talent"'
                  ),
                  '"' || '#' || 'land"', '"/land"'
                ),
                '"' || '#' || 'investor-recruiting"', '"/investor-recruiting"'
              ),
              '"' || '#' || 'health"', '"/health"'
            ),
            '"' || '#' || 'courses"', '"/courses"'
          ),
          '"' || '#' || 'investors"', '"/investors"'
        ),
        '"' || '#' || 'ir-finance"', '"/ir-finance"'
      ),
      '"' || '#' || 'ir-governance"', '"/ir-governance"'
    ),
    '"' || '#' || 'ir-shareholders"', '"/ir-shareholders"'
  )::jsonb,
  updated_at = now()
where setting_key in ('primary_nav', 'footer_columns')
  and value_json::text ~ ('"' || '#' || '(' || 'about|milestones|home-care|day-care|community|nursing|migrant-training|quality|software|talent|land|investor-recruiting|health|courses|investors|ir-finance|ir-governance|ir-shareholders' || ')"');
