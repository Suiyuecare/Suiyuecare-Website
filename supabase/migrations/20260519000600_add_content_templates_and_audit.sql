-- Content governance: templates, audit snapshots, and backup manifests.

create table if not exists public.content_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  name text not null,
  content_type text not null check (content_type in ('service_page', 'article', 'recruiting_page', 'investor_notice', 'page_section')),
  description text,
  required_fields jsonb not null default '[]'::jsonb,
  recommended_sections jsonb not null default '[]'::jsonb,
  example_json jsonb not null default '{}'::jsonb,
  is_enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_audit_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  status text not null default 'completed' check (status in ('running', 'completed', 'failed')),
  summary jsonb not null default '{}'::jsonb,
  issues jsonb not null default '[]'::jsonb
);

create table if not exists public.backup_manifests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  backup_type text not null default 'manual' check (backup_type in ('manual', 'scheduled', 'pre_deploy')),
  storage_path text,
  tables text[] not null default '{}'::text[],
  status text not null default 'created' check (status in ('created', 'uploaded', 'restored', 'failed')),
  checksum text,
  notes text,
  metadata jsonb not null default '{}'::jsonb
);

drop trigger if exists content_templates_set_updated_at on public.content_templates;
create trigger content_templates_set_updated_at
before update on public.content_templates
for each row execute function public.set_updated_at();

alter table public.content_templates enable row level security;
alter table public.content_audit_runs enable row level security;
alter table public.backup_manifests enable row level security;

drop policy if exists "Enabled content templates are public" on public.content_templates;
create policy "Enabled content templates are public"
on public.content_templates
for select
to anon, authenticated
using (is_enabled = true);

drop policy if exists "CMS users can manage content templates" on public.content_templates;
create policy "CMS users can manage content templates"
on public.content_templates
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

drop policy if exists "CMS users can manage content audit runs" on public.content_audit_runs;
create policy "CMS users can manage content audit runs"
on public.content_audit_runs
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

drop policy if exists "CMS users can manage backup manifests" on public.backup_manifests;
create policy "CMS users can manage backup manifests"
on public.backup_manifests
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

grant select on public.content_templates to anon, authenticated;
grant select, insert, update, delete on public.content_templates to authenticated;
grant select, insert, update, delete on public.content_audit_runs to authenticated;
grant select, insert, update, delete on public.backup_manifests to authenticated;

insert into public.content_templates (template_key, name, content_type, description, required_fields, recommended_sections, example_json, sort_order)
values
  (
    'service-page',
    '服務頁模板',
    'service_page',
    '適用於居家照顧、日間照顧、社區據點、護理復能、移工培訓與教育品管。',
    '["hero_title","hero_image","service_targets","service_items","process","faq","cta"]'::jsonb,
    '["Hero","服務對象","服務內容","服務流程","真實案例","常見問題","聯絡 CTA"]'::jsonb,
    '{"cta_text":"我需要服務","image_usage":"service_hero"}'::jsonb,
    10
  ),
  (
    'article-page',
    '文章頁模板',
    'article',
    '適用於 Health 3.0、最新消息、真實照顧情境與名人講堂。',
    '["title","slug","category","cover_image","excerpt","content","seo_title","seo_description"]'::jsonb,
    '["文章 Hero","標籤列","本文重點","正文","延伸閱讀","右側 CTA"]'::jsonb,
    '{"author_name":"歲悅編輯部","status":"draft"}'::jsonb,
    20
  ),
  (
    'recruiting-page',
    '招募頁模板',
    'recruiting_page',
    '適用於人才招募、土地招募與投資人招募。',
    '["department_intro","benefits","job_cards","application_cta","contact"]'::jsonb,
    '["部門簡介","職涯/合作亮點","職缺/合作條件卡","申請流程","聯絡 CTA"]'::jsonb,
    '{"cta_text":"申請應徵","image_usage":"card"}'::jsonb,
    30
  ),
  (
    'investor-notice',
    '投資人公告模板',
    'investor_notice',
    '適用於投資人專區公告、財務資訊、公司治理與股東專區下載資料。',
    '["title","notice_date","notice_type","summary","download_file","seo_title"]'::jsonb,
    '["公告摘要","重要日期","下載檔案","聯絡窗口","延伸公告"]'::jsonb,
    '{"category":"investor-relations","requires_file":true}'::jsonb,
    40
  )
on conflict (template_key) do update
set
  name = excluded.name,
  content_type = excluded.content_type,
  description = excluded.description,
  required_fields = excluded.required_fields,
  recommended_sections = excluded.recommended_sections,
  example_json = excluded.example_json,
  sort_order = excluded.sort_order,
  is_enabled = true,
  updated_at = now();
