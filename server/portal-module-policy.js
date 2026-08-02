const signedModuleIds = new Set(["apm", "edoc"]);

// This is the immutable, server-owned subset of the Portal roster that is
// currently marked 啟用 in src/portal/login.js. Browser localStorage overrides
// are intentionally excluded: client-side permission settings are display
// preferences, never authorization input.
const staticPortalModuleGrants = new Map([
  ["entrepreneur@suiyuecare.com", new Set(["apm", "edoc"])],
  ["admin@suiyuecare.com", new Set(["apm", "edoc"])],
  ["suiyue.acct@suiyuecare.com", new Set(["apm", "edoc"])],
  ["suiyue.hr@suiyuecare.com", new Set(["apm", "edoc"])],
  ["generalaffairs@suiyuecare.com", new Set(["apm", "edoc"])],
  ["investorrelations@suiyuecare.com", new Set(["apm", "edoc"])],
  ["homecare.taipei@suiyuecare.com", new Set(["apm", "edoc"])],
  ["daycare.shilin@suiyuecare.com", new Set(["apm", "edoc"])],
  ["daycare.datong@suiyuecare.com", new Set(["apm", "edoc"])],
  ["edu.control@suiyuecare.com", new Set(["apm", "edoc"])],
  ["project@suiyuecare.com", new Set(["apm", "edoc"])],
  ["project_hsu@suiyuecare.com", new Set(["apm", "edoc"])],
  ["project_chiang@suiyuecare.com", new Set(["apm", "edoc"])],
  ["project_you@suiyuecare.com", new Set(["apm", "edoc"])],
  ["project_yu@suiyuecare.com", new Set(["apm", "edoc"])]
]);

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isSignedModule(moduleId) {
  return signedModuleIds.has(String(moduleId || "").trim());
}

function staticPortalGrantAllows(email, moduleId) {
  return Boolean(staticPortalModuleGrants.get(normalizeEmail(email))?.has(moduleId));
}

module.exports = {
  isSignedModule,
  normalizeEmail,
  signedModuleIds,
  staticPortalGrantAllows,
  staticPortalModuleGrants
};
