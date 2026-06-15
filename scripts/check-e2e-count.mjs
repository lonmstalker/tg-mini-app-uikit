#!/usr/bin/env node
/*
 * Floor gate for the Playwright suite. A config regression once narrowed the
 * global `testMatch` so ~20 kit specs matched no project and CI stayed green
 * while validating a third of the suite. This asserts the collected test count
 * never silently drops below a committed floor.
 *
 * The floor is the real executed count (60 Storybook smoke + 45 Trailhead).
 * Raise it when you add suites; lower it only with an explicit, reviewed reason.
 */
import { execSync } from "node:child_process";

const FLOOR = 105;

let out;
try {
  out = execSync("npx playwright test --list", { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
} catch (err) {
  console.error("check-e2e-count: `playwright test --list` failed — the config or a spec did not load.");
  process.exit(1);
}

const m = out.match(/Total:\s+(\d+)\s+tests?/);
if (!m) {
  console.error("check-e2e-count: could not find 'Total: N tests' in the --list output.");
  process.exit(1);
}

const count = Number(m[1]);
if (count < FLOOR) {
  console.error(
    `check-e2e-count: collected ${count} tests, below the floor of ${FLOOR}. ` +
      "A spec or Playwright project likely stopped matching. " +
      "If this drop is intentional, lower FLOOR in scripts/check-e2e-count.mjs in the same change.",
  );
  process.exit(1);
}

console.log(`check-e2e-count: ${count} tests >= floor ${FLOOR} ✓`);
