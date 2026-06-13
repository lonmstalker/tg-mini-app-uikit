import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const configPath = ts.findConfigFile(path.join(root, "packages/uikit"), ts.sys.fileExists, "tsconfig.json");

if (!configPath) {
  throw new Error("Cannot find packages/uikit/tsconfig.json");
}

const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const indexPath = path.join(root, "packages/uikit/src/index.ts");
const index = program.getSourceFile(indexPath);

if (!index) {
  throw new Error("Cannot load packages/uikit/src/index.ts");
}

const moduleSymbol = checker.getSymbolAtLocation(index);

if (!moduleSymbol) {
  throw new Error("Cannot read uikit exports");
}

const exports = checker
  .getExportsOfModule(moduleSymbol)
  .filter((symbol) => /^TK[A-Z]/.test(symbol.getName()))
  .filter((symbol) => {
    const aliased = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    return Boolean(aliased.valueDeclaration);
  })
  .map((symbol) => symbol.getName())
  .sort((a, b) => a.localeCompare(b));

const sourceDirs = [
  path.join(root, "examples/demo/stories"),
  path.join(root, "examples/demo/.storybook"),
];
const previewPath = path.join(root, "examples/demo/.storybook/preview.tsx");
const storybookMainPath = path.join(root, "examples/demo/.storybook/main.ts");
const demoPackagePath = path.join(root, "examples/demo/package.json");

function files(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(full);
    return /\.(tsx?|jsx?)$/.test(entry.name) ? [full] : [];
  });
}

const haystack = sourceDirs
  .flatMap(files)
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

const missing = exports.filter((name) => !new RegExp(`\\b${name}\\b`).test(haystack));

if (missing.length) {
  console.error(`Missing TK* story coverage (${missing.length}/${exports.length}):`);
  for (const name of missing) console.error(`- ${name}`);
  process.exit(1);
}

const previewSource = fs.existsSync(previewPath) ? fs.readFileSync(previewPath, "utf8") : "";
const hasProjectAutodocs = /\btags\s*:\s*\[[^\]]*["']autodocs["'][^\]]*\]/s.test(previewSource);

if (!hasProjectAutodocs) {
  console.error("Storybook autodocs are disabled: add tags: ['autodocs'] to examples/demo/.storybook/preview.tsx.");
  process.exit(1);
}

const storybookMainSource = fs.existsSync(storybookMainPath) ? fs.readFileSync(storybookMainPath, "utf8") : "";
if (!storybookMainSource.includes("build/storybook")) {
  console.error("Storybook dev watcher must ignore build/storybook so static builds do not trigger preview HMR reloads.");
  process.exit(1);
}

const demoPackage = JSON.parse(fs.readFileSync(demoPackagePath, "utf8"));
const storiesScript = demoPackage.scripts?.stories ?? "";
for (const flag of ["--host 127.0.0.1", "--exact-port"]) {
  if (!storiesScript.includes(flag)) {
    console.error(`Storybook dev script is not deterministic: examples/demo/package.json scripts.stories must include "${flag}".`);
    process.exit(1);
  }
}

console.log(`Story coverage OK: ${exports.length}/${exports.length} TK* value exports are represented.`);
