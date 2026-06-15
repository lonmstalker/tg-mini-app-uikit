#!/usr/bin/env node
/*
 * Topological build of the publishable packages: leaves first, the UI layer
 * (uikit, a peer of @tg-mini-app/telegram) last. Packages that don't exist yet
 * are skipped, so this is correct today (uikit only) and after the M4–M6 split.
 * Examples are excluded — the demo builds via its own workspace command.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ORDER = ["telegram", "intl", "async", "uikit"];

for (const pkg of ORDER) {
  const manifest = fileURLToPath(new URL(`../packages/${pkg}/package.json`, import.meta.url));
  if (!existsSync(manifest)) continue;
  console.log(`\n▸ building packages/${pkg}`);
  execFileSync("npm", ["run", "build", "-w", `packages/${pkg}`, "--if-present"], { stdio: "inherit" });
}
