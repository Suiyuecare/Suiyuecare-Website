import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const sensitiveMarkerPattern = /SUPABASE_SERVICE_ROLE_KEY|FINANCE_SOURCE_SECRET_KEY|RESEND_API_KEY|OPENAI_API_KEY|CRON_SECRET|REPORT_CRON_SECRET|STATUS_SECRET|ADMIN_API_SECRET|service_role|saveWarning|emailSetupRequired/;
const cspValue = "object-src 'none'; base-uri 'self'; frame-ancestors 'self'; upgrade-insecure-requests";
const textFilePattern = /\.(js|mjs|cjs|html|css|json|txt|xml|svg|map)$/i;
const htmlNoCacheValue = "no-cache, no-store, must-revalidate";
const publicHtmlNoCacheSources = [
  "/",
  "/index.html",
  "/about",
  "/milestones",
  "/home-care",
  "/day-care",
  "/community",
  "/nursing",
  "/migrant-training",
  "/quality",
  "/software",
  "/courses",
  "/talent",
  "/land",
  "/investor-recruiting",
  "/health",
  "/search",
  "/investors",
  "/ir-finance",
  "/ir-governance",
  "/ir-shareholders",
  "/contact"
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function log(message) {
  console.log(`ok - ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, filePath), "utf8"));
}

function readText(filePath) {
  return fs.readFileSync(path.resolve(root, filePath), "utf8");
}

function walkFiles(target, files = []) {
  if (!fs.existsSync(target)) return files;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
      walkFiles(path.join(target, entry.name), files);
    }
    return files;
  }
  if (textFilePattern.test(target)) files.push(target);
  return files;
}

function scanSensitiveMarkers(targets = []) {
  const matches = [];
  const files = targets.flatMap((target) => walkFiles(path.resolve(root, target)));
  for (const file of files) {
    const relative = path.relative(root, file);
    const text = fs.readFileSync(file, "utf8");
    text.split(/\r?\n/).forEach((line, index) => {
      if (sensitiveMarkerPattern.test(line)) {
        matches.push(`${relative}:${index + 1}: ${line.trim().slice(0, 180)}`);
      }
    });
  }
  return matches;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit"
  });

  if (!options.allowFailure && result.status !== 0) {
    const stderr = result.stderr ? `\n${result.stderr}` : "";
    throw new Error(`${command} ${args.join(" ")} failed with ${result.status}${stderr}`);
  }

  return result;
}

function output(result) {
  return `${result.stdout || ""}${result.stderr || ""}`;
}

function findHeader(headers, key) {
  return headers.find((header) => header.key.toLowerCase() === key.toLowerCase())?.value || "";
}

function assertHeader(headers, key, value) {
  const actual = findHeader(headers, key);
  assert(actual === value, `Expected ${key}: ${value}, received: ${actual || "(missing)"}`);
}

function verifyVercelConfig() {
  const config = readJson("vercel.json");
  assert(config.cleanUrls === true, "vercel.json should keep cleanUrls enabled.");
  assert(config.trailingSlash === false, "vercel.json should keep trailingSlash disabled.");
  assert(
    config.buildCommand === "pnpm build:vercel",
    "vercel.json buildCommand should use the environment-aware Vercel build script."
  );
  assert(config.outputDirectory === "dist", "vercel.json outputDirectory should be dist.");

  for (const source of ["/:path*", "/", "/index.html"]) {
    const entry = config.headers?.find((item) => item.source === source);
    assert(entry, `Missing headers entry for ${source}.`);
    assertHeader(entry.headers, "Content-Security-Policy", cspValue);
    assertHeader(entry.headers, "Strict-Transport-Security", "max-age=63072000; includeSubDomains");
    assertHeader(entry.headers, "X-Content-Type-Options", "nosniff");
    assertHeader(entry.headers, "X-Frame-Options", "SAMEORIGIN");
  }

  for (const source of ["/admin", "/api", "/portal", "/assets/backups", "/assets/backups/:path*"]) {
    const entry = config.headers?.find((item) => item.source === source);
    assert(entry, `Missing sensitive headers entry for ${source}.`);
    assertHeader(entry.headers, "X-Robots-Tag", "noindex, nofollow");
    if (!source.endsWith(":path*")) {
      assertHeader(entry.headers, "Cache-Control", "no-store");
    }
  }

  for (const source of publicHtmlNoCacheSources) {
    const entry = config.headers?.find((item) => item.source === source);
    assert(entry, `Missing no-cache headers entry for public HTML route ${source}.`);
    assertHeader(entry.headers, "Content-Security-Policy", cspValue);
    assertHeader(entry.headers, "Strict-Transport-Security", "max-age=63072000; includeSubDomains");
    assertHeader(entry.headers, "X-Content-Type-Options", "nosniff");
    assertHeader(entry.headers, "X-Frame-Options", "SAMEORIGIN");
    assertHeader(entry.headers, "Cache-Control", htmlNoCacheValue);
  }

  const rewriteSources = new Set((config.rewrites || []).map((rewrite) => rewrite.source));
  for (const source of ["/article/:slug", "/care-story/:slug", "/master-talk/:slug"]) {
    assert(!rewriteSources.has(source), `Public content route ${source} must resolve to static HTML, not a rewrite.`);
  }
  const rewriteDestinations = new Map((config.rewrites || []).map((rewrite) => [rewrite.source, rewrite.destination]));
  for (const source of [
    "/article/assets/:path*",
    "/care-story/assets/:path*",
    "/master-talk/assets/:path*",
    "/talent/assets/:path*",
    "/land/assets/:path*",
    "/investor-recruiting/assets/:path*"
  ]) {
    assert(rewriteDestinations.get(source) === "/assets/:path*", `Missing nested asset fallback rewrite for ${source}.`);
  }

  log("vercel.json security headers are present");
}

function verifyIgnoredArtifacts() {
  const vercelIgnore = readText(".vercelignore");
  for (const expected of [".env", ".env.*", "/assets/backups/", "/public/assets/backups/", "/outputs/"]) {
    assert(vercelIgnore.includes(expected), `.vercelignore is missing ${expected}.`);
  }

  const gitIgnorePath = path.resolve(root, ".gitignore");
  if (fs.existsSync(gitIgnorePath)) {
    const gitIgnore = readText(".gitignore");
    for (const expected of ["/outputs/", "/assets/backups/", "/public/assets/backups/", "/*-check.png"]) {
      assert(gitIgnore.includes(expected), `.gitignore is missing ${expected}.`);
    }
  } else {
    assert(process.env.VERCEL, ".gitignore is missing.");
  }

  log("generated and backup artifacts are ignored");
}

function verifyRobots() {
  const files = ["robots.txt", "public/robots.txt"];
  if (fs.existsSync(path.resolve(root, "dist/robots.txt"))) files.push("dist/robots.txt");
  for (const file of files) {
    const robots = readText(file);
    for (const expected of ["Disallow: /admin", "Disallow: /api", "Disallow: /portal", "Disallow: /assets/backups"]) {
      assert(robots.includes(expected), `${file} is missing ${expected}.`);
    }
    assert(
      robots.includes("Sitemap: https://www.suiyuecare.com/sitemap.xml"),
      `${file} is missing the public sitemap URL.`
    );
  }

  log("robots files disallow private paths and expose the sitemap");
}

function verifyPackage() {
  const pkg = readJson("package.json");
  assert(pkg.engines?.node === ">=20.19.0", "package.json should require Node >=20.19.0.");
  assert(String(pkg.devDependencies?.vite || "").startsWith("^8."), "package.json should use Vite 8.");
  assert(pkg.scripts?.["verify:security"], "package.json is missing verify:security.");
  assert(pkg.scripts?.["verify:security:production"], "package.json is missing verify:security:production.");
  assert(pkg.scripts?.["verify:production"]?.includes("pnpm verify:routes:production"), "package.json verify:production should run production route checks.");
  assert(pkg.scripts?.["verify:production"]?.includes("pnpm verify:security:production"), "package.json verify:production should run production security checks.");
  assert(pkg.scripts?.["verify:all"]?.includes("pnpm build"), "package.json verify:all should run pnpm build.");
  assert(pkg.scripts?.["verify:route-inventory"], "package.json is missing verify:route-inventory.");
  assert(pkg.scripts?.["verify:all"]?.includes("pnpm verify:route-inventory"), "package.json verify:all should run route inventory checks.");
  assert(pkg.scripts?.["verify:all"]?.includes("pnpm verify:routes"), "package.json verify:all should run route checks.");
  assert(pkg.scripts?.["verify:public-content-rebuild"], "package.json is missing public content rebuild checks.");
  assert(
    pkg.scripts?.["verify:all"]?.includes("pnpm verify:public-content-rebuild"),
    "package.json verify:all should run public content rebuild authorization checks."
  );
  assert(pkg.scripts?.["verify:all"]?.includes("pnpm verify:accessibility"), "package.json verify:all should run accessibility checks.");
  assert(pkg.scripts?.["verify:performance"], "package.json is missing verify:performance.");
  assert(pkg.scripts?.["verify:all"]?.includes("pnpm verify:performance"), "package.json verify:all should run performance budget checks.");
  assert(pkg.scripts?.["verify:all"]?.includes("pnpm audit:images:strict"), "package.json verify:all should run strict image checks.");
  log("package security scripts and runtime constraints are present");
}

function verifyApiSyntax() {
  const apiDir = path.resolve(root, "api");
  const files = fs.readdirSync(apiDir).filter((file) => file.endsWith(".js")).sort();
  assert(files.length > 0, "No API files found.");
  assert(
    files.length <= 12,
    `Vercel Hobby supports at most 12 Serverless Functions; found ${files.length} API entrypoints.`
  );

  for (const file of files) {
    run(process.execPath, ["--check", path.join(apiDir, file)]);
  }

  log("api JavaScript syntax checks pass");
}

function verifyApmPortalHandoff() {
  const portal = readText("src/portal/login.js");
  const portalMarkup = readText("portal/index.html");
  const portalStyles = readText("src/portal/portal.css");
  const handoff = readText("api/portal-handoff.js");
  const financeProfile = readText("server/portal-finance-profile.js");
  const modulePolicy = readText("server/portal-module-policy.js");

  assert(
    !fs.existsSync(path.join(root, "api/portal-finance-profile.js")),
    "Finance profile must share the Portal handoff function, not consume a thirteenth API entrypoint."
  );

  for (const expected of [
    'apm: "https://apm.suiyuecare.com/"',
    'const postHandoffModuleIds = new Set(["edoc", "apm"])',
    'form.action = new URL("/api/auth/handoff", configuredUrl).toString()',
    'moduleId === "edoc"\n    ? [["token", signedHandoff.token]]',
    ': [["payload", signedHandoff.payload], ["signature", signedHandoff.signature]]',
    'moduleReturnPath(moduleId, launchUrl)',
    'returnTo: returnTo || "/dashboard"',
    '"project_you@suiyuecare.com"'
  ]) {
    assert(portal.includes(expected), `Portal APM launch contract is missing ${expected}.`);
  }

  for (const expected of [
    'id="moduleLaunchLoading"',
    'role="status"',
    'aria-live="polite"',
    'aria-labelledby="moduleLaunchLoadingTitle"',
    'src="/assets/milk-favicon.png?v=20260716-transparent"',
    'id="moduleLaunchRecoveryButton"',
    'hidden',
    '正在進入敏捷專案管理系統',
    '確認完成後會直接開啟敏捷專案管理系統。'
  ]) {
    assert(portalMarkup.includes(expected), `Portal APM loading markup is missing ${expected}.`);
  }
  const mascotPath = path.join(root, "public/assets/milk-favicon.png");
  assert(fs.existsSync(mascotPath), "Portal APM loading mascot asset is missing.");
  const mascotHash = createHash("sha256").update(fs.readFileSync(mascotPath)).digest("hex");
  assert(
    mascotHash === "e7a06615f58398b1bd4cf9c7007ef66523f124602e6c48089d9f790886f11187",
    "Portal APM loading mascot must remain the approved transparent plush icon."
  );
  for (const expected of [
    ".module-launch-loading",
    "linear-gradient(135deg, #fffaf2, #f8ead8)",
    "#ea880c",
    ".module-launch-recovery",
    "animation: module-launch-loading 1.1s ease-in-out infinite alternate",
    "@media (prefers-reduced-motion: reduce)"
  ]) {
    assert(portalStyles.includes(expected), `Portal APM loading style is missing ${expected}.`);
  }

  const connectedLaunchStart = portal.indexOf("if (connectedModuleIds.has(module.id))");
  const connectedLaunchLoading = portal.indexOf("showModuleLaunchLoading(module.id, button)", connectedLaunchStart);
  const connectedLaunchAwait = portal.indexOf("await launchConnectedModule(module.id, profile)", connectedLaunchStart);
  assert(
    connectedLaunchStart >= 0
      && connectedLaunchLoading > connectedLaunchStart
      && connectedLaunchLoading < connectedLaunchAwait,
    "Portal must show the APM loading screen before awaiting the signed handoff."
  );
  const requestedLaunchStart = portal.indexOf("async function launchRequestedModuleIfReady");
  const requestedLaunchLoading = portal.indexOf("showModuleLaunchLoading(request.moduleId)", requestedLaunchStart);
  const requestedLaunchAwait = portal.indexOf("await launchConnectedModule(request.moduleId", requestedLaunchStart);
  assert(
    requestedLaunchStart >= 0
      && requestedLaunchLoading > requestedLaunchStart
      && requestedLaunchLoading < requestedLaunchAwait,
    "Portal must show the APM loading screen before an automatic signed handoff."
  );
  assert(
    portal.includes('window.addEventListener("pageshow", (event) => {')
      && portal.includes("if (event.persisted) hideModuleLaunchLoading();"),
    "Portal must clear a stale APM loading screen when restored from the back-forward cache."
  );
  assert(
    portal.includes("showModuleLaunchLoading(requestedModuleId, portalGoogleLoginButton);")
      && portal.includes('} catch (error) {\n    hideModuleLaunchLoading(requestedModuleId);\n    portalGoogleLoginButton.disabled = false;'),
    "Portal must preserve the APM loading screen across Google OAuth startup and recover on failure."
  );
  assert(
    portal.includes('function hideModuleLaunchLoading(moduleId = "apm")')
      && portal.includes("hideModuleLaunchLoading(module.id);")
      && portal.includes("hideModuleLaunchLoading(request.moduleId);"),
    "Only the APM launch that owns the loading screen may clear it."
  );
  for (const expected of [
    'portalShell?.setAttribute("inert", "")',
    'portalShell?.removeAttribute("inert")',
    "startModuleLaunchRecoveryTimer()",
    'moduleLaunchRecoveryButton?.addEventListener("click"',
    "const controller = new AbortController()",
    "signal: controller.signal"
  ]) {
    assert(portal.includes(expected), `Portal APM loading recovery is missing ${expected}.`);
  }
  assert(
    !portal.includes("const moduleDeniedEmails"),
    "Portal must not hardcode employee-level APM denials; APM HR membership is authoritative."
  );
  assert(
    !portal.includes('"project_pan@suiyuecare.com", "職員"'),
    "Departed project_pan must not remain an enabled Portal employee row."
  );
  assert(
    portal.includes('"daycare.xinyi@suiyuecare.com", "課長", "信義失智據點課長"')
      && portal.includes('"信義失智據點課", "本課", "停用"'),
    "Vacant daycare.xinyi account must stay disabled."
  );
  assert(
    portal.includes('"尤䅍笙", "homecare.taipei2@suiyuecare.com"')
      && portal.includes('"林瓊芠", "daycare.wanhua@suiyuecare.com"')
      && !portal.includes('[35, "林方春"'),
    "Portal current personnel labels must match the Finance active roster."
  );

  for (const expected of [
    "isSignedModule(moduleId)",
    "staticPortalGrantAllows(email, moduleId)",
    'if (moduleId !== "apm")',
    "await dependencies.financeLookup(email",
    "environment.APM_PORTAL_SIGNING_SECRET",
    'returnTo: normalizeApmReturnTo(payload.returnTo)',
    'apmWorkspacePaths.some((path)',
    'moduleId: "edoc"',
    "authUserId: user.id",
    "isConfirmedGoogleUser(data.user, email)",
    "createPortalFinanceProfileHandler(dependencies)",
    'response.setHeader("Allow", "GET, POST")'
  ]) {
    assert(handoff.includes(expected), `Portal handoff guard is missing ${expected}.`);
  }
  assert(
    !handoff.includes("moduleDeniedEmails")
      && !handoff.includes('"investorrelations@suiyuecare.com"')
      && !handoff.includes('"suiyue.acct@suiyuecare.com"')
      && !handoff.includes("...payload"),
    "Portal handoff must use server grants and must not copy browser authorization fields."
  );
  assert(
    modulePolicy.includes('const signedModuleIds = new Set(["apm", "edoc"])')
      && !modulePolicy.includes('"accounting"')
      && !modulePolicy.includes('"website-backoffice"'),
    "Only APM and EDOC may consume signed Portal assertions."
  );

  for (const expected of [
    'fetch("/api/portal-handoff", {\n    method: "GET"',
    'profile = await findFinanceApmProfile(data.session, email)',
    'financeApmOnly: true',
    'if (profile?.financeApmOnly) return module.id === "apm"',
    'modules: ["apm"]'
  ]) {
    assert(portal.includes(expected), `Portal Finance fallback guard is missing ${expected}.`);
  }
  assert(
    !portal.includes("/api/portal-finance-profile"),
    "Portal must use the consolidated handoff endpoint for Finance profile lookup."
  );
  assert(
    !portal.includes("FINANCE_SOURCE_SECRET_KEY"),
    "Finance source secret must never be referenced by Portal client code."
  );

  for (const expected of [
    "FINANCE_SOURCE_SUPABASE_URL",
    "FINANCE_SOURCE_SECRET_KEY",
    "portalClient.auth.getUser(token)",
    'url.searchParams.set("email", `eq.${email}`)',
    'url.searchParams.set("active", "eq.true")',
    'url.searchParams.set("org_status", "eq.active")',
    'url.searchParams.set("org_source", `in.(${financeRosterSources.join(",")})`)',
    'const financeProjectRef = "udtlppnrugmtzhigdsxo"',
    'allowedModules: ["apm"]',
    "isConfirmedGoogleUser(data.user, email)",
    'configuration.isOpaqueSecret ? {} : { Authorization: `Bearer ${configuration.key}` }'
  ]) {
    assert(financeProfile.includes(expected), `Finance self-profile API guard is missing ${expected}.`);
  }
  assert(
    !financeProfile.includes("user_metadata") && !financeProfile.includes("raw_user_meta_data"),
    "Finance self-profile lookup must use the verified Auth user email, not editable metadata."
  );

  run(process.execPath, ["scripts/verify-portal-finance-profile.mjs"]);
  run(process.execPath, ["scripts/verify-portal-handoff.mjs"]);

  log("APM/EDOC server-authorized handoff and Finance APM-only fallback are present");
}

function verifyDist() {
  const distDir = path.resolve(root, "dist");
  if (!fs.existsSync(distDir)) {
    console.log("skip - dist directory not found; run pnpm run build before checking built assets");
    return;
  }

  assert(!fs.existsSync(path.join(distDir, "assets/backups")), "dist/assets/backups must not exist.");
  const matches = scanSensitiveMarkers(["dist", "index.html", "app.js", "src", "public"]);
  assert(matches.length === 0, `Sensitive marker scan found matches:\n${matches.join("\n")}`);
  log("dist excludes backups and sensitive markers");
}

function verifyProductionDocs() {
  const docs = readText("docs/production-routing.md");
  for (const expected of [
    "Block Untrusted Origin Public APIs",
    "Block Missing Origin Public APIs",
    "Sensitive Paths Noindex No-store",
    "Security Headers Baseline",
    "Public API Rate Limit",
    "pnpm dlx vercel firewall diff"
  ]) {
    assert(docs.includes(expected), `production-routing.md is missing ${expected}.`);
  }
  log("production edge guardrails are documented");
}

async function request(method, url, headers = {}, body = undefined) {
  return fetch(url, { method, headers, body, redirect: "manual" });
}

async function verifyProduction() {
  const base = "https://www.suiyuecare.com";

  const routes = run("pnpm", ["dlx", "vercel", "routes", "list"], { capture: true });
  const routesOutput = output(routes);
  assert(routesOutput.includes("4 Routes found"), "Expected 4 production routes.");
  assert(routesOutput.includes("Block Untrusted Origin"), "Missing untrusted origin route.");
  assert(routesOutput.includes("Security Headers Baseline"), "Missing security headers route.");

  const firewall = run("pnpm", ["dlx", "vercel", "firewall", "rules", "list"], { capture: true });
  const firewallOutput = output(firewall);
  assert(firewallOutput.includes("Public API Rate Limit"), "Missing Public API Rate Limit firewall rule.");
  assert(firewallOutput.includes("Showing live configuration"), "Firewall rules list should show live configuration.");

  const firewallDiff = run("pnpm", ["dlx", "vercel", "firewall", "diff"], { capture: true });
  assert(output(firewallDiff).includes("No pending changes"), "Firewall has pending unpublished changes.");

  const home = await request("HEAD", `${base}/`);
  assert(home.status === 200, `Homepage status should be 200, received ${home.status}.`);
  assert(home.headers.get("content-security-policy") === cspValue, "Homepage CSP header mismatch.");
  assert(home.headers.get("strict-transport-security") === "max-age=63072000; includeSubDomains", "Homepage HSTS header mismatch.");

  const admin = await request("HEAD", `${base}/admin`);
  assert(admin.status === 200, `Admin status should be 200, received ${admin.status}.`);
  assert(admin.headers.get("cache-control") === "no-store", "Admin cache-control should be no-store.");
  assert(admin.headers.get("x-robots-tag") === "noindex, nofollow", "Admin should be noindex.");

  const badOrigin = await request("POST", `${base}/api/send-email`, {
    "content-type": "application/json",
    origin: "https://evil.example"
  }, "{}");
  assert(badOrigin.status === 403, `Bad Origin should be 403, received ${badOrigin.status}.`);

  const missingOrigin = await request("POST", `${base}/api/analytics`, {
    "content-type": "application/json"
  }, "{}");
  assert(missingOrigin.status === 403, `Missing Origin should be 403, received ${missingOrigin.status}.`);

  const allowedOrigin = await request("POST", `${base}/api/send-email`, {
    "content-type": "application/json",
    origin: "https://www.suiyuecare.com"
  }, "{}");
  assert(allowedOrigin.status !== 403, `Allowed Origin should not be 403, received ${allowedOrigin.status}.`);

  log("production edge guardrails are live");
}

async function main() {
  verifyVercelConfig();
  verifyIgnoredArtifacts();
  verifyRobots();
  verifyPackage();
  verifyApiSyntax();
  verifyApmPortalHandoff();
  verifyDist();
  verifyProductionDocs();

  if (process.env.VERIFY_PRODUCTION === "1") {
    await verifyProduction();
  } else {
    console.log("skip - production checks disabled; run pnpm run verify:security:production to enable");
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
