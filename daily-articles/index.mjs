import { dailyArticles20260901 } from "./2026-09-01.mjs";

export const dailyArticles = [
  ...dailyArticles20260901
];

export function installDailyArticles(articlePages, healthArticles, articleHref) {
  dailyArticles.forEach((article) => {
    articlePages[article.slug] = article;
  });

  healthArticles.unshift(...dailyArticles.map((article) => ({
    ...article,
    href: articleHref(article.slug),
    subtitle: article.tags.slice(0, 2).join("・")
  })));
}
