import { defineConfig, devices } from "@playwright/test";

/**
 * The demo shell switches to "real device" mode (full-viewport app, no scaled
 * iPhone frame) at <= 920px, so running at the frame's logical size gives
 * pixel-stable, transform-free rendering.
 */
const FRAME = { width: 402, height: 874 };

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  // Visual baselines are generated on darwin; system fonts and emoji render
  // differently on linux CI, so CI executes the visual flows but skips the
  // pixel comparison. Linux baselines can be added later via the Playwright
  // Docker image without renames (default snapshot names embed the platform).
  ignoreSnapshots: !!process.env.CI,
  timeout: 30_000,
  expect: {
    timeout: 7_000,
    toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixels: 64 },
  },
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: FRAME,
    deviceScaleFactor: 1,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev -w tg-mini-app-uikit-demo -- --host 127.0.0.1 --port 5173 --strictPort",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: FRAME, deviceScaleFactor: 1 },
      testIgnore: ["**/design.spec.ts", "**/reduced-motion.spec.ts"],
    },
    {
      name: "reduced-motion",
      use: {
        ...devices["Desktop Chrome"],
        viewport: FRAME,
        deviceScaleFactor: 1,
        // Since Playwright 1.60 `reducedMotion` lives in contextOptions.
        contextOptions: { reducedMotion: "reduce" },
      },
      testMatch: "**/reduced-motion.spec.ts",
    },
    {
      name: "visual",
      use: { ...devices["Desktop Chrome"], viewport: FRAME, deviceScaleFactor: 1 },
      testMatch: "**/design.spec.ts",
    },
  ],
});
