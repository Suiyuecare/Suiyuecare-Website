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
  setStatus("正在檢查 pages、page_sections、articles、media...", "info");

  try {
    const [pagesResult, sectionsResult, articlesResult, mediaResult] = await Promise.all([
      supabase.from("pages").select("id,slug,title,status,is_enabled,seo_title,seo_description,updated_at").order("sort_order", { ascending: true }),
      supabase.from("page_sections").select("id,page_id,section_key,title,layout,status,is_enabled,image_id,content_json,updated_at").order("sort_order", { ascending: true }),
      supabase.from("articles").select("id,slug,title,subtitle,excerpt,status,is_enabled,published_at,cover_image_id,seo_title,seo_description,updated_at").order("updated_at", { ascending: false }).limit(500),
      supabase.from("media").select("id,file_name,storage_path,public_url,alt_text,width,height,updated_at,created_at").order("created_at", { ascending: false }).limit(500)
    ]);

    [pagesResult, sectionsResult, articlesResult, mediaResult].forEach((result) => {
      if (result.error) throw result.error;
    });

    const issues = [];
    auditPages(pagesResult.data || [], sectionsResult.data || [], issues);
    auditArticles(articlesResult.data || [], issues);
    auditMedia(mediaResult.data || [], issues);
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
