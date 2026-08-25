// Keep this order stable: it is the public article number contract.
export const ARTICLE_SOURCE_SLUGS = Object.freeze([
  "daily-hydration-care",
  "night-fall-prevention",
  "meal-appetite-support",
  "caregiver-burnout-signs",
  "dementia-bathing-refusal",
  "home-reablement-routine",
  "daycare-first-week",
  "migrant-care-handover",
  "hospital-discharge-checklist",
  "family-meeting-care-plan",
  "care-transfer-safe-home",
  "longterm-care-apply-checklist-2026",
  "safe-transfer-three-reminders",
  "longterm-care-apply",
  "nutrition-soft-food-guide",
  "dementia-evening-anxiety",
  "family-care-report-rhythm",
  "community-health-class-family-day",
  "home-care-video-guide-communication",
  "short-video-bathroom-safety-3-tips",
  "master-talk-care-communication",
  "reablement-walking-home-practice",
  "bathroom-safety",
  "fall-observation",
  "day-care-video-guide",
  "home-care-video-guide",
  "reablement-workshop",
  "elder-nutrition-warning",
  "day-care-respite",
  "dementia-repeated-question",
  "family-care-course",
  "caregiver-burnout-first-steps",
  "dementia-response",
  "master-talk-care-psychology",
  "family-care-story",
  "fall-prevention-home-checklist",
  "hydration-low-appetite-elderly",
  "dementia-evening-agitation",
  "post-discharge-first-week",
  "safe-bathing-care",
  "pressure-injury-prevention",
  "medication-reminder-system",
  "day-care-transition",
  "swallowing-meal-safety",
  "safe-transfer-tips",
  "nutrition-warning",
  "caregiver-support",
  "master-talk-senior-nutrition",
  "master-talk-rehab-goals",
  "master-talk-home-safety",
  "master-talk-care-management",
  "master-talk-dementia-care",
  "master-talk-nursing-observation",
  "master-talk-family-communication",
  "master-talk-community-health",
  "master-talk-longterm-policy",
  "master-talk-medication-safety",
  "master-talk-frailty-prevention",
  "master-talk-swallowing-care",
  "master-talk-sleep-rhythm",
  "master-talk-care-subsidy",
  "master-talk-careworker-training",
  "master-talk-care-technology",
  "master-talk-discharge-transition",
  "master-talk-pressure-injury-care",
  "master-talk-daycare-transition",
  "master-talk-caregiver-burnout",
  "master-talk-medication-reminder",
  "chronic-disease-visit-prep",
  "elder-constipation-care",
  "pain-observation-elderly",
  "oral-care-aspiration-prevention",
  "urinary-incontinence-night-care",
  "social-isolation-depression-signs",
  "assistive-device-selection",
  "home-emergency-care-folder",
  "heat-injury-older-adults",
  "family-care-meeting-guide",
  "careworker-hard-work-overview",
  "careworker-back-pain-transfer",
  "careworker-emotional-labor",
  "home-careworker-travel-between-homes",
  "careworker-service-boundaries-family",
  "dementia-careworker-safety",
  "careworker-shift-sleep-fatigue",
  "careworker-records-supervision-support",
  "careworker-respect-retention",
  "new-careworker-first-year",
  "elderly-hypertension-lazy-pack",
  "elderly-diabetes-lazy-pack",
  "elderly-dementia-lazy-pack",
  "elderly-stroke-lazy-pack",
  "elderly-heart-disease-lazy-pack",
  "elderly-copd-lazy-pack",
  "elderly-osteoporosis-lazy-pack",
  "elderly-osteoarthritis-lazy-pack",
  "elderly-parkinson-lazy-pack",
  "elderly-chronic-kidney-disease-lazy-pack",
  "dementia-prevention-midlife-habits",
  "dementia-prevention-exercise-guide",
  "brain-healthy-diet-plate",
  "cardiometabolic-brain-health",
  "hearing-loss-dementia-risk",
  "sleep-depression-brain-health",
  "daily-cognitive-training-15-minutes",
  "living-well-after-dementia-diagnosis",
  "dementia-care-cue-wait-support",
  "dementia-supplement-myths",
  "stroke-warning-signs-be-fast",
  "tia-warning-stroke-emergency",
  "ischemic-vs-hemorrhagic-stroke",
  "stroke-prevention-risk-factors",
  "post-stroke-dysphagia-safe-eating",
  "stroke-rehabilitation-recovery-roadmap",
  "post-stroke-aphasia-communication",
  "stroke-home-care-discharge-checklist",
  "prevent-recurrent-stroke",
  "post-stroke-emotions-caregiver-support",
  "what-is-sarcopenia-muscle-health",
  "sarcopenia-home-screening",
  "sarcopenia-awgs-diagnosis",
  "sarcopenia-exercise-plan",
  "sarcopenia-nutrition-protein",
  "sarcopenia-breakfast-protein",
  "sarcopenic-obesity-muscle-function",
  "post-hospital-sarcopenia-recovery",
  "sarcopenia-fall-prevention-home",
  "sarcopenia-twelve-week-plan"
]);

const sourceNumberMap = new Map(
  ARTICLE_SOURCE_SLUGS.map((sourceSlug, index) => [sourceSlug, index + 1])
);

export function normalizeArticlePublicNumber(value) {
  const number = Number.parseInt(String(value ?? ""), 10);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

export function articlePublicNumber(value = "", explicitNumber = null) {
  const normalizedExplicit = normalizeArticlePublicNumber(explicitNumber);
  if (normalizedExplicit) return normalizedExplicit;
  const raw = String(value || "").trim();
  const publicMatch = raw.match(/^article(\d+)$/i);
  if (publicMatch) return normalizeArticlePublicNumber(publicMatch[1]);
  return sourceNumberMap.get(raw) || null;
}

export function articlePublicSlug(sourceOrPublicSlug = "", explicitNumber = null) {
  const number = articlePublicNumber(sourceOrPublicSlug, explicitNumber);
  return number ? `article${number}` : "";
}

export function articleSourceSlug(sourceOrPublicSlug = "") {
  const raw = String(sourceOrPublicSlug || "").trim();
  if (sourceNumberMap.has(raw)) return raw;
  const number = articlePublicNumber(raw);
  return number && number <= ARTICLE_SOURCE_SLUGS.length
    ? ARTICLE_SOURCE_SLUGS[number - 1]
    : "";
}

export function articlePublicHref(sourceOrPublicSlug = "", explicitNumber = null) {
  const publicSlug = articlePublicSlug(sourceOrPublicSlug, explicitNumber);
  return publicSlug ? `/article/${publicSlug}` : "/health";
}

export function resolveArticlePublicIdentity(article = {}) {
  const rawSourceSlug = String(article.sourceSlug || article.slug || "").trim();
  const hrefMatch = String(article.href || "")
    .trim()
    .match(/^(?:https?:\/\/[^/]+)?\/article\/([^/?#]+)/i);
  const hrefSlug = hrefMatch?.[1] || "";
  const mappedSourceSlug =
    articleSourceSlug(rawSourceSlug) ||
    articleSourceSlug(hrefSlug);
  const sourceSlug =
    mappedSourceSlug ||
    (rawSourceSlug && !/^article\d+$/i.test(rawSourceSlug) ? rawSourceSlug : "");
  const explicitNumber =
    article.publicNumber ??
    article.public_number ??
    null;
  const identitySlug = rawSourceSlug || hrefSlug;
  const publicNumber = articlePublicNumber(identitySlug, explicitNumber);
  const publicSlug = articlePublicSlug(identitySlug, publicNumber);

  return {
    sourceSlug,
    publicNumber,
    publicSlug,
    href: publicSlug ? `/article/${publicSlug}` : "/health"
  };
}
