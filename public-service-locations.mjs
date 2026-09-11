import { dayCareLocations, homeCareLocations, communityLocations } from "./service-location-data.mjs";

const escape = (value = "") => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const sitePhone = "02-6604-5432";
const definitions = [
  { id: "wanhua-day-care", key: "wanhua-a", kind: "day-care", source: dayCareLocations["wanhua-one"], label: "萬華一館日照中心", city: "臺北市", district: "萬華區", postalCode: "108", streetAddress: "康定路43號2樓", phone: "02-6604-5432 #31", phoneHref: "tel:0266045432;ext=31" },
  ...Object.entries(communityLocations).map(([key, source]) => ({
    id: `${key}-dementia`, key, kind: "community", source, label: source.name,
    city: "臺北市", district: { shilin: "士林區", datong: "大同區", xinyi: "信義區" }[key],
    postalCode: { shilin: "111", datong: "103", xinyi: "110" }[key],
    streetAddress: source.address.replace(/^臺北市(?:士林區|大同區|信義區)/, ""),
    phone: `${sitePhone} #${{ shilin: "21", datong: "22", xinyi: "23" }[key]}`,
    phoneHref: `tel:0266045432;ext=${{ shilin: "21", datong: "22", xinyi: "23" }[key]}`
  })),
  { id: "taipei-home-care", key: "shilin", kind: "home-care", source: homeCareLocations.taipei, label: "臺北居家照顧｜士林、北投、南港", city: "臺北市", phone: "02-6604-5432 #11", phoneHref: "tel:0266045432;ext=11" },
  { id: "xindian-home-care", key: "xindian", kind: "home-care", source: homeCareLocations.newtaipei, label: "新北居家照顧｜新店、中和、永和", city: "新北市" }
];

const serviceNames = { "day-care": "日間照顧", community: "社區據點", "home-care": "居家照顧" };

// Select only public location records from the published-content snapshot.
// When an explicit snapshot is supplied, disabled/unpublished/planning records
// cannot silently become an operating location through a fallback.
export function getPublicServiceLocations(snapshot) {
  return definitions.flatMap((definition) => {
    const record = snapshot?.homeModules?.find((item) => item.module_key === "location" && item.item_key === definition.key);
    if (snapshot && (!record || record.status !== "published" || record.is_enabled === false || (record.published_at && new Date(record.published_at).getTime() > Date.now()) || /籌設|尚未開放|暫停服務|停止營業/.test(`${record.title} ${record.subtitle} ${record.body} ${record.date_label} ${record.badge_label}`))) return [];
    const source = definition.source;
    const isHomeCare = definition.kind === "home-care";
    const isCommunity = definition.kind === "community";
    const path = `/locations/${definition.id}`;
    const description = source.desc || source.description;
    return [{
      id: definition.id, path, slug: `locations-${definition.id}`, kind: definition.kind,
      label: definition.label, name: source.name, description,
      serviceName: serviceNames[definition.kind], parentPath: `/${definition.kind}`,
      city: definition.city, district: definition.district || "",
      address: isHomeCare ? "" : source.address,
      streetAddress: definition.streetAddress || "", postalCode: definition.postalCode || "",
      districts: source.districts || [],
      phone: definition.phone || source.phone || sitePhone,
      phoneHref: definition.phoneHref || source.phoneHref || "tel:0266045432",
      // Community course hours are not the group's office hours.
      hours: isCommunity ? "課程日期與時段請洽據點確認" : isHomeCare ? "依個案需求與人力媒合確認服務時段" : record?.date_label || source.hours,
      services: isCommunity ? "生命徵象量測、定向感訓練、認知與健康促進課程、共餐" : source.services,
      image: `/${source.image.replace(/^\//, "")}`, imageAlt: isHomeCare || isCommunity ? source.alt : "歲悅萬華一館日間照顧情境示意",
      mapHref: !isHomeCare ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(source.address)}` : "",
      updatedAt: record?.updated_at || "", isPhysicalLocation: !isHomeCare,
      title: `${definition.label}｜${isHomeCare ? "服務範圍與申請" : "地址、服務與預約"}｜歲悅長照集團`
    }];
  });
}

export function getServiceLocationByRoute(slug = "", source) {
  const normalized = String(slug).split(/[?#]/)[0];
  const locations = Array.isArray(source) ? source : getPublicServiceLocations(source);
  return locations.find((location) => location.slug === normalized || location.path === normalized) || null;
}

export function serviceLocationRoutes(snapshot) {
  const locations = getPublicServiceLocations(snapshot);
  return locations.map((location) => ({
    slug: location.slug, path: location.path, title: location.title,
    description: `${location.description}${location.address ? `地址：${location.address}。` : `服務範圍：${location.districts.join("、")}。`}歡迎洽詢服務資格與安排。`,
    image: location.image, imageAlt: location.imageAlt, priority: "0.8",
    ...(location.updatedAt ? { lastmod: location.updatedAt.slice(0, 10) } : {}),
    breadcrumbParent: { name: location.serviceName, path: location.parentPath },
    location, prerenderedHtml: renderServiceLocationPage(location, locations)
  }));
}

function locationSteps(location) {
  if (location.kind === "community") return [
    ["先確認資格與名額", `致電${location.name}，說明長輩目前狀況，確認參與資格、課程時段與可報名名額。`],
    ["確認交通與陪同安排", `依${location.address}規劃往返交通，並先詢問家屬是否需要陪同及活動當日應攜帶的資料。`],
    ["依約參與活動", "活動以認知、健康促進與社交支持為主；課程據點不提供生活照顧或持續看視，有需要可一併洽詢其他照顧服務。"]
  ];
  if (location.kind === "home-care") return [
    ["提供地址與希望時段", `說明位於${location.districts.join("、")}哪一區、詳細地址，以及需要協助的日常活動。`],
    ["討論需求與資源", "與團隊確認照顧需求、申請進度、服務資格及是否需要其他專業協助。"],
    ["確認媒合與開始服務", "實際可服務時段依地址、照顧強度與當下人力確認；安排完成後，再確認服務內容與聯絡方式。"]
  ];
  return [
    ["電話諮詢與預約參觀", `聯絡${location.name}，先說明長輩狀況、日間照顧需求與交通安排。`],
    ["認識環境與生活安排", "參觀時確認活動、餐食、休息空間、出席時段與接送條件，再討論適合的參與方式。"],
    ["確認資料、費用與入托", "依中心說明準備申請與體檢資料，確認資格、費用、出席安排及家屬回報方式後開始服務。"]
  ];
}

export function renderServiceLocationPage(location, locations = getPublicServiceLocations()) {
  if (!location) return "";
  const isHomeCare = location.kind === "home-care";
  const isCommunity = location.kind === "community";
  const siblings = locations.filter((item) => item.kind === location.kind && item.id !== location.id);
  const encodedData = JSON.stringify(location).replace(/</g, "\\u003c");
  return `<article class="public-location-page" data-public-service-location="${escape(location.id)}">
    <nav class="public-location-breadcrumb" aria-label="麵包屑"><a href="/">首頁</a><span aria-hidden="true">／</span><a href="${location.parentPath}">${location.serviceName}</a><span aria-hidden="true">／</span><span>${escape(location.label)}</span></nav>
    <header class="public-location-hero">
      <div><p class="eyebrow">${escape(location.city)}${location.district ? `・${escape(location.district)}` : ""}｜${location.serviceName}</p>
        <h1>${escape(location.label)}</h1><p>${escape(location.description)}</p>
        <div class="public-location-actions"><a class="primary-button" href="${escape(location.phoneHref)}">${isCommunity ? "洽詢課程與名額" : isHomeCare ? "洽詢到宅照顧" : "預約參觀"}</a><a class="secondary-button" href="/contact?location=${encodeURIComponent(location.id)}">留下諮詢需求</a></div>
      </div>
      <figure><img src="${escape(location.image)}" alt="${escape(location.imageAlt)}" width="960" height="640" loading="eager" decoding="async" fetchpriority="high" /><figcaption>照顧服務情境示意</figcaption></figure>
    </header>
    <section class="public-location-info" aria-labelledby="location-info-title"><div><p class="eyebrow">服務資訊</p><h2 id="location-info-title">${isHomeCare ? "服務範圍與聯絡方式" : "地址、時段與聯絡方式"}</h2></div>
      <dl><div><dt>服務單位</dt><dd>${escape(location.name)}</dd></div>
      <div><dt>${isHomeCare ? "到宅服務範圍" : "地址"}</dt><dd>${escape(isHomeCare ? `${location.city}：${location.districts.join("、")}` : location.address)}</dd></div>
      <div><dt>${isCommunity ? "課程時段" : "服務時段"}</dt><dd>${escape(location.hours)}</dd></div>
      <div><dt>諮詢電話</dt><dd><a href="${escape(location.phoneHref)}">${escape(location.phone)}</a></dd></div>
      <div><dt>可協助項目</dt><dd>${escape(location.services)}</dd></div></dl>
      ${location.mapHref ? `<a class="public-location-map-link" href="${escape(location.mapHref)}" target="_blank" rel="noopener noreferrer">在 Google 地圖查看${escape(location.label)}交通路線 ↗</a>` : `<p>以上是機構的到宅服務範圍；服務地點、時段與人力安排請先電話確認。</p>`}
    </section>
    <section class="public-location-steps" aria-labelledby="location-steps-title"><p class="eyebrow">${isCommunity ? "課程參與" : "服務申請"}</p><h2 id="location-steps-title">${isCommunity ? "第一次參與，先確認這三件事" : "從諮詢到開始服務"}</h2><ol>${locationSteps(location).map(([title, body]) => `<li><h3>${escape(title)}</h3><p>${escape(body)}</p></li>`).join("")}</ol></section>
    <section class="public-location-next" aria-labelledby="location-fees-title"><div><h2 id="location-fees-title">資格與費用怎麼確認？</h2><p>${isCommunity ? "參與資格、課程名額與活動費用依據點當期安排確認，請先洽詢再前往。" : "服務資格、補助與自行負擔金額會因核定結果和實際使用安排而不同。諮詢時可一併提供申請進度，請團隊協助確認。"}</p></div><a href="${location.parentPath}">查看完整${location.serviceName}介紹 →</a></section>
    ${siblings.length ? `<nav class="public-location-siblings" aria-label="其他${location.serviceName}服務"><h2>其他${location.serviceName}服務</h2>${siblings.map((item) => `<a href="${item.path}">${escape(item.label)} →</a>`).join("")}</nav>` : ""}
    <script type="application/json" id="serviceLocationData">${encodedData}</script>
  </article>`;
}

export function renderServiceLocationLinks(kind, source) {
  const locations = (Array.isArray(source) ? source : getPublicServiceLocations(source)).filter((item) => item.kind === kind);
  if (!locations.length) return "";
  return `<nav class="public-location-links" data-public-location-links="${kind}" aria-label="${serviceNames[kind]}各據點介紹">${locations.map((location) => `<a href="${location.path}">${escape(location.label)}<span aria-hidden="true"> →</span></a>`).join("")}</nav>`;
}

export function readServiceLocationManifest(root) {
  const documentRoot = root?.ownerDocument || root;
  const script = documentRoot?.querySelector?.("#publicServiceLocationManifest");
  if (!script) return getPublicServiceLocations();
  try {
    const locations = JSON.parse(script.textContent);
    if (!Array.isArray(locations)) return [];
    return locations.filter((item) => definitions.some((definition) => item.id === definition.id && item.path === `/locations/${definition.id}` && item.slug === `locations-${definition.id}`));
  } catch { return []; }
}

export function hydrateServiceLocationLinks(root, source) {
  const locations = source === undefined ? readServiceLocationManifest(root) : (Array.isArray(source) ? source : getPublicServiceLocations(source));
  for (const [kind, selector] of Object.entries({ "day-care": ".one-minute-service-page.day-care-page", "home-care": ".one-minute-service-page.home-care-page", community: ".one-minute-service-page.community-page" })) {
    const page = root?.querySelector?.(selector) || root?.querySelector?.(`[data-service-slug="${kind}"]`);
    if (!page || page.querySelector(`[data-public-location-links="${kind}"]`)) continue;
    const host = page.querySelector(".service-location-section") || page.querySelector(".service-contact-section");
    host?.insertAdjacentHTML("beforeend", renderServiceLocationLinks(kind, locations));
  }
}

export function serviceLocationSchema(location, origin = "https://www.suiyuecare.com") {
  const url = `${origin}${location.path}`;
  if (!location.isPhysicalLocation) return {
    "@type": "Service", "@id": `${url}#service`, name: location.name,
    serviceType: location.serviceName, url, description: location.description,
    provider: { "@id": `${origin}/#organization` },
    areaServed: location.districts.map((district) => ({ "@type": "AdministrativeArea", name: `${location.city}${district}` }))
  };
  return {
    "@type": "LocalBusiness", "@id": `${url}#location`, name: location.name,
    url, image: `${origin}${location.image}`, description: location.description,
    telephone: location.phone.replace(/^02-/, "+886-2-"), hasMap: location.mapHref,
    branchOf: { "@id": `${origin}/#organization` },
    address: { "@type": "PostalAddress", addressCountry: "TW", addressRegion: location.city, addressLocality: location.district, postalCode: location.postalCode, streetAddress: location.streetAddress },
    ...(location.kind === "day-care" && location.hours === "週一至週六 08:30-18:00" ? { openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "08:30", closes: "18:00" }] } : {})
  };
}
