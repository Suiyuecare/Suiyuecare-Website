import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#apmStatus");
const board = document.querySelector("#apmBoard");

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

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: renderBoard
})
  .then(() => bindAdminLogout(logoutButton))
  .catch((error) => reportAdminBootError(loading, error));
