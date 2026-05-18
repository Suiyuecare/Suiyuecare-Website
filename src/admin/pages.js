import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt, renderEnabledBadge } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const pagesStatus = document.querySelector("#adminPagesStatus");
const pagesTableBody = document.querySelector("#adminPagesTableBody");
const refreshPagesButton = document.querySelector("#adminRefreshPages");

function setPagesStatus(message, type = "info") {
  if (!pagesStatus) return;
  pagesStatus.hidden = !message;
  pagesStatus.textContent = message;
  pagesStatus.dataset.status = type;
}

function renderPages(rows) {
  if (!pagesTableBody) return;

  if (!rows.length) {
    pagesTableBody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="admin-empty-state">目前沒有頁面資料。</div>
        </td>
      </tr>
    `;
    return;
  }

  pagesTableBody.innerHTML = rows.map((page) => `
    <tr>
      <td>
        <strong>${escapeHTML(page.title || "未命名頁面")}</strong>
        <small>${escapeHTML(page.menu_label || page.subtitle || "尚無描述")}</small>
      </td>
      <td><code>/${escapeHTML(page.slug || "")}</code></td>
      <td>${renderEnabledBadge(Boolean(page.is_enabled))}</td>
      <td><time>${formatUpdatedAt(page.updated_at)}</time></td>
      <td>
        <a class="admin-row-action" href="/admin/pages/${encodeURIComponent(page.id)}">編輯</a>
      </td>
    </tr>
  `).join("");
}

async function loadPages() {
  if (!supabase) return;
  refreshPagesButton?.setAttribute("disabled", "true");
  setPagesStatus("正在讀取 Supabase pages...", "info");

  try {
    const { data, error } = await supabase
      .from("pages")
      .select("id, title, menu_label, subtitle, slug, is_enabled, updated_at")
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });

    if (error) throw error;

    renderPages(data || []);
    setPagesStatus("", "success");
  } catch (error) {
    console.error("Failed to load pages", error);
    setPagesStatus(`無法讀取頁面列表：${error.message}`, "error");
    renderPages([]);
  } finally {
    refreshPagesButton?.removeAttribute("disabled");
  }
}

refreshPagesButton?.addEventListener("click", loadPages);
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadPages
}).catch((error) => reportAdminBootError(loading, error));
