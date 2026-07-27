import { hasAdminPermission } from "./auth.js";

const navGroups = [
  {
    label: "我的工作",
    items: [
      { href: "/admin", code: "HOME", label: "工作台", hint: "今天要做什麼" },
      { href: "/admin/visual-editor", code: "EDIT", label: "我的頁面", hint: "看著前台直接修改" },
      { href: "/admin/governance?view=drafts", code: "DRAFT", label: "我的草稿", hint: "繼續尚未送出的頁面" },
      { href: "/admin/governance?view=pending", code: "WAIT", label: "等待審核", hint: "已送給執行長的內容" },
      { href: "/admin/governance?view=rejected", code: "BACK", label: "已退回", hint: "查看原因並繼續修改" }
    ]
  },
  {
    label: "專用管理",
    items: [
      { href: "/admin/articles", code: "POST", label: "文章", hint: "健康 3.0、消息、故事" },
      { href: "/admin/courses", code: "EDU", label: "課程", hint: "課程卡片與報名", permission: "can_view_courses" },
      { href: "/admin/recruiting", code: "JOB", label: "職缺資料", hint: "人才招募的部門與職缺", permission: "can_view_recruiting" },
      { href: "/admin/investor-data", code: "IR", label: "投資人", hint: "公告、財報、圖表", permission: "can_view_investor" },
      { href: "/admin/forms", code: "FORM", label: "表單案件", hint: "諮詢、報名、投資洽談", permission: "can_view_forms" }
    ]
  },
  {
    label: "Owner 進階工具",
    ownerOnly: true,
    items: [
      { href: "/admin/governance", code: "PUB", label: "整頁審核", hint: "比較、核准、退回" },
      { href: "/admin/content-health", code: "QA", label: "內容健康", hint: "缺圖、缺 SEO、未發布", permission: "can_view_content_health" },
      { href: "/admin/users", code: "USER", label: "人員權限", hint: "誰能看、誰能改", permission: "can_manage_users" },
      { href: "/admin/media", code: "IMG", label: "圖片庫", hint: "上傳、裁切、查使用位置", permission: "can_view_media" },
      { href: "/admin/pages", code: "PAGE", label: "舊版頁面編輯", hint: "進階資料與 SEO", permission: "can_view_pages" },
      { href: "/admin/home-modules", code: "HOME", label: "舊版首頁模組", hint: "首頁資料表工具", permission: "can_view_home_content" },
      { href: "/admin/template-fields", code: "SLOT", label: "舊版固定版位", hint: "欄位與結構資料", permission: "can_view_service_content" },
      { href: "/admin/milestones", code: "TIME", label: "大事記", hint: "時間軸卡片", permission: "can_view_brand_content" },
      { href: "/admin/files", code: "FILE", label: "下載檔", hint: "投資人、課程、文件下載", permission: "can_view_files" },
      { href: "/admin/site-settings", code: "SET", label: "全站設定", hint: "聯絡資訊、CTA、社群", permission: "can_view_site_settings" },
      { href: "/admin/traffic", code: "DATA", label: "網站流量", hint: "訪客、來源、轉換", permission: "can_view_analytics" },
      { href: "/admin/backups", code: "SAVE", label: "備份還原", hint: "上線前備份", permission: "can_manage_backups" }
    ]
  }
];

function normalizePath(pathname = window.location.pathname) {
  const pathOnly = String(pathname || "").split(/[?#]/)[0];
  return pathOnly.replace(/\/index\.html$/, "").replace(/\/$/, "") || "/admin";
}

function isActivePath(currentPath, itemPath) {
  const normalizedItem = normalizePath(itemPath);
  const itemQuery = String(itemPath).split("?")[1] || "";
  if (itemQuery) {
    if (currentPath !== normalizedItem) return false;
    const currentParams = new URLSearchParams(window.location.search);
    const itemParams = new URLSearchParams(itemQuery);
    return Array.from(itemParams.entries()).every(([key, value]) => currentParams.get(key) === value);
  }
  if (normalizedItem === "/admin") return currentPath === "/admin";
  return currentPath === normalizedItem || currentPath.startsWith(`${normalizedItem}/`);
}

function canSeeItem(item, permissions) {
  return !item.permission || hasAdminPermission(permissions, item.permission);
}

export function renderAdminNavigation(permissions = {}) {
  const nav = document.querySelector(".admin-menu");
  if (!nav) return;

  const currentPath = normalizePath();
  const html = navGroups.map((group) => {
    if (group.ownerOnly && permissions?.role !== "owner") return "";
    const visibleItems = group.items.filter((item) => canSeeItem(item, permissions));
    if (!visibleItems.length) return "";

    return `
      <section class="admin-menu-section" aria-label="${group.label}">
        <span class="admin-menu-section-label">${group.label}</span>
        ${visibleItems.map((item) => `
          <a href="${item.href}" class="${isActivePath(currentPath, item.href) ? "active" : ""}" title="${item.hint}">
            <span>${item.code}</span>
            <strong>${item.label}<small>${item.hint}</small></strong>
          </a>
        `).join("")}
      </section>
    `;
  }).join("");

  nav.innerHTML = html;

  const note = document.querySelector(".admin-sidebar-note");
  if (note) {
    note.innerHTML = `
      <span>Need Help?</span>
      <strong>不知道去哪裡？先開「我的頁面」</strong>
      <p>點前台畫面就能找到文字與圖片；送出後由執行長確認，正式官網不會被直接改動。</p>
    `;
  }
}
