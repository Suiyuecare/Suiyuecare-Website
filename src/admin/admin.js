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
  pages: document.querySelector('[data-dashboard-count="pages"]')
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
  const [articlesResult, pagesResult] = await Promise.all([
    supabase
      .from("articles")
      .select("id, slug, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("pages")
      .select("id, slug, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(6)
  ]);

  if (articlesResult.error) throw articlesResult.error;
  if (pagesResult.error) throw pagesResult.error;

  return [
    ...normalizeUpdateRows(articlesResult.data || [], "文章"),
    ...normalizeUpdateRows(pagesResult.data || [], "頁面")
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
    const [articles, publishedArticles, draftArticles, categories, pages, updates] = await Promise.all([
      getTableCount("articles"),
      getTableCount("articles", (query) => query.eq("status", "published")),
      getTableCount("articles", (query) => query.eq("status", "draft")),
      getTableCount("article_categories"),
      getTableCount("pages"),
      fetchRecentUpdates()
    ]);

    if (countTargets.articles) countTargets.articles.textContent = formatCount(articles);
    if (countTargets.publishedArticles) countTargets.publishedArticles.textContent = formatCount(publishedArticles);
    if (countTargets.draftArticles) countTargets.draftArticles.textContent = formatCount(draftArticles);
    if (countTargets.categories) countTargets.categories.textContent = formatCount(categories);
    if (countTargets.pages) countTargets.pages.textContent = formatCount(pages);
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
