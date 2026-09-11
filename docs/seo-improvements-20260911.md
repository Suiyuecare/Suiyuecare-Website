# SEO 改善驗收紀錄（2026-09-11）

完成本次指定的第 1、2、4、5 項。變更位於隔離分支 `codex/seo-services-images-authorship-20260911`，以 `origin/main` 的 `d56d4c5` 為基礎；原工作目錄的既有修改保留。尚未推送或部署到正式網站。

## 改善內容

| 項目 | 已完成的行為 |
| --- | --- |
| 1. 搜尋引擎可讀內容 | 17 個服務、關於、招募、課程及投資人頁，在原始 HTML 就提供完整已公開正文與 H1。建置沿用實際前台 renderer 與公開 CMS snapshot，排除草稿、停用及未到發布時間的資料。保留背景更新期間的首屏與表單輸入；手機首圖沿用手機尺寸。 |
| 2. 首頁圖片載入 | 51 張頭像／卡片／服務旅程縮圖使用 WebP。CMS 插入圖片前就選用縮圖與延遲載入；保留首屏 hero 與品牌圖示優先載入。16 張服務旅程圖總大小由 4,875,929 bytes 減為 484,076 bytes，減少 90.1%。 |
| 4. 在地搜尋 | 新增 6 個據點／居家服務範圍頁，含獨立標題、canonical、sitemap、麵包屑、電話及諮詢入口。實體據點提供真實街道地址與 LocalBusiness；居家照顧使用 Service 與 areaServed。集團使用 Organization。籌設中的萬華二館不建立營運據點頁。 |
| 5. 文章可信度 | 既有團隊署名連到編輯政策與團隊介紹。文章提供參考資料跳轉、相關服務連結；支援經確認的作者、審閱者與實際更新／查核日期，與 JSON-LD 一致。後台新增預設收合的「署名與內容查核」，可填寫與清空；未修改時保留既有 JSON、未知欄位及日期精度。 |

第 3 項重複文章整併未納入本次變更。文章正文、編號及既有來源引文未調整。

## 新增頁面

- `/locations/wanhua-day-care`：萬華一館日照中心。
- `/locations/shilin-dementia`：士林失智症據點。
- `/locations/datong-dementia`：大同失智症據點。
- `/locations/xinyi-dementia`：信義失智症據點。
- `/locations/taipei-home-care`：臺北居家照顧，士林、北投、南港。
- `/locations/xindian-home-care`：新北居家照顧，新店、中和、永和。
- `/editorial-policy`：文章署名、資料日期與編輯原則。

地址、電話與範圍比對既有公開頁及 CMS snapshot。社區課程時段仍由據點確認，不把集團辦公時間當成課程時間。Google 商家檔案沒有在本次變更中修改。

## 首頁載入實測

相同瀏覽器、390 × 844 viewport，各使用新的 session，不捲動頁面；比較目前正式首頁與本機 Vite production preview。以 Resource Timing 統計，包含背景載入完成後的資源；不包含主 HTML navigation。

| 指標 | 正式首頁基準 | 本機改善版 |
| --- | ---: | ---: |
| Resource Timing `transferSize` 合計 | 21,134,088 bytes | 3,155,420 bytes |
| Resource Timing `encodedBodySize` 合計 | 21,372,621 bytes | 3,405,653 bytes |
| `img` 資源內容大小 | 20,027,488 bytes | 2,048,961 bytes |

首次資源傳輸量約減少 **85%**。這是正式站與本機預覽的對照數據，並非部署後的 Core Web Vitals 或搜尋排名結果；正式數據須在發布後再次量測。

## 驗證

- `pnpm verify:all` 通過，包含 220 份建置 HTML 的連結／資源與無障礙基本檢查、路由、SEO、公開內容一致性、CMS 權限契約、性能預算與安全檢查。
- 新增回歸涵蓋 17 頁完整正文、CMS 草稿排除、資源絕對路徑、7 個服務頁重綁事件、CMS 成功／失敗／過期回應與表單 DOM／焦點保留、6 個據點、164 筆既有文章類內容署名、51 張首頁縮圖、後台 JSON 編輯與清空。
- 以禁止頁面執行 JavaScript 的回應驗證服務頁可見正文；手機及桌面首圖使用各自尺寸。以符合正式站 clean URL 的本機伺服器驗證正常 JavaScript 更新與圖片路徑。
- 瀏覽器驗證首頁、日照／居家／社區據點切換、文章參考資料與團隊連結、據點到諮詢頁預填、文章建議預填。六個新據點頁在 390px 無橫向溢出或破圖，並抽查 1440px。
- 文章後台以真實表單 HTML、fillForm 與 buildPayload 的隔離 fixture 驗證，390px／1440px 無溢出；新增欄位區 axe 0 violations。未送出正式表單或寫入正式 CMS。
- 圖片嚴格稽核為 0 critical；保留通用尺寸建議等 warning。新增縮圖尺寸依實際頭像／卡片用途設定，原始大圖保留供其他用途。

完整服務正文使各頁 HTML 增加，因此性能檢查由原本空殼大小改為逐頁 raw＋gzip 預算；前台主程式實測約 450 KB raw／139 KB gzip，新增據點與編輯資訊的預算上限為 464／144 KB。

## 後續資料與發布狀態

目前作者介紹沿用既有團隊；沒有收到可公開的真實個人作者／專業審閱者資料，因此未填入姓名、資格或「已審閱」紀錄。日後可在文章後台填入已確認資料，詳見 [署名欄位文件](public-editorial-metadata.md)。

這次驗收是本機建置與瀏覽器結果，正式網站尚未套用本分支。正式發布後需再驗證新網址、canonical、sitemap、圖片與實際下載量。

結構化資料參照 Google 官方 [LocalBusiness 說明](https://developers.google.com/search/docs/appearance/structured-data/local-business) 與 [Organization 說明](https://developers.google.com/search/docs/appearance/structured-data/organization)。
