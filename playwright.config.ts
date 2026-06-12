import { defineConfig, devices } from "@playwright/test";

/**
 * The demo shell switches to "real device" mode (full-viewport app, no scaled
 * iPhone frame) at <= 920px, so running at the frame's logical size gives
 * pixel-stable, transform-free rendering.
 */
const FRAME = { width: 402, height: 874 };

/** Smallest real Android Telegram viewport — also the WCAG 1.4.10 reflow width. */
const NARROW = { width: 320, height: 693 };

/**
 * Specs that assert pixels. They run per renderer/density project; everything
 * else (motion, a11y, flows, aria) runs once in `chromium`.
 */
const VISUAL_SPECS = [
  "**/design.spec.ts",
  "**/states.spec.ts",
  "**/tokens.spec.ts",
  "**/contrast-modes.spec.ts",
];

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
      testIgnore: [...VISUAL_SPECS, "**/reduced-motion.spec.ts", "**/reflow.spec.ts", "**/density.spec.ts"],
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
      testMatch: VISUAL_SPECS,
    },
    {
      // Telegram on iOS is a WKWebView: different font rasterization, shadows
      // and backdrop-filter (the glass toasts/header) — webkit matters more
      // than firefox for this kit. forced-colors emulation is unsupported in
      // WebKit, so the contrast-modes spec stays chromium-only.
      name: "visual-webkit",
      use: { ...devices["Desktop Safari"], viewport: FRAME, deviceScaleFactor: 1 },
      testMatch: VISUAL_SPECS.filter((s) => !s.includes("contrast-modes")),
    },
    {
      // WCAG 1.4.10 reflow + small-Android spot checks.
      name: "narrow-320",
      use: { ...devices["Desktop Chrome"], viewport: NARROW, deviceScaleFactor: 1 },
      testMatch: "**/reflow.spec.ts",
    },
    {
      name: "visual-dpr2",
      use: { ...devices["Desktop Chrome"], viewport: FRAME, deviceScaleFactor: 2 },
      testMatch: "**/density.spec.ts",
    },
    {
      name: "visual-dpr3",
      use: { ...devices["Desktop Chrome"], viewport: FRAME, deviceScaleFactor: 3 },
      testMatch: "**/density.spec.ts",
    },
  ],
});
