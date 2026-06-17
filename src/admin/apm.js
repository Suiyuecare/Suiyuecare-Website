import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#apmStatus");
const board = document.querySelector("#apmBoard");
const portalSessionKey = "suiyuecare.apm.portalSession";
const portalHomeUrl = "https://login.suiyuecare.com/portal/";

const columns = [
  {
    title: "Backlog",
    caption: "待拆解需求",
    cards: [
      ["Finance 串接", "會計系統從 Portal 直達 Finance", "執行長"],
      ["APM Supabase", "規劃獨立專案資料表與 RLS", "資訊課"]
    ]
  },
  {
    title: "Sprint",
    caption: "本期執行",
    cards: [
      ["Portal SSO", "共用 Google 登入與 Portal 權限", "資訊課"],
      ["Data Scope", "專案依負責人、部門、公司控管", "總務課"]
    ]
  },
  {
    title: "Review",
    caption: "等待確認",
    cards: [
      ["操作紀錄", "任務指派、狀態異動需留紀錄", "行政部"]
    ]
  },
  {
    title: "Done",
    caption: "已完成",
    cards: [
      ["APM 入口", "敏捷專案管理已接入 Portal", "系統"]
    ]
  }
];

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function readPortalHandoff() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("portal") !== "1") return null;
  const email = params.get("email") || "";
  if (!email) return null;

  return {
    email,
    role: params.get("role") || "Portal 使用者",
    scope: params.get("scope") || "assigned",
    signedInAt: new Date().toISOString()
  };
}

function getStoredPortalSession() {
  try {
    const raw = window.localStorage.getItem(portalSessionKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredPortalSession(session) {
  window.localStorage.setItem(portalSessionKey, JSON.stringify(session));
}

function clearStoredPortalSession() {
  window.localStorage.removeItem(portalSessionKey);
}

function renderPortalSession(session) {
  if (userEmail) userEmail.textContent = session.email;
  if (userInitial) userInitial.textContent = session.email.trim().charAt(0).toUpperCase();
  loading?.remove();
  if (shell) shell.hidden = false;
  renderBoard(
    { user: { email: session.email } },
    { role: session.role || "portal", scope: session.scope || "assigned" }
  );
}

function renderBoard(session, permissions) {
  if (!board) return;
  board.replaceChildren(
    ...columns.map((column) => {
      const article = document.createElement("article");
      article.innerHTML = `
        <span>${escapeHTML(column.title)}</span>
        <strong>${escapeHTML(column.caption)}</strong>
        <p>${column.cards
          .map(
            ([title, body, owner]) => `
              <span class="admin-soft-note">${escapeHTML(owner)}</span>
              <b>${escapeHTML(title)}</b><br>
              ${escapeHTML(body)}
            `
          )
          .join("<hr>")}</p>
      `;
      return article;
    })
  );

  setStatus(`已使用 ${session.user.email || "Google 帳號"} 進入 APM。角色：${permissions.role || "viewer"}。`, "success");
}

async function bootApm() {
  const handoff = readPortalHandoff();
  if (handoff) {
    setStoredPortalSession(handoff);
    window.history.replaceState({}, "", "/");
    await wait(450);
    renderPortalSession(handoff);
    return;
  }

  const storedSession = getStoredPortalSession();
  if (storedSession?.email) {
    await wait(300);
    renderPortalSession(storedSession);
    return;
  }

  if (window.location.hostname === "apm.suiyuecare.com") {
    window.location.replace(portalHomeUrl);
    return;
  }

  await bootProtectedAdminPage({
    loading,
    shell,
    userEmail,
    userInitial,
    logoutButton,
    onReady: renderBoard
  });
  bindAdminLogout(logoutButton);
}

logoutButton?.addEventListener("click", () => {
  clearStoredPortalSession();
  window.location.href = portalHomeUrl;
});

bootApm().catch((error) => reportAdminBootError(loading, error));
