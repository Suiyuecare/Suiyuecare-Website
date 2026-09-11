# 2026-09-11 失智症文章來源與資產紀錄

- 文章：失智症突然更混亂，真的是退化嗎？辨認急性改變與就醫準備
- 模組：`daily-articles/2026-09-11/dementia.mjs`
- slug：`dementia-acute-change-medical-handover`
- 疾病主題：失智症；照顧情境：既有失智者急性改變、就醫資訊準備、返家及日照交接。
- 日期：2026-09-11；發布時間欄位：2026-09-11T00:00:00+08:00（內容日期，不表示已發布）。
- 主文：7 節、每節 2 段，去除引用號後共 2,516 字元；另有摘要、警訊、清單、比較表與 3 個 FAQ。
- 初稿開頭情境以「例如」標示，是編輯整理情境，非真實個案、訪談或療效報告。

## 查重

已檢索 `app.js`、`article-rewrites.js`、`dementia-series-articles.mjs`、所有既有 `daily-articles/*.mjs` 與 `article-url-map.mjs`。
已有 `dementia-evening-agitation`（傍晚焦躁、環境作息）及 `sleep-depression-brain-health`（睡眠憂鬱與腦健康），因此放棄原候選日夜顛倒選題。
本篇主要問題是既有失智者突然偏離病前狀態，重点包括低活動型譫妄、最後正常時間、病前能力、醫療處置和跨場域交接。既有文章只有一般急性警訊提醒，沒有以此作完整主要問題的長文。
延伸閱讀三個 slug 已核對在既有 URL map：`living-well-after-dementia-diagnosis`、`dementia-care-cue-wait-support`、`post-discharge-first-week`。

## 實際查核來源

2026-09-11 已先透過 web 搜尋 PubMed、NICE、WHO、NHS，再開啟來源。所有列入 References 的來源均已實際取得正文或 PubMed 完整摘要，不以搜尋結果片段作唯一依據。下表順序與文章引用 [1]–[7] 一致。

| 編號 | 來源與核對 | 實際取得方式 | 支持範圍與限制 |
| --- | --- | --- | --- |
| 1 | NICE. CG103: Delirium: prevention, diagnosis and management in hospital and long-term care. 2010 發布，2023-01-18 更新。[Recommendations](https://www.nice.org.uk/guidance/cg103/chapter/Recommendations) | web open 回 403；以 Python urllib.request、User-Agent Mozilla/5.0 成功取得官方 Recommendations HTML 全文，實讀 1.3–1.8。 | 幾小時至幾天變化、低活動型表現、4AT 評估與專業診斷、分辨困難先處理譫妄、原因處理、環境/溝通/視聽支持、藥物風險與追蹤。原指引場域為醫院及長期照護，不宣稱日照效果經驗證。 |
| 2 | NICE. NG97: Dementia: assessment, management and support for people living with dementia and their carers. 2018。[Recommendations](https://www.nice.org.uk/guidance/ng97/chapter/Recommendations) | web open 回 403；urllib 成功取得官方全文。另單獨抽讀 1.5.1–1.7.15 的治療/用藥段落。 | 診断需生活史與醫療評估、認知/感官/憂鬱等混雜原因、跨服務資訊銜接、個別活動與失智症症狀藥物；抗精神病藥的嚴格用途與路易氏體/帕金森失智敏感性。本文沒有個別劑量或自行停藥指令。 |
| 3 | WHO. Dementia. 頁面標示 2026-07-03。[Fact sheet](https://www.who.int/news-room/fact-sheets/detail/dementia) | web open 成功，讀症狀、病型、治療照顧與照顧者支持。 | 疾病不等於必然老化、常見認知/生活影響、症狀治療與本人参与。本文沒有引用全球盛行率或聲稱能治癒。 |
| 4 | Umoh ME, Fitzgerald D, Vasunilashorn SM, Oh ES, Fong TG. 2024. The relationship between delirium and dementia. Seminars in Neurology 44(6):732–751. PMID 39393800; DOI 10.1055/s-0044-1791543。[PubMed](https://pubmed.ncbi.nlm.nih.gov/39393800/) | web open 成功取得 PubMed 作者、卷期頁碼、日期、PMID、DOI 及完整摘要。PMC 連結曾遇 reCAPTCHA，未把被攔頁面當全文證據。 | 失智症與譫妄是不同但相關病況、失智增加譫妄風險、譫妄可能加劇認知下降。屬敘述性回顧，不把關聯寫成每位患者必然結局。 |
| 5 | Ashton-Gough C, Lynch J, Goodman C. 2025. Supportive interventions involving family carers of patients with delirium superimposed on dementia in hospital: A scoping review. International Journal of Older People Nursing 20(2):e70016. PMID 39985255; DOI 10.1111/opn.70016。[PMC全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC11845946/) | PubMed open 遇 cookies 頁；改開 PMC 全文成功，另開作者大學 Research Profiles 核對。全文顯示線上日期 2025-02-22、期刊期次 2025-03，三位作者與 PMID/DOI 全部相符。 | 15 篇研究、家庭提供平常狀態及共同照顧的角色；支持性介入效果不一致，長期患者效益仍有限。正文明說多為住院場域，日照安排是根據原則整理的實務延伸。 |
| 6 | NHS. Sudden confusion (delirium). 最後審查 2024-05-28。[衛教](https://www.nhs.uk/symptoms/confusion/) | web open 成功取得完整衛教。 | 突然混亂應立即醫療協助、陪伴/短句/避免連續追問、帶藥物資訊，並列急性原因。英國電話 999 不直接移植，台灣 119 另由第 7 筆核對。 |
| 7 | 衛生福利部國民健康署。3大關鍵行動 預防中風 守護腦健康。2025-10-28。[官方頁](https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=4878&pid=19537) | web open 回 502；urllib + Mozilla/5.0 成功取得官方全文，頁面發布/更新日期均 2025/10/28。 | 新出現單側臉手腳無力、語言異常等中風警訊需立即撥 119；記錄發作時間。未取用頁面與本篇無關的風險比例、BMI 或預防處方。 |

參考資料依 evidenceRank 由小到大排序（1, 1, 2, 2, 2, 2, 2），同步重編正文引文。網站型指引沒有 PMID/DOI，不杜撰識別碼。
資料查核與編輯完成不等於醫師對個案診斷；本文保留醫療與日照服務界線。

## 原創照片與最終 prompts

生成方式：內建 `image_gen.imagegen`，新圖模式，3 張各自獨立呼叫；沒有使用 API/CLI fallback、既有病患照片、素材站照片、截圖改字、拼貼或生成式重複裁切充數。
三張原始輸出均 1672 × 941。使用 macOS `sips` 以 JPEG quality 82 儲存，僅中央移除邊緣 8 × 5 像素使最終為 1664 × 936、精確 16:9；没有放大、變造情境或修改人體。原始 PNG 保留原生成路徑。
原始圖和最終 JPEG 均已逐張用視覺工具檢查：人物尊嚴、台灣生活場景、構圖差異、手部、無文字/標誌/浮水印、無限制動作或醫療處置。員工僅出現在第三張，為鮮橘短袖 polo；家屬均便服。

### Hero

- 原始：`/Users/seniorlifepr/.codex/generated_images/01a09086-ae2e-79c2-8de1-daa7d11593bc/exec-e2f9f517-45a9-4456-851a-ea0a987e0d0b.png`
- 最終：`assets/health3/daily/2026-09-11/dementia-acute-change-hero.jpg`；321,157 bytes。
- 檢視：家中母女同高交談，無醫療操作，背景與雙手合理。

```text
Use case: photorealistic-natural. Asset type: original editorial hero photograph for a Traditional Chinese dementia care article about noticing sudden changes and preparing medical assessment. Generate a single realistic 16:9 landscape photo, 2048x1152 pixels or greater than 1536px wide. Scene: a quiet, bright Taiwanese apartment living room with uncluttered walking path. A Taiwanese elderly woman aged about 78 sits safely upright in a sturdy armchair, wearing ordinary pale green home clothing, natural thoughtful expression, dignity and agency. Her adult daughter in plain beige casual clothes sits nearby at the same eye level, gently listening as the older woman talks; a small notebook with blank visible pages and reading glasses rest on a side table, no drinks or pills in hands. Medium-wide view at seated eye level, authentic subtle documentary photography, warm daylight, realistic skin texture, no exaggerated distress or staged smiles. Clearly two people only, correct anatomy and hands. Family members wear casual clothing; if any professional care staff appear they must wear vivid bright orange short sleeve polo shirts, but no staff are needed in this scene. No text, lettering, numbers, logos, watermark, uniforms, hospital bed, restraints, coercion, or medical procedure. Original compassionate daily life, not a real patient's documented diagnosis.
```

### Inline 1

- 原始：`/Users/seniorlifepr/.codex/generated_images/01a09086-ae2e-79c2-8de1-daa7d11593bc/exec-4f5c6fca-3c2c-4db3-be6c-06c18baf0caf.png`
- 最終：`assets/health3/daily/2026-09-11/dementia-acute-change-inline-1.jpg`；249,237 bytes。
- 檢視：越肩視角記錄生活資訊；藥袋反面無文字，没有實際給藥；與 hero 視角、人物及活動均不同。

```text
Use case: photorealistic-natural. Asset type: original inline educational editorial photograph for dementia care, a family preparing a concise observation record for a medical visit. Generate one realistic 16:9 landscape photograph, at least 1536px wide, ideally 2048x1152. Scene: modest Taiwanese dining room in daytime. Main composition is an over-the-shoulder close view of an adult Taiwanese son in a plain navy casual shirt seated at the table, organizing a plain blank notebook, a small cloth glasses case, and two sealed plain medicine bags turned over so no printing is visible. His elderly Taiwanese father in a comfortable light gray cardigan sits clearly upright on a sturdy armchair in the soft-focus background and participates calmly in the conversation. Son holds one pen correctly above the blank notebook, all anatomy and fingers realistic. This is reviewing existing information, no medicine being administered, no pills laid out, no invented diagnostic device. Warm natural side light, uncluttered and believable lived-in home, textured realistic skin and furniture. Family members wear ordinary casual clothes; any professional care staff, if present, must be in vivid bright orange short sleeve polo, but there are no staff in this scene. No text, letters, numbers, logos, watermark, exaggerated distress, restraint, medical procedure, or hospital setting. Respectful original daily-life scene with two people only.
```

### Inline 2

- 原始：`/Users/seniorlifepr/.codex/generated_images/01a09086-ae2e-79c2-8de1-daa7d11593bc/exec-0f4aa085-c336-4bad-a067-b1aa26c0e644.png`
- 最終：`assets/health3/daily/2026-09-11/dementia-acute-change-inline-2.jpg`；334,085 bytes。
- 檢視：日照座位上長輩參與討論，工作人員鮮橘短袖 polo 與家屬便服清楚區分；未呈現急性患者參與活動，caption限定為回日照前的支持討論。

```text
Use case: photorealistic-natural. Asset type: original inline photograph for a Taiwanese dementia care article showing return-to-day-care discussion AFTER medical assessment and stabilization, not emergency treatment. Single photo, 16:9 wide landscape at least 1536px wide, ideally 2048x1152. Scene: calm naturally lit corner of a real Taiwanese adult day care center with pale walls, plants, a low shelf with just a few simple activity materials, clear accessible walking aisle. Three people seated safely in a small conversational triangle: a Taiwanese older woman about 80 in a pale lavender casual blouse on a sturdy armchair, her adult son in a plain cream casual shirt beside her, and one Taiwanese female professional care worker in a vivid bright orange short sleeve polo shirt and dark trousers. Worker sits at the older woman's eye level and listens warmly to the older woman, holding a plain clipboard with blank paper, the older woman participates and gently points toward a simple folded cloth activity on the table. Wide documentary composition that includes clear floor and seating, authentic subtle expressions, natural anatomy and hands, no overpowering gestures or staged applause. Staff must wear vivid bright orange short sleeve polo with no logo, family and senior wear ordinary casual clothes. No written text, letters, numbers, logos, badge lettering, watermark, medical equipment, pill administration, restraints, coercion or emergency scene. Distinct from a home visit, credible dignified day care setting.
```

## 原創 SVG

- `assets/health3/daily/2026-09-11/dementia-acute-change-chart.svg`，1200 × 675，具 `role="img"`、`title`、`desc`、`aria-labelledby`。
- 程式繪製定性溝通流程，不使用任何捏造數值、百分比、風險分數或療效曲線。
- 三階段：先醫療協助、資訊準備不可延誤、處理後追蹤與照顧交接；另列119急症訊息。
- Quick Look 曾將 SVG 以方形預覽裁切，該縮圖不是原始 SVG 尺寸；正式整合時由主代理在網站瀏覽器檢查 SVG 完整渲染，避免以 Quick Look 方形預覽作版面結論。

## 資產與自檢

- 每個最終 JPG/SVG 同時存於 `assets/health3/daily/2026-09-11/` 與 `public/assets/health3/daily/2026-09-11/`，檔案位元一致。
- 三張照片皆具有非空 alt、AI 生成情境示意 caption，SVG 列明定性流程。
- inlineImages 的 afterSection 為 1、3、5。
- 已檢查模組可 import、7 節與 14 段、4 個摘要、1 checklist、1 table、3 FAQ、7 References、3 既有 relatedSlugs。
- coverage 三個標題均精確對應正文標題。
- 已補 authorTitle、contentRevision、ctaText、ctaUrl，修正簡體字，未改共享 URL map/index/batch/validator，也未 commit/push。
