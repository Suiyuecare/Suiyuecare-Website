-- Fixed service submenu templates.
-- These fields let admins update copy, images, cards, FAQ, and CTA without changing layout code.

with service_pages as (
  select *
  from jsonb_to_recordset('[
    {
      "page_slug": "about",
      "hero_eyebrow": "About Suiyuecare",
      "hero_title": "關於歲悅",
      "hero_body": "歲悅長照集團以「照顧就像去超商買牛奶一樣簡單」為服務想像，把長照諮詢、服務安排、品質追蹤與家庭溝通變成清楚可理解的流程。",
      "hero_image": "assets/homepage-batch/10-family-consultation.png",
      "hero_badge": "Suiyuecare Corps.",
      "hero_card_title": "把照顧變得親切、透明、可以被信任。",
      "feature_eyebrow": "Brand Belief",
      "feature_title": "我們相信的照顧",
      "feature_body": "歲悅不是只提供服務，而是協助家庭重新建立安心感。",
      "feature_cards": [
        {"title":"歲月安心","body":"讓家屬知道每一步有人接住，照顧者也不必孤軍奮戰。"},
        {"title":"悅享生活","body":"服務不只完成任務，也要保留長輩熟悉的生活節奏與尊嚴。"},
        {"title":"陪伴成長","body":"與家庭、照顧團隊與合作單位一起把照顧品質持續推進。"},
        {"title":"制度透明","body":"用紀錄、追蹤與回報讓照顧過程能被理解、被改善。"}
      ],
      "flow_title": "歲悅如何服務家庭",
      "flow_body": "從第一次諮詢到持續追蹤，每一步都以家庭可理解、可追蹤為原則。",
      "flow_cards": [
        {"step":"01","title":"理解需求","body":"先釐清長輩狀態、家庭期待與最需要被解決的照顧問題。"},
        {"step":"02","title":"安排服務","body":"依照需求媒合服務、課程、據點或合作資源。"},
        {"step":"03","title":"追蹤品質","body":"用紀錄、督導與回饋確認服務是否穩定。"},
        {"step":"04","title":"持續調整","body":"隨著身體狀況與家庭安排改變，服務也能跟著調整。"}
      ],
      "faq_title": "關於歲悅常見問題",
      "faq_items": [
        {"question":"歲悅提供哪些服務？","answer":"目前包含居家照顧、日間照顧、社區據點、護理復能、移工培訓與教育品管等服務。"},
        {"question":"第一次諮詢需要準備什麼？","answer":"可以先準備長輩目前身體狀況、居住地區、需要服務的時段與家庭最困擾的問題。"},
        {"question":"服務可以依家庭狀況調整嗎？","answer":"可以。歲悅會依照照顧目標、服務紀錄與家屬回饋持續調整。"}
      ],
      "cta_title": "想更認識歲悅嗎？",
      "cta_body": "留下需求，讓我們協助你找到適合家庭或合作單位的下一步。",
      "cta_button_text": "聯絡歲悅"
    },
    {
      "page_slug": "milestones",
      "hero_eyebrow": "Milestones",
      "hero_title": "大記事",
      "hero_body": "每一個階段，都是歲悅把照顧服務、團隊制度與區域資源逐步建立起來的紀錄。",
      "hero_image": "assets/homepage-batch/03-supervisor-care-plan.png",
      "hero_badge": "Our Journey",
      "hero_card_title": "一路把照顧服務做得更穩、更清楚。",
      "feature_eyebrow": "Growth Focus",
      "feature_title": "發展重點",
      "feature_body": "大記事可由後台持續更新，讓外部夥伴看見歲悅的發展節奏。",
      "feature_cards": [
        {"title":"服務拓展","body":"逐步建立北北桃照顧服務與合作網絡。"},
        {"title":"人才制度","body":"建立照顧服務員、督導與教學品管的訓練節奏。"},
        {"title":"品質追蹤","body":"把服務紀錄、家庭回饋與內部稽核納入日常。"},
        {"title":"品牌溝通","body":"用更親切的語言讓家庭理解長照服務。"}
      ],
      "flow_title": "發展歷程呈現方式",
      "flow_body": "後台可把年度重點拆成可閱讀的階段，前台維持一致視覺。",
      "flow_cards": [
        {"step":"01","title":"創立初心","body":"以家庭照顧痛點出發，建立清楚的長照入口。"},
        {"step":"02","title":"服務成形","body":"整合居家、日照、復能與據點資源。"},
        {"step":"03","title":"系統擴張","body":"逐步導入後台、內容管理與服務品質資料。"},
        {"step":"04","title":"區域合作","body":"與公部門、學校與產業夥伴建立合作。"}
      ],
      "faq_title": "大記事管理提醒",
      "faq_items": [
        {"question":"大記事可以放哪些內容？","answer":"可放服務成立、合作案、得標紀錄、據點進度、重要課程與品牌活動。"},
        {"question":"是否需要附照片？","answer":"建議每個重要階段都搭配照片或文件縮圖，讓閱讀更有信任感。"},
        {"question":"是否可以日後改成時間軸？","answer":"可以，資料先固定模板化，之後可再升級成專屬時間軸欄位。"}
      ],
      "cta_title": "和歲悅一起前進",
      "cta_body": "若你想了解合作、投資或人才加入機會，歡迎留下資訊。",
      "cta_button_text": "合作洽詢"
    },
    {
      "page_slug": "home-care",
      "hero_eyebrow": "Home Care",
      "hero_title": "居家照顧",
      "hero_body": "居家照顧是歲悅最靠近家庭的一線服務。我們進到長輩熟悉的家，把身體照顧、生活支持、家屬溝通與服務紀錄串成一套穩定流程。",
      "hero_image": "assets/homepage-batch/01-care-home-greeting.png",
      "hero_badge": "Suiyuecare Home Care",
      "hero_card_title": "把照顧帶進家裡，也把安心留在家裡。",
      "feature_eyebrow": "Care Focus",
      "feature_title": "居家照顧在做什麼",
      "feature_body": "不是單純派人到家，而是把照顧需求、服務紀錄、督導追蹤與家屬溝通串成穩定系統。",
      "feature_cards": [
        {"title":"到宅生活支持","body":"協助備餐、陪伴、環境整理與日常安全觀察。"},
        {"title":"身體照顧服務","body":"安排沐浴、如廁、移位、翻身、用餐與陪同外出。"},
        {"title":"督導品質追蹤","body":"督導定期回訪，確認服務內容、照顧風險與家屬回饋。"},
        {"title":"家屬即時回報","body":"透過照顧紀錄與異常提醒，讓家人掌握長輩狀況。"}
      ],
      "flow_title": "居家照顧流程",
      "flow_body": "從需求諮詢到服務追蹤，每一步都讓家庭知道下一步會發生什麼。",
      "flow_cards": [
        {"step":"01","title":"需求諮詢","body":"了解長輩生活能力、疾病狀態、家屬期待與照顧困擾。"},
        {"step":"02","title":"照顧評估","body":"整理服務目標、風險提醒、時段需求與照顧內容。"},
        {"step":"03","title":"人員媒合","body":"依照地區、時段、需求與個案特性安排照顧服務員。"},
        {"step":"04","title":"服務追蹤","body":"透過紀錄、督導與回訪持續調整。"}
      ],
      "faq_title": "居家照顧常見問題",
      "faq_items": [
        {"question":"可以只申請短時段服務嗎？","answer":"可以，會依照地區與人力安排評估適合時段。"},
        {"question":"家屬如何知道服務狀況？","answer":"服務會透過紀錄與督導追蹤，必要時主動回報異常。"},
        {"question":"照服員可以固定嗎？","answer":"會優先安排穩定人力，實際仍需依照服務區域與時段媒合。"}
      ],
      "cta_title": "需要居家照顧安排嗎？",
      "cta_body": "留下地區與需求，我們協助判斷適合的服務方式。",
      "cta_button_text": "預約居家諮詢"
    },
    {
      "page_slug": "day-care",
      "hero_eyebrow": "Day Care",
      "hero_title": "日間照顧",
      "hero_body": "日間照顧讓長輩白天有活動、有陪伴、有餐食與安全照護，晚上仍能回到熟悉的家，也讓家屬白天能安心工作。",
      "hero_image": "assets/homepage-batch/02-daycare-group-exercise.png",
      "hero_badge": "Suiyuecare Day Care",
      "hero_card_title": "白天被照顧，晚上回家生活。",
      "feature_eyebrow": "Day Rhythm",
      "feature_title": "日照中心的照顧節奏",
      "feature_body": "把活動、餐食、健康觀察與家屬回報安排成長輩每天能適應的節奏。",
      "feature_cards": [
        {"title":"生活作息","body":"協助長輩維持規律作息、用餐與休息。"},
        {"title":"健康促進","body":"安排活動、伸展、認知與社交互動。"},
        {"title":"餐食照顧","body":"依照長輩狀態觀察用餐、喝水與精神狀態。"},
        {"title":"家屬回報","body":"讓家屬知道白天活動與照顧重點。"}
      ],
      "flow_title": "日照使用流程",
      "flow_body": "從參觀、評估到試適應，讓家庭更安心地銜接。",
      "flow_cards": [
        {"step":"01","title":"預約參觀","body":"了解長輩需求與家庭期待。"},
        {"step":"02","title":"照顧評估","body":"確認身體狀態、餐食需求與活動適應。"},
        {"step":"03","title":"試適應","body":"觀察長輩對環境、同儕與作息的適應。"},
        {"step":"04","title":"穩定追蹤","body":"定期回報活動、餐食與健康觀察。"}
      ],
      "faq_title": "日間照顧常見問題",
      "faq_items": [
        {"question":"日照適合哪些長輩？","answer":"適合白天需要陪伴、活動、餐食與安全照護，晚上仍能返家的長輩。"},
        {"question":"可以先參觀嗎？","answer":"可以，建議先預約參觀並與專人討論長輩狀況。"},
        {"question":"家屬能知道每日狀況嗎？","answer":"可以透過日常紀錄與重要狀況回報掌握。"}
      ],
      "cta_title": "想了解日照名額與參觀？",
      "cta_body": "留下聯絡方式，我們協助安排參觀與需求評估。",
      "cta_button_text": "預約日照參觀"
    },
    {
      "page_slug": "community",
      "hero_eyebrow": "Community Care",
      "hero_title": "社區據點",
      "hero_body": "社區據點把健康促進、共餐、課程與陪伴帶進生活圈，讓長輩在熟悉社區中維持互動與活力。",
      "hero_image": "assets/homepage-batch/12-community-health-class.png",
      "hero_badge": "Community Hub",
      "hero_card_title": "在社區裡，讓照顧更靠近日常。",
      "feature_eyebrow": "Local Support",
      "feature_title": "據點服務重點",
      "feature_body": "以社區為半徑，建立長輩可以常態參與、家庭可以放心的支持網。",
      "feature_cards": [
        {"title":"健康促進","body":"安排伸展、肌力、認知與健康講座。"},
        {"title":"共餐陪伴","body":"用餐與互動讓長輩維持生活連結。"},
        {"title":"社區課程","body":"依照地方需求安排活動與衛教。"},
        {"title":"資源轉介","body":"發現照顧需求時協助連結居家、日照或復能服務。"}
      ],
      "flow_title": "據點參與流程",
      "flow_body": "讓長輩從認識據點到固定參與，逐步建立穩定關係。",
      "flow_cards": [
        {"step":"01","title":"認識據點","body":"了解開放時段、活動內容與參與方式。"},
        {"step":"02","title":"初步評估","body":"確認長輩活動能力與需要注意的安全事項。"},
        {"step":"03","title":"安排活動","body":"依照興趣與能力安排適合課程。"},
        {"step":"04","title":"持續關懷","body":"觀察參與狀況並協助轉介其他資源。"}
      ],
      "faq_title": "社區據點常見問題",
      "faq_items": [
        {"question":"社區據點是日照中心嗎？","answer":"不是。據點以社區活動、健康促進與陪伴為主，日照則有更完整日間照顧安排。"},
        {"question":"需要事先報名嗎？","answer":"部分活動需要報名，建議先聯絡確認名額。"},
        {"question":"可以協助轉介服務嗎？","answer":"可以，若發現長輩有更高照顧需求，可協助連結服務。"}
      ],
      "cta_title": "想加入社區據點活動？",
      "cta_body": "告訴我們所在區域，協助你找到適合據點或活動。",
      "cta_button_text": "詢問據點活動"
    },
    {
      "page_slug": "nursing",
      "hero_eyebrow": "Nursing & Reablement",
      "hero_title": "護理復能",
      "hero_body": "護理復能以專業評估、功能訓練與照顧建議，協助長輩在安全範圍內維持能力、重建生活信心。",
      "hero_image": "assets/homepage-batch/13-rehab-walking-practice.png",
      "hero_badge": "Reablement",
      "hero_card_title": "復能不是催促，而是陪長輩一步一步重新有把握。",
      "feature_eyebrow": "Reablement Focus",
      "feature_title": "護理復能服務重點",
      "feature_body": "以安全、能力維持與家庭可操作為核心，讓復能訓練走進日常。",
      "feature_cards": [
        {"title":"專業評估","body":"確認身體狀態、風險、功能能力與復能目標。"},
        {"title":"功能訓練","body":"安排移位、步行、肌力與日常活動訓練。"},
        {"title":"照顧建議","body":"提供家庭可執行的照顧與環境調整建議。"},
        {"title":"進度追蹤","body":"持續觀察復能成效與照顧風險。"}
      ],
      "flow_title": "護理復能流程",
      "flow_body": "先確認安全與目標，再把訓練拆成家庭能配合的日常步驟。",
      "flow_cards": [
        {"step":"01","title":"初步諮詢","body":"了解病史、生活能力與目前照顧困難。"},
        {"step":"02","title":"專業評估","body":"評估風險、功能與適合訓練內容。"},
        {"step":"03","title":"復能計畫","body":"設定可執行目標與訓練方式。"},
        {"step":"04","title":"追蹤調整","body":"依照進步幅度與家庭回饋修正。"}
      ],
      "faq_title": "護理復能常見問題",
      "faq_items": [
        {"question":"復能和復健一樣嗎？","answer":"復能更強調生活功能與日常可執行的能力維持，仍需依專業評估安排。"},
        {"question":"家屬需要一起學嗎？","answer":"建議家屬理解基本照顧技巧，能讓日常更穩定。"},
        {"question":"多久會看到效果？","answer":"依長輩狀態、訓練頻率與家庭配合度而定。"}
      ],
      "cta_title": "想評估護理復能需求？",
      "cta_body": "留下長輩目前狀態，我們協助判斷適合的服務方式。",
      "cta_button_text": "預約復能諮詢"
    },
    {
      "page_slug": "migrant-training",
      "hero_eyebrow": "Migrant Care Training",
      "hero_title": "移工培訓",
      "hero_body": "移工培訓協助家庭把照顧方式說清楚、教得會、做得到，讓移工、長輩與家屬之間有共同語言。",
      "hero_image": "assets/migrant-recruit-01-classroom.png",
      "hero_badge": "Training",
      "hero_card_title": "把照顧方法教清楚，家庭就能更安心。",
      "feature_eyebrow": "Training Focus",
      "feature_title": "移工培訓重點",
      "feature_body": "從基礎照顧技巧到家庭溝通，讓照顧現場更安全、更穩定。",
      "feature_cards": [
        {"title":"基礎照顧技巧","body":"移位、翻身、沐浴、用餐與安全觀念。"},
        {"title":"疾病與風險提醒","body":"認識常見照顧風險與異常回報方式。"},
        {"title":"家庭溝通","body":"建立日常回報、交班與問題反應流程。"},
        {"title":"實作演練","body":"用情境演練協助把技能帶回家庭。"}
      ],
      "flow_title": "培訓流程",
      "flow_body": "先理解家庭需求，再安排可操作、可回家落地的課程。",
      "flow_cards": [
        {"step":"01","title":"需求盤點","body":"了解長輩狀況、移工經驗與家庭期待。"},
        {"step":"02","title":"課程安排","body":"依照照顧任務設計訓練重點。"},
        {"step":"03","title":"情境演練","body":"透過操作與回饋確認學會。"},
        {"step":"04","title":"後續追蹤","body":"協助家庭修正溝通與照顧流程。"}
      ],
      "faq_title": "移工培訓常見問題",
      "faq_items": [
        {"question":"可以客製家庭情境嗎？","answer":"可以，建議先提供長輩狀況與目前照顧困難。"},
        {"question":"課程是中文嗎？","answer":"可依課程需求安排適合的說明方式與輔助教材。"},
        {"question":"家屬可以一起上嗎？","answer":"建議家屬一起了解，後續家庭溝通會更順。"}
      ],
      "cta_title": "想安排移工照顧訓練？",
      "cta_body": "留下家庭照顧情境，我們協助規劃合適課程。",
      "cta_button_text": "詢問培訓課程"
    },
    {
      "page_slug": "quality",
      "hero_eyebrow": "Education & Quality",
      "hero_title": "教育品管",
      "hero_body": "教育品管是歲悅照顧服務能穩定擴張的基礎，透過課程、督導、紀錄與稽核，把好的照顧變成團隊能共同執行的標準。",
      "hero_image": "assets/quality-recruit-04-quality-meeting.png",
      "hero_badge": "Quality System",
      "hero_card_title": "把專業變成團隊每天做得到的標準。",
      "feature_eyebrow": "Quality Focus",
      "feature_title": "教育品管重點",
      "feature_body": "用訓練與追蹤把照顧品質內建進服務流程，而不是事後補救。",
      "feature_cards": [
        {"title":"新人訓練","body":"建立照顧安全、服務紀錄與品牌溝通基礎。"},
        {"title":"督導支持","body":"協助一線人員處理照顧難題與家庭溝通。"},
        {"title":"紀錄稽核","body":"檢視服務紀錄、異常回報與改善行動。"},
        {"title":"持續改善","body":"把回饋轉成課程、制度與服務流程優化。"}
      ],
      "flow_title": "品管運作流程",
      "flow_body": "從教育訓練到服務現場，持續讓團隊知道標準、做得到、能改善。",
      "flow_cards": [
        {"step":"01","title":"制定標準","body":"整理服務流程、紀錄規範與照顧安全重點。"},
        {"step":"02","title":"教育訓練","body":"讓團隊理解並演練標準。"},
        {"step":"03","title":"現場追蹤","body":"透過督導與紀錄確認執行狀態。"},
        {"step":"04","title":"回饋改善","body":"將異常與回饋轉成改善方案。"}
      ],
      "faq_title": "教育品管常見問題",
      "faq_items": [
        {"question":"品管會影響一線服務嗎？","answer":"會，而且是正向影響。品管讓服務更穩定，也讓人員知道如何處理狀況。"},
        {"question":"會不會只是做文件？","answer":"不只文件，重點是把紀錄、督導與訓練連回現場改善。"},
        {"question":"可與外部單位合作課程嗎？","answer":"可以，歡迎學校、機構或企業洽談課程與品管合作。"}
      ],
      "cta_title": "想了解教育品管合作？",
      "cta_body": "告訴我們合作需求，歲悅可協助規劃課程、訓練與品管制度。",
      "cta_button_text": "洽談教育品管"
    }
  ]'::jsonb) as page_data(
    page_slug text,
    hero_eyebrow text,
    hero_title text,
    hero_body text,
    hero_image text,
    hero_badge text,
    hero_card_title text,
    feature_eyebrow text,
    feature_title text,
    feature_body text,
    feature_cards jsonb,
    flow_title text,
    flow_body text,
    flow_cards jsonb,
    faq_title text,
    faq_items jsonb,
    cta_title text,
    cta_body text,
    cta_button_text text
  )
),
service_fields as (
  select page_slug, 'service_page' as template_key, 'hero_eyebrow' as field_key, 'Hero 小標' as field_label, 'text' as field_type, hero_eyebrow as text_value, '{}'::jsonb as json_value, 10 as sort_order, '服務頁 Hero 英文或短標。' as help_text from service_pages
  union all select page_slug, 'service_page', 'hero_title', 'Hero 標題', 'text', hero_title, '{}'::jsonb, 20, '服務頁主標題。' from service_pages
  union all select page_slug, 'service_page', 'hero_body', 'Hero 內文', 'textarea', hero_body, '{}'::jsonb, 30, '建議 80-160 字，避免太長造成 Hero 擁擠。' from service_pages
  union all select page_slug, 'service_page', 'hero_image', 'Hero 圖片', 'image', hero_image, '{}'::jsonb, 40, '上傳時請裁切為服務頁 Hero 安全比例。' from service_pages
  union all select page_slug, 'service_page', 'hero_badge', 'Hero 圖片小標', 'text', hero_badge, '{}'::jsonb, 50, '圖片上方的小型英文標。' from service_pages
  union all select page_slug, 'service_page', 'hero_card_title', 'Hero 圖片標語', 'text', hero_card_title, '{}'::jsonb, 60, '圖片上方覆蓋的大字標語。' from service_pages
  union all select page_slug, 'service_page', 'primary_cta_text', '主要按鈕文字', 'text', '預約諮詢', '{}'::jsonb, 70, 'Hero 主要 CTA。' from service_pages
  union all select page_slug, 'service_page', 'primary_cta_url', '主要按鈕連結', 'url', '#contact', '{}'::jsonb, 80, '可填 #contact 或完整網址。' from service_pages
  union all select page_slug, 'service_page', 'secondary_cta_text', '次要按鈕文字', 'text', '查看服務據點', '{}'::jsonb, 90, 'Hero 次要 CTA。' from service_pages
  union all select page_slug, 'service_page', 'secondary_cta_url', '次要按鈕連結', 'url', '#network', '{}'::jsonb, 100, '可填 #network、#courses 或其他錨點。' from service_pages
  union all select page_slug, 'service_page', 'feature_eyebrow', '特色區小標', 'text', feature_eyebrow, '{}'::jsonb, 110, '特色區英文或短標。' from service_pages
  union all select page_slug, 'service_page', 'feature_title', '特色區標題', 'text', feature_title, '{}'::jsonb, 120, '特色區主標。' from service_pages
  union all select page_slug, 'service_page', 'feature_body', '特色區說明', 'textarea', feature_body, '{}'::jsonb, 130, '特色區右側說明文字。' from service_pages
  union all select page_slug, 'service_page', 'feature_cards', '特色卡片', 'json', null, feature_cards, 140, 'JSON 陣列，每筆包含 title、body。' from service_pages
  union all select page_slug, 'service_page', 'flow_eyebrow', '流程區小標', 'text', 'Service Flow', '{}'::jsonb, 150, '流程區英文或短標。' from service_pages
  union all select page_slug, 'service_page', 'flow_title', '流程區標題', 'text', flow_title, '{}'::jsonb, 160, '流程區主標。' from service_pages
  union all select page_slug, 'service_page', 'flow_body', '流程區說明', 'textarea', flow_body, '{}'::jsonb, 170, '流程區右側說明文字。' from service_pages
  union all select page_slug, 'service_page', 'flow_cards', '流程卡片', 'json', null, flow_cards, 180, 'JSON 陣列，每筆包含 step、title、body。' from service_pages
  union all select page_slug, 'service_page', 'faq_eyebrow', 'FAQ 小標', 'text', 'FAQ', '{}'::jsonb, 190, 'FAQ 區小標。' from service_pages
  union all select page_slug, 'service_page', 'faq_title', 'FAQ 標題', 'text', faq_title, '{}'::jsonb, 200, 'FAQ 區主標。' from service_pages
  union all select page_slug, 'service_page', 'faq_body', 'FAQ 說明', 'textarea', '常見問題可由後台持續調整，前台會維持一致版型。', '{}'::jsonb, 210, 'FAQ 區右側說明文字。' from service_pages
  union all select page_slug, 'service_page', 'faq_items', 'FAQ 問答', 'json', null, faq_items, 220, 'JSON 陣列，每筆包含 question、answer。' from service_pages
  union all select page_slug, 'service_page', 'cta_eyebrow', 'CTA 小標', 'text', 'Contact', '{}'::jsonb, 230, '底部 CTA 小標。' from service_pages
  union all select page_slug, 'service_page', 'cta_title', 'CTA 標題', 'text', cta_title, '{}'::jsonb, 240, '底部 CTA 主標。' from service_pages
  union all select page_slug, 'service_page', 'cta_body', 'CTA 內文', 'textarea', cta_body, '{}'::jsonb, 250, '底部 CTA 說明。' from service_pages
  union all select page_slug, 'service_page', 'cta_button_text', 'CTA 按鈕文字', 'text', cta_button_text, '{}'::jsonb, 260, '底部 CTA 按鈕。' from service_pages
  union all select page_slug, 'service_page', 'cta_button_url', 'CTA 按鈕連結', 'url', '#contact', '{}'::jsonb, 270, '底部 CTA 連結。' from service_pages
)
insert into public.page_template_fields (
  page_slug, template_key, field_key, field_label, field_type, text_value, json_value, sort_order, help_text
)
select page_slug, template_key, field_key, field_label, field_type, text_value, json_value, sort_order, help_text
from service_fields
on conflict (page_slug, template_key, field_key) do nothing;
