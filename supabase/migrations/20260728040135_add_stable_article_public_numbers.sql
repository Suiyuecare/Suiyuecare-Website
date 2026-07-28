-- Keep public article URLs stable while internal titles and slugs remain editable.
alter table public.articles
  add column if not exists public_number integer;

comment on column public.articles.public_number is
  'Stable public URL number used by /article/article{number}. Assigned only when an article becomes public.';

with article_numbers(source_slug, public_number) as (
  values
    ('daily-hydration-care', 1),
    ('night-fall-prevention', 2),
    ('meal-appetite-support', 3),
    ('caregiver-burnout-signs', 4),
    ('dementia-bathing-refusal', 5),
    ('home-reablement-routine', 6),
    ('daycare-first-week', 7),
    ('migrant-care-handover', 8),
    ('hospital-discharge-checklist', 9),
    ('family-meeting-care-plan', 10),
    ('care-transfer-safe-home', 11),
    ('longterm-care-apply-checklist-2026', 12),
    ('safe-transfer-three-reminders', 13),
    ('longterm-care-apply', 14),
    ('nutrition-soft-food-guide', 15),
    ('dementia-evening-anxiety', 16),
    ('family-care-report-rhythm', 17),
    ('community-health-class-family-day', 18),
    ('home-care-video-guide-communication', 19),
    ('short-video-bathroom-safety-3-tips', 20),
    ('master-talk-care-communication', 21),
    ('reablement-walking-home-practice', 22),
    ('bathroom-safety', 23),
    ('fall-observation', 24),
    ('day-care-video-guide', 25),
    ('home-care-video-guide', 26),
    ('reablement-workshop', 27),
    ('elder-nutrition-warning', 28),
    ('day-care-respite', 29),
    ('dementia-repeated-question', 30),
    ('family-care-course', 31),
    ('caregiver-burnout-first-steps', 32),
    ('dementia-response', 33),
    ('master-talk-care-psychology', 34),
    ('family-care-story', 35),
    ('fall-prevention-home-checklist', 36),
    ('hydration-low-appetite-elderly', 37),
    ('dementia-evening-agitation', 38),
    ('post-discharge-first-week', 39),
    ('safe-bathing-care', 40),
    ('pressure-injury-prevention', 41),
    ('medication-reminder-system', 42),
    ('day-care-transition', 43),
    ('swallowing-meal-safety', 44),
    ('safe-transfer-tips', 45),
    ('nutrition-warning', 46),
    ('caregiver-support', 47),
    ('master-talk-senior-nutrition', 48),
    ('master-talk-rehab-goals', 49),
    ('master-talk-home-safety', 50),
    ('master-talk-care-management', 51),
    ('master-talk-dementia-care', 52),
    ('master-talk-nursing-observation', 53),
    ('master-talk-family-communication', 54),
    ('master-talk-community-health', 55),
    ('master-talk-longterm-policy', 56),
    ('master-talk-medication-safety', 57),
    ('master-talk-frailty-prevention', 58),
    ('master-talk-swallowing-care', 59),
    ('master-talk-sleep-rhythm', 60),
    ('master-talk-care-subsidy', 61),
    ('master-talk-careworker-training', 62),
    ('master-talk-care-technology', 63),
    ('master-talk-discharge-transition', 64),
    ('master-talk-pressure-injury-care', 65),
    ('master-talk-daycare-transition', 66),
    ('master-talk-caregiver-burnout', 67),
    ('master-talk-medication-reminder', 68),
    ('chronic-disease-visit-prep', 69),
    ('elder-constipation-care', 70),
    ('pain-observation-elderly', 71),
    ('oral-care-aspiration-prevention', 72),
    ('urinary-incontinence-night-care', 73),
    ('social-isolation-depression-signs', 74),
    ('assistive-device-selection', 75),
    ('home-emergency-care-folder', 76),
    ('heat-injury-older-adults', 77),
    ('family-care-meeting-guide', 78),
    ('careworker-hard-work-overview', 79),
    ('careworker-back-pain-transfer', 80),
    ('careworker-emotional-labor', 81),
    ('home-careworker-travel-between-homes', 82),
    ('careworker-service-boundaries-family', 83),
    ('dementia-careworker-safety', 84),
    ('careworker-shift-sleep-fatigue', 85),
    ('careworker-records-supervision-support', 86),
    ('careworker-respect-retention', 87),
    ('new-careworker-first-year', 88),
    ('elderly-hypertension-lazy-pack', 89),
    ('elderly-diabetes-lazy-pack', 90),
    ('elderly-dementia-lazy-pack', 91),
    ('elderly-stroke-lazy-pack', 92),
    ('elderly-heart-disease-lazy-pack', 93),
    ('elderly-copd-lazy-pack', 94),
    ('elderly-osteoporosis-lazy-pack', 95),
    ('elderly-osteoarthritis-lazy-pack', 96),
    ('elderly-parkinson-lazy-pack', 97),
    ('elderly-chronic-kidney-disease-lazy-pack', 98)
)
update public.articles as article
set public_number = article_numbers.public_number
from article_numbers
where article.slug = article_numbers.source_slug
  and article.status = 'published'
  and article.is_enabled is true
  and article.public_number is null;

create unique index if not exists articles_public_number_key
  on public.articles(public_number)
  where public_number is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'articles_public_number_positive'
      and conrelid = 'public.articles'::regclass
  ) then
    alter table public.articles
      add constraint articles_public_number_positive
      check (public_number is null or public_number > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'articles_public_number_required_when_public'
      and conrelid = 'public.articles'::regclass
  ) then
    alter table public.articles
      add constraint articles_public_number_required_when_public
      check (
        status <> 'published'
        or is_enabled is not true
        or public_number is not null
      );
  end if;
end
$$;

create sequence if not exists private.article_public_number_seq
  as integer
  start with 99
  increment by 1
  minvalue 1
  no cycle;

select setval(
  'private.article_public_number_seq',
  greatest(
    98,
    coalesce((select max(public_number) from public.articles), 98)
  ),
  true
);

create or replace function private.assign_article_public_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  known_number integer;
begin
  if new.status = 'published'
     and new.is_enabled is true
     and new.public_number is null then
    select mapped.public_number
    into known_number
    from (
      values
        ('daily-hydration-care', 1),
        ('night-fall-prevention', 2),
        ('meal-appetite-support', 3),
        ('caregiver-burnout-signs', 4),
        ('dementia-bathing-refusal', 5),
        ('home-reablement-routine', 6),
        ('daycare-first-week', 7),
        ('migrant-care-handover', 8),
        ('hospital-discharge-checklist', 9),
        ('family-meeting-care-plan', 10),
        ('care-transfer-safe-home', 11),
        ('longterm-care-apply-checklist-2026', 12),
        ('safe-transfer-three-reminders', 13),
        ('longterm-care-apply', 14),
        ('nutrition-soft-food-guide', 15),
        ('dementia-evening-anxiety', 16),
        ('family-care-report-rhythm', 17),
        ('community-health-class-family-day', 18),
        ('home-care-video-guide-communication', 19),
        ('short-video-bathroom-safety-3-tips', 20),
        ('master-talk-care-communication', 21),
        ('reablement-walking-home-practice', 22),
        ('bathroom-safety', 23),
        ('fall-observation', 24),
        ('day-care-video-guide', 25),
        ('home-care-video-guide', 26),
        ('reablement-workshop', 27),
        ('elder-nutrition-warning', 28),
        ('day-care-respite', 29),
        ('dementia-repeated-question', 30),
        ('family-care-course', 31),
        ('caregiver-burnout-first-steps', 32),
        ('dementia-response', 33),
        ('master-talk-care-psychology', 34),
        ('family-care-story', 35),
        ('fall-prevention-home-checklist', 36),
        ('hydration-low-appetite-elderly', 37),
        ('dementia-evening-agitation', 38),
        ('post-discharge-first-week', 39),
        ('safe-bathing-care', 40),
        ('pressure-injury-prevention', 41),
        ('medication-reminder-system', 42),
        ('day-care-transition', 43),
        ('swallowing-meal-safety', 44),
        ('safe-transfer-tips', 45),
        ('nutrition-warning', 46),
        ('caregiver-support', 47),
        ('master-talk-senior-nutrition', 48),
        ('master-talk-rehab-goals', 49),
        ('master-talk-home-safety', 50),
        ('master-talk-care-management', 51),
        ('master-talk-dementia-care', 52),
        ('master-talk-nursing-observation', 53),
        ('master-talk-family-communication', 54),
        ('master-talk-community-health', 55),
        ('master-talk-longterm-policy', 56),
        ('master-talk-medication-safety', 57),
        ('master-talk-frailty-prevention', 58),
        ('master-talk-swallowing-care', 59),
        ('master-talk-sleep-rhythm', 60),
        ('master-talk-care-subsidy', 61),
        ('master-talk-careworker-training', 62),
        ('master-talk-care-technology', 63),
        ('master-talk-discharge-transition', 64),
        ('master-talk-pressure-injury-care', 65),
        ('master-talk-daycare-transition', 66),
        ('master-talk-caregiver-burnout', 67),
        ('master-talk-medication-reminder', 68),
        ('chronic-disease-visit-prep', 69),
        ('elder-constipation-care', 70),
        ('pain-observation-elderly', 71),
        ('oral-care-aspiration-prevention', 72),
        ('urinary-incontinence-night-care', 73),
        ('social-isolation-depression-signs', 74),
        ('assistive-device-selection', 75),
        ('home-emergency-care-folder', 76),
        ('heat-injury-older-adults', 77),
        ('family-care-meeting-guide', 78),
        ('careworker-hard-work-overview', 79),
        ('careworker-back-pain-transfer', 80),
        ('careworker-emotional-labor', 81),
        ('home-careworker-travel-between-homes', 82),
        ('careworker-service-boundaries-family', 83),
        ('dementia-careworker-safety', 84),
        ('careworker-shift-sleep-fatigue', 85),
        ('careworker-records-supervision-support', 86),
        ('careworker-respect-retention', 87),
        ('new-careworker-first-year', 88),
        ('elderly-hypertension-lazy-pack', 89),
        ('elderly-diabetes-lazy-pack', 90),
        ('elderly-dementia-lazy-pack', 91),
        ('elderly-stroke-lazy-pack', 92),
        ('elderly-heart-disease-lazy-pack', 93),
        ('elderly-copd-lazy-pack', 94),
        ('elderly-osteoporosis-lazy-pack', 95),
        ('elderly-osteoarthritis-lazy-pack', 96),
        ('elderly-parkinson-lazy-pack', 97),
        ('elderly-chronic-kidney-disease-lazy-pack', 98)
    ) as mapped(source_slug, public_number)
    where mapped.source_slug = new.slug;

    new.public_number := coalesce(
      known_number,
      nextval('private.article_public_number_seq')
    );
  end if;

  return new;
end
$$;

revoke all on function private.assign_article_public_number() from public;
revoke all on function private.assign_article_public_number() from anon;
revoke all on function private.assign_article_public_number() from authenticated;

drop trigger if exists assign_article_public_number on public.articles;
create trigger assign_article_public_number
before insert or update of status, is_enabled, slug
on public.articles
for each row
execute function private.assign_article_public_number();
