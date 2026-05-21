create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_group text not null default 'general',
  setting_key text not null unique,
  setting_label text not null,
  value_text text,
  value_json jsonb not null default '{}'::jsonb,
  media_id uuid references public.media(id) on delete set null,
  help_text text,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

create index if not exists site_settings_group_idx on public.site_settings(setting_group, sort_order);

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "Enabled site settings are public" on public.site_settings;
create policy "Enabled site settings are public"
on public.site_settings
for select
to anon, authenticated
using (is_enabled = true);

drop policy if exists "CMS users can manage site settings" on public.site_settings;
create policy "CMS users can manage site settings"
on public.site_settings
for all
to authenticated
using (private.can_manage_cms())
with check (private.can_manage_cms());

grant select on public.site_settings to anon;
grant select, insert, update, delete on public.site_settings to authenticated;

insert into public.site_settings (setting_group, setting_key, setting_label, value_text, value_json, help_text, sort_order, is_enabled)
values
  ('brand', 'brand_name', '中文品牌名稱', '歲悅長照集團', '{}'::jsonb, 'Header、Footer、進場動畫使用。', 10, true),
  ('brand', 'brand_name_en', '英文品牌名稱', 'Suiyuecare Corps.', '{}'::jsonb, 'Header、Footer、進場動畫使用。', 20, true),
  ('brand', 'slogan', '品牌標語', '照顧就像去超商，買牛奶一樣簡單。', '{}'::jsonb, 'Footer、進場動畫與固定 CTA 使用。', 30, true),
  ('brand', 'logo_url', 'Logo 圖片 URL', '/assets/company-logo.png', '{}'::jsonb, '建議使用去背 PNG。', 40, true),
  ('contact', 'phone', '主要電話', '02-6604-5432', '{}'::jsonb, 'Footer、據點資訊與固定聯絡資訊使用。', 50, true),
  ('contact', 'email', '主要信箱', 'generalaffairs@suiyuecare.com', '{}'::jsonb, 'Footer、據點資訊與固定聯絡資訊使用。', 60, true),
  ('contact', 'line_url', '官方 LINE 連結', 'https://lin.ee/oaPkGiq', '{}'::jsonb, '課程報名完成與 CTA 可使用。', 70, true),
  ('cta', 'contact_cta_text', 'Header 聯絡按鈕文字', '聯絡我們', '{}'::jsonb, 'Header 最右側 CTA。', 80, true),
  ('footer', 'footer_intro', 'Footer 服務描述', '服務諮詢、課程報名、人才合作與投資洽談', '{}'::jsonb, 'Footer 聯絡資訊下方描述。', 90, true),
  ('footer', 'copyright', '版權文字', '© 2026 Suiyuecare Corps. All rights reserved.', '{}'::jsonb, 'Footer 最下方版權文字。', 100, true),
  ('nav', 'primary_nav', '主選單結構', null, '[
    {"type":"group","label":"服務項目","items":[{"label":"關於歲悅","href":"#about"},{"label":"大記事","href":"#milestones"},{"label":"居家照顧","href":"#home-care"},{"label":"日間照顧","href":"#day-care"},{"label":"社區據點","href":"#community"},{"label":"護理復能","href":"#nursing"},{"label":"移工培訓","href":"#migrant-training"},{"label":"教育品管","href":"#quality"}]},
    {"type":"group","label":"招募與合作","items":[{"label":"人才招募","href":"#talent"},{"label":"土地招募","href":"#land"},{"label":"投資人招募","href":"#investor-recruiting"}]},
    {"type":"link","label":"健康3.0","href":"#health"},
    {"type":"link","label":"課程報名","href":"#courses"},
    {"type":"group","label":"投資人專區","items":[{"label":"投資人首頁","href":"#investors"},{"label":"財務資訊","href":"#ir-finance"},{"label":"公司治理","href":"#ir-governance"},{"label":"股東專區","href":"#ir-shareholders"}]},
    {"type":"cta","label":"聯絡我們","href":"#contact"}
  ]'::jsonb, '控制 Header 主選單，請維持 label/href/type 格式。', 110, true),
  ('footer', 'footer_columns', 'Footer 網站地圖', null, '[
    {"title":"營業項目","items":[{"label":"居家照顧","href":"#home-care"},{"label":"日間照顧","href":"#day-care"},{"label":"社區據點","href":"#community"},{"label":"護理復能","href":"#nursing"}]},
    {"title":"合作入口","items":[{"label":"人才招募","href":"#talent"},{"label":"土地招募","href":"#land"},{"label":"投資人招募","href":"#investor-recruiting"},{"label":"教育品管","href":"#quality"}]},
    {"title":"資訊內容","items":[{"label":"健康3.0","href":"#health"},{"label":"課程報名","href":"#courses"},{"label":"投資人專區","href":"#investors"},{"label":"財務資訊","href":"#ir-finance"},{"label":"聯絡我們","href":"#contact"}]}
  ]'::jsonb, '控制 Footer 網站地圖欄位。', 120, true)
on conflict (setting_key) do update
set
  setting_group = excluded.setting_group,
  setting_label = excluded.setting_label,
  value_text = excluded.value_text,
  value_json = excluded.value_json,
  help_text = excluded.help_text,
  sort_order = excluded.sort_order,
  is_enabled = excluded.is_enabled,
  updated_at = now();
