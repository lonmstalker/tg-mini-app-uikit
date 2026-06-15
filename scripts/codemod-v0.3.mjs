#!/usr/bin/env node
/*
 * Codemod for tg-mini-app-uikit 0.3.0. Two safe rewrites over .ts/.tsx files:
 *
 *   1. `from "tg-mini-app-uikit/testing"` → `from "@tg-mini-app/telegram/testing"`
 *      (the dev/test mock moved to the platform package's subpath).
 *   2. Platform symbols imported from `tg-mini-app-uikit` are moved to a second
 *      import from `@tg-mini-app/telegram`. Conservative: only names in the
 *      known platform set move; anything else stays on the kit (whose shim still
 *      re-exports it), so an incomplete list can never break a build.
 *
 * Usage: node scripts/codemod-v0.3.mjs <dir>   (defaults to "src"; --dry to preview)
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TELEGRAM = new Set([
  // provider / access / events
  "TKTelegramProvider", "useWebApp", "getTelegramWebApp", "useTelegramEvent",
  "useBackIntercept", "useBackDispatcher", "useOptionalHaptics",
  // layout / theme / viewport
  "useSafeArea", "useViewport", "useTelegramTheme", "useKeyboard", "useVerticalSwipes",
  // buttons
  "useBackButton", "useMainButton", "useSecondaryButton", "useSettingsButton",
  "useHaptics", "useTelegramPopup",
  // storage / identity / capabilities / device
  "useCloudStorage", "useInitData", "useClosingConfirmation", "useDeviceStorage",
  "useSecureStorage", "useBiometrics", "useLocation", "useQrScanner",
  // types
  "TelegramWebApp", "TKTheme", "TKHaptics", "TKPopup", "TKNativeButtonParams",
  "TKCloudStorage", "TKInitData", "TelegramThemeParams", "TelegramUser",
]);

const dryRun = process.argv.includes("--dry");
const root = process.argv.find((a, i) => i >= 2 && !a.startsWith("--")) ?? "src";

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.tsx?$/.test(full)) yield full;
  }
}

const IMPORT_RE = /import\s+(type\s+)?\{([^}]*)\}\s+from\s+["']tg-mini-app-uikit["'];?/g;
let changed = 0;

for (const file of walk(root)) {
  let text = readFileSync(file, "utf8");
  const before = text;

  text = text.replace(/(["'])tg-mini-app-uikit\/testing\1/g, '$1@tg-mini-app/telegram/testing$1');

  text = text.replace(IMPORT_RE, (whole, typeKw = "", names) => {
    const parsed = names.split(",").map((n) => n.trim()).filter(Boolean);
    const tg = parsed.filter((n) => TELEGRAM.has(n.replace(/^type\s+/, "")));
    const ui = parsed.filter((n) => !TELEGRAM.has(n.replace(/^type\s+/, "")));
    if (tg.length === 0) return whole; // nothing platform-y here
    const kw = typeKw ? "type " : "";
    const tgLine = `import ${kw}{ ${tg.join(", ")} } from "@tg-mini-app/telegram";`;
    return ui.length ? `import ${kw}{ ${ui.join(", ")} } from "tg-mini-app-uikit";\n${tgLine}` : tgLine;
  });

  if (text !== before) {
    changed++;
    if (dryRun) console.log(`would update ${file}`);
    else writeFileSync(file, text);
  }
}

console.log(`${dryRun ? "Would update" : "Updated"} ${changed} file(s) under ${root}.`);
