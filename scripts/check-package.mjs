#!/usr/bin/env node
/**
 * Packaging gates for tg-mini-app-uikit — backs the README promises:
 *   1. zero runtime dependencies (peer deps on react only)
 *   2. publint: package.json / exports / files are publish-clean
 *   3. arethetypeswrong: types resolve under node16/bundler, esm & cjs
 *   4. size-limit: gzip budget for the full kit + tree-shaken single imports
 *
 * Run with the package built: npm run build -w tg-mini-app-uikit
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../packages/uikit/package.json", import.meta.url), "utf8"));

// 1 — zero dependencies
const deps = Object.keys(pkg.dependencies ?? {});
if (deps.length > 0) {
  console.error(`✖ tg-mini-app-uikit must have zero runtime dependencies, found: ${deps.join(", ")}`);
  process.exit(1);
}
const allowedPeers = ["react", "react-dom"];
const badPeers = Object.keys(pkg.peerDependencies ?? {}).filter((d) => !allowedPeers.includes(d));
if (badPeers.length > 0) {
  console.error(`✖ unexpected peer dependencies: ${badPeers.join(", ")}`);
  process.exit(1);
}
console.log("✓ zero runtime dependencies");

if (!existsSync(new URL("../packages/uikit/dist/index.js", import.meta.url))) {
  console.error("✖ packages/uikit/dist is missing — run `npm run build -w tg-mini-app-uikit` first");
  process.exit(1);
}

const run = (label, cmd) => {
  console.log(`\n— ${label}: ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

run("publint", "npx publint packages/uikit --strict");
// `./style.css` is a styles-only entrypoint — no JS/types to analyze there.
run("arethetypeswrong", "npx attw --pack packages/uikit --entrypoints . --format table");
run("size-limit", "npx size-limit");
run("gallery snippets", "node scripts/check-snippets.mjs");
run("docs gate", "node scripts/check-docs.mjs");

console.log("\n✓ packaging gates passed");
