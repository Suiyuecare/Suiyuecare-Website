import { spawnSync } from "node:child_process";

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function run(script) {
  const result = spawnSync(pnpm, [script], {
    env: process.env,
    stdio: "inherit"
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

if (process.env.VERCEL_ENV === "production") {
  console.log("Syncing published CMS content before the production build.");
  run("cms:fallbacks:sync");
} else {
  console.log("Using the committed CMS snapshot for this non-production build.");
}

run("verify:all");
