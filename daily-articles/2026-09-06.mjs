const refs = {
  migrantCaregiverReview: {
    citation: "Lee CS, Tan JSY, Goh SY, et al. Experiences of live-in migrant caregivers providing long-term care for older adults at home: A qualitative systematic review and meta-ethnography. Int J Nurs Stud. 2025;164:105019.",
    url: "https://pubmed.ncbi.nlm.nih.gov/39965464/",
    pmid: "39965464",
    doi: "10.1016/j.ijnurstu.2025.105019",
    evidenceRank: 1
  },
  dementiaCommunicationReview: {
    citation: "Nguyen H, Terry D, Phan H, Vickers J, McInerney F. Communication training and its effects on carer and care-receiver outcomes in dementia settings: A systematic review. J Clin Nurs. 2019;28(7-8):1050-1069.",
    url: "https://pubmed.ncbi.nlm.nih.gov/30357952/",
    pmid: "30357952",
    doi: "10.1111/jocn.14697",
    evidenceRank: 1
  },
  homeMedicationReview: {
    citation: "Parand A, Garfield S, Vincent C, Franklin BD. Carers' Medication Administration Errors in the Domiciliary Setting: A Systematic Review. PLoS One. 2016;11(12):e0167204.",
    url: "https://pubmed.ncbi.nlm.nih.gov/27907072/",
    pmid: "27907072",
    doi: "10.1371/journal.pone.0167204",
    evidenceRank: 1
  },
  migrantTrainingRule: {
    citation: "勞動部勞動力發展署。外國人從事家庭看護工作補充訓練辦法；資料查核日：2026-09-06。",
    url: "https://ws.wda.gov.tw/Download.ashx?n=My7lpJblnIvkurrlvp7kuovlrrbluq3nnIvorbflt6XkvZzoo5zlhYXoqJPnt7Tovqbms5UucGRm&u=LzAwMS9VcGxvYWQvMzA4L3JlbGZpbGUvOTE0OS8xODc0MjUvMjEyOGNkZWItMWFiNy00ZDFjLWJjZTItY2M1NTM0NjNjMDk5LnBkZg%3D%3D",
    evidenceRank: 1
  },
  migrantTrainingCurriculum: {
    citation: "勞動部勞動力發展署。外籍家庭看護工補充訓練課程內容；資料查核日：2026-09-06。",
    url: "https://ws.wda.gov.tw/Download.ashx?n=6ZmE5Lu25LiJIOiqsueoi%2BWFp%2BWuuS5wZGY%3D&u=LzAwMS9VcGxvYWQvMzEwL3JlbGZpbGUvOTMwMC8xMDYxMDcvOTUwN2FmOGQtN2Y2MC00MWMzLWJlNDEtYTg4NzVjM2M4NzE3LnBkZg%3D%3D",
    evidenceRank: 1
  },
  auditFeedbackReview: {
    citation: "Ivers N, Jamtvedt G, Flottorp S, et al. Audit and feedback: effects on professional practice and healthcare outcomes. Cochrane Database Syst Rev. 2012;2012(6):CD000259.",
    url: "https://pubmed.ncbi.nlm.nih.gov/22696318/",
    pmid: "22696318",
    doi: "10.1002/14651858.CD000259.pub3",
    evidenceRank: 1
  },
  simulationReviewOfReviews: {
    citation: "Astbury J, Ferguson J, Silverthorne J, Willis S, Schafheutle E. High-fidelity simulation-based education in pre-registration healthcare programmes: a systematic review of reviews to inform collaborative and interprofessional best practice. J Interprof Care. 2021;35(4):622-632.",
    url: "https://pubmed.ncbi.nlm.nih.gov/32530344/",
    pmid: "32530344",
    doi: "10.1080/13561820.2020.1762551",
    evidenceRank: 1
  },
  agedCareSimulationReview: {
    citation: "Keane JM, Franklin NF, Vaughan B. Simulation to educate healthcare providers working within residential age care settings: A scoping review. Nurse Educ Today. 2020;85:104228.",
    url: "https://pubmed.ncbi.nlm.nih.gov/31765870/",
    pmid: "31765870",
    doi: "10.1016/j.nedt.2019.104228",
    evidenceRank: 1
  },
  cdcTrainingQuality: {
    citation: "U.S. Centers for Disease Control and Prevention. Quality Training Standards. Updated 2025-02-24; 資料查核日：2026-09-06。",
    url: "https://www.cdc.gov/training-development/php/qts/index.html",
    evidenceRank: 1
  },
  taiwanLtcTraining: {
    citation: "衛生福利部。長期照顧服務人員訓練認證繼續教育及登錄辦法（115 年修正）；資料查核日：2026-09-06。",
    url: "https://www.mohw.gov.tw/dl-99538-1ecc52ad-1be0-4907-8412-fac1ec322220.html",
    evidenceRank: 1
  },
  documentationTimeReview: {
    citation: "Baumann LA, Baker J, Elshaug AG. The impact of electronic health record systems on clinical documentation times: A systematic review. Health Policy. 2018;122(8):827-836.",
    url: "https://pubmed.ncbi.nlm.nih.gov/29895467/",
    pmid: "29895467",
    doi: "10.1016/j.healthpol.2018.05.014",
    evidenceRank: 1
  },
  documentationBurdenReview: {
    citation: "Murad MH, Vaa Stelling BE, West CP, et al. Measuring Documentation Burden in Healthcare. J Gen Intern Med. 2024;39(14):2837-2848.",
    url: "https://pubmed.ncbi.nlm.nih.gov/39073484/",
    pmid: "39073484",
    doi: "10.1007/s11606-024-08956-8",
    evidenceRank: 1
  },
  ehrWellbeingReview: {
    citation: "Nguyen OT, Jenkins NJ, Khanna N, et al. A systematic review of contributing factors of and solutions to electronic health record-related impacts on physician well-being. J Am Med Inform Assoc. 2021;28(5):974-984.",
    url: "https://pubmed.ncbi.nlm.nih.gov/33517382/",
    pmid: "33517382",
    doi: "10.1093/jamia/ocaa339",
    evidenceRank: 1
  },
  nistHealthUi: {
    citation: "Wiklund ME, Kendler J, Hochberg L, Weinger MB. Technical Basis for User Interface Design of Health IT. NIST GCR 15-996. 2015.",
    url: "https://nvlpubs.nist.gov/nistpubs/gcr/2015/NIST.GCR.15-996.pdf",
    doi: "10.6028/NIST.GCR.15-996",
    evidenceRank: 1
  },
  saferHealthIt: {
    citation: "Assistant Secretary for Technology Policy. Using Health IT: SAFER Guides; 資料查核日：2026-09-06。",
    url: "https://healthit.gov/clinical-quality-and-safety/safer-guides/using-health-it/",
    evidenceRank: 1
  },
  privacyAct: {
    citation: "法務部全國法規資料庫。個人資料保護法；資料查核日：2026-09-06。",
    url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021",
    evidenceRank: 1
  }
};

function dailyArticle(article) {
  return {
    date: "2026.09.06",
    publishedAt: "2026-09-06T00:00:00+08:00",
    authorTitle: "歲悅長照營業項目知識整理",
    ctaText: "留下需求討論",
    ctaUrl: "/contact",
    contentRevision: "2026-09-06-daily-business-v1",
    ...article
  };
}

export const dailyArticles20260906 = [
  dailyArticle({
    slug: "migrant-care-plan-change-handover",
    category: "移工培訓",
    relatedService: "移工培訓",
    author: "歲悅移工培訓編輯部",
    title: "照顧方式改了別只說一次：家屬與移工的四步更新清單",
    dek: "回診、出院或專業訪視後，照顧方法可能改變。家屬以為已經說過，移工卻可能同時收到舊紙條、口頭提醒與不同家人的版本。用確認來源、拆成動作、一起做回、只留一版四步，把變更變成能共同執行的照顧。",
    excerpt: "照顧方式變更後，用確認來源、拆成動作、一起做回、只留一版四步，讓家屬與移工不再各照不同版本。",
    image: "assets/health3/daily/2026-09-06/migrant-care-change-hero.jpg",
    imageAlt: "台灣長輩在家中主動指向四張彩色照顧更新卡，兒子、外籍家庭看護工與穿鮮橘色制服的訓練講師同高度聆聽",
    imageCaption: "照顧更新不是家屬單向交代；長輩、家屬、移工與專業人員要看同一個版本。",
    focalPoint: "center",
    readingMinutes: 10,
    targetAudience: "家中聘有外籍家庭看護工，近期因回診、出院或專業建議而需要更新照顧方式的家庭",
    tags: ["移工培訓", "家庭照顧", "照顧變更", "共同交接"],
    keywords: "外籍看護 照顧方式 變更 交接 家屬 移工培訓 照顧計畫",
    seoTitle: "照顧方式變更怎麼教移工？四步清單｜歲悅長照",
    seoDescription: "回診或出院後，用確認來源、拆成動作、一起做回、只留一版四步，讓家屬與外籍看護共同更新照顧方式。",
    summary: [
      "先確認變更來自哪位專業人員、適用哪個情境與何時開始，不用家人記憶改寫醫療指示。",
      "把抽象要求拆成看得到的動作、停止條件與求助入口，一次只處理一項重要變更。",
      "請移工在安全情境中說回或做回，檢查說明是否清楚，不把沒聽懂歸咎於態度。",
      "家中只保留一份有日期的現行版本，舊紙條明確收起；換班與隔天再短短回看一次。"
    ],
    warning: {
      title: "藥物、飲食質地與高風險技巧變更，必須回到專業指示",
      body: "不要自行改藥名、劑量、時間、停藥，或因網路影片改變吞嚥飲食質地、移位方式與管路照護。若長輩出現意識改變、單側無力、胸痛、呼吸困難、反覆嗆咳伴呼吸異常、跌倒受傷或其他急症警訊，應立即依醫療與緊急流程處理。",
      items: ["看不懂或版本互相矛盾時先停下來確認，不用猜。", "外籍家庭看護工的法定補充訓練與課程有官方規範；本文是家庭交接方法，不取代正式訓練或專業實作驗收。"]
    },
    content: [
      ["最容易出錯的不是沒教，而是家裡同時存在三個版本", [
        "回診後女兒在訊息裡說一套，兒子晚餐時又補一句，冰箱還貼著出院前的紙條。移工可能每一句都想做到，卻不知道哪一個最新、哪一個只適用特定時段。照顧變更因此不是再提醒一次，而是要完成版本更新。",
        "居家移工照顧經驗的質性系統性回顧指出，照顧關係同時受到權力、工作條件、文化、溝通與能力發展影響；研究呼籲提供有結構、可理解且符合情境的訓練，也要讓移工能表達需要。把更新做成共同確認，比用命令測試服從更安全。"
      ]],
      ["第一步確認來源：先回答誰改、改什麼、何時開始", [
        "把最新版醫囑、出院摘要、治療或護理建議集中，由一位家屬和原專業窗口確認。每一項變更寫清楚適用情境與開始日期；若文件互相矛盾、看不懂縮寫或家人記憶不同，先聯絡原提供者，不要請移工自行選一個。",
        "尤其是用藥，居家照顧者給藥錯誤的系統性回顧發現，說明可理解度、照顧者間溝通、藥物數量與環境等都可能影響錯誤。家庭更新的重點是把專業指示傳準，不是自行重新開立一套做法。"
      ]],
      ["第二步拆成動作：一次只改一件最影響安全的事", [
        "把「注意安全」「多鼓勵」改成看得到的行動，例如先等長輩自己握住杯子，再把杯子移近；或用餐出現指定警訊就停止並聯絡。每一張更新卡只放開始、動作、停止與求助，不塞進整本照顧知識。",
        "語言可用移工最熟悉的語言、清楚圖片與現場物品搭配，但翻譯不能替代專業核對。失智照顧溝通訓練的系統性回顧顯示，訓練對照顧者溝通技能與知識可能有幫助，但設計與結果不一；家庭仍要看本人是否真的理解和做得到。"
      ]],
      ["第三步一起做回：不是考移工，而是驗收說明", [
        "先由家屬或專業人員示範一小段，再請移工用自己的話說下一步，或在安全、低風險情境做一次。問「我剛才哪裡說得不清楚」比問「懂了嗎」更容易看見缺口；若做法不同，先回到原指示與物品位置，不用當眾責備。",
        "高風險技巧不能只靠家屬看影片後互教。需要身體操作、輔具、吞嚥或醫療判斷時，應安排合格專業人員觀察與回饋。勞動部勞動力發展署的補充訓練辦法與課程內容提供正式架構，家庭自製清單只能承接個案日常。"
      ]],
      ["第四步只留一版：舊紙條要明確退出使用", [
        "把現行版本放在約定位置，標示日期與確認人；舊版不是悄悄疊在下面，而是收進寫有作廢日期的封套或依規定銷毀。家庭群組若也傳送，固定由同一位窗口發最新版，其他家人不要另開平行指令。",
        "變更若涉及個人健康資料，不要在公開群組轉傳或留下不必要照片。只記執行需要的最低資訊，使用家庭已同意且可控的保存方式；外部翻譯或工具若會留存資料，先確認隱私與使用範圍。"
      ]],
      ["隔天再回看：看長輩反應，也讓移工說哪裡做不到", [
        "第一次做回通過，不代表放進忙碌早晨也同樣順利。隔天固定問四件事：長輩反應如何、哪一步容易忘、物品是否放對位置、遇到變化知道找誰。若本人不舒服或照顧負荷增加，就回到專業窗口調整，不要求移工硬撐。",
        "回看也要問工作時間、休息與語言支持是否可行。照顧品質不應建立在不敢提問或沒有休息上。把「我需要再示範一次」視為可接受答案，家庭才會在問題變成傷害前收到訊號。"
      ]]
    ],
    inlineImages: [
      { afterSection: 1, src: "assets/health3/daily/2026-09-06/migrant-care-current-version.jpg", alt: "台灣女兒與外籍家庭看護工並肩整理彩色照顧圖卡，把一張舊卡放入封套，台灣長輩在旁共同查看", caption: "更新不只是加一張新紙；要明確收起舊版，讓全家只看同一套現行做法。" },
      { afterSection: 3, src: "assets/health3/daily/2026-09-06/migrant-care-change-four-step-chart.svg", alt: "家屬與移工更新照顧方式的確認來源、拆成動作、一起做回、只留一版四步流程圖", caption: "四步把專業指示變成家庭可執行的共同版本；遇到矛盾與高風險內容就回頭確認。" },
      { afterSection: 4, src: "assets/health3/daily/2026-09-06/migrant-care-practice-check.jpg", alt: "外籍家庭看護工在餐桌示範擺放空杯與毛巾，台灣長輩指向下一項，家屬與穿鮮橘色制服的講師在旁觀察", caption: "用一段安全的日常任務做回，確認的是說明是否清楚，不是誰比較聰明或聽話。" }
    ],
    checklists: [{
      title: "照顧方式變更當天六項核對",
      items: ["確認最新版來源、適用情境、開始日期與專業聯絡人。", "一次先選一項最影響安全或日常的變更。", "把抽象要求拆成開始、動作、停止與求助。", "提供移工看得懂的語言、圖像與現場示範。", "請對方安全說回或做回，修正的是說明而不是貼標籤。", "只留一份有日期的現行版本，隔天再回看一次。"]
    }],
    tables: [{
      title: "常見變更如何避免各說各話",
      headers: ["情境", "不要只說", "共同版本要補上"],
      rows: [["回診後作息改變", "醫師說要調整", "哪一段、何時開始、誰確認、何時回看"], ["照顧動作更新", "以後換一個方法", "示範、做回、停止條件與專業窗口"], ["語言沒對上", "我講很多次了", "換熟悉語言、實物或圖片，請對方說回"], ["家人意見不同", "你自己看著辦", "指定單一窗口，先釐清最新版再執行"]]
    }],
    faq: [
      { question: "用翻譯軟體把整份醫囑翻完就可以嗎？", answer: "不建議直接把機密文件交給未確認的工具，也不能假設翻譯等於理解。先由專業人員確認重點，再用安全方式翻譯成動作，並透過說回或做回核對。" },
      { question: "移工做回時和示範不一樣，是不是要全部重教？", answer: "先找出差異發生在哪一步、是否影響安全，以及原指示是否清楚。一次修正一個關鍵點；高風險技巧由合格專業人員重新示範與驗收。" },
      { question: "家裡可以用手機拍影片當教材嗎？", answer: "要先考量長輩與移工的同意、個資、保存位置、誰能看與何時刪除。多數低風險流程可先用不含人臉與個資的步驟圖；需要動作判斷時由專業人員安排。" }
    ],
    cta: "如果家中照顧方式剛改變，歲悅移工培訓可陪家屬把專業指示整理成看得懂、做得回、只有一個現行版本的家庭照顧流程。",
    relatedSlugs: ["migrant-care-training-teach-back", "migrant-care-handover", "master-talk-careworker-training"],
    references: [refs.migrantCaregiverReview, refs.dementiaCommunicationReview, refs.homeMedicationReview, refs.migrantTrainingRule, refs.migrantTrainingCurriculum]
  }),
  dailyArticle({
    slug: "long-term-care-training-feedback-note",
    category: "教育品管",
    relatedService: "教育品管",
    author: "歲悅教育品管編輯部",
    title: "帶課後只寫「反應良好」不夠：講師的四欄觀課回饋",
    dek: "學員點頭、氣氛熱絡，不代表關鍵動作已經學會。講師若只留下「互動佳」，下一次課程仍不知道哪裡要保留、哪裡要重教。用目標、看到的行為、學員解釋與下一步四欄，把觀課變成能改善教學的證據。",
    excerpt: "觀課紀錄用目標、行為、學員解釋與下一步四欄，取代反應良好等模糊評語，讓下次教學真的改得動。",
    image: "assets/health3/daily/2026-09-06/quality-training-feedback-hero.jpg",
    imageAlt: "穿鮮橘色制服的長照講師手持四欄空白觀察表，看兩位同樣穿橘色制服的學員與台灣長輩進行尊重的溝通練習",
    imageCaption: "觀課先看目標行為是否出現，再問學員怎麼判斷，不以氣氛熱絡代替學習證據。",
    focalPoint: "center",
    readingMinutes: 10,
    targetAudience: "設計或帶領長照新人訓練、在職教育、情境演練與實作課程的講師、督導與品管人員",
    tags: ["教育品管", "觀課回饋", "講師工具", "訓練改善"],
    keywords: "長照講師 觀課紀錄 教學回饋 教育品管 實作訓練 督導",
    seoTitle: "長照觀課回饋怎麼寫？講師四欄工具｜歲悅長照",
    seoDescription: "帶課後用目標、看到的行為、學員解釋與下一步四欄留下觀課證據，取代互動佳、反應良好等模糊評語。",
    summary: [
      "每次觀課只選一個可看見的學習目標，避免用整體印象替所有能力下結論。",
      "先記實際說了什麼、做了什麼與發生順序，再談影響，不用個性或態度標籤。",
      "邀學員先解釋自己的判斷，區分不知道、知道但做不到，以及情境本身不合理。",
      "回饋最後只定一個下次可重做的行動、支持與驗收時間，讓改善形成小循環。"
    ],
    warning: {
      title: "高風險技巧不要拿真人當第一次練習對象",
      body: "移位、吞嚥、管路、傷口、藥物與其他高風險照顧內容，應依專業資格、課程規範與安全環境安排示範、模擬與監督。若現場出現急症或安全疑慮，立即停止教學並依流程處理，不為了完成觀課留下影像或要求繼續。",
      items: ["觀課紀錄不取代法定訓練、能力驗證與事件通報。", "若需影像，必須有合法目的、清楚同意、存取與保存規則；可用具體文字時不要先拍人。"]
    },
    content: [
      ["「大家都很投入」是一種感受，不是可重做的教學證據", [
        "一堂課結束後，講師常在紀錄上寫反應良好、互動熱烈、需再加強。這些話沒有錯，但下位講師看不出哪個目標已做到、哪個步驟卡住，也不知道下一次要重複示範、換情境，還是調整教材。",
        "稽核與回饋的 Cochrane 回顧顯示，整體上可能帶來小但重要的專業實務改善，效果會依基準表現、回饋來源、頻率、形式、明確目標與行動計畫而變。觀課因此要從可行動的資訊開始，不把回饋當結業評語。"
      ]],
      ["第一欄寫目標：一次只看一個可觀察行為", [
        "把「提升溝通能力」改成「說明後停下來，讓長輩用自己的方式選一項」，或把「學會交班」改成「能說出和平常不同的事實與下一步」。目標要和課程對象、先備能力與真實工作情境對得上。",
        "CDC 的品質訓練標準要求從需求評估、學習目標、內容、參與、評量到改善形成一致設計。觀課目標若一開始就不可看見，後面再完整的回饋也只能回到印象。"
      ]],
      ["第二欄寫看到的行為：先記事實，不先猜原因", [
        "記下誰在什麼情境說了什麼、做了什麼，以及順序和結果。例如「提供兩個選項後，未等回應又連續問三題」，比「學員太急躁」更能被討論。也要寫出做對的具體片段，讓學員知道要保留哪一步。",
        "模擬教學的系統性回顧彙整強調明確目標、重複練習、互動、回饋與 debrief 等設計元素；高齡照顧模擬的 scoping review 也顯示做法與證據場域多樣。觀察表不需要變成厚重評分量表，但要能支援一次具體重做。"
      ]],
      ["第三欄問學員怎麼想：先分清不知道，還是情境做不到", [
        "回饋前讓學員先說當時看見什麼、想完成什麼、哪裡猶豫。有人知道應該等待，卻因模擬時間太短而急著往下；有人則從未學過如何辨認停止訊號。兩種情況需要的改善完全不同。",
        "講師可以問：「你當時根據哪個線索決定下一步？」再補自己觀察到的事實。這不是要求學員辯解，而是找出知識、判斷、環境和教材之間的斷點；若多人在同一處卡住，先檢查課程設計，不急著把問題歸給個人。"
      ]],
      ["第四欄只留一個下一步：明確到下次可以驗收", [
        "下一步要包含行為、支持與時間，例如下次情境演練時，提供選項後默數一小段再追問，由同儕記下是否做到。不要同時列十個改進點，也不要只寫多練習；學員離開教室後應知道先做哪一件事。",
        "回饋可先肯定具體有效行為，再說明一個關鍵落差、聽學員解釋，最後共同決定重做方式。若能力涉及安全，驗收標準要由具資格者與現行規範設定，不因課程時間到就自動判定通過。"
      ]],
      ["課後把個人回饋與課程改善分開保存", [
        "個人觀課紀錄只讓有權限且需要的人使用，不在公開群組貼帶姓名截圖。課程層級則可彙整去識別化的共通卡點，例如多數人看不懂某張圖、情境時間不足或教材版本混用，再安排教材更新與下次驗證。",
        "台灣長期照顧服務人員訓練、認證、繼續教育及登錄有現行辦法；機構內部觀課表應補足實作品質，而不是自行宣稱取代法定時數或資格。每次改版保留日期、原因與驗證結果，下一位講師才能知道為什麼改。"
      ]]
    ],
    inlineImages: [
      { afterSection: 1, src: "assets/health3/daily/2026-09-06/quality-training-observation.jpg", alt: "穿鮮橘色制服的講師從肩後查看空白四欄觀察表，兩位同樣穿橘色制服的學員讓台灣長輩在杯子與毛巾間選擇", caption: "先記實際行為與順序，不用「太急」「不專心」替學員下結論。" },
      { afterSection: 3, src: "assets/health3/daily/2026-09-06/quality-training-feedback-four-column-chart.svg", alt: "講師觀課回饋的學習目標、看到的行為、學員解釋、下一步四欄圖", caption: "四欄把觀課從印象評語帶到可重做的行動；一次只鎖定一個關鍵目標。" },
      { afterSection: 4, src: "assets/health3/daily/2026-09-06/quality-training-action-huddle.jpg", alt: "四位穿鮮橘色制服的長照人員圍成小圈，一人示範手勢，其他人用空白彩色卡討論下一次練習", caption: "回饋最後要落在一個可驗收的下一步，也讓學員說出需要什麼支持。" }
    ],
    checklists: [{
      title: "講師寫完觀課回饋前六項核對",
      items: ["這次是否只選一個可觀察的學習目標？", "是否先寫實際行為、說法、順序與結果？", "是否同時留下應保留的有效行為？", "是否問過學員當時看見什麼、怎麼判斷？", "下一步是否包含行為、支持、重做情境與驗收時間？", "個人資料與課程層級改善是否分開保存與使用？"]
    }],
    tables: [{
      title: "把模糊評語改成可改善的回饋",
      headers: ["模糊評語", "缺少什麼", "觀課可改寫"],
      rows: [["互動很好", "目標行為", "提供兩個選項後停下，長輩自行指向其中一項"], ["學員太急", "看見的順序", "未等回應又連續問三題，長輩轉開視線"], ["需要加強", "下一個行動", "下次同情境只練等待與一次追問"], ["全員通過", "個別證據與界線", "逐人記錄目標行為、需要支持與需再驗收項目"]]
    }],
    faq: [
      { question: "觀課一定要打分數嗎？", answer: "不一定。若課程已有合格量表就依規範使用；沒有時可先用四欄留下行為證據與下一步，不為了方便比較而自造沒有驗證的總分。" },
      { question: "時間很短，講師可以只挑錯誤講嗎？", answer: "建議至少指出一個應保留的有效行為，再聚焦一個關鍵落差。全部只講錯容易讓學員不知道哪些做法正確，也不利於下次重做。" },
      { question: "多人都在同一步做錯，是學員問題還是教材問題？", answer: "先把它當成課程訊號。檢查目標、示範、時間、材料與情境是否一致，再決定需要補教、改教材或調整驗收，不急著歸責。" }
    ],
    cta: "如果你的長照內訓帶完課仍不知道下一次要改哪裡，歲悅教育品管可陪團隊把觀課、回饋、重做與教材改版接成可追蹤的小循環。",
    relatedSlugs: ["long-term-care-course-quality-check", "long-term-care-incident-learning-review", "careworker-records-supervision-support"],
    references: [refs.auditFeedbackReview, refs.simulationReviewOfReviews, refs.agedCareSimulationReview, refs.cdcTrainingQuality, refs.taiwanLtcTraining]
  }),
  dailyArticle({
    slug: "long-term-care-required-field-check",
    category: "軟體系統",
    relatedService: "軟體系統",
    author: "歲悅軟體系統編輯部",
    title: "系統要新增必填欄位？上線前先過四道流程檢查",
    dek: "每個必填欄位看起來只多幾秒，累積到每次訪視、每位同仁與每個裝置，就可能變成補寫、亂填或卡住急件。先確認決策用途、資料來源、實際流程與隱私權限，再決定必填、選填、自動帶入或乾脆不收。",
    excerpt: "新增必填欄位前，先過決策用途、資料來源、流程負擔、隱私權限四關，避免把管理需要變成前線亂填。",
    image: "assets/health3/daily/2026-09-06/software-required-field-hero.jpg",
    imageAlt: "三位穿鮮橘色制服的台灣長照營運人員在桌上查看無文字的彩色流程圖，一線人員指向中間卡點，筆電與平板皆未顯示畫面",
    imageCaption: "先把欄位放回完整流程，看誰填、誰用、卡在哪裡，再談要不要做成必填。",
    focalPoint: "center",
    readingMinutes: 11,
    targetAudience: "規劃長照表單、後台、照顧紀錄、稽核欄位與系統改版的主管、產品負責人、行政與資訊團隊",
    tags: ["軟體系統", "必填欄位", "流程設計", "紀錄負擔"],
    keywords: "長照系統 必填欄位 表單設計 紀錄負擔 資料品質 權限 個資",
    seoTitle: "長照系統必填欄位怎麼決定？四關檢查｜歲悅長照",
    seoDescription: "長照表單新增必填欄位前，檢查決策用途、資料來源、流程負擔與隱私權限，再選必填、選填、自動帶入或不收。",
    summary: [
      "先寫清楚哪個角色會用這個欄位做什麼決策；說不出行動，就不該直接設為必填。",
      "確認資料能在當下正確取得，提供不知道、不適用與稍後補登等誠實狀態，不逼人猜。",
      "實地走一次桌機、手機、離線、交班與修正流程，量的不是單欄秒數，而是重複與中斷。",
      "依目的最小化蒐集、設定角色權限與保存期限，先小範圍試行，保留停用與回滾路徑。"
    ],
    warning: {
      title: "必填欄位不能阻擋急症處置與必要照顧",
      body: "當現場需要緊急醫療、立即通報或先確保人身安全時，系統應有合法且受控的急件路徑，讓必要處置先發生、紀錄再依規範補齊。不要為了資料完整要求第一線在危急現場停下來填表，也不能用共用帳號繞過權限。",
      items: ["本文是產品與流程決策框架，不取代個資、醫療、長照與機構法遵審查。", "涉及敏感資料、法定紀錄或跨系統交換時，應由資料負責人、法遵與實際使用者共同確認。"]
    },
    content: [
      ["必填看起來能補洞，也可能把洞推到更隱蔽的地方", [
        "主管發現報表常缺資料，最快的做法是把欄位改成必填。可是當第一線不知道答案、手機訊號差、同一資料要填三次，系統只會得到隨便選、複製舊值或先填一個才能送出的假完整。資料表漂亮了，決策反而更危險。",
        "電子健康紀錄文件時間的系統性回顧發現，導入後醫師、護理師與實習人員的紀錄時間可能增加；2024 年文件負擔回顧也整理出時間、碎片化流程、下班後工作、易用性等多個面向。雖然研究場域不等同台灣長照，仍提醒我們不能只估一個欄位點幾下。"
      ]],
      ["第一關問決策用途：誰會在什麼時候用它做什麼", [
        "先寫一個完整句子：「當出現什麼條件，由哪個角色看這個欄位，採取哪個行動。」若答案只是方便統計、主管想看看，就再確認能否從既有資料推導、抽樣收集或放在事後分析，不要直接塞進每次服務流程。",
        "同一欄位若同時拿來照顧決策、請款、品管與研究，要拆清楚各目的、定義與更新責任。不同用途需要的即時性和精確度不同；為報表設計的分類，不一定適合在現場成為阻擋送出的硬門檻。"
      ]],
      ["第二關問資料來源：填的人當下真的知道嗎", [
        "確認資料由誰產生、何時才知道、能否驗證，以及變更後誰更新。能從登入者、服務單、時間戳或既有主檔可靠帶入的，就不要讓人重填；不能確定時，應有不知道、不適用、待確認等誠實狀態，並清楚指定後續責任。",
        "NIST 的健康資訊介面技術基礎強調以使用情境與人因降低錯誤；SAFER Guides 也把安全使用健康資訊科技放在組織流程中看。必填不是資料品質保證，欄位定義、選項、來源與修正路徑同樣重要。"
      ]],
      ["第三關走實際流程：桌機可用，不代表訪視手機也可用", [
        "找實際使用者在接近真實的班次走一遍：登入、搜尋個案、填寫、暫存、送出、交班、主管退回與更正。記下同一資料填了幾次、被什麼中斷、手套或單手操作是否困難、網路中斷後資料會不會消失。",
        "EHR 與工作者福祉的系統性回顧把總使用時間、下班後使用、支援、易用性與文件負擔列為可介入因素，並建議讓第一線參與規劃。長照表單也應讓實際填寫者在上線前指出卡點，而不是完成開發後才被通知。"
      ]],
      ["第四關看隱私與權限：能收不等於每個人都該看", [
        "逐欄確認蒐集目的、必要性、告知、存取角色、保存期限、匯出與刪除規則。自由文字最容易混入多餘病史、家屬電話或主觀評論；能用清楚選項回答時，不要要求寫一段，也要避免把敏感資料複製到通知與群組。",
        "台灣個人資料保護法要求個資蒐集、處理與利用有特定目的與必要範圍。實際法遵需依資料類型與業務確認；產品團隊至少要做到角色最小權限、操作紀錄、離職停權、測試資料隔離，以及不在畫面或匯出中默認暴露。"
      ]],
      ["四關後不只剩必填或不填，還有選填、自動帶入與延後補登", [
        "決策用途明確、當下可知、缺少會立即造成風險，且有例外路徑時，才較適合必填。若只是補充脈絡可做選填；若已有可靠來源就自動帶入並允許受控更正；沒有清楚用途或無法維護，就刪除。不要用紅色星號代替設計判斷。",
        "先選一小組真實使用者試行，訂好觀察指標：送出失敗、待補比例、亂填訊號、平均流程時間、退回原因與使用者回饋。達不到條件就停用或調整，不把已開發完成當成必須全面上線。"
      ]]
    ],
    inlineImages: [
      { afterSection: 1, src: "assets/health3/daily/2026-09-06/software-required-field-workflow.jpg", alt: "兩位穿鮮橘色制服的台灣長照人員在空白格線表單旁，用三個無字彩色圓片盤點重複流程，筆電保持闔上", caption: "觀察整段工作，而不是只問填一格要幾秒；重複、等待與中斷才是負擔來源。" },
      { afterSection: 3, src: "assets/health3/daily/2026-09-06/software-required-field-four-gate-chart.svg", alt: "系統新增必填欄位前的決策用途、資料來源、流程負擔、隱私權限四道檢查圖", caption: "四關都說得清楚，再決定必填、選填、自動帶入或不收；不是所有問題都要加欄位。" },
      { afterSection: 4, src: "assets/health3/daily/2026-09-06/software-required-field-decision.jpg", alt: "四位穿鮮橘色制服的台灣長照營運人員圍桌，把空白卡放入四個不同顏色的無字托盤做欄位決策", caption: "把每個欄位放進合適去向：必填、選填、自動帶入或移除，並留下決策與回看日期。" }
    ],
    checklists: [{
      title: "新增必填欄位前六項核對",
      items: ["寫得出誰在何時用這個欄位採取哪個行動。", "確認填寫者當下能知道，而且有不知道、不適用等誠實狀態。", "檢查是否能從可信主檔或流程自動帶入，避免重複輸入。", "用桌機、手機、離線、暫存、退回與更正走完整流程。", "確認蒐集目的、角色權限、保存、匯出與稽核紀錄。", "先小範圍試行，設定停用、調整與回滾條件。"]
    }],
    tables: [{
      title: "四種欄位去向怎麼選",
      headers: ["去向", "較適合的條件", "仍要保留"],
      rows: [["必填", "缺少會阻斷明確且即時的安全或法定行動", "不知道、不適用、急件與補登路徑"], ["選填", "補充脈絡有用，但當下未必可知", "用途說明與避免敏感自由文字"], ["自動帶入", "已有可信來源與清楚更新責任", "來源、時間與受控更正"], ["不收／移除", "沒有決策用途、重複或無人維護", "刪除影響與既有資料處理規則"]]
    }],
    faq: [
      { question: "法定紀錄是不是全部都要做成即時必填？", answer: "不一定。要依實際法規、時點與業務流程確認。有些內容必須記錄，但仍可有急件、暫存、補登與主管覆核設計；不要自行把法定需要簡化成每欄立即阻擋。" },
      { question: "提供「其他」自由文字就能涵蓋所有情況嗎？", answer: "自由文字可補少見情境，也容易混入敏感資料與難以分析的內容。先提供不知道、不適用與常見選項，只有確實需要時才開放補充，並限制可見範圍。" },
      { question: "欄位上線後沒人抱怨，是否代表負擔很低？", answer: "不代表。使用者可能以複製舊值、亂選、晚間補寫或私下另做表格繞過。要看使用紀錄、待補與退回、流程時間、資料異常和訪談，而不是只等客訴。" }
    ],
    cta: "如果你的表單越改越長、資料仍不可信，歲悅軟體系統可陪團隊沿著決策、來源、流程與權限四關，找出真正該必填、能自動帶入與應該刪掉的欄位。",
    relatedSlugs: ["long-term-care-system-downtime-continuity", "long-term-care-notification-priority-loop", "family-care-report-rhythm"],
    references: [refs.documentationTimeReview, refs.documentationBurdenReview, refs.ehrWellbeingReview, refs.nistHealthUi, refs.saferHealthIt, refs.privacyAct]
  })
];
