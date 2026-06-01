import { supabase } from "../lib/supabaseClient.js";

const signOutButton = document.querySelector("#signOutButton");
const status = document.querySelector("#loginStatus");
const signedOutViews = document.querySelectorAll('[data-auth-view="signed-out"]');
const signedInViews = document.querySelectorAll('[data-auth-view="signed-in"]');
const userSummary = document.querySelector("#userSummary");
const moduleTitle = document.querySelector("#moduleTitle");
const moduleLevelOne = document.querySelector("#moduleLevelOne");
const moduleLevelTwo = document.querySelector("#moduleLevelTwo");
const moduleLevelOneGrid = document.querySelector("#moduleLevelOneGrid");
const moduleLevelTwoGrid = document.querySelector("#moduleLevelTwoGrid");
const backToLevelOneButton = document.querySelector("#backToLevelOneButton");
const quickLoginTabs = document.querySelector("#quickLoginTabs");
const quickLoginGrid = document.querySelector("#quickLoginGrid");
const organizationChart = document.querySelector("#organizationChart");
const signedInOrganizationChart = document.querySelector("#signedInOrganizationChart");
const portalLoginForm = document.querySelector("#portalLoginForm");
const portalGoogleLoginButton = document.querySelector("#portalGoogleLoginButton");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");

const storageKey = "suiyuecare.portal.quickLoginProfile";
const storageEmailKey = "suiyuecare.portal.loginEmail";
const demoPassword = "suiyuecare";
const portalHomePath = "/portal/";
const portalProductionOrigin = "https://login.suiyuecare.com";
const portalOAuthBridgeOrigin = "https://suiyuecare-website.vercel.app";
let activeQuickLoginGroup = "management";

const modules = [
  { id: "announcements", number: "1", name: "系統公告" },
  {
    id: "business",
    number: "2",
    name: "業務系統",
    children: [
      { id: "home-care", number: "2-1", name: "居家照顧系統" },
      { id: "day-care", number: "2-2", name: "日間照顧系統" }
    ]
  },
  { id: "hr", number: "3", name: "人資系統" },
  { id: "accounting", number: "4", name: "會計系統" },
  {
    id: "general-affairs",
    number: "5",
    name: "總務系統",
    children: [
      { id: "edoc", number: "5-1", name: "公文簽核系統" },
      { id: "contract", number: "5-2", name: "合約管理系統" },
      { id: "system-permissions", number: "5-3", name: "系統權限" },
      { id: "organization-chart", number: "5-4", name: "組織圖" },
      { id: "employee-accounts", number: "5-5", name: "員工帳號" },
      { id: "agile-projects", number: "5-6", name: "敏捷專案管理" },
      { id: "pdf-editor", number: "5-7", name: "PDF 編輯器" }
    ]
  }
];

const organizationNodes = [
  {
    id: "group",
    parentId: null,
    label: "歲悅長照集團",
    type: "全集團",
    scope: "group",
    roles: ["董事會", "股東", "執行長"]
  },
  {
    id: "taipei-region",
    parentId: "group",
    label: "台北區",
    type: "區域",
    scope: "region",
    roles: ["區經理"]
  },
  {
    id: "new-taipei-region",
    parentId: "group",
    label: "新北區",
    type: "區域",
    scope: "region",
    roles: ["區經理"]
  },
  {
    id: "taoyuan-region",
    parentId: "group",
    label: "桃園區",
    type: "區域",
    scope: "region",
    roles: ["區經理"]
  },
  {
    id: "business-dept",
    parentId: "group",
    label: "業務部門",
    type: "部門",
    scope: "department",
    roles: ["業務部長", "課長", "組長", "職員"]
  },
  {
    id: "home-care-bu",
    parentId: "business-dept",
    label: "居家照顧部",
    type: "業務線",
    scope: "business_unit",
    roles: ["業務部長", "課長", "組長", "職員"]
  },
  {
    id: "day-care-bu",
    parentId: "business-dept",
    label: "日間照顧部",
    type: "業務線",
    scope: "business_unit",
    roles: ["業務部長", "課長", "組長", "職員"]
  },
  {
    id: "quality-bu",
    parentId: "business-dept",
    label: "教學品管部",
    type: "業務線",
    scope: "business_unit",
    roles: ["業務部長"]
  },
  {
    id: "community-bu",
    parentId: "business-dept",
    label: "社區據點部",
    type: "業務線",
    scope: "business_unit",
    roles: ["業務部長"]
  },
  {
    id: "software-bu",
    parentId: "business-dept",
    label: "軟體販售部",
    type: "業務線",
    scope: "business_unit",
    roles: ["業務部長"]
  },
  {
    id: "migrant-bu",
    parentId: "business-dept",
    label: "移工培訓部",
    type: "業務線",
    scope: "business_unit",
    roles: ["業務部長"]
  },
  {
    id: "admin-dept",
    parentId: "group",
    label: "行政部門",
    type: "部門",
    scope: "department",
    roles: ["行政部長"]
  },
  {
    id: "hr-class",
    parentId: "admin-dept",
    label: "人資課",
    type: "課別",
    scope: "class",
    roles: ["人資課長", "職員"]
  },
  {
    id: "ga-class",
    parentId: "admin-dept",
    label: "總務課",
    type: "課別",
    scope: "class",
    roles: ["總務課長", "職員"]
  },
  {
    id: "finance-class",
    parentId: "admin-dept",
    label: "財會課",
    type: "課別",
    scope: "class",
    roles: ["會計課長", "出納課長", "職員"]
  },
  {
    id: "it-class",
    parentId: "admin-dept",
    label: "資訊課",
    type: "課別",
    scope: "class",
    roles: ["系統管理者"]
  },
  {
    id: "legal-class",
    parentId: "admin-dept",
    label: "法務課",
    type: "課別",
    scope: "class",
    roles: ["課長", "職員"]
  },
  {
    id: "ir-class",
    parentId: "admin-dept",
    label: "投資人關係課",
    type: "課別",
    scope: "class",
    roles: ["課長", "職員"]
  },
  {
    id: "external-audit-unit",
    parentId: "group",
    label: "外部檢核單位",
    type: "外部",
    scope: "custom",
    roles: ["會計事務所"]
  }
];

const moduleOrgRules = {
  announcements: { owner: "group", scope: "company", policy: "依公告對象發布" },
  business: { owner: "business-dept", scope: "business_unit", policy: "依業務線與區域開放" },
  "home-care": { owner: "home-care-bu", scope: "business_unit", policy: "居家照顧部資料" },
  "day-care": { owner: "day-care-bu", scope: "business_unit", policy: "日間照顧部資料" },
  hr: { owner: "hr-class", scope: "department", policy: "行政部門與人資課管理" },
  accounting: { owner: "finance-class", scope: "company", policy: "財會課與外部檢核指定報表" },
  "general-affairs": { owner: "ga-class", scope: "department", policy: "總務課管理" },
  edoc: { owner: "ga-class", scope: "department", policy: "依簽核流程與職等審核" },
  contract: { owner: "legal-class", scope: "company", policy: "法務與總務共同控管" },
  "system-permissions": { owner: "it-class", scope: "custom", policy: "資訊課維護帳號，不預設看敏感內容" },
  "organization-chart": { owner: "it-class", scope: "company", policy: "依組織節點檢視公司架構" },
  "employee-accounts": { owner: "it-class", scope: "custom", policy: "員工帳號與登入狀態管理" },
  "agile-projects": { owner: "ga-class", scope: "assigned", policy: "依專案、衝刺與負責人授權" },
  "pdf-editor": { owner: "it-class", scope: "assigned", policy: "已授權使用者可用" }
};

const scopeLabels = {
  self: "個人",
  assigned: "負責項目",
  class: "課別",
  department: "部門",
  business_unit: "服務單位",
  region: "區域",
  institution: "機構",
  company: "公司",
  group: "全集團",
  custom: "指定範圍"
};

const dataScopeDefinitions = [
  {
    id: "self",
    order: "01",
    label: "僅自己",
    boundary: "只看本人建立、本人申請、本人所屬的資料。",
    examples: "個人資料、自己的申請單、自己的任務",
    defaultRoles: ["職員"],
    guardrail: "不可看同課、同部門其他人明細。"
  },
  {
    id: "assigned",
    order: "02",
    label: "自己負責",
    boundary: "只看被指派給自己的個案、任務、合約或文件。",
    examples: "照顧服務個案、督導負責清單、待辦文件",
    defaultRoles: ["組長", "職員"],
    guardrail: "指派關係異動需留下紀錄。"
  },
  {
    id: "class",
    order: "03",
    label: "本課",
    boundary: "限制在同一課別或服務課內。",
    examples: "人資課、會計課、總務課、居家服務課",
    defaultRoles: ["課長", "人資課長", "會計課長", "總務課長"],
    guardrail: "跨課查詢需另外授權。"
  },
  {
    id: "department",
    order: "04",
    label: "本部門",
    boundary: "限制在同一行政部門或業務部門。",
    examples: "行政部、居家照顧部、日間照顧部",
    defaultRoles: ["行政部長"],
    guardrail: "行政部門不預設看敏感業務內容。"
  },
  {
    id: "business_unit",
    order: "05",
    label: "本業務線",
    boundary: "限制在同一服務或營運業務線。",
    examples: "居家照顧、日間照顧、教學品管、社區據點",
    defaultRoles: ["業務部長"],
    guardrail: "不得跨業務線查看個資明細。"
  },
  {
    id: "region",
    order: "06",
    label: "本區域",
    boundary: "限制在自己負責的縣市或區域。",
    examples: "台北區、新北區、桃園區",
    defaultRoles: ["區經理"],
    guardrail: "跨區域報表需經管理授權。"
  },
  {
    id: "institution",
    order: "07",
    label: "本機構",
    boundary: "限制在同一長照機構或據點。",
    examples: "居家長照機構、社區長照機構、治療所",
    defaultRoles: ["機構業務負責人", "課長"],
    guardrail: "同公司不同機構資料不可自動互通。"
  },
  {
    id: "company",
    order: "08",
    label: "本公司",
    boundary: "限制在同一法人或公司。",
    examples: "歲悅股份有限公司、各長照機構法人",
    defaultRoles: ["董事會", "行政部長", "會計課長"],
    guardrail: "個資、薪資、敏感營運明細仍需模組授權。"
  },
  {
    id: "group",
    order: "09",
    label: "全集團",
    boundary: "可跨公司、跨機構、跨區域檢視全集團資料。",
    examples: "全集團營運儀表板、重大報表",
    defaultRoles: ["執行長", "董事會"],
    guardrail: "最高範圍仍需搭配操作紀錄與敏感資料授權。"
  },
  {
    id: "custom",
    order: "10",
    label: "自訂範圍",
    boundary: "由管理者指定可見公司、機構、區域、部門、報表或期間。",
    examples: "外部檢核報表、股東經營摘要、專案資料室",
    defaultRoles: ["外部檢核單位", "股東"],
    guardrail: "需有效期限，到期自動停用。"
  }
];

const moduleDisplayNames = {
  business: "照顧服務",
  "home-care": "居家照顧",
  "day-care": "日間照顧"
};

const ownerDisplayNames = {
  "business-dept": "照顧服務部門"
};

const moduleDescriptions = {
  announcements: "查看公告、任務提醒與重要消息",
  business: "查看居家、日照等服務入口",
  "home-care": "照顧紀錄、排班與個案服務",
  "day-care": "日照紀錄、活動與到退管理",
  hr: "查看人員、出勤與人事作業",
  accounting: "查看帳務、付款與報表",
  "general-affairs": "處理行政、總務與文件流程",
  edoc: "追蹤公文與簽核進度",
  contract: "管理合約與到期提醒",
  "system-permissions": "管理角色、權限與資料範圍",
  "organization-chart": "查看公司組織與權責關係",
  "employee-accounts": "管理員工登入帳號",
  "agile-projects": "管理任務、看板、衝刺與專案節奏",
  "pdf-editor": "編輯、合併與整理 PDF 文件"
};

const moduleIcons = {
  announcements: "公告",
  business: "照顧",
  "home-care": "居家",
  "day-care": "日照",
  hr: "人資",
  accounting: "財務",
  "general-affairs": "行政",
  edoc: "簽核",
  contract: "合約",
  "system-permissions": "權限",
  "organization-chart": "組織",
  "employee-accounts": "帳號",
  "agile-projects": "專案",
  "pdf-editor": "PDF"
};

const moduleLaunchUrls = {
  accounting: "https://finance.suiyuecare.com/",
  "agile-projects": "https://apm.suiyuecare.com/"
};

const connectedModuleIds = new Set(Object.keys(moduleLaunchUrls));
const sharedGeneralAffairsModules = new Set(["edoc", "pdf-editor"]);
const restrictedGeneralAffairsModules = new Set(["contract", "system-permissions", "organization-chart", "employee-accounts"]);
const generalAffairsManagers = new Set(["ceo", "admin-director"]);

function buildModuleLaunchUrl(moduleId, profile) {
  const launchUrl = moduleLaunchUrls[moduleId];
  if (!launchUrl) return null;

  const url = new URL(launchUrl);
  url.searchParams.set("portal", "1");
  url.searchParams.set("email", profile.email);
  url.searchParams.set("role", profile.label);
  url.searchParams.set("scope", profile.scope);
  return url.toString();
}

const employeeAccountRows = [
  [1, "崇業聯合會計師事務所", "未設定", "外部檢核單位", "外部檢核單位", "未設定", "未設定", "臺北市、新北市、桃園市", "未設定", "指定範圍", "外部待設定"],
  [2, "李佳泰", "entrepreneur@suiyuecare.com", "董事會、股東...", "董事長、股東...", "日間照顧部", "歲悅股份有限公司", "臺北市", "未設定", "全集團", "啟用"],
  [3, "劉巧涵", "admin@suiyuecare.com", "部長", "行政部長", "行政部", "歲悅股份有限公司", "臺北市、新北市、桃園市", "未設定", "本部門", "啟用"],
  [4, "劉巧涵", "suiyue.acct@suiyuecare.com", "課長", "會計課長", "行政部", "歲悅股份有限公司", "臺北市、新北市、桃園市", "會計課", "本課", "啟用"],
  [5, "陳羽俊", "suiyue.hr@suiyuecare.com", "課長", "人資課長", "行政部", "歲悅股份有限公司", "臺北市、新北市、桃園市", "人資課", "本課", "啟用"],
  [6, "朱夏欣", "generalaffairs@suiyuecare.com", "課長", "總務課長", "行政部", "歲悅股份有限公司", "臺北市、新北市、桃園市", "總務課", "本課", "啟用"],
  [7, "李佳泰", "investorrelations@suiyuecare.com", "部長", "投資人關係部", "投資人關係部", "歲悅股份有限公司", "臺北市、新北市、桃園市", "未設定", "本部門", "啟用"],
  [8, "黃致皓", "homecare.taipei@suiyuecare.com", "部長", "機構業務負責人、社區據點部長", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "本部門", "啟用"],
  [9, "尤䅍笙", "未設定", "課長", "業務助理", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "本課", "待補帳號"],
  [10, "邱若欣", "未設定", "組長", "居家服務督導", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "負責項目", "待補帳號"],
  [11, "黃鈺姃", "未設定", "組長", "居家服務督導", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "負責項目", "待補帳號"],
  [12, "陳弘敏", "未設定", "組長", "居家服務督導", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "負責項目", "待補帳號"],
  [13, "林以尊", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [14, "周莉莉", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [15, "鄭仁仲", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [16, "賴冠翔", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [17, "張舜霖", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [18, "劉姿瑩", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [19, "邱穎唯", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [20, "王存旭", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [21, "詹雅苓", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [22, "陳琇瑜", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [23, "林禾湘", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [24, "陳慧娟", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [25, "許雅媛", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [26, "丁惠倫", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [27, "鍾雪芬", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [28, "謝敏", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [29, "朱梅花", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [30, "李怡萱", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [31, "蔡燿廷", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [32, "黃琪瑩", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [33, "董思偉", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [34, "廖云榛", "未設定", "職員", "居家照顧服務員", "居家照顧部", "臺北市私立歲悅居家長照機構", "臺北市", "居家服務課", "個人與指派", "待補帳號"],
  [35, "林方春", "未設定", "課長", "機構業務負責人", "日間照顧部", "歲悅萬華社區長照機構", "臺北市", "萬華一課", "本部門", "待補帳號"],
  [36, "徐靜紅", "未設定", "職員", "照顧服務員", "日間照顧部", "歲悅萬華社區長照機構", "臺北市", "萬華一課", "個人與指派", "待補帳號"],
  [37, "黃苗溶", "未設定", "職員", "照顧服務員", "日間照顧部", "歲悅萬華社區長照機構", "臺北市", "萬華一課", "個人與指派", "待補帳號"],
  [38, "從缺", "未設定", "課長", "機構業務負責人", "日間照顧部", "歲悅萬華二館社區長照機構", "臺北市", "萬華二課", "本部門", "待補帳號"],
  [39, "王力行", "daycare.shilin@suiyuecare.com", "課長", "士林失智據點課長", "社區據點部", "臺北市私立歲悅居家長照機構", "臺北市", "士林失智據點課", "本課", "啟用"],
  [40, "吳俊璋", "daycare.datong@suiyuecare.com", "課長", "大同失智據點課長", "社區據點部", "臺北市私立歲悅居家長照機構", "臺北市", "大同失智據點課", "本課", "啟用"],
  [41, "從缺", "daycare.xinyi@suiyuecare.com", "課長", "信義失智據點課長", "社區據點部", "臺北市私立歲悅居家長照機構", "臺北市", "信義失智據點課", "本課", "啟用"],
  [42, "陳蕙婷", "edu.control@suiyuecare.com", "部長", "教學品管部長", "教學品管部", "歲悅股份有限公司", "臺北市", "未設定", "本部門", "啟用"],
  [43, "楊書竣", "未設定", "部長", "軟體開發部長", "軟體開發部", "歲悅股份有限公司", "臺北市", "未設定", "本部門", "待補帳號"],
  [44, "謝怡霖", "project@suiyuecare.com", "部長", "移工培訓部長", "移工培訓部", "臺北市私立歲悅居家長照機構", "臺北市", "未設定", "本部門", "啟用"],
  [45, "徐靖雯", "project_hsu@suiyuecare.com", "課長", "業務助理", "移工培訓部", "臺北市私立歲悅居家長照機構", "臺北市", "高雄到宅課", "本課", "啟用"],
  [46, "江守舜", "project_chiang@suiyuecare.com", "課長", "業務督導員", "移工培訓部", "臺北市私立歲悅居家長照機構", "臺北市", "移工數位學習課", "本課", "啟用"],
  [47, "潘雨柔", "project_pan@suiyuecare.com", "職員", "業務督導員", "移工培訓部", "臺北市私立歲悅居家長照機構", "臺北市", "移工數位學習課", "負責項目", "啟用"],
  [48, "沈芊佑", "project_yu@suiyuecare.com", "課長", "業務督導員", "移工培訓部", "臺北市私立歲悅居家長照機構", "臺北市", "臺北到宅課, 臺北集中課", "本課", "啟用"],
  [49, "合瓊玲", "未設定", "組長", "社團輔導員", "移工培訓部", "臺北市私立歲悅居家長照機構", "臺北市", "移工數位學習課", "負責項目", "待補帳號"],
  [50, "阮氏翠", "未設定", "職員", "越南行銷企劃", "移工培訓部", "臺北市私立歲悅居家長照機構", "臺北市", "移工數位學習課", "個人與指派", "待補帳號"],
  [51, "胡佑霓", "未設定", "職員", "印尼行銷企劃", "移工培訓部", "臺北市私立歲悅居家長照機構", "臺北市", "移工數位學習課", "個人與指派", "待補帳號"],
  [52, "黃瓊寬", "未設定", "職員", "菲律賓行銷企劃", "移工培訓部", "臺北市私立歲悅居家長照機構", "臺北市", "移工數位學習課", "個人與指派", "待補帳號"],
  [53, "金哲宇", "未設定", "區經理、部長", "新北區經理、機構業務負責人", "居家照顧部", "歲悅新北股份有限公司", "新北市", "未設定", "本區域", "待補帳號"],
  [54, "蘇之瑄", "未設定", "課長", "行政助理", "行政部", "歲悅新北股份有限公司", "新北市", "未設定", "本課", "待補帳號"],
  [55, "周育安", "未設定", "課長", "居家服務督導", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "本課", "待補帳號"],
  [56, "陳欣語", "未設定", "課長", "居家服務督導", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "本課", "待補帳號"],
  [57, "杜志峰", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [58, "嚴嘉慧", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [59, "黃寶玉", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [60, "何榮芳", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [61, "呂菁雯", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [62, "徐玉珍", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [63, "古麗香", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [64, "何佩蓉", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [65, "謝昱琳", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [66, "李依芳", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [67, "陳美娥", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [68, "樓蕊蘭", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [69, "蕭淑鈴", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [70, "劉育銘", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [71, "梁素雯", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [72, "黃翊瑄", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [73, "吉坤富", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [74, "耿筱筱", "未設定", "職員", "居家照顧服務員", "居家照顧部", "歲悅新北居家長照機構", "新北市", "居家服務課", "個人與指派", "待補帳號"],
  [75, "游雅婷", "未設定", "職員", "個案管理師", "居家照顧部", "歲悅居家職能治療所", "新北市", "個案管理課", "個人與指派", "待補帳號"],
  [76, "方意婷", "未設定", "職員", "個案管理師", "居家照顧部", "歲悅居家職能治療所", "新北市", "個案管理課", "個人與指派", "待補帳號"],
  [77, "呂新穎", "未設定", "職員", "個案管理師", "居家照顧部", "歲悅居家職能治療所", "新北市", "個案管理課", "個人與指派", "待補帳號"]
];

const employeeAccounts = employeeAccountRows.map(
  ([no, name, email, grade, title, department, company, region, className, dataScope, accountStatus]) => ({
    no,
    name,
    email,
    grade,
    title,
    department,
    company,
    region,
    className,
    dataScope,
    accountStatus
  })
);

const gradeLevels = [
  {
    id: "board",
    order: "01",
    name: "董事會",
    category: "治理職等",
    defaultScope: "group",
    actions: ["view", "export", "print"],
    limits: "可看重大經營資訊；個資明細需另行授權。",
    appliesTo: "董事會成員"
  },
  {
    id: "shareholder",
    order: "02",
    name: "股東",
    category: "治理職等",
    defaultScope: "custom",
    actions: ["view", "export"],
    limits: "只看投資人與經營摘要，不預設開放個資與薪資明細。",
    appliesTo: "股東"
  },
  {
    id: "ceo",
    order: "03",
    name: "執行長",
    category: "經營管理",
    defaultScope: "group",
    actions: ["view", "create", "edit", "delete", "submit", "approve", "reject", "assign", "export", "print", "manage"],
    limits: "全集團最高營運權限；敏感操作仍需留存操作紀錄。",
    appliesTo: "執行長"
  },
  {
    id: "region-manager",
    order: "04",
    name: "區經理",
    category: "經營管理",
    defaultScope: "region",
    actions: ["view", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    limits: "僅限自己負責區域資料。",
    appliesTo: "台北區、新北區、桃園區"
  },
  {
    id: "business-director",
    order: "05",
    name: "業務部長",
    category: "業務部門",
    defaultScope: "business_unit",
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    limits: "依所屬業務線開放，不跨業務線看個資明細。",
    appliesTo: "居家照顧部、日間照顧部、教學品管部、社區據點部、軟體販售部、移工培訓部"
  },
  {
    id: "admin-director",
    order: "06",
    name: "行政部長",
    category: "行政部門",
    defaultScope: "department",
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    limits: "管理行政部門，不預設開放敏感業務內容。",
    appliesTo: "行政部門"
  },
  {
    id: "section-chief",
    order: "07",
    name: "課長",
    category: "課級主管",
    defaultScope: "class",
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    limits: "依課別控管資料與簽核權限。",
    appliesTo: "人資課、總務課、財會課、資訊課、法務課、投資人關係課、各業務課"
  },
  {
    id: "team-lead",
    order: "08",
    name: "組長",
    category: "現場管理",
    defaultScope: "assigned",
    actions: ["view", "create", "edit", "submit", "assign", "print"],
    limits: "以自己負責個案、任務或人員為主。",
    appliesTo: "各服務組與督導組"
  },
  {
    id: "staff",
    order: "09",
    name: "職員",
    category: "一般同仁",
    defaultScope: "self",
    actions: ["view", "create", "edit", "submit", "print"],
    limits: "僅自己或被指派資料，不可提升自己的權限。",
    appliesTo: "行政職員、照顧服務員、個案管理師、業務職員"
  },
  {
    id: "external-audit",
    order: "10",
    name: "外部檢核單位",
    category: "外部帳號",
    defaultScope: "custom",
    actions: ["view", "export", "print"],
    limits: "預設只讀，可匯出指定報表；需設定有效期限並記錄所有操作。",
    appliesTo: "會計事務所"
  }
];

const roleDefinitions = [
  {
    id: "external-audit",
    order: "01",
    name: "外部檢核單位",
    grade: "外部檢核單位",
    category: "外部角色",
    defaultScope: "custom",
    modules: ["會計系統"],
    actions: ["view", "export", "print"],
    limits: "預設只讀、可匯出指定報表，需有效期限與全操作紀錄。"
  },
  {
    id: "board",
    order: "02",
    name: "董事會",
    grade: "董事會",
    category: "治理角色",
    defaultScope: "group",
    modules: ["系統公告", "會計系統"],
    actions: ["view", "export", "print"],
    limits: "可看重大經營資訊；個資明細需另行授權。"
  },
  {
    id: "shareholder",
    order: "03",
    name: "股東",
    grade: "股東",
    category: "治理角色",
    defaultScope: "custom",
    modules: ["系統公告", "會計系統"],
    actions: ["view", "export"],
    limits: "只看投資人與經營摘要，不開放薪資與個資明細。"
  },
  {
    id: "ceo",
    order: "04",
    name: "執行長",
    grade: "執行長",
    category: "最高管理角色",
    defaultScope: "group",
    modules: ["全部模組"],
    actions: ["view", "create", "edit", "delete", "submit", "approve", "reject", "assign", "export", "print", "manage"],
    limits: "全集團最高營運權限；敏感操作仍需稽核紀錄。"
  },
  {
    id: "region-manager",
    order: "05",
    name: "區經理",
    grade: "區經理",
    category: "區域管理角色",
    defaultScope: "region",
    modules: ["系統公告", "照顧服務", "會計系統", "總務系統"],
    actions: ["view", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    limits: "只能看自己區域資料。"
  },
  {
    id: "admin-director",
    order: "06",
    name: "行政部長",
    grade: "行政部長",
    category: "行政管理角色",
    defaultScope: "department",
    modules: ["人資系統", "會計系統", "總務系統"],
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    limits: "管理行政部門；不預設查看敏感業務內容。"
  },
  {
    id: "hr-chief",
    order: "07",
    name: "人資課長",
    grade: "課長",
    category: "行政課級角色",
    defaultScope: "class",
    modules: ["人資系統", "總務系統"],
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    limits: "限人資課與授權人事資料。"
  },
  {
    id: "accounting-chief",
    order: "08",
    name: "會計課長",
    grade: "課長",
    category: "行政課級角色",
    defaultScope: "class",
    modules: ["會計系統", "總務系統"],
    actions: ["view", "create", "edit", "submit", "approve", "reject", "export", "print"],
    limits: "限財會課帳務與指定報表。"
  },
  {
    id: "cashier-chief",
    order: "09",
    name: "出納課長",
    grade: "課長",
    category: "行政課級角色",
    defaultScope: "class",
    modules: ["會計系統", "總務系統"],
    actions: ["view", "create", "edit", "submit", "export", "print"],
    limits: "限出納收付款與指定財務流程。"
  },
  {
    id: "ga-chief",
    order: "10",
    name: "總務課長",
    grade: "課長",
    category: "行政課級角色",
    defaultScope: "class",
    modules: ["總務系統", "公文簽核系統", "合約管理系統", "敏捷專案管理"],
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    limits: "限總務、公文與合約流程。"
  },
  {
    id: "business-director",
    order: "11",
    name: "業務部長",
    grade: "業務部長",
    category: "業務管理角色",
    defaultScope: "business_unit",
    modules: ["照顧服務", "居家照顧", "日間照顧", "總務系統"],
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    limits: "只看自己業務線資料。"
  },
  {
    id: "section-chief",
    order: "12",
    name: "課長",
    grade: "課長",
    category: "課級角色",
    defaultScope: "class",
    modules: ["依課別開放", "總務系統"],
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "print"],
    limits: "限本課資料與被授權流程。"
  },
  {
    id: "team-lead",
    order: "13",
    name: "組長",
    grade: "組長",
    category: "現場角色",
    defaultScope: "assigned",
    modules: ["依任務開放", "總務系統"],
    actions: ["view", "create", "edit", "submit", "assign", "print"],
    limits: "限自己負責個案、任務或人員。"
  },
  {
    id: "staff",
    order: "14",
    name: "職員",
    grade: "職員",
    category: "一般角色",
    defaultScope: "self",
    modules: ["依職務開放", "總務系統"],
    actions: ["view", "create", "edit", "submit", "print"],
    limits: "僅自己或被指派資料，不允許提升自己權限。"
  }
];

const modulePermissionDefinitions = [
  {
    moduleId: "announcements",
    roles: ["board", "shareholder", "ceo", "region-manager", "admin-director", "business-director", "section-chief", "team-lead", "staff"],
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    sensitivity: "一般",
    limits: "依公告對象、公司與角色發布；外部帳號不預設進入。"
  },
  {
    moduleId: "business",
    roles: ["ceo", "region-manager", "business-director", "section-chief", "team-lead", "staff"],
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    sensitivity: "個資",
    limits: "依業務線、區域與負責項目控管。"
  },
  {
    moduleId: "home-care",
    roles: ["ceo", "region-manager", "business-director", "section-chief", "team-lead", "staff"],
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    sensitivity: "高度個資",
    limits: "居家服務個案、照顧紀錄與排班資料需依 Data Scope 過濾。"
  },
  {
    moduleId: "day-care",
    roles: ["ceo", "region-manager", "business-director", "section-chief", "team-lead", "staff"],
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    sensitivity: "高度個資",
    limits: "日照個案、活動與到退管理資料需依機構與業務線過濾。"
  },
  {
    moduleId: "hr",
    roles: ["ceo", "admin-director", "hr-chief"],
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    sensitivity: "薪資 / 個資",
    limits: "薪資、任用與員工個資不對資訊課或一般角色預設開放。"
  },
  {
    moduleId: "accounting",
    roles: ["external-audit", "board", "shareholder", "ceo", "region-manager", "admin-director", "accounting-chief", "cashier-chief"],
    actions: ["view", "create", "edit", "submit", "approve", "reject", "export", "print"],
    sensitivity: "財務",
    limits: "外部檢核只讀與指定匯出；股東只看摘要。"
  },
  {
    moduleId: "general-affairs",
    roles: ["ceo", "admin-director", "ga-chief"],
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    sensitivity: "內部作業",
    limits: "總務資料依行政部門與總務課控管。"
  },
  {
    moduleId: "edoc",
    roles: ["ceo", "admin-director", "ga-chief"],
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    sensitivity: "簽核",
    limits: "依簽核流程、職等與節點授權審核。"
  },
  {
    moduleId: "contract",
    roles: ["ceo", "admin-director", "ga-chief"],
    actions: ["view", "create", "edit", "submit", "approve", "reject", "assign", "export", "print"],
    sensitivity: "合約",
    limits: "合約到期、法務與總務權限分工控管。"
  },
  {
    moduleId: "system-permissions",
    roles: ["ceo", "admin-director"],
    actions: ["view", "create", "edit", "delete", "assign", "export", "print", "manage"],
    sensitivity: "最高權限",
    limits: "不得刪除最後一位最高管理者；不得自行提升權限。"
  },
  {
    moduleId: "organization-chart",
    roles: ["ceo", "region-manager", "admin-director", "hr-chief", "accounting-chief", "cashier-chief", "ga-chief", "business-director", "section-chief", "team-lead", "staff"],
    actions: ["view", "print"],
    sensitivity: "內部組織",
    limits: "依組織節點顯示可見範圍。"
  },
  {
    moduleId: "employee-accounts",
    roles: ["ceo", "admin-director", "hr-chief"],
    actions: ["view", "create", "edit", "assign", "export", "print", "manage"],
    sensitivity: "帳號 / 個資",
    limits: "帳號啟停、角色異動、權限變更都需操作紀錄。"
  },
  {
    moduleId: "agile-projects",
    roles: ["ceo", "admin-director", "ga-chief", "business-director", "section-chief", "team-lead", "staff"],
    actions: ["view", "create", "edit", "submit", "assign", "export", "print", "manage"],
    sensitivity: "內部專案",
    limits: "依專案、衝刺、負責人與跨部門協作範圍控管。"
  },
  {
    moduleId: "pdf-editor",
    roles: ["ceo", "region-manager", "admin-director", "hr-chief", "accounting-chief", "cashier-chief", "ga-chief", "business-director", "section-chief", "team-lead", "staff"],
    actions: ["view", "create", "edit", "print"],
    sensitivity: "文件工具",
    limits: "僅工具操作；文件內容仍依來源模組權限控管。"
  }
];

const buttonActionDefinitions = [
  { action: "view", label: "查看", button: "查看 / 進入", risk: "低", audit: "一般瀏覽可記錄登入與查詢條件" },
  { action: "create", label: "新增", button: "新增", risk: "中", audit: "新增資料需記錄建立者與時間" },
  { action: "edit", label: "編輯", button: "編輯 / 儲存", risk: "中", audit: "異動前後內容需可追蹤" },
  { action: "delete", label: "刪除", button: "刪除", risk: "高", audit: "必須記錄原因，不允許刪除最後一位最高管理者" },
  { action: "submit", label: "送審", button: "送審", risk: "中", audit: "需記錄送審人、流程節點與時間" },
  { action: "approve", label: "審核", button: "核准", risk: "高", audit: "需記錄審核人、意見、時間與版本" },
  { action: "reject", label: "退回", button: "退回", risk: "中", audit: "需記錄退回原因與退回節點" },
  { action: "assign", label: "指派", button: "指派", risk: "中", audit: "需記錄指派對象與責任範圍" },
  { action: "export", label: "匯出", button: "匯出", risk: "高", audit: "必須記錄匯出人、範圍、筆數與檔案類型" },
  { action: "print", label: "列印", button: "列印", risk: "中", audit: "必須記錄列印人與資料範圍" },
  { action: "manage", label: "管理", button: "管理 / 設定", risk: "最高", audit: "權限異動必須留存完整操作紀錄" }
];

const sensitiveDataDefinitions = [
  {
    id: "general",
    order: "01",
    label: "一般資料",
    match: ["一般"],
    level: "低",
    examples: "系統公告、公開提醒、一般任務訊息",
    allowedScopes: ["company", "group"],
    requiredControls: ["登入紀錄", "查詢條件紀錄"],
    restriction: "仍需依公告對象與公司別顯示。"
  },
  {
    id: "internal",
    order: "02",
    label: "內部作業資料",
    match: ["內部作業", "內部組織", "工具", "內部專案"],
    level: "中",
    examples: "總務作業、組織節點、一般工具入口、敏捷專案任務",
    allowedScopes: ["assigned", "class", "department", "company"],
    requiredControls: ["角色授權", "Data Scope 過濾", "操作紀錄"],
    restriction: "不可因總務工具權限而穿透原模組資料。"
  },
  {
    id: "personal",
    order: "03",
    label: "個資資料",
    match: ["個資"],
    level: "高",
    examples: "個案資料、員工基本資料、照顧服務紀錄",
    allowedScopes: ["self", "assigned", "class", "department", "business_unit", "region", "institution"],
    requiredControls: ["最小權限", "查詢紀錄", "匯出審核", "遮罩顯示"],
    restriction: "董事會與股東不預設開放個資明細。"
  },
  {
    id: "high-personal",
    order: "04",
    label: "高度個資",
    match: ["高度個資"],
    level: "最高",
    examples: "照顧紀錄、健康狀態、排班與到退紀錄",
    allowedScopes: ["assigned", "class", "business_unit", "region", "institution"],
    requiredControls: ["強制 Data Scope", "匯出留痕", "列印留痕", "敏感欄位遮罩"],
    restriction: "跨業務線、跨區域、跨機構查詢需另行授權。"
  },
  {
    id: "payroll",
    order: "05",
    label: "薪資與任用資料",
    match: ["薪資"],
    level: "最高",
    examples: "薪資、任用、員工個資、考核資料",
    allowedScopes: ["class", "department", "company", "custom"],
    requiredControls: ["雙重授權", "欄位遮罩", "匯出原因", "完整稽核"],
    restriction: "資訊課可維護帳號，但不預設查看薪資與任用內容。"
  },
  {
    id: "finance",
    order: "06",
    label: "財務資料",
    match: ["財務"],
    level: "高",
    examples: "帳務、付款、報表、外部檢核指定資料",
    allowedScopes: ["class", "company", "group", "custom"],
    requiredControls: ["報表授權", "匯出留痕", "外部帳號有效期限"],
    restriction: "股東只看投資人與經營摘要；外部檢核預設只讀。"
  },
  {
    id: "approval",
    order: "07",
    label: "簽核資料",
    match: ["簽核"],
    level: "高",
    examples: "送審、審核、退回、公文流程與意見",
    allowedScopes: ["assigned", "class", "department", "company"],
    requiredControls: ["流程節點紀錄", "審核意見版本", "退回原因"],
    restriction: "審核、退回不可由未授權節點執行。"
  },
  {
    id: "contract",
    order: "08",
    label: "合約資料",
    match: ["合約"],
    level: "高",
    examples: "合約內容、到期提醒、法務與總務文件",
    allowedScopes: ["assigned", "department", "company", "custom"],
    requiredControls: ["合約版本紀錄", "下載留痕", "到期權限複核"],
    restriction: "合約內容依法務、總務與管理授權分工。"
  },
  {
    id: "permission",
    order: "09",
    label: "帳號與權限資料",
    match: ["最高權限", "帳號 / 個資"],
    level: "最高",
    examples: "帳號啟停、角色異動、權限設定、Data Scope 調整",
    allowedScopes: ["custom"],
    requiredControls: ["不可自我提權", "不可刪最後最高管理者", "完整稽核", "異動前後比對"],
    restriction: "權限異動需記錄操作者、對象、異動內容與理由。"
  },
  {
    id: "document-tool",
    order: "10",
    label: "文件工具資料",
    match: ["文件工具"],
    level: "中",
    examples: "PDF 編輯、合併、列印、下載",
    allowedScopes: ["assigned", "class", "department"],
    requiredControls: ["來源模組授權", "列印紀錄", "下載紀錄"],
    restriction: "工具可用不代表文件內容可見。"
  }
];

const auditLogDefinitions = [
  {
    id: "login",
    order: "01",
    event: "登入與登出",
    triggerActions: ["view"],
    risk: "低",
    requiredFields: ["操作者", "帳號", "時間", "IP", "裝置", "登入結果"],
    retention: "保留 1 年",
    approval: "不需審核",
    guardrail: "異常登入、外部帳號登入需標記風險。"
  },
  {
    id: "read-sensitive",
    order: "02",
    event: "查看敏感資料",
    triggerActions: ["view"],
    risk: "中",
    requiredFields: ["操作者", "模組", "資料分類", "Data Scope", "查詢條件", "時間"],
    retention: "保留 3 年",
    approval: "依敏感等級",
    guardrail: "高度個資、薪資、財務明細需記錄查詢條件。"
  },
  {
    id: "create-edit",
    order: "03",
    event: "新增與編輯",
    triggerActions: ["create", "edit"],
    risk: "中",
    requiredFields: ["操作者", "資料 ID", "異動前", "異動後", "原因", "時間"],
    retention: "保留 5 年",
    approval: "重要欄位需覆核",
    guardrail: "敏感欄位異動需保留前後差異。"
  },
  {
    id: "submit-approval",
    order: "04",
    event: "送審與審核",
    triggerActions: ["submit", "approve", "reject"],
    risk: "高",
    requiredFields: ["流程節點", "送審人", "審核人", "意見", "結果", "版本"],
    retention: "保留 5 年",
    approval: "依流程節點",
    guardrail: "未在簽核節點上的角色不可核准或退回。"
  },
  {
    id: "assign",
    order: "05",
    event: "指派與資料範圍變更",
    triggerActions: ["assign"],
    risk: "高",
    requiredFields: ["操作者", "指派對象", "原負責人", "新負責人", "Data Scope", "原因"],
    retention: "保留 5 年",
    approval: "主管覆核",
    guardrail: "不得把資料指派給無模組權限或無角色權限的人。"
  },
  {
    id: "export-print",
    order: "06",
    event: "匯出與列印",
    triggerActions: ["export", "print"],
    risk: "高",
    requiredFields: ["操作者", "模組", "範圍", "筆數", "欄位", "檔案類型", "原因"],
    retention: "保留 7 年",
    approval: "敏感資料需事前授權",
    guardrail: "個資、薪資、財務與外部檢核匯出必須留下完整紀錄。"
  },
  {
    id: "delete",
    order: "07",
    event: "刪除與停用",
    triggerActions: ["delete"],
    risk: "最高",
    requiredFields: ["操作者", "資料 ID", "刪除原因", "備份狀態", "覆核人", "時間"],
    retention: "永久保留摘要",
    approval: "需二次確認",
    guardrail: "不得刪除最後一位最高管理者；重要資料優先停用。"
  },
  {
    id: "permission-change",
    order: "08",
    event: "權限異動",
    triggerActions: ["manage"],
    risk: "最高",
    requiredFields: ["操作者", "被異動帳號", "原角色", "新角色", "原 Data Scope", "新 Data Scope", "原因"],
    retention: "永久保留",
    approval: "最高管理者或指定主管覆核",
    guardrail: "一般使用者不得提升自己的權限，最高管理者不得被清空。"
  },
  {
    id: "external-account",
    order: "09",
    event: "外部帳號授權",
    triggerActions: ["view", "export", "print"],
    risk: "高",
    requiredFields: ["外部單位", "有效期限", "授權報表", "操作紀錄", "停用時間"],
    retention: "保留 7 年",
    approval: "到期自動停用",
    guardrail: "會計事務所預設只讀，只能匯出指定報表。"
  }
];

const securityRestrictionDefinitions = [
  {
    id: "no-self-escalation",
    order: "01",
    title: "禁止自我提權",
    appliesTo: "所有使用者",
    trigger: "角色、職等、Data Scope、模組權限異動",
    enforcement: "操作者與被異動帳號相同時，禁止提高權限或擴大資料範圍。",
    audit: "記錄操作者、異動前後、阻擋原因與時間。",
    severity: "最高"
  },
  {
    id: "last-super-admin",
    order: "02",
    title: "保留最後最高管理者",
    appliesTo: "執行長、最高管理者、系統權限管理者",
    trigger: "刪除、停用、降權、移除 manage 權限",
    enforcement: "若操作會導致沒有最高管理者，必須阻擋。",
    audit: "記錄嘗試刪除或降權的操作與目標帳號。",
    severity: "最高"
  },
  {
    id: "external-expiry",
    order: "03",
    title: "外部帳號有效期限",
    appliesTo: "外部檢核單位、會計事務所",
    trigger: "登入、查看、匯出、列印",
    enforcement: "外部帳號必須設定有效期限，到期自動停用，不得延長為永久帳號。",
    audit: "記錄授權期間、停用時間、匯出報表與操作人。",
    severity: "高"
  },
  {
    id: "google-allowlist",
    order: "04",
    title: "Google 帳號白名單",
    appliesTo: "Google OAuth 登入",
    trigger: "Google 登入回到 Portal",
    enforcement: "Google email 必須對應既有 Portal 帳號、角色與 Data Scope，否則立即登出並拒絕進入。",
    audit: "記錄登入 email、登入結果、拒絕原因與時間。",
    severity: "高"
  },
  {
    id: "sensitive-export",
    order: "05",
    title: "敏感資料匯出限制",
    appliesTo: "個資、薪資、財務、高度個資",
    trigger: "匯出、列印、下載",
    enforcement: "需具備模組權限、功能按鈕權限、Data Scope 與匯出授權；需填寫原因。",
    audit: "記錄範圍、筆數、欄位、檔案類型、原因與操作人。",
    severity: "最高"
  },
  {
    id: "it-content-separation",
    order: "06",
    title: "資訊課維護與內容隔離",
    appliesTo: "資訊課、系統維護者",
    trigger: "帳號維護、系統設定、權限設定",
    enforcement: "可維護系統與帳號，但不預設查看薪資、個資、財務與敏感業務內容。",
    audit: "記錄維護內容，不記錄或暴露非授權敏感內容。",
    severity: "高"
  },
  {
    id: "board-shareholder-privacy",
    order: "07",
    title: "董事會與股東個資隔離",
    appliesTo: "董事會、股東",
    trigger: "查看重大報表、經營摘要、投資人資料",
    enforcement: "董事會需另行授權才可看個資明細；股東只看投資人與經營摘要。",
    audit: "記錄查詢報表與是否含個資欄位。",
    severity: "高"
  },
  {
    id: "region-boundary",
    order: "08",
    title: "區域與業務線邊界",
    appliesTo: "區經理、業務部長、課長、組長",
    trigger: "跨區域、跨業務線、跨課別查詢",
    enforcement: "不得跨出自己區域、業務線、課別或負責項目，除非有自訂授權。",
    audit: "記錄查詢條件、Data Scope、授權來源與阻擋結果。",
    severity: "高"
  },
  {
    id: "delete-protection",
    order: "09",
    title: "刪除保護與二次確認",
    appliesTo: "所有具 delete 權限角色",
    trigger: "刪除帳號、資料、合約、紀錄",
    enforcement: "重要資料優先停用；刪除需二次確認與原因，不得刪除操作紀錄。",
    audit: "記錄刪除原因、覆核人、備份狀態與時間。",
    severity: "最高"
  },
  {
    id: "audit-immutability",
    order: "10",
    title: "操作紀錄不可竄改",
    appliesTo: "操作紀錄、權限異動紀錄、匯出列印紀錄",
    trigger: "修改、刪除、覆寫操作紀錄",
    enforcement: "操作紀錄不得由一般使用者修改或刪除，管理者只能查詢與匯出稽核摘要。",
    audit: "紀錄本身採追加式留存，保留查詢與匯出紀錄。",
    severity: "最高"
  }
];

function getModuleDisplayName(module) {
  return moduleDisplayNames[module.id] || module.name;
}

function getOwnerDisplayName(owner) {
  if (!owner) return "歲悅長照集團";
  return ownerDisplayNames[owner.id] || owner.label;
}

const quickLoginProfiles = [
  {
    id: "external-audit",
    label: "外部檢核單位",
    title: "會計事務所",
    email: "audit.office@suiyuecare.com",
    scope: "custom",
    note: "只讀、可匯出指定報表",
    modules: ["announcements", "accounting"]
  },
  {
    id: "board",
    label: "董事會",
    title: "董事會成員",
    email: "board@suiyuecare.com",
    scope: "group",
    note: "重大經營資訊，不含個資明細",
    modules: ["announcements", "accounting"]
  },
  {
    id: "shareholder",
    label: "股東",
    title: "股東",
    email: "shareholder@suiyuecare.com",
    scope: "custom",
    note: "投資人與經營摘要",
    modules: ["announcements", "accounting"]
  },
  {
    id: "ceo",
    label: "執行長",
    title: "全集團最高營運權限",
    email: "ceo@suiyuecare.com",
    scope: "group",
    note: "全集團",
    modules: ["announcements", "business", "home-care", "day-care", "hr", "accounting", "general-affairs", "edoc", "contract", "system-permissions", "organization-chart", "employee-accounts", "agile-projects", "pdf-editor"]
  },
  {
    id: "region-manager",
    label: "區經理",
    title: "台北區 / 新北區 / 桃園區",
    email: "region.manager@suiyuecare.com",
    scope: "region",
    note: "僅自己區域資料",
    modules: ["announcements", "business", "home-care", "day-care", "accounting", "organization-chart", "employee-accounts", "agile-projects", "pdf-editor"]
  },
  {
    id: "admin-director",
    label: "行政部長",
    title: "行政部門",
    email: "admin.director@suiyuecare.com",
    scope: "department",
    note: "行政部門管理",
    modules: ["announcements", "hr", "accounting", "general-affairs", "edoc", "contract", "system-permissions", "organization-chart", "employee-accounts", "agile-projects", "pdf-editor"]
  },
  {
    id: "hr-chief",
    label: "人資課長",
    title: "人資課",
    email: "hr.chief@suiyuecare.com",
    scope: "class",
    note: "人資課資料",
    modules: ["announcements", "hr", "organization-chart", "employee-accounts", "agile-projects", "pdf-editor"]
  },
  {
    id: "accounting-chief",
    label: "會計課長",
    title: "財會課",
    email: "accounting.chief@suiyuecare.com",
    scope: "class",
    note: "會計帳務與報表",
    modules: ["announcements", "accounting", "organization-chart", "employee-accounts", "agile-projects", "pdf-editor"]
  },
  {
    id: "cashier-chief",
    label: "出納課長",
    title: "財會課 / 出納",
    email: "cashier.chief@suiyuecare.com",
    scope: "class",
    note: "出納付款與收款",
    modules: ["announcements", "accounting", "organization-chart", "employee-accounts", "agile-projects", "pdf-editor"]
  },
  {
    id: "ga-chief",
    label: "總務課長",
    title: "總務課",
    email: "ga.chief@suiyuecare.com",
    scope: "class",
    note: "公文、合約與總務事項",
    modules: ["announcements", "general-affairs", "edoc", "contract", "organization-chart", "employee-accounts", "agile-projects", "pdf-editor"]
  },
  {
    id: "business-director",
    label: "業務部長",
    title: "居家照顧部 / 日間照顧部等",
    email: "business.director@suiyuecare.com",
    scope: "business_unit",
    note: "自己業務線資料",
    modules: ["announcements", "business", "home-care", "day-care", "organization-chart", "employee-accounts", "agile-projects", "pdf-editor"]
  },
  {
    id: "section-chief",
    label: "課長",
    title: "業務課長",
    email: "section.chief@suiyuecare.com",
    scope: "class",
    note: "本課資料",
    modules: ["announcements", "business", "home-care", "day-care", "organization-chart", "employee-accounts", "agile-projects", "pdf-editor"]
  },
  {
    id: "team-lead",
    label: "組長",
    title: "業務組長",
    email: "team.lead@suiyuecare.com",
    scope: "assigned",
    note: "自己負責資料",
    modules: ["announcements", "business", "home-care", "day-care", "organization-chart", "employee-accounts", "agile-projects", "pdf-editor"]
  },
  {
    id: "staff",
    label: "職員",
    title: "一般職員",
    email: "staff@suiyuecare.com",
    scope: "self",
    note: "僅自己與被指派任務",
    modules: ["announcements", "business", "home-care", "day-care", "organization-chart", "employee-accounts", "agile-projects", "pdf-editor"]
  }
];

const quickLoginGroups = [
  {
    id: "governance",
    title: "治理與外部",
    caption: "只開放摘要、報表與檢核所需入口",
    profiles: ["external-audit", "board", "shareholder"]
  },
  {
    id: "management",
    title: "經營管理",
    caption: "全集團與區域營運角色",
    profiles: ["ceo", "region-manager"]
  },
  {
    id: "admin",
    title: "行政中心",
    caption: "人資、財會、出納、總務",
    profiles: ["admin-director", "hr-chief", "accounting-chief", "cashier-chief", "ga-chief"]
  },
  {
    id: "business",
    title: "業務現場",
    caption: "業務線主管與一線同仁",
    profiles: ["business-director", "section-chief", "team-lead", "staff"]
  }
];

const accountAliases = {
  "entrepreneur@suiyuecare.com": "ceo"
};

function getQuickLoginProfile(profileId) {
  return quickLoginProfiles.find((profile) => profile.id === profileId) || null;
}

function canUseEmployeeAccount(account) {
  return Boolean(account?.email) && account.email !== "未設定" && account.accountStatus === "啟用";
}

function getEmployeeProfileId(account) {
  const grade = normalizeGradeText(`${account.grade} ${account.title}`);
  const department = normalizeGradeText(account.department);
  const className = normalizeGradeText(account.className);

  if (grade.includes("會計事務所") || grade.includes("外部檢核")) return "external-audit";
  if (grade.includes("股東")) return "shareholder";
  if (grade.includes("董事長") || grade.includes("執行長")) return "ceo";
  if (grade.includes("董事會")) return "board";
  if (grade.includes("區經理")) return "region-manager";
  if (grade.includes("行政部長")) return "admin-director";
  if (grade.includes("人資課長") || className.includes("人資課")) return "hr-chief";
  if (grade.includes("出納")) return "cashier-chief";
  if (grade.includes("會計課長") || className.includes("會計課") || className.includes("財會課")) return "accounting-chief";
  if (grade.includes("總務課長") || className.includes("總務課")) return "ga-chief";
  if (grade.includes("投資人關係")) return "admin-director";
  if (grade.includes("部長") || grade.includes("機構業務負責人") || department.includes("照顧部") || department.includes("品管部") || department.includes("據點部") || department.includes("軟體") || department.includes("移工")) return "business-director";
  if (grade.includes("課長")) return "section-chief";
  if (grade.includes("組長") || grade.includes("督導")) return "team-lead";
  return "staff";
}

function getEmployeeProfileById(profileId) {
  if (!profileId?.startsWith("employee-")) return null;
  const employeeNo = Number(profileId.replace("employee-", ""));
  const account = employeeAccounts.find((employee) => employee.no === employeeNo);
  return getEmployeeProfile(account);
}

function getEmployeeProfile(account) {
  if (!canUseEmployeeAccount(account)) return null;
  const template = getQuickLoginProfile(getEmployeeProfileId(account)) || getQuickLoginProfile("staff");
  if (!template) return null;

  return {
    ...template,
    id: `employee-${account.no}`,
    label: account.name,
    title: account.title,
    email: account.email,
    scope: normalizeDataScopeId(account.dataScope || template.scope),
    note: `${account.company}｜${account.department}${account.className === "未設定" ? "" : `｜${account.className}`}`,
    sourceProfileId: template.id
  };
}

function findEmployeeProfileByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const account = employeeAccounts.find(
    (employee) => canUseEmployeeAccount(employee) && employee.email.toLowerCase() === normalizedEmail
  );
  return getEmployeeProfile(account);
}

function setStatus(message, type = "info") {
  if (!status) return;
  status.textContent = message;
  status.dataset.status = type;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getAccountStats(accounts = employeeAccounts) {
  return accounts.reduce(
    (stats, account) => {
      stats.total += 1;
      if (account.accountStatus === "啟用") stats.active += 1;
      if (account.accountStatus === "待補帳號") stats.pending += 1;
      if (account.accountStatus.includes("外部")) stats.external += 1;
      return stats;
    },
    { total: 0, active: 0, pending: 0, external: 0 }
  );
}

function getStatusClass(statusText) {
  if (statusText === "啟用") return "is-active";
  if (statusText.includes("外部")) return "is-external";
  return "is-pending";
}

function accountMatchesQuery(account, query) {
  if (!query) return true;
  const haystack = [
    account.name,
    account.email,
    account.grade,
    account.title,
    account.department,
    account.company,
    account.region,
    account.className,
    account.dataScope,
    account.accountStatus
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function accountMatchesStatus(account, statusFilter) {
  if (statusFilter === "all") return true;
  if (statusFilter === "active") return account.accountStatus === "啟用";
  if (statusFilter === "pending") return account.accountStatus === "待補帳號";
  if (statusFilter === "external") return account.accountStatus.includes("外部");
  return true;
}

function getAffiliationRows() {
  const groups = new Map();

  employeeAccounts.forEach((account) => {
    const key = [account.company, account.region, account.department, account.className].join("||");
    const row = groups.get(key) || {
      company: account.company,
      region: account.region,
      department: account.department,
      className: account.className,
      total: 0,
      active: 0,
      pending: 0,
      external: 0
    };

    row.total += 1;
    if (account.accountStatus === "啟用") row.active += 1;
    if (account.accountStatus === "待補帳號") row.pending += 1;
    if (account.accountStatus.includes("外部")) row.external += 1;
    groups.set(key, row);
  });

  return [...groups.values()].sort((a, b) =>
    [a.company, a.region, a.department, a.className].join("").localeCompare(
      [b.company, b.region, b.department, b.className].join(""),
      "zh-Hant"
    )
  );
}

function countByField(fieldName) {
  const counts = new Map();
  employeeAccounts.forEach((account) => {
    const values = String(account[fieldName] || "未設定")
      .split(/[、,，]/)
      .map((value) => value.trim())
      .filter(Boolean);

    values.forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function affiliationMatchesQuery(row, query) {
  if (!query) return true;
  return [row.company, row.region, row.department, row.className]
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

function getOrgNodeAccountCount(node) {
  if (node.id === "group") return employeeAccounts.length;
  if (node.id === "external-audit-unit") {
    return employeeAccounts.filter((account) => account.accountStatus.includes("外部")).length;
  }
  if (node.type === "區域") {
    return employeeAccounts.filter((account) => account.region.includes(node.label.replace("台", "臺")) || account.region.includes(node.label)).length;
  }
  if (["部門", "業務線", "課別"].includes(node.type)) {
    return employeeAccounts.filter(
      (account) => account.department === node.label || account.className === node.label
    ).length;
  }
  return 0;
}

function normalizeGradeText(value) {
  return String(value || "").replaceAll(".", "").replaceAll("…", "").trim();
}

function getAccountsForGradeLevel(level) {
  return employeeAccounts.filter((account) => {
    const grade = normalizeGradeText(account.grade);
    const title = normalizeGradeText(account.title);
    if (level.id === "board") return grade.includes("董事會") || title.includes("董事長");
    if (level.id === "shareholder") return grade.includes("股東") || title.includes("股東");
    if (level.id === "ceo") return grade.includes("執行長") || title.includes("執行長");
    if (level.id === "region-manager") return grade.includes("區經理") || title.includes("區經理");
    if (level.id === "business-director") {
      return (grade.includes("部長") || title.includes("部長") || title.includes("負責人")) && account.department !== "行政部";
    }
    if (level.id === "admin-director") return title.includes("行政部長");
    if (level.id === "section-chief") return grade.includes("課長") || title.includes("課長") || title.includes("業務助理");
    if (level.id === "team-lead") return grade.includes("組長") || title.includes("組長") || title.includes("督導");
    if (level.id === "staff") return grade.includes("職員") || title.includes("職員") || title.includes("照顧服務員") || title.includes("個案管理師");
    if (level.id === "external-audit") return grade.includes("外部檢核") || title.includes("會計事務所");
    return false;
  });
}

function getGradeStats(level) {
  return getAccountsForGradeLevel(level).reduce(
    (stats, account) => {
      stats.total += 1;
      if (account.accountStatus === "啟用") stats.active += 1;
      if (account.accountStatus === "待補帳號") stats.pending += 1;
      if (account.accountStatus.includes("外部")) stats.external += 1;
      return stats;
    },
    { total: 0, active: 0, pending: 0, external: 0 }
  );
}

function gradeMatchesQuery(level, query) {
  if (!query) return true;
  return [
    level.name,
    level.category,
    scopeLabels[level.defaultScope] || level.defaultScope,
    level.actions.join(" "),
    level.limits,
    level.appliesTo
  ]
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

function getAccountsForRole(role) {
  return employeeAccounts.filter((account) => {
    const grade = normalizeGradeText(account.grade);
    const title = normalizeGradeText(account.title);
    const department = normalizeGradeText(account.department);
    const className = normalizeGradeText(account.className);
    if (role.id === "external-audit") return grade.includes("外部檢核") || title.includes("會計事務所");
    if (role.id === "board") return grade.includes("董事會") || title.includes("董事長");
    if (role.id === "shareholder") return grade.includes("股東") || title.includes("股東");
    if (role.id === "ceo") return grade.includes("執行長") || title.includes("執行長");
    if (role.id === "region-manager") return grade.includes("區經理") || title.includes("區經理");
    if (role.id === "admin-director") return title.includes("行政部長");
    if (role.id === "hr-chief") return title.includes("人資課長") || className.includes("人資課");
    if (role.id === "accounting-chief") return title.includes("會計課長") || className.includes("會計課");
    if (role.id === "cashier-chief") return title.includes("出納課長");
    if (role.id === "ga-chief") return title.includes("總務課長") || className.includes("總務課");
    if (role.id === "business-director") {
      return (title.includes("部長") || title.includes("負責人")) && department !== "行政部";
    }
    if (role.id === "section-chief") return grade.includes("課長") || title.includes("課長") || title.includes("業務助理");
    if (role.id === "team-lead") return grade.includes("組長") || title.includes("組長") || title.includes("督導");
    if (role.id === "staff") return grade.includes("職員") || title.includes("照顧服務員") || title.includes("個案管理師");
    return false;
  });
}

function getRoleStats(role) {
  return getAccountsForRole(role).reduce(
    (stats, account) => {
      stats.total += 1;
      if (account.accountStatus === "啟用") stats.active += 1;
      if (account.accountStatus === "待補帳號") stats.pending += 1;
      if (account.accountStatus.includes("外部")) stats.external += 1;
      return stats;
    },
    { total: 0, active: 0, pending: 0, external: 0 }
  );
}

function roleMatchesQuery(role, query) {
  if (!query) return true;
  return [
    role.name,
    role.grade,
    role.category,
    scopeLabels[role.defaultScope] || role.defaultScope,
    role.modules.join(" "),
    role.actions.join(" "),
    role.limits
  ]
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

function getFlatModules() {
  return modules.flatMap((module) => [module, ...(module.children || [])]);
}

function getModuleById(moduleId) {
  return getFlatModules().find((module) => module.id === moduleId) || null;
}

function getRoleName(roleId) {
  return roleDefinitions.find((role) => role.id === roleId)?.name || roleId;
}

function getModulePermissionRows() {
  return modulePermissionDefinitions.map((permission) => {
    const module = getModuleById(permission.moduleId);
    const rule = moduleOrgRules[permission.moduleId] || {};
    const owner = getOrgNode(rule.owner);
    return {
      ...permission,
      module,
      ownerLabel: getOwnerDisplayName(owner),
      scopeLabel: scopeLabels[rule.scope] || rule.scope || "指定範圍",
      policy: rule.policy || permission.limits
    };
  });
}

function modulePermissionMatchesQuery(row, query) {
  if (!query) return true;
  return [
    row.module?.name,
    getModuleDisplayName(row.module || {}),
    row.ownerLabel,
    row.scopeLabel,
    row.policy,
    row.sensitivity,
    row.limits,
    row.roles.map(getRoleName).join(" "),
    row.actions.join(" ")
  ]
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

function getButtonAction(action) {
  return buttonActionDefinitions.find((item) => item.action === action) || {
    action,
    label: action,
    button: action,
    risk: "中",
    audit: "需記錄操作人與時間"
  };
}

function getButtonPermissionRows() {
  return getModulePermissionRows().flatMap((permission) =>
    permission.actions.map((action) => {
      const actionDefinition = getButtonAction(action);
      return {
        ...actionDefinition,
        module: permission.module,
        moduleId: permission.moduleId,
        ownerLabel: permission.ownerLabel,
        scopeLabel: permission.scopeLabel,
        sensitivity: permission.sensitivity,
        roles: permission.roles,
        moduleLimit: permission.limits
      };
    })
  );
}

function buttonPermissionMatchesQuery(row, query) {
  if (!query) return true;
  return [
    row.module?.name,
    getModuleDisplayName(row.module || {}),
    row.label,
    row.button,
    row.action,
    row.risk,
    row.audit,
    row.scopeLabel,
    row.sensitivity,
    row.roles.map(getRoleName).join(" ")
  ]
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

function normalizeDataScopeId(value) {
  const text = normalizeGradeText(value);
  if (text.includes("全集團")) return "group";
  if (text.includes("指定") || text.includes("自訂")) return "custom";
  if (text.includes("公司")) return "company";
  if (text.includes("機構")) return "institution";
  if (text.includes("區域") || text.includes("本區")) return "region";
  if (text.includes("業務線") || text.includes("服務單位")) return "business_unit";
  if (text.includes("部門")) return "department";
  if (text.includes("課")) return "class";
  if (text.includes("負責") || text.includes("指派")) return "assigned";
  if (text.includes("自己") || text.includes("個人")) return "self";
  return "custom";
}

function getDataScopeRows() {
  const moduleRows = getModulePermissionRows();
  const buttonRows = getButtonPermissionRows();

  return dataScopeDefinitions.map((scope) => {
    const accounts = employeeAccounts.filter((account) => normalizeDataScopeId(account.dataScope) === scope.id);
    const roles = roleDefinitions.filter((role) => role.defaultScope === scope.id);
    const grades = gradeLevels.filter((level) => level.defaultScope === scope.id);
    const modulesInScope = moduleRows.filter((permission) => normalizeDataScopeId(permission.scopeLabel) === scope.id);
    const buttonsInScope = buttonRows.filter((row) => normalizeDataScopeId(row.scopeLabel) === scope.id);

    return {
      ...scope,
      accountCount: accounts.length,
      activeCount: accounts.filter((account) => account.accountStatus === "啟用").length,
      roleCount: roles.length,
      gradeCount: grades.length,
      moduleCount: modulesInScope.length,
      buttonCount: buttonsInScope.length,
      modules: modulesInScope.map((permission) => getModuleDisplayName(permission.module || {}))
    };
  });
}

function dataScopeMatchesQuery(row, query) {
  if (!query) return true;
  return [
    row.label,
    scopeLabels[row.id],
    row.boundary,
    row.examples,
    row.defaultRoles.join(" "),
    row.guardrail,
    row.modules.join(" ")
  ]
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

function getSensitivityRule(sensitivity) {
  return (
    sensitiveDataDefinitions.find((definition) =>
      definition.match.some((keyword) => String(sensitivity || "").includes(keyword))
    ) || sensitiveDataDefinitions[1]
  );
}

function getSensitiveDataRows() {
  const moduleRows = getModulePermissionRows();
  const buttonRows = getButtonPermissionRows();

  return sensitiveDataDefinitions.map((definition) => {
    const modulesInCategory = moduleRows.filter((row) => getSensitivityRule(row.sensitivity).id === definition.id);
    const moduleIds = new Set(modulesInCategory.map((row) => row.moduleId));
    const buttonsInCategory = buttonRows.filter((row) => moduleIds.has(row.moduleId));
    const highRiskButtons = buttonsInCategory.filter((row) => ["高", "最高"].includes(row.risk));
    const exportPrintButtons = buttonsInCategory.filter((row) => ["export", "print"].includes(row.action));
    const roles = [...new Set(modulesInCategory.flatMap((row) => row.roles))];
    const scopes = [...new Set(modulesInCategory.map((row) => normalizeDataScopeId(row.scopeLabel)))];

    return {
      ...definition,
      moduleCount: modulesInCategory.length,
      buttonCount: buttonsInCategory.length,
      highRiskButtonCount: highRiskButtons.length,
      exportPrintCount: exportPrintButtons.length,
      roles,
      scopes,
      modules: modulesInCategory.map((row) => getModuleDisplayName(row.module || {}))
    };
  });
}

function sensitiveDataMatchesQuery(row, query) {
  if (!query) return true;
  return [
    row.label,
    row.level,
    row.examples,
    row.restriction,
    row.modules.join(" "),
    row.roles.map(getRoleName).join(" "),
    row.scopes.map((scope) => scopeLabels[scope] || scope).join(" "),
    row.requiredControls.join(" ")
  ]
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

function getAuditLogRows() {
  const buttonRows = getButtonPermissionRows();

  return auditLogDefinitions.map((definition) => {
    const relatedButtons = buttonRows.filter((row) => definition.triggerActions.includes(row.action));
    const highRiskButtons = relatedButtons.filter((row) => ["高", "最高"].includes(row.risk));
    const modules = [...new Set(relatedButtons.map((row) => getModuleDisplayName(row.module || {})))];
    const roles = [...new Set(relatedButtons.flatMap((row) => row.roles))];

    return {
      ...definition,
      buttonCount: relatedButtons.length,
      highRiskButtonCount: highRiskButtons.length,
      modules,
      roles
    };
  });
}

function auditLogMatchesQuery(row, query) {
  if (!query) return true;
  return [
    row.event,
    row.risk,
    row.approval,
    row.retention,
    row.guardrail,
    row.triggerActions.join(" "),
    row.requiredFields.join(" "),
    row.modules.join(" "),
    row.roles.map(getRoleName).join(" ")
  ]
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

function getSecurityRestrictionRows() {
  return securityRestrictionDefinitions.map((restriction) => {
    const auditRows = auditLogDefinitions.filter(
      (audit) =>
        restriction.audit.includes(audit.event) ||
        audit.guardrail.includes(restriction.title) ||
        restriction.trigger.includes(audit.event)
    );
    const sensitiveRows = sensitiveDataDefinitions.filter(
      (definition) =>
        restriction.appliesTo.includes(definition.label) ||
        restriction.trigger.includes(definition.label) ||
        restriction.enforcement.includes(definition.label)
    );

    return {
      ...restriction,
      auditCoverage: auditRows.length || (restriction.audit.includes("記錄") ? 1 : 0),
      sensitiveCoverage: sensitiveRows.length,
      needsBlock: ["最高", "高"].includes(restriction.severity)
    };
  });
}

function securityRestrictionMatchesQuery(row, query) {
  if (!query) return true;
  return [
    row.title,
    row.appliesTo,
    row.trigger,
    row.enforcement,
    row.audit,
    row.severity
  ]
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

function getStoredProfile() {
  const profileId = window.localStorage.getItem(storageKey);
  const storedEmail = window.localStorage.getItem(storageEmailKey);
  const profile = getQuickLoginProfile(profileId) || getEmployeeProfileById(profileId);
  if (!profile || !storedEmail) return profile;
  return { ...profile, email: storedEmail };
}

function findProfileByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const aliasProfileId = accountAliases[normalizedEmail];
  if (aliasProfileId) {
    const aliasProfile = getQuickLoginProfile(aliasProfileId);
    return aliasProfile ? { ...aliasProfile, email: normalizedEmail } : null;
  }
  return quickLoginProfiles.find((profile) => profile.email.toLowerCase() === normalizedEmail) || findEmployeeProfileByEmail(normalizedEmail);
}

function setStoredProfile(profile) {
  window.localStorage.setItem(storageKey, profile.id);
  window.localStorage.setItem(storageEmailKey, profile.email);
}

function clearStoredProfile() {
  window.localStorage.removeItem(storageKey);
  window.localStorage.removeItem(storageEmailKey);
}

function getPortalRedirectUrl() {
  if (window.location.protocol === "file:") return null;
  if (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)) {
    return `${portalProductionOrigin}${portalHomePath}`;
  }
  if (window.location.hostname === "login.suiyuecare.com") {
    return `${portalOAuthBridgeOrigin}${portalHomePath}`;
  }
  return `${window.location.origin}${portalHomePath}`;
}

async function applyGoogleSession() {
  if (!supabase) return false;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    setStatus(`Google 登入狀態檢查失敗：${error.message}`, "error");
    return false;
  }

  const email = data.session?.user?.email || "";
  if (!email) return false;

  const profile = findProfileByEmail(email);
  if (!profile) {
    clearStoredProfile();
    await supabase.auth.signOut();
    renderSession(null);
    setStatus(`Google 帳號 ${email} 尚未建立 Portal 權限，請由系統權限中心開通。`, "error");
    return true;
  }

  setStoredProfile(profile);
  renderSession(profile);
  setStatus(`已使用 Google 登入：${profile.label}。`, "success");
  return true;
}

function moduleIsAllowed(module, profile) {
  const profileRoleId = profile.sourceProfileId || profile.id;
  if (module.id === "general-affairs") return true;
  if (sharedGeneralAffairsModules.has(module.id)) return true;
  if (restrictedGeneralAffairsModules.has(module.id)) return generalAffairsManagers.has(profileRoleId);
  return profile.modules.includes(module.id);
}

function getModuleAccessState(module, profile) {
  const hasChildren = Array.isArray(module.children) && module.children.length > 0;
  const allowed = moduleIsAllowed(module, profile);
  const hasAllowedChild = hasChildren && module.children.some((child) => moduleIsAllowed(child, profile));

  if (!allowed && !hasAllowedChild) {
    return {
      allowed: false,
      actionText: "此帳號無權限",
      status: "denied"
    };
  }

  if (hasChildren) {
    return {
      allowed: true,
      actionText: "查看",
      status: "folder"
    };
  }

  if (connectedModuleIds.has(module.id)) {
    return {
      allowed: true,
      actionText: "開啟",
      status: "ready"
    };
  }

  return {
    allowed: true,
    actionText: "努力製作中",
    status: "building"
  };
}

function renderSession(profile) {
  const isSignedIn = Boolean(profile);
  document.body.classList.toggle("is-signed-in", isSignedIn);
  document.body.classList.toggle("is-signed-out", !isSignedIn);
  signedOutViews.forEach((view) => {
    view.hidden = isSignedIn;
  });
  signedInViews.forEach((view) => {
    view.hidden = !isSignedIn;
  });

  if (!profile) return;

  if (userSummary) {
    userSummary.textContent = `${profile.label}｜${profile.title}｜${profile.email}`;
  }
  renderLevelOne(profile);
  renderOrganizationChart(signedInOrganizationChart, profile);
}

function createQuickLoginButton(profile) {
  const button = document.createElement("button");
  button.className = "quick-login-card";
  button.type = "button";
  button.innerHTML = `
    <span class="quick-login-main">
      <strong>${profile.label}</strong>
      <small>${profile.title}</small>
    </span>
    <span class="quick-login-meta">
      <b>${profile.scope}</b>
      <small>${profile.note}</small>
    </span>
  `;

  button.addEventListener("click", () => {
    if (loginEmail) loginEmail.value = profile.email;
    if (loginPassword) loginPassword.value = demoPassword;
    setStatus(`已帶入 ${profile.label} 測試帳號，請按登入進入工作台。`, "info");
  });

  return button;
}

function createQuickLoginTab(group) {
  const button = document.createElement("button");
  button.className = "quick-login-tab";
  button.type = "button";
  button.role = "tab";
  button.setAttribute("aria-selected", String(group.id === activeQuickLoginGroup));
  button.textContent = group.title;

  button.addEventListener("click", () => {
    activeQuickLoginGroup = group.id;
    renderQuickLoginPicker();
  });

  return button;
}

function createQuickLoginSection(group) {
  const section = document.createElement("section");
  section.className = "quick-login-section";
  const profiles = group.profiles
    .map((profileId) => quickLoginProfiles.find((profile) => profile.id === profileId))
    .filter(Boolean);

  section.innerHTML = `
    <div class="quick-login-section-head">
      <strong>${group.title}</strong>
      <span>${group.caption}</span>
    </div>
  `;

  const list = document.createElement("div");
  list.className = "quick-login-list";
  list.replaceChildren(...profiles.map(createQuickLoginButton));
  section.append(list);
  return section;
}

function renderQuickLoginPicker() {
  const activeGroup = quickLoginGroups.find((group) => group.id === activeQuickLoginGroup) || quickLoginGroups[0];
  quickLoginTabs?.replaceChildren(...quickLoginGroups.map(createQuickLoginTab));
  quickLoginGrid?.replaceChildren(createQuickLoginSection(activeGroup));
}

function getOrgNode(nodeId) {
  return organizationNodes.find((node) => node.id === nodeId);
}

function getOrgChildren(parentId) {
  return organizationNodes.filter((node) => node.parentId === parentId);
}

function profileCanSeeOrgNode(node, profile) {
  if (!profile) return true;
  if (profile.scope === "group") return true;
  if (profile.scope === "custom") return ["group", "external-audit-unit", "finance-class", "ir-class"].includes(node.id);
  if (profile.scope === "region") return node.type === "區域" || node.parentId === "group" || node.id === "group";
  if (profile.scope === "business_unit") return ["group", "business-dept"].includes(node.id) || node.parentId === "business-dept";
  if (profile.scope === "department") return ["group", "admin-dept"].includes(node.id) || node.parentId === "admin-dept";
  if (profile.scope === "class") return ["group", "admin-dept", "business-dept"].includes(node.id) || ["課別", "業務線"].includes(node.type);
  return ["group", "business-dept", "home-care-bu", "day-care-bu"].includes(node.id);
}

function createOrgNode(node, profile) {
  const children = getOrgChildren(node.id).filter((child) => profileCanSeeOrgNode(child, profile));
  const item = document.createElement("article");
  item.className = "org-node";
  item.dataset.scope = node.scope;
  item.innerHTML = `
    <div class="org-node-card">
      <span>${node.type}</span>
      <strong>${node.label}</strong>
      <small>Scope: ${node.scope}</small>
      <p>${node.roles.join("、")}</p>
    </div>
  `;

  if (children.length > 0) {
    const list = document.createElement("div");
    list.className = "org-children";
    list.replaceChildren(...children.map((child) => createOrgNode(child, profile)));
    item.append(list);
  }

  return item;
}

function renderOrganizationChart(target, profile = null) {
  const root = getOrgNode("group");
  if (!target || !root) return;
  target.replaceChildren(createOrgNode(root, profile));
}

function createModuleButton(module, profile) {
  const button = document.createElement("button");
  button.className = "module-card";
  button.type = "button";
  button.dataset.moduleId = module.id;

  const hasChildren = Array.isArray(module.children) && module.children.length > 0;
  const rule = moduleOrgRules[module.id];
  const owner = rule ? getOrgNode(rule.owner) : null;
  const scopeText = scopeLabels[rule?.scope || profile.scope] || rule?.scope || profile.scope;
  const accessState = getModuleAccessState(module, profile);
  button.dataset.accessStatus = accessState.status;
  if (!accessState.allowed) {
    button.setAttribute("aria-disabled", "true");
  }
  button.innerHTML = `
    <span class="module-number">${moduleIcons[module.id] || module.number}</span>
    <span class="module-card-main">
      <strong>${getModuleDisplayName(module)}</strong>
      <small>${moduleDescriptions[module.id] || "依角色權限開放"}</small>
    </span>
    <span class="module-card-footer">
      <span>${getOwnerDisplayName(owner)}｜${scopeText}</span>
      <b>${accessState.actionText}</b>
    </span>
  `;

  button.addEventListener("click", () => {
    if (!accessState.allowed) {
      setStatus(`${getModuleDisplayName(module)}：此帳號無權限。`, "error");
      return;
    }

    const launchUrl = buildModuleLaunchUrl(module.id, profile);
    if (launchUrl) {
      window.location.href = launchUrl;
      return;
    }

    if (hasChildren) {
      renderLevelTwo(module, profile);
      return;
    }

    if (accessState.status === "building") {
      setStatus(`${getModuleDisplayName(module)} 正在努力製作中。`, "info");
      return;
    }

    if (module.id === "organization-chart") {
      renderOrganizationTool(profile);
      return;
    }
    if (module.id === "system-permissions") {
      renderAccountManagementTool(profile, "系統權限｜使用者帳號管理", true);
      return;
    }
    if (module.id === "employee-accounts") {
      renderAccountManagementTool(profile, "員工帳號");
      return;
    }
    if (module.id === "agile-projects") {
      renderAgileProjectTool(profile);
      return;
    }
    setStatus(`${module.name} 尚未設定正式連結。`, "info");
  });

  return button;
}

function renderLevelOne(profile = getStoredProfile()) {
  if (!profile || !moduleLevelOneGrid || !moduleLevelOne || !moduleLevelTwo || !moduleTitle) return;
  moduleTitle.textContent = "選擇工作區";
  moduleLevelOneGrid.replaceChildren(...modules.map((module) => createModuleButton(module, profile)));
  moduleLevelTwoGrid?.classList.remove("detail-grid");
  moduleLevelOne.hidden = false;
  moduleLevelOne.classList.add("active");
  moduleLevelTwo.hidden = true;
  moduleLevelTwo.classList.remove("active");
  setStatus(`${profile.label} 可使用的工作區已載入。`, "info");
}

function renderLevelTwo(parentModule, profile) {
  if (!moduleLevelTwoGrid || !moduleLevelOne || !moduleLevelTwo || !moduleTitle) return;
  moduleTitle.textContent = getModuleDisplayName(parentModule);
  moduleLevelTwoGrid.classList.remove("detail-grid");
  moduleLevelTwoGrid.replaceChildren(...parentModule.children.map((module) => createModuleButton(module, profile)));
  moduleLevelOne.hidden = true;
  moduleLevelOne.classList.remove("active");
  moduleLevelTwo.hidden = false;
  moduleLevelTwo.classList.add("active");
  setStatus(`已開啟 ${getModuleDisplayName(parentModule)}。`, "info");
}

function renderOrganizationTool(profile) {
  if (!moduleLevelTwoGrid || !moduleTitle) return;
  moduleTitle.textContent = "總務系統｜組織圖";

  const panel = document.createElement("section");
  panel.className = "tool-detail";
  panel.innerHTML = `
    <div class="section-head">
      <div>
        <p class="portal-kicker">Organization Chart</p>
        <h3>歲悅組織圖</h3>
      </div>
      <span>RBAC + Data Scope</span>
    </div>
    <div class="org-chart compact" aria-label="歲悅組織圖"></div>
  `;

  moduleLevelTwoGrid.classList.add("detail-grid");
  moduleLevelTwoGrid.replaceChildren(panel);
  renderOrganizationChart(panel.querySelector(".org-chart"), profile);
  setStatus("已開啟總務系統中的組織圖。", "info");
}

function renderAgileProjectTool(profile) {
  if (!moduleLevelTwoGrid || !moduleTitle) return;
  moduleTitle.textContent = "總務系統｜敏捷專案管理";

  const panel = document.createElement("section");
  panel.className = "tool-detail account-management";
  panel.innerHTML = `
    <div class="account-head">
      <strong>敏捷專案管理</strong>
      <small>依專案、衝刺、負責人與跨部門協作範圍控管；正式串接前先建立入口欄位與權限位置。</small>
    </div>
    <div class="account-stats">
      <article>
        <span>專案</span>
        <strong>0</strong>
        <small>待串接資料表</small>
      </article>
      <article>
        <span>衝刺</span>
        <strong>0</strong>
        <small>待建立 Sprint</small>
      </article>
      <article>
        <span>任務</span>
        <strong>0</strong>
        <small>待建立看板</small>
      </article>
      <article>
        <span>目前權限</span>
        <strong>${escapeHtml(scopeLabels[profile.scope] || profile.scope)}</strong>
        <small>${escapeHtml(profile.email)}</small>
      </article>
    </div>
    <div class="empty-account-state">敏捷專案管理入口已建立；下一步可接專案、看板、Sprint、任務指派與操作紀錄資料表。</div>
  `;

  moduleLevelTwoGrid.classList.add("detail-grid");
  moduleLevelTwoGrid.replaceChildren(panel);
  setStatus("已開啟敏捷專案管理。", "info");
}

function createPermissionTabs(activeTab) {
  return `
    <div class="permission-tabs" role="tablist" aria-label="系統權限功能">
      <button type="button" role="tab" aria-selected="${activeTab === "accounts"}" data-permission-tab="accounts">
        <span>1</span>使用者帳號管理
      </button>
      <button type="button" role="tab" aria-selected="${activeTab === "affiliations"}" data-permission-tab="affiliations">
        <span>2</span>組織歸屬
      </button>
      <button type="button" role="tab" aria-selected="${activeTab === "grades"}" data-permission-tab="grades">
        <span>3</span>職等管理
      </button>
      <button type="button" role="tab" aria-selected="${activeTab === "roles"}" data-permission-tab="roles">
        <span>4</span>角色管理
      </button>
      <button type="button" role="tab" aria-selected="${activeTab === "modules"}" data-permission-tab="modules">
        <span>5</span>模組權限
      </button>
      <button type="button" role="tab" aria-selected="${activeTab === "buttons"}" data-permission-tab="buttons">
        <span>6</span>功能按鈕權限
      </button>
      <button type="button" role="tab" aria-selected="${activeTab === "data-scopes"}" data-permission-tab="data-scopes">
        <span>7</span>Data Scope 資料範圍
      </button>
      <button type="button" role="tab" aria-selected="${activeTab === "sensitive-data"}" data-permission-tab="sensitive-data">
        <span>8</span>敏感資料控管
      </button>
      <button type="button" role="tab" aria-selected="${activeTab === "audit-logs"}" data-permission-tab="audit-logs">
        <span>9</span>權限異動與操作紀錄
      </button>
      <button type="button" role="tab" aria-selected="${activeTab === "security"}" data-permission-tab="security">
        <span>10</span>安全限制
      </button>
    </div>
  `;
}

function bindPermissionTabs(panel, profile, activeTab) {
  panel.querySelectorAll("[data-permission-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTab = button.dataset.permissionTab;
      if (nextTab === activeTab) return;
      if (nextTab === "accounts") {
        renderAccountManagementTool(profile, "系統權限｜使用者帳號管理", true);
        return;
      }
      if (nextTab === "affiliations") {
        renderAffiliationTool(profile);
        return;
      }
      if (nextTab === "grades") {
        renderGradeManagementTool(profile);
        return;
      }
      if (nextTab === "roles") {
        renderRoleManagementTool(profile);
        return;
      }
      if (nextTab === "modules") {
        renderModulePermissionTool(profile);
        return;
      }
      if (nextTab === "buttons") {
        renderButtonPermissionTool(profile);
        return;
      }
      if (nextTab === "data-scopes") {
        renderDataScopeTool(profile);
        return;
      }
      if (nextTab === "sensitive-data") {
        renderSensitiveDataTool(profile);
        return;
      }
      if (nextTab === "audit-logs") {
        renderAuditLogTool(profile);
        return;
      }
      if (nextTab === "security") {
        renderSecurityRestrictionTool(profile);
      }
    });
  });
}

function renderAccountManagementTool(profile, title = "使用者帳號管理", showPermissionTabs = false) {
  if (!moduleLevelTwoGrid || !moduleTitle) return;
  moduleTitle.textContent = title;

  const stats = getAccountStats();
  const panel = document.createElement("section");
  panel.className = "tool-detail account-management";
  panel.innerHTML = `
    <div class="section-head account-head">
      <div>
        <p class="portal-kicker">Account Center</p>
        <h3>使用者帳號管理</h3>
        <small>依員工清冊建立帳號、職等、部門、課別與資料範圍。</small>
      </div>
      <span>${escapeHtml(profile.label)}｜${escapeHtml(scopeLabels[profile.scope] || profile.scope)}</span>
    </div>
    ${showPermissionTabs ? createPermissionTabs("accounts") : ""}
    <div class="account-stats" aria-label="帳號統計">
      <article>
        <span>全部帳號</span>
        <strong>${stats.total}</strong>
      </article>
      <article>
        <span>已啟用</span>
        <strong>${stats.active}</strong>
      </article>
      <article>
        <span>待補帳號</span>
        <strong>${stats.pending}</strong>
      </article>
      <article>
        <span>外部檢核</span>
        <strong>${stats.external}</strong>
      </article>
    </div>
    <div class="account-toolbar">
      <label class="account-search">
        <span>搜尋帳號</span>
        <input id="accountSearchInput" type="search" placeholder="姓名、Email、部門、課別、區域" autocomplete="off">
      </label>
      <div class="account-filters" aria-label="帳號狀態篩選">
        <button type="button" class="is-selected" data-account-filter="all">全部</button>
        <button type="button" data-account-filter="active">啟用</button>
        <button type="button" data-account-filter="pending">待補</button>
        <button type="button" data-account-filter="external">外部</button>
      </div>
    </div>
    <div class="account-table-wrap">
      <table class="account-table">
        <thead>
          <tr>
            <th>使用者</th>
            <th>職等 / 職稱</th>
            <th>組織歸屬</th>
            <th>資料範圍</th>
            <th>狀態</th>
          </tr>
        </thead>
        <tbody data-account-table-body></tbody>
      </table>
    </div>
    <p class="account-note">下一階段會接上新增帳號、停用帳號、角色異動與操作紀錄；目前先把清冊資料整理成權限中心可檢視的帳號底稿。</p>
  `;

  const searchInput = panel.querySelector("#accountSearchInput");
  const filterButtons = [...panel.querySelectorAll("[data-account-filter]")];
  const tableBody = panel.querySelector("[data-account-table-body]");
  let activeStatus = "all";

  const renderRows = () => {
    const query = searchInput?.value.trim() || "";
    const accounts = employeeAccounts.filter(
      (account) => accountMatchesQuery(account, query) && accountMatchesStatus(account, activeStatus)
    );

    if (accounts.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-account-state">找不到符合條件的帳號。</div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = accounts
      .map(
        (account) => `
          <tr>
            <td>
              <div class="account-person">
                <strong>${escapeHtml(account.name)}</strong>
                <small>${escapeHtml(account.email)}</small>
              </div>
            </td>
            <td>
              <strong>${escapeHtml(account.grade)}</strong>
              <small>${escapeHtml(account.title)}</small>
            </td>
            <td>
              <strong>${escapeHtml(account.department)}</strong>
              <small>${escapeHtml(account.company)}｜${escapeHtml(account.region)}｜${escapeHtml(account.className)}</small>
            </td>
            <td>${escapeHtml(account.dataScope)}</td>
            <td><span class="status-pill ${getStatusClass(account.accountStatus)}">${escapeHtml(account.accountStatus)}</span></td>
          </tr>
        `
      )
      .join("");
  };

  if (showPermissionTabs) bindPermissionTabs(panel, profile, "accounts");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeStatus = button.dataset.accountFilter || "all";
      filterButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
      renderRows();
    });
  });
  searchInput?.addEventListener("input", renderRows);

  moduleLevelTwoGrid.classList.add("detail-grid");
  moduleLevelTwoGrid.replaceChildren(panel);
  renderRows();
  setStatus("已開啟使用者帳號管理。", "info");
}

function renderAffiliationTool(profile) {
  if (!moduleLevelTwoGrid || !moduleTitle) return;
  moduleTitle.textContent = "系統權限｜組織歸屬";

  const companyCounts = countByField("company");
  const regionCounts = countByField("region");
  const departmentCounts = countByField("department");
  const classCounts = countByField("className");
  const affiliationRows = getAffiliationRows();
  const panel = document.createElement("section");
  panel.className = "tool-detail account-management affiliation-management";
  panel.innerHTML = `
    <div class="section-head account-head">
      <div>
        <p class="portal-kicker">Organization Scope</p>
        <h3>組織歸屬</h3>
        <small>定義帳號所屬公司、機構、區域、部門、業務線與課別，作為 Data Scope 的判斷基礎。</small>
      </div>
      <span>${escapeHtml(profile.label)}｜${escapeHtml(scopeLabels[profile.scope] || profile.scope)}</span>
    </div>
    ${createPermissionTabs("affiliations")}
    <div class="affiliation-summary" aria-label="組織歸屬摘要">
      <article>
        <span>公司 / 機構</span>
        <strong>${companyCounts.length}</strong>
        <small>${escapeHtml(companyCounts.slice(0, 2).map(([name]) => name).join("、"))}</small>
      </article>
      <article>
        <span>區域</span>
        <strong>${regionCounts.length}</strong>
        <small>${escapeHtml(regionCounts.map(([name]) => name).join("、"))}</small>
      </article>
      <article>
        <span>部門 / 業務線</span>
        <strong>${departmentCounts.length}</strong>
        <small>${escapeHtml(departmentCounts.slice(0, 3).map(([name]) => name).join("、"))}</small>
      </article>
      <article>
        <span>課別</span>
        <strong>${classCounts.length}</strong>
        <small>${escapeHtml(classCounts.slice(0, 3).map(([name]) => name).join("、"))}</small>
      </article>
    </div>
    <div class="affiliation-layout">
      <div class="affiliation-panel">
        <div class="affiliation-panel-head">
          <strong>組織節點</strong>
          <span>依組織圖對應人數</span>
        </div>
        <div class="affiliation-node-list">
          ${organizationNodes
            .map(
              (node) => `
                <article>
                  <span>${escapeHtml(node.type)}</span>
                  <strong>${escapeHtml(node.label)}</strong>
                  <small>${escapeHtml(scopeLabels[node.scope] || node.scope)}｜${getOrgNodeAccountCount(node)} 人</small>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
      <div class="affiliation-panel">
        <div class="affiliation-panel-head">
          <strong>歸屬矩陣</strong>
          <span>公司 / 區域 / 部門 / 課別</span>
        </div>
        <label class="account-search">
          <span>搜尋歸屬</span>
          <input id="affiliationSearchInput" type="search" placeholder="公司、機構、區域、部門、課別" autocomplete="off">
        </label>
        <div class="account-table-wrap affiliation-table-wrap">
          <table class="account-table affiliation-table">
            <thead>
              <tr>
                <th>公司 / 機構</th>
                <th>區域</th>
                <th>部門 / 業務線</th>
                <th>課別</th>
                <th>人數</th>
                <th>帳號狀態</th>
              </tr>
            </thead>
            <tbody data-affiliation-table-body></tbody>
          </table>
        </div>
      </div>
    </div>
    <p class="account-note">組織歸屬會影響模組可見範圍、資料查詢範圍與審核流程。後續接資料庫後，異動歸屬也會寫入操作紀錄。</p>
  `;

  const searchInput = panel.querySelector("#affiliationSearchInput");
  const tableBody = panel.querySelector("[data-affiliation-table-body]");

  const renderRows = () => {
    const query = searchInput?.value.trim() || "";
    const rows = affiliationRows.filter((row) => affiliationMatchesQuery(row, query));

    if (rows.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-account-state">找不到符合條件的組織歸屬。</div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = rows
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.company)}</td>
            <td>${escapeHtml(row.region)}</td>
            <td>${escapeHtml(row.department)}</td>
            <td>${escapeHtml(row.className)}</td>
            <td><strong>${row.total}</strong></td>
            <td>
              <span class="status-pill is-active">啟用 ${row.active}</span>
              <span class="status-pill is-pending">待補 ${row.pending}</span>
              ${row.external ? `<span class="status-pill is-external">外部 ${row.external}</span>` : ""}
            </td>
          </tr>
        `
      )
      .join("");
  };

  bindPermissionTabs(panel, profile, "affiliations");
  searchInput?.addEventListener("input", renderRows);

  moduleLevelTwoGrid.classList.add("detail-grid");
  moduleLevelTwoGrid.replaceChildren(panel);
  renderRows();
  setStatus("已開啟組織歸屬。", "info");
}

function renderGradeManagementTool(profile) {
  if (!moduleLevelTwoGrid || !moduleTitle) return;
  moduleTitle.textContent = "系統權限｜職等管理";

  const managementCount = gradeLevels.filter((level) => ["治理職等", "經營管理", "業務部門", "行政部門", "課級主管"].includes(level.category)).length;
  const gradeRows = gradeLevels.map((level) => ({ ...level, stats: getGradeStats(level) }));
  const panel = document.createElement("section");
  panel.className = "tool-detail account-management grade-management";
  panel.innerHTML = `
    <div class="section-head account-head">
      <div>
        <p class="portal-kicker">Rank Center</p>
        <h3>職等管理</h3>
        <small>設定平台職等主檔，並連動預設資料範圍、可用操作與敏感資料限制。</small>
      </div>
      <span>${escapeHtml(profile.label)}｜${escapeHtml(scopeLabels[profile.scope] || profile.scope)}</span>
    </div>
    ${createPermissionTabs("grades")}
    <div class="affiliation-summary grade-summary" aria-label="職等摘要">
      <article>
        <span>職等主檔</span>
        <strong>${gradeLevels.length}</strong>
        <small>治理、經營、行政、業務、外部帳號</small>
      </article>
      <article>
        <span>管理職等</span>
        <strong>${managementCount}</strong>
        <small>具審核、指派或匯出能力</small>
      </article>
      <article>
        <span>一般 / 現場職等</span>
        <strong>${gradeLevels.filter((level) => ["現場管理", "一般同仁"].includes(level.category)).length}</strong>
        <small>依自己或指派資料工作</small>
      </article>
      <article>
        <span>外部職等</span>
        <strong>${gradeLevels.filter((level) => level.category === "外部帳號").length}</strong>
        <small>到期停用、全操作留紀錄</small>
      </article>
    </div>
    <div class="grade-layout">
      <div class="grade-card-list" aria-label="職等層級">
        ${gradeRows
          .map(
            (level) => `
              <article>
                <span>${escapeHtml(level.order)}</span>
                <div>
                  <strong>${escapeHtml(level.name)}</strong>
                  <small>${escapeHtml(level.category)}｜${escapeHtml(scopeLabels[level.defaultScope] || level.defaultScope)}｜${level.stats.total} 人</small>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
      <div class="affiliation-panel">
        <div class="affiliation-panel-head">
          <strong>職等矩陣</strong>
          <span>職等 / 資料範圍 / 預設權限</span>
        </div>
        <label class="account-search">
          <span>搜尋職等</span>
          <input id="gradeSearchInput" type="search" placeholder="職等、分類、資料範圍、權限、限制" autocomplete="off">
        </label>
        <div class="account-table-wrap">
          <table class="account-table grade-table">
            <thead>
              <tr>
                <th>職等</th>
                <th>預設資料範圍</th>
                <th>預設操作</th>
                <th>重要限制</th>
                <th>清冊對應</th>
              </tr>
            </thead>
            <tbody data-grade-table-body></tbody>
          </table>
        </div>
      </div>
    </div>
    <p class="account-note">職等是平台權限的第一層；實際可用功能還會再疊加角色、模組權限與 Data Scope。權限提升、刪除、匯出、列印都要留下操作紀錄。</p>
  `;

  const searchInput = panel.querySelector("#gradeSearchInput");
  const tableBody = panel.querySelector("[data-grade-table-body]");

  const renderRows = () => {
    const query = searchInput?.value.trim() || "";
    const rows = gradeRows.filter((level) => gradeMatchesQuery(level, query));

    if (rows.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-account-state">找不到符合條件的職等。</div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = rows
      .map(
        (level) => `
          <tr>
            <td>
              <div class="account-person">
                <strong>${escapeHtml(level.order)} ${escapeHtml(level.name)}</strong>
                <small>${escapeHtml(level.category)}｜${escapeHtml(level.appliesTo)}</small>
              </div>
            </td>
            <td>${escapeHtml(scopeLabels[level.defaultScope] || level.defaultScope)}</td>
            <td>
              <div class="action-chip-list">
                ${level.actions.map((action) => `<span>${escapeHtml(action)}</span>`).join("")}
              </div>
            </td>
            <td>${escapeHtml(level.limits)}</td>
            <td>
              <span class="status-pill is-active">啟用 ${level.stats.active}</span>
              <span class="status-pill is-pending">待補 ${level.stats.pending}</span>
              ${level.stats.external ? `<span class="status-pill is-external">外部 ${level.stats.external}</span>` : ""}
            </td>
          </tr>
        `
      )
      .join("");
  };

  bindPermissionTabs(panel, profile, "grades");
  searchInput?.addEventListener("input", renderRows);

  moduleLevelTwoGrid.classList.add("detail-grid");
  moduleLevelTwoGrid.replaceChildren(panel);
  renderRows();
  setStatus("已開啟職等管理。", "info");
}

function renderRoleManagementTool(profile) {
  if (!moduleLevelTwoGrid || !moduleTitle) return;
  moduleTitle.textContent = "系統權限｜角色管理";

  const roleRows = roleDefinitions.map((role) => ({ ...role, stats: getRoleStats(role) }));
  const roleCategories = [...new Set(roleDefinitions.map((role) => role.category))];
  const panel = document.createElement("section");
  panel.className = "tool-detail account-management role-management";
  panel.innerHTML = `
    <div class="section-head account-head">
      <div>
        <p class="portal-kicker">Role Center</p>
        <h3>角色管理</h3>
        <small>角色決定使用者在平台中的工作身份、可見模組、可用操作與資料範圍。</small>
      </div>
      <span>${escapeHtml(profile.label)}｜${escapeHtml(scopeLabels[profile.scope] || profile.scope)}</span>
    </div>
    ${createPermissionTabs("roles")}
    <div class="affiliation-summary role-summary" aria-label="角色摘要">
      <article>
        <span>角色主檔</span>
        <strong>${roleDefinitions.length}</strong>
        <small>治理、行政、業務、現場、外部角色</small>
      </article>
      <article>
        <span>角色分類</span>
        <strong>${roleCategories.length}</strong>
        <small>${escapeHtml(roleCategories.slice(0, 3).join("、"))}</small>
      </article>
      <article>
        <span>可管理角色</span>
        <strong>${roleDefinitions.filter((role) => role.actions.includes("approve") || role.actions.includes("manage")).length}</strong>
        <small>具審核、退回或管理能力</small>
      </article>
      <article>
        <span>外部 / 受限</span>
        <strong>${roleDefinitions.filter((role) => role.category.includes("外部") || role.defaultScope === "custom").length}</strong>
        <small>指定範圍、只讀或需另行授權</small>
      </article>
    </div>
    <div class="grade-layout">
      <div class="grade-card-list role-card-list" aria-label="角色分類">
        ${roleCategories
          .map((category, index) => {
            const count = roleDefinitions.filter((role) => role.category === category).length;
            return `
              <article>
                <span>${String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>${escapeHtml(category)}</strong>
                  <small>${count} 個角色</small>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
      <div class="affiliation-panel">
        <div class="affiliation-panel-head">
          <strong>角色矩陣</strong>
          <span>角色 / 職等 / 模組 / 操作權限</span>
        </div>
        <label class="account-search">
          <span>搜尋角色</span>
          <input id="roleSearchInput" type="search" placeholder="角色、職等、模組、權限、限制" autocomplete="off">
        </label>
        <div class="account-table-wrap">
          <table class="account-table role-table">
            <thead>
              <tr>
                <th>角色</th>
                <th>對應職等</th>
                <th>資料範圍</th>
                <th>可見模組</th>
                <th>操作權限</th>
                <th>清冊對應</th>
              </tr>
            </thead>
            <tbody data-role-table-body></tbody>
          </table>
        </div>
      </div>
    </div>
    <p class="account-note">角色會疊加在職等之上，並再與模組權限、Data Scope 一起判斷。一般使用者不得自行提升角色；角色異動需留下操作紀錄。</p>
  `;

  const searchInput = panel.querySelector("#roleSearchInput");
  const tableBody = panel.querySelector("[data-role-table-body]");

  const renderRows = () => {
    const query = searchInput?.value.trim() || "";
    const rows = roleRows.filter((role) => roleMatchesQuery(role, query));

    if (rows.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-account-state">找不到符合條件的角色。</div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = rows
      .map(
        (role) => `
          <tr>
            <td>
              <div class="account-person">
                <strong>${escapeHtml(role.order)} ${escapeHtml(role.name)}</strong>
                <small>${escapeHtml(role.category)}｜${escapeHtml(role.limits)}</small>
              </div>
            </td>
            <td>${escapeHtml(role.grade)}</td>
            <td>${escapeHtml(scopeLabels[role.defaultScope] || role.defaultScope)}</td>
            <td>
              <div class="action-chip-list module-chip-list">
                ${role.modules.map((moduleName) => `<span>${escapeHtml(moduleName)}</span>`).join("")}
              </div>
            </td>
            <td>
              <div class="action-chip-list">
                ${role.actions.map((action) => `<span>${escapeHtml(action)}</span>`).join("")}
              </div>
            </td>
            <td>
              <span class="status-pill is-active">啟用 ${role.stats.active}</span>
              <span class="status-pill is-pending">待補 ${role.stats.pending}</span>
              ${role.stats.external ? `<span class="status-pill is-external">外部 ${role.stats.external}</span>` : ""}
            </td>
          </tr>
        `
      )
      .join("");
  };

  bindPermissionTabs(panel, profile, "roles");
  searchInput?.addEventListener("input", renderRows);

  moduleLevelTwoGrid.classList.add("detail-grid");
  moduleLevelTwoGrid.replaceChildren(panel);
  renderRows();
  setStatus("已開啟角色管理。", "info");
}

function renderModulePermissionTool(profile) {
  if (!moduleLevelTwoGrid || !moduleTitle) return;
  moduleTitle.textContent = "系統權限｜模組權限";

  const permissionRows = getModulePermissionRows();
  const highSensitivityCount = permissionRows.filter((row) => ["高度個資", "薪資 / 個資", "最高權限"].includes(row.sensitivity)).length;
  const managedRows = permissionRows.filter((row) => row.actions.includes("manage") || row.actions.includes("approve"));
  const panel = document.createElement("section");
  panel.className = "tool-detail account-management module-permission-management";
  panel.innerHTML = `
    <div class="section-head account-head">
      <div>
        <p class="portal-kicker">Module Access</p>
        <h3>模組權限</h3>
        <small>依角色、職等與 Data Scope 控管模組入口、選單、按鈕與資料可見範圍。</small>
      </div>
      <span>${escapeHtml(profile.label)}｜${escapeHtml(scopeLabels[profile.scope] || profile.scope)}</span>
    </div>
    ${createPermissionTabs("modules")}
    <div class="affiliation-summary module-permission-summary" aria-label="模組權限摘要">
      <article>
        <span>模組總數</span>
        <strong>${permissionRows.length}</strong>
        <small>階層 1 與階層 2 模組</small>
      </article>
      <article>
        <span>高敏感模組</span>
        <strong>${highSensitivityCount}</strong>
        <small>個資、薪資或最高權限</small>
      </article>
      <article>
        <span>需審核 / 管理</span>
        <strong>${managedRows.length}</strong>
        <small>含 approve 或 manage 操作</small>
      </article>
      <article>
        <span>操作類型</span>
        <strong>${new Set(permissionRows.flatMap((row) => row.actions)).size}</strong>
        <small>view、create、edit、submit、approve 等</small>
      </article>
    </div>
    <div class="grade-layout">
      <div class="grade-card-list module-permission-card-list" aria-label="模組分類">
        ${modules
          .map((module) => {
            const childCount = module.children?.length || 0;
            return `
              <article>
                <span>${escapeHtml(module.number)}</span>
                <div>
                  <strong>${escapeHtml(getModuleDisplayName(module))}</strong>
                  <small>${childCount ? `${childCount} 個子模組` : "單一模組"}｜${escapeHtml(moduleDescriptions[module.id] || "依角色開放")}</small>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
      <div class="affiliation-panel">
        <div class="affiliation-panel-head">
          <strong>模組權限矩陣</strong>
          <span>模組 / 角色 / Data Scope / 操作</span>
        </div>
        <label class="account-search">
          <span>搜尋模組權限</span>
          <input id="modulePermissionSearchInput" type="search" placeholder="模組、角色、資料範圍、操作、限制" autocomplete="off">
        </label>
        <div class="account-table-wrap">
          <table class="account-table module-permission-table">
            <thead>
              <tr>
                <th>模組</th>
                <th>負責組織</th>
                <th>資料範圍</th>
                <th>可用角色</th>
                <th>操作權限</th>
                <th>限制</th>
              </tr>
            </thead>
            <tbody data-module-permission-table-body></tbody>
          </table>
        </div>
      </div>
    </div>
    <p class="account-note">模組權限決定入口、選單與按鈕是否出現；實際資料仍會再依 Data Scope 過濾。匯出、列印、刪除、權限異動都必須留下操作紀錄。</p>
  `;

  const searchInput = panel.querySelector("#modulePermissionSearchInput");
  const tableBody = panel.querySelector("[data-module-permission-table-body]");

  const renderRows = () => {
    const query = searchInput?.value.trim() || "";
    const rows = permissionRows.filter((row) => modulePermissionMatchesQuery(row, query));

    if (rows.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-account-state">找不到符合條件的模組權限。</div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = rows
      .map(
        (row) => `
          <tr>
            <td>
              <div class="account-person">
                <strong>${escapeHtml(row.module?.number || "")} ${escapeHtml(getModuleDisplayName(row.module || {}))}</strong>
                <small>${escapeHtml(row.sensitivity)}｜${escapeHtml(row.policy)}</small>
              </div>
            </td>
            <td>${escapeHtml(row.ownerLabel)}</td>
            <td>${escapeHtml(row.scopeLabel)}</td>
            <td>
              <div class="action-chip-list module-chip-list">
                ${row.roles.map((roleId) => `<span>${escapeHtml(getRoleName(roleId))}</span>`).join("")}
              </div>
            </td>
            <td>
              <div class="action-chip-list">
                ${row.actions.map((action) => `<span>${escapeHtml(action)}</span>`).join("")}
              </div>
            </td>
            <td>${escapeHtml(row.limits)}</td>
          </tr>
        `
      )
      .join("");
  };

  bindPermissionTabs(panel, profile, "modules");
  searchInput?.addEventListener("input", renderRows);

  moduleLevelTwoGrid.classList.add("detail-grid");
  moduleLevelTwoGrid.replaceChildren(panel);
  renderRows();
  setStatus("已開啟模組權限。", "info");
}

function renderButtonPermissionTool(profile) {
  if (!moduleLevelTwoGrid || !moduleTitle) return;
  moduleTitle.textContent = "系統權限｜功能按鈕權限";

  const buttonRows = getButtonPermissionRows();
  const highRiskRows = buttonRows.filter((row) => ["高", "最高"].includes(row.risk));
  const uniqueActions = [...new Set(buttonRows.map((row) => row.action))];
  const panel = document.createElement("section");
  panel.className = "tool-detail account-management button-permission-management";
  panel.innerHTML = `
    <div class="section-head account-head">
      <div>
        <p class="portal-kicker">Button Access</p>
        <h3>功能按鈕權限</h3>
        <small>控管同一個模組內，不同角色可以看到與操作哪些按鈕。</small>
      </div>
      <span>${escapeHtml(profile.label)}｜${escapeHtml(scopeLabels[profile.scope] || profile.scope)}</span>
    </div>
    ${createPermissionTabs("buttons")}
    <div class="affiliation-summary button-permission-summary" aria-label="功能按鈕權限摘要">
      <article>
        <span>按鈕權限列</span>
        <strong>${buttonRows.length}</strong>
        <small>依模組與 action 展開</small>
      </article>
      <article>
        <span>操作種類</span>
        <strong>${uniqueActions.length}</strong>
        <small>${escapeHtml(uniqueActions.slice(0, 5).join("、"))}</small>
      </article>
      <article>
        <span>高風險按鈕</span>
        <strong>${highRiskRows.length}</strong>
        <small>刪除、審核、匯出、管理</small>
      </article>
      <article>
        <span>需留紀錄</span>
        <strong>${buttonRows.filter((row) => row.risk !== "低").length}</strong>
        <small>中風險以上皆需操作紀錄</small>
      </article>
    </div>
    <div class="grade-layout">
      <div class="grade-card-list button-action-card-list" aria-label="功能按鈕類型">
        ${buttonActionDefinitions
          .map(
            (action, index) => `
              <article>
                <span>${String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>${escapeHtml(action.label)}</strong>
                  <small>${escapeHtml(action.button)}｜風險 ${escapeHtml(action.risk)}</small>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
      <div class="affiliation-panel">
        <div class="affiliation-panel-head">
          <strong>功能按鈕矩陣</strong>
          <span>模組 / 按鈕 / 角色 / 紀錄</span>
        </div>
        <label class="account-search">
          <span>搜尋功能按鈕</span>
          <input id="buttonPermissionSearchInput" type="search" placeholder="模組、按鈕、角色、風險、紀錄" autocomplete="off">
        </label>
        <div class="account-table-wrap">
          <table class="account-table button-permission-table">
            <thead>
              <tr>
                <th>模組</th>
                <th>功能按鈕</th>
                <th>資料範圍</th>
                <th>可用角色</th>
                <th>風險</th>
                <th>操作紀錄</th>
              </tr>
            </thead>
            <tbody data-button-permission-table-body></tbody>
          </table>
        </div>
      </div>
    </div>
    <p class="account-note">按鈕權限會控制畫面上的實際動作。匯出、列印、刪除、審核、管理與權限異動必須留下操作紀錄；一般使用者不得透過按鈕提升自己的權限。</p>
  `;

  const searchInput = panel.querySelector("#buttonPermissionSearchInput");
  const tableBody = panel.querySelector("[data-button-permission-table-body]");

  const renderRows = () => {
    const query = searchInput?.value.trim() || "";
    const rows = buttonRows.filter((row) => buttonPermissionMatchesQuery(row, query));

    if (rows.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-account-state">找不到符合條件的功能按鈕權限。</div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = rows
      .map(
        (row) => `
          <tr>
            <td>
              <div class="account-person">
                <strong>${escapeHtml(row.module?.number || "")} ${escapeHtml(getModuleDisplayName(row.module || {}))}</strong>
                <small>${escapeHtml(row.sensitivity)}｜${escapeHtml(row.ownerLabel)}</small>
              </div>
            </td>
            <td>
              <div class="account-person">
                <strong>${escapeHtml(row.label)}</strong>
                <small>${escapeHtml(row.button)}｜${escapeHtml(row.action)}</small>
              </div>
            </td>
            <td>${escapeHtml(row.scopeLabel)}</td>
            <td>
              <div class="action-chip-list module-chip-list">
                ${row.roles.map((roleId) => `<span>${escapeHtml(getRoleName(roleId))}</span>`).join("")}
              </div>
            </td>
            <td><span class="status-pill ${row.risk === "低" ? "is-active" : row.risk === "中" ? "is-pending" : "is-external"}">${escapeHtml(row.risk)}</span></td>
            <td>${escapeHtml(row.audit)}</td>
          </tr>
        `
      )
      .join("");
  };

  bindPermissionTabs(panel, profile, "buttons");
  searchInput?.addEventListener("input", renderRows);

  moduleLevelTwoGrid.classList.add("detail-grid");
  moduleLevelTwoGrid.replaceChildren(panel);
  renderRows();
  setStatus("已開啟功能按鈕權限。", "info");
}

function renderDataScopeTool(profile) {
  if (!moduleLevelTwoGrid || !moduleTitle) return;
  moduleTitle.textContent = "系統權限｜Data Scope 資料範圍";

  const scopeRows = getDataScopeRows();
  const usedScopes = scopeRows.filter((row) => row.accountCount > 0 || row.roleCount > 0 || row.moduleCount > 0);
  const broadScopes = scopeRows.filter((row) => ["company", "group", "custom"].includes(row.id));
  const panel = document.createElement("section");
  panel.className = "tool-detail account-management data-scope-management";
  panel.innerHTML = `
    <div class="section-head account-head">
      <div>
        <p class="portal-kicker">Data Scope</p>
        <h3>Data Scope 資料範圍</h3>
        <small>定義同一個角色與按鈕權限下，可以看到哪一層組織資料。</small>
      </div>
      <span>${escapeHtml(profile.label)}｜${escapeHtml(scopeLabels[profile.scope] || profile.scope)}</span>
    </div>
    ${createPermissionTabs("data-scopes")}
    <div class="affiliation-summary data-scope-summary" aria-label="資料範圍摘要">
      <article>
        <span>資料範圍層級</span>
        <strong>${scopeRows.length}</strong>
        <small>self 到 group + custom</small>
      </article>
      <article>
        <span>已被使用</span>
        <strong>${usedScopes.length}</strong>
        <small>員工清冊、角色或模組已套用</small>
      </article>
      <article>
        <span>廣域範圍</span>
        <strong>${broadScopes.length}</strong>
        <small>公司、全集團、自訂需加強稽核</small>
      </article>
      <article>
        <span>員工清冊覆蓋</span>
        <strong>${scopeRows.reduce((sum, row) => sum + row.accountCount, 0)}</strong>
        <small>依目前員工名冊歸類</small>
      </article>
    </div>
    <div class="grade-layout">
      <div class="grade-card-list data-scope-card-list" aria-label="資料範圍層級">
        ${scopeRows
          .map(
            (scope) => `
              <article>
                <span>${escapeHtml(scope.order)}</span>
                <div>
                  <strong>${escapeHtml(scope.label)}</strong>
                  <small>${escapeHtml(scopeLabels[scope.id] || scope.id)}｜${scope.accountCount} 帳號</small>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
      <div class="affiliation-panel">
        <div class="affiliation-panel-head">
          <strong>資料範圍矩陣</strong>
          <span>範圍 / 員工 / 角色 / 模組</span>
        </div>
        <label class="account-search">
          <span>搜尋資料範圍</span>
          <input id="dataScopeSearchInput" type="search" placeholder="範圍、角色、模組、控管規則" autocomplete="off">
        </label>
        <div class="account-table-wrap">
          <table class="account-table data-scope-table">
            <thead>
              <tr>
                <th>資料範圍</th>
                <th>邊界定義</th>
                <th>預設角色</th>
                <th>目前使用量</th>
                <th>套用模組</th>
                <th>控管規則</th>
              </tr>
            </thead>
            <tbody data-scope-table-body></tbody>
          </table>
        </div>
      </div>
    </div>
    <p class="account-note">Data Scope 只決定資料邊界；實際能否查看、匯出、列印或管理，仍需同時通過角色、模組與功能按鈕權限。</p>
  `;

  const searchInput = panel.querySelector("#dataScopeSearchInput");
  const tableBody = panel.querySelector("[data-scope-table-body]");

  const renderRows = () => {
    const query = searchInput?.value.trim() || "";
    const rows = scopeRows.filter((row) => dataScopeMatchesQuery(row, query));

    if (rows.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-account-state">找不到符合條件的資料範圍。</div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = rows
      .map(
        (row) => `
          <tr>
            <td>
              <div class="account-person">
                <strong>${escapeHtml(row.order)} ${escapeHtml(row.label)}</strong>
                <small>${escapeHtml(scopeLabels[row.id] || row.id)}｜${escapeHtml(row.id)}</small>
              </div>
            </td>
            <td>
              <div class="account-person">
                <strong>${escapeHtml(row.boundary)}</strong>
                <small>${escapeHtml(row.examples)}</small>
              </div>
            </td>
            <td>
              <div class="action-chip-list module-chip-list">
                ${row.defaultRoles.map((role) => `<span>${escapeHtml(role)}</span>`).join("")}
              </div>
            </td>
            <td>
              <div class="account-person">
                <strong>${row.accountCount} 帳號｜${row.activeCount} 啟用</strong>
                <small>${row.roleCount} 角色｜${row.gradeCount} 職等｜${row.buttonCount} 按鈕權限</small>
              </div>
            </td>
            <td>
              <div class="action-chip-list module-chip-list">
                ${
                  row.modules.length > 0
                    ? row.modules.map((moduleName) => `<span>${escapeHtml(moduleName)}</span>`).join("")
                    : "<span>依個別授權</span>"
                }
              </div>
            </td>
            <td>${escapeHtml(row.guardrail)}</td>
          </tr>
        `
      )
      .join("");
  };

  bindPermissionTabs(panel, profile, "data-scopes");
  searchInput?.addEventListener("input", renderRows);

  moduleLevelTwoGrid.classList.add("detail-grid");
  moduleLevelTwoGrid.replaceChildren(panel);
  renderRows();
  setStatus("已開啟 Data Scope 資料範圍。", "info");
}

function renderSensitiveDataTool(profile) {
  if (!moduleLevelTwoGrid || !moduleTitle) return;
  moduleTitle.textContent = "系統權限｜敏感資料控管";

  const sensitiveRows = getSensitiveDataRows();
  const protectedRows = sensitiveRows.filter((row) => ["高", "最高"].includes(row.level));
  const auditRequiredRows = sensitiveRows.filter((row) => row.highRiskButtonCount > 0 || row.exportPrintCount > 0 || ["高", "最高"].includes(row.level));
  const panel = document.createElement("section");
  panel.className = "tool-detail account-management sensitive-data-management";
  panel.innerHTML = `
    <div class="section-head account-head">
      <div>
        <p class="portal-kicker">Sensitive Data</p>
        <h3>敏感資料控管</h3>
        <small>依資料敏感度決定遮罩、匯出列印、外部帳號、稽核與額外授權規則。</small>
      </div>
      <span>${escapeHtml(profile.label)}｜${escapeHtml(scopeLabels[profile.scope] || profile.scope)}</span>
    </div>
    ${createPermissionTabs("sensitive-data")}
    <div class="affiliation-summary sensitive-data-summary" aria-label="敏感資料控管摘要">
      <article>
        <span>資料分類</span>
        <strong>${sensitiveRows.length}</strong>
        <small>一般到最高敏感等級</small>
      </article>
      <article>
        <span>高敏感分類</span>
        <strong>${protectedRows.length}</strong>
        <small>高與最高等級需強制控管</small>
      </article>
      <article>
        <span>高風險按鈕</span>
        <strong>${sensitiveRows.reduce((sum, row) => sum + row.highRiskButtonCount, 0)}</strong>
        <small>刪除、審核、匯出、管理</small>
      </article>
      <article>
        <span>需稽核分類</span>
        <strong>${auditRequiredRows.length}</strong>
        <small>匯出、列印、敏感操作需留痕</small>
      </article>
    </div>
    <div class="grade-layout">
      <div class="grade-card-list sensitive-data-card-list" aria-label="敏感資料分類">
        ${sensitiveRows
          .map(
            (row) => `
              <article>
                <span>${escapeHtml(row.order)}</span>
                <div>
                  <strong>${escapeHtml(row.label)}</strong>
                  <small>${escapeHtml(row.level)}｜${row.moduleCount} 模組｜${row.highRiskButtonCount} 高風險按鈕</small>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
      <div class="affiliation-panel">
        <div class="affiliation-panel-head">
          <strong>敏感資料矩陣</strong>
          <span>分類 / 模組 / 角色 / 控制</span>
        </div>
        <label class="account-search">
          <span>搜尋敏感資料</span>
          <input id="sensitiveDataSearchInput" type="search" placeholder="資料分類、模組、角色、控管規則" autocomplete="off">
        </label>
        <div class="account-table-wrap">
          <table class="account-table sensitive-data-table">
            <thead>
              <tr>
                <th>敏感分類</th>
                <th>資料內容</th>
                <th>套用模組</th>
                <th>可用角色 / 範圍</th>
                <th>風險操作</th>
                <th>必要控管</th>
                <th>限制規則</th>
              </tr>
            </thead>
            <tbody data-sensitive-data-table-body></tbody>
          </table>
        </div>
      </div>
    </div>
    <p class="account-note">敏感資料控管會疊加在 RBAC、模組權限、功能按鈕與 Data Scope 之上；即使看得到模組，也不代表可以看完整個資、薪資、財務明細或匯出列印。</p>
  `;

  const searchInput = panel.querySelector("#sensitiveDataSearchInput");
  const tableBody = panel.querySelector("[data-sensitive-data-table-body]");

  const renderRows = () => {
    const query = searchInput?.value.trim() || "";
    const rows = sensitiveRows.filter((row) => sensitiveDataMatchesQuery(row, query));

    if (rows.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-account-state">找不到符合條件的敏感資料控管規則。</div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = rows
      .map(
        (row) => `
          <tr>
            <td>
              <div class="account-person">
                <strong>${escapeHtml(row.order)} ${escapeHtml(row.label)}</strong>
                <small>敏感等級：${escapeHtml(row.level)}</small>
              </div>
            </td>
            <td>${escapeHtml(row.examples)}</td>
            <td>
              <div class="action-chip-list module-chip-list">
                ${
                  row.modules.length > 0
                    ? row.modules.map((moduleName) => `<span>${escapeHtml(moduleName)}</span>`).join("")
                    : "<span>尚未套用模組</span>"
                }
              </div>
            </td>
            <td>
              <div class="account-person">
                <strong>${row.roles.length} 角色</strong>
                <small>${escapeHtml(row.scopes.map((scope) => scopeLabels[scope] || scope).join("、") || "依個別授權")}</small>
              </div>
              <div class="action-chip-list module-chip-list">
                ${row.roles.slice(0, 6).map((roleId) => `<span>${escapeHtml(getRoleName(roleId))}</span>`).join("")}
                ${row.roles.length > 6 ? `<span>+${row.roles.length - 6}</span>` : ""}
              </div>
            </td>
            <td>
              <div class="account-person">
                <strong>${row.highRiskButtonCount} 高風險</strong>
                <small>${row.exportPrintCount} 匯出 / 列印</small>
              </div>
            </td>
            <td>
              <div class="action-chip-list module-chip-list">
                ${row.requiredControls.map((control) => `<span>${escapeHtml(control)}</span>`).join("")}
              </div>
            </td>
            <td>${escapeHtml(row.restriction)}</td>
          </tr>
        `
      )
      .join("");
  };

  bindPermissionTabs(panel, profile, "sensitive-data");
  searchInput?.addEventListener("input", renderRows);

  moduleLevelTwoGrid.classList.add("detail-grid");
  moduleLevelTwoGrid.replaceChildren(panel);
  renderRows();
  setStatus("已開啟敏感資料控管。", "info");
}

function renderAuditLogTool(profile) {
  if (!moduleLevelTwoGrid || !moduleTitle) return;
  moduleTitle.textContent = "系統權限｜權限異動與操作紀錄";

  const auditRows = getAuditLogRows();
  const highestRiskRows = auditRows.filter((row) => row.risk === "最高");
  const approvalRows = auditRows.filter((row) => row.approval !== "不需審核");
  const totalButtonCoverage = auditRows.reduce((sum, row) => sum + row.buttonCount, 0);
  const panel = document.createElement("section");
  panel.className = "tool-detail account-management audit-log-management";
  panel.innerHTML = `
    <div class="section-head account-head">
      <div>
        <p class="portal-kicker">Audit Trail</p>
        <h3>權限異動與操作紀錄</h3>
        <small>紀錄所有高風險操作、權限異動、匯出列印、刪除停用與外部帳號活動。</small>
      </div>
      <span>${escapeHtml(profile.label)}｜${escapeHtml(scopeLabels[profile.scope] || profile.scope)}</span>
    </div>
    ${createPermissionTabs("audit-logs")}
    <div class="affiliation-summary audit-log-summary" aria-label="權限異動與操作紀錄摘要">
      <article>
        <span>紀錄事件類型</span>
        <strong>${auditRows.length}</strong>
        <small>登入、查詢、異動、匯出到權限變更</small>
      </article>
      <article>
        <span>最高風險事件</span>
        <strong>${highestRiskRows.length}</strong>
        <small>刪除、權限異動需強制覆核</small>
      </article>
      <article>
        <span>需審核事件</span>
        <strong>${approvalRows.length}</strong>
        <small>敏感操作需主管或最高管理者覆核</small>
      </article>
      <article>
        <span>按鈕覆蓋</span>
        <strong>${totalButtonCoverage}</strong>
        <small>依現有功能按鈕展開留痕</small>
      </article>
    </div>
    <div class="grade-layout">
      <div class="grade-card-list audit-log-card-list" aria-label="操作紀錄事件">
        ${auditRows
          .map(
            (row) => `
              <article>
                <span>${escapeHtml(row.order)}</span>
                <div>
                  <strong>${escapeHtml(row.event)}</strong>
                  <small>${escapeHtml(row.risk)}｜${escapeHtml(row.retention)}｜${row.buttonCount} 按鈕</small>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
      <div class="affiliation-panel">
        <div class="affiliation-panel-head">
          <strong>操作紀錄矩陣</strong>
          <span>事件 / 欄位 / 審核 / 防呆</span>
        </div>
        <label class="account-search">
          <span>搜尋操作紀錄</span>
          <input id="auditLogSearchInput" type="search" placeholder="事件、欄位、模組、角色、防呆規則" autocomplete="off">
        </label>
        <div class="account-table-wrap">
          <table class="account-table audit-log-table">
            <thead>
              <tr>
                <th>紀錄事件</th>
                <th>觸發操作</th>
                <th>必要欄位</th>
                <th>覆蓋模組 / 角色</th>
                <th>審核與保存</th>
                <th>防呆規則</th>
              </tr>
            </thead>
            <tbody data-audit-log-table-body></tbody>
          </table>
        </div>
      </div>
    </div>
    <p class="account-note">操作紀錄不得由一般使用者刪除或修改；權限異動需記錄異動前後差異，並防止自我提權、刪除最後一位最高管理者與外部帳號逾期仍可使用。</p>
  `;

  const searchInput = panel.querySelector("#auditLogSearchInput");
  const tableBody = panel.querySelector("[data-audit-log-table-body]");

  const renderRows = () => {
    const query = searchInput?.value.trim() || "";
    const rows = auditRows.filter((row) => auditLogMatchesQuery(row, query));

    if (rows.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-account-state">找不到符合條件的操作紀錄規則。</div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = rows
      .map(
        (row) => `
          <tr>
            <td>
              <div class="account-person">
                <strong>${escapeHtml(row.order)} ${escapeHtml(row.event)}</strong>
                <small>風險：${escapeHtml(row.risk)}｜${row.highRiskButtonCount} 高風險按鈕</small>
              </div>
            </td>
            <td>
              <div class="action-chip-list module-chip-list">
                ${row.triggerActions.map((action) => `<span>${escapeHtml(getButtonAction(action).label)}</span>`).join("")}
              </div>
            </td>
            <td>
              <div class="action-chip-list module-chip-list">
                ${row.requiredFields.map((field) => `<span>${escapeHtml(field)}</span>`).join("")}
              </div>
            </td>
            <td>
              <div class="account-person">
                <strong>${row.modules.length} 模組｜${row.roles.length} 角色</strong>
                <small>${escapeHtml(row.modules.slice(0, 4).join("、") || "依事件觸發")}</small>
              </div>
            </td>
            <td>
              <div class="account-person">
                <strong>${escapeHtml(row.approval)}</strong>
                <small>${escapeHtml(row.retention)}</small>
              </div>
            </td>
            <td>${escapeHtml(row.guardrail)}</td>
          </tr>
        `
      )
      .join("");
  };

  bindPermissionTabs(panel, profile, "audit-logs");
  searchInput?.addEventListener("input", renderRows);

  moduleLevelTwoGrid.classList.add("detail-grid");
  moduleLevelTwoGrid.replaceChildren(panel);
  renderRows();
  setStatus("已開啟權限異動與操作紀錄。", "info");
}

function renderSecurityRestrictionTool(profile) {
  if (!moduleLevelTwoGrid || !moduleTitle) return;
  moduleTitle.textContent = "系統權限｜安全限制";

  const restrictionRows = getSecurityRestrictionRows();
  const highestRows = restrictionRows.filter((row) => row.severity === "最高");
  const blockingRows = restrictionRows.filter((row) => row.needsBlock);
  const panel = document.createElement("section");
  panel.className = "tool-detail account-management security-restriction-management";
  panel.innerHTML = `
    <div class="section-head account-head">
      <div>
        <p class="portal-kicker">Security Guardrails</p>
        <h3>安全限制</h3>
        <small>把不可被繞過的登入、授權、刪除、匯出、外部帳號與操作紀錄限制集中控管。</small>
      </div>
      <span>${escapeHtml(profile.label)}｜${escapeHtml(scopeLabels[profile.scope] || profile.scope)}</span>
    </div>
    ${createPermissionTabs("security")}
    <div class="affiliation-summary security-restriction-summary" aria-label="安全限制摘要">
      <article>
        <span>安全限制</span>
        <strong>${restrictionRows.length}</strong>
        <small>登入、權限、資料、紀錄全面限制</small>
      </article>
      <article>
        <span>最高風險</span>
        <strong>${highestRows.length}</strong>
        <small>必須阻擋或二次確認</small>
      </article>
      <article>
        <span>強制阻擋</span>
        <strong>${blockingRows.length}</strong>
        <small>違反規則不可只警告</small>
      </article>
      <article>
        <span>Google 限制</span>
        <strong>1</strong>
        <small>未對應 Portal 權限不得進入</small>
      </article>
    </div>
    <div class="grade-layout">
      <div class="grade-card-list security-restriction-card-list" aria-label="安全限制項目">
        ${restrictionRows
          .map(
            (row) => `
              <article>
                <span>${escapeHtml(row.order)}</span>
                <div>
                  <strong>${escapeHtml(row.title)}</strong>
                  <small>${escapeHtml(row.severity)}｜${escapeHtml(row.appliesTo)}</small>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
      <div class="affiliation-panel">
        <div class="affiliation-panel-head">
          <strong>安全限制矩陣</strong>
          <span>限制 / 觸發 / 阻擋 / 紀錄</span>
        </div>
        <label class="account-search">
          <span>搜尋安全限制</span>
          <input id="securityRestrictionSearchInput" type="search" placeholder="自我提權、Google、外部帳號、刪除、匯出" autocomplete="off">
        </label>
        <div class="account-table-wrap">
          <table class="account-table security-restriction-table">
            <thead>
              <tr>
                <th>限制項目</th>
                <th>適用對象</th>
                <th>觸發情境</th>
                <th>系統處置</th>
                <th>紀錄要求</th>
                <th>風險</th>
              </tr>
            </thead>
            <tbody data-security-restriction-table-body></tbody>
          </table>
        </div>
      </div>
    </div>
    <p class="account-note">安全限制是權限中心的最後防線；即使角色、模組、按鈕或 Data Scope 設定錯誤，仍需阻擋自我提權、刪除最後最高管理者、未授權 Google 登入與敏感資料匯出。</p>
  `;

  const searchInput = panel.querySelector("#securityRestrictionSearchInput");
  const tableBody = panel.querySelector("[data-security-restriction-table-body]");

  const renderRows = () => {
    const query = searchInput?.value.trim() || "";
    const rows = restrictionRows.filter((row) => securityRestrictionMatchesQuery(row, query));

    if (rows.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-account-state">找不到符合條件的安全限制。</div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = rows
      .map(
        (row) => `
          <tr>
            <td>
              <div class="account-person">
                <strong>${escapeHtml(row.order)} ${escapeHtml(row.title)}</strong>
                <small>${row.needsBlock ? "強制阻擋" : "記錄與提示"}｜${row.auditCoverage} 項紀錄覆蓋</small>
              </div>
            </td>
            <td>${escapeHtml(row.appliesTo)}</td>
            <td>${escapeHtml(row.trigger)}</td>
            <td>${escapeHtml(row.enforcement)}</td>
            <td>${escapeHtml(row.audit)}</td>
            <td><span class="status-pill ${row.severity === "最高" ? "is-external" : row.severity === "高" ? "is-pending" : "is-active"}">${escapeHtml(row.severity)}</span></td>
          </tr>
        `
      )
      .join("");
  };

  bindPermissionTabs(panel, profile, "security");
  searchInput?.addEventListener("input", renderRows);

  moduleLevelTwoGrid.classList.add("detail-grid");
  moduleLevelTwoGrid.replaceChildren(panel);
  renderRows();
  setStatus("已開啟安全限制。", "info");
}

async function bootPortalLogin() {
  renderOrganizationChart(organizationChart);
  renderQuickLoginPicker();
  renderSession(getStoredProfile());
  await applyGoogleSession();
}

portalLoginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = loginEmail?.value || "";
  const password = loginPassword?.value || "";
  const profile = findProfileByEmail(email);

  if (!profile) {
    setStatus("找不到這個帳號，請確認 Email 或使用測試帳號快速帶入。", "error");
    loginEmail?.focus();
    return;
  }

  if (password !== demoPassword) {
    setStatus("密碼錯誤。測試階段示範帳號密碼為 suiyuecare。", "error");
    loginPassword?.focus();
    return;
  }

  setStoredProfile(profile);
  renderSession(profile);
  setStatus(`已登入：${profile.label}。`, "success");
});

signOutButton?.addEventListener("click", () => {
  clearStoredProfile();
  supabase?.auth.signOut();
  renderSession(null);
  setStatus("已登出，請重新選擇快速登入角色。", "success");
});

backToLevelOneButton?.addEventListener("click", () => renderLevelOne());

portalGoogleLoginButton?.addEventListener("click", async () => {
  if (!supabase) {
    setStatus("Google 登入尚未設定 Supabase Auth，請先確認環境設定。", "error");
    return;
  }

  const redirectTo = getPortalRedirectUrl();
  if (!redirectTo) {
    setStatus("Google 登入需要使用 http 或 https 網址，請從本機伺服器或正式站開啟入口網。", "error");
    return;
  }

  portalGoogleLoginButton.disabled = true;
  setStatus("正在前往 Google 登入...", "info");

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "select_account"
      }
    }
  });

  if (error) {
    portalGoogleLoginButton.disabled = false;
    setStatus(`Google 登入失敗：${error.message}`, "error");
  }
});

bootPortalLogin().catch((error) => {
  setStatus(`入口網登入狀態檢查失敗：${error.message}`, "error");
});
