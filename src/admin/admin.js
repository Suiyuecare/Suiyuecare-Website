import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatCount, formatUpdatedAt } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const dashboardStatus = document.querySelector("#adminDashboardStatus");
const recentUpdates = document.querySelector("#adminRecentUpdates");
const refreshDashboardButton = document.querySelector("#adminRefreshDashboard");

const countTargets = {
  articles: document.querySelector('[data-dashboard-count="articles"]'),
  publishedArticles: document.querySelector('[data-dashboard-count="publishedArticles"]'),
  draftArticles: document.querySelector('[data-dashboard-count="draftArticles"]'),
  categories: document.querySelector('[data-dashboard-count="categories"]'),
  pages: document.querySelector('[data-dashboard-count="pages"]'),
  contentModules: document.querySelector('[data-dashboard-count="contentModules"]'),
  templateFields: document.querySelector('[data-dashboard-count="templateFields"]'),
  courses: document.querySelector('[data-dashboard-count="courses"]'),
  forms: document.querySelector('[data-dashboard-count="forms"]'),
  recruiting: document.querySelector('[data-dashboard-count="recruiting"]'),
  investor: document.querySelector('[data-dashboard-count="investor"]'),
  stories: document.querySelector('[data-dashboard-count="stories"]')
};

function setDashboardStatus(message, type = "info") {
  if (!dashboardStatus) return;
  dashboardStatus.hidden = !message;
  dashboardStatus.textContent = message;
  dashboardStatus.dataset.status = type;
}

async function getTableCount(table, applyFilter) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (applyFilter) query = applyFilter(query);

  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

function normalizeUpdateRows(rows, type) {
  return rows.map((row) => ({
    id: row.id,
    type,
    title: row.title || "未命名內容",
    status: row.status || "draft",
    updatedAt: row.updated_at,
    slug: row.slug || ""
  }));
}

async function fetchRecentUpdates() {
  const [articlesResult, pagesResult, openingsResult, noticesResult, storiesResult, talksResult] = await Promise.all([
    supabase
      .from("articles")
      .select("id, slug, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("pages")
      .select("id, slug, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("recruiting_openings")
      .select("id, opening_slug, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("investor_notices")
      .select("id, notice_type, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("care_stories")
      .select("id, slug, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("expert_talks")
      .select("id, slug, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(6)
  ]);

  if (articlesResult.error) throw articlesResult.error;
  if (pagesResult.error) throw pagesResult.error;
  if (openingsResult.error) throw openingsResult.error;
  if (noticesResult.error) throw noticesResult.error;
  if (storiesResult.error) throw storiesResult.error;
  if (talksResult.error) throw talksResult.error;

  return [
    ...normalizeUpdateRows(articlesResult.data || [], "文章"),
    ...normalizeUpdateRows(pagesResult.data || [], "頁面"),
    ...normalizeUpdateRows((openingsResult.data || []).map((row) => ({ ...row, slug: row.opening_slug })), "招募"),
    ...normalizeUpdateRows((noticesResult.data || []).map((row) => ({ ...row, slug: row.notice_type })), "投資人"),
    ...normalizeUpdateRows(storiesResult.data || [], "故事"),
    ...normalizeUpdateRows(talksResult.data || [], "講堂")
  ]
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 8);
}

function renderRecentUpdates(items) {
  if (!recentUpdates) return;

  if (!items.length) {
    recentUpdates.innerHTML = '<div class="admin-empty-state">目前沒有更新紀錄。</div>';
    return;
  }

  recentUpdates.innerHTML = items.map((item) => `
    <article>
      <span>${escapeHTML(item.type)}</span>
      <div>
        <strong>${escapeHTML(item.title)}</strong>
        <small>${item.slug ? `/${escapeHTML(item.slug)}` : "尚無 slug"}</small>
      </div>
      <em data-status="${escapeHTML(item.status)}">${escapeHTML(item.status)}</em>
      <time>${formatUpdatedAt(item.updatedAt)}</time>
    </article>
  `).join("");
}

async function loadDashboardData() {
  if (!supabase) return;
  refreshDashboardButton?.setAttribute("disabled", "true");
  setDashboardStatus("正在讀取 Supabase 資料...", "info");

  try {
    const [articles, publishedArticles, draftArticles, categories, pages, contentModules, templateFields, courses, forms, recruiting, investor, careStories, expertTalks, updates] = await Promise.all([
      getTableCount("articles"),
      getTableCount("articles", (query) => query.eq("status", "published")),
      getTableCount("articles", (query) => query.eq("status", "draft")),
      getTableCount("article_categories"),
      getTableCount("pages"),
      getTableCount("content_modules", (query) => query.eq("target_slug", "home").eq("is_enabled", true)),
      getTableCount("page_template_fields", (query) => query.eq("is_enabled", true)),
      getTableCount("courses", (query) => query.eq("status", "published").eq("is_enabled", true)),
      getTableCount("form_submissions", (query) => query.eq("status", "new")),
      getTableCount("recruiting_openings", (query) => query.eq("status", "published").eq("is_enabled", true)),
      getTableCount("investor_notices", (query) => query.eq("status", "published").eq("is_enabled", true)),
      getTableCount("care_stories", (query) => query.eq("status", "published").eq("is_enabled", true)),
      getTableCount("expert_talks", (query) => query.eq("status", "published").eq("is_enabled", true)),
      fetchRecentUpdates()
    ]);

    if (countTargets.articles) countTargets.articles.textContent = formatCount(articles);
    if (countTargets.publishedArticles) countTargets.publishedArticles.textContent = formatCount(publishedArticles);
    if (countTargets.draftArticles) countTargets.draftArticles.textContent = formatCount(draftArticles);
    if (countTargets.categories) countTargets.categories.textContent = formatCount(categories);
    if (countTargets.pages) countTargets.pages.textContent = formatCount(pages);
    if (countTargets.contentModules) countTargets.contentModules.textContent = formatCount(contentModules);
    if (countTargets.templateFields) countTargets.templateFields.textContent = formatCount(templateFields);
    if (countTargets.courses) countTargets.courses.textContent = formatCount(courses);
    if (countTargets.forms) countTargets.forms.textContent = formatCount(forms);
    if (countTargets.recruiting) countTargets.recruiting.textContent = formatCount(recruiting);
    if (countTargets.investor) countTargets.investor.textContent = formatCount(investor);
    if (countTargets.stories) countTargets.stories.textContent = formatCount(careStories + expertTalks);
    renderRecentUpdates(updates);
    setDashboardStatus("", "success");
  } catch (error) {
    console.error("Failed to load dashboard data", error);
    setDashboardStatus(`無法讀取 Dashboard 資料：${error.message}`, "error");
    renderRecentUpdates([]);
  } finally {
    refreshDashboardButton?.removeAttribute("disabled");
  }
}

refreshDashboardButton?.addEventListener("click", loadDashboardData);
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadDashboardData
}).catch((error) => reportAdminBootError(loading, error));
