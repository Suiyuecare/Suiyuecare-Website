import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const sensitiveMarkerPattern = "SUPABASE_SERVICE_ROLE_KEY|RESEND_API_KEY|OPENAI_API_KEY|CRON_SECRET|REPORT_CRON_SECRET|STATUS_SECRET|ADMIN_API_SECRET|service_role|saveWarning|emailSetupRequired";
const cspValue = "object-src 'none'; base-uri 'self'; frame-ancestors 'self'; upgrade-insecure-requests";

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
  assert(config.buildCommand === "pnpm run build", "vercel.json buildCommand should use pnpm run build.");
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

  log("vercel.json security headers are present");
}

function verifyIgnoredArtifacts() {
  const vercelIgnore = readText(".vercelignore");
  for (const expected of [".env", ".env.*", "/assets/backups/", "/public/assets/backups/", "/outputs/"]) {
    assert(vercelIgnore.includes(expected), `.vercelignore is missing ${expected}.`);
  }

  const gitIgnore = readText(".gitignore");
  for (const expected of ["/outputs/", "/assets/backups/", "/public/assets/backups/", "/*-check.png"]) {
    assert(gitIgnore.includes(expected), `.gitignore is missing ${expected}.`);
  }

  log("generated and backup artifacts are ignored");
}

function verifyRobots() {
  for (const file of ["robots.txt", "public/robots.txt"]) {
    const robots = readText(file);
    for (const expected of ["Disallow: /admin", "Disallow: /api", "Disallow: /portal", "Disallow: /assets/backups"]) {
      assert(robots.includes(expected), `${file} is missing ${expected}.`);
    }
  }

  log("robots files disallow private paths");
}

function verifyPackage() {
  const pkg = readJson("package.json");
  assert(pkg.engines?.node === ">=20.19.0", "package.json should require Node >=20.19.0.");
  assert(String(pkg.devDependencies?.vite || "").startsWith("^8."), "package.json should use Vite 8.");
  assert(pkg.scripts?.["verify:security"], "package.json is missing verify:security.");
  assert(pkg.scripts?.["verify:security:production"], "package.json is missing verify:security:production.");
  log("package security scripts and runtime constraints are present");
}

function verifyApiSyntax() {
  const apiDir = path.resolve(root, "api");
  const files = fs.readdirSync(apiDir).filter((file) => file.endsWith(".js")).sort();
  assert(files.length > 0, "No API files found.");

  for (const file of files) {
    run(process.execPath, ["--check", path.join(apiDir, file)]);
  }

  log("api JavaScript syntax checks pass");
}

function verifyDist() {
  const distDir = path.resolve(root, "dist");
  if (!fs.existsSync(distDir)) {
    console.log("skip - dist directory not found; run pnpm run build before checking built assets");
    return;
  }

  assert(!fs.existsSync(path.join(distDir, "assets/backups")), "dist/assets/backups must not exist.");
  const scan = run("rg", ["-n", sensitiveMarkerPattern, "dist", "index.html", "app.js", "src", "public"], {
    allowFailure: true,
    capture: true
  });
  assert(scan.status === 1, `Sensitive marker scan found matches:\n${scan.stdout}${scan.stderr}`);
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
