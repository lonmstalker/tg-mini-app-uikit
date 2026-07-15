import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const fromHere = (relativePath: string) =>
  fileURLToPath(new URL(relativePath, import.meta.url));

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
  plugins: [react()],
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
