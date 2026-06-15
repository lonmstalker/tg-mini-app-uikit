import { defineConfig, devices } from "@playwright/test";

const FRAME = { width: 402, height: 874 };

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  timeout: 30_000,
  expect: {
    timeout: 7_000,
    toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixels: 64 },
  },
  use: {
    baseURL: "http://127.0.0.1:6006",
    viewport: FRAME,
    deviceScaleFactor: 1,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // `webServer` is a top-level array (not per-project): keep the Storybook
  // server for the kit specs and add the Trailhead demo dev server for its own
  // `trailhead` project. Playwright boots both, then each project targets its
  // own baseURL.
  webServer: [
    {
      command: "npm run stories -w tg-mini-app-uikit",
      url: "http://127.0.0.1:6006",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: "npm run dev -w trailhead",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
  testMatch: ["**/*.storybook.spec.ts"],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: FRAME, deviceScaleFactor: 1 },
    },
    {
      // The Trailhead demo's own e2e suite. It overrides `testDir`/`testMatch`
      // (the global `testMatch` is `**/*.storybook.spec.ts`, which would
      // otherwise exclude these specs) and points at the demo dev server.
      name: "trailhead",
      testDir: "./examples/trailhead/e2e",
      testMatch: ["**/*.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: FRAME,
        deviceScaleFactor: 1,
        baseURL: "http://127.0.0.1:5173",
      },
    },
  ],
});
