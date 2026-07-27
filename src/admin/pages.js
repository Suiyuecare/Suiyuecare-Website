import { supabase } from "../lib/supabaseClient.js";
import { canEditScope, canViewScope, scopeForPageSlug } from "./content-scope.js";
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
let adminPermissions = {};

const dedicatedManagerBySlug = {
  milestones: ["/admin/milestones", "管理大事記"],
  "home-care": ["/admin/template-fields?page=home-care", "管理固定版位"],
  "day-care": ["/admin/template-fields?page=day-care", "管理固定版位"],
  community: ["/admin/template-fields?page=community", "管理固定版位"],
  nursing: ["/admin/template-fields?page=nursing", "管理固定版位"],
  "migrant-training": ["/admin/template-fields?page=migrant-training", "管理固定版位"],
  quality: ["/admin/template-fields?page=quality", "管理固定版位"],
  software: ["/admin/template-fields?page=software", "管理固定版位"],
  talent: ["/admin/recruiting?page=talent", "管理招募"],
  land: ["/admin/recruiting?page=land", "管理招募"],
  "investor-recruiting": ["/admin/recruiting?page=investor-recruiting", "管理招募"],
  health: ["/admin/articles", "管理文章"],
  courses: ["/admin/courses", "管理課程"],
  investors: ["/admin/investor-data", "管理投資人內容"],
  "ir-finance": ["/admin/investor-data", "管理投資人內容"],
  "ir-governance": ["/admin/investor-data", "管理投資人內容"],
  "ir-shareholders": ["/admin/investor-data", "管理投資人內容"],
  contact: ["/admin/pages", "查看首頁 contact 版位"]
};

function pageAction(page) {
  const dedicated = dedicatedManagerBySlug[page.slug];
  const editable = canEditScope(adminPermissions, scopeForPageSlug(page.slug));
  if (dedicated) return { href: dedicated[0], label: editable ? dedicated[1] : "檢視內容" };
  return {
    href: `/admin/pages/${encodeURIComponent(page.id)}`,
    label: page.slug === "about" || !editable ? "檢視內容" : "編輯"
  };
}

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

  pagesTableBody.innerHTML = rows.map((page) => {
    const action = pageAction(page);
    return `
    <tr>
      <td>
        <strong>${escapeHTML(page.title || "未命名頁面")}</strong>
        <small>${escapeHTML(page.menu_label || page.subtitle || "尚無描述")}</small>
      </td>
      <td><code>/${escapeHTML(page.slug || "")}</code></td>
      <td>${renderEnabledBadge(Boolean(page.is_enabled))}</td>
      <td><time>${formatUpdatedAt(page.updated_at)}</time></td>
      <td>
        <a class="admin-row-action" href="${escapeHTML(action.href)}">${escapeHTML(action.label)}</a>
      </td>
    </tr>
  `;
  }).join("");
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

    const ownedPages = (data || []).filter((page) => canViewScope(adminPermissions, scopeForPageSlug(page.slug)));
    renderPages(ownedPages);
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
  onReady: (_session, permissions) => {
    adminPermissions = permissions || {};
    loadPages();
  }
}).catch((error) => reportAdminBootError(loading, error));
