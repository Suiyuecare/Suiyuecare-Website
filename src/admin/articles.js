import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const articlesStatus = document.querySelector("#adminArticlesStatus");
const articlesTableBody = document.querySelector("#adminArticlesTableBody");
const refreshArticlesButton = document.querySelector("#adminRefreshArticles");

let articles = [];

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

function renderArticles() {
  if (!articlesTableBody) return;

  if (!articles.length) {
    articlesTableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="admin-empty-state">目前沒有文章資料。</div>
        </td>
      </tr>
    `;
    return;
  }

  articlesTableBody.innerHTML = articles.map((article) => {
    const categoryName = article.article_categories?.name || "未分類";
    return `
      <tr>
        <td>
          <strong>${escapeHTML(article.title || "未命名文章")}</strong>
          <small>${escapeHTML(article.subtitle || article.slug || "尚無副標題")}</small>
        </td>
        <td>${escapeHTML(categoryName)}</td>
        <td>${renderPublishBadge(article.status)}</td>
        <td>${renderFeaturedBadge(Boolean(article.is_featured))}</td>
        <td><time>${article.published_at ? formatUpdatedAt(article.published_at) : "尚未發布"}</time></td>
        <td><time>${formatUpdatedAt(article.updated_at)}</time></td>
        <td>
          <div class="admin-table-actions">
            <a href="/admin/articles/${encodeURIComponent(article.id)}">編輯</a>
            <button type="button" data-delete-article="${escapeHTML(article.id)}">刪除</button>
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
        title,
        subtitle,
        slug,
        status,
        is_featured,
        published_at,
        updated_at,
        article_categories (
          id,
          name,
          slug
        )
      `)
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false });

    if (error) throw error;

    articles = data || [];
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
  const article = articles.find((item) => item.id === id);
  if (!article) return;
  if (!window.confirm(`確定要刪除「${article.title}」嗎？此動作無法復原。`)) return;

  setArticlesStatus("正在刪除文章...", "info");
  try {
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) throw error;

    setArticlesStatus("文章已刪除。", "success");
    await loadArticles();
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
  onReady: loadArticles
}).catch((error) => reportAdminBootError(loading, error));
