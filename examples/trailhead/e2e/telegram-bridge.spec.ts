import { expect, test, type Page } from "@playwright/test";
import { passOnboarding } from "./helpers";

type MainButtonParams = {
  is_visible?: boolean;
  is_active?: boolean;
  text?: string;
  color?: string;
  text_color?: string;
  has_shine_effect?: boolean;
  position?: string;
};

type BridgeScheme = "light" | "dark";

const THEME_PARAMS: Record<BridgeScheme, Record<string, string>> = {
  light: {
    bg_color: "#f8f7f4",
    text_color: "#1f2528",
    hint_color: "#6e777d",
    button_color: "#246b5a",
    button_text_color: "#f8f7f4",
    secondary_bg_color: "#ece9e1",
  },
  dark: {
    bg_color: "#17212b",
    text_color: "#f3f6f9",
    hint_color: "#95a3b2",
    button_color: "#3390ec",
    button_text_color: "#ffffff",
    secondary_bg_color: "#0e1621",
  },
};

declare global {
  interface Window {
    Telegram?: {
      WebApp: Record<string, unknown>;
    };
    __trailheadTelegramProbe?: {
      mainParams: MainButtonParams[];
      mainClicks: (() => void)[];
      backShows: number;
      backHides: number;
      backClicks: (() => void)[];
      haptics: string[];
      readyCalls: number;
    };
  }
}

async function installTelegramBridgeProbe(page: Page, colorScheme: BridgeScheme = "light") {
  await page.addInitScript((config) => {
    const { colorScheme, themeParams } = config as {
      colorScheme: BridgeScheme;
      themeParams: Record<string, string>;
    };
    const probe = {
      mainParams: [] as MainButtonParams[],
      mainClicks: [] as (() => void)[],
      backShows: 0,
      backHides: 0,
      backClicks: [] as (() => void)[],
      haptics: [] as string[],
      readyCalls: 0,
    };

    window.__trailheadTelegramProbe = probe;
    window.Telegram = {
      WebApp: {
        version: "9.6",
        platform: "ios",
        colorScheme,
        themeParams,
        initDataUnsafe: {
          user: { id: 42, first_name: "Real", language_code: "en" },
        },
        ready: () => {
          probe.readyCalls += 1;
        },
        expand: () => undefined,
        isExpanded: true,
        MainButton: {
          onClick: (handler: () => void) => {
            probe.mainClicks.push(handler);
          },
          offClick: (handler: () => void) => {
            probe.mainClicks = probe.mainClicks.filter((item) => item !== handler);
          },
          setParams: (params: MainButtonParams) => {
            probe.mainParams.push(params);
          },
          hide: () => {
            probe.mainParams.push({ is_visible: false });
          },
          hideProgress: () => undefined,
        },
        BackButton: {
          show: () => {
            probe.backShows += 1;
          },
          hide: () => {
            probe.backHides += 1;
          },
          onClick: (handler: () => void) => {
            probe.backClicks.push(handler);
          },
          offClick: (handler: () => void) => {
            probe.backClicks = probe.backClicks.filter((item) => item !== handler);
          },
        },
        HapticFeedback: {
          impactOccurred: (style: string) => probe.haptics.push(`impact:${style}`),
          notificationOccurred: (type: string) => probe.haptics.push(`notification:${type}`),
          selectionChanged: () => probe.haptics.push("selection"),
        },
        onEvent: () => undefined,
        offEvent: () => undefined,
      },
    };
  }, { colorScheme, themeParams: THEME_PARAMS[colorScheme] });
}

test("telegram bridge: real WebApp path uses native chrome instead of browser fallbacks", async ({ page }) => {
  await installTelegramBridgeProbe(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?fast=1");
  await passOnboarding(page);

  await expect(page.getByTestId("mock-badge")).toHaveCount(0);

  await page.getByTestId("feed-card-sunrise-ridge").click();
  await expect(page.getByTestId("panel-discover-detail")).toBeVisible();
  await expect(page.getByTestId("mock-back")).toHaveCount(0);
  await expect(page.getByTestId("detail-book")).toHaveCount(0);

  await expect.poll(() => page.evaluate(() => window.__trailheadTelegramProbe?.backShows ?? 0)).toBeGreaterThan(0);
  await expect.poll(() =>
    page.evaluate(() => window.__trailheadTelegramProbe?.mainParams.some((params) => params.text === "Book — 450 Stars")),
  ).toBe(true);

  await page.evaluate(() => {
    const clicks = window.__trailheadTelegramProbe?.backClicks ?? [];
    const handler = clicks[clicks.length - 1];
    if (!handler) throw new Error("native BackButton handler was not registered");
    handler();
  });
  await expect(page.getByTestId("panel-discover-feed")).toBeVisible();
  await expect.poll(() =>
    page.evaluate(() => window.__trailheadTelegramProbe?.mainParams.some((params) => params.is_visible === false) ?? false),
  ).toBe(true);

  await page.getByTestId("feed-card-sunrise-ridge").click();
  await expect(page.getByTestId("panel-discover-detail")).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__trailheadTelegramProbe?.mainClicks.length ?? 0)).toBeGreaterThan(0);
  await page.evaluate(() => {
    const clicks = window.__trailheadTelegramProbe?.mainClicks ?? [];
    const handler = clicks[clicks.length - 1];
    if (!handler) throw new Error("native MainButton handler was not registered");
    handler();
  });
  await expect(page.getByTestId("panel-discover-datetime")).toBeVisible();
  await expect.poll(() =>
    page.evaluate(() =>
      window.__trailheadTelegramProbe?.mainParams.some(
        (params) => params.text === "Select a time to continue" && params.is_active === false,
      ),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "07:00" }).click();
  await expect.poll(() =>
    page.evaluate(() =>
      window.__trailheadTelegramProbe?.mainParams.some(
        (params) => params.text === "Continue — 1 Stars" && params.is_active === true,
      ),
    ),
  ).toBe(true);
  await expect.poll(() =>
    page.evaluate(() => window.__trailheadTelegramProbe?.haptics.includes("selection") ?? false),
  ).toBe(true);
});

test("telegram bridge: native Continue ignores clicks until a time is selected", async ({ page }) => {
  await installTelegramBridgeProbe(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?fast=1");
  await passOnboarding(page);

  await page.getByTestId("feed-card-sunrise-ridge").click();
  await expect(page.getByTestId("panel-discover-detail")).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__trailheadTelegramProbe?.mainClicks.length ?? 0)).toBeGreaterThan(0);
  await page.evaluate(() => {
    const clicks = window.__trailheadTelegramProbe?.mainClicks ?? [];
    const handler = clicks[clicks.length - 1];
    if (!handler) throw new Error("native Book handler was not registered");
    handler();
  });
  await expect(page.getByTestId("panel-discover-datetime")).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__trailheadTelegramProbe?.mainClicks.length ?? 0)).toBeGreaterThan(0);
  await expect.poll(() =>
    page.evaluate(() =>
      window.__trailheadTelegramProbe?.mainParams.some(
        (params) => params.text === "Select a time to continue" && params.is_active === false,
      ),
    ),
  ).toBe(true);

  await page.evaluate(() => {
    const clicks = window.__trailheadTelegramProbe?.mainClicks ?? [];
    const handler = clicks[clicks.length - 1];
    if (!handler) throw new Error("native Continue handler was not registered");
    handler();
  });
  await expect(page.getByTestId("panel-discover-datetime")).toBeVisible();
  await expect(page.getByTestId("panel-discover-summary")).toHaveCount(0);

  await page.getByRole("button", { name: "07:00" }).click();
  await expect.poll(() =>
    page.evaluate(() =>
      window.__trailheadTelegramProbe?.mainParams.some(
        (params) => params.text === "Continue — 1 Stars" && params.is_active === true,
      ),
    ),
  ).toBe(true);
  await page.evaluate(() => {
    const clicks = window.__trailheadTelegramProbe?.mainClicks ?? [];
    const handler = clicks[clicks.length - 1];
    if (!handler) throw new Error("native Continue handler was not registered");
    handler();
  });
  await expect(page.getByTestId("panel-discover-summary")).toBeVisible();
});

test("telegram bridge: real Mini App follows client appearance and hides the local theme switch", async ({ page }) => {
  await installTelegramBridgeProbe(page, "dark");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?fast=1");
  await passOnboarding(page);

  await expect(page.getByTestId("app-root")).toHaveAttribute("data-theme", "dark");
  await page.getByTestId("tabbar").getByRole("button", { name: "Profile" }).click();
  await page.getByTestId("open-lab").click();
  await expect(page.getByTestId("panel-profile-lab")).toBeVisible();
  await expect(page.getByTestId("lab-appearance")).toHaveCount(0);
});
