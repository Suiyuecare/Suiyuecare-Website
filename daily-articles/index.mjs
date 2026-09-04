import { dailyArticles20260901 } from "./2026-09-01.mjs";
import { dailyArticles20260902 } from "./2026-09-02.mjs";
import { dailyArticles20260904 } from "./2026-09-04.mjs";

export const dailyArticles = [
  ...dailyArticles20260904,
  ...dailyArticles20260902,
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
