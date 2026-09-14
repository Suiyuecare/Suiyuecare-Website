# Finance 員工的中央入口

中央入口的 Finance 動態人員查詢，開放三個既有模組：會計、敏捷專案管理及電子公文。這是入口資格，不是模組內的管理或簽核授權。

- `/api/portal-handoff` 的 GET 必須先通過既有 `auth.getUser` 與已確認 Google 身分檢查，再以登入者本人 Email 查 Finance 的 `finance_users`。仍要求唯一有效人員、有效組織、姓名、職稱、部門，以及既有 `org_source` 白名單；不讀瀏覽器角色或 `public.users` 投影作為入口授權。
- 動態設定固定為 `finance-portal-self`、`self`，只包含 `accounting`、`apm`、`edoc`。網站後台、人資、日照及 Portal 管理工具不因此開通，舊靜態名冊也不因此被修改。
- 會計入口直接前往 `https://finance.suiyuecare.com/`，不攜帶登入 token、Email、角色或資料範圍；Finance 驗證本人的 Google 登入與權限。
- APM 及電子公文仍使用既有短效 HMAC 簽章及跨來源 POST handoff。每次簽章都重新核對 Finance 人員，簽章只包含已驗證身分與目的模組，不包含前端傳入的角色、主管、公司或可簽核範圍。
- APM 仍需其自身的有效員工投影；電子公文仍依其 Finance 權威快照與同步投影授權。此程式變更不建立 Auth 帳號、員工、角色、模組資料或通知。三個系統的首次 Google 身分綁定與實際操作，須由本人完成。

## 驗證

```sh
pnpm install --frozen-lockfile
node scripts/verify-portal-employee-modules.mjs
pnpm verify:portal-care-entry
pnpm verify:all
```

`verify:portal-care-entry` 與 `verify:security` 已串接新的 93 項 API／真函式檢核，均包含在 `verify:all`。測試只使用 `example.suiyuecare.com` 虛構人員與本地傳輸，涵蓋三個員工的模組一致性、每次 handoff 重新驗證、失效／未驗證帳號、錯誤來源、跨身分資料、前端額外模組及管理權限拒絕。

另有真瀏覽器驗證，需要已安裝的 Playwright 及 Chrome；可用 `PORTAL_PLAYWRIGHT_MODULE` 指向 Playwright 模組，`FINANCE_BROWSER_CHANNEL` 指定 `chromium` 等已安裝 channel：

```sh
node scripts/verify-portal-employee-browser.mjs
```

此腳本啟動本機伺服器，以真 Portal DOM、事件、設定 API 與簽章 API 驗證 1440／390px。三個虛構人員各點選三個入口，跨系統目的端只由瀏覽器攔截；所有外部網路均阻擋。包含未驗證／停用拒絕、管理入口拒絕、零頁面錯誤與零橫向溢出。證據預設寫入 `/tmp/portal-employee-modules-browser`，可透過 `PORTAL_BROWSER_OUTPUT` 調整。

## 發布與驗收

本儲存庫沒有 GitHub Actions 發布 workflow。沿用已連結的 Vercel Git 整合：在乾淨分支提交、PR 取得 Preview，核對此範圍後再合併 main 產生 Production。不要從含未提交變動的主工作目錄直接部署。

`vercel.json` 執行 `pnpm build:vercel`：Production 先同步已發布 CMS 快照，Preview 使用已提交快照，接著完整執行 `verify:all`。本變更不需新增資料庫 migration、Supabase key 或 handoff secret。

發布後需核對 `login.suiyuecare.com/portal/` 與 OAuth bridge 的已發布 Portal 資產、確認新 `finance-portal-self` 三模組契約，再以匿名桌機／手機檢查登入入口。匿名檢查不代表已替員工登入；本人登入後的模組權限，仍需保留各系統既有授權與稽核流程。
