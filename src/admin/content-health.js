import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#contentHealthStatus");
const kpiGrid = document.querySelector("#contentHealthKpis");
const issueList = document.querySelector("#contentHealthIssueList");
const refreshButton = document.querySelector("#contentHealthRefresh");
const exportButton = document.querySelector("#contentHealthExport");
const readinessBox = document.querySelector("#contentHealthReadiness");
const searchInput = document.querySelector("#contentHealthSearch");

let currentIssues = [];
let activeFilter = "all";
let searchTerm = "";

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
  statusBox.hidden = !message;
}

function addIssue(issues, issue) {
  const normalized = {
    severity: "warning",
    scope: "site",
    title: "未命名問題",
    detail: "",
    editUrl: "/admin",
    updatedAt: null,
    impact: "會影響內容完整度。",
    fix: "請回到對應後台欄位補齊內容。",
    blocksLaunch: false,
    ...issue
  };
  if (normalized.severity === "critical" && issue.blocksLaunch === undefined) normalized.blocksLaunch = true;
  issues.push(normalized);
}

const scopeLabels = {
  site: "全站",
  home: "首頁",
  page: "頁面",
  service: "服務頁",
  article: "文章",
  category: "分類",
  course: "課程",
  media: "圖片",
  recruiting: "招募",
  investor: "投資人",
  story: "文章管理",
  form: "表單",
  launch: "上線檢查"
};

const placeholderPattern = /待上架|示意資料|示意|測試資料|假資料|placeholder|lorem|todo|TBD|未定|coming soon/i;

function issuePreset(issue) {
  const text = `${issue.title} ${issue.detail}`.toLowerCase();
  if (issue.severity === "critical") issue.blocksLaunch = issue.blocksLaunch ?? true;
  if (/seo/.test(text)) {
    return {
      impact: "搜尋結果與社群分享摘要會比較弱，也較難被搜尋引擎理解。",
      fix: "補上 SEO 標題與 SEO 描述，建議標題 25-35 字、描述 70-120 字。"
    };
  }
  if (/alt/.test(text)) {
    return {
      impact: "無障礙閱讀與圖片 SEO 會受影響，圖片載入失敗時也沒有替代說明。",
      fix: "補上描述圖片內容的 alt，例如：照顧服務員陪伴長輩進行日間活動。"
    };
  }
  if (/缺圖|圖片|封面|hero/.test(text)) {
    return {
      impact: "前台可能出現空白、預設圖或視覺不完整，會讓頁面看起來沒做完。",
      fix: "到對應頁面或圖片管理選擇符合版型比例的圖片，並確認手機/平板裁切。"
    };
  }
  if (/未發布|停用|隱藏/.test(text)) {
    return {
      impact: "前台只會讀取已啟用且已發布內容，這筆資料可能不會出現在網站上。",
      fix: "確認內容無誤後送審發布，或改回啟用狀態。"
    };
  }
  if (/下載檔|連結|url/.test(text)) {
    return {
      impact: "使用者可能點不到檔案或跳到錯誤位置，投資人與課程資料尤其需要修正。",
      fix: "補上有效 URL 或重新上傳檔案，儲存後到前台點一次確認。"
    };
  }
  return {
    impact: issue.impact,
    fix: issue.fix
  };
}

function getImageUrl(record = {}) {
  return record.public_url || record.content_json?.image_url || "";
}

function hasText(value) {
  return typeof value === "string" ? Boolean(value.trim()) : Boolean(value);
}

function hasUrl(value) {
  return typeof value === "string" && /^(https?:\/\/|\/|#)/i.test(value.trim());
}

function flattenTextValues(value, values = []) {
  if (value == null) return values;
  if (typeof value === "string" || typeof value === "number") {
    values.push(String(value));
    return values;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => flattenTextValues(item, values));
    return values;
  }
  if (typeof value === "object") {
    Object.values(value).forEach((item) => flattenTextValues(item, values));
  }
  return values;
}

function hasPlaceholderText(...values) {
  return flattenTextValues(values).some((value) => placeholderPattern.test(value));
}

function imageRatio(item) {
  if (!item?.width || !item?.height) return null;
  return Number(item.width) / Number(item.height);
}

function isRatioOutside(item, target, tolerance = 0.28) {
  const ratio = imageRatio(item);
  if (!ratio) return false;
  return Math.abs(ratio - target) > tolerance;
}

function isPublishedEnabled(record = {}) {
  return record.status === "published" && record.is_enabled !== false;
}

function imageRecordIssues(item, issues, scope = "media", editUrl = "/admin/media") {
  if (!item) return;
  if (!item.alt_text) addIssue(issues, { severity: "warning", scope, title: `圖片缺 alt：${item.file_name || item.id}`, detail: item.public_url || item.storage_path, editUrl, updatedAt: item.updated_at || item.created_at });
  if (!item.public_url) addIssue(issues, { severity: "critical", scope, title: `圖片缺 public URL：${item.file_name || item.id}`, detail: item.storage_path, editUrl, updatedAt: item.updated_at || item.created_at });
  if (!item.width || !item.height) addIssue(issues, { severity: "info", scope, title: `圖片缺尺寸紀錄：${item.file_name || item.id}`, detail: "建議重新上傳或補尺寸，避免前台裁切不可控。", editUrl, updatedAt: item.updated_at || item.created_at });
  if (!item.image_usage) addIssue(issues, { severity: "warning", scope, title: `圖片缺用途設定：${item.file_name || item.id}`, detail: "後台上傳圖片時應指定 hero、card、article_cover、logo 等用途。", editUrl, updatedAt: item.updated_at || item.created_at });
  if (!item.focal_point) addIssue(issues, { severity: "warning", scope, title: `圖片缺裁切焦點：${item.file_name || item.id}`, detail: "請指定中間、上方、左側等焦點，避免手機/平板裁切到重點。", editUrl, updatedAt: item.updated_at || item.created_at });
  if (item.image_usage === "hero" || item.image_usage === "service_hero") {
    if (item.width && item.width < 1200) addIssue(issues, { severity: "warning", scope, title: `Hero 圖片寬度偏小：${item.file_name || item.id}`, detail: `${item.width}x${item.height || "?"}，建議桌機 Hero 至少 1200px 寬。`, editUrl, updatedAt: item.updated_at || item.created_at });
  }
  if (item.image_usage === "hero" && isRatioOutside(item, 16 / 9, 0.45)) {
    addIssue(issues, { severity: "warning", scope, title: `首頁 Hero 圖片比例可能不穩：${item.file_name || item.id}`, detail: `${item.width}x${item.height}，建議接近 16:9 或更寬，並設定手機裁切焦點。`, editUrl, updatedAt: item.updated_at || item.created_at });
  }
  if (item.image_usage === "service_hero" && isRatioOutside(item, 4 / 3, 0.45)) {
    addIssue(issues, { severity: "info", scope, title: `服務頁 Hero 圖片比例需人工確認：${item.file_name || item.id}`, detail: `${item.width}x${item.height}，服務頁右側圖建議接近 4:3 或 3:2，避免人物被切。`, editUrl, updatedAt: item.updated_at || item.created_at });
  }
  if (item.image_usage === "article_cover" && item.width && item.height && item.width < item.height) {
    addIssue(issues, { severity: "info", scope, title: `文章封面可能過直：${item.file_name || item.id}`, detail: `${item.width}x${item.height}，文章卡片通常較適合橫圖。`, editUrl, updatedAt: item.updated_at || item.created_at });
  }
  if (item.image_usage === "article_cover" && isRatioOutside(item, 2 / 1, 0.45)) {
    addIssue(issues, { severity: "info", scope, title: `文章 Hero 封面比例需確認：${item.file_name || item.id}`, detail: `${item.width}x${item.height}，目前文章內頁設定為寬:高約 2:1。`, editUrl, updatedAt: item.updated_at || item.created_at });
  }
  if (["avatar", "partner_logo"].includes(item.image_usage) && isRatioOutside(item, 1, 0.2)) {
    addIssue(issues, { severity: "info", scope, title: `方形/頭像圖片比例需確認：${item.file_name || item.id}`, detail: `${item.width}x${item.height}，頭像與 Logo 區塊較適合接近 1:1 或透明 PNG。`, editUrl, updatedAt: item.updated_at || item.created_at });
  }
  if (item.is_enabled === false) addIssue(issues, { severity: "warning", scope, title: `圖片已停用：${item.file_name || item.id}`, detail: "若前台仍使用此圖，可能會造成維護混亂。", editUrl, updatedAt: item.updated_at || item.created_at });
}

function auditPages(pages, sections, issues) {
  const expectedPages = ["home", "about", "milestones", "home-care", "day-care", "community", "nursing", "migrant-training", "quality", "software", "talent", "land", "investor-recruit", "health", "courses", "investors", "ir-finance", "ir-governance", "ir-shareholders", "contact"];
  const pageSlugs = new Set(pages.map((page) => page.slug));
  expectedPages.forEach((slug) => {
    if (!pageSlugs.has(slug)) addIssue(issues, { severity: "critical", scope: "page", title: `CMS 缺少必要頁面：${slug}`, detail: "前台可能退回硬編碼內容，後台無法完整控制。", editUrl: "/admin/pages", updatedAt: null });
  });

  pages.forEach((page) => {
    if (!page.title) addIssue(issues, { severity: "critical", scope: "page", title: `頁面缺標題：${page.slug}`, detail: page.slug, editUrl: `/admin/pages/${page.id}`, updatedAt: page.updated_at });
    if (!page.seo_title) addIssue(issues, { severity: "warning", scope: "page", title: `頁面缺 SEO title：${page.title}`, detail: page.slug, editUrl: `/admin/pages/${page.id}`, updatedAt: page.updated_at });
    if (!page.seo_description) addIssue(issues, { severity: "warning", scope: "page", title: `頁面缺 SEO description：${page.title}`, detail: page.slug, editUrl: `/admin/pages/${page.id}`, updatedAt: page.updated_at });
    if (hasPlaceholderText(page.title, page.seo_title, page.seo_description)) addIssue(issues, { severity: "critical", scope: "launch", title: `頁面含待上架/示意文字：${page.title || page.slug}`, detail: page.slug, editUrl: `/admin/pages/${page.id}`, updatedAt: page.updated_at });
    if (!page.is_enabled || page.status !== "published") addIssue(issues, { severity: "critical", scope: "page", title: `頁面尚未發布或未啟用：${page.title}`, detail: `${page.status} / ${page.is_enabled ? "enabled" : "disabled"}`, editUrl: `/admin/pages/${page.id}`, updatedAt: page.updated_at });
  });

  sections.forEach((section) => {
    const imageUrl = getImageUrl(section);
    const needsImage = /hero|image|card|service|scene|contact|network/i.test(section.layout || section.section_key || "");
    if (needsImage && !imageUrl && !section.image_id) {
      addIssue(issues, { severity: "warning", scope: "page", title: `區塊可能缺圖：${section.title || section.section_key}`, detail: section.section_key, editUrl: `/admin/pages/${section.page_id}`, updatedAt: section.updated_at });
    }
    if (imageUrl && !section.content_json?.image_alt) {
      addIssue(issues, { severity: "warning", scope: "page", title: `區塊圖片缺 alt：${section.title || section.section_key}`, detail: section.section_key, editUrl: `/admin/pages/${section.page_id}`, updatedAt: section.updated_at });
    }
    if ((imageUrl || section.image_id) && !section.content_json?.focal_point) {
      addIssue(issues, { severity: "info", scope: "page", title: `區塊圖片缺裁切焦點：${section.title || section.section_key}`, detail: "上傳或選圖時建議設定桌機/平板/手機焦點。", editUrl: `/admin/pages/${section.page_id}`, updatedAt: section.updated_at });
    }
    if ((section.title || section.body || imageUrl) && !section.section_key) {
      addIssue(issues, { severity: "warning", scope: "page", title: "區塊缺 section key", detail: section.title || section.id, editUrl: `/admin/pages/${section.page_id}`, updatedAt: section.updated_at });
    }
    if (hasPlaceholderText(section.title, section.body, section.content_json)) {
      addIssue(issues, { severity: "critical", scope: "launch", title: `區塊含待上架/示意文字：${section.title || section.section_key}`, detail: section.section_key, editUrl: `/admin/pages/${section.page_id}`, updatedAt: section.updated_at });
    }
    if (!section.is_enabled || section.status !== "published") {
      addIssue(issues, { severity: "info", scope: "page", title: `區塊未發布或隱藏：${section.title || section.section_key}`, detail: `${section.status} / ${section.is_enabled ? "enabled" : "hidden"}`, editUrl: `/admin/pages/${section.page_id}`, updatedAt: section.updated_at });
    }
  });
}

function auditCategories(categories, issues) {
  categories.forEach((category) => {
    if (!category.name) addIssue(issues, { severity: "critical", scope: "category", title: "文章分類缺名稱", detail: category.slug || category.id, editUrl: "/admin/categories", updatedAt: category.updated_at });
    if (!category.slug) addIssue(issues, { severity: "critical", scope: "category", title: `文章分類缺 slug：${category.name || "未命名"}`, detail: category.id, editUrl: "/admin/categories", updatedAt: category.updated_at });
    if (!category.is_enabled) addIssue(issues, { severity: "info", scope: "category", title: `文章分類已停用：${category.name || category.slug}`, detail: "前台分類篩選不會顯示此分類。", editUrl: "/admin/categories", updatedAt: category.updated_at });
    if (!category.seo_title) addIssue(issues, { severity: "info", scope: "category", title: `文章分類缺 SEO title：${category.name || category.slug}`, detail: category.slug, editUrl: "/admin/categories", updatedAt: category.updated_at });
    if (!category.description && !category.seo_description) addIssue(issues, { severity: "warning", scope: "category", title: `文章分類缺描述：${category.name || category.slug}`, detail: "分類頁與篩選說明會較空。", editUrl: "/admin/categories", updatedAt: category.updated_at });
    if (["lazy_pack", "event", "video", "short_video", "master_talk"].includes(category.section_key) && !category.show_in_nav) {
      addIssue(issues, { severity: "info", scope: "category", title: `Health 3.0 分類未顯示於導覽：${category.name || category.slug}`, detail: category.section_key, editUrl: "/admin/categories", updatedAt: category.updated_at });
    }
  });
}

function auditHealthCategoryCoverage(categories, articles, issues) {
  const expected = [
    { key: "latest", label: "最新照顧文章", minimum: 6 },
    { key: "lazy_pack", label: "懶人包", minimum: 6 },
    { key: "event", label: "活動專區", minimum: 3 },
    { key: "video", label: "影音", minimum: 2 },
    { key: "short_video", label: "短影片", minimum: 2 },
    { key: "master_talk", label: "名人講堂", minimum: 4 }
  ];
  const enabledCategories = categories.filter((category) => category.is_enabled !== false);
  const categoryById = new Map(enabledCategories.map((category) => [category.id, category]));
  expected.forEach(({ key, label, minimum }) => {
    const matchedCategories = enabledCategories.filter((category) => category.section_key === key || category.slug === key || category.type === key);
    if (!matchedCategories.length) {
      addIssue(issues, { severity: "critical", scope: "category", title: `Health 3.0 缺分類：${label}`, detail: `section_key 建議設定為 ${key}`, editUrl: "/admin/categories", updatedAt: null });
      return;
    }
    const categoryIds = new Set(matchedCategories.map((category) => category.id));
    const publishedCount = articles.filter((article) => {
      const category = categoryById.get(article.category_id);
      return article.status === "published" && article.is_enabled !== false && (categoryIds.has(article.category_id) || article.content_type === key || category?.section_key === key);
    }).length;
    if (publishedCount < minimum) {
      addIssue(issues, { severity: "warning", scope: "article", title: `Health 3.0「${label}」已發布內容不足`, detail: `目前 ${publishedCount} 篇，建議至少 ${minimum} 篇，前台才不會看起來太空。`, editUrl: "/admin/articles", updatedAt: null });
    }
  });
}

function auditArticles(articles, categories, issues) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  articles.forEach((article) => {
    if (!article.cover_image_id) addIssue(issues, { severity: "critical", scope: "article", title: `文章缺封面圖：${article.title}`, detail: article.slug, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (!article.category_id) addIssue(issues, { severity: "warning", scope: "article", title: `文章未選分類：${article.title}`, detail: article.slug, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (article.category_id && categoryById.get(article.category_id)?.is_enabled === false) addIssue(issues, { severity: "warning", scope: "article", title: `文章分類已停用：${article.title}`, detail: categoryById.get(article.category_id)?.name || article.category_id, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (!article.seo_title) addIssue(issues, { severity: "warning", scope: "article", title: `文章缺 SEO title：${article.title}`, detail: article.slug, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (!article.seo_description) addIssue(issues, { severity: "warning", scope: "article", title: `文章缺 SEO description：${article.title}`, detail: article.slug, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (!article.excerpt && !article.subtitle) addIssue(issues, { severity: "warning", scope: "article", title: `文章缺摘要：${article.title}`, detail: article.slug, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (!article.author_name) addIssue(issues, { severity: "info", scope: "article", title: `文章缺作者：${article.title}`, detail: article.slug, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (!article.content) addIssue(issues, { severity: "warning", scope: "article", title: `文章缺內文：${article.title}`, detail: article.slug, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (hasPlaceholderText(article.title, article.subtitle, article.excerpt, article.content, article.content_json, article.seo_title, article.seo_description)) addIssue(issues, { severity: "critical", scope: "launch", title: `文章含待上架/示意文字：${article.title || article.slug}`, detail: article.slug, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (["video", "short_video"].includes(article.content_type) && !article.content_json?.video_url && !article.content_json?.video?.url) addIssue(issues, { severity: "warning", scope: "article", title: `影音文章缺影片連結：${article.title}`, detail: article.content_type, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (article.status !== "published") addIssue(issues, { severity: "info", scope: "article", title: `文章尚未發布：${article.title}`, detail: article.status, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (!article.is_enabled) addIssue(issues, { severity: "info", scope: "article", title: `文章已停用：${article.title}`, detail: "前台不會顯示此文章。", editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (article.status === "published" && !article.published_at) addIssue(issues, { severity: "critical", scope: "article", title: `已發布文章缺發布日期：${article.title}`, detail: article.slug, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
  });
}

function auditMedia(media, issues) {
  media.forEach((item) => imageRecordIssues(item, issues));
}

function auditSiteSettings(settings, issues) {
  const byKey = settings.reduce((acc, item) => {
    acc[item.setting_key] = item;
    return acc;
  }, {});
  ["brand_name", "brand_name_en", "slogan", "logo_url", "phone", "email", "primary_nav", "footer_columns"].forEach((key) => {
    const item = byKey[key];
    if (!item) {
      addIssue(issues, { severity: "critical", scope: "site", title: `全站設定缺少：${key}`, detail: "Header / Footer 可能會使用前台預設值。", editUrl: "/admin/content-health", updatedAt: null });
      return;
    }
    const hasText = Boolean(item.value_text);
    const hasJson = Array.isArray(item.value_json) ? item.value_json.length > 0 : item.value_json && Object.keys(item.value_json).length > 0;
    if (!hasText && !hasJson) addIssue(issues, { severity: "warning", scope: "site", title: `全站設定沒有內容：${item.setting_label || key}`, detail: key, editUrl: "/admin/content-health", updatedAt: item.updated_at });
    if (!item.is_enabled) addIssue(issues, { severity: "critical", scope: "site", title: `全站設定已停用：${item.setting_label || key}`, detail: key, editUrl: "/admin/content-health", updatedAt: item.updated_at });
  });
}

function auditHomeModules(modules, issues) {
  const sectionSettings = modules.filter((item) => item.module_key === "section_setting");
  ["updates", "care-system", "service-scene", "video", "network", "services", "care-stories", "home-health", "contact", "partners"].forEach((key) => {
    if (!sectionSettings.some((item) => item.item_key === key)) {
      addIssue(issues, { severity: "warning", scope: "home", title: `首頁區塊缺設定：${key}`, detail: "首頁固定區塊設定已收斂到頁面管理與內容健康檢查，不再使用首頁模組空殼。", editUrl: "/admin/pages", updatedAt: null });
    }
  });
  sectionSettings.forEach((item) => {
    if (!item.title && !item.metadata?.hidden) addIssue(issues, { severity: "warning", scope: "home", title: `首頁區塊缺標題：${item.item_key}`, detail: item.metadata?.selector || "", editUrl: "/admin/pages", updatedAt: item.updated_at });
    if (!item.metadata?.selector && !item.item_key) addIssue(issues, { severity: "warning", scope: "home", title: `首頁區塊設定缺 selector：${item.title || "未命名"}`, detail: "請補 item_key 或 metadata.selector。", editUrl: "/admin/pages", updatedAt: item.updated_at });
  });
}

function auditServiceTemplateFields(fields, issues) {
  const servicePages = new Set(["about", "milestones", "home-care", "day-care", "community", "nursing", "migrant-training", "quality"]);
  const grouped = fields.reduce((acc, field) => {
    if (!acc[field.page_slug]) acc[field.page_slug] = [];
    acc[field.page_slug].push(field);
    return acc;
  }, {});
  servicePages.forEach((slug) => {
    if (!grouped[slug]?.length) addIssue(issues, { severity: "critical", scope: "service", title: `服務頁缺模板欄位：${slug}`, detail: "此頁可能仍靠前台硬編碼，後台無法完整維護。", editUrl: "/admin/pages", updatedAt: null });
  });
  fields
    .filter((field) => servicePages.has(field.page_slug))
    .forEach((field) => {
      if (["feature_cards", "flow_cards", "faq_items"].includes(field.field_key)) {
        const cards = Array.isArray(field.json_value) ? field.json_value : Array.isArray(field.json_value?.items) ? field.json_value.items : [];
        if (!cards.length) addIssue(issues, { severity: "warning", scope: "service", title: `服務頁卡片列表為空：${field.page_slug} / ${field.field_label}`, detail: field.field_key, editUrl: `/admin/pages`, updatedAt: field.updated_at });
        cards.forEach((card, index) => {
          const hasTitle = card.title || card.question;
          const hasBody = card.body || card.description || card.answer;
          if (!hasTitle || !hasBody) addIssue(issues, { severity: "warning", scope: "service", title: `服務頁卡片內容不完整：${field.page_slug} / ${field.field_label} #${index + 1}`, detail: "請補齊標題與內容，或刪除空卡片。", editUrl: `/admin/pages`, updatedAt: field.updated_at });
        });
      }
      if (field.field_type === "image" && !field.image_id && !field.text_value) {
        addIssue(issues, { severity: "warning", scope: "service", title: `服務頁圖片欄位缺圖：${field.page_slug} / ${field.field_label}`, detail: field.field_key, editUrl: `/admin/pages`, updatedAt: field.updated_at });
      }
      if (field.field_type !== "image" && field.is_enabled && !field.text_value && !field.json_value) {
        addIssue(issues, { severity: "info", scope: "service", title: `服務頁欄位啟用但無內容：${field.page_slug} / ${field.field_label}`, detail: field.field_key, editUrl: `/admin/pages`, updatedAt: field.updated_at });
      }
    });
}

function auditCourses(courses, issues) {
  courses.forEach((course) => {
    if (!course.title) addIssue(issues, { severity: "critical", scope: "course", title: "課程缺標題", detail: course.slug || course.id, editUrl: "/admin/courses", updatedAt: course.updated_at });
    if (!course.subtitle && !course.excerpt) addIssue(issues, { severity: "warning", scope: "course", title: `課程缺簡介：${course.title || "未命名"}`, detail: course.slug, editUrl: "/admin/courses", updatedAt: course.updated_at });
    if (!course.cover_image_id) addIssue(issues, { severity: "critical", scope: "course", title: `課程缺封面圖：${course.title || "未命名"}`, detail: course.slug, editUrl: "/admin/courses", updatedAt: course.updated_at });
    if (!course.starts_at) addIssue(issues, { severity: "warning", scope: "course", title: `課程缺日期時間：${course.title || "未命名"}`, detail: course.slug, editUrl: "/admin/courses", updatedAt: course.updated_at });
    if (!course.location) addIssue(issues, { severity: "warning", scope: "course", title: `課程缺地點/型態：${course.title || "未命名"}`, detail: course.course_type || course.slug, editUrl: "/admin/courses", updatedAt: course.updated_at });
    if (!course.price_text) addIssue(issues, { severity: "warning", scope: "course", title: `課程缺價格：${course.title || "未命名"}`, detail: course.slug, editUrl: "/admin/courses", updatedAt: course.updated_at });
    if (course.registration_status === "open" && !course.registration_url && !course.metadata?.signup_email) addIssue(issues, { severity: "info", scope: "course", title: `課程開放報名但缺外部報名設定：${course.title || "未命名"}`, detail: "若使用站內彈窗報名可忽略；若有外部表單請補連結。", editUrl: "/admin/courses", updatedAt: course.updated_at });
    if (!course.seo_title) addIssue(issues, { severity: "info", scope: "course", title: `課程缺 SEO title：${course.title || "未命名"}`, detail: course.slug, editUrl: "/admin/courses", updatedAt: course.updated_at });
    if (!course.seo_description) addIssue(issues, { severity: "info", scope: "course", title: `課程缺 SEO description：${course.title || "未命名"}`, detail: course.slug, editUrl: "/admin/courses", updatedAt: course.updated_at });
    if (hasPlaceholderText(course.title, course.subtitle, course.excerpt, course.description, course.metadata, course.seo_title, course.seo_description)) addIssue(issues, { severity: "critical", scope: "launch", title: `課程含待上架/示意文字：${course.title || "未命名"}`, detail: course.slug, editUrl: "/admin/courses", updatedAt: course.updated_at });
    if (!isPublishedEnabled(course)) addIssue(issues, { severity: "info", scope: "course", title: `課程未發布或停用：${course.title || "未命名"}`, detail: `${course.status} / ${course.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/courses", updatedAt: course.updated_at });
  });
}

function auditFormSubmissions(submissions, issues) {
  const staleLine = Date.now() - 24 * 60 * 60 * 1000;
  const routeByType = {
    course_signup: "/admin/courses",
    recruiting_application: "/admin/recruiting",
    land_recruit: "/admin/recruiting",
    investor_recruit: "/admin/investor-data",
    contact: "/admin/content-health"
  };
  const labelByType = {
    course_signup: "課程報名",
    recruiting_application: "人才應徵",
    land_recruit: "土地招募",
    investor_recruit: "投資人招募",
    contact: "聯絡我們"
  };

  submissions.forEach((item) => {
    const typeLabel = labelByType[item.form_type] || item.form_type || "表單";
    const editUrl = routeByType[item.form_type] || "/admin/content-health";
    const metadata = item.metadata || {};
    const createdAt = item.created_at ? new Date(item.created_at).getTime() : Date.now();
    const isOpen = !["closed", "completed", "resolved", "spam", "cancelled"].includes(String(item.status || "").toLowerCase());
    if (isOpen && createdAt < staleLine) {
      addIssue(issues, { severity: "warning", scope: "form", title: `${typeLabel} 超過 24 小時未結案`, detail: `${item.name || "未留姓名"}｜${item.phone || item.email || "缺聯絡方式"}`, editUrl, updatedAt: item.updated_at || item.created_at });
    }
    if (item.email_sent === false) {
      addIssue(issues, { severity: "critical", scope: "form", title: `${typeLabel} 留存成功但寄信失敗`, detail: `${item.name || "未留姓名"}｜請確認後端寄信服務設定與收件信箱。`, editUrl, updatedAt: item.updated_at || item.created_at });
    }
    if (!item.name || (!item.phone && !item.email)) {
      addIssue(issues, { severity: "warning", scope: "form", title: `${typeLabel} 缺必要聯絡資料`, detail: `姓名：${item.name || "缺"}，電話/Email：${item.phone || item.email || "缺"}`, editUrl, updatedAt: item.updated_at || item.created_at });
    }
    if (item.form_type === "course_signup" && !metadata.course_title && !item.subject) {
      addIssue(issues, { severity: "warning", scope: "form", title: "課程報名缺課程名稱", detail: `${item.name || "未留姓名"} 的報名資料無法判斷課程。`, editUrl, updatedAt: item.updated_at || item.created_at });
    }
    if (!item.recipient_email && item.email_sent !== false) {
      addIssue(issues, { severity: "info", scope: "form", title: `${typeLabel} 缺收件信箱紀錄`, detail: "建議表單 API 留存 recipient_email，日後追查會更清楚。", editUrl, updatedAt: item.updated_at || item.created_at });
    }
  });
}

function auditRecruiting(pages, departments, openings, issues) {
  pages.forEach((item) => {
    if (!item.title) addIssue(issues, { severity: "critical", scope: "recruiting", title: "招募頁 Hero 缺標題", detail: item.page_slug || item.id, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.body && !item.subtitle) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募頁 Hero 缺內文：${item.title || item.page_slug}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.hero_image_id && !item.hero_image_url) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募頁 Hero 缺圖片：${item.title || item.page_slug}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.primary_cta_text || !item.primary_cta_url) addIssue(issues, { severity: "info", scope: "recruiting", title: `招募頁 Hero 缺主要 CTA：${item.title || item.page_slug}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (hasPlaceholderText(item.title, item.subtitle, item.body)) addIssue(issues, { severity: "critical", scope: "launch", title: `招募頁含待上架/示意文字：${item.title || item.page_slug}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.is_enabled || item.status !== "published") addIssue(issues, { severity: "critical", scope: "recruiting", title: `招募頁未發布或停用：${item.title || item.page_slug}`, detail: `${item.status} / ${item.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
  });
  departments.forEach((item) => {
    if (!item.title) addIssue(issues, { severity: "critical", scope: "recruiting", title: "招募部門缺標題", detail: item.page_slug || item.id, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.department_slug) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募部門缺 slug：${item.title || "未命名"}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.description) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募部門缺描述：${item.title || "未命名"}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.image_id && !item.image_url) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募部門缺圖片：${item.title || "未命名"}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (hasPlaceholderText(item.title, item.description)) addIssue(issues, { severity: "critical", scope: "launch", title: `招募部門含待上架/示意文字：${item.title || "未命名"}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.is_enabled || item.status !== "published") addIssue(issues, { severity: "info", scope: "recruiting", title: `招募部門未發布或停用：${item.title || "未命名"}`, detail: `${item.status} / ${item.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
  });

  openings.forEach((item) => {
    if (!item.title) addIssue(issues, { severity: "critical", scope: "recruiting", title: "招募卡片缺標題", detail: item.page_slug || item.id, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.summary) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募卡片缺摘要：${item.title || "未命名"}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.image_id && !item.image_url) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募卡片缺圖片：${item.title || "未命名"}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.department_id) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募卡片未綁定部門：${item.title || "未命名"}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (hasPlaceholderText(item.title, item.summary)) addIssue(issues, { severity: "critical", scope: "launch", title: `招募卡片含待上架/示意文字：${item.title || "未命名"}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.is_enabled || item.status !== "published") addIssue(issues, { severity: "info", scope: "recruiting", title: `招募卡片未發布或停用：${item.title || "未命名"}`, detail: `${item.status} / ${item.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
  });
}

function auditInvestor(notices, financialItems, files, charts, issues) {
  notices.forEach((item) => {
    if (!item.title) addIssue(issues, { severity: "critical", scope: "investor", title: "投資人公告缺標題", detail: item.notice_type || item.id, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (!item.date_label && !item.published_on) addIssue(issues, { severity: "warning", scope: "investor", title: `投資人公告缺日期：${item.title || "未命名"}`, detail: item.notice_type, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (!item.summary && !item.body) addIssue(issues, { severity: "warning", scope: "investor", title: `投資人公告缺摘要/內文：${item.title || "未命名"}`, detail: item.notice_type, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (["material", "shareholder", "governance"].includes(item.notice_type) && !item.link_url && !item.file_id) addIssue(issues, { severity: "warning", scope: "investor", title: `重要投資人公告缺連結或檔案：${item.title || "未命名"}`, detail: item.notice_type, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (hasPlaceholderText(item.title, item.summary, item.body, item.date_label)) addIssue(issues, { severity: "critical", scope: "launch", title: `投資人公告含待上架/示意文字：${item.title || "未命名"}`, detail: item.notice_type, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (!item.is_enabled || item.status !== "published") addIssue(issues, { severity: "info", scope: "investor", title: `投資人公告未發布或停用：${item.title || "未命名"}`, detail: `${item.status} / ${item.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
  });
  financialItems.forEach((item) => {
    if (!item.title) addIssue(issues, { severity: "critical", scope: "investor", title: "財務資料缺標題", detail: item.item_type || item.id, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (!item.period_label) addIssue(issues, { severity: "warning", scope: "investor", title: `財務資料缺期間：${item.title || "未命名"}`, detail: item.item_type, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (["quarterly_report", "annual_report"].includes(item.item_type) && !item.file_id) addIssue(issues, { severity: "warning", scope: "investor", title: `財報/年報尚未綁定下載檔：${item.title || "未命名"}`, detail: item.period_label, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (hasPlaceholderText(item.title, item.period_label)) addIssue(issues, { severity: "critical", scope: "launch", title: `財務資料含待上架/示意文字：${item.title || "未命名"}`, detail: item.item_type, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (!isPublishedEnabled(item)) addIssue(issues, { severity: "info", scope: "investor", title: `財務資料未發布或停用：${item.title || "未命名"}`, detail: `${item.status} / ${item.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
  });
  files.forEach((item) => {
    if (!item.public_url && !item.storage_path) addIssue(issues, { severity: "critical", scope: "investor", title: `下載檔缺連結：${item.title || item.file_name || "未命名"}`, detail: item.file_type || item.category, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (!item.file_name) addIssue(issues, { severity: "warning", scope: "investor", title: `下載檔缺檔名：${item.title || "未命名"}`, detail: item.category, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (!item.is_public && item.status === "published") addIssue(issues, { severity: "warning", scope: "investor", title: `已發布下載檔不是公開檔：${item.title || item.file_name || "未命名"}`, detail: "前台使用者可能無法下載。", editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (hasPlaceholderText(item.title, item.file_name, item.category)) addIssue(issues, { severity: "critical", scope: "launch", title: `下載檔含待上架/示意文字：${item.title || item.file_name || "未命名"}`, detail: item.category, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (!isPublishedEnabled(item)) addIssue(issues, { severity: "info", scope: "investor", title: `下載檔未發布或停用：${item.title || item.file_name || "未命名"}`, detail: `${item.status} / ${item.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
  });
  charts.forEach((item) => {
    if (!item.chart_title) addIssue(issues, { severity: "warning", scope: "investor", title: "圖表資料缺標題", detail: item.chart_key || item.id, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (!item.chart_type) addIssue(issues, { severity: "warning", scope: "investor", title: `圖表資料缺類型：${item.chart_title || "未命名"}`, detail: item.chart_key, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (!Array.isArray(item.data_points) || !item.data_points.length) addIssue(issues, { severity: "warning", scope: "investor", title: `圖表資料缺數據：${item.chart_title || "未命名"}`, detail: item.chart_key, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (!item.is_enabled || item.status !== "published") addIssue(issues, { severity: "info", scope: "investor", title: `圖表資料未發布或停用：${item.chart_title || "未命名"}`, detail: `${item.status} / ${item.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
  });
}

function auditStories(stories, talks, issues) {
  stories.forEach((item) => {
    if (!item.title) addIssue(issues, { severity: "critical", scope: "story", title: "真實照顧情境缺標題", detail: item.slug || item.id, editUrl: "/admin/articles", updatedAt: item.updated_at });
    if (!item.person_name) addIssue(issues, { severity: "warning", scope: "story", title: `真實照顧情境缺人物：${item.title || "未命名"}`, detail: item.slug, editUrl: "/admin/articles", updatedAt: item.updated_at });
    if (!item.cover_image_url) addIssue(issues, { severity: "warning", scope: "story", title: `真實照顧情境缺封面：${item.title || "未命名"}`, detail: item.slug, editUrl: "/admin/articles", updatedAt: item.updated_at });
    if (!item.avatar_image_url) addIssue(issues, { severity: "info", scope: "story", title: `真實照顧情境缺頭像：${item.title || "未命名"}`, detail: item.slug, editUrl: "/admin/articles", updatedAt: item.updated_at });
    if (!item.is_enabled || item.status !== "published") addIssue(issues, { severity: "info", scope: "story", title: `真實照顧情境未發布或停用：${item.title || "未命名"}`, detail: `${item.status} / ${item.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/articles", updatedAt: item.updated_at });
  });
  talks.forEach((item) => {
    if (!item.title) addIssue(issues, { severity: "critical", scope: "story", title: "名人講堂缺標題", detail: item.slug || item.id, editUrl: "/admin/articles", updatedAt: item.updated_at });
    if (!item.speaker_name) addIssue(issues, { severity: "warning", scope: "story", title: `名人講堂缺人物：${item.title || "未命名"}`, detail: item.slug, editUrl: "/admin/articles", updatedAt: item.updated_at });
    if (!item.image_url) addIssue(issues, { severity: "warning", scope: "story", title: `名人講堂缺圖片：${item.title || "未命名"}`, detail: item.slug, editUrl: "/admin/articles", updatedAt: item.updated_at });
    if (!item.summary) addIssue(issues, { severity: "warning", scope: "story", title: `名人講堂缺摘要：${item.title || "未命名"}`, detail: item.slug, editUrl: "/admin/articles", updatedAt: item.updated_at });
    if (!item.is_enabled || item.status !== "published") addIssue(issues, { severity: "info", scope: "story", title: `名人講堂未發布或停用：${item.title || "未命名"}`, detail: `${item.status} / ${item.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/articles", updatedAt: item.updated_at });
  });
}

function auditLaunchReadiness({ settings, pages, articles, courses, forms }, issues) {
  const settingByKey = new Map(settings.map((item) => [item.setting_key, item]));
  const email = settingByKey.get("email")?.value_text;
  const phone = settingByKey.get("phone")?.value_text;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    addIssue(issues, { severity: "critical", scope: "launch", title: "正式上線缺有效客服信箱", detail: email || "site_settings.email 尚未設定", editUrl: "/admin/content-health", updatedAt: settingByKey.get("email")?.updated_at });
  }
  if (!phone || !/[0-9]{2,}/.test(phone)) {
    addIssue(issues, { severity: "critical", scope: "launch", title: "正式上線缺有效電話", detail: phone || "site_settings.phone 尚未設定", editUrl: "/admin/content-health", updatedAt: settingByKey.get("phone")?.updated_at });
  }
  const publishedPages = pages.filter((page) => page.status === "published" && page.is_enabled !== false).length;
  if (publishedPages < 18) {
    addIssue(issues, { severity: "warning", scope: "launch", title: "已發布頁面數偏少", detail: `目前 ${publishedPages} 頁，請確認首頁、服務頁、招募、投資人、課程與聯絡頁都已發布。`, editUrl: "/admin/pages", updatedAt: null });
  }
  const publishedArticles = articles.filter((article) => article.status === "published" && article.is_enabled !== false).length;
  if (publishedArticles < 10) {
    addIssue(issues, { severity: "warning", scope: "launch", title: "已發布文章數偏少", detail: `目前 ${publishedArticles} 篇，Health 3.0 首頁可能不夠飽滿。`, editUrl: "/admin/articles", updatedAt: null });
  }
  const openCourses = courses.filter((course) => course.status === "published" && course.is_enabled !== false && course.registration_status === "open").length;
  if (!openCourses) {
    addIssue(issues, { severity: "warning", scope: "launch", title: "目前沒有開放報名課程", detail: "課程報名頁會較像展示頁，建議至少保留一門可報名課程。", editUrl: "/admin/courses", updatedAt: null });
  }
  const recentForms = forms.filter((item) => item.created_at && Date.now() - new Date(item.created_at).getTime() < 7 * 24 * 60 * 60 * 1000).length;
  if (!recentForms) {
    addIssue(issues, { severity: "info", scope: "form", title: "最近 7 天沒有表單留存資料", detail: "正式上線前建議測一次聯絡我們與課程報名，確認 Supabase 留存與寄信都正常。", editUrl: "/admin/content-health", updatedAt: null });
  }
}

function renderKpis(issues) {
  const counts = {
    critical: issues.filter((issue) => issue.severity === "critical").length,
    warning: issues.filter((issue) => issue.severity === "warning").length,
    info: issues.filter((issue) => issue.severity === "info").length,
    total: issues.length
  };
  const score = Math.max(0, 100 - counts.critical * 12 - counts.warning * 4 - counts.info);
  kpiGrid.innerHTML = [
    ["健康分數", score, "Score"],
    ["總問題", counts.total, "All"],
    ["Critical", counts.critical, "需先修"],
    ["Warning", counts.warning, "建議修"],
    ["Info", counts.info, "可追蹤"]
  ].map(([label, value, hint]) => `<article><span>${escapeHTML(hint)}</span><strong>${value}</strong><p>${escapeHTML(label)}</p></article>`).join("");
  renderReadiness(score, counts);
}

function renderReadiness(score, counts) {
  if (!readinessBox) return;
  const state = counts.critical ? "danger" : counts.warning ? "warning" : "ready";
  const title = counts.critical
    ? "不建議直接上線"
    : counts.warning
      ? "可上線，但建議先修主要提醒"
      : "內容狀態良好";
  const nextStep = counts.critical
    ? "請先處理 Critical，尤其是未發布、缺圖、缺連結與會造成前台空白的項目。"
    : counts.warning
      ? "請優先處理 SEO、alt、摘要與圖片尺寸紀錄，提升搜尋與閱讀品質。"
      : "可進行前台人工瀏覽與表單測試。";
  readinessBox.dataset.state = state;
  readinessBox.innerHTML = `
    <strong>${escapeHTML(title)}</strong>
    <p>目前健康分數 ${score}。${escapeHTML(nextStep)}</p>
    <a href="/admin/governance">查看發布流程</a>
  `;
}

function filterIssues(issues) {
  let rows = issues;
  if (activeFilter !== "all") {
    if (["critical", "warning", "info"].includes(activeFilter)) rows = rows.filter((issue) => issue.severity === activeFilter);
    else rows = rows.filter((issue) => issue.scope === activeFilter);
  }
  if (searchTerm) {
    const keyword = searchTerm.toLowerCase();
    rows = rows.filter((issue) => `${issue.severity} ${issue.scope} ${issue.title} ${issue.detail} ${issue.impact} ${issue.fix}`.toLowerCase().includes(keyword));
  }
  return rows;
}

function renderIssues() {
  const rows = filterIssues(currentIssues);
  if (!rows.length) {
    issueList.innerHTML = `<div class="admin-empty-state">目前沒有符合條件的內容問題。</div>`;
    return;
  }
  issueList.innerHTML = rows.map((issue) => {
    const preset = issuePreset(issue);
    return `
    <article class="content-health-item" data-severity="${escapeHTML(issue.severity)}">
      <span>${escapeHTML(issue.severity)}</span>
      <div>
        <strong>${escapeHTML(issue.title)}</strong>
        <p>${escapeHTML(issue.detail || "請補齊後台欄位。")}</p>
        <div class="content-health-fix">
          <b>影響</b><p>${escapeHTML(preset.impact || "")}</p>
          <b>建議修法</b><p>${escapeHTML(preset.fix || "")}</p>
        </div>
        <small>${escapeHTML(scopeLabels[issue.scope] || issue.scope)}｜${issue.blocksLaunch ? "上線前必修｜" : ""}${formatUpdatedAt(issue.updatedAt)}</small>
      </div>
      <a href="${escapeHTML(issue.editUrl)}">前往修正</a>
    </article>
  `;
  }).join("");
}

async function loadContentHealth() {
  if (!supabase) return;
  refreshButton?.setAttribute("disabled", "true");
  setStatus("正在檢查全站設定、頁面、文章、課程、圖片、招募、投資人、表單與上線前風險...", "info");

  try {
    const [
      settingsResult,
      homeModulesResult,
      pagesResult,
      sectionsResult,
      templateFieldResult,
      categoriesResult,
      articlesResult,
      coursesResult,
      mediaResult,
      recruitingPageResult,
      departmentResult,
      openingResult,
      noticeResult,
      financialResult,
      fileResult,
      chartResult,
      storyResult,
      talkResult,
      formResult
    ] = await Promise.all([
      supabase.from("site_settings").select("id,setting_key,setting_label,value_text,value_json,is_enabled,updated_at").order("sort_order", { ascending: true }),
      supabase.from("content_modules").select("id,module_key,item_key,title,metadata,status,is_enabled,updated_at").eq("target_slug", "home").order("module_key", { ascending: true }),
      supabase.from("pages").select("id,slug,title,status,is_enabled,seo_title,seo_description,updated_at").order("sort_order", { ascending: true }),
      supabase.from("page_sections").select("id,page_id,section_key,title,layout,status,is_enabled,image_id,content_json,updated_at").order("sort_order", { ascending: true }),
      supabase.from("page_template_fields").select("id,page_slug,field_key,field_label,field_type,text_value,json_value,image_id,is_enabled,updated_at").order("page_slug", { ascending: true }),
      supabase.from("article_categories").select("id,name,slug,description,type,section_key,show_in_nav,is_enabled,seo_title,seo_description,updated_at").order("sort_order", { ascending: true }).limit(500),
      supabase.from("articles").select("id,slug,title,subtitle,excerpt,author_name,content,content_type,content_json,category_id,status,is_enabled,published_at,cover_image_id,seo_title,seo_description,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("courses").select("id,slug,title,subtitle,excerpt,description,course_type,location,starts_at,ends_at,price_text,registration_url,registration_status,cover_image_id,status,is_enabled,published_at,seo_title,seo_description,metadata,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("media").select("id,file_name,storage_path,public_url,alt_text,width,height,image_usage,focal_point,is_enabled,updated_at,created_at").order("created_at", { ascending: false }).limit(500),
      supabase.from("recruiting_pages").select("id,page_slug,title,subtitle,body,hero_image_id,hero_image_url,primary_cta_text,primary_cta_url,status,is_enabled,updated_at").order("sort_order", { ascending: true }),
      supabase.from("recruiting_departments").select("id,page_slug,title,department_slug,description,image_id,image_url,status,is_enabled,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("recruiting_openings").select("id,page_slug,department_id,title,summary,image_id,image_url,status,is_enabled,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("investor_notices").select("id,title,summary,body,notice_type,date_label,published_on,link_url,file_id,status,is_enabled,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("investor_financial_items").select("id,title,item_type,period_label,file_id,status,is_enabled,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("downloadable_files").select("id,title,file_name,file_type,category,public_url,storage_path,status,is_enabled,is_public,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("investor_chart_datasets").select("id,chart_title,chart_key,chart_type,unit_label,data_points,status,is_enabled,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("care_stories").select("id,title,slug,person_name,cover_image_url,avatar_image_url,status,is_enabled,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("expert_talks").select("id,title,slug,speaker_name,summary,image_url,status,is_enabled,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("form_submissions").select("id,form_type,name,phone,email,subject,status,email_sent,recipient_email,metadata,created_at,updated_at,handled_at").order("created_at", { ascending: false }).limit(300)
    ]);

    [
      settingsResult,
      homeModulesResult,
      pagesResult,
      sectionsResult,
      templateFieldResult,
      categoriesResult,
      articlesResult,
      coursesResult,
      mediaResult,
      recruitingPageResult,
      departmentResult,
      openingResult,
      noticeResult,
      financialResult,
      fileResult,
      chartResult,
      storyResult,
      talkResult,
      formResult
    ].forEach((result) => {
      if (result.error) throw result.error;
    });

    const issues = [];
    auditSiteSettings(settingsResult.data || [], issues);
    auditHomeModules(homeModulesResult.data || [], issues);
    auditPages(pagesResult.data || [], sectionsResult.data || [], issues);
    auditServiceTemplateFields(templateFieldResult.data || [], issues);
    auditCategories(categoriesResult.data || [], issues);
    auditArticles(articlesResult.data || [], categoriesResult.data || [], issues);
    auditHealthCategoryCoverage(categoriesResult.data || [], articlesResult.data || [], issues);
    auditCourses(coursesResult.data || [], issues);
    auditFormSubmissions(formResult.data || [], issues);
    auditMedia(mediaResult.data || [], issues);
    auditRecruiting(recruitingPageResult.data || [], departmentResult.data || [], openingResult.data || [], issues);
    auditInvestor(noticeResult.data || [], financialResult.data || [], fileResult.data || [], chartResult.data || [], issues);
    auditStories(storyResult.data || [], talkResult.data || [], issues);
    auditLaunchReadiness({
      settings: settingsResult.data || [],
      pages: pagesResult.data || [],
      articles: articlesResult.data || [],
      courses: coursesResult.data || [],
      forms: formResult.data || []
    }, issues);
    currentIssues = issues.sort((a, b) => {
      const severityWeight = { critical: 0, warning: 1, info: 2 };
      return severityWeight[a.severity] - severityWeight[b.severity];
    });
    supabase.from("content_audit_runs").insert({
      status: "completed",
      summary: {
        total: currentIssues.length,
        critical: currentIssues.filter((issue) => issue.severity === "critical").length,
        warning: currentIssues.filter((issue) => issue.severity === "warning").length,
        info: currentIssues.filter((issue) => issue.severity === "info").length
      },
      issues: currentIssues
    }).then(({ error }) => {
      if (error) console.warn("Failed to save content audit snapshot.", error);
    });
    renderKpis(currentIssues);
    renderIssues();
    setStatus(`檢查完成，共 ${currentIssues.length} 筆提醒。`, currentIssues.some((issue) => issue.severity === "critical") ? "error" : "success");
  } catch (error) {
    console.error("Content health failed", error);
    setStatus(`內容健康檢查失敗：${error.message}`, "error");
  } finally {
    refreshButton?.removeAttribute("disabled");
  }
}

function exportIssues() {
  const header = ["severity", "scope", "title", "detail", "impact", "fix", "blocksLaunch", "editUrl", "updatedAt"];
  const rows = [header, ...filterIssues(currentIssues).map((issue) => header.map((key) => `"${String(issue[key] || "").replace(/"/g, '""')}"`))];
  const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `suiyuecare-content-health-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelectorAll("[data-health-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.healthFilter;
    document.querySelectorAll("[data-health-filter]").forEach((item) => item.classList.toggle("active", item === button));
    renderIssues();
  });
});

refreshButton?.addEventListener("click", loadContentHealth);
exportButton?.addEventListener("click", exportIssues);
searchInput?.addEventListener("input", () => {
  searchTerm = searchInput.value.trim();
  renderIssues();
});
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadContentHealth
}).catch((error) => reportAdminBootError(loading, error));
