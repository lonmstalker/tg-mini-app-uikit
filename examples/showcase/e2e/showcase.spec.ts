import { expect, test, type Page } from "@playwright/test";
import { TELEGRAM_DEMO_URL } from "../src/shared/links";

const INSTALL_COMMAND = "npm i tg-mini-app-uikit";

async function openDemo(page: Page) {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/demo/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

async function openLanding(page: Page) {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

test("demo renders without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await openDemo(page);
  await expect(page.locator(".showcase-phone-screen")).toBeVisible();
  await expect(page.getByTestId("browser-demo-notice")).toContainText(
    "the kit runs fully without Telegram",
  );
  await expect(page.getByRole("link", { name: "Open in Telegram" })).toHaveAttribute(
    "href",
    TELEGRAM_DEMO_URL,
  );
  expect(errors).toEqual([]);
});

test("demo header theme toggle updates the provider theme", async ({ page }) => {
  await openDemo(page);
  const root = page.getByTestId("showcase-root");

  await expect(root).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(root).toHaveAttribute("data-theme", "light");
});

test("demo locale switch updates site and kit-owned strings together", async ({ page }) => {
  await openDemo(page);

  await page.getByTestId("site-locale-ru").click();

  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.getByTestId("browser-demo-notice")).toContainText(
    "UIKit полноценно работает и без Telegram",
  );
  await page.getByTestId("locale-demo-cluster").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("locale-demo-cluster")).toContainText("Не пришёл код?");
  await expect(page.getByTestId("locale-demo-cluster")).toContainText("Отправить ещё раз");
});

test("demo bento ImageViewer opens and closes", async ({ page }) => {
  await openDemo(page);
  await page.getByTestId("component-tile-image-viewer").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("lazy-image-viewer")).toHaveAttribute("data-lazy-state", "mounted");

  await page.getByTestId("image-preview-0").click();
  const viewer = page.getByTestId("bento-image-viewer");
  await expect(viewer).toBeVisible();
  await viewer.getByRole("button", { name: "Close" }).click();
  await expect(viewer).toBeHidden();
});

test("demo accent preset repaints the hero phone frame", async ({ page }) => {
  await openDemo(page);
  const phone = page.locator(".showcase-phone-screen");
  const accent = () => phone.evaluate((node) => getComputedStyle(node).getPropertyValue("--tk-accent").trim());
  const initialAccent = await accent();

  await page.getByTestId("tweaks-panel").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Use Green accent" }).click();
  await expect.poll(accent).not.toBe(initialAccent);
});

test("landing renders without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await openLanding(page);
  await expect(page.locator(".landing-phone")).toBeVisible();
  expect(errors).toEqual([]);
});

test("landing live demo CTA opens the demo page", async ({ page }) => {
  await openLanding(page);

  await expect(page.getByTestId("landing-telegram-cta")).toHaveAttribute(
    "href",
    TELEGRAM_DEMO_URL,
  );

  await page.getByTestId("landing-demo-cta").click();

  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "iOS-flavored UI kit for Telegram Mini Apps",
    }),
  ).toBeVisible();
});

test("landing theme toggle updates the provider theme", async ({ page }) => {
  await openLanding(page);
  const root = page.getByTestId("landing-root");

  await expect(root).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(root).toHaveAttribute("data-theme", "light");
});

test("landing locale switch persists Russian across reload", async ({ page }) => {
  await openLanding(page);

  await page.getByTestId("site-locale-ru").click();

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "React UIKit в стиле iOS для Telegram Mini Apps",
    }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");

  await page.reload();

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "React UIKit в стиле iOS для Telegram Mini Apps",
    }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
});

test("landing install copy writes the command and shows a kit toast", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openLanding(page);

  await page.getByTestId("landing-install-copy").click();

  await expect(page.getByText("Install command copied")).toBeVisible();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(INSTALL_COMMAND);
});
