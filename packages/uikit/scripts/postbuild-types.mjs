#!/usr/bin/env node
/**
 * Post-build fixes for the emitted type declarations:
 * 1. tsc preserves the side-effect `import "./styles/tokens.css"` in
 *    dist/index.d.ts, but the bundled stylesheet lives at dist/style.css —
 *    the dangling import breaks node16 type resolution (attw
 *    InternalResolutionError). Styles are consumed via the
 *    "tg-mini-app-uikit/style.css" export, so drop the import.
 * 2. The package is `"type": "module"`, so node16 ESM resolution needs
 *    explicit `.js` extensions on relative specifiers — tsc keeps the
 *    extensionless source form, rewrite them.
 * 3. CJS consumers (`require`) need CommonJS-flavored types: emit
 *    dist/index.d.cts re-exporting the same declarations.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const dist = fileURLToPath(new URL("../dist", import.meta.url));

const dtsFiles = readdirSync(dist, { recursive: true, encoding: "utf8" })
  .filter((f) => f.endsWith(".d.ts"))
  .map((f) => join(dist, f));

const addJsExt = (spec) => (/\.[cm]?js$/.test(spec) ? spec : `${spec}.js`);

for (const file of dtsFiles) {
  let text = readFileSync(file, "utf8");
  text = text.replace(/^import\s+"\.\/styles\/tokens\.css";\s*\n/m, "");
  // `from "./x"` / `from "../x"` and dynamic `import("./x")`
  text = text.replace(/(from\s+")(\.\.?\/[^"]+)(")/g, (_, a, spec, z) => a + addJsExt(spec) + z);
  text = text.replace(/(import\(")(\.\.?\/[^"]+)("\))/g, (_, a, spec, z) => a + addJsExt(spec) + z);
  writeFileSync(file, text);
}

writeFileSync(join(dist, "index.d.cts"), 'export * from "./index.js";\n');

console.log(`✓ types post-processed: ${dtsFiles.length} d.ts rewritten, index.d.cts emitted`);
