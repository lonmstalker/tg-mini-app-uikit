import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const testDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(testDir, "..");
const repoRoot = resolve(packageRoot, "../..");
const tokensPath = join(packageRoot, "src/tokens/tokens.css");
const tokensCss = readFileSync(tokensPath, "utf8");

const declarationPattern = /(--tk-[\w-]+)\s*:/g;
const referencePattern = /var\(\s*(--tk-[\w-]+)(?!\$)/g;
const telegramReferencePattern = /var\(\s*(--tg-theme-[\w-]+)/g;

function collectMatches(input: string, pattern: RegExp): Set<string> {
  const matches = new Set<string>();
  for (const match of input.matchAll(pattern)) {
    matches.add(match[1]);
  }
  return matches;
}

function collectFiles(root: string): string[] {
  if (!existsSync(root)) return [];

  const result: string[] = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      result.push(...collectFiles(path));
      continue;
    }

    if ([".css", ".md", ".ts", ".tsx"].includes(extname(path))) {
      result.push(path);
    }
  }
  return result;
}

const declaredTokens = collectMatches(tokensCss, declarationPattern);

const localTokenAllowlist = new Set([
  "--tk-search-collapsed",
  "--tk-search-expanded",
  "--tk-popper-offset",
  "--tk-pulse-ring",
  "--tk-pulse-scale",
  "--tk-story-gap",
  "--tk-story-pad",
  "--tk-tabbar-h",
]);

function expectDeclared(names: string[]) {
  expect(names.filter((name) => !declaredTokens.has(name))).toEqual([]);
}

describe("design token contract", () => {
  it("TOK-CONTRACT-001 declares core runtime variables", () => {
    expectDeclared(["--tk-accent", "--tk-rx", "--tk-ms", "--tk-fz", "--tk-spring", "--tk-ease"]);
  });

  it("TOK-CONTRACT-002 declares all radius variables", () => {
    expectDeclared(["--tk-r-xs", "--tk-r-sm", "--tk-r-md", "--tk-r-lg", "--tk-r-xl", "--tk-r-pill"]);
  });

  it("TOK-CONTRACT-003 declares all typography size variables", () => {
    expectDeclared([
      "--tk-fz-caption2",
      "--tk-fz-caption",
      "--tk-fz-footnote",
      "--tk-fz-sub",
      "--tk-fz-body",
      "--tk-fz-title3",
      "--tk-fz-title2",
      "--tk-fz-title1",
      "--tk-fz-large",
    ]);
  });

  it("TOK-CONTRACT-004 declares the spacing scale", () => {
    expectDeclared(Array.from({ length: 8 }, (_, index) => `--tk-sp-${index + 1}`));
  });

  it("TOK-CONTRACT-005 declares all z-index variables", () => {
    expectDeclared([
      "--tk-z-base",
      "--tk-z-sticky",
      "--tk-z-header",
      "--tk-z-overlay",
      "--tk-z-sheet",
      "--tk-z-dialog",
      "--tk-z-toast",
      "--tk-z-tooltip",
      "--tk-z-dropdown",
      "--tk-z-popper",
    ]);
  });

  it("TOK-CONTRACT-006 declares all safe-area variables", () => {
    expectDeclared(["--tk-safe-top", "--tk-safe-bottom", "--tk-safe-left", "--tk-safe-right"]);
  });

  it("TOK-CONTRACT-007 declares semantic color variables", () => {
    expectDeclared([
      "--tk-bg",
      "--tk-surface",
      "--tk-surface-2",
      "--tk-surface-3",
      "--tk-text",
      "--tk-text-2",
      "--tk-text-3",
      "--tk-sep",
      "--tk-on-accent",
      "--tk-green",
      "--tk-red",
      "--tk-orange",
      "--tk-green-12",
      "--tk-red-12",
      "--tk-orange-12",
    ]);
  });

  it("TOK-CONTRACT-008 maps Telegram theme aliases", () => {
    expect([...collectMatches(tokensCss, telegramReferencePattern)].sort()).toEqual([
      "--tg-theme-button-color",
      "--tg-theme-button-text-color",
      "--tg-theme-destructive-text-color",
      "--tg-theme-hint-color",
      "--tg-theme-secondary-bg-color",
      "--tg-theme-section-bg-color",
      "--tg-theme-section-separator-color",
      "--tg-theme-subtitle-text-color",
      "--tg-theme-text-color",
    ]);
  });

  it("TOK-CONTRACT-009 declares accent overlays and focus variables", () => {
    expectDeclared([
      "--tk-accent-06",
      "--tk-accent-12",
      "--tk-accent-20",
      "--tk-accent-35",
      "--tk-accent-grad",
      "--tk-accent-ink",
      "--tk-red-ink",
      "--tk-green-ink",
      "--tk-orange-ink",
      "--tk-ring",
    ]);
  });

  it("TOK-CONTRACT-010 declares elevation and scrim variables", () => {
    expectDeclared(["--tk-shadow-sm", "--tk-shadow-md", "--tk-shadow-lg", "--tk-glass", "--tk-scrim"]);
  });

  it("TOK-CONTRACT-011 has no undeclared --tk references outside intentional local variables", () => {
    const files = [
      ...collectFiles(join(packageRoot, "src")),
      ...collectFiles(join(packageRoot, "storybook")),
      ...collectFiles(join(repoRoot, "docs/site/pages")),
    ];

    const undeclaredReferences = files.flatMap((file) => {
      const references = collectMatches(readFileSync(file, "utf8"), referencePattern);
      return [...references]
        .filter((name) => !declaredTokens.has(name) && !localTokenAllowlist.has(name))
        .map((name) => `${relative(repoRoot, file)}: ${name}`);
    });

    expect(undeclaredReferences.sort()).toEqual([]);
  });

  it("TOK-CONTRACT-012 keeps --tk-separator as an intentional alias for --tk-sep", () => {
    expect(declaredTokens.has("--tk-sep")).toBe(true);
    expect(declaredTokens.has("--tk-separator")).toBe(true);
    expect(tokensCss).toMatch(/--tk-separator:\s*var\(--tk-sep\)/);
  });

  it("TOK-CONTRACT-013 keeps the package CSS entrypoint available in package exports and build output", () => {
    const packageJson = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8")) as {
      exports?: Record<string, unknown>;
    };

    expect(packageJson.exports?.["./style.css"]).toBe("./dist/style.css");
    expect(readFileSync(join(packageRoot, "dist/style.css"), "utf8")).toContain("--tk-accent");
  });
});
