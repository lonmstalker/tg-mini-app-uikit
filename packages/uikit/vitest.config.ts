import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // The demo Telegram mock imports types from the package name;
      // resolve it to the sources so tests never depend on a built dist/.
      "tg-mini-app-uikit": new URL("./src/index.ts", import.meta.url).pathname,
    },
  },
  test: {
    environment: "jsdom",
    css: true,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
  },
});
