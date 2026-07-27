import { supabase } from "../lib/supabaseClient.js";
import { prepareImageForUpload, uploadImageToMedia } from "./media-utils.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";
import { canEditScope, canPublishScope, contentDeleteMessage, contentSaveMessage } from "./content-scope.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#adminMilestonesStatus");
const form = document.querySelector("#milestoneEditorForm");
const formTitle = document.querySelector("#milestoneFormTitle");
const requestPublishButton = document.querySelector("#requestMilestonePublishButton");
const newButton = document.querySelector("#newMilestoneButton");
const refreshButton = document.querySelector("#refreshMilestonesButton");
const list = document.querySelector("#milestonesList");
const countTargets = {
  total: document.querySelector('[data-milestone-count="total"]'),
  published: document.querySelector('[data-milestone-count="published"]'),
  draft: document.querySelector('[data-milestone-count="draft"]'),
  disabled: document.querySelector('[data-milestone-count="disabled"]')
};

let milestones = [];
let milestoneImageById = new Map();
let listMutationPending = false;
let adminPermissions = {};

function setStatus(message, type = "info") {
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function publishStatusLabel(status) {
  const labels = {
    draft: "草稿",
    scheduled: "排程中",
    published: "已發布",
    archived: "停用"
  };
  return labels[status] || status || "草稿";
}

function displayMonth(value) {
  return String(Number(value) || 0).padStart(2, "0");
}

function linkedImage(item) {
  return milestoneImageById.get(item?.image_id) || null;
}

function imageUrl(item) {
  return item?.image_url || linkedImage(item)?.public_url || "";
}

function nextSortOrder() {
  if (!milestones.length) return 10;
  return Math.max(...milestones.map((item) => Number(item.sort_order) || 0)) + 10;
}

function resetForm() {
  const now = new Date();
  form.reset();
  form.elements.id.value = "";
  form.elements.image_id.value = "";
  form.elements.year.value = now.getFullYear();
  form.elements.month.value = now.getMonth() + 1;
  form.elements.sort_order.value = nextSortOrder();
  form.elements.status.value = "draft";
  form.elements.is_enabled.checked = true;
  formTitle.textContent = "新增大事記卡片";
  requestPublishButton.hidden = true;
  requestPublishButton.disabled = false;
  requestPublishButton.textContent = "補充審核備註";
}

function fillForm(item) {
  if (!item) return;
  form.elements.id.value = item.id;
  form.elements.image_id.value = item.image_id || "";
  form.elements.year.value = item.year;
  form.elements.month.value = item.month;
  form.elements.tag.value = item.tag || "";
  form.elements.status_label.value = item.status_label || "";
  form.elements.title.value = item.title || "";
  form.elements.summary.value = item.summary || "";
  form.elements.image_url.value = imageUrl(item);
  form.elements.image_file.value = "";
  form.elements.sort_order.value = Number(item.sort_order) || 0;
  form.elements.status.value = item.status || "draft";
  form.elements.is_enabled.checked = Boolean(item.is_enabled);
  formTitle.textContent = `編輯：${item.title}`;
  requestPublishButton.hidden = canPublishScope(adminPermissions, "brand") || !canEditScope(adminPermissions, "brand");
  requestPublishButton.disabled = false;
  requestPublishButton.textContent = "補充審核備註";
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateCounts() {
  const published = milestones.filter((item) => item.status === "published" && item.is_enabled).length;
  const disabled = milestones.filter((item) => item.status === "archived" || !item.is_enabled).length;
  const draft = milestones.length - published - disabled;
  countTargets.total.textContent = milestones.length;
  countTargets.published.textContent = published;
  countTargets.draft.textContent = draft;
  countTargets.disabled.textContent = disabled;
}

function renderMilestones() {
  updateCounts();
  if (!milestones.length) {
    list.innerHTML = `<div class="admin-empty-state">目前沒有大事記。請在上方建立第一張卡片；儲存為「已發布」並勾選「前台顯示」後，卡片就會加入固定時間軸。</div>`;
    return;
  }

  list.innerHTML = `
    <article class="admin-section-card">
      <header><div><span>Timeline Cards</span><strong>前台時間軸順序</strong></div></header>
      <div class="admin-table-wrap">
        <table class="admin-data-table">
          <thead><tr><th>年月</th><th>卡片內容</th><th>標籤</th><th>發布狀態</th><th>排序</th><th>操作</th></tr></thead>
          <tbody>
            ${milestones.map((item, index) => {
              const url = imageUrl(item);
              const stateText = item.is_enabled ? publishStatusLabel(item.status) : "前台停用";
              const badgeStatus = item.is_enabled ? item.status : "archived";
              const previous = milestones[index - 1];
              const next = milestones[index + 1];
              const canMoveUp = previous && previous.year === item.year && previous.month === item.month;
              const canMoveDown = next && next.year === item.year && next.month === item.month;
              return `
                <tr>
                  <td><strong>${escapeHTML(item.year)}</strong><small>${escapeHTML(displayMonth(item.month))} 月</small></td>
                  <td>
                    <div class="admin-table-media-cell">
                      ${url ? `<img src="${escapeHTML(url)}" alt="${escapeHTML(item.title)}" />` : `<span aria-hidden="true">MS</span>`}
                      <div><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.summary)}</small></div>
                    </div>
                  </td>
                  <td><strong>${escapeHTML(item.tag)}</strong><small>${escapeHTML(item.status_label)}</small></td>
                  <td><span class="admin-publish-badge" data-status="${escapeHTML(badgeStatus)}">${escapeHTML(stateText)}</span><time>${item.published_at ? `發布：${escapeHTML(formatUpdatedAt(item.published_at))}` : `更新：${escapeHTML(formatUpdatedAt(item.updated_at))}`}</time></td>
                  <td><code>${Number(item.sort_order) || 0}</code></td>
                  <td>
                    <div class="admin-table-actions">
                      ${canEditScope(adminPermissions, "brand") ? `
                        <button type="button" data-move-milestone="${escapeHTML(item.id)}" data-direction="up" ${canMoveUp ? "" : "disabled"}>上移</button>
                        <button type="button" data-move-milestone="${escapeHTML(item.id)}" data-direction="down" ${canMoveDown ? "" : "disabled"}>下移</button>
                        <button type="button" data-edit-milestone="${escapeHTML(item.id)}">編輯</button>
                      ` : `<span>唯讀</span>`}
                      ${canEditScope(adminPermissions, "brand") ? `<button type="button" data-delete-milestone="${escapeHTML(item.id)}">刪除</button>` : ""}
                    </div>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

async function loadMilestones() {
  setStatus("正在讀取大事記資料...", "info");
  try {
    const { data, error } = await supabase
      .from("milestones")
      .select("*")
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;

    milestones = data || [];
    const imageIds = [...new Set(milestones.map((item) => item.image_id).filter(Boolean))];
    if (imageIds.length) {
      const { data: mediaRows, error: mediaError } = await supabase
        .from("media")
        .select("id, public_url, alt_text, file_name, image_usage, focal_point")
        .in("id", imageIds);
      if (mediaError) throw mediaError;
      milestoneImageById = new Map((mediaRows || []).map((image) => [image.id, image]));
    } else {
      milestoneImageById = new Map();
    }

    renderMilestones();
    setStatus("", "success");
  } catch (error) {
    console.error("Failed to load milestones", error);
    milestones = [];
    milestoneImageById = new Map();
    renderMilestones();
    setStatus(`讀取大事記失敗：${error.message}`, "error");
  }
}

async function uploadMilestoneImage() {
  const file = form.elements.image_file.files?.[0];
  if (!file) return null;
  const preparedFile = await prepareImageForUpload(file, "milestone");
  if (!preparedFile) throw new Error("已取消圖片上傳。");
  return uploadImageToMedia({
    file: preparedFile,
    altText: form.elements.title.value.trim(),
    caption: `${form.elements.year.value} 年 ${displayMonth(form.elements.month.value)} 月大事記`,
    imageUsage: "milestone",
    focalPoint: "center",
    scopeKey: "brand"
  });
}

function buildPayload(uploadedImage = null) {
  const id = form.elements.id.value;
  const current = milestones.find((item) => item.id === id);
  const status = form.elements.status.value || "draft";
  const year = Number(form.elements.year.value);
  const month = Number(form.elements.month.value);
  const sortOrder = Number(form.elements.sort_order.value);
  const title = form.elements.title.value.trim();
  const tag = form.elements.tag.value.trim();
  const summary = form.elements.summary.value.trim();
  const statusLabel = form.elements.status_label.value.trim();
  const enteredImageUrl = form.elements.image_url.value.trim();
  const imageUrlChanged = Boolean(current) && enteredImageUrl !== imageUrl(current);

  if (!Number.isInteger(year) || year < 1900 || year > 9999) throw new Error("年份需介於 1900 到 9999。");
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new Error("月份需介於 1 到 12。");
  if (!Number.isInteger(sortOrder) || sortOrder < 0) throw new Error("排序需為 0 以上的整數。");
  if (!title || !tag || !summary || !statusLabel) throw new Error("標題、事件標籤、摘要與卡片狀態文字都不能空白。");

  const publishedAt = status === "published"
    ? current?.status === "published" && current.published_at
      ? current.published_at
      : new Date().toISOString()
    : null;

  return {
    year,
    month,
    title,
    tag,
    summary,
    status_label: statusLabel,
    image_id: uploadedImage?.id || (imageUrlChanged ? null : form.elements.image_id.value || null),
    image_url: uploadedImage?.public_url || enteredImageUrl || null,
    sort_order: sortOrder,
    is_enabled: status === "archived" ? false : form.elements.is_enabled.checked,
    status,
    published_at: publishedAt
  };
}

async function saveMilestone(event) {
  event.preventDefault();
  if (!canEditScope(adminPermissions, "brand")) {
    setStatus("你的帳號只有檢視權限，無法儲存大事記。", "error");
    return;
  }
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  setStatus("正在儲存大事記卡片...", "info");
  try {
    const uploadedImage = await uploadMilestoneImage();
    const payload = buildPayload(uploadedImage);
    const id = form.elements.id.value;
    const query = id
      ? supabase.from("milestones").update(payload).eq("id", id)
      : supabase.from("milestones").insert(payload);
    const { data: savedRow, error } = await query.select("id").maybeSingle();
    if (error) throw error;
    if (canPublishScope(adminPermissions, "brand")) {
      await loadMilestones();
      resetForm();
    } else {
      if (savedRow?.id) form.elements.id.value = savedRow.id;
      requestPublishButton.hidden = false;
      requestPublishButton.disabled = true;
      requestPublishButton.textContent = "等待執行長確認";
    }
    setStatus(contentSaveMessage(adminPermissions, "brand", "大事記卡片"), "success");
  } catch (error) {
    console.error("Failed to save milestone", error);
    setStatus(`儲存大事記失敗：${error.message}`, "error");
  } finally {
    submitButton.disabled = false;
  }
}

async function moveMilestone(id, direction) {
  if (listMutationPending || !canEditScope(adminPermissions, "brand")) return;
  const currentIndex = milestones.findIndex((item) => item.id === id);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= milestones.length) return;
  const current = milestones[currentIndex];
  const target = milestones[targetIndex];
  if (current.year !== target.year || current.month !== target.month) return;

  listMutationPending = true;
  setStatus(`正在${direction === "up" ? "上移" : "下移"}卡片...`, "info");
  try {
    const sameMonthItems = milestones.filter((item) => item.year === current.year && item.month === current.month);
    const sameMonthIndex = sameMonthItems.findIndex((item) => item.id === current.id);
    const sameMonthTargetIndex = direction === "up" ? sameMonthIndex - 1 : sameMonthIndex + 1;
    [sameMonthItems[sameMonthIndex], sameMonthItems[sameMonthTargetIndex]] = [sameMonthItems[sameMonthTargetIndex], sameMonthItems[sameMonthIndex]];
    const changes = sameMonthItems.map((item, index) => ({ id: item.id, sort_order: (index + 1) * 10 }));

    for (const change of changes) {
      const { error } = await supabase
        .from("milestones")
        .update({ sort_order: change.sort_order })
        .eq("id", change.id)
        .select("id")
        .single();
      if (error) throw error;
    }
    setStatus(contentSaveMessage(adminPermissions, "brand", "卡片排序"), "success");
    if (canPublishScope(adminPermissions, "brand")) await loadMilestones();
  } catch (error) {
    console.error("Failed to reorder milestones", error);
    setStatus(`調整排序失敗：${error.message}`, "error");
    await loadMilestones();
  } finally {
    listMutationPending = false;
  }
}

async function deleteMilestone(id) {
  if (listMutationPending) return;
  if (!canEditScope(adminPermissions, "brand")) {
    setStatus("你的帳號沒有管理大事記的權限。", "error");
    return;
  }
  const item = milestones.find((milestone) => milestone.id === id);
  if (!item || !window.confirm(`確定刪除「${item.title}」嗎？刪除後前台也會移除這張卡片。`)) return;

  listMutationPending = true;
  setStatus("正在刪除大事記卡片...", "info");
  try {
    const { error } = await supabase.from("milestones").delete().eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    setStatus(contentDeleteMessage(adminPermissions, "brand", "大事記卡片"), "success");
    if (canPublishScope(adminPermissions, "brand")) {
      if (form.elements.id.value === id) resetForm();
      await loadMilestones();
    }
  } catch (error) {
    console.error("Failed to delete milestone", error);
    setStatus(`刪除大事記失敗：${error.message}`, "error");
  } finally {
    listMutationPending = false;
  }
}

async function requestMilestonePublish() {
  const id = form.elements.id.value;
  const item = milestones.find((milestone) => milestone.id === id);
  if (!item) {
    setStatus("請先儲存大事記卡片，再補充審核備註。", "error");
    return;
  }

  const note = window.prompt("送審備註（可留空）：", "請協助審核大事記內容與圖片後發布。");
  if (note === null) return;

  requestPublishButton.disabled = true;
  setStatus("正在補充大事記審核備註...", "info");
  try {
    const { error } = await supabase
      .from("publish_requests")
      .insert({
        entity_table: "milestones",
        entity_id: item.id,
        entity_title: form.elements.title.value.trim() || item.title,
        target_status: "published",
        status: "pending",
        request_note: note.trim() || null
      })
      .select("id")
      .single();
    if (error) throw error;

    requestPublishButton.textContent = "備註已更新";
    setStatus("審核備註已更新，請到「發布與權限」查看進度。", "success");
  } catch (error) {
    console.error("Failed to request milestone publish", error);
    requestPublishButton.disabled = false;
    const message = error.code === "23505" ? "這張卡片已有待審申請，請到「發布與權限」查看。" : error.message;
    setStatus(`送審失敗：${message}`, "error");
  }
}

form?.addEventListener("submit", saveMilestone);
form?.elements.status?.addEventListener("change", () => {
  if (form.elements.status.value === "archived") form.elements.is_enabled.checked = false;
});
newButton?.addEventListener("click", resetForm);
requestPublishButton?.addEventListener("click", requestMilestonePublish);
refreshButton?.addEventListener("click", loadMilestones);
list?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-milestone]");
  const deleteButton = event.target.closest("[data-delete-milestone]");
  const moveButton = event.target.closest("[data-move-milestone]");
  if (editButton) fillForm(milestones.find((item) => item.id === editButton.dataset.editMilestone));
  if (deleteButton) deleteMilestone(deleteButton.dataset.deleteMilestone);
  if (moveButton) moveMilestone(moveButton.dataset.moveMilestone, moveButton.dataset.direction);
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
    form.dataset.contentScope = "brand";
    if (!canEditScope(adminPermissions, "brand")) {
      form.querySelectorAll("input, textarea, select, button").forEach((control) => { control.disabled = true; });
      newButton.hidden = true;
      requestPublishButton.hidden = true;
      setStatus("目前為唯讀模式；請由 Owner 指派品牌行銷部門的編輯或主管角色。", "info");
    }
    resetForm();
    await loadMilestones();
  }
}).catch((error) => reportAdminBootError(loading, error));
