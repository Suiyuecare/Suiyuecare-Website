import { supabase } from "../lib/supabaseClient.js";
import { prepareImageForUpload, uploadImageToMedia } from "./media-utils.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#siteSettingsStatus");
const form = document.querySelector("#siteSettingsForm");

let settings = [];

const textKeys = [
  "brand_name",
  "brand_name_en",
  "slogan",
  "phone",
  "email",
  "line_url",
  "contact_cta_text",
  "logo_url",
  "footer_intro",
  "copyright"
];

const jsonKeys = ["primary_nav", "footer_columns"];

const labels = {
  brand_name: ["brand", "中文品牌名稱", "Header、Footer、進場動畫使用。", 10],
  brand_name_en: ["brand", "英文品牌名稱", "Header、Footer、進場動畫使用。", 20],
  slogan: ["brand", "品牌標語", "Footer、進場動畫與固定 CTA 使用。", 30],
  logo_url: ["brand", "Logo 圖片 URL", "建議使用去背 PNG。", 40],
  phone: ["contact", "主要電話", "Footer、據點資訊與固定聯絡資訊使用。", 50],
  email: ["contact", "主要信箱", "Footer、據點資訊與固定聯絡資訊使用。", 60],
  line_url: ["contact", "官方 LINE 連結", "課程報名完成與 CTA 可使用。", 70],
  contact_cta_text: ["cta", "Header 聯絡按鈕文字", "Header 最右側 CTA。", 80],
  footer_intro: ["footer", "Footer 服務描述", "Footer 聯絡資訊下方描述。", 90],
  copyright: ["footer", "版權文字", "Footer 最下方版權文字。", 100],
  primary_nav: ["nav", "主選單結構", "控制 Header 主選單。", 110],
  footer_columns: ["footer", "Footer 網站地圖", "控制 Footer 網站地圖欄位。", 120]
};

function setStatus(message, type = "info") {
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function getSetting(key) {
  return settings.find((item) => item.setting_key === key) || null;
}

function getJsonString(key) {
  const value = getSetting(key)?.value_json;
  return JSON.stringify(value && typeof value === "object" ? value : [], null, 2);
}

function fillForm() {
  textKeys.forEach((key) => {
    if (form.elements[key]) form.elements[key].value = getSetting(key)?.value_text || "";
  });
  jsonKeys.forEach((key) => {
    if (form.elements[key]) form.elements[key].value = getJsonString(key);
  });
}

async function loadSettings() {
  setStatus("正在讀取全站設定...", "info");
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    settings = data || [];
    fillForm();
    setStatus("", "success");
  } catch (error) {
    console.error("Failed to load site settings", error);
    setStatus(`讀取全站設定失敗：${error.message}`, "error");
  }
}

function parseJsonField(key) {
  try {
    const parsed = JSON.parse(form.elements[key].value || "[]");
    if (!Array.isArray(parsed)) throw new Error("必須是 JSON 陣列。");
    return parsed;
  } catch (error) {
    throw new Error(`${labels[key][1]}格式錯誤：${error.message}`);
  }
}

async function uploadLogoIfNeeded() {
  const file = form.elements.logo_file.files?.[0];
  if (!file) return form.elements.logo_url.value.trim();
  const preparedFile = await prepareImageForUpload(file, "logo");
  if (!preparedFile) throw new Error("已取消 Logo 上傳。");
  const media = await uploadImageToMedia({
    file: preparedFile,
    altText: form.elements.brand_name.value.trim() || "歲悅長照集團 Logo",
    caption: "全站 Logo",
    imageUsage: "logo",
    focalPoint: "center"
  });
  return media.public_url;
}

function buildPayloads(logoUrl) {
  const rows = [];
  textKeys.forEach((key) => {
    const [group, label, help, sortOrder] = labels[key];
    rows.push({
      setting_group: group,
      setting_key: key,
      setting_label: label,
      value_text: key === "logo_url" ? logoUrl : form.elements[key].value.trim(),
      value_json: {},
      help_text: help,
      sort_order: sortOrder,
      is_enabled: true
    });
  });
  jsonKeys.forEach((key) => {
    const [group, label, help, sortOrder] = labels[key];
    rows.push({
      setting_group: group,
      setting_key: key,
      setting_label: label,
      value_text: null,
      value_json: parseJsonField(key),
      help_text: help,
      sort_order: sortOrder,
      is_enabled: true
    });
  });
  return rows;
}

async function saveSettings(event) {
  event.preventDefault();
  setStatus("正在儲存全站設定...", "info");
  try {
    const logoUrl = await uploadLogoIfNeeded();
    const rows = buildPayloads(logoUrl);
    const { error } = await supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "setting_key" });
    if (error) throw error;
    form.elements.logo_file.value = "";
    setStatus("全站設定已儲存，重新整理前台即可看到更新。", "success");
    await loadSettings();
  } catch (error) {
    console.error("Failed to save site settings", error);
    setStatus(`儲存失敗：${error.message}`, "error");
  }
}

form?.addEventListener("submit", saveSettings);
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadSettings
}).catch((error) => reportAdminBootError(loading, error));
