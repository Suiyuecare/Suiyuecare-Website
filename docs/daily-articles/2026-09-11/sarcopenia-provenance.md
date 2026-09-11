# 肌少症文章來源與圖像溯源

查核日期：2026-09-11（Asia/Taipei）。文章：`sarcopenia-treatment-barriers-care`。工作僅在指定 worktree；不代表發布、推送或部署。

## 主題與查重

已閱讀 `sarcopenia-series-articles.mjs` 的十個既有主題、`daily-articles/2026-09-10.mjs` 與 `scripts/verify-daily-articles.mjs` 契約，並搜尋 daily-articles 現有標題。這篇主要問題是原有運動與營養建議因食慾、疼痛、恐懼或生活安排而中斷時，如何找到原因並重新協作，非重寫定義、診斷、飲食菜單、運動處方、住院恢復或 12 週追蹤。本文虛構情境明確標示為討論示例，沒有真實病人姓名或虛構療效。

## 已納入的來源

### 1. Chen et al., AWGS 2025 consensus

- 出版資訊：2025;5(11):2164–2175；日期：2025-11-04 online / 2025-11 issue。
- PMID：41188603；DOI：10.1038/s43587-025-01004-y。
- 實際可讀來源：[來源正文或摘要](https://pubmed.ncbi.nlm.nih.gov/41188603/?dopt=Abstract)。
- 核對與使用範圍：已開啟完整 PubMed 摘要，核對作者、標題、年卷期頁、PMID、DOI。支持低肌力與低肌肉量同時存在的診斷概況，以及多面向介入。沒有將身體表現當作第三個必備診斷條件。

### 2. Volkert et al., ESPEN practical guideline

- 出版資訊：2022;41(4):958–989；日期：2022-03-05 online / 2022-04 issue。
- PMID：35306388；DOI：10.1016/j.clnu.2022.01.024。
- 實際可讀來源：[來源正文或摘要](https://pubmed.ncbi.nlm.nih.gov/35306388/?dopt=Abstract)。
- 核對與使用範圍：已開啟完整 PubMed 摘要，核對作者、標題、年卷期頁、PMID、DOI。支持營養風險篩檢、個別化、多專業與口服營養支持。本文未直接套用固定熱量、蛋白質、水分或吞嚥質地處方。

### 3. Yang et al., exercise adherence mixed-methods systematic review

- 出版資訊：2024;157:104808；日期：2024-05-21 online / 2024-09 issue。
- PMID：38823146；DOI：10.1016/j.ijnurstu.2024.104808。
- 實際可讀來源：[來源正文或摘要](https://pubmed.ncbi.nlm.nih.gov/38823146/?dopt=Abstract)。
- 核對與使用範圍：已開啟完整 PubMed 摘要，核對 Yi Yang、Yajing Gao、Ran An、Qiaoqin Wan、標題、年卷期、PMID、DOI。支持個別安排、支持、回饋、自主等討論方向；該研究指出策略仍待驗證，正文保留這項限制。

### 4. Chen et al., physical activity barriers systematic review

- 出版資訊：2025;15(8):e095260；日期：2025-08-25。
- PMID：40854831；DOI：10.1136/bmjopen-2024-095260。
- 實際可讀來源：[來源正文或摘要](https://pmc.ncbi.nlm.nih.gov/articles/PMC12382567/)。
- 核對與使用範圍：PubMed canonical 出現空本文；?dopt=Abstract 開啟失敗，改為實際開啟 PMC 全文並核對標題、作者、PMID、DOI、年份。全文 PMCID 為 PMC12382567。支持疼痛、怕受傷、缺乏支持與環境的障礙分類。研究族群主要是一般社區長者且多為高收入國家，正文不將結果直接當成個別肌少症處方。

### 5. NHLBI, Physical Activity and Your Heart: Risks

- 出版資訊：Updated 2022-03-24；日期：2022-03-24。
- PMID：不適用；DOI：不適用。
- 實際可讀來源：[來源正文或摘要](https://www.nhlbi.nih.gov/health/heart/physical-activity/risks)。
- 核對與使用範圍：已實際開啟官方正文，支持運動出現胸痛或暈眩需醫療諮詢、慢性病者活動安全應個別討論。不以美國頁面證明任何臺灣核准或給付。

## 未納入與存取限制

- NIA `Exercising With Chronic Conditions`：搜尋結果能取得正文摘要，首次 open 回報 100 lines 但未交付內容；後續定位正文重新開啟為 HTTP 405。因不能將搜尋片段或狀態碼當成實際正文驗證，已從 references 移除，正文也移除其專屬歸因。
- PMID 41205420 的研究只作探索搜尋，未通過完整可讀頁核對，未使用也未納入 references。
- 引用區前三個 PubMed URL 加 `?dopt=Abstract` 避免 canonical 頁挑戰；PMID 40854831 使用實際開啟的 PMC 全文。完整 DOI 與 PMID 仍保留供查核。
- 不提供藥物劑量、自行停藥方式、保證改善、臺灣特定藥品核准或給付宣稱。照顧流程為本文原創定性整理，非經驗證量表。

## 原創照片與最終 prompts

工具：內建 `image_gen.imagegen`，每張照片獨立生成，共 3 次呼叫；沒有拼接、庫圖或不同題共用照片。全部生成原檔已目視檢查後以 macOS sips 轉 JPEG（quality 82）並調整為 1600×900，完整保留原生成檔。員工全部為鮮橘色短袖 polo、家屬為便服；無文字、logo、浮水印或醫療動作示範。三張皆以 AI 生成情境示意標註，並有明確不同的空間、人物與視角。

### hero

Generated images are saved to /Users/seniorlifepr/.codex/generated_images/01a0907e-f519-7ed3-b194-00d51ec1b34c as /Users/seniorlifepr/.codex/generated_images/01a0907e-f519-7ed3-b194-00d51ec1b34c/exec-fd090143-1e80-474e-91d1-43e1730ea0f8.png by default.

最終 prompt：

```text
Use case: photorealistic-natural. Asset type: editorial health article hero photograph, landscape 16:9, output at least 1536 pixels wide (prefer 2048x1152). Primary request: A respectful, candid Taiwanese home-care consultation about barriers to continuing sarcopenia treatment. In a real modest bright Taiwanese apartment dining area, a Taiwanese man around 78 with natural grey hair sits comfortably in a stable chair, his adult daughter in ordinary muted casual clothes beside him, and ONE female home-care professional around 40 wearing a vivid solid orange short-sleeve polo shirt and dark trousers sits opposite. They listen at eye level and calmly discuss his own priorities; the older man gestures naturally with an open relaxed hand. On the uncluttered wooden table are a plain cup, closed unbranded notebook, and no paperwork with readable text. Clear safe walkway in background. Medium wide documentary composition, warm natural window light, realistic skin texture and hands, understated everyday Taiwan decor, natural expressions, no posed sales smiles. All care staff must wear vivid orange polo; family wear casual nonuniform clothing. No exercise being performed, no medical procedure, no grabbing or lifting, no clinical equipment. No text, letters, logos, watermarks, signage or invented symbols. This must look like a natural original photograph, not a collage or an infographic.
```

### inline-1

Generated images are saved to /Users/seniorlifepr/.codex/generated_images/01a0907e-f519-7ed3-b194-00d51ec1b34c as /Users/seniorlifepr/.codex/generated_images/01a0907e-f519-7ed3-b194-00d51ec1b34c/exec-93e646f5-1e29-4ae3-b483-d7f8ee91b5ba.png by default.

最終 prompt：

```text
Use case: photorealistic-natural. Asset type: original inline editorial photograph for a Taiwanese sarcopenia caregiving article. Landscape 16:9, at least 1536 pixels wide, prefer 2048x1152. Primary request: In a lived-in Taiwanese home kitchen dining nook, an older Taiwanese woman around 80 in a pale sage cardigan sits upright comfortably at a wooden table, discussing why she has not enjoyed meals with her adult son in ordinary navy casual clothes. He listens calmly at her side, without touching her or feeding her. A small ordinary lunch in two plain bowls is on the table: rice, tofu and cooked vegetables, with a small plain water cup. The older woman is speaking and her hands are relaxed, not eating or swallowing at that moment. Medium side-view two-person composition with the food in foreground, quiet Taiwanese domestic details, natural midday window light and realistic documentary texture. Respectful autonomy and normal everyday expressions, no forced smile, no weight-loss or transformation trope. No healthcare staff in this image; no uniforms. No text, labels, letters, logo, watermark, signage, brand, supplement containers, medical devices, feeding assistance or choking. Clearly different from a professional consultation hero image. No collage or infographic.
```

### inline-2

Generated images are saved to /Users/seniorlifepr/.codex/generated_images/01a0907e-f519-7ed3-b194-00d51ec1b34c as /Users/seniorlifepr/.codex/generated_images/01a0907e-f519-7ed3-b194-00d51ec1b34c/exec-47fb61a1-7a52-458a-a581-e2daed9765ab.png by default.

最終 prompt：

```text
Use case: photorealistic-natural. Asset type: original inline documentary photograph for a Taiwanese sarcopenia care article, landscape 16:9, at least 1536 pixels wide, prefer 2048x1152. Primary request: A different calm home rehabilitation planning scene. In a bright modest Taiwanese living room, an older Taiwanese man around 82 wearing comfortable blue-grey casual clothing and secure everyday closed-back shoes sits fully resting in a sturdy ordinary chair with armrests, both feet planted on the nonslip floor, his back supported. A male home rehabilitation professional around 35 in a vivid solid orange short-sleeve polo shirt and dark trousers sits on another chair at his eye level, listening and making a small open-hand conversational gesture. The elder has a thoughtful calm expression and looks toward the professional. No physical examination and no exercise in progress. Show the clear safe floor space and an accessible window in a wider environmental composition, afternoon natural light, realistic Taiwanese home decor, credible body anatomy and realistic hands. Care staff all wear vivid orange polo shirts, the elder wears ordinary nonuniform clothes. Keep visually distinct from a dining-table consultation and a family meal. No text, logos, watermarks, letters, signage, readable paperwork or medical equipment. No lifting, pulling, forced movement, precarious balance or dramatic illness. An original editorial photograph, not collage, infographic or stock advertising pose.
```

## 圖像目視與技術驗收

- hero：長者、便服女兒與橘 polo 女性專業人員平視交談；手部自然、沒有強迫扶抱；家中動線清楚。
- inline-1：年長女性與便服兒子在餐桌討論，普通家常餐點，沒有餵食、嗆咳或指定吞嚥姿勢；與 hero 的人物與場景不同。
- inline-2：年長男性完整坐在穩固扶手椅休息，雙腳著地；橘 polo 男性專業人員另坐一椅交談；沒有拉扯、訓練或不穩站立。
- 原創 SVG：1200×675，具 title、desc、role=img、aria-labelledby，以警訊分流、三類障礙、共同調整與回看呈現定性流程，沒有虛構數字。
- JPEG 與 SVG 均存於 assets/health3/daily/2026-09-11/，並逐位元複製至 public 鏡像。
- 三張 inlineImages 位置依序為 afterSection 1、3、5；中間為 SVG。
- 正文字數、檔案大小、SHA-256 與鏡像結果見 `sarcopenia-checks.json`。實際正文 7 節各 2 段，2282 漢字、2555 字元（不含標題、摘要、FAQ、表格等）。


- 最終 SVG 已以 bundled sharp 渲染為 `sarcopenia-chart-preview.png` 並實際目視：中文字清楚、無裁切、重疊或超出畫布，警訊與流程層級可辨識。
- 直接載入文章模組的結構、自有圖資、相關 slug、coverage 標題與繁體字形檢查均通過；全站整批 `verify:all` 由主代理執行。
