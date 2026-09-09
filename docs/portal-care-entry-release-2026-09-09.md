# 業務系統入口整合

## 範圍

- Finance 的「回模組頁」已連至 `https://login.suiyuecare.com/portal/`；本次修改共用 Portal，未修改 Finance 專案。
- 既有階層保留為「業務系統 → 居家照顧系統、日間照顧系統」。沒有建立第二套模組目錄。
- 日間照顧系統導向固定 `https://daycare.suiyuecare.com/login`，不帶 Portal 帳號、角色、scope、payload、signature、token 或使用者指定返回網址。
- 居家照顧系統尚無經確認的正式網址，保留建置中狀態，不使用官網宣傳頁替代。
- 既有 Finance 導向、APM/eDoc POST handoff 與 Finance-only 角色限制保持不變。

## 權限界線

日照入口的顯示及啟動要求執行長角色、指定公司帳號及 day-care 模組權限同時符合；受限 Finance-only profile 不例外。這是導覽限制，不是登入或資料授權邊界。客戶端 profile 不能授予 Daycare 權限；Daycare 必須自行驗證 Google 身分、執行長 allowlist、MFA 及資料範圍。

本次不設定或移轉 OAuth secret、不新增 SSO/token bridge、不更動 Daycare Auth、MFA、Supabase 地區或付費方案。日照 Google provider 尚未完成設定；入口卡片及動畫明示設定中。不得將入口上線視為登入或正式營運驗收完成。

## 檢查方式

- `pnpm verify:portal-care-entry`：抽取實際函式執行合成 profile、角色矩陣、直接啟動、深層連結、惡意覆寫、無憑證傳遞與既有三模組回歸；不載入真實名冊、Auth 或網路。
- `pnpm verify:all`：包含上述測試及既有官網完整檢查。
- 本機瀏覽器以隔離攔截的合成 profile 驗證 1440px / 390px；不在正式站偽造登入。
- 驗證兩張子卡、返回工作區的鍵盤焦點、44px 返回按鈕、無水平溢出、居家無導向、非 CEO 拒絕與日照固定網址。
- 日照沿用既有奶茶色版型及進度條；檢查載入文案、inert 清除、正確模組所有權與逾時恢復。
- 業務子頁（CEO 1440px / 390px、非 CEO 390px）axe WCAG A/AA 自動檢查無違規；不等於完整系統 WCAG 人工驗收。

## 發布保護

從當時已上線的 `f5cbaac7d8eb3e363dddf7845006cbca2b629900` 建立獨立 worktree，保留原 checkout 未提交修改。發布前需再次核對 origin/main 與正式 alias，先建立 staged production deployment、檢查後才 promote；任何網站基線變動均先重新整合及驗證。

## 本機結果

- `pnpm verify:all` 通過；入口／動畫 62 個案例、573 項斷言通過。
- 既有圖片檢查保留 7 個 warning、12 個 info，0 個 critical；沒有修改這些既有圖片。
- 瀏覽器合成資料案例與上述業務子頁 axe 檢查通過。Google 真實登入及 Daycare 正式業務流程仍未驗收。
