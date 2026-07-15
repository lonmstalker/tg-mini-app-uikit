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
  // server for the kit specs and add one dev server for each demo project.
  // Playwright boots all of them, then each project targets its own baseURL.
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
    {
      command: "npm run dev -w surface-composer",
      url: "http://127.0.0.1:5174",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: "npm run dev -w showcase",
      url: "http://127.0.0.1:5175",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
  projects: [
    {
      // The kit's own specs (Storybook smoke coverage at :6006). Matches every
      // spec under `testDir` (`./e2e`) — not just `*.storybook.spec.ts` — so a
      // newly added kit spec runs instead of silently matching no project.
      name: "chromium",
      testMatch: ["**/*.spec.ts"],
      use: { ...devices["Desktop Chrome"], viewport: FRAME, deviceScaleFactor: 1 },
    },
    {
      // The Trailhead demo's own e2e suite. It overrides `testDir` to the demo's
      // own spec folder (so the `chromium` project above never picks these up)
      // and points at the demo dev server.
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
    {
      // The Surface Composer demo's own e2e suite. Overrides `testDir` to the
      // demo's spec folder (so `chromium` never picks these up) and targets its
      // own dev server at :5174.
      name: "surface-composer",
      testDir: "./examples/surface-composer/e2e",
      testMatch: ["**/*.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: FRAME,
        deviceScaleFactor: 1,
        baseURL: "http://127.0.0.1:5174",
      },
    },
    {
      // The showcase landing's fast smoke suite targets its dedicated Vite
      // server and stays isolated from the package Storybook specs.
      name: "showcase",
      testDir: "./examples/showcase/e2e",
      testMatch: ["**/*.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: FRAME,
        deviceScaleFactor: 1,
        baseURL: "http://127.0.0.1:5175",
      },
    },
  ],
});
