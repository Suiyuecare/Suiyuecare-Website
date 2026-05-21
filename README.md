# Suiyuecare-Website

歲悅長照集團官方網站前台。

目前專案是 Vite + 原生 HTML/CSS/JavaScript 的靜態網站。前台主要檔案為：

- `index.html`：首頁、header、footer 與部分首頁區塊
- `app.js`：hash route、內頁渲染、互動邏輯與目前的靜態內容資料
- `styles.css`：全站樣式
- `assets/`：前台圖片與合作單位 logo
- `src/lib/supabaseClient.js`：Supabase browser client 基礎設定

## Supabase Setup

本專案已加入 `@supabase/supabase-js`，後續可用 Supabase 管理 CMS 資料、登入驗證與圖片儲存。

請建立 `.env`，可從 `.env.example` 複製：

```bash
cp .env.example .env
```

需要設定：

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
```

這兩個 `VITE_` 變數會被前端瀏覽器使用。請務必在 Supabase 啟用 RLS，確保前台只能讀取公開發布內容。

## CMS Database Migration

CMS schema migration 位於：

```text
supabase/migrations/20260518000100_create_cms_schema.sql
```

RLS 權限規則獨立 migration 位於：

```text
supabase/migrations/20260518000200_cms_rls_policies.sql
```

內容包含：

- `profiles`：後台使用者 profile 與角色
- `admins`：管理員細部權限
- `pages`：頁面主資料、SEO、發布狀態
- `page_sections`：頁面區塊、排序、啟用狀態、內容 JSON
- `media`：圖片/檔案 metadata，對應 Supabase Storage
- `article_categories`：文章分類
- `articles`：文章、標籤、SEO、發布狀態
- Storage buckets：公開圖片、文章封面、頁面 Hero、課程圖、職缺圖、投資人文件、私有文件
- RLS policies：公開端只能讀 published/enabled 內容，未登入使用者不能修改任何資料，登入管理者才能新增/編輯/刪除 CMS 內容

若尚未安裝 Supabase CLI，可以先到 Supabase Dashboard 的 SQL Editor 貼上 migration 內容執行。

第一位管理員需要 bootstrap。建議做法：

1. 先用 Supabase Auth 建立第一個後台帳號。
2. 使用 Supabase SQL Editor 或 service role 後端腳本，將該使用者在 `profiles.role` 更新為 `owner` 或 `admin`。
3. 後續再由 owner/admin 從後台管理其他使用者。

## Service Role Key

`.env.example` 也保留：

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-for-server-only-tasks
```

這是後端或管理腳本專用金鑰，不可以放進前端、不可以加上 `VITE_` 前綴，也不可以 commit 到 GitHub。

目前專案尚未建立 server-side API，因此前台不會使用 service role key。若未來需要批次匯入、建立 signed URL、後台管理或高權限寫入，應放在 server function、Edge Function 或受保護的後端環境中處理。

## Storage Buckets

建議在 Supabase Storage 建立以下 buckets：

```bash
public-images
article-covers
page-heroes
course-images
job-images
investor-files
private-documents
```

前台公開圖片建議使用 public bucket：

- `public-images`
- `article-covers`
- `page-heroes`
- `course-images`
- `job-images`

投資人文件或內部文件若需要權限控管，建議使用 private bucket：

- `investor-files`
- `private-documents`

對應環境變數：

```bash
VITE_SUPABASE_STORAGE_BUCKET_PUBLIC_IMAGES=public-images
VITE_SUPABASE_STORAGE_BUCKET_ARTICLE_COVERS=article-covers
VITE_SUPABASE_STORAGE_BUCKET_PAGE_HEROES=page-heroes
VITE_SUPABASE_STORAGE_BUCKET_COURSE_IMAGES=course-images
VITE_SUPABASE_STORAGE_BUCKET_JOB_IMAGES=job-images
SUPABASE_STORAGE_BUCKET_INVESTOR_FILES=investor-files
SUPABASE_STORAGE_BUCKET_PRIVATE_DOCUMENTS=private-documents
```

## Supabase Client

前端 client 位於：

```text
src/lib/supabaseClient.js
```

可在未來的後台或前台資料讀取模組中使用：

```js
import { supabase, requireSupabaseClient, supabaseStorageBuckets } from "./src/lib/supabaseClient.js";
```

若缺少 `VITE_SUPABASE_URL` 或 `VITE_SUPABASE_ANON_KEY`，`supabase` 會是 `null`，`requireSupabaseClient()` 會丟出錯誤，方便在開發時快速發現環境變數未設定。

## Admin Login

後台登入頁面：

```text
/admin/login
```

後台首頁：

```text
/admin
```

頁面管理：

```text
/admin/pages
```

頁面編輯：

```text
/admin/pages/:id
```

圖片管理：

```text
/admin/media
```

分類管理：

```text
/admin/categories
```

文章管理：

```text
/admin/articles
```

目前已完成：

- Supabase Auth email/password 登入
- 登入成功導向 `/admin`
- 未登入進入 `/admin` 會自動導回 `/admin/login`
- `/admin` 顯示目前登入使用者 email
- 登出功能
- Supabase 環境變數缺漏提示
- `/admin/pages` 從 Supabase `pages` 讀取頁面列表，顯示頁面名稱、slug、啟用狀態與最後更新時間
- `/admin/pages/:id` 可編輯頁面標題、SEO、啟用狀態與多個 `page_sections`
- `/admin/media` 可上傳圖片至 Supabase Storage，寫入 `media` 資料表，並顯示圖片列表、預覽、URL、上傳時間與刪除按鈕
- `/admin/categories` 可新增、編輯、刪除 `article_categories`，欄位包含名稱、slug、描述、排序與啟用狀態
- `/admin/articles` 從 Supabase `articles` 讀取文章列表，顯示標題、分類、發布狀態、置頂、發布日期、最後更新，並提供新增、編輯與刪除入口
- `/admin/articles/new` 與 `/admin/articles/:id` 可新增或編輯文章標題、副標題、slug、分類、內容、發布狀態、發布日期、SEO、置頂與排序權重
- `/admin/home-modules` 可管理首頁最新動態、得標紀錄、員工招募、單位影片、真實照顧情境與名人講堂。
- `/admin/template-fields` 可管理服務頁與招募頁固定模板欄位，避免員工自由排版造成前台跑版。
- 前台 `#health` 與 `#search` 會從 Supabase `articles` 讀取 `status = published` 且 `is_enabled = true` 的文章，顯示封面圖、標題、副標題、分類與發布日期，排序規則為置頂優先、發布日期新到舊。若 Supabase 尚未設定或沒有資料，會保留原本靜態內容作為 fallback。
- 前台 `#health` 分類列會從 Supabase `article_categories` 讀取 `is_enabled = true` 的分類。使用者點選分類後會切到 `#health?category=分類slug`，只顯示該分類文章；後台新增或停用分類後，前台重新載入即可自動同步。
- 前台單篇文章路由 `#article-文章slug` 會用 slug 從 Supabase `articles` 讀取單篇文章，並明確限制 `status = published`、`is_enabled = true`。草稿、封存或停用文章即使知道 slug 也不會在前台顯示。
- 首頁已開始改成 Supabase CMS 覆寫模式：前台會讀取 `pages.slug = home` 與其 `page_sections`。若首頁沒有任何已發布 sections，會保留原本靜態內容；若有已發布 sections，前台只顯示這些啟用中的 section，停用 section 不會出現在首頁。若要在所有 section 都停用時仍讓首頁完全由 CMS 控制，可在 `pages.content_json` 設定 `{ "cms_mode": true }`。可用 section key 包含 `hero`、`updates`、`care-system`、`service-scene`、`video`、`network`、`services`、`care-stories`、`home-health`、`contact`。

前台文章分類篩選應從 Supabase `article_categories` 讀取：

```js
supabase
  .from("article_categories")
  .select("id, name, slug")
  .eq("is_enabled", true)
  .order("sort_order", { ascending: true })
```

如此後台新增或停用分類後，前台分類篩選會自動同步，不需要改程式碼。

Page section 圖片選擇器：

- 編輯 `page_sections` 時可從 `media` 資料表選擇已上傳圖片
- 也可在選擇器內直接上傳新圖片到 Supabase Storage
- 上傳或選圖時可設定 `image_usage` 與 `focal_point`，前台會依用途鎖定比例與裁切焦點，避免後台換圖後跑版
- 選定後會同步寫入：
  - `page_sections.image_id`
  - `page_sections.content_json.image_url`
  - `page_sections.content_json.image_usage`
  - `page_sections.content_json.focal_point`
  - `page_sections.content_json.image_fit`
- 前台渲染 section 圖片時應優先讀取 `content_json.image_url`

圖片用途建議：

- `hero`：首頁大型橫幅，建議 21:9，人物可用 `focal_point = center/top/right`
- `service_hero`：服務頁主視覺，建議 4:3
- `article_cover`：文章封面與健康3.0卡片，建議 16:9
- `card`：一般卡片縮圖，建議 4:3
- `square` / `avatar`：方形輪播與人物頭像，建議 1:1
- `logo` / `map`：識別與地圖，前台會使用 `contain`，盡量完整顯示不裁切

後台上傳圖片時，若圖片比例與用途不符，系統會先跳出裁切視窗。管理者可拖曳圖片調整重點、用縮放滑桿放大後再套用裁切；若該圖片必須完整保留，也可以選擇「保留原圖」。

首頁 section 可使用的 `content_json` 欄位：

```json
{
  "eyebrow": "Professional Care Network",
  "subtitle": "照顧就像去超商，買牛奶一樣簡單。",
  "image_url": "https://...",
  "background_image_url": "https://...",
  "image_alt": "首頁 Hero 圖片",
  "button_text": "預約諮詢",
  "button_href": "#contact",
  "secondary_button_text": "觀看照顧系統",
  "secondary_button_href": "#care-system",
  "fields": {
    "custom_field_name": "自訂文字"
  }
}
```

需要在 Supabase Dashboard 啟用 Email/Password Auth，並在 Vercel 設定：

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

後台登入會檢查 Supabase session，並透過 `profiles` / `admins` 判斷細項權限。只有已開通 profile 且具備對應權限的帳號可以進入 CMS 管理介面。

### Google Login

後台登入頁 `/admin/login` 已支援 Supabase Google OAuth：

- 前端按鈕會呼叫 `supabase.auth.signInWithOAuth({ provider: "google" })`
- 登入成功後導回 `/admin`
- Google 登入後仍會檢查 `profiles` / `admins` 權限，不會自動取得後台權限
- 若使用者尚未開通，會顯示「此帳號尚未開通後台權限」

Supabase Dashboard 需要設定：

1. Authentication → Providers → Google：啟用 Google provider。
2. 填入 Google Cloud OAuth Client ID 與 Client Secret。
3. Authentication → URL Configuration：加入正式站與本機 redirect URL。

建議加入的 Supabase Redirect URLs：

```text
https://suiyuecare-website.vercel.app/admin
https://www.suiyuecare.com/admin
https://suiyuecare.com/admin
http://localhost:5173/admin
http://127.0.0.1:4188/admin
```

Google Cloud Console 的 Authorized redirect URI 應使用 Supabase Auth callback：

```text
https://ussnmxdpxeoshlrdchov.supabase.co/auth/v1/callback
```

Google Cloud Console 的 Authorized JavaScript origins 建議加入：

```text
https://suiyuecare-website.vercel.app
https://www.suiyuecare.com
https://suiyuecare.com
http://localhost:5173
http://127.0.0.1:4188
```

## Admin Feature Test Checklist

目前程式檢查已完成：

```bash
node --check app.js
find src/admin src/lib -name '*.js' -print -exec node --check {} \;
git diff --check
```

已通過的靜態/程式檢查：

- 管理者登入頁 `/admin/login` 已使用 Supabase Auth `signInWithPassword`
- 未登入使用者進入 `/admin`、`/admin/pages`、`/admin/media`、`/admin/articles`、`/admin/categories` 會被導回 `/admin/login`
- `/admin/media` 已提供圖片上傳表單、圖片列表、圖片預覽、圖片 URL、上傳時間與刪除按鈕
- 圖片上傳流程會寫入 Supabase Storage，並同步新增 `media` 資料表紀錄
- 圖片刪除流程會刪除 Storage object 與 `media` 資料
- 頁面內容編輯器可選擇既有 media 圖片，也可直接上傳新圖片並寫入 `page_sections.image_id` / `content_json.image_url`
- `/admin/traffic` 是網站流量中心，讀取 `analytics_page_views`、`analytics_events`、`analytics_alerts`、`analytics_health_checks`、`analytics_report_schedules`，顯示流量、來源、頁面表現、轉換、SEO、網站健康度、警示與報表匯出。
- 前台 `app.js` 會匿名寫入頁面瀏覽與轉換事件，包含表單送出、LINE 點擊、電話點擊、Email 點擊、Google Maps 點擊、PDF 下載、預約/CTA 點擊與加入 LINE。
- `/api/site-health-check` 可由 Vercel Cron 執行，會檢查首頁、Supabase API、表單端點、SSL 與近 24 小時流量/錯誤，並寫入健康檢查與異常警示。
- 頁面文案可更新 `pages` 與 `page_sections`
- 文章列表 `/admin/articles` 可讀取、顯示、刪除文章
- 文章新增/編輯頁 `/admin/articles/new`、`/admin/articles/:id` 可編輯標題、副標題、slug、封面圖、分類、內容、發布狀態、發布日期、SEO、置頂與排序
- 分類管理 `/admin/categories` 可新增、編輯、刪除啟用狀態與排序
- 前台 `#health` 會讀取啟用分類並自動同步分類篩選
- 前台文章列表只讀 `published` + `is_enabled` 文章
- 前台單篇文章只讀 `published` + `is_enabled` 文章，草稿不會顯示
- 首頁已可讀取 `pages` / `page_sections` 來覆寫首頁文案、圖片、按鈕與 section 顯示狀態

需要在真實 Supabase 專案與瀏覽器中完成的端對端測試：

1. 建立 Supabase Auth 使用者，並確認可登入 `/admin/login`
2. 登出後直接打開 `/admin`，確認會導回 `/admin/login`
3. 在 `/admin/media` 上傳圖片，確認 Storage bucket 有檔案且 `media` 有資料
4. 在 `/admin/pages/:id` 選擇或上傳圖片，確認前台 section 圖片更新
5. 修改首頁 `page_sections` 文案，確認前台首頁同步
6. 新增文章並設為 `draft`，確認前台看不到
7. 將文章改為 `published` 且設定 `published_at`，確認前台列表與單篇頁可見
8. 新增分類並啟用，確認 `#health` 分類列自動出現
9. 停用分類或文章，確認前台不顯示

本機目前無法執行 `npm install`、`npm run build` 或 Vite dev server，因為目前環境找不到 `npm` / `npx` / `vite` 指令。部署到 Vercel 後會由 Vercel 依 `package.json` 安裝 `vite` 與 `@supabase/supabase-js` 後再 build。

## Local Development

安裝套件：

```bash
npm install
```

啟動開發伺服器：

```bash
npm run dev
```

建立正式輸出：

```bash
npm run build
```

## Deployment Note

目前 Vercel 使用 `vercel.json` 走標準 Vite build：

```json
"buildCommand": "vite build"
```

這樣 `/admin/login`、`/admin` 與 `src/` 裡的 Supabase module 才會被正確打包。

## Launch Hardening

### 正式後端寄信

前台聯絡表單與課程報名已改走 Vercel Serverless Function：

- `POST /api/send-email`
- 先寫入 Supabase `form_submissions`
- 再使用 Resend 寄信
- 若 `RESEND_API_KEY` 尚未設定，API 會回傳 `202`，資料仍會留存在後台，避免名單遺失

Vercel 需要設定：

```bash
SUPABASE_URL=https://ussnmxdpxeoshlrdchov.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
MAIL_FROM="Suiyuecare Website <noreply@suiyuecare.com>"
CONTACT_NOTIFY_EMAIL=generalaffairs@suiyuecare.com
COURSE_NOTIFY_EMAIL=edu.control@suiyuecare.com
REPORT_FALLBACK_EMAIL=generalaffairs@suiyuecare.com
REPORT_CRON_SECRET=...
SUPABASE_STORAGE_BUCKET_INVESTOR_FILES=investor-files
VITE_SUPABASE_STORAGE_BUCKET_COURSE_IMAGES=course-images
```

### 第一優先後台模組

已新增三個固定欄位管理模組，目標是讓員工能更新內容，但不碰前台版型：

- `/admin/courses`：課程管理，可新增、編輯、下架課程，管理課程圖片、日期、時間、地點、價格、名額、報名狀態與重要課程輪播。
- `/admin/files`：檔案下載管理，可上傳 PDF / Excel / Word，分類到投資人文件、財務資訊、公司治理、股東專區、課程簡章等。
- `/admin/forms`：表單資料管理，可查看聯絡我們、課程報名、人才招募、投資洽談等送出紀錄，並更新處理狀態與內部備註。

相關 migration：

```text
supabase/migrations/20260521000100_add_courses_files_and_form_admin.sql
```

前台 `#courses` 已改為優先讀取 Supabase `courses` 已發布資料；若 Supabase 暫時不可用，才回到原本的示範課程，避免頁面空白。

### 第二優先後台模組

已新增首頁內容模組與服務/招募頁固定模板欄位：

- `content_modules`：以 `target_slug = home` 管理首頁模組資料。前台目前支援 `news`、`awards`、`recruit`、`video`、`care_story`、`master_talk`，只讀取 `status = published` 且 `is_enabled = true` 的內容；若沒有 Supabase 資料，保留靜態/WordPress fallback。
- 首頁剩餘模組已 CMS 化：`hero`、`service_item`、`location`、`partner`。管理者可在 `/admin/home-modules` 新增、編輯、刪除首頁 Hero、營業項目卡、服務據點與合作單位。
- 服務據點會使用 `location` 模組的 `item_key` 作為點位識別，`metadata.pin_class` 或 `metadata.pin_style` 控制地圖旗子位置；萬華一館/二館可用相同 `metadata.tab_group` 呈現分館 tab。
- 合作單位使用 `partner` 模組，前台會自動複製一組跑馬燈內容維持連續動畫。
- `page_template_fields`：以 `page_slug` 與 `field_key` 管理固定欄位，例如服務範圍、工作特色、適合對象、部門簡介等。這是後續將八大服務頁與三大招募頁完全固定模板化的資料基礎。
- `/admin/home-modules`：管理首頁模組文字、圖片、連結、日期、排序、發布狀態與是否啟用。
- `/admin/template-fields`：管理各服務/招募頁固定欄位內容。設計目標是讓員工只改文字與圖片，不改版型。

相關 migration：

```text
supabase/migrations/20260521000200_add_home_modules_and_page_templates.sql
supabase/migrations/20260521000400_seed_home_remaining_modules.sql
```

### 第三優先後台模組

已新增版本紀錄、發布流程與權限分級基礎：

- `content_versions`：自動記錄 pages、page_sections、articles、courses、downloadable_files、content_modules 的新增、修改、刪除、發布與封存版本快照。
- `publish_requests`：編輯可建立送審發布申請，具審核權限者可在 `/admin/governance` 核准或退回。
- `admin_activity_logs`：記錄送審、審核等後台操作。
- `admins` 新增細分權限欄位，例如 `can_publish`、`can_review_publish`、`can_edit_pages`、`can_edit_articles`、`can_edit_courses`、`can_manage_files`、`can_view_forms`、`can_view_analytics`。
- 資料庫 trigger 會阻擋沒有發布權限的登入者直接把內容改成 `published`。
- `/admin/governance`：發布與權限中心，可查看目前帳號權限、待審發布、最近版本紀錄與操作紀錄。
- `/admin/users`：使用者權限管理，Owner/Admin 可調整角色、停用帳號與細項權限。新增 Auth 帳號仍需先在 Supabase Auth 建立。
- 後台頁面會依權限守門與隱藏選單，例如沒有 `can_view_analytics` 不能進網站流量中心，沒有 `can_edit_courses` 不能進課程管理。
- Supabase RLS 已細分為頁面、文章、課程、檔案、表單、圖片、流量與使用者管理等模組權限。
- 文章編輯與頁面編輯已新增「送審發布」按鈕。頁面送審核准後，會同步將該頁啟用中的 sections 發布，避免只發布頁面外殼。

相關 migration：

```text
supabase/migrations/20260521000300_add_versions_publish_workflow_permissions.sql
```

### 內容模板

已新增 Supabase migration：

- `content_templates`
- `content_audit_runs`
- `backup_manifests`

內建模板：

- 服務頁：Hero、服務對象、服務內容、流程、FAQ、CTA
- 文章頁：封面、分類、作者、日期、本文重點、正文、延伸閱讀、SEO
- 招募頁：部門簡介、職缺卡片、資格條件、福利、申請 CTA
- 投資人公告：公告日期、公告類型、下載檔案、重大訊息摘要、聯絡窗口

### 內容健康檢查

後台新增：

```text
/admin/content-health
```

會檢查：

- 頁面缺 SEO title / description
- 頁面或區塊未發布
- 區塊可能缺圖
- 圖片缺 alt
- 文章缺封面、摘要、SEO、發布日期
- 圖片缺尺寸或 public URL

### 404 與錯誤追蹤

- 新增 `404.html`
- 前台未知 hash route 會顯示 404 區塊
- 前台 `window.error` 與 `unhandledrejection` 會寫入 `analytics_events`，事件類型為 `frontend_error`
- 找不到頁面會寫入 `error_404`

### SEO

已補：

- `robots.txt`
- `sitemap.xml`
- canonical
- Open Graph image / title / description
- Twitter card

正式網域切到 Vercel 後，請確認 `https://suiyuecare.com/robots.txt` 與 `https://suiyuecare.com/sitemap.xml` 均可讀取。

### 自動報表

新增：

```text
GET /api/report-digest
GET /api/report-digest-weekly
GET /api/report-digest-monthly
GET /api/site-health-check
```

Vercel Cron 已設定日報、週報、月報，以及每 30 分鐘網站健康檢查。此功能需要：

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `REPORT_CRON_SECRET`
- `SITE_URL`

### 備份與還原

備份 CMS 主要資料表：

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run backup:supabase
```

還原：

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run restore:supabase -- backups/your-backup.json
```

備份內容包含：

- `pages`
- `page_sections`
- `media`
- `article_categories`
- `articles`
- `form_submissions`
- `content_templates`
- `analytics_report_schedules`
