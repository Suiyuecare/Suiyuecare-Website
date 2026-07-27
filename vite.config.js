import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        portal: "portal/index.html",
        admin: "admin/index.html",
        adminLogin: "admin/login/index.html",
        adminPages: "admin/pages/index.html",
        adminPageEdit: "admin/pages/[id]/index.html",
        adminHomeModules: "admin/home-modules/index.html",
        adminTemplateFields: "admin/template-fields/index.html",
        adminVisualEditor: "admin/visual-editor/index.html",
        adminMedia: "admin/media/index.html",
        adminFiles: "admin/files/index.html",
        adminForms: "admin/forms/index.html",
        adminSiteSettings: "admin/site-settings/index.html",
        adminCourses: "admin/courses/index.html",
        adminRecruiting: "admin/recruiting/index.html",
        adminMilestones: "admin/milestones/index.html",
        adminInvestorData: "admin/investor-data/index.html",
        adminStories: "admin/stories/index.html",
        adminCategories: "admin/categories/index.html",
        adminArticles: "admin/articles/index.html",
        adminArticleNew: "admin/articles/new/index.html",
        adminArticleEdit: "admin/articles/[id]/index.html",
        adminGovernance: "admin/governance/index.html",
        adminUsers: "admin/users/index.html",
        adminTraffic: "admin/traffic/index.html",
        adminContentHealth: "admin/content-health/index.html",
        adminBackups: "admin/backups/index.html",
        adminNotFound: "admin/404/index.html",
        notFound: "404.html"
      }
    }
  }
});
