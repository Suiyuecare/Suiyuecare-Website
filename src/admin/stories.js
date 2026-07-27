import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";
import { prepareImageForUpload, uploadImageToMedia } from "./media-utils.js";
import { canEditScope, canPublishScope, contentDeleteMessage, contentSaveMessage } from "./content-scope.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#storyStatus");
const storyForm = document.querySelector("#careStoryForm");
const talkForm = document.querySelector("#expertTalkForm");
const storyTitle = document.querySelector("#careStoryFormTitle");
const talkTitle = document.querySelector("#expertTalkFormTitle");
const list = document.querySelector("#storyDataList");
const refreshButton = document.querySelector("#refreshStoriesButton");
const newStoryButton = document.querySelector("#newCareStoryButton");
const newTalkButton = document.querySelector("#newExpertTalkButton");

let stories = [];
let talks = [];
let adminPermissions = {};
const healthScope = "health";

function setStatus(message, type = "info") {
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function slugify(value = "", fallback = "story") {
  return value.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || `${fallback}-${Date.now()}`;
}

function publishTime(status) {
  return status === "published" ? new Date().toISOString() : null;
}

async function uploadStoryImage(file, altText, imageUsage = "card") {
  if (!file || !file.name) return null;
  const preparedFile = await prepareImageForUpload(file, imageUsage);
  if (!preparedFile) return null;
  return uploadImageToMedia({
    file: preparedFile,
    altText,
    caption: altText,
    imageUsage,
    focalPoint: imageUsage === "avatar" ? "top" : "center",
    scopeKey: "health"
  });
}

function clearFileInput(input) {
  if (input) input.value = "";
}

function resetStoryForm() {
  storyForm.reset();
  storyForm.elements.id.value = "";
  storyForm.elements.status.value = "draft";
  storyForm.elements.is_enabled.checked = true;
  storyForm.elements.sort_order.value = stories.length * 10;
  storyTitle.textContent = "新增真實照顧情境";
}

function resetTalkForm() {
  talkForm.reset();
  talkForm.elements.id.value = "";
  talkForm.elements.status.value = "draft";
  talkForm.elements.is_enabled.checked = true;
  talkForm.elements.sort_order.value = talks.length * 10;
  talkTitle.textContent = "新增名人講堂";
}

function renderList() {
  list.innerHTML = `
    ${renderTable("真實照顧情境", stories, "story", (item) => `${item.person_name}｜${item.service_type}`)}
    ${renderTable("名人講堂", talks, "talk", (item) => `${item.speaker_title || "講者"} ${item.speaker_name}`)}
  `;
}

function renderTable(title, rows, type, meta) {
  const editable = canEditScope(adminPermissions, healthScope);
  return `
    <article class="admin-section-card">
      <header><div><span>${escapeHTML(type)}</span><strong>${escapeHTML(title)}</strong></div></header>
      <div class="admin-table-wrap">
        <table class="admin-data-table">
          <thead><tr><th>標題</th><th>人物</th><th>狀態</th><th>更新</th><th>操作</th></tr></thead>
          <tbody>
            ${rows.length ? rows.map((item) => `
              <tr>
                <td><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.slug)}</small></td>
                <td>${escapeHTML(meta(item))}</td>
                <td>${escapeHTML(item.status)}${item.is_featured ? " / 精選" : ""}${item.is_enabled ? "" : " / 停用"}</td>
                <td>${formatUpdatedAt(item.updated_at)}</td>
                <td><div class="admin-table-actions"><button type="button" data-edit-${type}="${escapeHTML(item.id)}">${editable ? "編輯" : "查看"}</button>${editable ? `<button type="button" data-delete-${type}="${escapeHTML(item.id)}">刪除</button>` : ""}</div></td>
              </tr>
            `).join("") : `<tr><td colspan="5"><div class="admin-empty-state">尚無資料</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

async function loadData() {
  setStatus("正在讀取故事與講堂...", "info");
  try {
    const [{ data: storyData, error: storyError }, { data: talkData, error: talkError }] = await Promise.all([
      supabase.from("care_stories").select("*").order("is_featured", { ascending: false }).order("sort_order", { ascending: true }),
      supabase.from("expert_talks").select("*").order("is_featured", { ascending: false }).order("sort_order", { ascending: true })
    ]);
    if (storyError) throw storyError;
    if (talkError) throw talkError;
    stories = storyData || [];
    talks = talkData || [];
    renderList();
    resetStoryForm();
    resetTalkForm();
    setStatus("", "success");
  } catch (error) {
    console.error("Failed to load stories", error);
    setStatus(`讀取失敗：${error.message}`, "error");
  }
}

function fillStory(item) {
  storyForm.elements.id.value = item.id;
  storyForm.elements.person_name.value = item.person_name || "";
  storyForm.elements.person_label.value = item.person_label || "";
  storyForm.elements.service_type.value = item.service_type || "";
  storyForm.elements.slug.value = item.slug || "";
  storyForm.elements.title.value = item.title || "";
  storyForm.elements.praise.value = item.praise || "";
  storyForm.elements.story_body.value = item.story_body || "";
  storyForm.elements.cover_image_url.value = item.cover_image_url || "";
  storyForm.elements.avatar_image_url.value = item.avatar_image_url || "";
  clearFileInput(storyForm.elements.cover_image_file);
  clearFileInput(storyForm.elements.avatar_image_file);
  storyForm.elements.sort_order.value = item.sort_order || 0;
  storyForm.elements.status.value = item.status || "draft";
  storyForm.elements.is_featured.checked = Boolean(item.is_featured);
  storyForm.elements.is_enabled.checked = Boolean(item.is_enabled);
  storyTitle.textContent = `編輯：${item.title}`;
}

function fillTalk(item) {
  talkForm.elements.id.value = item.id;
  talkForm.elements.speaker_name.value = item.speaker_name || "";
  talkForm.elements.speaker_title.value = item.speaker_title || "";
  talkForm.elements.topic.value = item.topic || "";
  talkForm.elements.slug.value = item.slug || "";
  talkForm.elements.title.value = item.title || "";
  talkForm.elements.summary.value = item.summary || "";
  talkForm.elements.body.value = item.body || "";
  talkForm.elements.image_url.value = item.image_url || "";
  clearFileInput(talkForm.elements.image_file);
  talkForm.elements.sort_order.value = item.sort_order || 0;
  talkForm.elements.status.value = item.status || "draft";
  talkForm.elements.is_featured.checked = Boolean(item.is_featured);
  talkForm.elements.is_enabled.checked = Boolean(item.is_enabled);
  talkTitle.textContent = `編輯：${item.title}`;
}

async function saveStory(event) {
  event.preventDefault();
  if (!canEditScope(adminPermissions, healthScope)) {
    setStatus("你的帳號只有檢視健康內容的權限。", "error");
    return;
  }
  const status = storyForm.elements.status.value;
  const payload = {
    person_name: storyForm.elements.person_name.value.trim(),
    person_label: storyForm.elements.person_label.value.trim() || null,
    service_type: storyForm.elements.service_type.value.trim(),
    slug: slugify(storyForm.elements.slug.value || storyForm.elements.title.value, "care-story"),
    title: storyForm.elements.title.value.trim(),
    praise: storyForm.elements.praise.value.trim() || null,
    story_body: storyForm.elements.story_body.value.trim() || null,
    cover_image_url: storyForm.elements.cover_image_url.value.trim() || null,
    avatar_image_url: storyForm.elements.avatar_image_url.value.trim() || null,
    sort_order: Number(storyForm.elements.sort_order.value || 0),
    status,
    published_at: publishTime(status),
    is_featured: storyForm.elements.is_featured.checked,
    is_enabled: storyForm.elements.is_enabled.checked
  };
  setStatus("正在處理故事圖片...", "info");
  const coverImage = await uploadStoryImage(storyForm.elements.cover_image_file?.files?.[0], `${payload.person_name} ${payload.title}`, "card");
  const avatarImage = await uploadStoryImage(storyForm.elements.avatar_image_file?.files?.[0], `${payload.person_name} 頭像`, "avatar");
  if (coverImage) payload.cover_image_url = coverImage.public_url;
  if (avatarImage) payload.avatar_image_url = avatarImage.public_url;
  await upsert("care_stories", storyForm.elements.id.value, payload, "照顧故事");
}

async function saveTalk(event) {
  event.preventDefault();
  if (!canEditScope(adminPermissions, healthScope)) {
    setStatus("你的帳號只有檢視健康內容的權限。", "error");
    return;
  }
  const status = talkForm.elements.status.value;
  const payload = {
    speaker_name: talkForm.elements.speaker_name.value.trim(),
    speaker_title: talkForm.elements.speaker_title.value.trim() || null,
    topic: talkForm.elements.topic.value.trim(),
    slug: slugify(talkForm.elements.slug.value || talkForm.elements.title.value, "master-talk"),
    title: talkForm.elements.title.value.trim(),
    summary: talkForm.elements.summary.value.trim() || null,
    body: talkForm.elements.body.value.trim() || null,
    image_url: talkForm.elements.image_url.value.trim() || null,
    sort_order: Number(talkForm.elements.sort_order.value || 0),
    status,
    published_at: publishTime(status),
    is_featured: talkForm.elements.is_featured.checked,
    is_enabled: talkForm.elements.is_enabled.checked
  };
  setStatus("正在處理講堂圖片...", "info");
  const image = await uploadStoryImage(talkForm.elements.image_file?.files?.[0], `${payload.speaker_title || ""} ${payload.speaker_name}`.trim(), "card");
  if (image) payload.image_url = image.public_url;
  await upsert("expert_talks", talkForm.elements.id.value, payload, "名人講堂");
}

async function upsert(table, id, payload, label) {
  setStatus(`正在儲存${label}...`, "info");
  const query = id ? supabase.from(table).update(payload).eq("id", id) : supabase.from(table).insert(payload);
  const { data, error } = await query.select("id").maybeSingle();
  if (error) {
    setStatus(`儲存失敗：${error.message}`, "error");
    return;
  }
  const targetForm = table === "care_stories" ? storyForm : talkForm;
  if (data?.id) targetForm.elements.id.value = data.id;
  setStatus(contentSaveMessage(adminPermissions, healthScope, label), "success");
  if (canPublishScope(adminPermissions, healthScope)) await loadData();
}

async function deleteRow(table, id, label) {
  if (!canEditScope(adminPermissions, healthScope)) {
    setStatus("你的帳號只有檢視健康內容的權限。", "error");
    return;
  }
  if (!window.confirm(`確定刪除這筆${label}嗎？`)) return;
  const { error } = await supabase.from(table).delete().eq("id", id).select("id").maybeSingle();
  if (error) setStatus(`刪除失敗：${error.message}`, "error");
  else {
    setStatus(contentDeleteMessage(adminPermissions, healthScope, label), "success");
    if (canPublishScope(adminPermissions, healthScope)) await loadData();
  }
}

storyForm?.addEventListener("submit", saveStory);
talkForm?.addEventListener("submit", saveTalk);
newStoryButton?.addEventListener("click", resetStoryForm);
newTalkButton?.addEventListener("click", resetTalkForm);
refreshButton?.addEventListener("click", loadData);
storyForm?.elements.title?.addEventListener("input", () => {
  if (!storyForm.elements.id.value && !storyForm.elements.slug.value) storyForm.elements.slug.value = slugify(storyForm.elements.title.value, "care-story");
});
talkForm?.elements.title?.addEventListener("input", () => {
  if (!talkForm.elements.id.value && !talkForm.elements.slug.value) talkForm.elements.slug.value = slugify(talkForm.elements.title.value, "master-talk");
});
list?.addEventListener("click", (event) => {
  const editStory = event.target.closest("[data-edit-story]");
  const editTalk = event.target.closest("[data-edit-talk]");
  const deleteStory = event.target.closest("[data-delete-story]");
  const deleteTalk = event.target.closest("[data-delete-talk]");
  if (editStory) fillStory(stories.find((item) => item.id === editStory.dataset.editStory));
  if (editTalk) fillTalk(talks.find((item) => item.id === editTalk.dataset.editTalk));
  if (deleteStory) deleteRow("care_stories", deleteStory.dataset.deleteStory, "照顧故事");
  if (deleteTalk) deleteRow("expert_talks", deleteTalk.dataset.deleteTalk, "名人講堂");
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
    [storyForm, talkForm].forEach((targetForm) => {
      targetForm.dataset.contentScope = healthScope;
    });
    await loadData();
    if (!canEditScope(adminPermissions, healthScope)) {
      [storyForm, talkForm].forEach((targetForm) => {
        targetForm.querySelectorAll("input, textarea, select, button").forEach((control) => {
          control.disabled = true;
        });
      });
      newStoryButton.hidden = true;
      newTalkButton.hidden = true;
      setStatus("目前為唯讀模式；只有健康內容責任人可修改。", "info");
    }
  }
}).catch((error) => reportAdminBootError(loading, error));
