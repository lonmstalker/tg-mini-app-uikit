#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const failures = [];

const mustExist = (path) => {
  if (!existsSync(join(root, path))) failures.push(`missing ${path}`);
};

const read = (path) => {
  const abs = join(root, path);
  if (!existsSync(abs)) return "";
  return readFileSync(abs, "utf8");
};

const mustContain = (path, patterns) => {
  const text = read(path);
  for (const pattern of patterns) {
    const ok = pattern instanceof RegExp ? pattern.test(text) : text.includes(pattern);
    if (!ok) failures.push(`${path} does not contain ${pattern.toString()}`);
  }
};

for (const path of [
  "docs/site/pages/getting-started.md",
  "docs/site/pages/theming.md",
  "docs/site/pages/telegram-platform.md",
  "docs/site/pages/components.md",
  "docs/site/pages/recipes.md",
  "docs/site/pages/api-reference.md",
  "docs/llms-full.md",
  ".github/workflows/docs.yml",
  "CHANGELOG.md",
]) {
  mustExist(path);
}

mustContain("package.json", [
  '"docs:build"',
  '"docs:dev"',
  '"docs:check"',
]);

mustContain("README.md", [
  "Package-local Storybook",
  "Storybook component explorer",
  "Bot API 9.6",
  "zero runtime dependencies",
  "React 19",
  "TelegramUI",
  "Konsta",
  "VKUI",
  "Documentation",
  "llms.txt",
]);

mustContain("llms.txt", ["docs/llms-full.md", "TKNavStack", "useInvoice", "TKCalendar"]);

mustContain("docs/llms-full.md", [
  "Component inventory",
  "Telegram platform hooks",
  "Do not",
  "Reusable pattern examples",
]);

mustContain("docs/site/pages/recipes.md", [
  "Tabbar",
  "keyboard",
  "edge swipes",
  "back priorities",
  "@tg-mini-app/telegram/testing",
]);

mustContain(".github/workflows/docs.yml", ["npm run docs:check", "npm run docs:build"]);

// Coverage: every public component/hook in the API baseline must be mentioned
// in llms-full.md, so the AI reference cannot silently fall behind a release.
{
  const llmsFull = read("docs/llms-full.md");
  const baseline = JSON.parse(read("scripts/api-baseline.json"));
  for (const name of baseline) {
    if (!/^TK[A-Z]|^use[A-Z]/.test(name)) continue; // lowercase tk* helpers, constants, locales
    if (!llmsFull.includes(name)) failures.push(`docs/llms-full.md does not mention ${name}`);
  }
}

mustContain("CHANGELOG.md", ["0.2.0", "forwardRef", "TKLocaleProvider", "breaking"]);
// Version coherence, not a hardcoded pin: every package version must have a
// matching CHANGELOG heading in its own package AND the root release notes.
for (const pkg of ["uikit", "telegram"]) {
  const version = JSON.parse(read(`packages/${pkg}/package.json`)).version;
  mustContain(`packages/${pkg}/CHANGELOG.md`, [`## ${version}`]);
}
mustContain("CHANGELOG.md", [`## ${JSON.parse(read("packages/uikit/package.json")).version}`]);

if (failures.length > 0) {
  console.error("Docs gate failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Docs gate passed");
