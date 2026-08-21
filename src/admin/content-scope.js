export const contentScopeLabels = {
  "page:home": "首頁",
  "page:about": "關於歲悅",
  "page:contact": "聯絡我們",
  brand: "品牌大事記",
  health: "健康 3.0",
  courses: "課程報名",
  "service:home-care": "居家照顧",
  "service:day-care": "日間照顧",
  "service:community": "社區據點",
  "service:nursing": "護理復能",
  "service:migrant-training": "移工培訓",
  "service:quality": "教育品管",
  "service:software": "長照軟體",
  "recruiting:talent": "人才招募",
  "recruiting:partnership": "土地與投資人招募",
  investor: "投資人專區",
  "site:settings": "全站設定",
  files: "共用下載檔",
  "forms:contact": "一般服務諮詢",
  "forms:courses": "課程報名案件",
  "forms:talent": "人才應徵案件",
  "forms:partnership": "合作洽談案件",
  "forms:brand": "品牌行銷案件",
  "forms:system": "系統諮詢案件"
};

export const allContentScopeKeys = Object.freeze(Object.keys(contentScopeLabels));

export const formTypeScopeMap = {
  contact: "forms:contact",
  course_signup: "forms:courses",
  recruiting: "forms:talent",
  land: "forms:partnership",
  investor: "forms:partnership",
  marketing: "forms:brand",
  system: "forms:system"
};

export function scopeForPageSlug(pageSlug = "") {
  const scopes = {
    home: "page:home",
    about: "page:about",
    contact: "page:contact",
    milestones: "brand",
    health: "health",
    courses: "courses",
    "home-care": "service:home-care",
    "day-care": "service:day-care",
    community: "service:community",
    nursing: "service:nursing",
    "migrant-training": "service:migrant-training",
    quality: "service:quality",
    software: "service:software",
    talent: "recruiting:talent",
    land: "recruiting:partnership",
    "investor-recruiting": "recruiting:partnership",
    investors: "investor",
    "ir-finance": "investor",
    "ir-governance": "investor",
    "ir-shareholders": "investor"
  };
  return scopes[String(pageSlug || "").toLowerCase()] || "";
}

export function scopeForFormType(formType = "contact") {
  return formTypeScopeMap[String(formType || "contact").toLowerCase()] || "forms:contact";
}

function scopeList(permissions, key, fallbackKey = "content_scopes") {
  const list = permissions?.[key];
  if (Array.isArray(list)) return list;
  return Array.isArray(permissions?.[fallbackKey]) ? permissions[fallbackKey] : [];
}

export function canViewScope(permissions, scopeKey) {
  if (!scopeKey) return false;
  if (permissions?.role === "owner") return true;
  return scopeList(permissions, "content_scopes").includes(scopeKey);
}

export function canEditScope(permissions, scopeKey) {
  if (!scopeKey) return false;
  if (permissions?.role === "owner") return true;
  return scopeList(permissions, "edit_scopes").includes(scopeKey);
}

export function canPublishScope(permissions, scopeKey) {
  if (!scopeKey) return false;
  if (permissions?.role === "owner") return true;
  return scopeList(permissions, "publish_scopes").includes(scopeKey);
}

export function isEducationCourseManager(permissions = {}) {
  if (permissions?.role === "owner") return false;
  const departments = Array.isArray(permissions?.departments) ? permissions.departments : [];
  return departments.length === 1
    && departments[0]?.slug === "education-quality"
    && canEditScope(permissions, "courses");
}

export function contentSaveMessage(permissions, scopeKey, label = "內容") {
  if (canPublishScope(permissions, scopeKey)) {
    return `${label}已儲存並套用。`;
  }
  return `${label}已送交執行長審核；核准前，官網會維持原版本。`;
}

export function contentDeleteMessage(permissions, scopeKey, label = "內容") {
  if (canPublishScope(permissions, scopeKey)) {
    return `${label}已刪除。`;
  }
  return `${label}的刪除申請已送交執行長審核；核准前，官網會維持原版本。`;
}

export function contentScopeLabel(scopeKey = "") {
  return contentScopeLabels[scopeKey] || scopeKey || "未指定責任";
}

export function editableScopeOptions(permissions) {
  return scopeList(permissions, "edit_scopes")
    .map((scopeKey) => ({ value: scopeKey, label: contentScopeLabel(scopeKey) }));
}
