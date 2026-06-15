#!/usr/bin/env node
/*
 * Locks the PUBLISHED export surface of tg-mini-app-uikit. Imports the built
 * barrel (dist), lists its named exports, and diffs them against a committed
 * baseline. The M4–M6 extraction must keep this diff empty: consumers still
 * import the same names from the package after the platform/i18n/async code
 * moves into peer packages behind a re-export shim. `--update` re-records.
 *
 * Complements `test/api-surface.test.ts` (which snapshots the SOURCE barrel);
 * this one proves the actual shipped artifact, catching `exports`/build drift.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const distUrl = new URL("../packages/uikit/dist/index.js", import.meta.url);
const baselineFile = fileURLToPath(new URL("./api-baseline.json", import.meta.url));

if (!existsSync(fileURLToPath(distUrl))) {
  console.error("check-api-surface: build the kit first (npm run build -w tg-mini-app-uikit).");
  process.exit(1);
}

const mod = await import(distUrl.href);
const surface = Object.keys(mod).sort();
const update = process.argv.includes("--update");

if (update) {
  writeFileSync(baselineFile, JSON.stringify(surface, null, 2) + "\n");
  console.log(`check-api-surface: recorded ${surface.length} exports as the baseline.`);
  process.exit(0);
}

if (!existsSync(baselineFile)) {
  console.error("check-api-surface: no baseline yet — run `npm run check:api:update` once and commit it.");
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(baselineFile, "utf8"));
const added = surface.filter((e) => !baseline.includes(e));
const removed = baseline.filter((e) => !surface.includes(e));

if (added.length || removed.length) {
  console.error("check-api-surface: the published export surface changed.");
  if (added.length) console.error("  + added:   " + added.join(", "));
  if (removed.length) console.error("  - removed: " + removed.join(", "));
  console.error("If intentional, run `npm run check:api:update` and commit api-baseline.json.");
  process.exit(1);
}

console.log(`check-api-surface: ${surface.length} exports match the baseline ✓`);
