-- Launch readiness: preserve form submissions and seed basic Health 3.0 content.

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  form_type text not null default 'contact',
  name text,
  phone text,
  email text,
  subject text,
  message text,
  source_path text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed', 'spam')),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists form_submissions_created_at_idx on public.form_submissions(created_at desc);
create index if not exists form_submissions_status_idx on public.form_submissions(status, created_at desc);
create index if not exists form_submissions_type_idx on public.form_submissions(form_type, created_at desc);

alter table public.form_submissions enable row level security;

drop policy if exists "CMS users can manage form submissions" on public.form_submissions;
create policy "CMS users can manage form submissions"
on public.form_submissions
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

grant select, insert, update, delete on public.form_submissions to authenticated;

create or replace function public.submit_form_submission(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_id uuid;
begin
  insert into public.form_submissions (
    form_type,
    name,
    phone,
    email,
    subject,
    message,
    source_path,
    metadata
  )
  values (
    left(coalesce(payload->>'form_type', 'contact'), 80),
    left(nullif(payload->>'name', ''), 160),
    left(nullif(payload->>'phone', ''), 80),
    left(nullif(payload->>'email', ''), 180),
    left(nullif(payload->>'subject', ''), 220),
    left(nullif(payload->>'message', ''), 2000),
    left(nullif(payload->>'source_path', ''), 500),
    coalesce(payload->'metadata', '{}'::jsonb)
  )
  returning id into inserted_id;

  return inserted_id;
end;
$$;

revoke all on function public.submit_form_submission(jsonb) from public;
grant execute on function public.submit_form_submission(jsonb) to anon, authenticated;

-- Seed categories so Health 3.0 is not empty on launch.
insert into public.article_categories (name, slug, description, sort_order, is_enabled, type, seo_title, seo_description)
values
  ('照顧技巧', 'care-skills', '家屬與照顧者每天用得到的安全照顧技巧。', 10, true, 'article', '照顧技巧｜健康3.0', '長輩移位、跌倒預防、居家安全與照顧溝通技巧。'),
  ('飲食營養', 'nutrition', '長輩飲食、營養、肌力與食慾觀察。', 20, true, 'article', '飲食營養｜健康3.0', '長輩吃得少、營養不足與日常飲食照顧提醒。'),
  ('失智照顧', 'dementia-care', '失智症陪伴、情緒安撫與家庭溝通。', 30, true, 'article', '失智照顧｜健康3.0', '失智長輩重複提問、情緒不安與日常陪伴方法。'),
  ('家屬支持', 'family-support', '照顧者壓力、喘息服務與家庭分工。', 40, true, 'article', '家屬支持｜健康3.0', '協助家庭照顧者找到喘息、分工與支持資源。'),
  ('名人講堂', 'master-talk', '專家與講師分享照顧觀點。', 50, true, 'article', '名人講堂｜健康3.0', '照顧心理、營養、復能與政策觀點分享。')
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_enabled = true,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = now();

-- Use existing bundled site images as CMS media records.
insert into public.media (bucket, storage_path, public_url, file_name, mime_type, alt_text, visibility, is_enabled, image_usage, focal_point)
values
  ('site-assets', 'assets/homepage-batch/18-health-fall-prevention-cover.png', '/assets/homepage-batch/18-health-fall-prevention-cover.png', '18-health-fall-prevention-cover.png', 'image/png', '長輩起身與跌倒預防照顧封面', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/17-health-nutrition-cover.png', '/assets/homepage-batch/17-health-nutrition-cover.png', '17-health-nutrition-cover.png', 'image/png', '長輩飲食營養照顧封面', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/19-health-dementia-cover.png', '/assets/homepage-batch/19-health-dementia-cover.png', '19-health-dementia-cover.png', 'image/png', '失智照顧陪伴封面', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/20-health-caregiver-stress-cover.png', '/assets/homepage-batch/20-health-caregiver-stress-cover.png', '20-health-caregiver-stress-cover.png', 'image/png', '家屬照顧壓力支持封面', 'public', true, 'article_cover', 'center'),
  ('site-assets', 'assets/homepage-batch/10-family-consultation.png', '/assets/homepage-batch/10-family-consultation.png', '10-family-consultation.png', 'image/png', '照顧諮詢與名人講堂封面', 'public', true, 'article_cover', 'center')
on conflict (bucket, storage_path) do update
set
  public_url = excluded.public_url,
  alt_text = excluded.alt_text,
  image_usage = excluded.image_usage,
  focal_point = excluded.focal_point,
  is_enabled = true,
  visibility = 'public',
  updated_at = now();

insert into public.articles (
  category_id,
  slug,
  title,
  subtitle,
  excerpt,
  content,
  cover_image_id,
  author_name,
  tags,
  sort_order,
  is_featured,
  is_enabled,
  status,
  published_at,
  seo_title,
  seo_description
)
values
  (
    (select id from public.article_categories where slug = 'care-skills'),
    'safe-transfer-three-reminders',
    '協助長輩安全起身的三個提醒',
    '先穩定、再移動，讓每一次起身都更安全。',
    '家屬協助長輩起身時，先確認動線、支撐點與節奏，比用力拉起更重要。',
    '照顧長輩起身時，請先確認地面止滑、椅子穩定與長輩是否已坐穩。第二步是讓長輩雙腳踩實，照顧者站在側前方提供支撐。第三步是用口令建立節奏，不要突然拉扯。若長輩近期跌倒、頭暈或下肢無力，建議先諮詢專業人員。',
    (select id from public.media where storage_path = 'assets/homepage-batch/18-health-fall-prevention-cover.png'),
    '歲悅照顧編輯部',
    array['跌倒預防','移位','居家安全'],
    10,
    true,
    true,
    'published',
    now() - interval '1 day',
    '協助長輩安全起身的三個提醒｜健康3.0',
    '協助長輩起身、移位與跌倒預防的三個居家照顧提醒。'
  ),
  (
    (select id from public.article_categories where slug = 'nutrition'),
    'elder-nutrition-warning',
    '吃得少不是正常老化，家人該先看哪些訊號？',
    '從食慾、體重、肌力與精神狀態快速觀察。',
    '長輩吃得少不一定只是胃口變差，也可能與疾病、藥物、牙口或情緒有關。',
    '家屬可以先觀察四件事：體重是否明顯下降、平常喜歡的食物是否也不想吃、走路與起身是否變弱、精神是否比平常差。如果狀況持續超過一週，建議紀錄飲食量並諮詢醫療或營養專業。',
    (select id from public.media where storage_path = 'assets/homepage-batch/17-health-nutrition-cover.png'),
    '歲悅營養照顧小組',
    array['營養','食慾','肌力'],
    20,
    false,
    true,
    'published',
    now() - interval '2 days',
    '長輩吃得少怎麼辦｜健康3.0',
    '長輩食慾下降、體重減輕與營養不足的家庭觀察重點。'
  ),
  (
    (select id from public.article_categories where slug = 'dementia-care'),
    'dementia-repeated-question',
    '重複提問怎麼回應，才不會讓彼此更焦慮？',
    '理解不安，比急著糾正更重要。',
    '面對失智長輩重複提問，家屬可以用穩定語句與環境提示降低焦慮。',
    '重複提問的背後常常是不安、忘記或無法掌握時間。家屬可以先回應情緒，再提供簡短答案，例如「我知道你擔心，我們等一下三點出門」。也可以用白板、時鐘與固定流程提示，減少反覆拉扯。',
    (select id from public.media where storage_path = 'assets/homepage-batch/19-health-dementia-cover.png'),
    '歲悅照顧編輯部',
    array['失智','溝通','情緒安撫'],
    30,
    false,
    true,
    'published',
    now() - interval '3 days',
    '失智長輩重複提問怎麼辦｜健康3.0',
    '失智症照顧中面對重複提問與焦慮情緒的回應方法。'
  ),
  (
    (select id from public.article_categories where slug = 'family-support'),
    'caregiver-burnout-first-steps',
    '照顧者快撐不住時，可以先做的三件事',
    '照顧不能只靠一個人硬撐。',
    '先整理照顧時段、找到可替手的人，再尋求喘息或長照資源。',
    '當照顧者覺得自己快撐不住，第一步不是責備自己，而是把一天中最累的時段寫下來。第二步是找出哪些工作可以交給家人、照服員或日照中心。第三步是主動詢問長照服務與喘息資源，讓照顧變成可長期運作的系統。',
    (select id from public.media where storage_path = 'assets/homepage-batch/20-health-caregiver-stress-cover.png'),
    '歲悅家庭支持團隊',
    array['照顧者','喘息','家庭支持'],
    40,
    false,
    true,
    'published',
    now() - interval '4 days',
    '照顧者壓力與喘息資源｜健康3.0',
    '照顧者壓力過大時可以先做的三個整理與求助步驟。'
  ),
  (
    (select id from public.article_categories where slug = 'master-talk'),
    'master-talk-care-psychology',
    '照顧心理講師周小姐：好的照顧，是讓長輩和家屬都保有生活感',
    '照顧不是控制，而是重新建立安全與選擇。',
    '照顧心理講師分享家屬在照顧初期最需要的是可理解資訊與可求助系統。',
    '周小姐提醒，很多家庭不是不願意照顧，而是不知道下一步在哪裡。好的照顧系統要讓家屬知道誰可以問、何時該求助、哪些事情可以交給專業，讓長輩和家屬都保有生活感。',
    (select id from public.media where storage_path = 'assets/homepage-batch/10-family-consultation.png'),
    '歲悅名人講堂',
    array['名人講堂','照顧心理','家屬支持'],
    50,
    false,
    true,
    'published',
    now() - interval '5 days',
    '照顧心理講師周小姐｜健康3.0 名人講堂',
    '照顧心理講師分享長照家庭如何建立安全、選擇與可求助系統。'
  )
on conflict (slug) do update
set
  category_id = excluded.category_id,
  title = excluded.title,
  subtitle = excluded.subtitle,
  excerpt = excluded.excerpt,
  content = excluded.content,
  cover_image_id = excluded.cover_image_id,
  author_name = excluded.author_name,
  tags = excluded.tags,
  sort_order = excluded.sort_order,
  is_featured = excluded.is_featured,
  is_enabled = true,
  status = 'published',
  published_at = coalesce(public.articles.published_at, excluded.published_at),
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = now();
