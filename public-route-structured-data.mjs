export const PUBLIC_SITE_ORIGIN = "https://www.suiyuecare.com";

const SITE_NAVIGATION = [
  ["關於歲悅", "/about"],
  ["居家照顧", "/home-care"],
  ["日間照顧", "/day-care"],
  ["社區據點", "/community"],
  ["健康3.0", "/health"],
  ["課程報名", "/courses"],
  ["人才招募", "/talent"],
  ["聯絡我們", "/contact"]
];

function siteBase(siteOrigin = PUBLIC_SITE_ORIGIN) {
  return String(siteOrigin || PUBLIC_SITE_ORIGIN).replace(/\/+$/, "");
}

export function absolutePublicUrl(value = "/", siteOrigin = PUBLIC_SITE_ORIGIN) {
  const base = siteBase(siteOrigin);
  try {
    return new URL(value || "/", `${base}/`).href;
  } catch {
    return `${base}/`;
  }
}

function publicContentBreadcrumb(article = {}) {
  if (article.contentKind === "care-story") return { name: "照顧故事", path: "/health" };
  if (article.contentKind === "master-talk") return { name: "名人講堂", path: "/health" };
  return { name: "健康3.0", path: "/health" };
}

export function publicStructuredDataObject(route = {}, siteOrigin = PUBLIC_SITE_ORIGIN) {
  const base = siteBase(siteOrigin);
  const path = route.path || "/";
  const canonical = absolutePublicUrl(path, base);
  const isHome = new URL(canonical).pathname === "/";
  const article = route.article || null;
  const articleId = `${canonical}#article`;
  const webpageId = isHome ? `${base}/#webpage` : `${canonical}#webpage`;
  const image = absolutePublicUrl(route.image || "/assets/hero-care-hero-fast.jpg", base);
  const title = route.title || "歲悅長照集團｜Suiyuecare Corps.";
  const description = route.description || "歲悅長照整合居家照顧、日間照顧、社區據點、護理復能、移工培訓與照顧知識。";
  const graph = [
    {
      "@type": ["Organization", "LocalBusiness"],
      "@id": `${base}/#organization`,
      name: "歲悅長照集團",
      alternateName: "Suiyuecare Corps.",
      url: `${base}/`,
      logo: `${base}/assets/company-logo.png`,
      image: absolutePublicUrl("/assets/hero-care-hero-fast.jpg", base),
      telephone: "+886-2-6604-5432",
      email: "generalaffairs@suiyuecare.com",
      slogan: "照顧就像去超商，買牛奶一樣簡單。",
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: "臺北市",
        addressRegion: "臺北市",
        addressCountry: "TW"
      },
      areaServed: ["臺北市", "新北市", "桃園市"],
      knowsAbout: ["居家照顧", "日間照顧", "社區據點", "護理復能", "移工培訓", "教育品管", "長照申請"],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+886-2-6604-5432",
          contactType: "customer service",
          areaServed: "TW",
          availableLanguage: ["zh-Hant", "zh-TW"]
        }
      ],
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00"
        }
      ],
      sameAs: ["https://lin.ee/oaPkGiq"]
    },
    {
      "@type": "WebSite",
      "@id": `${base}/#website`,
      name: "歲悅長照集團",
      alternateName: "Suiyuecare Corps.",
      url: `${base}/`,
      publisher: { "@id": `${base}/#organization` },
      inLanguage: "zh-Hant-TW"
    },
    {
      "@type": "WebPage",
      "@id": webpageId,
      url: canonical,
      name: title,
      description,
      isPartOf: { "@id": `${base}/#website` },
      about: { "@id": `${base}/#organization` },
      primaryImageOfPage: { "@type": "ImageObject", url: image },
      ...(article ? { mainEntity: { "@id": articleId } } : {}),
      inLanguage: "zh-Hant-TW"
    },
    {
      "@type": "ItemList",
      "@id": `${base}/#site-navigation`,
      name: "歲悅長照集團主要子目錄",
      itemListElement: SITE_NAVIGATION.map(([name, routePath], index) => ({
        "@type": "SiteNavigationElement",
        position: index + 1,
        name,
        url: absolutePublicUrl(routePath, base)
      }))
    }
  ];

  if (!isHome) {
    const breadcrumbItems = [
      { "@type": "ListItem", position: 1, name: "首頁", item: `${base}/` }
    ];
    const breadcrumbParent = route.breadcrumbParent || (article ? publicContentBreadcrumb(article) : null);
    if (breadcrumbParent) {
      breadcrumbItems.push({
        "@type": "ListItem",
        position: breadcrumbItems.length + 1,
        name: breadcrumbParent.name,
        item: absolutePublicUrl(breadcrumbParent.path, base)
      });
    }
    breadcrumbItems.push({
      "@type": "ListItem",
      position: breadcrumbItems.length + 1,
      name: title.replace(/｜.*$/, ""),
      item: canonical
    });
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumb`,
      itemListElement: breadcrumbItems
    });
  }

  if (article) {
    const authorName = article.author || "歲悅照顧編輯部";
    const author = /歲悅/.test(authorName)
      ? { "@type": "Organization", "@id": `${base}/#organization`, name: authorName }
      : { "@type": "Person", name: authorName };
    graph.push({
      "@type": article.schemaType || "Article",
      "@id": articleId,
      mainEntityOfPage: { "@id": webpageId },
      headline: article.title,
      description,
      image: [image],
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
      author,
      publisher: { "@id": `${base}/#organization` },
      articleSection: article.category || "照顧知識",
      keywords: article.seoKeywords?.length ? article.seoKeywords : article.tags || [],
      isAccessibleForFree: true,
      inLanguage: "zh-Hant-TW"
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export function publicStructuredDataJson(route = {}, siteOrigin = PUBLIC_SITE_ORIGIN) {
  return JSON.stringify(publicStructuredDataObject(route, siteOrigin), null, 2);
}

export function updatePublicStructuredData(documentRoot, route = {}, siteOrigin = PUBLIC_SITE_ORIGIN) {
  const head = documentRoot?.head;
  if (!head) return false;
  let script = head.querySelector('#structuredData[type="application/ld+json"]');
  if (!script) {
    script = documentRoot.createElement("script");
    script.id = "structuredData";
    script.type = "application/ld+json";
    head.appendChild(script);
  }
  script.textContent = publicStructuredDataJson(route, siteOrigin);
  return true;
}
