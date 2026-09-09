const refs = {
  taiwanApply: {
    citation: "衛生福利部長期照顧司。申請長照服務；資料查核日：2026-09-09。",
    url: "https://1966.gov.tw/LTC/cp-6533-70777-207.html", evidenceRank: 1
  },
  taiwanCare: {
    citation: "衛生福利部長期照顧司。照顧服務；更新時間：2025-01-06；資料查核日：2026-09-09。",
    url: "https://1966.gov.tw/LTC/cp-6451-69935-207.html", evidenceRank: 1
  },
  homeContract: {
    citation: "衛生福利部。居家式服務類長期照顧服務機構定型化契約範本；資料查核日：2026-09-09。",
    url: "https://www.mohw.gov.tw/dl-87923-c9451cbc-7da0-4f5c-b877-6a721844bc3c.html", evidenceRank: 1
  },
  whoIcope: {
    citation: "World Health Organization. Integrated care for older people: guidance for person-centred assessment and pathways in primary care, 2nd ed. 2025. ISBN 978-92-4-010372-6.",
    url: "https://www.who.int/publications/i/item/integrated-care-for-older-people-%28-icope%29-guidance-for-person-centred-assessment-and-pathways-in-primary-care", evidenceRank: 1
  },
  transitionIndicators: {
    citation: "Tate K, Lee S, Rowe BH, et al. Quality Indicators for Older Persons' Transitions in Care: A Systematic Review and Delphi Process. Can J Aging. 2022;41(1):40-54.",
    url: "https://pubmed.ncbi.nlm.nih.gov/34080533/", pmid: "34080533", doi: "10.1017/S0714980820000446", evidenceRank: 1
  },
  textureReview: {
    citation: "Hansen T, Beck AM, Kjaersgaard A, Poulsen I. Second update of a systematic review and evidence-based recommendations on texture modified foods and thickened liquids for adults with oropharyngeal dysphagia. Clin Nutr ESPEN. 2022;49:551-555.",
    url: "https://pubmed.ncbi.nlm.nih.gov/35623866/", pmid: "35623866", doi: "10.1016/j.clnesp.2022.03.039", evidenceRank: 1
  },
  mealSatisfaction: {
    citation: "Wu XS, Miles A, Braakhuis A. Texture-Modified Diets, Nutritional Status and Mealtime Satisfaction: A Systematic Review. Healthcare (Basel). 2021;9(6):624.",
    url: "https://pubmed.ncbi.nlm.nih.gov/34073835/", pmid: "34073835", doi: "10.3390/healthcare9060624", evidenceRank: 1
  },
  iddsi: {
    citation: "International Dysphagia Diet Standardisation Initiative. IDDSI Framework and Detailed Level Definitions 2.0；資料查核日：2026-09-09。",
    url: "https://www.iddsi.org/standards/framework", evidenceRank: 1
  },
  ashaDysphagia: {
    citation: "American Speech-Language-Hearing Association. Adult Dysphagia Practice Portal；資料查核日：2026-09-09。",
    url: "https://www.asha.org/practice-portal/clinical-topics/adult-dysphagia/", evidenceRank: 1
  },
  whoHandover: {
    citation: "World Health Organization Collaborating Centre for Patient Safety Solutions. Communication During Patient Hand-Overs. 2007.",
    url: "https://cdn.who.int/media/docs/default-source/patient-safety/patient-safety-solutions/ps-solution3-communication-during-patient-handovers.pdf?sfvrsn=7a54c664_8", evidenceRank: 2
  }
};

function dailyArticle(article) {
  return {
    date: "2026.09.09", publishedAt: "2026-09-09T00:00:00+08:00",
    authorTitle: "歲悅長照營業項目知識整理", ctaText: "留下需求討論", ctaUrl: "/contact",
    contentRevision: "2026-09-09-daily-business-v1", ...article
  };
}

export const dailyArticles20260909 = [
  dailyArticle({
    slug: "home-care-unplanned-request-conversation",
    title: "居服來了才想到要加做一件事？家屬先用三句話把新需求說清楚",
    dek: "臨時多一件事，可能只是今天行程變了，也可能表示長輩功能或家庭照顧量已經改變。家屬先說發生什麼、最擔心什麼、希望誰一起確認，讓照服員不用在案家獨自承諾，也讓真正需要調整的照顧計畫有後續。",
    excerpt: "家屬臨時想調整居服內容時，先說明變化、擔心與期待的後續，由照服員觀察回報，再由督導或個管確認安排。",
    category: "居家照顧", relatedService: "居家照顧", author: "歲悅居家照顧編輯部",
    image: "assets/health3/daily/2026-09-09/home-care-change-hero.jpg",
    imageAlt: "台灣長輩與便服女兒在客廳向穿鮮橘色短袖 polo 的居家照顧督導說明新的生活需要",
    imageCaption: "先讓長輩與家屬把生活變化說完整，再一起決定誰來確認下一步。AI 生成情境示意。",
    focalPoint: "center", readingMinutes: 10,
    targetAudience: "正在使用居家照顧，最近出現新生活需求、想調整服務內容或不確定如何和服務團隊說明的長輩與家屬",
    tags: ["居家照顧", "服務調整", "家屬溝通", "照顧計畫"],
    keywords: "居服 臨時 加做 服務內容 調整 家屬 督導 個管 照顧計畫",
    seoTitle: "居服臨時想加做怎麼說？家屬三句溝通｜歲悅長照",
    seoDescription: "居服到家才出現新需求，家屬用變化、擔心、後續三句話說清楚，讓第一線回報並由督導或個管正式確認服務調整。",
    summary: ["先描述最近發生的生活變化，不只丟出一項工作。", "說清楚今天最擔心的風險與本人意願，急症先處理。", "照服員可先做安全觀察與回報，不必在現場獨自改承諾。", "由督導、個管或合適專業角色確認服務內容、時程與費用，再更新執行。"],
    warning: { title: "急症不能等服務調整流程", body: "若長輩突然單側無力、臉歪、說話不清、胸痛、呼吸困難、意識改變、叫不醒、嚴重跌倒受傷或其他急症警訊，先停止一般工作並依緊急流程求助。不要把就醫、通報或立即安全處置當成『下次再加做』。", items: ["本文提供溝通與服務決策框架，不判定個別給付、費用、契約權利或照顧處方。", "長照制度資訊查核日為 2026-09-09；實際安排以照顧計畫、契約、地方規定與服務單位確認為準。"] },
    content: [
      ["門一打開才想到的新需求，背後常有一段沒說出口的變化", ["媽媽昨晚差點跌倒，家屬想請今天的居服員順便整理浴室；爸爸最近吃不下，臨時希望多煮一餐。家人不是故意增加工作，而是照顧現場真的會變；但只說「今天幫我多做這個」，第一線很難判斷風險、服務範圍、時間與原定任務怎麼取捨。", "衛福部長照資訊說明，居家服務包含多種身體與日常照顧項目，實際服務則由評估、照顧計畫與特約單位提供。這表示新需求值得被聽見，也需要被放回正式安排裡確認；不是家屬不能提出，也不是照服員當場一句可以或不可以就結束。"]],
      ["第一句說變化：『最近發生了什麼，所以今天提出來』", ["把事件與時間說具體，例如「這三天洗澡時站得更不穩」「原本會自己加熱，這週兩次忘記關火」。先說觀察，不先下診斷，也不要把多年病史一次全講完。若長輩能表達，先問本人覺得哪裡最困難、想先處理什麼。", "WHO 2025 年 ICOPE 指引強調以長者的需要、價值與偏好發展個人化照顧計畫。家屬提供線索很重要，但仍要讓本人參與；『家人覺得應該』與『長輩願意怎麼做』若不同，就把差異誠實帶給團隊，而不是請第一線偷偷照做。"]],
      ["第二句說擔心：『今天最怕哪一件事出問題』", ["同樣是想加做備餐，可能是今天沒有人送飯，也可能是吞嚥、食慾或用火安全出現新狀況。說清楚最擔心的事，照服員才能先看是否有立即危險、原本任務是否仍可完成，以及要不要立刻找督導或醫療協助。不要用「很急」代替具體事實。", "如果沒有急症，第一線可以依單位流程留下觀察並回報；若涉及新技巧、移位方式、飲食質地、用藥或其他專業判斷，不應靠家屬一句話臨時改。暫停承諾不是冷漠，而是避免在資訊不完整時讓長輩、家屬與工作人員一起承擔風險。"]],
      ["第三句說後續：『希望誰在什麼時間前一起確認』", ["可以這樣說：「今天先請你幫我回報督導，明天下午前告訴我們是否需要調整照顧計畫。」把回覆窗口與時間說清楚，比反覆在不同群組追問更有效。若家屬不知道找誰，就請服務單位說明督導、A 單位個管或其他聯絡窗口的分工。", "衛福部的長照申請流程把與個案管理員討論服務項目、擬定照顧計畫列為正式步驟。需求改變時，是否需要重新評估、調整服務或連結其他資源，要依個別情況確認；家屬的任務不是自己算給付，而是把變化與期待帶到正確窗口。"]],
      ["在等待正式回覆時，先約定今天怎麼安全收尾", ["若新需求無法當次直接執行，仍可確認三件事：原定服務哪些能完成、哪個風險需要家屬或其他人先接住、誰已收到回報。把未完成的新需求寫成待確認，不要讓它變成口頭消失，也不要把照服員留在現場承受指責。", "居家式長照機構定型化契約範本提供服務內容、費用、變更與聯絡等約定架構；實際權利義務仍以簽訂契約為準。家屬可以拿出自己的契約與服務計畫，核對取消、變更、額外費用和申訴窗口，避免每次都從零開始猜。"]],
      ["若新需求反覆出現，就不是臨時，而是照顧狀態已改變的訊號", ["同一件事一週提出好幾次、原定任務總被擠掉，或家屬需要補位的時間明顯增加，就把日期、情境與影響簡單記下。照顧轉銜品質研究強調資訊完整、責任清楚與適時追蹤；雖然多數證據來自醫療轉銜，對居家團隊的合理啟示仍是讓資訊帶著下一步，而不是只留下抱怨。", "回顧時問：長輩功能或生活目標變了嗎、原服務內容還對得上嗎、需要其他專業或資源嗎？能把一次臨時請求轉成可共同討論的照顧問題，家屬不用一直拜託，第一線也不必每次獨自做界線判斷。"]]
    ],
    inlineImages: [
      { afterSection: 1, src: "assets/health3/daily/2026-09-09/home-care-change-call.jpg", alt: "穿鮮橘色短袖 polo 的台灣居服員在案家打電話向督導確認，便服長輩在桌邊指出生活物品", caption: "第一線先確認安全、記下變化並找到正確窗口，不必當場獨自承諾。AI 生成情境示意。" },
      { afterSection: 3, src: "assets/health3/daily/2026-09-09/home-care-change-chart.svg", alt: "居家照顧臨時新需求從說明需要、現場停看再到正式確認的三段流程圖", caption: "一般新需求留下正式回覆；急症則優先依緊急流程處理。" },
      { afterSection: 4, src: "assets/health3/daily/2026-09-09/home-care-change-plan.jpg", alt: "台灣長輩與便服兒子在餐桌選擇兩張空白方案卡，穿鮮橘色短袖 polo 的督導在旁記錄", caption: "把本人偏好、家庭能力與服務安排一起談，讓調整不是單方面加工作。AI 生成情境示意。" }
    ],
    checklists: [{ title: "臨時提出新需求前六項整理", items: ["最近發生的變化有具體時間與事實。", "已先詢問長輩本人最在意與願意的做法。", "知道今天最擔心的風險，急症先求助。", "沒有要求照服員自行改變高風險或專業處置。", "已指定督導、個管或合適窗口與回覆時間。", "反覆需求有簡短紀錄，能帶回照顧計畫檢討。"] }],
    tables: [{ title: "新需求出現時，先分流再安排", headers: ["情況", "今天先做", "後續確認"], rows: [["急症或立即人身風險", "停止一般工作並依緊急流程求助", "依醫療與單位程序銜接"], ["單次生活變化", "說明事實、本人意願與原任務影響", "由督導確認當次安排"], ["需求反覆增加", "記日期、情境與家庭補位", "個管或團隊檢討照顧計畫"], ["涉及專業技巧或處方", "不要臨時自行更改", "由合適專業人員評估與教學"]] }],
    faq: [
      { question: "家屬可以直接請居服員多做一件小事嗎？", answer: "可以提出需要，但能否當次執行仍要看安全、原定服務、照顧計畫、契約與單位流程。先把變化與優先順序說清楚，再由合適窗口確認。" },
      { question: "照服員說要問督導，是在推卸嗎？", answer: "不一定。服務範圍、時間、費用與專業風險可能需要具責任的人決定。好的回報應留下聯絡窗口與回覆時間，而不是只說不能做就消失。" },
      { question: "需求變多就一定要重新評估嗎？", answer: "不一定，但若反覆出現、功能明顯改變、原服務經常無法完成或家庭負荷增加，值得向個管或服務團隊提出，確認是否需要調整計畫或連結其他資源。" }
    ],
    cta: "如果家裡的新需求總是在服務當天才浮出來，歲悅居家照顧可陪你把生活變化、本人意願與優先順序整理清楚，再找到合適的調整路徑。",
    relatedSlugs: ["home-care-time-priority-map", "home-care-belongings-privacy-agreement", "home-care-staff-change-continuity"],
    references: [refs.taiwanApply, refs.taiwanCare, refs.homeContract, refs.whoIcope, refs.transitionIndicators]
  }),

  dailyArticle({
    slug: "day-care-meal-plan-update-handover",
    title: "家屬說餐食要改，日照不能只靠口頭交代：四步更新吞嚥與備餐資訊",
    dek: "一張新醫囑、一通電話或一句『最近比較會嗆』，都不該直接變成下一餐的猜測。日照團隊先核對來源與生效日，再由合適專業人員確認，同步照顧與備餐端並觀察回報，才不會同一天出現兩個版本。",
    excerpt: "日照收到餐食或吞嚥新資訊時，先核對、專業確認、雙端同步，再觀察交班，避免口頭轉述、舊版與自行調整混在一起。",
    category: "日間照顧", relatedService: "日間照顧", author: "歲悅日間照顧編輯部",
    image: "assets/health3/daily/2026-09-09/day-care-meal-update-hero.jpg",
    imageAlt: "兩名穿鮮橘色短袖 polo 的台灣日照人員陪便服長輩在餐桌前核對空白餐食照顧文件",
    imageCaption: "餐前先讓本人、照顧端與備餐端確認同一版本，不在托盤前臨時猜測。AI 生成情境示意。",
    focalPoint: "center", readingMinutes: 11,
    targetAudience: "負責日間照顧餐食、吞嚥安全、家屬聯繫、照顧計畫與廚房協作的照服員、護理、營養、管理與備餐人員",
    tags: ["日間照顧", "吞嚥資訊", "餐食交班", "版本管理"],
    keywords: "日照 餐食 吞嚥 飲食質地 家屬 交班 備餐 IDDSI 咳嗆",
    seoTitle: "日照餐食與吞嚥資訊怎麼更新？四步交班｜歲悅長照",
    seoDescription: "家屬帶來新餐食或吞嚥資訊時，日照用核對來源、專業確認、雙端同步與觀察交班四步，避免口頭改單與版本混用。",
    summary: ["新資訊先核對對象、來源、內容、生效日與需釐清處，不直接覆蓋舊版。", "食物質地、液體稠度與餵食策略由合適專業人員評估，不靠外觀猜。", "照顧端與備餐端回讀同一版本，餐前再做兩人核對。", "餐後記錄實際反應與異常，家屬帶回的新變化有明確回覆。"],
    warning: { title: "出現吞嚥或呼吸急症，先停止進食", body: "若進食時出現無法呼吸、無法發聲、明顯發紺、意識改變或疑似完全哽塞，立即依中心急救與緊急醫療流程處理。反覆咳嗆、濕聲、進食明顯變慢、體重或水分狀態改變等線索，也應由合適醫療與吞嚥專業人員評估；不要自行增加增稠劑、改質地或強迫餵完。", items: ["本文只談資訊更新與交班，不提供個別食物質地、液體稠度、姿勢、份量或餵食處方。", "IDDSI 是共通描述框架，不是診斷工具；是否使用與使用哪一級都應依專業評估及在地流程。"] },
    content: [
      ["最危險的不是沒有紙，而是同一天有兩個版本", ["早上家屬口頭說要改軟一點，照顧端聽到了，廚房卻仍照舊；或家屬帶來一張照片，沒有人知道是何時、由誰、針對哪個情境提出。大家都想保護長輩，資訊卻在轉述中變短，最後只能在餐前看著食物猜。", "衛福部說明日間照顧包含基本照顧、餐飲、交通接送、活動與家屬諮詢。餐食因此不是廚房單一部門的工作，而是照顧、專業、備餐、本人與家屬共同銜接的流程。先建立更新路徑，能讓疑問被停下來確認，而不是催著第一線選一個版本。"]],
      ["第一步核對：這份新資訊從哪裡來、何時開始、還缺什麼", ["收到新資料時，先記對象、來源、日期、原文內容、希望生效時間與聯絡人；把「家屬觀察」「專業評估結果」「醫療指示」分開，不把口頭轉述自動寫成診斷。若只有模糊描述，就標記待確認，保留舊版但暫停可能不安全的安排。", "WHO 的交班解決方案強調以標準方式傳遞關鍵資訊、讓接收方有提問與回讀機會。這份文件主要面向醫療安全；日照可採用的原則是把資料原貌、未確定處與下一位負責人一起交出去，不在每一手轉述時自行補字。"]],
      ["第二步專業確認：共通名稱能減少誤解，但不能替代評估", ["IDDSI 提供食物質地與液體稠度的共通術語及測試方法，有助不同角色說同一件事；但看起來像泥、粥或勾芡，不能靠照片就判定級別。若中心採用 IDDSI，應由受訓人員依完整框架與個別專業建議執行，不能只抄顏色或數字。", "2022 年系統性回顧指出，增稠液體與質地調整對死亡、肺炎、生活品質、營養或攝取量等結果的證據仍不具說服力；另一篇回顧也提醒餐食滿意度與營養結果需要一起考量。因此流程不能把『越稠越安全』當成通則，更不能沒有本人偏好與追蹤。"]],
      ["第三步雙端同步：照顧端與備餐端都要回讀同一版本", ["確認後，由單一正式位置更新，標示版本、生效餐次、負責專業角色與需要觀察的事項；舊版明確撤下。照顧端回讀需要的協助與停止條件，備餐端回讀食物與液體描述、測試與替代品，兩邊都能說出有疑問時找誰。", "ASHA 的成人吞嚥實務資料把語言治療師視為口咽吞嚥評估與管理的重要專業成員，也強調跨專業合作。各地角色與法規不同；中心應依本地資格與流程分工，讓照服員、護理、營養、備餐與家屬知道自己的觀察責任，也知道哪些決定不能自行更改。"]],
      ["餐前兩人核對，餐中保留觀察與本人說停的權利", ["餐前由兩個角色核對姓名或既定身分識別、餐別、現行版本與托盤內容，避免只看一張顏色卡。進食時依專業計畫提供協助，觀察咳嗆、聲音、呼吸、疲勞、攝取與本人反應；不要為了完成份量催促，也不要把拒絕直接寫成不配合。", "若表現與平常或專業計畫不同，先停止或調整到安全狀態並依流程找專業人員，不在現場自行換一種稠度試看看。系統性回顧提示質地調整也可能影響攝取、營養與用餐經驗；安全、足夠攝取、尊嚴與偏好需要一起回看。"]],
      ["第四步觀察交班：把結果送回家屬與下一餐，而不是只說吃完了", ["餐後記錄實際提供版本、吃喝反應、需要多少協助、是否中止、已做處置與下一步。回覆家屬時避免只有「今天正常」或「吃得不好」；說明可觀察事實，並指出新資訊是否已確認、何時生效、仍需誰回覆。", "每天或每次異動後回看：照顧端與備餐端是否一致、舊版是否還出現在任何地方、本人是否接受、是否出現反覆異常。好的餐食更新不是多一張表，而是讓一項新資訊走完核對、確認、執行與回饋，下一餐不用重新猜。"]]
    ],
    inlineImages: [
      { afterSection: 1, src: "assets/health3/daily/2026-09-09/day-care-meal-update-check.jpg", alt: "兩名穿鮮橘色短袖 polo 的台灣日照備餐與照顧人員在出餐檯核對空白色卡和加蓋餐盤", caption: "備餐端與照顧端共同回讀現行版本，疑問在出餐前被看見。AI 生成情境示意。" },
      { afterSection: 3, src: "assets/health3/daily/2026-09-09/day-care-meal-update-chart.svg", alt: "日照餐食與吞嚥資訊從核對來源、專業確認、雙端同步到觀察交班的四步閉環圖", caption: "定性更新流程；不代表任何個別食物質地或液體稠度處方。" },
      { afterSection: 4, src: "assets/health3/daily/2026-09-09/day-care-meal-update-handover.jpg", alt: "台灣日照長輩與便服女兒在接待區，兩名穿鮮橘色短袖 polo 的工作人員以空白資料夾完成返家交班", caption: "把已生效內容、實際反應與待確認事項一起交回家庭。AI 生成情境示意。" }
    ],
    checklists: [{ title: "餐食與吞嚥資訊更新六項核對", items: ["資料對象、來源、日期、原文與聯絡人完整。", "觀察、轉述、評估結果與正式指示清楚區分。", "質地、稠度與協助方式由合適專業人員確認。", "照顧端與備餐端已回讀同一版本，舊版撤下。", "餐前身分、餐別、版本與托盤完成兩人核對。", "餐後反應、異常處置、家屬回覆與下一步已交班。"] }],
    tables: [{ title: "常見更新訊息，怎麼先處理", headers: ["收到的訊息", "先核對", "不要直接做"], rows: [["家屬說最近比較會嗆", "何時、吃喝什麼、發生什麼反應", "自行加稠或改質地"], ["帶來新文件或照片", "對象、來源、日期、生效與疑問", "只看圖片猜等級"], ["照顧端發現與平常不同", "停止條件、現場事實、已做處置", "換另一餐測試看看"], ["專業建議已更新", "兩端回讀、舊版撤下、本人偏好", "只通知其中一班或一端"]] }],
    faq: [
      { question: "家屬傳一張醫院餐點照片，日照可以照著做嗎？", answer: "照片可當線索，但通常不足以確認食物質地、液體稠度、對象與生效條件。應核對原始專業建議並由合適角色確認，不靠外觀猜測。" },
      { question: "用了 IDDSI 等級就一定安全嗎？", answer: "不一定。IDDSI 提供共通描述與測試方法，不是診斷或個別處方；還需要專業評估、正確製備、本人狀態、協助方式與持續觀察。" },
      { question: "長輩今天不想吃，是否要立刻換成更軟的餐？", answer: "先了解口味、疼痛、疲勞、情緒、環境與是否有吞嚥或急性不適線索。不要把拒絕直接等同吞嚥問題，也不要未經確認自行改質地；依異常程度啟動專業或緊急流程。" }
    ],
    cta: "如果你的日照團隊常在餐前才發現版本不一致，歲悅日間照顧可陪你把家屬來訊、專業確認、備餐核對與餐後交班串成同一條安全流程。",
    relatedSlugs: ["day-care-shuttle-handover", "day-care-quiet-space-support", "day-care-activity-refusal-choice"],
    references: [refs.textureReview, refs.mealSatisfaction, refs.iddsi, refs.ashaDysphagia, refs.whoHandover, refs.taiwanCare]
  })
];
