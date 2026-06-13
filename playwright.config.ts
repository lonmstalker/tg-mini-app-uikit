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
  webServer: {
    command: "npm run stories -w tg-mini-app-uikit",
    url: "http://127.0.0.1:6006",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  testMatch: ["**/*.storybook.spec.ts"],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: FRAME, deviceScaleFactor: 1 },
    },
  ],
});
