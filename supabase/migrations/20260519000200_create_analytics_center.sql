-- Website traffic center schema.
-- Captures anonymous page views/events from the public site and lets CMS admins
-- inspect analytics, alerts, health checks, and report schedules.

create table if not exists public.analytics_page_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,
  visitor_id text not null,
  page_path text not null,
  page_title text,
  referrer text,
  source text default 'direct',
  medium text default 'none',
  campaign text,
  device_type text,
  browser_language text,
  user_agent text,
  duration_seconds numeric,
  is_bounce boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,
  visitor_id text not null,
  event_type text not null,
  event_label text,
  page_path text,
  target_url text,
  source text default 'direct',
  medium text default 'none',
  campaign text,
  value numeric,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.analytics_alerts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  alert_type text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  status text not null default 'unread' check (status in ('unread', 'read', 'processing', 'resolved')),
  title text not null,
  message text,
  metric_key text,
  metric_value numeric,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.analytics_health_checks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  check_type text not null,
  status text not null default 'unknown' check (status in ('ok', 'warning', 'critical', 'unknown')),
  response_time_ms integer,
  checked_url text,
  message text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.analytics_report_schedules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  report_type text not null check (report_type in ('daily', 'weekly', 'monthly')),
  recipient_email text not null,
  is_enabled boolean not null default true,
  last_sent_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists analytics_page_views_created_at_idx on public.analytics_page_views(created_at desc);
create index if not exists analytics_page_views_session_idx on public.analytics_page_views(session_id);
create index if not exists analytics_page_views_visitor_idx on public.analytics_page_views(visitor_id);
create index if not exists analytics_page_views_page_path_idx on public.analytics_page_views(page_path);
create index if not exists analytics_page_views_source_idx on public.analytics_page_views(source, medium, campaign);

create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at desc);
create index if not exists analytics_events_type_idx on public.analytics_events(event_type);
create index if not exists analytics_events_page_path_idx on public.analytics_events(page_path);
create index if not exists analytics_events_source_idx on public.analytics_events(source, medium, campaign);

create index if not exists analytics_alerts_status_idx on public.analytics_alerts(status, severity, created_at desc);
create index if not exists analytics_health_checks_type_idx on public.analytics_health_checks(check_type, created_at desc);

drop trigger if exists analytics_alerts_set_updated_at on public.analytics_alerts;
create trigger analytics_alerts_set_updated_at
before update on public.analytics_alerts
for each row execute function public.set_updated_at();

drop trigger if exists analytics_report_schedules_set_updated_at on public.analytics_report_schedules;
create trigger analytics_report_schedules_set_updated_at
before update on public.analytics_report_schedules
for each row execute function public.set_updated_at();

alter table public.analytics_page_views enable row level security;
alter table public.analytics_events enable row level security;
alter table public.analytics_alerts enable row level security;
alter table public.analytics_health_checks enable row level security;
alter table public.analytics_report_schedules enable row level security;

drop policy if exists "Public can insert analytics page views" on public.analytics_page_views;
drop policy if exists "CMS users can read analytics page views" on public.analytics_page_views;
drop policy if exists "Public can insert analytics events" on public.analytics_events;
drop policy if exists "CMS users can read analytics events" on public.analytics_events;
drop policy if exists "CMS users can manage analytics alerts" on public.analytics_alerts;
drop policy if exists "CMS users can read health checks" on public.analytics_health_checks;
drop policy if exists "CMS users can manage report schedules" on public.analytics_report_schedules;

create policy "Public can insert analytics page views"
on public.analytics_page_views
for insert
to anon, authenticated
with check (
  char_length(session_id) between 8 and 160
  and char_length(visitor_id) between 8 and 160
  and char_length(page_path) between 1 and 500
);

create policy "CMS users can read analytics page views"
on public.analytics_page_views
for select
to authenticated
using (private.can_manage_cms());

create policy "Public can insert analytics events"
on public.analytics_events
for insert
to anon, authenticated
with check (
  char_length(session_id) between 8 and 160
  and char_length(visitor_id) between 8 and 160
  and char_length(event_type) between 2 and 80
);

create policy "CMS users can read analytics events"
on public.analytics_events
for select
to authenticated
using (private.can_manage_cms());

create policy "CMS users can manage analytics alerts"
on public.analytics_alerts
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

create policy "CMS users can read health checks"
on public.analytics_health_checks
for select
to authenticated
using (private.can_manage_cms());

create policy "CMS users can manage report schedules"
on public.analytics_report_schedules
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

grant insert on public.analytics_page_views to anon, authenticated;
grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_page_views to authenticated;
grant select on public.analytics_events to authenticated;
grant select, insert, update, delete on public.analytics_alerts to authenticated;
grant select on public.analytics_health_checks to authenticated;
grant select, insert, update, delete on public.analytics_report_schedules to authenticated;
