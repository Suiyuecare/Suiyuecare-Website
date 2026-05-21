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

let currentIssues = [];
let activeFilter = "all";

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
  statusBox.hidden = !message;
}

function addIssue(issues, issue) {
  issues.push({
    severity: "warning",
    scope: "site",
    title: "未命名問題",
    detail: "",
    editUrl: "/admin",
    updatedAt: null,
    ...issue
  });
}

function getImageUrl(record = {}) {
  return record.public_url || record.content_json?.image_url || "";
}

function auditPages(pages, sections, issues) {
  pages.forEach((page) => {
    if (!page.seo_title) addIssue(issues, { severity: "warning", scope: "page", title: `頁面缺 SEO title：${page.title}`, detail: page.slug, editUrl: `/admin/pages/${page.id}`, updatedAt: page.updated_at });
    if (!page.seo_description) addIssue(issues, { severity: "warning", scope: "page", title: `頁面缺 SEO description：${page.title}`, detail: page.slug, editUrl: `/admin/pages/${page.id}`, updatedAt: page.updated_at });
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
    if (!section.is_enabled || section.status !== "published") {
      addIssue(issues, { severity: "info", scope: "page", title: `區塊未發布或隱藏：${section.title || section.section_key}`, detail: `${section.status} / ${section.is_enabled ? "enabled" : "hidden"}`, editUrl: `/admin/pages/${section.page_id}`, updatedAt: section.updated_at });
    }
  });
}

function auditArticles(articles, issues) {
  articles.forEach((article) => {
    if (!article.cover_image_id) addIssue(issues, { severity: "critical", scope: "article", title: `文章缺封面圖：${article.title}`, detail: article.slug, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (!article.seo_title) addIssue(issues, { severity: "warning", scope: "article", title: `文章缺 SEO title：${article.title}`, detail: article.slug, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (!article.seo_description) addIssue(issues, { severity: "warning", scope: "article", title: `文章缺 SEO description：${article.title}`, detail: article.slug, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (!article.excerpt && !article.subtitle) addIssue(issues, { severity: "warning", scope: "article", title: `文章缺摘要：${article.title}`, detail: article.slug, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (article.status !== "published") addIssue(issues, { severity: "info", scope: "article", title: `文章尚未發布：${article.title}`, detail: article.status, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
    if (article.status === "published" && !article.published_at) addIssue(issues, { severity: "critical", scope: "article", title: `已發布文章缺發布日期：${article.title}`, detail: article.slug, editUrl: `/admin/articles/${article.id}`, updatedAt: article.updated_at });
  });
}

function auditMedia(media, issues) {
  media.forEach((item) => {
    if (!item.alt_text) addIssue(issues, { severity: "warning", scope: "media", title: `圖片缺 alt：${item.file_name}`, detail: item.public_url || item.storage_path, editUrl: "/admin/media", updatedAt: item.updated_at || item.created_at });
    if (!item.public_url) addIssue(issues, { severity: "critical", scope: "media", title: `圖片缺 public URL：${item.file_name}`, detail: item.storage_path, editUrl: "/admin/media", updatedAt: item.updated_at || item.created_at });
    if (!item.width || !item.height) addIssue(issues, { severity: "info", scope: "media", title: `圖片缺尺寸紀錄：${item.file_name}`, detail: "建議重新上傳或補尺寸，避免前台裁切不可控。", editUrl: "/admin/media", updatedAt: item.updated_at || item.created_at });
  });
}

function auditSiteSettings(settings, issues) {
  const byKey = settings.reduce((acc, item) => {
    acc[item.setting_key] = item;
    return acc;
  }, {});
  ["brand_name", "brand_name_en", "slogan", "logo_url", "phone", "email", "primary_nav", "footer_columns"].forEach((key) => {
    const item = byKey[key];
    if (!item) {
      addIssue(issues, { severity: "critical", scope: "site", title: `全站設定缺少：${key}`, detail: "Header / Footer 可能會使用前台預設值。", editUrl: "/admin/site-settings", updatedAt: null });
      return;
    }
    const hasText = Boolean(item.value_text);
    const hasJson = Array.isArray(item.value_json) ? item.value_json.length > 0 : item.value_json && Object.keys(item.value_json).length > 0;
    if (!hasText && !hasJson) addIssue(issues, { severity: "warning", scope: "site", title: `全站設定沒有內容：${item.setting_label || key}`, detail: key, editUrl: "/admin/site-settings", updatedAt: item.updated_at });
    if (!item.is_enabled) addIssue(issues, { severity: "critical", scope: "site", title: `全站設定已停用：${item.setting_label || key}`, detail: key, editUrl: "/admin/site-settings", updatedAt: item.updated_at });
  });
}

function auditHomeModules(modules, issues) {
  const sectionSettings = modules.filter((item) => item.module_key === "section_setting");
  ["updates", "care-system", "service-scene", "video", "network", "services", "care-stories", "home-health", "contact", "partners"].forEach((key) => {
    if (!sectionSettings.some((item) => item.item_key === key)) {
      addIssue(issues, { severity: "warning", scope: "home", title: `首頁區塊缺設定：${key}`, detail: "可到首頁模組新增 section_setting。", editUrl: "/admin/home-modules", updatedAt: null });
    }
  });
  sectionSettings.forEach((item) => {
    if (!item.title && !item.metadata?.hidden) addIssue(issues, { severity: "warning", scope: "home", title: `首頁區塊缺標題：${item.item_key}`, detail: item.metadata?.selector || "", editUrl: "/admin/home-modules", updatedAt: item.updated_at });
    if (!item.metadata?.selector && !item.item_key) addIssue(issues, { severity: "warning", scope: "home", title: `首頁區塊設定缺 selector：${item.title || "未命名"}`, detail: "請補 item_key 或 metadata.selector。", editUrl: "/admin/home-modules", updatedAt: item.updated_at });
  });
}

function auditServiceTemplateFields(fields, issues) {
  const servicePages = new Set(["about", "milestones", "home-care", "day-care", "community", "nursing", "migrant-training", "quality"]);
  fields
    .filter((field) => servicePages.has(field.page_slug))
    .forEach((field) => {
      if (["feature_cards", "flow_cards", "faq_items"].includes(field.field_key)) {
        const cards = Array.isArray(field.json_value) ? field.json_value : Array.isArray(field.json_value?.items) ? field.json_value.items : [];
        if (!cards.length) addIssue(issues, { severity: "warning", scope: "service", title: `服務頁卡片列表為空：${field.page_slug} / ${field.field_label}`, detail: field.field_key, editUrl: `/admin/template-fields`, updatedAt: field.updated_at });
        cards.forEach((card, index) => {
          const hasTitle = card.title || card.question;
          const hasBody = card.body || card.description || card.answer;
          if (!hasTitle || !hasBody) addIssue(issues, { severity: "warning", scope: "service", title: `服務頁卡片內容不完整：${field.page_slug} / ${field.field_label} #${index + 1}`, detail: "請補齊標題與內容，或刪除空卡片。", editUrl: `/admin/template-fields`, updatedAt: field.updated_at });
        });
      }
      if (field.field_type === "image" && !field.image_id && !field.text_value) {
        addIssue(issues, { severity: "warning", scope: "service", title: `服務頁圖片欄位缺圖：${field.page_slug} / ${field.field_label}`, detail: field.field_key, editUrl: `/admin/template-fields`, updatedAt: field.updated_at });
      }
    });
}

function auditRecruiting(pages, departments, openings, issues) {
  pages.forEach((item) => {
    if (!item.title) addIssue(issues, { severity: "critical", scope: "recruiting", title: "招募頁 Hero 缺標題", detail: item.page_slug || item.id, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.body && !item.subtitle) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募頁 Hero 缺內文：${item.title || item.page_slug}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.hero_image_id && !item.hero_image_url) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募頁 Hero 缺圖片：${item.title || item.page_slug}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.primary_cta_text || !item.primary_cta_url) addIssue(issues, { severity: "info", scope: "recruiting", title: `招募頁 Hero 缺主要 CTA：${item.title || item.page_slug}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.is_enabled || item.status !== "published") addIssue(issues, { severity: "critical", scope: "recruiting", title: `招募頁未發布或停用：${item.title || item.page_slug}`, detail: `${item.status} / ${item.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
  });
  departments.forEach((item) => {
    if (!item.title) addIssue(issues, { severity: "critical", scope: "recruiting", title: "招募部門缺標題", detail: item.page_slug || item.id, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.department_slug) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募部門缺 slug：${item.title || "未命名"}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.description) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募部門缺描述：${item.title || "未命名"}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.image_id && !item.image_url) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募部門缺圖片：${item.title || "未命名"}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.is_enabled || item.status !== "published") addIssue(issues, { severity: "info", scope: "recruiting", title: `招募部門未發布或停用：${item.title || "未命名"}`, detail: `${item.status} / ${item.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
  });

  openings.forEach((item) => {
    if (!item.title) addIssue(issues, { severity: "critical", scope: "recruiting", title: "招募卡片缺標題", detail: item.page_slug || item.id, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.summary) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募卡片缺摘要：${item.title || "未命名"}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.image_id && !item.image_url) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募卡片缺圖片：${item.title || "未命名"}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.department_id) addIssue(issues, { severity: "warning", scope: "recruiting", title: `招募卡片未綁定部門：${item.title || "未命名"}`, detail: item.page_slug, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
    if (!item.is_enabled || item.status !== "published") addIssue(issues, { severity: "info", scope: "recruiting", title: `招募卡片未發布或停用：${item.title || "未命名"}`, detail: `${item.status} / ${item.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/recruiting", updatedAt: item.updated_at });
  });
}

function auditInvestor(notices, financialItems, files, charts, issues) {
  notices.forEach((item) => {
    if (!item.title) addIssue(issues, { severity: "critical", scope: "investor", title: "投資人公告缺標題", detail: item.notice_type || item.id, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (!item.date_label && !item.published_on) addIssue(issues, { severity: "warning", scope: "investor", title: `投資人公告缺日期：${item.title || "未命名"}`, detail: item.notice_type, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (!item.is_enabled || item.status !== "published") addIssue(issues, { severity: "info", scope: "investor", title: `投資人公告未發布或停用：${item.title || "未命名"}`, detail: `${item.status} / ${item.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
  });
  financialItems.forEach((item) => {
    if (!item.title) addIssue(issues, { severity: "critical", scope: "investor", title: "財務資料缺標題", detail: item.item_type || item.id, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
    if (!item.period_label) addIssue(issues, { severity: "warning", scope: "investor", title: `財務資料缺期間：${item.title || "未命名"}`, detail: item.item_type, editUrl: "/admin/investor-data", updatedAt: item.updated_at });
  });
  files.forEach((item) => {
    if (!item.file_url && !item.storage_path) addIssue(issues, { severity: "critical", scope: "investor", title: `下載檔缺連結：${item.title || item.file_name || "未命名"}`, detail: item.file_type || item.category, editUrl: "/admin/files", updatedAt: item.updated_at });
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
    if (!item.title) addIssue(issues, { severity: "critical", scope: "story", title: "真實照顧情境缺標題", detail: item.slug || item.id, editUrl: "/admin/stories", updatedAt: item.updated_at });
    if (!item.person_name) addIssue(issues, { severity: "warning", scope: "story", title: `真實照顧情境缺人物：${item.title || "未命名"}`, detail: item.slug, editUrl: "/admin/stories", updatedAt: item.updated_at });
    if (!item.cover_image_url) addIssue(issues, { severity: "warning", scope: "story", title: `真實照顧情境缺封面：${item.title || "未命名"}`, detail: item.slug, editUrl: "/admin/stories", updatedAt: item.updated_at });
    if (!item.avatar_image_url) addIssue(issues, { severity: "info", scope: "story", title: `真實照顧情境缺頭像：${item.title || "未命名"}`, detail: item.slug, editUrl: "/admin/stories", updatedAt: item.updated_at });
    if (!item.is_enabled || item.status !== "published") addIssue(issues, { severity: "info", scope: "story", title: `真實照顧情境未發布或停用：${item.title || "未命名"}`, detail: `${item.status} / ${item.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/stories", updatedAt: item.updated_at });
  });
  talks.forEach((item) => {
    if (!item.title) addIssue(issues, { severity: "critical", scope: "story", title: "名人講堂缺標題", detail: item.slug || item.id, editUrl: "/admin/stories", updatedAt: item.updated_at });
    if (!item.speaker_name) addIssue(issues, { severity: "warning", scope: "story", title: `名人講堂缺人物：${item.title || "未命名"}`, detail: item.slug, editUrl: "/admin/stories", updatedAt: item.updated_at });
    if (!item.image_url) addIssue(issues, { severity: "warning", scope: "story", title: `名人講堂缺圖片：${item.title || "未命名"}`, detail: item.slug, editUrl: "/admin/stories", updatedAt: item.updated_at });
    if (!item.summary) addIssue(issues, { severity: "warning", scope: "story", title: `名人講堂缺摘要：${item.title || "未命名"}`, detail: item.slug, editUrl: "/admin/stories", updatedAt: item.updated_at });
    if (!item.is_enabled || item.status !== "published") addIssue(issues, { severity: "info", scope: "story", title: `名人講堂未發布或停用：${item.title || "未命名"}`, detail: `${item.status} / ${item.is_enabled ? "enabled" : "disabled"}`, editUrl: "/admin/stories", updatedAt: item.updated_at });
  });
}

function renderKpis(issues) {
  const counts = {
    critical: issues.filter((issue) => issue.severity === "critical").length,
    warning: issues.filter((issue) => issue.severity === "warning").length,
    info: issues.filter((issue) => issue.severity === "info").length,
    total: issues.length
  };
  kpiGrid.innerHTML = [
    ["總問題", counts.total, "All"],
    ["Critical", counts.critical, "需先修"],
    ["Warning", counts.warning, "建議修"],
    ["Info", counts.info, "可追蹤"]
  ].map(([label, value, hint]) => `<article><span>${escapeHTML(hint)}</span><strong>${value}</strong><p>${escapeHTML(label)}</p></article>`).join("");
}

function filterIssues(issues) {
  if (activeFilter === "all") return issues;
  if (["critical", "warning", "info"].includes(activeFilter)) return issues.filter((issue) => issue.severity === activeFilter);
  return issues.filter((issue) => issue.scope === activeFilter);
}

function renderIssues() {
  const rows = filterIssues(currentIssues);
  if (!rows.length) {
    issueList.innerHTML = `<div class="admin-empty-state">目前沒有符合條件的內容問題。</div>`;
    return;
  }
  issueList.innerHTML = rows.map((issue) => `
    <article class="content-health-item" data-severity="${escapeHTML(issue.severity)}">
      <span>${escapeHTML(issue.severity)}</span>
      <div>
        <strong>${escapeHTML(issue.title)}</strong>
        <p>${escapeHTML(issue.detail || "請補齊後台欄位。")}</p>
        <small>${escapeHTML(issue.scope)}｜${formatUpdatedAt(issue.updatedAt)}</small>
      </div>
      <a href="${escapeHTML(issue.editUrl)}">前往修正</a>
    </article>
  `).join("");
}

async function loadContentHealth() {
  if (!supabase) return;
  refreshButton?.setAttribute("disabled", "true");
  setStatus("正在檢查全站設定、pages、page_sections、articles、media、招募、投資人、故事講堂...", "info");

  try {
    const [settingsResult, homeModulesResult, pagesResult, sectionsResult, templateFieldResult, articlesResult, mediaResult, recruitingPageResult, departmentResult, openingResult, noticeResult, financialResult, fileResult, chartResult, storyResult, talkResult] = await Promise.all([
      supabase.from("site_settings").select("id,setting_key,setting_label,value_text,value_json,is_enabled,updated_at").order("sort_order", { ascending: true }),
      supabase.from("content_modules").select("id,module_key,item_key,title,metadata,status,is_enabled,updated_at").eq("target_slug", "home").order("module_key", { ascending: true }),
      supabase.from("pages").select("id,slug,title,status,is_enabled,seo_title,seo_description,updated_at").order("sort_order", { ascending: true }),
      supabase.from("page_sections").select("id,page_id,section_key,title,layout,status,is_enabled,image_id,content_json,updated_at").order("sort_order", { ascending: true }),
      supabase.from("page_template_fields").select("id,page_slug,field_key,field_label,field_type,text_value,json_value,image_id,is_enabled,updated_at").order("page_slug", { ascending: true }),
      supabase.from("articles").select("id,slug,title,subtitle,excerpt,status,is_enabled,published_at,cover_image_id,seo_title,seo_description,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("media").select("id,file_name,storage_path,public_url,alt_text,width,height,updated_at,created_at").order("created_at", { ascending: false }).limit(500),
      supabase.from("recruiting_pages").select("id,page_slug,title,subtitle,body,hero_image_id,hero_image_url,primary_cta_text,primary_cta_url,status,is_enabled,updated_at").order("sort_order", { ascending: true }),
      supabase.from("recruiting_departments").select("id,page_slug,title,department_slug,description,image_id,image_url,status,is_enabled,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("recruiting_openings").select("id,page_slug,department_id,title,summary,image_id,image_url,status,is_enabled,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("investor_notices").select("id,title,notice_type,date_label,published_on,status,is_enabled,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("investor_financial_items").select("id,title,item_type,period_label,status,is_enabled,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("downloadable_files").select("id,title,file_name,file_type,category,file_url,storage_path,status,is_enabled,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("investor_chart_datasets").select("id,chart_title,chart_key,chart_type,unit_label,data_points,status,is_enabled,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("care_stories").select("id,title,slug,person_name,cover_image_url,avatar_image_url,status,is_enabled,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("expert_talks").select("id,title,slug,speaker_name,summary,image_url,status,is_enabled,updated_at").order("updated_at", { ascending: false }).limit(500)
    ]);

    [settingsResult, homeModulesResult, pagesResult, sectionsResult, templateFieldResult, articlesResult, mediaResult, recruitingPageResult, departmentResult, openingResult, noticeResult, financialResult, fileResult, chartResult, storyResult, talkResult].forEach((result) => {
      if (result.error) throw result.error;
    });

    const issues = [];
    auditSiteSettings(settingsResult.data || [], issues);
    auditHomeModules(homeModulesResult.data || [], issues);
    auditPages(pagesResult.data || [], sectionsResult.data || [], issues);
    auditServiceTemplateFields(templateFieldResult.data || [], issues);
    auditArticles(articlesResult.data || [], issues);
    auditMedia(mediaResult.data || [], issues);
    auditRecruiting(recruitingPageResult.data || [], departmentResult.data || [], openingResult.data || [], issues);
    auditInvestor(noticeResult.data || [], financialResult.data || [], fileResult.data || [], chartResult.data || [], issues);
    auditStories(storyResult.data || [], talkResult.data || [], issues);
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
  const header = ["severity", "scope", "title", "detail", "editUrl", "updatedAt"];
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
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadContentHealth
}).catch((error) => reportAdminBootError(loading, error));
