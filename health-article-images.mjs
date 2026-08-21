export const HEALTH_ARTICLE_FALLBACK_IMAGE = "assets/fallbacks/health-article-fallback.jpg";

function articleText(article = {}, identityOnly = false) {
  const values = identityOnly
    ? [article.slug, article.category, article.categorySlug, article.title]
    : [
        article.slug,
        article.category,
        article.categorySlug,
        article.title,
        article.subtitle,
        article.dek,
        article.excerpt,
        article.relatedService,
        ...(Array.isArray(article.tags) ? article.tags : [])
      ];
  return values.filter(Boolean).join(" ").toLowerCase();
}

export function getHealthArticleThemeImage(article = {}) {
  const identityText = articleText(article, true);
  const text = articleText(article);

  if (/safe-bathing|bath|浴室安全|洗澡|沐浴/.test(identityText)) return "assets/health3/generated/safe-bathing-preparation-hero.jpg";
  if (/fall-prevention|跌倒|夜間|起身|居家安全|床邊|扶手/.test(identityText)) return "assets/health3/generated/fall-prevention-night-route-hero.jpg";
  if (/bath|浴室|洗澡|沐浴/.test(text)) return "assets/health3/generated/safe-bathing-preparation-hero.jpg";
  if (/fall|跌倒|夜間|起身|居家安全|床邊|扶手|廁所|如廁/.test(text)) return "assets/health3/generated/fall-prevention-night-route-hero.jpg";
  if (/hydration|喝水|水分|食慾|吃不下|營養|食慾下降/.test(text)) return "assets/health3/generated/hydration-meal-observation-hero.jpg";
  if (/swallow|吞嚥|嗆|嗆咳|吃飯常嗆|飲食安全/.test(text)) return "assets/health3/generated/swallowing-safe-meal-hero.jpg";
  if (/dementia|失智|傍晚|焦躁|日落|重複提問/.test(text)) return "assets/health3/generated/dementia-evening-routine-hero.jpg";
  if (/discharge|出院|返家|回診|第一週/.test(text)) return "assets/health3/generated/post-discharge-care-station-hero.jpg";
  if (/pressure|壓傷|褥瘡|久坐|久躺|皮膚/.test(text)) return "assets/health3/generated/pressure-injury-posture-care-hero.jpg";
  if (/medication|用藥|藥物|藥盒|提醒/.test(text)) return "assets/health3/generated/medication-reminder-family-system-hero.jpg";
  if (/burnout|喘息|撐不住|照顧者|照顧壓力|家屬支持/.test(text)) return "assets/health3/generated/caregiver-respite-planning-hero.jpg";
  if (/day-care|daycare|日照|日間照顧|第一次去日照|適應/.test(text)) return "assets/health3/generated/day-care-adaptation-welcome-hero.jpg";
  return "";
}

export function isLegacyHealthPlaceholder(value = "") {
  return /(?:^|\/)assets\/generated\/articles\/[^/?#]+\.svg(?:[?#].*)?$/i.test(String(value || ""));
}

export function resolveHealthArticleImage(article = {}, ...candidates) {
  const explicitImage = candidates.flat().find(Boolean) || "";
  const themedImage = getHealthArticleThemeImage(article);
  if (isLegacyHealthPlaceholder(explicitImage)) return themedImage || HEALTH_ARTICLE_FALLBACK_IMAGE;
  return explicitImage || themedImage || HEALTH_ARTICLE_FALLBACK_IMAGE;
}
