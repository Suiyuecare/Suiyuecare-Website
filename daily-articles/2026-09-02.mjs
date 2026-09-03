const refs = {
  ehrDowntimeCare: {
    citation: "Larsen E, Hoffman D, Rivera C, Kleiner BM, Wernz C, Ratwani RM. Continuing Patient Care during Electronic Health Record Downtime. Appl Clin Inform. 2019;10(3):495-504.",
    url: "https://pubmed.ncbi.nlm.nih.gov/31291677/",
    pmid: "31291677",
    doi: "10.1055/s-0039-1692678",
    evidenceRank: 1
  },
  ehrDowntimeReports: {
    citation: "Larsen E, Fong A, Wernz C, Ratwani RM. Implications of electronic health record downtime: an analysis of patient safety event reports. J Am Med Inform Assoc. 2018;25(2):187-191.",
    url: "https://pubmed.ncbi.nlm.nih.gov/28575417/",
    pmid: "28575417",
    doi: "10.1093/jamia/ocx057",
    evidenceRank: 1
  },
  documentationTime: {
    citation: "Baumann LA, Baker J, Elshaug AG. The impact of electronic health record systems on clinical documentation times: A systematic review. Health Policy. 2018;122(8):827-836.",
    url: "https://pubmed.ncbi.nlm.nih.gov/29895467/",
    pmid: "29895467",
    doi: "10.1016/j.healthpol.2018.05.014",
    evidenceRank: 1
  },
  nistContingency: {
    citation: "Swanson M, Bowen P, Phillips AW, Gallup D, Lynes D. Contingency Planning Guide for Federal Information Systems. NIST SP 800-34 Rev. 1. 2010.",
    url: "https://csrc.nist.gov/pubs/sp/800/34/r1/final",
    doi: "10.6028/NIST.SP.800-34r1",
    evidenceRank: 1
  },
  saferGuides: {
    citation: "Assistant Secretary for Technology Policy / Office of the National Coordinator for Health Information Technology. SAFER Guides: Contingency Planning. 資料查核日：2026-09-03。",
    url: "https://www.healthit.gov/topic/safety/safer-guides",
    evidenceRank: 1
  },
  privacyAct: {
    citation: "法務部全國法規資料庫。個人資料保護法。資料查核日：2026-09-03。",
    url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021",
    evidenceRank: 1
  },
  whoIcope: {
    citation: "World Health Organization. Integrated care for older people (ICOPE): guidance for person-centred assessment and pathways in primary care. 2nd ed. 2025.",
    url: "https://iris.who.int/bitstream/handle/10665/380175/9789240103726-eng.pdf",
    evidenceRank: 1
  },
  homeContinuity: {
    citation: "Ma C, McDonald MV, Feldman PH, Miner S, Jones S, Squires A. Continuity of Nursing Care in Home Health: Impact on Rehospitalization Among Older Adults With Dementia. Med Care. 2021;59(10):913-920.",
    url: "https://pubmed.ncbi.nlm.nih.gov/34166269/",
    pmid: "34166269",
    doi: "10.1097/MLR.0000000000001599",
    evidenceRank: 1
  },
  homeRiskVisits: {
    citation: "Klunder JH, Bordonis V, Heymans MW, et al. Predicting unplanned hospital visits in older home care recipients: a cross-country external validation study. BMC Geriatr. 2021.",
    url: "https://pubmed.ncbi.nlm.nih.gov/34649526/",
    pmid: "34649526",
    doi: "10.1186/s12877-021-02521-2",
    evidenceRank: 1
  },
  transitionsTools: {
    citation: "Makhmutov R, Calle Egusquiza A, Roqueta Guillen C, et al. Assessment tools addressing avoidable care transitions in older adults: a systematic literature review. Eur Geriatr Med. 2024;15(6):1587-1601.",
    url: "https://pubmed.ncbi.nlm.nih.gov/39612079/",
    pmid: "39612079",
    doi: "10.1007/s41999-024-01106-7",
    evidenceRank: 1
  },
  longTermCareBenefits: {
    citation: "法務部全國法規資料庫。長期照顧服務申請及給付辦法。資料查核日：2026-09-03。",
    url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0070059",
    evidenceRank: 1
  },
  dementiaDayCarePosition: {
    citation: "Mossello E, Baccini M, Caramelli F, et al. Italian guidance on Dementia Day Care Centres: A position paper. Aging Clin Exp Res. 2023;35:717-729.",
    url: "https://pubmed.ncbi.nlm.nih.gov/36795236/",
    pmid: "36795236",
    doi: "10.1007/s40520-023-02356-4",
    evidenceRank: 1
  },
  communityCareAccess: {
    citation: "Giebel C, Hanna K, Watson J, et al. A systematic review on inequalities in accessing and using community-based social care in dementia. Int Psychogeriatr. 2024.",
    url: "https://pubmed.ncbi.nlm.nih.gov/37170588/",
    pmid: "37170588",
    doi: "10.1017/S104161022300042X",
    evidenceRank: 1
  },
  caregiverDailyLife: {
    citation: "Freedman VA, Patterson SE, Cornman JC, Wolff JL. A day in the life of caregivers to older adults with and without dementia: Comparisons of care time and emotional health. Alzheimers Dement. 2022;18(9):1650-1661.",
    url: "https://pubmed.ncbi.nlm.nih.gov/35103394/",
    pmid: "35103394",
    doi: "10.1002/alz.12550",
    evidenceRank: 1
  },
  adultDayAffect: {
    citation: "Bangerter LR, Liu Y, Kim K, Zarit SH, Almeida DM, Femia EE. Adult day services and dementia caregivers' daily affect: the role of distress response to behavioral and psychological symptoms of dementia. Aging Ment Health. 2021;25(1):46-52.",
    url: "https://pubmed.ncbi.nlm.nih.gov/31668091/",
    pmid: "31668091",
    doi: "10.1080/13607863.2019.1681934",
    evidenceRank: 1
  },
  adultDayStress: {
    citation: "Klein LC, Kim K, Almeida DM, Femia EE, Rovine MJ, Zarit SH. Anticipating an Easier Day: Effects of Adult Day Services on Daily Cortisol and Stress. Gerontologist. 2016;56(2):303-312.",
    url: "https://pubmed.ncbi.nlm.nih.gov/24996408/",
    pmid: "24996408",
    doi: "10.1093/geront/gnu060",
    evidenceRank: 1
  }
};

function dailyArticle(article) {
  return {
    date: "2026.09.02",
    publishedAt: "2026-09-02T00:00:00+08:00",
    authorTitle: "歲悅長照營業項目知識整理",
    ctaText: "留下需求討論",
    ctaUrl: "/contact",
    contentRevision: "2026-09-02-daily-business-v1",
    ...article
  };
}

export const dailyArticles20260902 = [
  dailyArticle({
    slug: "long-term-care-system-downtime-continuity",
    category: "軟體系統",
    relatedService: "軟體系統",
    author: "歲悅軟體系統編輯部",
    title: "系統斷線也不能讓照顧斷線：長照第一線的離線紀錄與補登流程",
    dek: "網路不穩、設備故障或維護期間，第一線最需要的不是臨時找一張紙，而是一套知道何時啟動、記哪些最低必要資訊、由誰交班與如何補登核對的備援流程。",
    excerpt: "長照系統停機時，先保住服務與關鍵紀錄，再依明確責任補登核對；避免重複、漏接與個資散落。",
    image: "assets/health3/daily/2026-09-02/system-downtime-hero.jpg",
    imageAlt: "三名穿鮮橘色制服的台灣長照人員在辦公室以空白紙本、時鐘與闔上的平板討論系統停機備援",
    imageCaption: "停機備援不是資訊人員單獨處理的事；第一線要知道何時切換、用哪一份表，以及服務恢復後由誰核對。",
    focalPoint: "center",
    readingMinutes: 10,
    targetAudience: "長照第一線人員、督導、行政與負責照顧紀錄系統的營運團隊",
    tags: ["軟體系統", "停機備援", "離線紀錄", "交班安全"],
    keywords: "長照系統斷線 停機備援 離線紀錄 補登流程 照顧紀錄 交班 個資安全",
    seoTitle: "長照系統斷線怎麼辦？離線紀錄與補登流程｜歲悅長照",
    seoDescription: "長照紀錄系統停機時，如何啟動紙本備援、保留最低必要資訊、完成交班與補登核對？用六步建立不漏接且兼顧個資的流程。",
    summary: [
      "停機的第一優先是維持安全照顧與必要溝通，不是要求所有人立刻把完整系統搬到紙上。",
      "備援表只留能支撐辨識、時間、觀察、處置、結果與交班的最低必要資訊。",
      "紙本也有個資風險，應編號、集中保管、限制存取並在補登後依制度處理。",
      "系統恢復後由指定人補登、另一人核對，保留原始時間與紀錄來源，避免把補登時間誤當服務時間。"
    ],
    warning: {
      title: "停機不等於可以改用私人通訊軟體散傳資料",
      body: "不要把姓名、病況、照片或完整照顧紀錄任意傳到私人群組、個人雲端或未核准裝置。若同時涉及資安或個資事件，應另依機構程序與現行法規處理。",
      items: ["急性異常仍依緊急處置與通報流程優先處理，不等系統恢復。", "本文提供營運備援框架，不取代各機構的法定保存、事故通報與個資管理義務。"]
    },
    content: [
      ["停機真正考驗的是照顧連續性，不只是電腦能不能開", [
        "系統斷線時，第一線同時面對兩件事：服務仍在進行，原本依賴的名單、提醒、紀錄與交班入口卻暫時不可用。若現場只剩一句「先寫紙本」，每個人會各自發明格式，重要資訊可能漏掉，之後也很難判斷哪一筆已補登。",
        "電子病歷停機研究顯示，工作流程、溝通與資訊可得性都可能在停機期間受到影響；完整準備需要把人、流程、替代工具與恢復步驟一起設計。長照場域不必複製醫院表單，但同樣需要明確的照顧連續性思維。"
      ]],
      ["啟動前先說清楚：誰宣布停機、哪個版本才算正式", [
        "備援流程要先定義啟動條件，例如服務端無法登入、網路中斷或計畫性維護，並指定誰可以宣布切換。現場只使用事先核定的表單或離線包，不要從抽屜找出多年前的舊版本，也不要各自用便條紙代替。",
        "離線包可包含當日必要名單的安全取得方式、連續編號空白表、緊急聯絡樹、保管袋與補登追蹤表。內容要依服務型態縮到最低必要，不為了「怕漏」而印出所有個案資料。"
      ]],
      ["停機中只記六件事，讓下一位真的接得下去", [
        "一筆最低必要紀錄通常要能回答：服務對象是誰、何時發生、觀察到什麼、做了什麼、結果與下一步是什麼、誰留下紀錄。若有異常，再補上已聯絡對象與回覆；不要用模糊的「狀況同前」讓接班者回頭猜。",
        "紀錄仍要區分觀察與判斷。例如「午餐後咳嗽三次」是觀察，「疑似吞嚥異常」是需要專業評估的判斷。先留下可核對事實，再依權責聯絡，不因系統停機延後必要求助。"
      ]],
      ["交班要有交付動作，也要保護紙本個資", [
        "離線紀錄不能散落在車上、家中或手機相簿。每張表使用連續編號，當班結束時點交張數與未完成事項，交給指定保管人；需要跨點移動時，使用封閉方式並限制只有工作必要角色可接觸。",
        "個人資料保護法要求蒐集、處理與利用有適當目的和安全維護。實務上，備援表不寫與本次服務無關的細節、不重複影印、不拍照備份，並讓每一次取用與交接都有責任人。"
      ]],
      ["恢復後不是全部重打，而是有順序地補登與核對", [
        "系統恢復後先公告切回時間，避免有人繼續寫紙本、有人已回到系統，形成兩條平行紀錄。由指定人依編號補登，保留實際服務時間、原紀錄者與「停機後補登」來源；高風險或仍待追蹤項目先處理。",
        "補登完成後由另一人核對服務對象、時間、重要異常、處置與後續任務，再在追蹤表註記完成。若發現紙本和系統已有重複，不直接刪掉其中一筆，而是依機構修正規則留下可稽核的處理紀錄。"
      ]],
      ["每次演練只問三件事：拿得到、看得懂、補得回", [
        "NIST 的應變規劃強調風險評估、替代策略、測試演練與持續維護。長照團隊可以用十分鐘桌上演練：假設早班登入失敗，看看誰宣布、表單在哪裡、誰保管，以及一筆異常如何進到晚班。",
        "演練後不要只記「完成」。把找不到的表、過時的電話、重複欄位與補登卡點列成改善清單。真正可用的備援不是厚厚一本計畫，而是臨時發生時第一線仍能照著做。"
      ]]
    ],
    inlineImages: [
      { afterSection: 1, src: "assets/health3/daily/2026-09-02/system-downtime-paper-handoff.jpg", alt: "穿鮮橘色制服的台灣居服員在餐桌用空白紙本記錄，長輩與女兒共同說明當下情況", caption: "停機紀錄先保留可交班的事實與下一步，不把所有系統欄位原封不動搬到紙上。" },
      { afterSection: 3, src: "assets/health3/daily/2026-09-02/system-downtime-flow-chart.svg", alt: "長照系統從判定停機、紙本記錄、點交保管、恢復補登到雙人核對的流程圖", caption: "備援流程要有清楚的切換點與結束點，避免紙本與系統長時間平行。" },
      { afterSection: 4, src: "assets/health3/daily/2026-09-02/system-downtime-reconciliation.jpg", alt: "兩名穿鮮橘色制服的台灣長照人員在夜間辦公室核對一疊紙本與背向鏡頭的筆電", caption: "指定一人補登、另一人核對，能降低遺漏與重複，也保留責任軌跡。" }
    ],
    checklists: [{
      title: "停機離線包的最低準備",
      items: ["明確的啟動與切回公告人。", "有版本日期的連續編號空白表。", "必要聯絡樹與不依賴同一系統的取得方式。", "紙本集中保管、點交與限制存取方法。", "補登優先順序、責任人與第二人核對。", "定期演練後的問題清單與更新日期。"]
    }],
    tables: [{
      title: "四個階段，各自最容易漏什麼",
      headers: ["階段", "最低必要動作", "常見風險"],
      rows: [
        ["切換", "由指定角色宣布並發放正式表單", "多人各自決定、使用舊版"],
        ["服務中", "留下時間、觀察、處置、結果與責任人", "只寫結論、無法交班"],
        ["交班", "編號點交、集中保管、標出未結事項", "紙本散落或被拍照轉傳"],
        ["恢復", "公告切回、依序補登、第二人核對", "重複紀錄或時間來源混淆"]
      ]
    }],
    faq: [
      { question: "可以直接用 LINE 群組當停機備援嗎？", answer: "不建議把私人群組當正式紀錄庫。通訊工具只能依核准流程做必要通知，敏感資料應最小化；正式紀錄、保管與補登仍需使用機構核定方式。" },
      { question: "系統恢復後，紙本可以立刻丟掉嗎？", answer: "不可以自行處理。先完成補登與核對，再依機構保存、銷毀及稽核規則辦理；不同服務與紀錄可能有不同要求。" },
      { question: "小型單位也需要演練嗎？", answer: "需要，但可以很精簡。用一個真實班次做桌上推演，確認表單拿得到、聯絡人找得到、資料補得回，比只把流程放在資料夾裡更有用。" }
    ],
    cta: "如果團隊的照顧紀錄一遇到斷線就各自想辦法，歲悅軟體系統可陪你把停機切換、最低必要欄位、交班保管與補登核對整理成第一線做得到的流程。",
    relatedSlugs: ["family-care-report-rhythm", "careworker-records-supervision-support", "medication-reminder-system"],
    references: [refs.ehrDowntimeCare, refs.ehrDowntimeReports, refs.documentationTime, refs.nistContingency, refs.saferGuides, refs.privacyAct]
  }),
  dailyArticle({
    slug: "home-care-time-priority-map",
    category: "居家照顧",
    relatedService: "居家照顧",
    author: "歲悅居家照顧編輯部",
    title: "居服時段怎麼排才有用？先找出一天裡最需要支援的空窗",
    dek: "有限的居服時間不一定平均分散最有效。把長輩一天的作息、最容易失手的任務、家庭不在場時段與本人最在意的生活放在同一張圖，才能找到真正需要服務接手的空窗。",
    excerpt: "安排居服先找高風險、低替代與本人重視的生活時段，再用短期試行和交班紀錄持續調整。",
    image: "assets/health3/daily/2026-09-02/homecare-time-priority-hero.jpg",
    imageAlt: "台灣長輩、女兒與穿鮮橘色制服的居家督導在餐桌用空白色卡和時鐘討論一天作息",
    imageCaption: "時段安排不是替長輩決定生活，而是把本人想維持的作息、家庭空窗與安全需求一起看。",
    focalPoint: "center",
    readingMinutes: 10,
    targetAudience: "正在申請、調整或評估居家照顧服務時段的家庭與服務決策人員",
    tags: ["居家照顧", "服務時段", "照顧計畫", "家庭分工"],
    keywords: "居服時段 居家照顧安排 服務時間 照顧空窗 家庭分工 長照照顧計畫",
    seoTitle: "居服時段怎麼排？找出真正需要支援的空窗｜歲悅長照",
    seoDescription: "居家照顧時間有限，如何決定早上、午間或晚上？用風險、替代人力、本人目標與固定任務，排出更有作用的居服時段。",
    summary: [
      "先畫出長輩真實的一天，不從服務項目清單反推生活。",
      "高風險、沒有人能接手、且時間不能延後的任務，通常優先級較高。",
      "同一位或少數熟悉人員的連續性，有助於減少每次重新說明與辨認變化的成本。",
      "時段不是一次排定永久不動；疾病、家庭班表與長輩目標改變時，都應回到照顧計畫重新討論。"
    ],
    warning: {
      title: "急性症狀不能靠改排居服時段處理",
      body: "突然胸痛、呼吸困難、意識改變、單側無力、持續出血或跌倒後明顯異常，應先依急症流程求助，不等待下一次居服。",
      items: ["服務內容、頻率與可用時段仍以正式評估、核定照顧計畫和特約單位實際安排為準。", "本文不承諾特定時段一定可提供，也不以一般框架取代個別專業評估。"]
    },
    content: [
      ["排時段最常見的錯誤，是先問哪裡有空", [
        "家庭剛開始安排居服時，常被工作、接送與服務量壓得很急，容易先選「大家都有空」的時段，再把任務塞進去。結果可能是居服到場時長輩狀態穩定，真正需要起身、備餐或如廁協助的空窗仍由家人獨自承擔。",
        "較好的起點是先看本人一天怎麼生活：幾點醒來、何時最有精神、哪些事想自己做、哪些步驟容易卡住、家人何時不在。服務是補上生活缺口，不是把長輩重新排成方便管理的班表。"
      ]],
      ["先畫一天：把人、任務與狀態放到同一條時間線", [
        "用一張紙分成清晨、上午、中午、下午、傍晚與夜間，記下起床、穿衣、用餐、如廁、服藥提醒、活動與休息等固定節點。每一格再標示長輩能獨立、需要提示、需要部分協助或需要較多支持。",
        "同時寫出誰原本在場，以及那位家人是否真的能穩定接手。偶爾幫忙不等於可長期承擔；遠端電話提醒也不能替代需要實際在場的安全協助。這張圖的目的不是精算每分鐘，而是看見空窗。"
      ]],
      ["用三個問題排序：後果、替代與時間彈性", [
        "第一，沒有協助會發生什麼？例如安全起身、如廁或必要餐食，後果通常比整理非急迫物品更直接。第二，有沒有可靠替代者？若家人上班、同住者也需要照顧，這段空窗更值得優先。第三，任務能否前後移動？",
        "還要加入本人在意的目標。對某位長輩來說，自己選衣服後有人協助完成早晨準備，比把所有事快速代做更重要；對另一位長輩，能在傍晚安全吃完一餐可能才是最需要被守住的節點。"
      ]],
      ["分清固定任務與彈性任務，時段才不會被瑣事吃掉", [
        "固定任務通常和身體節律、安全或外部安排相連，例如起床、用餐、就醫前準備。彈性任務則可以在當日狀態允許時調整。若兩者沒有先分開，服務很容易在例行家務中用完，留下真正需要協助的時段。",
        "安排時也要考慮人員連續性。研究在居家健康照護中觀察到，照護連續性與結果可能相關；對家庭而言，熟悉長輩平常速度、表達方式與基線的人，也更容易察覺「今天不太一樣」。這不是保證固定同一人，而是把交班成本納入決策。"
      ]],
      ["先試兩週：不要只問有沒有完成，要看生活是否更穩", [
        "初步時段可設定短期試行，固定記三件事：服務前最卡的是什麼、服務中實際需要多少協助、服務後長輩與家人是否更能接續下一段生活。若服務完成很多項目，家屬晚上仍持續崩潰，代表空窗可能找錯。",
        "風險預測研究提醒，居家照護對象的未計畫就醫風險來自多種健康與功能因素，不能只用單一表現判斷。家庭紀錄的作用是提供趨勢與情境，協助照管、督導或醫療專業重新評估，不是自行算出診斷。"
      ]],
      ["把調整接回正式照顧計畫，而不是私下無限加任務", [
        "現行長照給付辦法要求依照顧問題、服務對象與家庭照顧者實際需求擬訂照顧計畫，居家照顧是照顧及專業服務的一部分。當需求改變，應和照管中心、社區整合型服務中心或特約單位討論可行調整。",
        "如果家庭期待與核定內容不同，先把差異說清楚：哪一段發生風險、誰無法接手、哪個任務不能延後，以及長輩本人希望保留什麼。具體的生活證據，比一句「想多一點服務」更能幫助共同決策。"
      ]]
    ],
    inlineImages: [
      { afterSection: 1, src: "assets/health3/daily/2026-09-02/homecare-morning-window.jpg", alt: "穿鮮橘色制服的台灣居服員準備早餐，長輩坐在床邊自行從兩件上衣中選擇", caption: "服務安排得準，能在需要的節點提供支持，同時保留長輩自己選擇與完成的部分。" },
      { afterSection: 3, src: "assets/health3/daily/2026-09-02/homecare-priority-map-chart.svg", alt: "居服時段依後果、替代人力、時間彈性與本人目標判斷優先順序的流程圖", caption: "不是所有任務都同樣急；把四個判斷放在一起，才看得到真正的照顧空窗。" },
      { afterSection: 4, src: "assets/health3/daily/2026-09-02/homecare-evening-handover.jpg", alt: "傍晚穿鮮橘色制服的台灣居服員在住家門口向兒子交班，長輩坐在窗邊一起參與", caption: "服務結束時留下下一段生活需要注意的事，家庭才不會重新從零猜測。" }
    ],
    checklists: [{
      title: "第一次討論居服時段前先準備",
      items: ["長輩一天真實作息與本人希望保留的事情。", "需要提示、部分協助與較多支持的任務。", "家人實際不在或無法穩定接手的時段。", "不能延後且沒協助可能有明顯後果的節點。", "最近疾病、跌倒、食量、睡眠或功能變化。", "願意先試行多久，以及何時回顧是否調整。"]
    }],
    tables: [{
      title: "哪一種空窗通常更值得優先討論",
      headers: ["空窗特徵", "可能的優先度", "討論時要補充"],
      rows: [
        ["後果明顯、沒替代者、時間固定", "較高", "具體風險與過去發生情形"],
        ["本人重視、少量支持即可完成", "中高", "本人目標與需要的提示程度"],
        ["可前後移動、家人可穩定接手", "可彈性安排", "家庭班表是否真的長期可行"],
        ["只是習慣塞入、與照顧目標無關", "先重新確認", "是否排擠更重要的服務任務"]
      ]
    }],
    faq: [
      { question: "居服一定要每天同一時間嗎？", answer: "不一定，要看核定計畫、服務需求與單位安排。對時間敏感的任務可優先討論固定窗口；可彈性任務則保留調整空間。" },
      { question: "家人白天在家，就不需要居服嗎？", answer: "不能只看有沒有人在。要看同住者是否能安全、穩定承擔，也要考慮其健康、工作與休息；實際需求仍由正式評估與照顧計畫決定。" },
      { question: "排好後發現不合適，可以改嗎？", answer: "可以提出調整討論。先記錄哪個時段仍有空窗、服務後生活是否較穩，以及需求為何改變，再聯絡照管或服務單位依程序評估。" }
    ],
    cta: "如果居服已經排進生活，家人卻仍在最辛苦的時段獨自撐著，歲悅居家照顧可陪你重新梳理一天的空窗、本人目標與可行服務安排。",
    relatedSlugs: ["home-care-video-guide", "longterm-care-apply-checklist-2026", "family-meeting-care-plan"],
    references: [refs.whoIcope, refs.homeContinuity, refs.homeRiskVisits, refs.transitionsTools, refs.longTermCareBenefits]
  }),
  dailyArticle({
    slug: "day-care-shuttle-handover",
    category: "日間照顧",
    relatedService: "日間照顧",
    author: "歲悅日間照顧編輯部",
    title: "第一次搭日照接送車：家屬早晚各做一張交接清單",
    dek: "接送不是把長輩送上車就結束。出門前說清楚今天和平常哪裡不同，回家時問到足以接續晚間生活的資訊，長輩、家屬與日照團隊才不用在轉換時段彼此猜測。",
    excerpt: "日照接送前後用雙向交接清單，確認今日變化、隨身物品、上下車需求與回家後要接續的照顧。",
    image: "assets/health3/daily/2026-09-02/daycare-shuttle-handover-hero.jpg",
    imageAlt: "台灣長輩拿著自己的提袋，在公寓入口與女兒及穿鮮橘色制服的日照人員迎接接送車",
    imageCaption: "第一次接送先讓長輩知道誰會來、要去哪裡，也讓家屬與工作人員把今天的變化說清楚。",
    focalPoint: "center",
    readingMinutes: 9,
    targetAudience: "第一次安排日間照顧接送，或想改善早晚交接的長輩與家屬",
    tags: ["日間照顧", "接送交接", "家屬清單", "生活銜接"],
    keywords: "日照接送車 日間照顧接送 家屬交接 長輩搭車 日照準備 回家交班",
    seoTitle: "第一次搭日照接送車：早晚交接清單｜歲悅長照",
    seoDescription: "長輩第一次搭日照接送車要準備什麼？從出門前變化、隨身物品、上下車需求，到回家後飲食、活動與情緒，整理雙向交接清單。",
    summary: [
      "出發前先向中心確認接送範圍、時間窗口、聯絡方式、陪同與上下車安排，不假設每家服務都相同。",
      "早晨只交接今天和平常不同、且會影響安全或參與的資訊。",
      "回程不只問乖不乖，要問活動、飲食水分、如廁、情緒、異常與下一步。",
      "把長輩放在對話中央；能自己說的先讓本人說，家屬和工作人員再補充。"
    ],
    warning: {
      title: "身體突然不舒服時，先評估，不要勉強搭車",
      body: "若出現胸痛、呼吸困難、意識改變、單側無力、持續嘔吐、明顯發燒不適或跌倒後異常，先聯絡醫療協助與日照中心，不為了趕車延後處理。",
      items: ["藥物應依中心事先確認的接收與管理程序交付，不放置無標示散裝藥物，也不臨時口頭改劑量。", "政府長照給付中的交通接送服務有法定用途；日照中心接送是否提供、範圍與費用應向實際單位確認，兩者不要混為一談。"]
    },
    content: [
      ["接送是一天裡的轉換，不只是交通", [
        "對第一次去日照的長輩，真正陌生的可能不只中心，還包括提早準備、在門口等待、和不熟悉的人上車，以及傍晚再回到家。家屬若只關注有沒有準時，容易漏掉長輩在轉換前後的疲勞、焦慮與需要協助的步驟。",
        "成人日間服務研究顯示，它可能為家庭照顧者帶來不同於非服務日的壓力與情緒經驗，但效果會受個人、服務內容與使用情境影響。接送交接的目標不是保證適應，而是減少資訊中斷，讓每一天更可預期。"
      ]],
      ["第一次搭車前，先把單位規則問成具體情境", [
        "請直接確認接送區域、預估時間窗口、車輛到達前如何通知、家屬要在哪裡等、是否需要陪到上車，以及雨天或電梯故障怎麼處理。若長輩使用助行器、輪椅或需要較多上下車協助，也要事前讓中心評估。",
        "不要假設「有接送」就包含進屋協助、固定同一座位、臨時改地址或無限等待。把不能提供的部分一起問清楚，家庭才能安排可靠的銜接人，而不是讓長輩獨自在門口等。"
      ]],
      ["早晨交接只說今天不同的事，資訊才容易被使用", [
        "可先請長輩自己說今天睡得如何、想帶什麼、身體哪裡不舒服。家屬再補充會影響當日安全或活動的變化，例如昨晚睡眠、食量、排便、情緒、跌倒、疼痛、步行狀態與已依程序處理的用藥資訊。",
        "隨身物品以中心確認的清單為準，常見可能包括眼鏡、助聽設備、輔具、替換用品與有辨識方式的提袋。不要把貴重物品或不確定用途的藥品臨時塞入包內；每件物品都應知道誰接收、回程如何點交。"
      ]],
      ["等待與上下車時，保留長輩可預期的節奏", [
        "選擇有遮蔽、照明與穩固等候位置，不讓長輩在車道邊久站。車到後先確認工作人員與車輛，再依指示移動；不催促、不從手臂硬拉，也不在車輛尚未停妥時靠近。",
        "若長輩因失智、聽力或視力變化對車輛感到不安，使用固定短句說明「現在要去哪裡、誰會陪、何時回家」，並保留熟悉物件。可及性的系統性回顧提醒，交通、資訊、文化與服務設計都可能成為社區照顧的門檻，不能把不願上車只解釋成不配合。"
      ]],
      ["下午交接不要只問今天乖不乖", [
        "回家時先讓長輩說一件今天記得或喜歡的事，再由工作人員補充：活動參與、餐食與水分、如廁、午休、情緒與行動是否和平常不同，有沒有異常處置，以及晚間需不需要持續觀察。",
        "交接不用變成長報告，但要能支撐下一段生活。例如今天午餐吃得少，家屬可知道晚餐如何觀察；下午活動量較大，回家後就不急著再排很多任務。若有事件，則依正式管道說明與追蹤，不在門口匆忙帶過。"
      ]],
      ["看三到五天的模式，不用一天就判定適不適合", [
        "第一天特別累、沉默或興奮，不一定代表日照不合適。連續記錄出門前狀態、上下車反應、回家後食慾、睡眠與情緒，再和中心交換觀察，較能分辨是新環境適應、行程負荷、接送安排，還是需要專業評估的變化。",
        "現行長照給付辦法把日間照顧列為照顧及專業服務；另列的交通接送給付用途限定於就醫、復健或透析。日照接送車屬實際服務單位的安排，是否提供、涵蓋範圍與收費都應逐一確認。政策與規定查核日為 2026-09-03。"
      ]]
    ],
    inlineImages: [
      { afterSection: 1, src: "assets/health3/daily/2026-09-02/daycare-morning-prep.jpg", alt: "台灣長輩在家中自行把水瓶和眼鏡盒放入提袋，女兒在旁詢問", caption: "行前清單不是替長輩包辦；能自己確認與收拾的部分，先讓本人完成。" },
      { afterSection: 3, src: "assets/health3/daily/2026-09-02/daycare-shuttle-handover-chart.svg", alt: "日照接送從出門前確認、早晨交接、安全候車到下午交接與回家觀察的雙向流程圖", caption: "早晨把今天的變化送出去，下午把足以接續晚間生活的資訊帶回來。" },
      { afterSection: 4, src: "assets/health3/daily/2026-09-02/daycare-afternoon-handover.jpg", alt: "穿鮮橘色制服的台灣日照人員、長輩與女兒在中心入口一起進行下午交接", caption: "先問長輩今天的感受，再由工作人員補上飲食、活動、情緒與需要追蹤的事。" }
    ],
    checklists: [{
      title: "第一次日照接送的早晚清單",
      items: ["已確認接送時間窗口、等候位置與聯絡方式。", "輔具、上下車協助與隨身物品已事前告知。", "早晨只交接今天和平常不同且影響安全的資訊。", "藥物與特殊照顧依中心正式程序，不臨時口頭更改。", "下午問到活動、飲食水分、如廁、情緒與異常。", "連續記錄回家後食慾、精神、睡眠與隔日反應。"]
    }],
    tables: [{
      title: "早晚交接各自要回答什麼",
      headers: ["時間", "核心問題", "避免變成"],
      rows: [
        ["出門前", "今天和平常哪裡不同", "重複整份病史"],
        ["上車前", "人、車、物品與協助方式是否確認", "在車道邊臨時協調"],
        ["回家時", "今天發生什麼、晚間要接續什麼", "只問乖不乖或開不開心"],
        ["晚上", "食慾、精神、情緒與睡眠是否回到基線", "一次反應就下結論"]
      ]
    }],
    faq: [
      { question: "日照接送車就是政府的交通接送服務嗎？", answer: "不一定。現行給付辦法另列的交通接送服務有特定用途；日照中心接送屬各單位實際安排，請直接確認服務範圍、費用與條件。" },
      { question: "長輩第一天回家很累，要立刻停掉嗎？", answer: "先看是否有急症警訊，再記錄休息後與隔天狀態。初次環境與活動可能增加負荷；可和中心調整活動、接送或使用頻率，不必只用一天決定。" },
      { question: "每天都要向工作人員講完整病史嗎？", answer: "不用。完整資料應在正式收案與照顧計畫中建立；每日交接聚焦今天新增或改變、且會影響安全與參與的資訊。" }
    ],
    cta: "如果家人想使用日照，卻對接送、行前準備與回家後怎麼接續感到不安，歲悅日間照顧可陪你把第一週的早晚交接方式先整理清楚。",
    relatedSlugs: ["daycare-first-week", "day-care-transition", "day-care-video-guide"],
    references: [refs.dementiaDayCarePosition, refs.communityCareAccess, refs.caregiverDailyLife, refs.adultDayAffect, refs.adultDayStress, refs.longTermCareBenefits]
  })
];
