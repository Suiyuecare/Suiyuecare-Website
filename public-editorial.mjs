const SITE_ORIGIN = "https://www.suiyuecare.com";

export const EDITORIAL_POLICY_ROUTE = Object.freeze({
  path: "/editorial-policy",
  title: "健康3.0 編輯團隊與資料說明｜歲悅長照",
  description: "認識歲悅健康3.0的內容主題、團隊署名、參考資料與日期標示，並找到文章內容建議的聯絡方式。",
  image: "/assets/hero-care-hero-fast.jpg"
});

// These are existing public bylines, grouped by subject. They do not assert
// professional credentials, a staff roster, or a completed clinical review.
export const PUBLIC_EDITORIAL_TEAMS = [
  { id: "care-editors", name: "歲悅照顧編輯部", topic: "長照申請、照顧安排與家庭日常", aliases: ["歲悅照顧管理團隊", "歲悅服務督導團隊"] },
  { id: "home-care", name: "歲悅居家照顧編輯部", topic: "到宅服務、服務交接與居家安全", aliases: ["歲悅居家照顧團隊", "歲悅居家服務團隊", "歲悅居家安全團隊"], service: "居家照顧" },
  { id: "day-care", name: "歲悅日間照顧編輯部", topic: "日照適應、白天照顧與家屬聯繫", aliases: ["歲悅日照團隊", "歲悅日間照顧部"], service: "日間照顧" },
  { id: "community", name: "歲悅社區據點編輯部", topic: "社區參與、據點課程與日常活動", aliases: [], service: "社區據點" },
  { id: "nursing-reablement", name: "歲悅護理復能編輯部", topic: "生活功能、照顧觀察與復能支持", aliases: ["歲悅護理復能團隊", "歲悅護理復能部", "歲悅復能團隊", "歲悅復能照顧團隊", "歲悅護理照護團隊", "歲悅護理照顧小組", "歲悅營養照顧小組"], service: "護理復能" },
  { id: "dementia-care", name: "歲悅失智照顧編輯部", topic: "失智照顧、日常溝通與認知健康", aliases: ["歲悅失智照顧團隊", "歲悅失智照顧小組"] },
  { id: "family-support", name: "歲悅家庭支持團隊", topic: "家庭分工、照顧者支持與照顧溝通", aliases: [] },
  { id: "migrant-training", name: "歲悅移工培訓編輯部", topic: "照顧交接、語言溝通與移工培訓", aliases: ["歲悅移工培訓部"], service: "移工培訓" },
  { id: "education-quality", name: "歲悅教育品管編輯部", topic: "教育訓練、服務品質與工作支持", aliases: ["歲悅教育品管", "歲悅教育品管部", "歲悅教育訓練團隊", "歲悅人才發展團隊", "歲悅復能與職安小組"], service: "教育品管" },
  { id: "care-technology", name: "歲悅軟體系統編輯部", topic: "照顧紀錄、資訊交接與工作流程", aliases: [], service: "軟體系統" },
  { id: "expert-talks", name: "歲悅名人講堂", topic: "照顧主題訪談與觀點分享", aliases: [] }
];

const SERVICES = {
  "居家照顧": "/home-care", "日間照顧": "/day-care", "社區據點": "/community",
  "護理復能": "/nursing", "移工培訓": "/migrant-training", "教育品管": "/quality", "軟體系統": "/software"
};

function text(value, limit = 300) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function html(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function safeEditorialHref(value = "") {
  const raw = text(value, 2000);
  if (!raw || /[\u0000-\u0020\u007f\\]/.test(raw) || raw.startsWith("//")) return "";
  try {
    const url = new URL(raw, SITE_ORIGIN);
    if (url.protocol !== "https:" || url.username || url.password) return "";
    if (raw.startsWith("/")) return `${url.pathname}${url.search}${url.hash}`;
    return /^https:\/\//i.test(raw) ? url.href : "";
  } catch {
    return "";
  }
}

function date(value) {
  const raw = text(value, 60);
  if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(raw)) return "";
  const day = raw.slice(0, 10);
  const dateOnly = new Date(`${day}T00:00:00.000Z`);
  if (Number.isNaN(dateOnly.getTime()) || dateOnly.toISOString().slice(0, 10) !== day) return "";
  const parsed = new Date(raw.length === 10 ? `${raw}T00:00:00+08:00` : raw);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function identity(value) {
  const record = object(value);
  const name = text(record.name, 120);
  if (!name || !["Person", "Organization"].includes(record.type)) return null;
  return {
    name,
    type: record.type,
    url: safeEditorialHref(record.url || record.profileUrl),
    role: text(record.role, 120),
    credentials: text(record.credentials, 200),
    description: text(record.description, 500)
  };
}

/** Later supplied metadata wins; an explicit null can remove stale identity data. */
export function normalizePublicEditorialMetadata(...sources) {
  const value = Object.assign({}, ...sources.map(object));
  return {
    author: identity(value.author),
    reviewer: identity(value.reviewer),
    reviewedAt: date(value.reviewedAt),
    contentUpdatedAt: date(value.contentUpdatedAt),
    sourceCheckedAt: date(value.sourceCheckedAt)
  };
}

export function getPublicEditorialInfo(article = {}) {
  const metadata = normalizePublicEditorialMetadata(article.editorial);
  const originalName = text(article.author, 120) || "歲悅照顧編輯部";
  const authorName = metadata.author?.name || originalName;
  const team = PUBLIC_EDITORIAL_TEAMS.find((entry) => [entry.name, ...entry.aliases].includes(authorName));
  const author = metadata.author || {
    name: authorName,
    type: team || /^歲悅/.test(authorName) ? "Organization" : "Person",
    url: "", role: "", credentials: "", description: ""
  };
  if (team && !author.url) author.url = `${EDITORIAL_POLICY_ROUTE.path}#editorial-${team.id}`;
  const reviewer = metadata.reviewer && metadata.reviewedAt ? metadata.reviewer : null;
  const serviceName = [article.relatedService, article.category, team?.service].find((value) => SERVICES[value]);
  return {
    ...metadata,
    author,
    reviewer,
    reviewedAt: reviewer ? metadata.reviewedAt : "",
    policyUrl: EDITORIAL_POLICY_ROUTE.path,
    service: serviceName ? { name: serviceName, href: SERVICES[serviceName] } : null
  };
}

export function editorialIdentitySchema(person, siteOrigin = SITE_ORIGIN) {
  if (!person) return null;
  const url = person.url ? new URL(person.url, siteOrigin).href : "";
  return {
    "@type": person.type,
    ...(url ? { "@id": url, url } : {}),
    name: person.name,
    ...(person.role && person.type === "Person" ? { jobTitle: person.role } : {}),
    ...(person.description ? { description: person.description } : {})
  };
}

export function renderEditorialPolicyPage() {
  return `
    <article class="editorial-policy-page" data-public-editorial-policy>
      <a class="editorial-policy-back" href="/health">返回健康3.0</a>
      <header class="editorial-policy-intro">
        <p class="editorial-policy-eyebrow">健康3.0 · 內容說明</p>
        <h1>編輯團隊與資料說明</h1>
        <p>從文章的署名、參考資料與日期，了解照顧資訊的來源，再依長輩的實際需要討論下一步。</p>
      </header>
      <section class="editorial-policy-reading" aria-labelledby="editorial-reading-title">
        <h2 id="editorial-reading-title">如何閱讀文章資訊</h2>
        <div class="editorial-policy-grid">
          <section><h3>作者與團隊署名</h3><p>文章保留原有作者或編輯團隊署名。團隊介紹整理其內容主題；個人背景與資格以文章實際列出的資料為準。</p></section>
          <section><h3>資料來源</h3><p>文章末的參考資料連結可協助你查閱原始研究或官方說明。政策、服務資格及費用，請同時確認主管機關與服務單位的最新公告。</p></section>
          <section><h3>發布、更新與審閱日期</h3><p>發布日期表示文章上架時間；另有內容更新、資料查核或審閱紀錄時，會分別標示日期。審閱資訊會一併列出實際審閱者。</p></section>
          <section><h3>從知識到個別照顧</h3><p>文章提供一般照顧資訊。診斷、治療、用藥及個別飲食或復能安排，請與具相應資格的專業人員討論。</p></section>
        </div>
      </section>
      <section class="editorial-policy-teams" aria-labelledby="editorial-teams-title">
        <h2 id="editorial-teams-title">認識內容主題與團隊署名</h2>
        <p>以下列出本站文章使用的團隊名稱，方便你從文章連回相關的內容介紹。</p>
        <div class="editorial-policy-grid">${PUBLIC_EDITORIAL_TEAMS.map((team) => `
          <section id="editorial-${team.id}" class="editorial-policy-team">
            <h3>${html(team.name)}</h3><p>${html(team.topic)}</p>
            ${team.aliases.length ? `<p class="editorial-policy-aliases">相關署名：${team.aliases.map(html).join("、")}</p>` : ""}
            <a href="/search?q=${encodeURIComponent(team.topic.split("、")[0])}">閱讀相關內容</a>
          </section>`).join("")}</div>
      </section>
      <section class="editorial-policy-feedback" id="content-feedback">
        <h2>提供內容建議</h2>
        <p>發現資料需要補充或更新時，請附上文章網址與具體段落，讓團隊了解你想討論的內容。</p>
        <a href="/contact?need=${encodeURIComponent("文章內容建議")}">聯絡歲悅</a>
      </section>
    </article>`;
}
