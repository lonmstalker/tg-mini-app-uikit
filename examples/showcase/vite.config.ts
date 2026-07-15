import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const fromHere = (relativePath: string) =>
  fileURLToPath(new URL(relativePath, import.meta.url));

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".map": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

/*
 * The deployed site nests the prebuilt Storybook and docs next to the landing
 * (/storybook, /docs). Serve those build outputs in dev too, so the header and
 * feature links work locally instead of dead-ending on an MPA 404. When the
 * build output is missing, answer with a hint instead of a blank page.
 */
function serveBuiltStatic(prefix: string, dir: string, buildHint: string): Plugin {
  return {
    name: `showcase-serve-${prefix}`,
    configureServer(server) {
      server.middlewares.use(`/${prefix}`, (req, res) => {
        const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
        const relative = normalize(urlPath).replace(/^([/\\])+/, "");
        let file = join(dir, relative);
        if (!file.startsWith(dir)) {
          res.statusCode = 403;
          res.end("Forbidden");
          return;
        }
        if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
        if (!existsSync(file)) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(
            `<!doctype html><meta charset="utf-8"><title>Not built yet</title>` +
              `<body style="font: 16px/1.6 system-ui; padding: 48px; max-width: 60ch; margin: auto">` +
              `<h1>/${prefix} is not built yet</h1>` +
              `<p>Run <code>${buildHint}</code> once, then reload — the dev server serves the build output from here.</p>`,
          );
          return;
        }
        res.setHeader("Content-Type", MIME[extname(file)] ?? "application/octet-stream");
        createReadStream(file).pipe(res);
      });
    },
  };
}

const uikitPackage = JSON.parse(
  readFileSync(fromHere("../../packages/uikit/package.json"), "utf8"),
) as { version: string };

const sourceAliases = [
  {
    find: "tg-mini-app-uikit/style.css",
    replacement: fromHere("../../packages/uikit/src/tokens/tokens.css"),
  },
  {
    find: "@tg-mini-app/telegram/testing",
    replacement: fromHere("../../packages/telegram/src/testing.ts"),
  },
  {
    find: "@tg-mini-app/telegram",
    replacement: fromHere("../../packages/telegram/src/index.ts"),
  },
  {
    find: "tg-mini-app-uikit",
    replacement: fromHere("../../packages/uikit/src/index.ts"),
  },
];

export default defineConfig({
  base: "/",
  // MPA: dev must 404 unknown paths (/storybook/, /docs/ exist only in the
  // deployed artifact) instead of silently serving the landing for them.
  appType: "mpa",
  define: {
    __TK_PACKAGE_VERSION__: JSON.stringify(uikitPackage.version),
  },
  plugins: [
    react(),
    serveBuiltStatic("storybook", fromHere("../../packages/uikit/storybook-static"), "npm run stories:build"),
    serveBuiltStatic("docs", fromHere("../../docs/site/dist"), "npm run docs:build"),
  ],
  resolve: {
    alias: sourceAliases,
  },
  server: {
    host: "127.0.0.1",
    port: 5175,
  },
  preview: {
    host: "127.0.0.1",
    port: 4175,
  },
  build: {
    sourcemap: true,
    outDir: "dist",
    rollupOptions: {
      input: {
        landing: fromHere("index.html"),
        demo: fromHere("demo/index.html"),
      },
    },
  },
});
