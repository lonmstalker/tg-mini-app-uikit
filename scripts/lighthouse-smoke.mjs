#!/usr/bin/env node
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const docsIndex = join(root, "docs/site/dist/index.html");
const demoIndex = join(root, "examples/demo/dist/index.html");
const demoAssets = join(root, "examples/demo/dist/assets");
const maxChunkBytes = 1_500_000;

if (!existsSync(docsIndex)) throw new Error("docs/site/dist is missing; run npm run docs:build");
if (!existsSync(demoIndex)) throw new Error("examples/demo/dist is missing; run npm run build first");

const chunks = existsSync(demoAssets)
  ? readdirSync(demoAssets)
      .filter((name) => name.endsWith(".js"))
      .map((name) => [name, statSync(join(demoAssets, name)).size])
  : [];
const oversized = chunks.filter(([, size]) => size > maxChunkBytes);
if (oversized.length) {
  throw new Error(`demo Lighthouse smoke budget failed: ${JSON.stringify(oversized)}`);
}

console.log("Docs/demo Lighthouse smoke passed");
