# 健康3.0 署名與內容日期

`public-editorial.mjs` 是文章可見署名與結構化資料共同使用的來源。既有團隊署名會連至 `/editorial-policy` 的對應主題介紹；介紹保留原有團隊名稱，不將團隊署名當成個人專業資格或已完成審閱。

## 可選資料

靜態文章以 `editorial` 欄位提供；CMS 文章以 `content_json.editorial` 提供。只填已核實且適用於該篇文章的資料，沒有資料就省略。欄位如下：

| 欄位 | 格式與用途 |
| --- | --- |
| `author` | `{ type: "Person" 或 "Organization", name, url?, role?, credentials?, description? }`；`url` 可改用 `profileUrl` |
| `reviewer` | 與 `author` 相同的身分格式；必須同時有 `reviewedAt` 才公開顯示審閱資訊 |
| `reviewedAt` | 實際完成該篇內容審閱的日期 |
| `contentUpdatedAt` | 實質內容更新日期；有值時顯示「內容更新」，亦作文章 schema 的 `dateModified` |
| `sourceCheckedAt` | 實際查核來源的日期；有值時顯示「資料查核」 |

日期接受 `YYYY-MM-DD` 或 ISO timestamp。不要將一般資料庫的 `updated_at` 複製成查核或審閱日期。未提供明確內容更新紀錄時，現有的資料新鮮度與 `dateModified` 來源合約維持不變，頁面不會自動顯示「內容更新」。

身分欄位只接受明確的 `Person`／`Organization` 與非空姓名。介紹網址僅接受網站內的絕對路徑或 HTTPS 網址；HTML 文字會轉義，JSON-LD 也不允許內容提前關閉 script 元素。沒有個人介紹資料的既有個人署名保留純文字。

## 整合與驗證

- Node 與 browser 共用 `getPublicEditorialInfo(article)`；CMS 與靜態 adapter 共用 `normalizePublicEditorialMetadata(...)`。
- 路由使用 `EDITORIAL_POLICY_ROUTE` 與 `renderEditorialPolicyPage()`；CSS 為 `public-editorial.css`。
- 執行 `node scripts/verify-public-editorial.mjs` 檢查 optional 資料、未審閱預設、安全連結、日期與 JSON-LD／頁面一致性。
- 未改文章正文、編號、來源引文或重複文處理規則。

## 文章編輯器的操作

文章撰寫區下方新增預設收合的「署名與內容查核」。作者姓名及職稱先顯示現有署名；選擇類型並填寫介紹後，才儲存補充資料。審閱者、資格、介紹與日期請依實際資料填寫，不會自動填入今日或推定職業。

- 未修改此區時，保留原有 `editorial`，包括未知欄位及 ISO 日期原本的時區與精度。
- 修改單一欄位時，只合併該項變更；作者初次建立補充資料時可沿用畫面上既有的姓名與職稱。
- 清空介紹網址時，同時移除相容欄位 `url`／`profileUrl`；不影響其他補充資料。
- 「清除作者補充資料」移除已知作者欄位，前台回到原有作者署名；「清除審閱者資料」也清除審閱完成日期。未知擴充欄位保留。
- 原有儲存、發布審核與權限流程不變。

執行 `node scripts/verify-article-editorial-fields.mjs` 檢查合併行為；`node scripts/build-article-editorial-fixture.mjs` 會在系統暫存目錄建立由真實 HTML 與編輯器函式建置的瀏覽器 fixture。fixture 不執行登入或 API 啟動碼，儲存只保留本機 payload，適合驗證手機表單與清空操作。
