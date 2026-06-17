import { hasAdminPermission } from "./auth.js";

const navGroups = [
  {
    label: "日常內容",
    items: [
      { href: "/admin", code: "HOME", label: "工作台", hint: "今天要做什麼" },
      { href: "/admin/articles", code: "POST", label: "文章", hint: "健康 3.0、消息、故事" },
      { href: "/admin/stories", code: "TALK", label: "故事講堂", hint: "照顧故事、名人講堂", permission: "can_view_articles" },
      { href: "/admin/media", code: "IMG", label: "圖片庫", hint: "上傳、裁切、查使用位置", permission: "can_view_media" },
      { href: "/admin/pages", code: "PAGE", label: "官網頁面", hint: "首頁、服務、招募文案", permission: "can_view_pages" },
      { href: "/admin/home-modules", code: "HOME", label: "首頁模組", hint: "首頁動態、影片、故事", permission: "can_view_pages" },
      { href: "/admin/template-fields", code: "TPL", label: "模板欄位", hint: "服務頁固定欄位", permission: "can_view_pages" },
      { href: "/admin/courses", code: "EDU", label: "課程", hint: "課程卡片與報名", permission: "can_view_courses" },
      { href: "/admin/recruiting", code: "JOB", label: "招募", hint: "職缺與部門頁", permission: "can_view_recruiting" },
      { href: "/admin/investor-data", code: "IR", label: "投資人", hint: "公告、財報、圖表", permission: "can_view_investor" },
      { href: "/admin/files", code: "FILE", label: "下載檔", hint: "投資人、課程、文件下載", permission: "can_view_files" }
    ]
  },
  {
    label: "上線檢查",
    items: [
      { href: "/admin/governance", code: "PUB", label: "發布中心", hint: "送審、核准、發布" },
      { href: "/admin/content-health", code: "QA", label: "內容健康", hint: "缺圖、缺 SEO、未發布", permission: "can_view_content_health" },
      { href: "/admin/forms", code: "FORM", label: "表單案件", hint: "諮詢、報名、投資洽談", permission: "can_view_forms" }
    ]
  },
  {
    label: "系統管理",
    items: [
      { href: "/admin/users", code: "USER", label: "人員權限", hint: "誰能看、誰能改", permission: "can_manage_users" },
      { href: "/admin/site-settings", code: "SET", label: "全站設定", hint: "聯絡資訊、CTA、社群", permission: "can_edit_site_settings" },
      { href: "/admin/traffic", code: "DATA", label: "網站流量", hint: "訪客、來源、轉換", permission: "can_view_analytics" },
      { href: "/admin/backups", code: "SAVE", label: "備份還原", hint: "上線前備份", permission: "can_manage_backups" }
    ]
  }
];

function normalizePath(pathname = window.location.pathname) {
  return pathname.replace(/\/index\.html$/, "").replace(/\/$/, "") || "/admin";
}

function isActivePath(currentPath, itemPath) {
  const normalizedItem = normalizePath(itemPath);
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
      <strong>不知道去哪裡？先到工作台</strong>
      <p>日常只要用文章、故事講堂、圖片庫、官網頁面、課程、招募、投資人與表單案件；系統管理只會顯示給有權限的人。</p>
    `;
  }
}
