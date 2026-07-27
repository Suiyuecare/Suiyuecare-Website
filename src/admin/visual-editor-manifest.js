export const VISUAL_EDITOR_MANIFEST_VERSION = 2;

const serviceSections = [
  {
    id: "hero",
    label: "首圖與主標題",
    description: "頁面最上方的標題、說明、圖片與主要按鈕。",
    selector: ".one-minute-service-hero, .service-detail-hero",
    fieldKeys: [
      "hero_eyebrow", "hero_title", "hero_body", "hero_image",
      "primary_cta_text", "primary_cta_url", "secondary_cta_text", "secondary_cta_url"
    ]
  },
  {
    id: "summary",
    label: "三個快速重點",
    description: "家屬快速了解適用情境、可獲得的協助與申請方式。",
    selector: ".one-minute-service-summary, .service-highlight-grid",
    fieldKeys: ["pain_points", "service_items", "flow_cards", "feature_cards"]
  },
  {
    id: "scenes",
    label: "實際照顧畫面",
    description: "以圖片和短文呈現服務現場。",
    selector: ".two-minute-scenes, .homecare-gallery",
    fieldKeys: ["scene_cards"]
  },
  {
    id: "stories",
    label: "使用者心得",
    description: "目前由照顧故事資料與前台版型產生。",
    selector: ".service-story-section",
    locked: true,
    lockedReason: "使用者心得沿用文章／故事管理，避免在兩個地方改到不同版本。"
  },
  {
    id: "pricing",
    label: "費用表",
    description: "身份類別、CMS 等級、碼別與費用。",
    selector: ".service-fee-section",
    locked: true,
    lockedReason: "費用表由政府給付碼與共用計算模組產生，為避免算錯目前鎖定。"
  },
  {
    id: "locations",
    label: "地點分佈",
    description: "服務範圍、據點地址與地圖。",
    selector: ".service-location-section",
    locked: true,
    lockedReason: "地圖與地址目前由據點資料模組維護。"
  },
  {
    id: "before-apply",
    label: "申請服務須知",
    description: "申請前要準備的資訊與服務流程。",
    selector: ".service-notes-section, .day-care-start-section",
    fieldKeys: ["enrollment_eyebrow", "enrollment_title", "enrollment_body", "enrollment_items"]
  },
  {
    id: "contact",
    label: "申請與諮詢表單",
    description: "頁尾的聯絡表單與主要行動按鈕。",
    selector: ".service-contact-section, .service-cta-panel",
    fieldKeys: ["cta_eyebrow", "cta_title", "cta_body", "cta_button_text", "cta_button_url"]
  }
];

const servicePageNames = {
  "home-care": "居家照顧",
  "day-care": "日間照顧",
  community: "社區據點",
  nursing: "護理復能",
  "migrant-training": "移工培訓",
  quality: "教育品管",
  software: "長照軟體"
};

const serviceLockedFieldKeys = [
  "hero_badge", "hero_card_title", "hero_points", "family_board",
  "feature_eyebrow", "feature_title", "feature_body",
  "flow_eyebrow", "flow_title", "flow_body",
  "faq_eyebrow", "faq_title", "faq_body", "faq_items",
  "scenario_cards", "quality_cards"
];

function sectionsForServicePage(slug) {
  if (slug !== "day-care") return serviceSections;
  return serviceSections.flatMap((section) => {
    if (section.id === "summary") {
      return [{
        ...section,
        label: "兩個快速重點",
        description: "家屬快速了解目前情境與日照中心能提供的協助。",
        fieldKeys: section.fieldKeys.filter((key) => key !== "flow_cards")
      }];
    }
    if (section.id === "before-apply") {
      return [
        {
          ...section,
          label: "入托準備清單",
          description: "正式入托前的準備事項與用品清單。"
        },
        {
          id: "application-journey",
          label: "如何申請服務",
          description: "入托準備清單下方的橫向申請流程。",
          selector: "[data-day-care-application-journey-host]",
          fieldKeys: ["flow_eyebrow", "flow_title", "flow_body", "flow_cards"]
        }
      ];
    }
    return [section];
  });
}

const servicePages = Object.fromEntries(Object.entries(servicePageNames).map(([slug, title]) => [slug, {
  slug,
  title,
  group: "照顧與服務",
  scopeKey: `service:${slug}`,
  sourceType: "template-fields",
  previewPath: `/${slug}`,
  manifestVersion: VISUAL_EDITOR_MANIFEST_VERSION,
  lockedFieldKeys: slug === "day-care"
    ? serviceLockedFieldKeys.filter((key) => !["flow_eyebrow", "flow_title", "flow_body"].includes(key))
    : serviceLockedFieldKeys,
  lockedFieldReason: "這些是舊版版型欄位；目前前台沒有顯示，保留資料但不讓一般人員誤改。",
  sections: sectionsForServicePage(slug)
}]));

const aboutLockedFieldKeys = [
  "hero_badge", "hero_card_title",
  "feature_eyebrow", "feature_title", "feature_body", "feature_cards",
  "flow_eyebrow", "flow_title", "flow_body", "flow_cards",
  "faq_eyebrow", "faq_title", "faq_body", "faq_items"
];

const milestoneLockedFieldKeys = [
  "hero_badge", "hero_card_title",
  "feature_eyebrow", "feature_title", "feature_body", "feature_cards",
  "flow_eyebrow", "flow_title", "flow_body", "flow_cards",
  "faq_eyebrow", "faq_title", "faq_body", "faq_items",
  "cta_eyebrow", "cta_title", "cta_body", "cta_button_text", "cta_button_url"
];

function managedSection(id, label, selector, lockedReason, managerHref, managerLabel) {
  return { id, label, selector, locked: true, lockedReason, managerHref, managerLabel };
}

function managedPage({ slug, title, group, scopeKey, previewPath, managerHref, managerLabel, sections }) {
  return {
    slug,
    title,
    group,
    scopeKey,
    sourceType: "external-manager",
    previewPath,
    manifestVersion: VISUAL_EDITOR_MANIFEST_VERSION,
    readOnly: true,
    managerHref,
    managerLabel,
    sections
  };
}

function partnershipPage(slug, title, heroSelector) {
  return {
    slug,
    title,
    group: "招募與合作",
    scopeKey: "recruiting:partnership",
    sourceType: "recruiting",
    previewPath: `/${slug}`,
    manifestVersion: VISUAL_EDITOR_MANIFEST_VERSION,
    sections: [
      { id: "hero", label: "首圖與合作主張", selector: heroSelector, recordTypes: ["page"] },
      { id: "overview", label: "合作方向與說明", selector: ".recruiting-cms-opportunities .service-section-head", recordTypes: ["departments"] },
      {
        id: "opportunities",
        label: "合作方案卡片",
        selector: ".recruiting-cms-opportunities .recruiting-opening-grid",
        recordTypes: ["openings"],
        openingSlugs: slug === "land" ? ["daycare-site"] : undefined
      }
    ]
  };
}

export const visualEditorPages = Object.freeze({
  home: {
    slug: "home",
    title: "首頁",
    group: "品牌與網站",
    scopeKey: "page:home",
    sourceType: "content-modules",
    previewPath: "/",
    manifestVersion: VISUAL_EDITOR_MANIFEST_VERSION,
    sections: [
      { id: "hero", label: "首圖與主標題", selector: '#home [data-cms-section="hero"]', moduleKeys: ["hero"] },
      { id: "updates", label: "最新消息、成果與徵才", selector: '#home [data-cms-section="updates"]', moduleKeys: ["section_setting", "news", "awards", "recruit"] },
      { id: "care-system", label: "照顧服務系統", selector: '#home [data-cms-section="care-system"]', moduleKeys: ["section_setting"] },
      { id: "service-scene", label: "照顧現場", selector: '#home [data-cms-section="service-scene"]', moduleKeys: ["section_setting"] },
      { id: "video", label: "單位影片", selector: '#home [data-cms-section="video"]', moduleKeys: ["section_setting", "video"] },
      { id: "network", label: "服務地點", selector: '#home [data-cms-section="network"]', moduleKeys: ["section_setting", "location"] },
      { id: "services", label: "服務項目", selector: '#home [data-cms-section="services"]', moduleKeys: ["section_setting", "service_item"] },
      { id: "care-stories", label: "家屬回饋", selector: '#home [data-cms-section="care-stories"]', moduleKeys: ["section_setting", "care_story"] },
      { id: "home-health", label: "健康內容", selector: '#home [data-cms-section="home-health"]', moduleKeys: ["section_setting"] },
      { id: "master-talk", label: "名人講堂", selector: ".celebrity-head", moduleKeys: ["section_setting", "master_talk"] },
      { id: "partners", label: "合作單位", selector: ".partners-strip", moduleKeys: ["section_setting", "partner"] },
      { id: "contact", label: "聯絡表單標題", selector: '#home [data-cms-section="contact"]', moduleKeys: ["section_setting"] }
    ]
  },
  about: {
    slug: "about",
    title: "關於歲悅",
    group: "品牌與網站",
    scopeKey: "page:about",
    sourceType: "template-fields",
    previewPath: "/about",
    manifestVersion: VISUAL_EDITOR_MANIFEST_VERSION,
    lockedFieldKeys: aboutLockedFieldKeys,
    lockedFieldReason: "品牌故事、服務總覽與團隊內容目前採固定版型，待內容欄位完成結構化後再開放。",
    sections: [
      {
        id: "hero",
        label: "首圖與主標題",
        selector: ".about-full-hero",
        fieldKeys: [
          "hero_eyebrow", "hero_title", "hero_body", "hero_image",
          "primary_cta_text", "primary_cta_url", "secondary_cta_text", "secondary_cta_url"
        ]
      },
      managedSection("services", "服務總覽", "#about-services", "服務總覽目前和六項服務頁連動，待結構化後再開放編輯。"),
      managedSection("vision", "組織願景", "#about-vision", "組織願景目前為品牌固定內容。"),
      managedSection("mission", "組織使命", "#about-mission", "組織使命目前為品牌固定內容。"),
      managedSection("culture", "團隊文化", "#about-culture", "團隊文化目前為品牌固定內容。"),
      managedSection("team", "團隊成員", "#about-team", "團隊角色卡目前為固定內容。"),
      {
        id: "contact",
        label: "頁尾聯絡邀請",
        selector: ".about-cta-panel",
        fieldKeys: ["cta_eyebrow", "cta_title", "cta_body", "cta_button_text", "cta_button_url"]
      }
    ]
  },
  milestones: {
    slug: "milestones",
    title: "品牌大事記",
    group: "品牌與網站",
    scopeKey: "brand",
    sourceType: "template-fields",
    previewPath: "/milestones",
    manifestVersion: VISUAL_EDITOR_MANIFEST_VERSION,
    lockedFieldKeys: milestoneLockedFieldKeys,
    lockedFieldReason: "時間軸卡片由大事記管理器維護；其他舊欄位目前沒有顯示在前台。",
    sections: [
      {
        id: "hero",
        label: "首圖與主標題",
        selector: ".milestones-full-hero",
        fieldKeys: [
          "hero_eyebrow", "hero_title", "hero_body", "hero_image",
          "primary_cta_text", "primary_cta_url", "secondary_cta_text", "secondary_cta_url"
        ]
      },
      managedSection("stats", "歷程摘要數字", ".milestone-stats", "摘要會依已發布的大事記自動整理。", "/admin/milestones/", "管理大事記"),
      managedSection("timeline", "發展時間軸", "#milestone-timeline", "每一張里程碑卡片由大事記管理器新增、排序與送審。", "/admin/milestones/", "管理大事記"),
      managedSection("next", "下一階段邀請", ".milestone-next", "下一階段邀請目前為品牌固定內容。")
    ]
  },
  ...servicePages,
  "day-care": {
    ...servicePages["day-care"],
    sections: serviceSections.filter((section) => section.id !== "stories")
  },
  talent: {
    slug: "talent",
    title: "人才招募",
    group: "招募與合作",
    scopeKey: "recruiting:talent",
    sourceType: "recruiting",
    previewPath: "/talent",
    manifestVersion: VISUAL_EDITOR_MANIFEST_VERSION,
    sections: [
      { id: "hero", label: "招募首圖與主標題", selector: ".talent-recruit-hero", recordTypes: ["page"] },
      { id: "openings", label: "職位一覽", selector: "#career-openings", recordTypes: ["openings"] },
      { id: "benefits", label: "公司福利制度", selector: "#talent-panel-benefits", locked: true, lockedReason: "福利探險頁目前採前台固定版型，待下一階段接入專用福利管理器。" },
      { id: "growth", label: "公司升遷發展", selector: "#talent-panel-career-growth", locked: true, lockedReason: "升遷內容目前為系統固定內容。" },
      { id: "organization", label: "公司組織圖", selector: "#talent-panel-organization", recordTypes: ["departments"] },
      { id: "mission", label: "部門使命", selector: "#talent-panel-department-mission", recordTypes: ["departments"] }
    ]
  },
  land: partnershipPage("land", "土地招募", ".land-recruit-hero"),
  "investor-recruiting": partnershipPage("investor-recruiting", "投資人招募", ".investor-recruit-hero"),
  courses: managedPage({
    slug: "courses",
    title: "課程專區",
    group: "內容與課程",
    scopeKey: "courses",
    previewPath: "/courses",
    managerHref: "/admin/courses/",
    managerLabel: "管理課程",
    sections: [
      managedSection("hero", "課程搜尋與主視覺", ".courses-hero", "課程主視覺會依已發布課程自動整理。", "/admin/courses/", "管理課程"),
      managedSection("featured", "精選課程", ".featured-course-track", "精選內容由課程狀態與排序產生。", "/admin/courses/", "管理課程"),
      managedSection("list", "全部課程", ".course-list", "課程卡片、日期、名額與報名狀態由課程管理器維護。", "/admin/courses/", "管理課程")
    ]
  }),
  health: managedPage({
    slug: "health",
    title: "健康 3.0",
    group: "內容與課程",
    scopeKey: "health",
    previewPath: "/health",
    managerHref: "/admin/articles/",
    managerLabel: "管理文章",
    sections: [
      managedSection("hero", "文章搜尋與分類", ".health-hero", "分類由文章分類管理與已發布文章自動產生。", "/admin/articles/", "管理文章"),
      managedSection("featured", "本週精選與熱門文章", ".health-board", "文章排序、封面與摘要由文章管理器維護。", "/admin/articles/", "管理文章"),
      managedSection("latest", "最新照顧文章", ".health-latest", "文章列表由發布時間與分類自動整理。", "/admin/articles/", "管理文章")
    ]
  }),
  investors: managedPage({
    slug: "investors",
    title: "投資人專區",
    group: "投資人專區",
    scopeKey: "investor",
    previewPath: "/investors",
    managerHref: "/admin/investor-data/",
    managerLabel: "管理投資人資料",
    sections: [
      managedSection("hero", "投資人首頁", ".investor-hero", "頁面文案、公告與數據由投資人資料管理器統一維護。", "/admin/investor-data/", "管理投資人資料"),
      managedSection("overview", "營運摘要與最新動態", ".investor-panel, .ir-kpi-strip", "此區由投資人公告、數據與圖表資料產生。", "/admin/investor-data/", "管理投資人資料")
    ]
  }),
  "ir-finance": managedPage({
    slug: "ir-finance",
    title: "財務資訊",
    group: "投資人專區",
    scopeKey: "investor",
    previewPath: "/ir-finance",
    managerHref: "/admin/investor-data/",
    managerLabel: "管理財務資料",
    sections: [
      managedSection("hero", "財務資訊頁首", ".finance-visual", "頁首數字與文案由投資人資料管理器維護。", "/admin/investor-data/", "管理財務資料"),
      managedSection("data", "營收、圖表與報告", ".ir-finance-tabs, .ir-tab-panel", "營收資料、圖表與下載文件由投資人資料管理器維護。", "/admin/investor-data/", "管理財務資料")
    ]
  }),
  "ir-governance": managedPage({
    slug: "ir-governance",
    title: "公司治理",
    group: "投資人專區",
    scopeKey: "investor",
    previewPath: "/ir-governance",
    managerHref: "/admin/investor-data/",
    managerLabel: "管理治理資料",
    sections: [
      managedSection("hero", "公司治理頁首", ".governance-visual", "治理摘要由投資人資料管理器維護。", "/admin/investor-data/", "管理治理資料"),
      managedSection("data", "公告、制度與下載", ".governance-tabs, .ir-tab-panel", "治理公告、圖表與文件由投資人資料管理器維護。", "/admin/investor-data/", "管理治理資料")
    ]
  }),
  "ir-shareholders": managedPage({
    slug: "ir-shareholders",
    title: "股東專區",
    group: "投資人專區",
    scopeKey: "investor",
    previewPath: "/ir-shareholders",
    managerHref: "/admin/investor-data/",
    managerLabel: "管理股東資料",
    sections: [
      managedSection("hero", "股東專區頁首", ".shareholders-visual", "股務摘要與窗口資料由投資人資料管理器維護。", "/admin/investor-data/", "管理股東資料"),
      managedSection("data", "股務、股東會與法說會", ".shareholder-tabs, .ir-tab-panel", "股東文件、公告與常見問答由投資人資料管理器維護。", "/admin/investor-data/", "管理股東資料")
    ]
  }),
  contact: managedPage({
    slug: "contact",
    title: "聯絡我們",
    group: "品牌與網站",
    scopeKey: "page:contact",
    previewPath: "/contact",
    managerHref: "/admin/forms/",
    managerLabel: "查看聯絡案件",
    sections: [
      managedSection("contact", "聯絡表單", "#contact", "表單欄位由全站共用元件管理；送出的案件可在表單管理查看。", "/admin/forms/", "查看聯絡案件")
    ]
  }),
  search: managedPage({
    slug: "search",
    title: "搜尋結果（系統頁）",
    group: "系統頁面",
    scopeKey: "health",
    previewPath: "/search?q=照顧",
    managerHref: "/admin/articles/",
    managerLabel: "管理可搜尋文章",
    sections: [
      managedSection("search", "搜尋列與結果", ".search-page", "搜尋頁會依文章與網站內容自動產生，不需單獨編輯。", "/admin/articles/", "管理可搜尋文章")
    ]
  })
});

export const structuredFieldSchemas = Object.freeze({
  feature_cards: {
    singular: "特色卡",
    fields: [
      { key: "label", label: "小標" },
      { key: "title", label: "標題" },
      { key: "body", label: "內容", multiline: true }
    ]
  },
  pain_points: {
    singular: "適用情境",
    fields: [
      { key: "title", label: "標題" },
      { key: "body", label: "說明", multiline: true }
    ]
  },
  service_items: {
    singular: "服務內容",
    fields: [
      { key: "title", label: "標題" },
      { key: "body", label: "內容", multiline: true },
      { key: "fit", label: "適合對象／備註", multiline: true }
    ]
  },
  flow_cards: {
    singular: "流程步驟",
    fields: [
      { key: "step", label: "步驟" },
      { key: "title", label: "標題" },
      { key: "body", label: "內容", multiline: true }
    ]
  },
  scene_cards: {
    singular: "照顧畫面",
    fields: [
      { key: "image", label: "圖片網址" },
      { key: "title", label: "標題" },
      { key: "body", label: "內容", multiline: true },
      { key: "focal_point", label: "圖片焦點" }
    ]
  },
  enrollment_items: {
    singular: "準備項目",
    fields: [
      { key: "title", label: "項目" },
      { key: "text", label: "說明", multiline: true }
    ]
  },
  faq_items: {
    singular: "常見問題",
    fields: [
      { key: "question", label: "問題" },
      { key: "answer", label: "回答", multiline: true }
    ]
  }
});

export const servicePreviewFields = Object.freeze({
  hero_eyebrow: { selector: ".one-minute-service-hero .service-detail-copy .eyebrow, .service-detail-hero .service-detail-copy .eyebrow", property: "text" },
  hero_title: { selector: ".one-minute-service-hero .service-detail-copy h1, .service-detail-hero .service-detail-copy h1", property: "text" },
  hero_body: { selector: ".one-minute-service-hero .service-detail-copy > p:not(.eyebrow):not(.hero-slogan), .service-detail-hero .service-detail-copy > p:not(.eyebrow):not(.hero-slogan)", property: "text" },
  hero_image: { selector: ".one-minute-service-hero .hero-bg, .service-detail-hero .hero-bg", property: "backgroundImage" },
  primary_cta_text: { selector: ".one-minute-service-actions .primary-button, .hero-actions .primary-button", property: "text" },
  primary_cta_url: { selector: ".one-minute-service-actions .primary-button, .hero-actions .primary-button", property: "href" },
  secondary_cta_text: { selector: ".one-minute-service-actions .ghost-button, .hero-actions .secondary-button", property: "text" },
  secondary_cta_url: { selector: ".one-minute-service-actions .ghost-button, .hero-actions .secondary-button", property: "href" },
  cta_eyebrow: { selector: ".service-contact-section .eyebrow, .service-cta-panel .eyebrow", property: "text" },
  cta_title: { selector: ".service-contact-section h2, .service-cta-panel h2", property: "text" },
  cta_body: { selector: ".service-contact-section > div > p:not(.eyebrow), .service-cta-panel p:not(.eyebrow)", property: "text" },
  cta_button_text: { selector: ".service-contact-section button[type='submit'], .service-cta-panel .primary-button", property: "text" },
  cta_button_url: { selector: ".service-cta-panel .primary-button", property: "href" },
  enrollment_eyebrow: { selector: ".day-care-start-section .service-section-head .eyebrow, .service-notes-section .service-section-head .eyebrow", property: "text" },
  enrollment_title: { selector: ".day-care-start-section .service-section-head h2, .service-notes-section .service-section-head h2", property: "text" },
  enrollment_body: { selector: ".day-care-start-section .service-section-head span, .service-notes-section .service-section-head span", property: "text" }
});

export function getVisualEditorPage(slug = "") {
  return visualEditorPages[String(slug || "").trim().toLowerCase()] || null;
}

export function visualEditorPageList() {
  return Object.values(visualEditorPages);
}
