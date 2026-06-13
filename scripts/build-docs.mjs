#!/usr/bin/env node
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pagesDir = join(root, "docs/site/pages");
const outDir = join(root, "docs/site/dist");

const pages = [
  ["Getting Started", "getting-started.md", "index.html"],
  ["Theming", "theming.md", "theming.html"],
  ["Telegram Platform", "telegram-platform.md", "telegram-platform.html"],
  ["Components", "components.md", "components.html"],
  ["API Reference", "api-reference.md", "api-reference.html"],
  ["Recipes", "recipes.md", "recipes.html"],
];

const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function inline(text) {
  return escape(text)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function markdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  const html = [];
  let inCode = false;
  let code = [];
  let list = [];
  const flushList = () => {
    if (!list.length) return;
    html.push("<ul>", ...list.map((item) => `<li>${inline(item)}</li>`), "</ul>");
    list = [];
  };
  const flushCode = () => {
    html.push(`<pre><code>${escape(code.join("\n"))}</code></pre>`);
    code = [];
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) flushCode();
      else flushList();
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }
    if (!line.trim()) {
      flushList();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      continue;
    }
    flushList();
    html.push(`<p>${inline(line)}</p>`);
  }
  flushList();
  if (inCode) flushCode();
  return html.join("\n");
}

function pageShell(title, body) {
  const nav = pages
    .map(([label, , out]) => `<a href="./${out}">${label}</a>`)
    .join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escape(title)} · tg-mini-app-uikit</title>
  <link rel="stylesheet" href="./style.css" />
</head>
<body>
  <aside><strong>tg-mini-app-uikit</strong>${nav}</aside>
  <main>${body}</main>
</body>
</html>`;
}

async function writeStyle() {
  await writeFile(
    join(outDir, "style.css"),
    `:root{color-scheme:light dark;font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#101820;color:#edf3f8}body{margin:0;display:grid;grid-template-columns:260px 1fr;min-height:100vh}aside{position:sticky;top:0;height:100vh;padding:28px 22px;background:#151f2a;border-right:1px solid #263442;box-sizing:border-box}aside strong{display:block;margin-bottom:18px}aside a{display:block;color:#9dc8ff;text-decoration:none;padding:7px 0}main{max-width:860px;padding:42px 48px}h1,h2,h3{line-height:1.18;letter-spacing:0;margin:0 0 14px}p,ul,pre{margin:0 0 18px}li{margin:7px 0}code{background:#223040;border-radius:5px;padding:1px 5px}pre{overflow:auto;background:#0b1118;border:1px solid #263442;border-radius:8px;padding:16px}a{color:#82bdff}@media(max-width:780px){body{display:block}aside{position:static;height:auto}main{padding:28px 20px}}`,
  );
}

export async function buildDocs() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  for (const [title, file, out] of pages) {
    const md = await readFile(join(pagesDir, file), "utf8");
    await writeFile(join(outDir, out), pageShell(title, markdownToHtml(md)));
  }
  const gif = join(root, "docs/demo.gif");
  if (existsSync(gif)) await copyFile(gif, join(outDir, basename(gif)));
  console.log(`Built docs to ${outDir}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildDocs().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
