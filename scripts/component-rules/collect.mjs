/*
 * Data collection for `npm run check:rules` — see ./index.mjs.
 *
 * One TS program over packages/uikit/src (no build needed) gives the exported
 * component list, each one's props type and its declaration text; the rest is
 * plain text scanning for evidence (tests/stories/docs) and incident IDs.
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();

/** Recursively lists files under `dir` matching `re` (missing dir → []). */
export function walk(dir, re = /\.(tsx?|mdx?|md)$/, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, re, acc);
    else if (re.test(entry.name)) acc.push(p);
  }
  return acc;
}

function program() {
  const configPath = ts.findConfigFile(path.join(root, "packages/uikit"), ts.sys.fileExists, "tsconfig.json");
  if (!configPath) throw new Error("Cannot find packages/uikit/tsconfig.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
  const prog = ts.createProgram(parsed.fileNames, parsed.options);
  return { prog, checker: prog.getTypeChecker() };
}

const GROUPS = ["atoms", "composites", "templates", "foundation", "tokens", "internal"];

/** `atoms/inputs`, `composites`, … — one report file per group, kept small. */
function groupOf(rel) {
  if (rel.includes("packages/telegram/")) return "telegram";
  const seg = rel.split("/");
  const i = seg.indexOf("src");
  const top = seg[i + 1]?.replace(/\.tsx?$/, "");
  if (!GROUPS.includes(top)) return "app";
  const sub = seg[i + 2];
  return sub && !/\.tsx?$/.test(sub) ? `${top}/${sub}` : top;
}

/** Drops comments so text detectors never fire on prose about a trap. */
function strip(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/**
 * `{ prop = <initializer> }` of the component's own parameter list — the only
 * place a default can hide, so JSX attributes never masquerade as one.
 */
function defaultsOf(decl) {
  const out = new Map();
  let params = null;
  const visit = (node) => {
    if (params) return;
    if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) && node.parameters.length) params = node.parameters;
    else ts.forEachChild(node, visit);
  };
  visit(decl);
  const binding = params?.[0]?.name;
  if (binding && ts.isObjectBindingPattern(binding)) {
    for (const el of binding.elements) if (el.initializer) out.set(el.name.getText(), el.initializer.getText());
  }
  return out;
}

/**
 * Every runtime export of the public barrel that renders JSX, with the props
 * type resolved from source. Constants, hooks and type-only exports drop out.
 */
export function collectComponents() {
  const { prog, checker } = program();
  const index = prog.getSourceFile(path.join(root, "packages/uikit/src/index.ts"));
  const moduleSymbol = index && checker.getSymbolAtLocation(index);
  if (!moduleSymbol) throw new Error("Cannot read the uikit barrel exports");

  const out = [];
  for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
    const name = symbol.getName();
    if (!/^[A-Z]/.test(name)) continue;
    const aliased = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    const decl = aliased.valueDeclaration ?? aliased.declarations?.[0];
    if (!decl) continue;

    const type = checker.getTypeOfSymbolAtLocation(aliased, decl);
    const sig = type.getCallSignatures()[0];
    if (!sig) continue; // constants (TK_SPRING, TK_ICON_PATHS)
    if (!/Element|ReactNode|ReactPortal|null/.test(checker.typeToString(sig.getReturnType()))) continue;

    const file = decl.getSourceFile().fileName;
    const rel = path.relative(root, file);
    const param = sig.getParameters()[0];
    const propTypes = new Map();
    const own = new Set(); // declared by the kit, not inherited from @types/react
    let polymorphic = false;
    if (param) {
      const pt = checker.getTypeOfSymbolAtLocation(param, param.valueDeclaration ?? decl);
      polymorphic = !!checker.getIndexInfoOfType(pt, ts.IndexKind.String);
      for (const p of checker.getPropertiesOfType(pt)) {
        const d = p.valueDeclaration ?? p.declarations?.[0];
        propTypes.set(p.getName(), d ? checker.typeToString(checker.getTypeOfSymbolAtLocation(p, d)) : "unknown");
        if (d && !d.getSourceFile().fileName.includes("node_modules")) own.add(p.getName());
      }
    }
    const declText = decl.getFullText();
    const fileText = fs.readFileSync(file, "utf8");
    // JSDoc of a `const` alias hangs off the statement, not the declaration —
    // look just above the declaration instead of trusting getFullText().
    const lead = fileText.slice(Math.max(0, decl.getStart() - 400), decl.getStart());
    out.push({
      name,
      file: rel,
      group: groupOf(rel),
      text: fileText,
      code: strip(fileText),
      decl: declText,
      deprecated: /@deprecated/.test(declText) || /@deprecated/.test(lead),
      declCode: strip(declText),
      rendersDom: /<[a-zA-Z]/.test(strip(declText)),
      props: new Set(propTypes.keys()),
      own,
      propTypes,
      defaults: defaultsOf(decl),
      polymorphic,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

const INCIDENT = /\b(REU|OVL|KB|INT|LST|INP|CC|ONB|NAV|FRM|GES|DEV|SEC|A11Y|CAR|TBL|BTN)-\d+\b/g;

function idsIn(files) {
  const map = new Map();
  for (const f of files) {
    const text = fs.readFileSync(f, "utf8");
    for (const m of text.matchAll(INCIDENT)) {
      if (!map.has(m[0])) map.set(m[0], []);
      map.get(m[0]).push(path.relative(root, f));
    }
  }
  return map;
}

/** Where each component name and incident ID is mentioned outside src. */
export function collectEvidence() {
  const testFiles = [...walk(path.join(root, "packages/uikit/test")), ...walk(path.join(root, "packages/telegram/test"))];
  const e2eFiles = walk(path.join(root, "e2e"));
  const storyFiles = walk(path.join(root, "packages/uikit/storybook"));
  const docFiles = [...walk(path.join(root, "docs")), ...walk(path.join(root, "wiki")), path.join(root, "README.md")]
    // This report is generated FROM the code — counting it as documentation
    // would let every incident ID satisfy its own docs anchor.
    .filter((f) => fs.existsSync(f) && !f.includes("docs/component-checklist"));

  const read = (files) => files.map((f) => ({ f: path.relative(root, f), text: fs.readFileSync(f, "utf8") }));
  const buckets = {
    unit: read(testFiles),
    e2e: read(e2eFiles),
    story: read(storyFiles),
    docs: read(docFiles),
  };
  // C3 evidence is judged by test CONTENT, not file name. The old `*a11y*`
  // filename filter lied in both directions: 36 of the repo's own `[D-A11Y]`
  // tests lived in files without `a11y` in the name (m10n-controls-aria,
  // controls, m4-forms, …) and were invisible, while a bare `import` inside an
  // a11y-named file scored `ok`. Now a component counts as covered when its
  // name appears within ±12 lines of an a11y assertion (role/name/aria/focus/
  // keyboard). Known ceiling: an assertion about a co-rendered NEIGHBOR inside
  // the window over-credits (a TKCell assert 10 lines under a TKVirtualList
  // render). Text matching cannot attribute an assert to its target — the fix
  // is real per-component a11y tests, not a smarter regex.
  const A11Y_ASSERT = /\[D-A11Y\]|ByRole\(|ByLabelText\(|toHaveAccessibleName|toHaveFocus|aria-[a-z]|keyDown|keyUp|\.tab\(|\.keyboard\(/;
  const a11yEvidence = [...buckets.unit, ...buckets.e2e].map(({ text }) => {
    const lines = text.split("\n");
    const prefix = [0];
    for (let i = 0; i < lines.length; i++) prefix.push(prefix[i] + (A11Y_ASSERT.test(lines[i]) ? 1 : 0));
    return { lines, prefix };
  });

  const allowlistFile = path.join(root, "scripts/animatable-props-allowlist.json");
  const animatable = new Set(
    (fs.existsSync(allowlistFile) ? JSON.parse(fs.readFileSync(allowlistFile, "utf8")).entries ?? [] : []).map((e) => e.file),
  );

  return {
    animatable,
    /** True when `name` is referenced as an identifier in that bucket. */
    mentions(bucket, name) {
      const re = new RegExp(`\\b${name}\\b`);
      if (bucket === "a11y")
        return a11yEvidence.some(({ lines, prefix }) =>
          lines.some((l, i) => re.test(l) && prefix[Math.min(lines.length, i + 13)] - prefix[Math.max(0, i - 12)] > 0),
        );
      return buckets[bucket].some((b) => re.test(b.text));
    },
    incidents: {
      test: idsIn([...testFiles, ...e2eFiles]),
      docs: idsIn(docFiles.filter((f) => fs.statSync(f).isFile())),
    },
  };
}
