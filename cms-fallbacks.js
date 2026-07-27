let snapshotPromise;

function loadSnapshot() {
  if (!snapshotPromise) {
    snapshotPromise = fetch("/cms-fallbacks.json", { cache: "no-cache" }).then((response) => {
      if (!response.ok) throw new Error(`CMS fallback snapshot returned ${response.status}`);
      return response.json();
    });
  }
  return snapshotPromise;
}

function mediaMap(snapshot) {
  return new Map((snapshot.media || []).map((item) => [item.id, item]));
}

export async function getServiceFields(slug) {
  const snapshot = await loadSnapshot();
  const media = mediaMap(snapshot);
  return (snapshot.serviceFields || [])
    .filter((field) => field.page_slug === slug)
    .map((field) => ({ ...field, image: media.get(field.image_id) || null }));
}

export async function getRecruitingPage(slug) {
  const snapshot = await loadSnapshot();
  const media = mediaMap(snapshot);
  const attachImage = (item) => ({
    ...item,
    hero_image: media.get(item.hero_image_id) || null,
    image: media.get(item.image_id) || null
  });
  const page = (snapshot.recruitingPages || []).find((item) => item.page_slug === slug);
  if (!page) return null;
  return {
    page: attachImage(page),
    departments: (snapshot.recruitingDepartments || []).filter((item) => item.page_slug === slug).map(attachImage),
    openings: (snapshot.recruitingOpenings || []).filter((item) => item.page_slug === slug).map(attachImage)
  };
}

export async function getCourses() {
  const snapshot = await loadSnapshot();
  const media = mediaMap(snapshot);
  return {
    courses: snapshot.courses || [],
    covers: (snapshot.courses || []).map((course) => media.get(course.cover_image_id)).filter(Boolean)
  };
}

export async function getMilestones() {
  const snapshot = await loadSnapshot();
  const media = mediaMap(snapshot);
  return (snapshot.milestones || []).map((row) => ({
    id: row.id,
    year: String(row.year),
    month: String(row.month).padStart(2, "0"),
    title: row.title || "未命名大事記",
    tag: row.tag || "里程碑",
    copy: row.summary || "",
    image: row.image_url || media.get(row.image_id)?.public_url || "",
    status: row.status_label || "已完成",
    sortOrder: Number(row.sort_order || 0)
  }));
}

export async function getHealthSource() {
  const snapshot = await loadSnapshot();
  return {
    articles: snapshot.articles || [],
    categories: snapshot.articleCategories || [],
    media: snapshot.media || []
  };
}

export async function getArticleSource(slug) {
  const source = await getHealthSource();
  const article = source.articles.find((item) => item.slug === slug);
  if (!article) return null;
  return {
    article,
    category: source.categories.find((item) => item.id === article.category_id) || null,
    cover: source.media.find((item) => item.id === article.cover_image_id) || null
  };
}

export async function getCareStory(slug) {
  const snapshot = await loadSnapshot();
  const media = mediaMap(snapshot);
  const story = (snapshot.careStories || []).find((item) => item.slug === slug);
  if (!story) return null;
  return {
    ...story,
    cover_image: media.get(story.cover_image_id) || null,
    avatar_image: media.get(story.avatar_image_id) || null
  };
}

export async function getExpertTalk(slug) {
  const snapshot = await loadSnapshot();
  const media = mediaMap(snapshot);
  const talk = (snapshot.expertTalks || []).find((item) => item.slug === slug);
  return talk ? { ...talk, image: media.get(talk.image_id) || null } : null;
}

export async function getSiteSettings() {
  const snapshot = await loadSnapshot();
  return snapshot.siteSettings || [];
}

export async function getHomePageContent() {
  const snapshot = await loadSnapshot();
  return {
    page: snapshot.homePage || null,
    sections: snapshot.homeSections || []
  };
}

export async function getHomeModules() {
  const snapshot = await loadSnapshot();
  const media = mediaMap(snapshot);
  return (snapshot.homeModules || []).map((item) => ({
    ...item,
    image: media.get(item.image_id) || null
  }));
}

export async function getStoryDatabases() {
  const snapshot = await loadSnapshot();
  const media = mediaMap(snapshot);
  return {
    stories: (snapshot.careStories || []).map((story) => ({
      ...story,
      cover_image: media.get(story.cover_image_id) || null,
      avatar_image: media.get(story.avatar_image_id) || null
    })),
    talks: (snapshot.expertTalks || []).map((talk) => ({
      ...talk,
      image: media.get(talk.image_id) || null
    }))
  };
}
