# HR / Finance / Portal 登入與登出發佈驗收

基線：網站正式版本 f580726aa04fb33abe1314c8e56b04ce5fd2fec2；獨立工作樹，未改原本 dirty checkout。

HR 新增接收 `/api/auth/handoff`，只接受 Portal 原點、HR audience、60 秒 HMAC assertion、一次性 jti、既有且已確認 Google 身分與目前 HR 權限。Browser role、雇主及薪資權限不能由 assertion 自授。JWT、OTP 與 refresh token 不放 URL。HR 私有 logout epoch 阻止登出前 envelope 晚到後建立新登入。

三模組 Google 登出使用既有 `/api/portal-handoff?action=logout`，維持 12 個 API function。後端先撤銷其他模組，成功後才撤銷來源；失敗保留來源登入供重試，頁面立即清除私人內容，pending 旗標只保留非機密布林值，重整不能還原工作區。只有 HR、Finance、Portal 全部回覆確認才顯示完成。一般員工電話登入仍僅處理 HR。APM/eDoc 尚不在本次 session fence 中，不宣稱已全部登出。

驗收：`pnpm verify:all`（包含 build 與正式版本既有全部驗證）、`pnpm verify:portal-session`（精確 Google subject、Auth session 實際撤銷、舊 JWT 拒絕、來源最後撤銷、partial 重試、Origin/source不符拒絕）、HR portal-session / handoff 測試及 Finance portal_session_logout / portal_logout_client 測試。

獨立 browser 合成資料驗收 320、390、768、1440px：private UI 立即移除、partial 不清來源 session、鍵盤重試、完成後才清 SDK local session、無水平溢出；Portal 真實頁面 pending reload 無法恢復 private modules。這是本機驗收，正式三專案部署後仍需確認 API 與資產已發布，並以各受授權本人登入驗證。

新的 server env 僅新增 HR signing secret、既有 HR service key 及 Portal 三目標 server credentials；未更動 HR 原有公開建置 key、Google OAuth、redirect、APM/eDoc 設定。秘密僅由 stdin 配置，不進 repository／文件／命令列參數。
