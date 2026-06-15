import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Resolve the platform peer to its sources (most specific first), so the
      // kit's tests never need a built telegram dist/.
      {
        find: "@tg-mini-app/telegram/testing",
        replacement: new URL("../telegram/src/testing.ts", import.meta.url).pathname,
      },
      {
        find: "@tg-mini-app/telegram",
        replacement: new URL("../telegram/src/index.ts", import.meta.url).pathname,
      },
      {
        find: "tg-mini-app-uikit/style.css",
        replacement: new URL("./src/tokens/tokens.css", import.meta.url).pathname,
      },
      // The demo Telegram mock imports types from the package name;
      // resolve it to the sources so tests never depend on a built dist/.
      {
        find: "tg-mini-app-uikit",
        replacement: new URL("./src/index.ts", import.meta.url).pathname,
      },
    ],
  },
  test: {
    environment: "jsdom",
    css: true,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      thresholds: {
        statements: 90,
        functions: 90,
        lines: 90,
        branches: 75,
      },
    },
  },
});
