const pages = {
  about: {
    eyebrow: "About",
    title: "關於歲悅",
    intro: "歲悅長照以家庭需求為中心，整合照顧人力、專業訓練、品質管理與社區服務，建立可長期運作的照顧系統。",
    focus: ["集團願景與服務理念", "長照服務網絡", "跨專業團隊協作"],
    features: ["照顧不只到點，更要到位", "以制度承接每個家庭的信任", "讓前線服務被看見、被支持、被改善"]
  },
  milestones: {
    eyebrow: "Milestones",
    title: "大記事",
    intro: "整理歲悅長照的發展節點、服務擴張、據點成立與重要合作，讓外部夥伴快速理解集團脈絡。",
    focus: ["年度里程碑", "據點與服務擴張", "重要合作紀錄"],
    features: ["用時間軸呈現成長", "保留品牌與營運記憶", "支援投資人與合作夥伴認識集團"]
  },
  "home-care": {
    eyebrow: "Home Care",
    title: "居家照顧",
    intro: "提供到宅照顧、生活協助、陪伴服務與家屬溝通，協助長輩在熟悉的家中維持安全與尊嚴。",
    focus: ["身體照顧與生活照顧", "家屬回報與服務紀錄", "照顧計畫媒合"],
    features: ["到宅照顧安排", "照顧員培訓與督導", "服務品質追蹤"]
  },
  "day-care": {
    eyebrow: "Day Care",
    title: "日間照顧",
    intro: "以白天托顧、活動設計、餐食、復能與社交支持，降低家庭照顧壓力，也讓長輩保有生活節奏。",
    focus: ["日照中心介紹", "活動與餐食規劃", "接送與照顧流程"],
    features: ["生活作息穩定", "團體活動參與", "家屬壓力緩衝"]
  },
  community: {
    eyebrow: "Community",
    title: "社區據點",
    intro: "把預防照顧、健康促進與鄰里連結放進社區，讓長輩在離家更近的地方得到支持。",
    focus: ["社區活動", "預防延緩失能", "在地資源串聯"],
    features: ["共餐與健康課程", "據點活動報名", "鄰里照顧網絡"]
  },
  nursing: {
    eyebrow: "Nursing Rehab",
    title: "護理復能",
    intro: "結合護理評估、復能目標與健康監測，協助個案恢復生活能力，並降低照顧風險。",
    focus: ["護理專業評估", "復能目標設定", "健康風險追蹤"],
    features: ["個案狀態紀錄", "跨專業合作", "復能進度回饋"]
  },
  "migrant-training": {
    eyebrow: "Training",
    title: "移工培訓",
    intro: "針對家庭照顧移工提供照顧技能、溝通情境、衛教與安全訓練，讓照顧品質更穩定。",
    focus: ["照顧技能訓練", "家庭溝通情境", "安全與衛教"],
    features: ["課程模組化", "實作演練", "家屬共同參與"]
  },
  quality: {
    eyebrow: "Quality",
    title: "教育品管",
    intro: "透過標準化教材、督導制度、服務稽核與持續改善，把前線經驗轉化為可複製的照顧品質。",
    focus: ["教育訓練", "服務稽核", "品質改善"],
    features: ["新人與在職訓練", "督導回饋機制", "照顧紀錄與改善追蹤"]
  },
  talent: {
    eyebrow: "Recruiting",
    title: "人才招募",
    intro: "邀請照顧服務員、督導、護理與營運夥伴加入，成為能支持家庭、也能持續成長的長照專業者。",
    focus: ["照服員與專業人員", "督導與營運職缺", "訓練與升遷制度"],
    features: ["清楚的職涯路徑", "穩定訓練支持", "友善團隊文化"]
  },
  land: {
    eyebrow: "Partnership",
    title: "土地招募",
    intro: "尋找適合日照、社區據點與複合式長照服務的土地或空間，一起打造在地照顧基礎建設。",
    focus: ["基地條件", "合作模式", "區域需求評估"],
    features: ["空間可行性評估", "服務半徑分析", "長照場域規劃"]
  },
  "investor-recruiting": {
    eyebrow: "Investment",
    title: "投資人招募",
    intro: "面向看好長照產業與在地服務網絡的投資夥伴，說明集團策略、展店模型與合作機會。",
    focus: ["投資亮點", "展店模型", "合作洽談"],
    features: ["產業趨勢說明", "營運模式摘要", "合作流程安排"]
  },
  health: {
    eyebrow: "Health 3.0",
    title: "健康3.0",
    intro: "長照內容農場，提供家屬照顧知識、疾病照護、復能觀念、營養衛教與長照政策整理。",
    focus: ["照顧知識文章", "健康衛教內容", "家屬常見問題"],
    features: ["文章分類", "專題企劃", "可分享的照顧指南"]
  },
  courses: {
    eyebrow: "Courses",
    title: "課程報名",
    intro: "整合照服員訓練、移工培訓、家屬照顧課與專業研習，讓課程資訊與報名流程集中管理。",
    focus: ["課程列表", "線上報名", "開課通知"],
    features: ["課程卡片", "名額與日期", "報名表單入口"]
  },
  investors: {
    eyebrow: "Investor Relations",
    title: "投資人專區",
    intro: "提供投資人了解歲悅長照營運、展店、財務重點與產業策略的專屬入口。",
    focus: ["營運摘要", "展店計畫", "投資人文件"],
    features: ["資訊分級呈現", "簡報與資料下載", "聯繫窗口"]
  },
  contact: {
    eyebrow: "Contact",
    title: "聯絡我們",
    intro: "不論是服務諮詢、課程報名、場地合作、人才加入或投資洽談，都可以從這裡開始。",
    focus: ["服務諮詢", "合作與招募", "客服與據點窗口"],
    features: ["表單入口", "電話與信箱", "據點位置資訊"]
  }
};

const nav = document.querySelector(".primary-nav");
const menuToggle = document.querySelector(".menu-toggle");
const groups = document.querySelectorAll(".nav-group");
const home = document.querySelector("#home");
const pageView = document.querySelector("#pageView");
const revealItems = document.querySelectorAll(".reveal");
const introLoader = document.querySelector(".intro-loader");
const WP_API_BASE = "https://www.suiyuecare.com/wp-json/wp/v2";
const WP_CATEGORIES = {
  latestNews: "latest-news",
  awards: "awards",
  careStories: "care-stories",
  health30: "health-30",
  masterTalk: "master-talk"
};

const articlePages = {
  "longterm-care-apply": {
    category: "Health 3.0",
    title: "第一次申請長照服務，家人需要先準備什麼？",
    dek: "從需求盤點、照顧計畫、政府補助到服務媒合，用一篇文章把流程講清楚。",
    image: "assets/homepage-batch/10-family-consultation.png",
    author: "歲悅照顧編輯部",
    date: "2026.05.13",
    readTime: "6 min read",
    tags: ["長照申請", "家庭照顧", "服務媒合"],
    summary: ["先整理長輩目前生活需要協助的地方。", "把醫療、用藥、行動能力與家庭照顧時間寫下來。", "諮詢時直接描述一週中最困難的照顧時段。"],
    content: [
      ["先從一天的生活節奏開始", "很多家庭第一次接觸長照時，會先問可以申請什麼服務。但更有效的方式，是先把長輩一天的生活節奏整理出來：起床、用餐、洗澡、服藥、外出、睡眠與夜間照顧，哪些地方最容易卡住。這些細節會影響服務安排，也能幫助專業人員更快判斷適合的照顧方向。"],
      ["把照顧困難說具體", "與其說「需要有人照顧」，不如說「早上起床移位不穩」、「洗澡時家人很擔心跌倒」、「下午容易忘記吃藥」。具體描述能讓督導判斷需要居家照顧、日間照顧、護理復能或家屬支持課程，也能避免服務進場後才重新調整。"],
      ["保留家屬喘息的空間", "長照不是只照顧長輩，也是在支持整個家庭。當家屬已經長期睡不好、無法上班或情緒緊繃，就應該把喘息需求一起放進討論。好的照顧安排，會讓長輩安全，也讓家人能走得長久。"]
    ],
    cta: "不確定該從哪一項服務開始？留下需求，讓歲悅協助判斷。"
  },
  "family-care-story": {
    category: "Care Stories",
    title: "爸爸出院後，我終於知道每天該注意什麼。",
    dek: "家屬最需要的不是更多壓力，而是有人把照顧重點說清楚、每天回報、一起調整。",
    image: "assets/homepage-batch/01-care-home-greeting.png",
    author: "林小姐｜居家照顧",
    date: "2026.05.13",
    readTime: "4 min read",
    tags: ["居家照顧", "家屬回饋", "出院返家"],
    summary: ["每日回報讓家人不用猜。", "照服員會提醒移位、用餐與精神狀況。", "督導會依照狀態調整照顧方式。"],
    content: [
      ["剛出院時，家人最怕做錯", "林小姐的爸爸出院返家後，家裡最焦慮的是每天都不知道哪些狀況正常、哪些需要留意。歲悅團隊進場後，先協助家屬整理照顧重點，把移位、用餐、服藥與精神狀況變成每天可以追蹤的項目。"],
      ["照顧紀錄是一封安心回信", "每次服務後，家屬都能知道今天長輩吃得如何、活動狀況如何、是否有特別需要注意的地方。這些紀錄看起來簡單，卻讓下班後的家人可以快速掌握狀況，不用靠猜測累積不安。"],
      ["照顧不是單點服務，而是一個團隊", "當現場出現新的狀況，照服員不需要一個人承擔。督導會一起討論、調整服務方式，必要時也會建議家屬串接復能或護理資源。這讓照顧更穩定，也讓家庭感覺背後真的有人一起走。"]
    ],
    cta: "如果家中也正面臨出院返家或照顧轉換期，可以先和歲悅聊聊。"
  },
  "master-talk-care-psychology": {
    category: "Master Talk",
    title: "好的照顧，是讓長輩和家屬都保有生活感。",
    dek: "照顧心理講師周小姐談家庭照顧中的焦慮、溝通與支持系統。",
    image: "assets/homepage-batch/10-family-consultation.png",
    author: "照顧心理講師 周小姐",
    date: "2026.05.13",
    readTime: "5 min read",
    tags: ["名人講堂", "照顧心理", "家屬支持"],
    summary: ["照顧焦慮常來自資訊不清楚。", "家人需要可理解、可求助的系統。", "真正的支持是讓家庭恢復生活感。"],
    content: [
      ["照顧中的焦慮，常常不是不愛", "很多家屬在照顧中感到煩躁或疲憊，會因此責備自己。但周小姐提醒，這些情緒往往來自資訊不足與長期壓力。當照顧沒有明確分工，也沒有可以求助的窗口，家人很容易把所有責任都扛在自己身上。"],
      ["讓資訊變得可以使用", "照顧建議不是越多越好，而是要讓家庭知道今天先做哪一件事。像是跌倒風險、飲食狀況、服藥提醒與情緒變化，都可以轉化成簡單可追蹤的提醒，讓家屬有方向，而不是被資訊淹沒。"],
      ["保有生活感，是長期照顧的關鍵", "好的照顧不是把家庭變成病房，而是在安全之中保留原本的生活節奏。當長輩仍能做選擇，家屬也能保有休息與工作，照顧才有機會走得長久。"]
    ],
    cta: "想把家庭照顧壓力變得更可整理，歡迎預約歲悅照顧諮詢。"
  }
};

Object.assign(articlePages, {
  "safe-transfer-tips": {
    category: "照顧技巧",
    title: "協助長輩安全起身的三個提醒",
    dek: "從床邊高度、手部支撐到起身節奏，降低跌倒與拉傷風險。",
    image: "assets/homepage-batch/18-health-fall-prevention-cover.png",
    author: "歲悅復能團隊",
    date: "2026.05.10",
    readTime: "4 min read",
    tags: ["移位安全", "跌倒預防", "復能照顧"],
    summary: ["先確認腳能踩穩、手能扶穩。", "起身前讓長輩坐在床緣停留幾秒。", "不要拉手臂硬起身，改用口令與重心引導。"],
    content: [
      ["先讓身體找到穩定點", "長輩起身前，先確認雙腳可以踩到地面，床邊或椅旁有穩定扶手。若剛睡醒或剛坐下，建議先停留幾秒，觀察是否頭暈、無力或站不穩。"],
      ["用口令協助，不用蠻力拉起", "照顧者可以用「腳往後收、身體向前、手扶穩、再站起來」的口令協助長輩自己參與動作。直接拉手臂容易造成肩膀受傷，也會讓長輩失去重心。"],
      ["把安全變成每天固定流程", "起身、移位與如廁是日常中最容易跌倒的時刻。把環境、口令與步驟固定下來，長輩會更有安全感，家屬也比較能掌握風險。"]
    ],
    cta: "需要到宅檢視移位與跌倒風險，歡迎預約歲悅照顧諮詢。"
  },
  "nutrition-warning": {
    category: "飲食營養",
    title: "吃得少不是正常老化，家人該先看哪些訊號？",
    dek: "從體重、食慾、肌力與精神狀態，快速判斷是否需要營養或醫療協助。",
    image: "assets/homepage-batch/17-health-nutrition-cover.png",
    author: "歲悅營養照顧小組",
    date: "2026.05.08",
    readTime: "5 min read",
    tags: ["飲食營養", "體重觀察", "家屬支持"],
    summary: ["觀察體重是否快速下降。", "留意吃飯時間變長或常常剩餐。", "若合併嗆咳、無力或精神變差，應及早諮詢。"],
    content: [
      ["先看變化，不只看份量", "長輩吃得少不一定只是胃口差，也可能和牙口、吞嚥、藥物、情緒或疾病變化有關。家人可以先記錄一週的飲食量、體重與精神狀態。"],
      ["肌力和精神也是營養訊號", "營養不足常會反映在走路變慢、起身變吃力、白天嗜睡或活動意願下降。若這些變化同時出現，就不建議只用正常老化解釋。"],
      ["把餐食調整變成照顧計畫", "照顧團隊可以協助觀察用餐節奏、食物質地與水分補充，再視情況串接醫療或營養專業，讓家屬不用單獨猜測。"]
    ],
    cta: "想評估長輩飲食與照顧風險，可以先留下需求。"
  },
  "dementia-response": {
    category: "失智照顧",
    title: "重複提問怎麼回應，才不會讓彼此更焦慮？",
    dek: "理解長輩不安背後的需求，用更穩定的語句降低照顧衝突。",
    image: "assets/homepage-batch/19-health-dementia-cover.png",
    author: "歲悅照顧編輯部",
    date: "2026.05.06",
    readTime: "5 min read",
    tags: ["失智照顧", "溝通技巧", "情緒安撫"],
    summary: ["重複提問常常來自不安。", "先回應情緒，再補充事實。", "用固定提示物降低反覆確認。"],
    content: [
      ["先聽見不安", "長輩一直問同一件事，常常不是故意找麻煩，而是記憶與安全感正在鬆動。照顧者可以先用穩定語氣回應情緒，例如「你有點擔心，我在這裡」。"],
      ["答案越短越好", "長篇解釋容易讓長輩更混亂。建議用短句、固定說法與視覺提示，例如白板、日曆、照片或固定物品，讓長輩有可以反覆確認的依據。"],
      ["照顧者也需要喘息", "當重複提問頻率很高，照顧者會累是正常的。這時候需要的是服務分工與喘息安排，而不是要求家屬永遠保持耐心。"]
    ],
    cta: "失智照顧需要一起設計日常節奏，歡迎和歲悅討論。"
  },
  "caregiver-support": {
    category: "家屬支持",
    title: "照顧者快撐不住時，可以先做的三件事",
    dek: "先盤點照顧時段、找到喘息入口，讓家庭照顧可以走得更久。",
    image: "assets/homepage-batch/20-health-caregiver-stress-cover.png",
    author: "歲悅家庭支持團隊",
    date: "2026.05.02",
    readTime: "4 min read",
    tags: ["喘息服務", "家屬支持", "照顧壓力"],
    summary: ["先寫下最累的三個時段。", "把可替手的服務列入安排。", "不要等到崩潰才求助。"],
    content: [
      ["找出最耗能的照顧時段", "很多家庭不是整天都撐不住，而是卡在洗澡、夜間、如廁、用餐或回診。先找出最困難的三個時段，才容易安排服務介入。"],
      ["不要把喘息視為偷懶", "喘息是長期照顧的一部分。當家屬有休息、工作與情緒恢復的空間，照顧關係反而比較能走得長久。"],
      ["讓照顧變成團隊工作", "居家照顧、日間照顧、課程與諮詢可以一起使用。重點不是把責任丟出去，而是讓家庭不再只有一個人硬撐。"]
    ],
    cta: "如果你已經快撐不住，先讓歲悅幫你整理可用資源。"
  },
  "family-care-course": {
    category: "課程活動",
    title: "家屬照顧課：把照顧技巧變成每天用得到的方法",
    dek: "把移位、用餐、跌倒預防與照顧溝通整理成家人也能操作的課程。",
    image: "assets/homepage-batch/12-community-health-class.png",
    author: "歲悅教育品管",
    date: "2026.04.28",
    readTime: "3 min read",
    tags: ["課程報名", "家屬照顧", "照顧技巧"],
    summary: ["課程以家中真實場景設計。", "重點放在可以每天使用的方法。", "適合初次照顧與照顧壓力升高的家庭。"],
    content: [
      ["把技巧變成家人聽得懂的語言", "課程會把專業照顧動作拆成家屬也能理解的步驟，包含移位、起身、用餐、安全觀察與溝通方式。"],
      ["從家中的問題開始練習", "每個家庭遇到的困難不一樣，因此課程會以常見情境作為練習入口，讓家屬能帶著問題找到可執行的方法。"],
      ["課後也能接續服務", "若家庭需要進一步協助，也可以串接居家照顧、日照、護理復能或督導諮詢，讓課程不是一次性的資訊。"]
    ],
    cta: "想參加家屬照顧課，歡迎查看課程報名。"
  },
  "day-care-respite": {
    category: "活動專區",
    title: "日照體驗參觀日：認識家庭喘息與白天照顧",
    dek: "帶家屬理解日間照顧的一天，包含活動、共餐、休息與回報流程。",
    image: "assets/homepage-batch/02-daycare-group-exercise.png",
    author: "歲悅日照團隊",
    date: "2026.04.22",
    readTime: "3 min read",
    tags: ["日間照顧", "家庭喘息", "活動專區"],
    summary: ["認識日照中心的一日流程。", "理解哪些長輩適合日間照顧。", "現場可諮詢家庭照顧安排。"],
    content: [
      ["白天有人陪，晚上仍能回家", "日間照顧讓長輩白天有規律活動、餐食與陪伴，晚上仍回到熟悉的家中，也讓家屬有工作與休息的空間。"],
      ["活動不是消磨時間", "好的日照活動會考量認知、肢體、社交與情緒需求，讓長輩維持節奏，也保留被邀請、被看見的感覺。"],
      ["家屬也能看見照顧品質", "透過參觀與諮詢，家屬可以了解回報機制、照顧紀錄與服務調整方式，判斷是否適合自己的家庭。"]
    ],
    cta: "想了解日間照顧是否適合家中長輩，歡迎預約參觀。"
  },
  "reablement-workshop": {
    category: "活動專區",
    title: "復能照顧工作坊：陪長輩一步一步重新有把握",
    dek: "用小目標、日常動作與安全陪伴，支持長輩找回生活能力。",
    image: "assets/homepage-batch/13-rehab-walking-practice.png",
    author: "歲悅護理復能團隊",
    date: "2026.04.18",
    readTime: "4 min read",
    tags: ["護理復能", "復能訓練", "活動專區"],
    summary: ["復能不是催促，而是陪伴練習。", "目標要能放回日常生活。", "家屬需要知道如何安全協助。"],
    content: [
      ["從生活目標開始", "復能不是只做訓練動作，而是回到長輩想完成的生活任務，例如走到餐桌、自己起身、安心如廁或短距離外出。"],
      ["把目標拆小才走得久", "太大的目標會讓長輩挫折。團隊會把練習拆成可完成的小步驟，讓每一次進步都能被看見。"],
      ["家屬知道方法，長輩更安全", "工作坊會協助家屬理解安全陪伴、口令、環境調整與觀察重點，讓練習不只發生在課堂。"]
    ],
    cta: "想為家中長輩安排復能目標，歡迎預約諮詢。"
  },
  "fall-observation": {
    category: "短影片",
    title: "跌倒後 24 小時觀察重點",
    dek: "跌倒後不只看有沒有外傷，也要留意疼痛、意識、走路與精神變化。",
    image: "assets/homepage-batch/14-care-notes.png",
    author: "歲悅照顧編輯部",
    date: "2026.04.16",
    readTime: "3 min read",
    tags: ["跌倒觀察", "短影片", "居家安全"],
    summary: ["先確認意識與疼痛位置。", "觀察 24 小時內是否精神變差。", "若持續疼痛或走路異常，應盡快就醫。"],
    content: [
      ["跌倒後先不要急著扶起", "先確認長輩是否清醒、哪裡疼痛、是否有明顯變形或出血。若懷疑骨折或頭部撞擊，不建議硬拉起身。"],
      ["24 小時內持續觀察", "有些狀況不是當下立刻出現。家屬可以留意嗜睡、頭痛、嘔吐、走路不穩、情緒改變或食慾明顯下降。"],
      ["把跌倒原因找出來", "跌倒後除了處理傷勢，也要回頭檢查燈光、地墊、浴室、床邊高度、鞋子與用藥狀況，避免同樣事件再次發生。"]
    ],
    cta: "需要居家安全檢視，可以與歲悅照顧團隊討論。"
  },
  "bathroom-safety": {
    category: "短影片",
    title: "浴室安全的快速檢查",
    dek: "用五分鐘檢查止滑、扶手、動線與照明，降低家中高風險跌倒。",
    image: "assets/homepage-batch/08-orange-apron-walking.png",
    author: "歲悅居家安全團隊",
    date: "2026.04.12",
    readTime: "3 min read",
    tags: ["浴室安全", "跌倒預防", "居家照顧"],
    summary: ["地面止滑與排水是第一步。", "扶手位置要符合長輩動作。", "夜間照明與動線也要一起檢查。"],
    content: [
      ["先看地面和排水", "浴室濕滑是跌倒高風險來源。止滑墊、排水速度與門口高低差都需要檢查，避免長輩跨出浴室時踩到積水。"],
      ["扶手不是有裝就好", "扶手要裝在長輩真正會用力的位置，例如馬桶旁、淋浴區或進出浴室的轉身處。位置不對，反而可能讓動作更不穩。"],
      ["夜間動線也很重要", "很多跌倒發生在半夜如廁。床邊到浴室的燈光、走道雜物與鞋子止滑，都應納入照顧檢查。"]
    ],
    cta: "想做居家安全檢視，歡迎預約歲悅到宅評估。"
  }
});

const relatedArticleCards = [
  {
    href: "#article-longterm-care-apply",
    category: "Health 3.0",
    title: "第一次申請長照服務，家人需要先準備什麼？",
    image: "assets/homepage-batch/10-family-consultation.png"
  },
  {
    href: "#article-family-care-story",
    category: "Care Stories",
    title: "爸爸出院後，我終於知道每天該注意什麼。",
    image: "assets/homepage-batch/01-care-home-greeting.png"
  },
  {
    href: "#article-master-talk-care-psychology",
    category: "Master Talk",
    title: "好的照顧，是讓長輩和家屬都保有生活感。",
    image: "assets/homepage-batch/10-family-consultation.png"
  },
  {
    href: "#article-safe-transfer-tips",
    category: "照顧技巧",
    title: "協助長輩安全起身的三個提醒",
    image: "assets/homepage-batch/18-health-fall-prevention-cover.png"
  },
  {
    href: "#article-nutrition-warning",
    category: "飲食營養",
    title: "吃得少不是正常老化，家人該先看哪些訊號？",
    image: "assets/homepage-batch/17-health-nutrition-cover.png"
  },
  {
    href: "#article-dementia-response",
    category: "失智照顧",
    title: "重複提問怎麼回應，才不會讓彼此更焦慮？",
    image: "assets/homepage-batch/19-health-dementia-cover.png"
  },
  {
    href: "#article-caregiver-support",
    category: "家屬支持",
    title: "照顧者快撐不住時，可以先做的三件事",
    image: "assets/homepage-batch/20-health-caregiver-stress-cover.png"
  },
  {
    href: "#article-family-care-course",
    category: "課程報名",
    title: "家屬照顧課：把照顧技巧變成每天用得到的方法",
    image: "assets/homepage-batch/12-community-health-class.png"
  }
];

const healthArticles = [
  {
    href: "#article-longterm-care-apply",
    category: "長照申請",
    title: "第一次申請長照服務，家人需要先準備什麼？",
    excerpt: "從需求盤點、照顧計畫、政府補助到服務媒合，用一篇文章把流程講清楚。",
    image: "assets/homepage-batch/10-family-consultation.png",
    author: "歲悅照顧編輯部",
    date: "2026.05.13",
    keywords: "長照申請 家庭照顧 服務媒合 居家照顧"
  },
  {
    href: "#article-family-care-story",
    category: "家屬故事",
    title: "爸爸出院後，我終於知道每天該注意什麼。",
    excerpt: "每日回報、照顧紀錄與督導追蹤，讓出院返家的照顧不再只能靠家人猜。",
    image: "assets/homepage-batch/01-care-home-greeting.png",
    author: "林小姐｜居家照顧",
    date: "2026.05.13",
    keywords: "出院返家 居家照顧 家屬回饋 照顧紀錄"
  },
  {
    href: "#article-master-talk-care-psychology",
    category: "專家專欄",
    title: "好的照顧，是讓長輩和家屬都保有生活感。",
    excerpt: "照顧心理講師談家庭照顧中的焦慮、溝通與支持系統。",
    image: "assets/homepage-batch/10-family-consultation.png",
    author: "照顧心理講師 周小姐",
    date: "2026.05.13",
    keywords: "名人講堂 照顧心理 家屬支持"
  },
  {
    href: "#article-safe-transfer-tips",
    category: "照顧技巧",
    title: "協助長輩安全起身的三個提醒",
    excerpt: "從床邊高度、手部支撐到起身節奏，降低跌倒與拉傷風險。",
    image: "assets/homepage-batch/18-health-fall-prevention-cover.png",
    author: "歲悅復能團隊",
    date: "2026.05.10",
    keywords: "跌倒 起身 移位 復能"
  },
  {
    href: "#article-nutrition-warning",
    category: "飲食營養",
    title: "吃得少不是正常老化，家人該先看哪些訊號？",
    excerpt: "從體重、食慾、肌力與精神狀態，快速判斷是否需要營養或醫療協助。",
    image: "assets/homepage-batch/17-health-nutrition-cover.png",
    author: "歲悅營養照顧小組",
    date: "2026.05.08",
    keywords: "營養 飲食 肌力 食慾 體重"
  },
  {
    href: "#article-dementia-response",
    category: "失智照顧",
    title: "重複提問怎麼回應，才不會讓彼此更焦慮？",
    excerpt: "理解長輩不安背後的需求，用更穩定的語句降低照顧衝突。",
    image: "assets/homepage-batch/19-health-dementia-cover.png",
    author: "歲悅照顧編輯部",
    date: "2026.05.06",
    keywords: "失智 重複提問 溝通 情緒"
  },
  {
    href: "#article-caregiver-support",
    category: "家屬支持",
    title: "照顧者快撐不住時，可以先做的三件事",
    excerpt: "先盤點照顧時段、找到喘息入口，讓家庭照顧可以走得更久。",
    image: "assets/homepage-batch/20-health-caregiver-stress-cover.png",
    author: "歲悅家庭支持團隊",
    date: "2026.05.02",
    keywords: "照顧者 壓力 喘息 家屬支持"
  },
  {
    href: "#article-family-care-course",
    category: "課程",
    title: "家屬照顧課：把照顧技巧變成每天用得到的方法",
    excerpt: "把移位、用餐、跌倒預防與照顧溝通整理成家人也能操作的課程。",
    image: "assets/homepage-batch/12-community-health-class.png",
    author: "歲悅教育品管",
    date: "2026.04.28",
    keywords: "課程 家屬照顧 移位 跌倒預防"
  }
];

function stripHTML(value = "") {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPostDate(dateValue, yearOnly = false) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  if (yearOnly) return String(date.getFullYear());
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getPostImage(post, fallback = "assets/homepage-batch/02-daycare-group-exercise.png") {
  const embedded = post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const acfImage = post?.acf?.image?.url || post?.acf?.avatar?.url || post?.acf?.speaker_photo?.url || post?.acf?.cover?.url;
  return acfImage || embedded || fallback;
}

async function fetchWordPressJSON(path) {
  const response = await fetch(`${WP_API_BASE}${path}`);
  if (!response.ok) throw new Error(`WordPress API error: ${response.status}`);
  return response.json();
}

async function fetchCategoryId(slug) {
  const categories = await fetchWordPressJSON(`/categories?slug=${encodeURIComponent(slug)}`);
  return categories?.[0]?.id || null;
}

async function fetchPostsByCategory(slug, limit = 10) {
  const categoryId = await fetchCategoryId(slug);
  if (!categoryId) return [];
  return fetchWordPressJSON(`/posts?categories=${categoryId}&per_page=${limit}&_embed`);
}

function renderWordPressNews(posts, panel, yearOnly = false) {
  if (!posts.length || !panel) return;
  panel.innerHTML = posts.map((post) => `
    <article>
      <time>${escapeHTML(formatPostDate(post.date, yearOnly))}</time>
      <strong>${post.title?.rendered || ""}</strong>
      <p>${escapeHTML(stripHTML(post.excerpt?.rendered || post.content?.rendered || ""))}</p>
    </article>
  `).join("");
}

function renderWordPressStories(posts) {
  const slider = document.querySelector(".story-slider");
  if (!posts.length || !slider) return;
  slider.innerHTML = posts.map((post) => {
    const acf = post.acf || {};
    const name = acf.family_name || acf.person_name || stripHTML(post.title?.rendered || "家屬回饋");
    const service = acf.service_type || "居家照顧";
    const quote = acf.quote || stripHTML(post.title?.rendered || "");
    const feedback = acf.short_feedback || stripHTML(post.excerpt?.rendered || post.content?.rendered || "");
    const image = getPostImage(post, "assets/homepage-batch/05-orange-polo-caregiver.png");
    return `
      <article>
        <img class="story-face" src="${escapeHTML(image)}" alt="${escapeHTML(name)}頭像" />
        <span class="story-meta"><b>${escapeHTML(name)}</b><em>${escapeHTML(service)}</em></span>
        <h3>${escapeHTML(quote)}</h3>
        <div class="story-points"><p>${escapeHTML(feedback)}</p></div>
        <a class="story-readmore" href="${escapeHTML(post.link || "#health")}" target="_blank" rel="noopener">Read More</a>
      </article>
    `;
  }).join("");
}

function renderWordPressHealth(posts) {
  const articleRow = document.querySelector(".home-health-section .article-row");
  if (!posts.length || !articleRow) return;
  const [feature, ...items] = posts;
  const miniItems = items.slice(0, 4);
  articleRow.innerHTML = `
    <article class="health-preview feature">
      <img src="${escapeHTML(getPostImage(feature))}" alt="${escapeHTML(stripHTML(feature.title?.rendered || "Health 3.0"))}" />
      <div><span>熱門文章</span><h3>${feature.title?.rendered || ""}</h3><p>${escapeHTML(stripHTML(feature.excerpt?.rendered || feature.content?.rendered || ""))}</p><a href="${escapeHTML(feature.link || "#health")}" target="_blank" rel="noopener">Read More</a></div>
    </article>
    <div class="mini-article-grid">
      ${miniItems.map((post) => `
        <article class="health-preview compact">
          <img src="${escapeHTML(getPostImage(post))}" alt="${escapeHTML(stripHTML(post.title?.rendered || "Health 3.0"))}" />
          <div><span>照顧知識</span><h3>${post.title?.rendered || ""}</h3><a href="${escapeHTML(post.link || "#health")}" target="_blank" rel="noopener">Read More</a></div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderWordPressMasterTalk(posts) {
  const slider = document.querySelector(".celebrity-slider");
  if (!posts.length || !slider) return;
  slider.innerHTML = posts.map((post) => {
    const acf = post.acf || {};
    const speaker = [acf.speaker_title, acf.speaker_name].filter(Boolean).join(" ") || "名人講堂";
    return `
      <article>
        <figure>
          <img src="${escapeHTML(getPostImage(post, "assets/homepage-batch/10-family-consultation.png"))}" alt="${escapeHTML(speaker)}" />
          <figcaption>${escapeHTML(speaker)}</figcaption>
        </figure>
        <div>
          <h3>${post.title?.rendered || ""}</h3>
          <p>${escapeHTML(stripHTML(acf.summary || post.excerpt?.rendered || post.content?.rendered || ""))}</p>
          <a href="${escapeHTML(post.link || "#health")}" target="_blank" rel="noopener">Read More</a>
        </div>
      </article>
    `;
  }).join("");
}

async function loadWordPressContent() {
  try {
    const [latestNews, awards, careStories, health30, masterTalk] = await Promise.all([
      fetchPostsByCategory(WP_CATEGORIES.latestNews, 10),
      fetchPostsByCategory(WP_CATEGORIES.awards, 10),
      fetchPostsByCategory(WP_CATEGORIES.careStories, 10),
      fetchPostsByCategory(WP_CATEGORIES.health30, 10),
      fetchPostsByCategory(WP_CATEGORIES.masterTalk, 10)
    ]);

    renderWordPressNews(latestNews, document.querySelector('[data-news-panel="news"]'));
    renderWordPressNews(awards, document.querySelector('[data-news-panel="awards"]'), true);
    renderWordPressStories(careStories);
    renderWordPressHealth(health30);
    renderWordPressMasterTalk(masterTalk);
  } catch (error) {
    console.warn("WordPress content unavailable, using static homepage content.", error);
  }
}

const locationData = {
  shilin: {
    image: "assets/homepage-batch/16-taipei-service-office.png",
    alt: "士林服務據點照片",
    type: "臺北市｜居家照顧站",
    name: "Suiyuecare Corps. 士林照顧站",
    desc: "服務士林、北投生活圈，提供長照需求初談、居家照顧媒合與家屬諮詢。",
    services: "居家照顧、喘息服務、家屬諮詢",
    hours: "週一至週五 09:00-18:00",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "臺北市士林區照顧服務據點",
    email: "generalaffairs@suiyuecare.com"
  },
  datong: {
    image: "assets/homepage-batch/10-family-consultation.png",
    alt: "大同服務據點照片",
    type: "臺北市｜家屬諮詢站",
    name: "Suiyuecare Corps. 大同諮詢站",
    desc: "協助大同、南港與周邊家庭釐清照顧需求，安排到宅照顧與照顧計畫。",
    services: "照顧評估、服務媒合、課程報名",
    hours: "週一至週五 09:00-18:00",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "臺北市大同區照顧服務據點",
    email: "generalaffairs@suiyuecare.com"
  },
  "wanhua-a": {
    image: "assets/homepage-batch/07-orange-apron-meal-prep.png",
    alt: "萬華居家服務據點照片",
    type: "臺北市｜居家服務點",
    name: "Suiyuecare Corps. 萬華居家服務點 A",
    desc: "支援萬華北側社區與高齡家庭，提供日常生活協助、陪伴與照顧紀錄回報。",
    services: "生活照顧、陪伴服務、家屬回報",
    hours: "週一至週六 08:30-18:00",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "臺北市萬華區北側服務據點",
    email: "generalaffairs@suiyuecare.com"
  },
  "wanhua-b": {
    image: "assets/homepage-batch/14-care-notes.png",
    alt: "萬華照顧支援據點照片",
    type: "臺北市｜照顧支援點",
    name: "Suiyuecare Corps. 萬華照顧服務點 B",
    desc: "服務萬華南側生活圈，串接居家照顧、喘息安排與健康3.0照顧衛教。",
    services: "喘息服務、健康衛教、照顧諮詢",
    hours: "週一至週五 09:00-17:30",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "臺北市萬華區南側服務據點",
    email: "generalaffairs@suiyuecare.com"
  },
  xinyi: {
    image: "assets/homepage-batch/10-family-consultation.png",
    alt: "信義服務據點照片",
    type: "臺北市｜健康促進站",
    name: "Suiyuecare Corps. 信義健康促進站",
    desc: "提供信義、南港周邊家屬照顧諮詢、預防延緩失能活動與課程報名。",
    services: "健康促進、家屬課程、照顧諮詢",
    hours: "週一至週五 09:00-18:00",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "臺北市信義區健康促進據點",
    email: "generalaffairs@suiyuecare.com"
  },
  xindian: {
    image: "assets/homepage-batch/12-community-health-class.png",
    alt: "新店日間照顧據點照片",
    type: "新北市｜日間照顧點",
    name: "Suiyuecare Corps. 新店日照據點",
    desc: "以白天托顧、團體活動、共餐與復能安排，支持新店、中和、永和家庭喘息。",
    services: "日間照顧、社區共餐、延緩失能活動",
    hours: "週一至週六 08:30-17:30",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "新北市新店區日間照顧服務據點",
    email: "generalaffairs@suiyuecare.com"
  },
  xinzhuang: {
    image: "assets/homepage-batch/12-community-health-class.png",
    alt: "新莊社區據點照片",
    type: "新北市｜社區照顧點",
    name: "Suiyuecare Corps. 新莊社區據點",
    desc: "串接新莊周邊社區照顧、預防延緩失能與家庭支持服務。",
    services: "社區據點、健康促進、家屬支持",
    hours: "週一至週五 09:00-17:30",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "新北市新莊區社區照顧服務據點",
    email: "generalaffairs@suiyuecare.com"
  },
  luzhu: {
    image: "assets/homepage-batch/13-rehab-walking-practice.png",
    alt: "蘆竹護理復能據點照片",
    type: "桃園市｜護理復能點",
    name: "Suiyuecare Corps. 蘆竹復能中心",
    desc: "支援蘆竹、大園生活圈，由護理與復能團隊協助建立個案目標並追蹤照顧風險。",
    services: "護理評估、復能訓練、照顧風險追蹤",
    hours: "週一至週五 09:00-17:30",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "桃園市蘆竹區護理復能服務中心",
    email: "generalaffairs@suiyuecare.com"
  }
};

function updateLocation(locationKey) {
  const data = locationData[locationKey];
  const detail = document.querySelector("#locationDetail");
  if (!data || !detail) return;
  const isWanhua = locationKey === "wanhua-a" || locationKey === "wanhua-b";

  detail.querySelector("img").src = data.image;
  detail.querySelector("img").alt = data.alt;
  document.querySelector("#locationType").textContent = data.type;
  document.querySelector("#locationName").textContent = data.name;
  document.querySelector("#locationDesc").textContent = data.desc;
  document.querySelector("#locationServices").textContent = data.services;
  document.querySelector("#locationHours").textContent = data.hours;
  document.querySelector("#locationPhone").textContent = data.phone;
  document.querySelector("#locationAddress").textContent = data.address;
  document.querySelector("#locationEmail").textContent = data.email;
  document.querySelector("#locationCall").href = data.phoneHref;
  document.querySelector("#locationMail").href = `mailto:${data.email}`;

  const wanhuaTabs = document.querySelector("#wanhuaTabs");
  if (wanhuaTabs) {
    wanhuaTabs.hidden = !isWanhua;
    wanhuaTabs.querySelectorAll("button").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.locationTab === locationKey);
    });
  }

  document.querySelectorAll(".location-pin").forEach((pin) => {
    const isActive = pin.dataset.location === locationKey || (pin.dataset.location === "wanhua-a" && isWanhua);
    pin.classList.toggle("active", isActive);
  });
}

function renderHealthPage() {
  const feature = healthArticles[0];
  const quickCards = healthArticles.slice(1, 5);
  const latestCards = healthArticles.slice(0, 6);
  const lazyPacks = [
    ["長照申請懶人包", "從評估、補助、服務媒合到第一次到宅，照著順序看就懂。", "assets/homepage-batch/10-family-consultation.png", "#article-longterm-care-apply"],
    ["出院返家照顧包", "把返家前準備、移位、用餐與每日觀察整理成家屬清單。", "assets/homepage-batch/01-care-home-greeting.png", "#article-family-care-story"],
    ["失智陪伴懶人包", "重複提問、情緒不安與日常安全，用簡單方法降低摩擦。", "assets/homepage-batch/19-health-dementia-cover.png", "#article-dementia-response"]
  ];
  const eventCards = [
    ["家屬照顧技巧課", "移位、用餐、跌倒預防與照顧溝通", "5/28", "assets/homepage-batch/12-community-health-class.png", "#article-family-care-course"],
    ["日照體驗參觀日", "認識日間照顧流程與家庭喘息安排", "6/05", "assets/homepage-batch/02-daycare-group-exercise.png", "#article-day-care-respite"],
    ["復能照顧工作坊", "讓長輩一步一步恢復生活能力", "6/12", "assets/homepage-batch/13-rehab-walking-practice.png", "#article-reablement-workshop"]
  ];
  const videoCards = [
    ["影片", "三分鐘理解居家照顧安排流程", "assets/homepage-batch/15-phone-consultation.png", "#article-master-talk-care-psychology"],
    ["影片", "日間照顧如何讓家庭喘息", "assets/homepage-batch/12-community-health-class.png", "#article-master-talk-care-psychology"],
    ["短影片", "跌倒後 24 小時觀察重點", "assets/homepage-batch/14-care-notes.png", "#article-fall-observation"],
    ["短影片", "浴室安全的快速檢查", "assets/homepage-batch/08-orange-apron-walking.png", "#article-bathroom-safety"]
  ];

  return `
    <div class="health-page">
      <section class="health-hero">
        <div class="health-topline">
          <div>
            <p class="eyebrow">Health 3.0</p>
            <h1>健康3.0</h1>
            <p>長照內容農場，整理疾病症狀、飲食營養、復能運動、失智照顧與家屬照顧技巧。</p>
          </div>
          <form class="health-search">
            <input name="q" type="search" placeholder="搜尋跌倒、失智、營養、復能" />
            <button type="submit">搜尋</button>
          </form>
        </div>
        <div class="health-cats">
          ${["疾病症狀", "健康生活", "飲食營養", "復能運動", "失智照顧", "影音專區", "專家專欄", "圖解文章", "家屬支持", "課程活動"].map((cat) => `<button class="click-card" type="button" data-href="#search?q=${encodeURIComponent(cat)}">${cat}</button>`).join("")}
        </div>
      </section>

      <section class="health-board">
        <article class="health-feature click-card" data-href="${feature.href}" tabindex="0" role="link">
          <img src="${feature.image}" alt="${feature.title}" />
          <div>
            <span class="health-tag">本週精選</span>
            <h2>${feature.title}</h2>
            <p>${feature.excerpt}</p>
            <a class="health-readmore" href="${feature.href}">Read More</a>
          </div>
        </article>

        <div class="health-quick-grid">
          ${quickCards.map((post) => `
            <article class="health-card click-card" data-href="${post.href}" tabindex="0" role="link">
              <img src="${post.image}" alt="${post.title}" />
              <div>
                <span class="health-tag">${post.category}</span>
                <h3>${post.title}</h3>
                <a href="${post.href}">Read More</a>
              </div>
            </article>
          `).join("")}
        </div>

        <aside class="ranking-panel">
          <div class="ranking-title"><span>Ranking</span><h3>熱門文章</h3></div>
          <ol>
            ${healthArticles.slice(0, 6).map((post) => `<li><a href="${post.href}">${post.title}</a></li>`).join("")}
          </ol>
        </aside>
      </section>

      <section class="health-topic-strip">
        ${["長照2.0", "出院返家", "跌倒預防", "營養補充", "失智陪伴", "日間照顧", "復能訓練", "喘息服務"].map((keyword) => `<a href="#search?q=${encodeURIComponent(keyword)}"># ${keyword}</a>`).join("")}
      </section>

      <section class="health-pack-section">
        <div class="health-section-head">
          <div><p class="eyebrow">Guides</p><h2>懶人包</h2></div>
          <a href="#search?q=${encodeURIComponent("懶人包")}">更多懶人包</a>
        </div>
        <div class="health-pack-grid">
          ${lazyPacks.map(([title, desc, image, href]) => `
            <article class="health-pack-card click-card" data-href="${href}" tabindex="0" role="link">
              <img src="${image}" alt="${title}" />
              <div><span>懶人包</span><h3>${title}</h3><p>${desc}</p></div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="health-latest">
        <div class="health-section-head">
          <div><p class="eyebrow">Latest</p><h2>最新照顧文章</h2></div>
          <a href="#search?q=${encodeURIComponent("照顧")}">查看全部</a>
        </div>
        <div class="health-latest-grid">
          ${latestCards.map((post) => `
            <article class="health-list-card click-card" data-href="${post.href}" tabindex="0" role="link">
              <img src="${post.image}" alt="${post.title}" />
              <div>
                <span>${post.category}</span>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <small>${post.author} · ${post.date}</small>
              </div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="health-event-section">
        <div class="health-section-head">
          <div><p class="eyebrow">Events</p><h2>活動專區</h2></div>
          <a href="#courses">課程報名</a>
        </div>
        <div class="health-event-grid">
          ${eventCards.map(([title, desc, date, image, href]) => `
            <article class="health-event-card click-card" data-href="${href}" tabindex="0" role="link">
              <img src="${image}" alt="${title}" />
              <div><time>${date}</time><h3>${title}</h3><p>${desc}</p></div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="health-media-hub">
        <div class="health-section-head">
          <div><p class="eyebrow">Video</p><h2>影音與短影片</h2></div>
          <a href="#search?q=${encodeURIComponent("影片")}">更多影音</a>
        </div>
        <div class="health-media-grid">
          ${videoCards.map(([type, title, image, href]) => `
            <article class="health-video-card click-card" data-href="${href}" tabindex="0" role="link">
              <img src="${image}" alt="${title}" />
              <div><span>${type}</span><h3>${title}</h3></div>
            </article>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderSearchPage(query = "") {
  const keyword = decodeURIComponent(query || "").trim();
  const normalizedKeyword = keyword.toLowerCase();
  const results = normalizedKeyword
    ? healthArticles.filter((post) => `${post.title} ${post.excerpt} ${post.category} ${post.keywords}`.toLowerCase().includes(normalizedKeyword))
    : healthArticles;

  return `
    <div class="search-page">
      <section class="search-hero">
        <a class="search-back" href="#health">返回健康3.0</a>
        <p class="eyebrow">Search</p>
        <h1>搜尋照顧知識</h1>
        <form class="health-search search-page-form">
          <input name="q" type="search" value="${escapeHTML(keyword)}" placeholder="搜尋跌倒、失智、營養、復能" />
          <button type="submit">搜尋</button>
        </form>
        <p>${keyword ? `「${escapeHTML(keyword)}」共有 ${results.length} 筆相關內容` : "輸入關鍵字，快速找到文章、影音與照顧資源。"}</p>
      </section>
      <section class="search-results">
        ${results.length ? results.map((post) => `
          <article class="search-result-card click-card" data-href="${post.href}" tabindex="0" role="link">
            <img src="${post.image}" alt="${post.title}" />
            <div>
              <span>${post.category}</span>
              <h2>${post.title}</h2>
              <p>${post.excerpt}</p>
              <small>${post.author} · ${post.date}</small>
            </div>
          </article>
        `).join("") : `
          <div class="search-empty">
            <h2>目前沒有找到相關內容</h2>
            <p>可以試試「長照申請」、「跌倒」、「失智」、「營養」或「喘息」。</p>
            <a href="#health">回健康3.0</a>
          </div>
        `}
      </section>
    </div>
  `;
}

function renderCoursesPage() {
  const courses = [
    {
      title: "照服員核心訓練班",
      intro: "建立照服員上線前的基本能力。",
      date: "2026.05.20",
      time: "09:00-17:00",
      price: "NT$ 3,600",
      type: "實體課",
      location: "臺北教室",
      seats: "剩餘 12 名",
      image: "assets/homepage-batch/05-orange-polo-caregiver.png"
    },
    {
      title: "家庭照顧者實用課",
      intro: "快速學會起身、用餐、跌倒預防與照顧溝通。",
      date: "2026.05.24",
      time: "19:30-21:00",
      price: "免費",
      type: "線上同步課",
      location: "Google Meet",
      seats: "80 人",
      image: "assets/homepage-batch/12-community-health-class.png"
    },
    {
      title: "失智照顧溝通工作坊",
      intro: "用情境演練理解重複提問、拒絕洗澡與情緒不安。",
      date: "2026.06.02",
      time: "13:30-16:30",
      price: "NT$ 1,200",
      type: "實體課",
      location: "新北據點",
      seats: "24 人",
      image: "assets/homepage-batch/19-health-dementia-cover.png"
    },
    {
      title: "移工照顧技能培訓",
      intro: "建立一致的安全移位、用藥提醒與紀錄回報流程。",
      date: "2026.06.08",
      time: "10:00-15:00",
      price: "NT$ 2,000",
      type: "實體課",
      location: "臺北教室",
      seats: "30 人",
      image: "assets/homepage-batch/03-supervisor-care-plan.png"
    },
    {
      title: "督導品質管理研習",
      intro: "聚焦服務媒合、異常追蹤、紀錄檢核與團隊支持。",
      date: "2026.06.15",
      time: "20:00-22:00",
      price: "NT$ 980",
      type: "線上同步課",
      location: "Zoom",
      seats: "120 人",
      image: "assets/homepage-batch/04-admin-team-office.png"
    },
    {
      title: "護理復能基礎課",
      intro: "理解復能目標、步態觀察與家屬陪伴方法。",
      date: "2026.06.22",
      time: "可隨時觀看",
      price: "NT$ 680",
      type: "預錄課",
      location: "線上學習",
      seats: "不限人數",
      image: "assets/homepage-batch/13-rehab-walking-practice.png"
    }
  ];
  const importantCourses = courses.slice(0, 3);

  return `
    <div class="courses-page">
      <section class="courses-hero">
        <div>
          <p class="eyebrow">Courses</p>
          <h1>課程報名</h1>
          <p>像活動平台一樣快速篩選長照課程：照服員訓練、移工培訓、家屬照顧課、督導品管與專業研習。</p>
          <div class="course-filters"><span>全部活動</span><span>本週熱門</span><span>免費課程</span><span>線上課程</span><span>實體課程</span></div>
        </div>
        <div class="course-hero-card">
          <h2>找一堂適合你的長照課</h2>
          <form class="course-search">
            <input type="search" placeholder="搜尋課程或講師" />
            <select><option>台北</option><option>新北</option><option>線上</option></select>
            <button type="button">搜尋</button>
          </form>
        </div>
      </section>
      <section class="featured-courses">
        <div class="health-section-head">
          <div><p class="eyebrow">Featured</p><h2>重要課程</h2></div>
          <span>左右滑動查看本月主打課程</span>
        </div>
        <div class="featured-course-track" aria-label="重要課程輪播">
          ${importantCourses.map((course) => `
            <article class="featured-course-card click-card" data-href="#contact" tabindex="0" role="link">
              <img src="${course.image}" alt="${course.title}" />
              <div>
                <span>${course.type}</span>
                <h3>${course.title}</h3>
                <p>${course.intro}</p>
                <a href="#contact">立即報名</a>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
      <section class="course-list">
        ${courses.map((course, index) => `
          <article class="course-card click-card" data-href="#contact" tabindex="0" role="link">
            <div class="course-thumb"><img src="${course.image}" alt="${course.title}" /><span>${String(index + 1).padStart(2, "0")}</span></div>
            <div class="course-body">
              <div class="course-topline"><span class="course-type">${course.type}</span><span class="course-seats">${course.seats}</span></div>
              <h3>${course.title}</h3>
              <p>${course.intro}</p>
              <div class="course-info-line"><span><em>地點</em>${course.type}｜${course.location}</span><b><em>費用</em>${course.price}</b></div>
              <div class="course-info-line"><span><em>日期</em>${course.date}</span><b><em>時間</em>${course.time}</b></div>
              <a class="course-register" href="#contact">立即報名</a>
            </div>
          </article>
        `).join("")}
      </section>
    </div>
  `;
}

function renderArticlePage(slug) {
  const article = articlePages[slug] || articlePages["longterm-care-apply"];
  const related = relatedArticleCards
    .filter((item) => item.href !== `#article-${slug}`)
    .slice(0, 7);

  return `
    <article class="article-page">
      <div class="article-topbar">
        <a class="article-back" href="#health">返回上一頁</a>
        <span class="article-category">${article.category}</span>
      </div>

      <header class="article-hero">
        <figure>
          <img src="${article.image}" alt="${article.title}" />
          <figcaption>
            <h1>${article.title}</h1>
            <p>${article.dek}</p>
          </figcaption>
        </figure>
      </header>

      <section class="article-layout">
        <div class="article-main">
          <div class="article-meta">
            <span class="meta-editor">編輯人｜${article.author}</span>
            <span class="meta-date">${article.date}</span>
            ${article.tags.map((tag) => `<span class="meta-tag"># ${tag}</span>`).join("")}
          </div>

          <div class="article-summary">
            <strong>本文重點</strong>
            <ul>${article.summary.map((item) => `<li>${item}</li>`).join("")}</ul>
          </div>

          <div class="article-body">
            ${article.content.map(([heading, body]) => `
              <section>
                <h2>${heading}</h2>
                <p>${body}</p>
              </section>
            `).join("")}
            <div class="article-cta">
              <p>${article.cta}</p>
              <a href="#contact">預約照顧諮詢</a>
            </div>
          </div>

          <section class="article-related">
            <div class="article-related-head">
              <span>Related Articles</span>
              <strong>延伸閱讀</strong>
            </div>
            <div class="article-related-grid">
              ${related.map((item) => `
                <a href="${item.href}">
                  <img src="${item.image}" alt="" />
                  <span>${item.category}</span>
                  <b>${item.title}</b>
                </a>
              `).join("")}
            </div>
          </section>
        </div>

        <aside class="article-ads" aria-label="側邊推薦">
          <a class="article-ad featured" href="#contact">
            <span>Suiyuecare Corps.</span>
            <strong>第一次照顧諮詢</strong>
            <p>不知道該選居家、日照還是復能？讓專人協助判斷。</p>
            <em>預約諮詢</em>
          </a>
          <a class="article-ad" href="#courses">
            <span>Care Course</span>
            <strong>家屬照顧課</strong>
            <p>把移位、用餐、跌倒預防變成看得懂的日常技巧。</p>
          </a>
          <a class="article-ad" href="#talent">
            <span>We want you</span>
            <strong>加入歲悅團隊</strong>
            <p>居服員、督導、日照照服員招募中。</p>
          </a>
        </aside>
      </section>
    </article>
  `;
}

function renderPage(slug) {
  if (!home || !pageView) return;

  const rawSlug = slug || "home";
  const [normalized, queryString = ""] = rawSlug.split("?");
  const searchParams = new URLSearchParams(queryString);
  const articleSlug = normalized.startsWith("article-") ? normalized.replace("article-", "") : null;
  const anchorTarget = normalized === "home" ? null : document.getElementById(normalized);
  const page = anchorTarget ? null : pages[normalized];
  const isHome = !articleSlug && (normalized === "home" || Boolean(anchorTarget) || !page);

  home.classList.toggle("active", isHome);
  pageView.classList.toggle("active", !isHome);
  pageView.innerHTML = "";

  if (articleSlug) {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderArticlePage(articleSlug);
  } else if (normalized === "health") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderHealthPage();
  } else if (normalized === "search") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderSearchPage(searchParams.get("q") || "");
  } else if (normalized === "courses") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderCoursesPage();
  } else if (!isHome) {
    pageView.innerHTML = `
      <div class="detail-hero">
        <div>
          <p class="eyebrow">${page.eyebrow}</p>
          <h1>${page.title}</h1>
          <p>${page.intro}</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">聯絡諮詢</a>
            <a class="secondary-button" href="#courses">查看課程</a>
          </div>
        </div>
        <aside class="detail-panel">
          <strong>此頁建議內容</strong>
          <ul>${page.focus.map((item) => `<li>${item}</li>`).join("")}</ul>
        </aside>
      </div>
      <div class="detail-content">
        ${page.features
          .map(
            (item, index) => `
              <article class="feature-tile">
                <span>${index + 1}</span>
                <h3>${item}</h3>
                <p>這裡可接續放入正式文案、照片、流程說明、FAQ 或後台資料串接。</p>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  document.querySelectorAll(".primary-nav a, .dropdown a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${normalized}`);
  });

  nav?.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
  groups.forEach((group) => group.classList.remove("open"));

  if (anchorTarget && normalized !== "home") {
    anchorTarget.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

window.setTimeout(() => {
  revealItems.forEach((item) => item.classList.add("in-view"));
}, 900);

menuToggle?.addEventListener("click", () => {
  const open = nav?.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(Boolean(open)));
});

groups.forEach((group) => {
  const trigger = group.querySelector(".nav-trigger");
  trigger.addEventListener("click", () => {
    const open = group.classList.toggle("open");
    trigger.setAttribute("aria-expanded", String(open));
  });
});

document.querySelectorAll(".location-pin").forEach((pin) => {
  pin.addEventListener("click", () => updateLocation(pin.dataset.location));
});

document.querySelectorAll("[data-location-tab]").forEach((tab) => {
  tab.addEventListener("click", () => updateLocation(tab.dataset.locationTab));
});

document.querySelectorAll("[data-news-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const key = tab.dataset.newsTab;
    document.querySelectorAll("[data-news-tab]").forEach((item) => item.classList.toggle("active", item === tab));
    document.querySelectorAll("[data-news-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.newsPanel === key);
    });
  });
});

document.addEventListener("click", (event) => {
  const card = event.target.closest(".click-card, .health-preview, .story-slider article, .celebrity-slider article");
  if (!card || event.target.closest("a, button, input, select, textarea")) return;
  const href = card.dataset.href || card.querySelector("a[href]")?.getAttribute("href");
  if (href) location.hash = href.replace(/^#/, "");
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(".click-card");
  if (!card || event.target.closest("a, button, input, select, textarea")) return;
  event.preventDefault();
  const href = card.dataset.href;
  if (href) location.hash = href.replace(/^#/, "");
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest(".health-search");
  if (!form) return;
  event.preventDefault();
  const formData = new FormData(form);
  const query = String(formData.get("q") || "").trim();
  location.hash = `search?q=${encodeURIComponent(query)}`;
});

const sceneImages = document.querySelectorAll(".scene-carousel img");
const sceneCopies = document.querySelectorAll(".scene-carousel .scene-copy");
if (sceneImages.length > 1) {
  let sceneIndex = 0;
  window.setInterval(() => {
    sceneImages[sceneIndex].classList.remove("active");
    sceneCopies[sceneIndex]?.classList.remove("active");
    sceneIndex = (sceneIndex + 1) % sceneImages.length;
    sceneImages[sceneIndex].classList.add("active");
    sceneCopies[sceneIndex]?.classList.add("active");
  }, 3600);
}

window.addEventListener("hashchange", () => renderPage(location.hash.slice(1)));
renderPage(location.hash.slice(1));
loadWordPressContent();

window.setTimeout(() => {
  introLoader?.remove();
}, 6200);

window.addEventListener("load", () => {
  window.setTimeout(() => {
    if (!location.hash || location.hash === "#home") {
      history.replaceState(null, "", "#home");
      renderPage("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    introLoader?.remove();
  }, 4850);
});
