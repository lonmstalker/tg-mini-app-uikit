/// <reference types="vitest/config" />
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/*
 * Two resolution modes for the kit (see ExecPlan Decision Log):
 *
 *  - default (dev + unit + e2e): alias the bare import to the kit *source* for
 *    instant HMR, the stylesheet to the source tokens, and the mock to the
 *    test-support file.
 *  - TRAILHEAD_USE_DIST=1 (prod-parity, M6): resolve `tg-mini-app-uikit` and
 *    `tg-mini-app-uikit/style.css` through the workspace symlink to the
 *    published `dist/` + its `exports` map — proving the package teams actually
 *    consume. The `tg-mini-app-uikit/testing` mock stays a source alias: per the
 *    Decision Log fallback it is a dev/test utility, not a production export, so
 *    it is the one specifier kept aliased even in dist-parity.
 */
const useDist = process.env.TRAILHEAD_USE_DIST === "1";

const fromHere = (rel: string) => fileURLToPath(new URL(rel, import.meta.url));

const testingAlias = {
  find: "tg-mini-app-uikit/testing",
  replacement: fromHere("../../packages/uikit/test/support/telegram/mock.ts"),
};

const sourceAliases = [
  {
    find: "tg-mini-app-uikit/style.css",
    replacement: fromHere("../../packages/uikit/src/tokens/tokens.css"),
  },
  testingAlias,
  {
    find: "tg-mini-app-uikit",
    replacement: fromHere("../../packages/uikit/src/index.ts"),
  },
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    // In dist-parity, only the testing-mock specifier stays aliased.
    alias: useDist ? [testingAlias] : sourceAliases,
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
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
