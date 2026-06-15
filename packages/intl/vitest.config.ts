import { defineConfig } from "vitest/config";

// The engine is pure functions + a thin React provider; the load-bearing logic
// (plurals, message format, language resolution, dates) needs no DOM.
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
