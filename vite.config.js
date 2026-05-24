import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        admin: "admin/index.html",
        adminLogin: "admin/login/index.html",
        adminPages: "admin/pages/index.html",
        adminPageEdit: "admin/pages/[id]/index.html",
        adminMedia: "admin/media/index.html",
        adminCategories: "admin/categories/index.html",
        adminArticles: "admin/articles/index.html",
        adminArticleNew: "admin/articles/new/index.html",
        adminArticleEdit: "admin/articles/[id]/index.html",
        adminTraffic: "admin/traffic/index.html",
        adminContentHealth: "admin/content-health/index.html",
        adminBackups: "admin/backups/index.html",
        notFound: "404.html"
      }
    }
  }
});
