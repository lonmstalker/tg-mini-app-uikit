#!/usr/bin/env node
/**
 * Post-build fixes for the emitted declarations: rewrite relative specifiers
 * with explicit `.js` (node16 ESM), and emit a CommonJS-flavored `.d.cts`.
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
  text = text.replace(/(from\s+")(\.\.?\/[^"]+)(")/g, (_, a, spec, z) => a + addJsExt(spec) + z);
  text = text.replace(/(import\(")(\.\.?\/[^"]+)("\))/g, (_, a, spec, z) => a + addJsExt(spec) + z);
  writeFileSync(file, text);
}

writeFileSync(join(dist, "index.d.cts"), 'export * from "./index.js";\n');

console.log(`✓ types post-processed: ${dtsFiles.length} d.ts rewritten, index.d.cts emitted`);
