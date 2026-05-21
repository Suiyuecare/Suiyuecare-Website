-- Investor relations CMS: notices, financial/report rows, chart datasets, and downloadable file seeds.

create table if not exists public.investor_notices (
  id uuid primary key default gen_random_uuid(),
  notice_type text not null default 'news' check (notice_type in ('news', 'award', 'material', 'governance', 'shareholder', 'progress')),
  title text not null,
  summary text,
  body text,
  date_label text,
  published_on date,
  link_url text,
  file_id uuid references public.downloadable_files(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_enabled boolean not null default true,
  status public.cms_publish_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint investor_notices_published_at_required check (status <> 'published' or published_at is not null)
);

create table if not exists public.investor_financial_items (
  id uuid primary key default gen_random_uuid(),
  item_type text not null default 'monthly_revenue' check (item_type in ('monthly_revenue', 'finance_analysis', 'quarterly_report', 'annual_report')),
  period_label text not null,
  title text not null,
  amount numeric(14,2),
  amount_label text,
  growth_label text,
  note text,
  file_id uuid references public.downloadable_files(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  status public.cms_publish_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint investor_financial_items_published_at_required check (status <> 'published' or published_at is not null)
);

create table if not exists public.investor_chart_datasets (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null default 'investors',
  chart_key text not null,
  chart_title text not null,
  chart_type text not null default 'bar' check (chart_type in ('bar', 'line', 'combo', 'donut', 'score', 'progress')),
  unit_label text,
  data_points jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  status public.cms_publish_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_slug, chart_key),
  constraint investor_chart_datasets_key_format check (chart_key ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint investor_chart_datasets_page_format check (page_slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint investor_chart_datasets_published_at_required check (status <> 'published' or published_at is not null)
);

create index if not exists investor_notices_public_idx on public.investor_notices(notice_type, status, is_enabled, sort_order);
create index if not exists investor_financial_items_public_idx on public.investor_financial_items(item_type, status, is_enabled, sort_order);
create index if not exists investor_chart_datasets_public_idx on public.investor_chart_datasets(page_slug, chart_key, status, is_enabled);

drop trigger if exists set_investor_notices_updated_at on public.investor_notices;
create trigger set_investor_notices_updated_at before update on public.investor_notices for each row execute function public.set_updated_at();
drop trigger if exists set_investor_financial_items_updated_at on public.investor_financial_items;
create trigger set_investor_financial_items_updated_at before update on public.investor_financial_items for each row execute function public.set_updated_at();
drop trigger if exists set_investor_chart_datasets_updated_at on public.investor_chart_datasets;
create trigger set_investor_chart_datasets_updated_at before update on public.investor_chart_datasets for each row execute function public.set_updated_at();

alter table public.investor_notices enable row level security;
alter table public.investor_financial_items enable row level security;
alter table public.investor_chart_datasets enable row level security;

drop policy if exists "Published investor notices are public" on public.investor_notices;
drop policy if exists "CMS users can manage investor notices" on public.investor_notices;
drop policy if exists "Published investor financial items are public" on public.investor_financial_items;
drop policy if exists "CMS users can manage investor financial items" on public.investor_financial_items;
drop policy if exists "Published investor chart datasets are public" on public.investor_chart_datasets;
drop policy if exists "CMS users can manage investor chart datasets" on public.investor_chart_datasets;

create policy "Published investor notices are public"
on public.investor_notices for select to anon, authenticated
using (is_enabled = true and status = 'published' and published_at <= now());

create policy "CMS users can manage investor notices"
on public.investor_notices for all to authenticated
using (private.can_manage_cms()) with check (private.can_manage_cms());

create policy "Published investor financial items are public"
on public.investor_financial_items for select to anon, authenticated
using (is_enabled = true and status = 'published' and published_at <= now());

create policy "CMS users can manage investor financial items"
on public.investor_financial_items for all to authenticated
using (private.can_manage_cms()) with check (private.can_manage_cms());

create policy "Published investor chart datasets are public"
on public.investor_chart_datasets for select to anon, authenticated
using (is_enabled = true and status = 'published' and published_at <= now());

create policy "CMS users can manage investor chart datasets"
on public.investor_chart_datasets for all to authenticated
using (private.can_manage_cms()) with check (private.can_manage_cms());

grant select on public.investor_notices to anon, authenticated;
grant select on public.investor_financial_items to anon, authenticated;
grant select on public.investor_chart_datasets to anon, authenticated;
grant select, insert, update, delete on public.investor_notices to authenticated;
grant select, insert, update, delete on public.investor_financial_items to authenticated;
grant select, insert, update, delete on public.investor_chart_datasets to authenticated;

insert into public.downloadable_files (slug, title, description, category, file_type, public_url, file_name, sort_order, is_featured, is_enabled, is_public, status, published_at, metadata)
values
  ('ir-2026-q1-financial-report', '2026 Q1 財務報告', '季度財報與主要營運指標。', 'quarterly_report', 'PDF', '#contact', '2026-q1-financial-report.pdf', 10, true, true, true, 'published', now(), '{"ir_page":"finance"}'::jsonb),
  ('ir-2025-annual-report', '2025 年度股東會年報', '年度營運摘要、治理與股東會資料。', 'annual_report', 'PDF', '#contact', '2025-annual-report.pdf', 20, true, true, true, 'published', now(), '{"ir_page":"shareholders"}'::jsonb),
  ('ir-governance-policy', '公司治理實務守則', '公司治理制度與運作原則。', 'governance', 'PDF', '#contact', 'governance-policy.pdf', 30, false, true, true, 'published', now(), '{"ir_page":"governance"}'::jsonb)
on conflict (slug) do update
set title = excluded.title,
    description = excluded.description,
    category = excluded.category,
    file_type = excluded.file_type,
    public_url = excluded.public_url,
    file_name = excluded.file_name,
    is_enabled = true,
    is_public = true,
    status = 'published',
    published_at = now(),
    updated_at = now();

insert into public.investor_notices (notice_type, title, summary, date_label, published_on, link_url, metadata, sort_order, is_featured, is_enabled, status, published_at)
values
  ('news', '歲悅長照新增北北桃服務調度窗口', '整合居家照顧、日間照顧與護理復能諮詢，協助家庭更快找到適合服務。', '2026.05', '2026-05-01', '#ir-finance', '{}'::jsonb, 10, true, true, 'published', now()),
  ('news', '健康3.0照顧知識專欄上線', '提供家屬可快速理解的照顧技巧、營養衛教與安全提醒。', '2026.04', '2026-04-01', '#health', '{}'::jsonb, 20, false, true, 'published', now()),
  ('award', '臺北市居家照顧服務合作案', '承接區域照顧支持與家屬諮詢服務，建立可追蹤的照顧流程。', '2026', '2026-03-20', '#ir-governance', '{}'::jsonb, 10, true, true, 'published', now()),
  ('award', '新北市社區照顧據點服務案', '協助社區健康促進、共餐活動與預防延緩失能課程執行。', '2025', '2025-12-10', '#ir-governance', '{}'::jsonb, 20, false, true, 'published', now()),
  ('governance', '董事會通過北區服務品質治理計畫', '強化督導訪視、異常事件追蹤與家屬回報流程。', '2026.05.15', '2026-05-15', '#ir-governance', '{}'::jsonb, 30, true, true, 'published', now()),
  ('shareholder', '2025 年度股東會年報開放申請下載', '集中提供年度營運摘要、治理與股東會資料。', '2026.05', '2026-05-12', '#ir-shareholders', '{}'::jsonb, 40, true, true, 'published', now())
on conflict do nothing;

insert into public.investor_financial_items (item_type, period_label, title, amount, amount_label, growth_label, note, file_id, metadata, sort_order, is_enabled, status, published_at)
values
  ('monthly_revenue', '2026.05', '五月營收公告', 8600000, '8.6M', '+12.4%', '居家照顧與教育品管需求提升', (select id from public.downloadable_files where slug = 'ir-2026-q1-financial-report'), '{}'::jsonb, 10, true, 'published', now()),
  ('monthly_revenue', '2026.04', '四月營收公告', 7700000, '7.7M', '+8.1%', '北北桃服務量穩定增加', null, '{}'::jsonb, 20, true, 'published', now()),
  ('monthly_revenue', '2026.03', '三月營收公告', 7100000, '7.1M', '+6.8%', '課程與移工培訓開課帶動', null, '{}'::jsonb, 30, true, 'published', now()),
  ('quarterly_report', '2026 Q1', '2026 Q1 財務報告', null, 'PDF', null, '已上架', (select id from public.downloadable_files where slug = 'ir-2026-q1-financial-report'), '{}'::jsonb, 40, true, 'published', now()),
  ('annual_report', '2025', '2025 年度股東會年報', null, 'PDF', null, '申請下載', (select id from public.downloadable_files where slug = 'ir-2025-annual-report'), '{}'::jsonb, 50, true, 'published', now())
on conflict do nothing;

insert into public.investor_chart_datasets (page_slug, chart_key, chart_title, chart_type, unit_label, data_points, metadata, sort_order, is_enabled, status, published_at)
values
  ('ir-finance', 'monthly-revenue-trend', '月營收趨勢', 'bar', 'M', '[{"label":"1","value":42},{"label":"2","value":48},{"label":"3","value":46},{"label":"4","value":55},{"label":"5","value":61},{"label":"6","value":70},{"label":"7","value":68},{"label":"8","value":74},{"label":"9","value":78},{"label":"10","value":82},{"label":"11","value":88},{"label":"12","value":96}]'::jsonb, '{}'::jsonb, 10, true, 'published', now()),
  ('ir-finance', 'service-mix', '服務收入組成', 'donut', '%', '[{"label":"居家照顧","value":42},{"label":"日間照顧","value":26},{"label":"教育培訓","value":18},{"label":"其他服務","value":14}]'::jsonb, '{}'::jsonb, 20, true, 'published', now()),
  ('investors', 'establishment-progress', '機構設立進度', 'progress', '%', '[{"type":"居家長照機構","area":"臺北市｜士林・北投服務區","status":"籌設申請與人力盤點","percent":72,"steps":[["市場評估",100],["場域/法人文件",90],["主管機關送件",68],["人力招募",54],["開辦準備",32]]},{"type":"日間照顧中心","area":"桃園市｜蘆竹服務區","status":"合作場域洽談","percent":46,"steps":[["區域需求",92],["場域洽談",56],["財務試算",48],["圖面規劃",26],["送件準備",12]]}]'::jsonb, '{}'::jsonb, 30, true, 'published', now())
on conflict (page_slug, chart_key) do update
set chart_title = excluded.chart_title,
    chart_type = excluded.chart_type,
    unit_label = excluded.unit_label,
    data_points = excluded.data_points,
    is_enabled = true,
    status = 'published',
    published_at = now(),
    updated_at = now();
