import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";
import { canEditScope, canPublishScope, contentDeleteMessage } from "./content-scope.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const articlesStatus = document.querySelector("#adminArticlesStatus");
const articlesTableBody = document.querySelector("#adminArticlesTableBody");
const refreshArticlesButton = document.querySelector("#adminRefreshArticles");

let articles = [];
let categoryById = new Map();
let adminPermissions = {};

function setArticlesStatus(message, type = "info") {
  if (!articlesStatus) return;
  articlesStatus.hidden = !message;
  articlesStatus.textContent = message;
  articlesStatus.dataset.status = type;
}

function renderPublishBadge(status = "draft") {
  const labels = {
    draft: "草稿",
    scheduled: "排程",
    published: "已發布",
    archived: "封存"
  };
  return `<span class="admin-publish-badge" data-status="${escapeHTML(status)}">${escapeHTML(labels[status] || status)}</span>`;
}

function renderFeaturedBadge(isFeatured) {
  const state = isFeatured ? "featured" : "normal";
  const label = isFeatured ? "置頂" : "一般";
  return `<span class="admin-state-badge" data-state="${state}">${label}</span>`;
}

function renderContentType(value = "article") {
  const labels = {
    article: "一般文章",
    lazy_pack: "懶人包",
    event: "活動",
    video: "影音",
    short_video: "短影片",
    interview: "名人講堂",
    news: "最新動態"
  };
  return labels[value] || value || "一般文章";
}

function renderArticles() {
  if (!articlesTableBody) return;

  if (!articles.length) {
    articlesTableBody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="admin-empty-state">目前沒有文章資料。</div>
        </td>
      </tr>
    `;
    return;
  }

  articlesTableBody.innerHTML = articles.map((article) => {
    const category = categoryById.get(article.category_id);
    const categoryName = category?.name || "未分類";
    const categoryMeta = category
      ? `${category.section_key || "health"}${category.is_enabled === false ? " · 已停用" : ""}`
      : "尚未選擇分類";
    return `
      <tr>
        <td>
          <strong>${escapeHTML(article.title || "未命名文章")}</strong>
          <small>${escapeHTML(article.subtitle || article.slug || "尚無副標題")}</small>
        </td>
        <td>
          <strong>${escapeHTML(categoryName)}</strong>
          <small>${escapeHTML(categoryMeta)}</small>
        </td>
        <td>
          <strong>${escapeHTML(renderContentType(article.content_type))}</strong>
          <small>${escapeHTML(article.related_service || article.target_audience || "未設定")}${article.reading_minutes ? ` · ${Number(article.reading_minutes)} 分鐘` : ""}</small>
        </td>
        <td>${renderPublishBadge(article.status)}</td>
        <td>${renderFeaturedBadge(Boolean(article.is_featured))}</td>
        <td><time>${article.published_at ? formatUpdatedAt(article.published_at) : "尚未發布"}</time></td>
        <td><time>${formatUpdatedAt(article.updated_at)}</time></td>
        <td>
          <div class="admin-table-actions">
            <a href="/admin/articles/${encodeURIComponent(article.id)}">${canEditScope(adminPermissions, "health") ? "編輯" : "查看"}</a>
            ${canEditScope(adminPermissions, "health") ? `<button type="button" data-delete-article="${escapeHTML(article.id)}">刪除</button>` : ""}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

async function loadArticles() {
  if (!supabase) return;
  refreshArticlesButton?.setAttribute("disabled", "true");
  setArticlesStatus("正在讀取文章資料...", "info");

  try {
    const { data, error } = await supabase
      .from("articles")
      .select(`
        id,
        category_id,
        title,
        subtitle,
        slug,
        content_type,
        status,
        reading_minutes,
        target_audience,
        related_service,
        is_featured,
        published_at,
        updated_at
      `)
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false });

    if (error) throw error;

    articles = data || [];
    const categoryIds = [...new Set(articles.map((article) => article.category_id).filter(Boolean))];
    if (categoryIds.length) {
      const { data: categoryRows, error: categoryError } = await supabase
        .from("article_categories")
        .select("id, name, slug, section_key, is_enabled")
        .in("id", categoryIds);
      if (categoryError) throw categoryError;
      categoryById = new Map((categoryRows || []).map((category) => [category.id, category]));
    } else {
      categoryById = new Map();
    }
    renderArticles();
    setArticlesStatus("", "success");
  } catch (error) {
    console.error("Failed to load articles", error);
    setArticlesStatus(`無法讀取文章列表：${error.message}`, "error");
    articles = [];
    renderArticles();
  } finally {
    refreshArticlesButton?.removeAttribute("disabled");
  }
}

async function deleteArticle(id) {
  if (!canEditScope(adminPermissions, "health")) {
    setArticlesStatus("你的帳號只有檢視健康文章的權限。", "error");
    return;
  }
  const article = articles.find((item) => item.id === id);
  if (!article) return;
  if (!window.confirm(`確定要刪除「${article.title}」嗎？此動作無法復原。`)) return;

  setArticlesStatus("正在刪除文章...", "info");
  try {
    const { error } = await supabase.from("articles").delete().eq("id", id).select("id").maybeSingle();
    if (error) throw error;

    setArticlesStatus(contentDeleteMessage(adminPermissions, "health", "文章"), "success");
    if (canPublishScope(adminPermissions, "health")) await loadArticles();
  } catch (error) {
    console.error("Failed to delete article", error);
    setArticlesStatus(`刪除失敗：${error.message}`, "error");
  }
}

refreshArticlesButton?.addEventListener("click", loadArticles);
articlesTableBody?.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-article]");
  if (deleteButton) deleteArticle(deleteButton.dataset.deleteArticle);
});
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: async (_session, permissions) => {
    adminPermissions = permissions || {};
    await loadArticles();
  }
}).catch((error) => reportAdminBootError(loading, error));
