/// <reference types="vitest/config" />
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/*
 * Two resolution modes for the kit (mirrors trailhead):
 *
 *  - default (dev + unit + e2e): alias the bare import to the kit *source* for
 *    instant HMR, the stylesheet to the source tokens, the mock to the
 *    test-support file.
 *  - SURFACE_COMPOSER_USE_DIST=1 (prod-parity): resolve `tg-mini-app-uikit` and
 *    `tg-mini-app-uikit/style.css` through the workspace symlink to the
 *    published `dist/` + its `exports` map. The `/testing` mock stays a source
 *    alias (a dev/test utility, not a production export).
 */
const useDist = process.env.SURFACE_COMPOSER_USE_DIST === "1";

const fromHere = (rel: string) => fileURLToPath(new URL(rel, import.meta.url));

const testingAlias = {
  find: "@tg-mini-app/telegram/testing",
  replacement: fromHere("../../packages/telegram/src/testing.ts"),
};

const sourceAliases = [
  {
    find: "tg-mini-app-uikit/style.css",
    replacement: fromHere("../../packages/uikit/src/tokens/tokens.css"),
  },
  testingAlias,
  {
    find: "@tg-mini-app/telegram",
    replacement: fromHere("../../packages/telegram/src/index.ts"),
  },
  {
    find: "@tg-mini-app/intl",
    replacement: fromHere("../../packages/intl/src/index.ts"),
  },
  {
    find: "@tg-mini-app/async",
    replacement: fromHere("../../packages/async/src/index.ts"),
  },
  {
    find: "tg-mini-app-uikit",
    replacement: fromHere("../../packages/uikit/src/index.ts"),
  },
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: useDist ? [testingAlias] : sourceAliases,
  },
  server: {
    host: "127.0.0.1",
    port: 5174,
  },
  preview: {
    host: "127.0.0.1",
    port: 4174,
  },
  build: {
    sourcemap: true,
    outDir: "dist",
  },
  test: {
    environment: "jsdom",
    css: true,
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // e2e specs live under e2e/ and run via the root Playwright config.
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
});
