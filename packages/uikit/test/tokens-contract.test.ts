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

  it("TYP-001 declares concrete color defaults on the bare .tk block (no data-theme needed)", () => {
    // The base `.tk { ... }` block, before the first themed selector.
    const baseStart = tokensCss.indexOf(".tk {");
    const baseEnd = tokensCss.indexOf('.tk[data-theme="light"]');
    expect(baseStart).toBeGreaterThan(-1);
    expect(baseEnd).toBeGreaterThan(baseStart);
    const baseBlock = tokensCss.slice(baseStart, baseEnd);
    // Each must be declared with a concrete color literal (not only under [data-theme]).
    for (const token of ["--tk-text", "--tk-bg", "--tk-surface", "--tk-text-2", "--tk-text-3"]) {
      expect(baseBlock).toMatch(new RegExp(`${token}:\\s*(#[0-9a-f]{3,8}|rgba?\\()`, "i"));
    }
  });

  it("TYP-001 keeps the themed blocks overriding the base defaults", () => {
    expect(tokensCss).toMatch(/\.tk\[data-theme="light"\][\s\S]*?--tk-text:\s*#/);
    expect(tokensCss).toMatch(/\.tk\[data-theme="dark"\][\s\S]*?--tk-bg:\s*#/);
  });

  it("TYP-009 ships solid fallbacks for color-mix tokens via @supports", () => {
    const m = tokensCss.match(/@supports not \(color: color-mix\(in srgb[\s\S]*?\r?\n\}/);
    expect(m, "missing @supports not (color-mix) fallback block").not.toBeNull();
    const block = m![0];
    for (const token of [
      "--tk-accent-06",
      "--tk-accent-12",
      "--tk-accent-20",
      "--tk-accent-35",
      "--tk-accent-ink",
      "--tk-red-ink",
      "--tk-green-ink",
      "--tk-orange-ink",
      "--tk-surface-2",
      "--tk-surface-3",
      "--tk-glass",
      "--tk-scrim",
    ]) {
      // declared in the fallback block, and NOT with another color-mix() value
      const decl = block.match(new RegExp(`${token}:\\s*([^;]+);`));
      expect(decl, `${token} missing from fallback block`).not.toBeNull();
      expect(decl![1]).not.toContain("color-mix(");
    }
  });

  it("TYP-009 keeps color-mix as the progressive-enhancement primary", () => {
    expect(tokensCss).toMatch(/--tk-accent-ink:\s*color-mix\(/);
  });

  it("TYP-009 fallback gives dark theme its own ink colors", () => {
    const m = tokensCss.match(/@supports not \(color: color-mix\(in srgb[\s\S]*?\r?\n\}/);
    expect(m![0]).toMatch(/\.tk\[data-theme="dark"\]\s*\{[\s\S]*?--tk-accent-ink:/);
  });

  it("CC-09 ships an OS-independent motion-off path keyed on data-tk-motion", () => {
    const m = tokensCss.match(/\.tk\[data-tk-motion="off"\]\s*\{[\s\S]*?\}/);
    expect(m, "missing [data-tk-motion=off] block").not.toBeNull();
    for (const token of ["--tk-t1", "--tk-t2", "--tk-t3"]) {
      expect(m![0]).toMatch(new RegExp(`${token}:\\s*1ms`));
    }
  });

  it("TOK-CONTRACT-013 keeps the package CSS entrypoint available in package exports and build output", () => {
    const packageJson = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8")) as {
      exports?: Record<string, unknown>;
    };

    expect(packageJson.exports?.["./style.css"]).toBe("./dist/style.css");
    expect(readFileSync(join(packageRoot, "dist/style.css"), "utf8")).toContain("--tk-accent");
  });
});
