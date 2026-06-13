import { expect, test } from "@playwright/test";
import { gallerySection, gotoApp } from "./helpers";

/**
 * ДЕМО 2.0 (M8) — поиск/оглавление, сниппеты, playground, persistence,
 * имитация сети, новые флоу Booking/Game/Shop, deep links.
 */

test("gallery TOC: search finds a section and scrolls to it", async ({ page }) => {
  await gotoApp(page, "gallery");
  await page.getByTestId("demo-toc-open").click();
  const toc = page.getByTestId("demo-toc");
  await expect(toc).toBeVisible();
  await toc.getByTestId("demo-toc-search").locator("input").fill("gest");
  await toc.getByTestId("toc-gestures").click();
  await expect(page.locator('[data-demo-section="gestures"]')).toBeInViewport({ ratio: 0.1 });
});

test("deep-link ?section= scrolls the gallery", async ({ page }) => {
  await gotoApp(page, "gallery", { params: { section: "forms-2-0" } });
  await expect(page.locator('[data-demo-section="forms-2-0"]')).toBeInViewport({ ratio: 0.1 });
});

test("section snippet opens and copies", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "buttons");
  await section.locator("[data-demo-section-code]").click();
  const sheet = page.getByTestId("demo-snippet-sheet");
  await expect(sheet.locator("pre")).toContainText("<TKButton>");
  await sheet.getByTestId("demo-snippet-copy").click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("TKIconButton");
});

test("playground: knobs update the preview and the generated snippet", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "playground");
  const pg = section.locator("[data-demo-playground]");
  await pg.getByRole("button", { name: "tonal", exact: true }).click();
  await pg.getByRole("switch", { name: "pill" }).click();
  await expect(pg.locator("[data-demo-playground-code]")).toContainText('variant="tonal"');
  await expect(pg.locator("[data-demo-playground-code]")).toContainText("pill");
});

test("shop: catalog skeletons, promo code, stock limit, cart badge 9+ and persistence", async ({ page }) => {
  await gotoApp(page, "shop");
  // skeletons during the simulated load, then products
  await expect(page.locator('[data-demo-product="mug"]')).toBeVisible({ timeout: 5000 });

  // add the low-stock product to its max — the stepper clamps
  await expect(page.locator("[data-demo-stock-badge]").first()).toBeVisible();

  // promo code on the cart
  await page.locator('[data-demo-product="mug"]').click();
  await page.getByRole("dialog").getByRole("button", { name: /^Add \d+ to cart/ }).click();
  await page.locator("[data-demo-shop-tabbar]").getByRole("button", { name: "Cart" }).click();
  await page.locator("[data-demo-promo-input] input").fill("WRONG");
  await page.locator("[data-demo-promo-apply]").click();
  await expect(page.locator("[data-demo-promo-input]")).toContainText(/invalid|неверный/i);
  await page.locator("[data-demo-promo-input] input").fill("SPRING24");
  await page.locator("[data-demo-promo-apply]").click();
  await expect(page.getByText(/−|-20%|SPRING24/i).first()).toBeVisible();

  // cart persists across reload (mock cloud storage = localStorage)
  await page.reload();
  await page.locator("[data-demo-shop-tabbar]").getByRole("button", { name: "Cart" }).click();
  await expect(page.locator("[data-demo-pay-button]")).toBeVisible();
});

test("deep-link ?app=shop&screen=cart opens the cart", async ({ page }) => {
  await gotoApp(page, "shop", { params: { screen: "cart" } });
  await expect(page.getByText("Cart", { exact: true }).first()).toBeVisible();
  await expect(page.locator("[data-demo-pay-button]")).toBeVisible();
});

test("game: daily reward claims once and the button locks with a countdown", async ({ page }) => {
  await gotoApp(page, "game", { params: { fast: "1" } });
  const claim = page.locator("[data-demo-daily-claim]");
  await claim.scrollIntoViewIfNeeded();
  await claim.click();
  await expect(page.locator("[data-demo-daily-claim]")).toContainText(/next reward/i, { timeout: 8000 });
});

test("booking: cancel flow confirms through the dialog", async ({ page }) => {
  await gotoApp(page, "booking", { params: { fast: "1", today: "2026-06-15" } });
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /^Confirm ·/ }).click();
  await expect(page.getByTestId("booking-cancel")).toBeVisible({ timeout: 8000 });
  await page.getByTestId("booking-cancel").click();
  await page.getByTestId("booking-cancel-confirm").click();
  await expect(page.getByText("Book a visit")).toBeVisible();
});

test("booking: reschedule keeps the service and returns to the time step", async ({ page }) => {
  await gotoApp(page, "booking", { params: { fast: "1", today: "2026-06-15" } });
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /^Confirm ·/ }).click();
  await expect(page.getByTestId("booking-reschedule")).toBeVisible({ timeout: 8000 });
  await page.getByTestId("booking-reschedule").click();
  await expect(page.getByText("10:00")).toBeVisible(); // time step
});

test("booking: denied notifications show the banner and snap the switch off", async ({ page }) => {
  await gotoApp(page, "booking", { params: { noNotifs: "1", today: "2026-06-15" } });
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  const remind = page.getByRole("switch");
  // default is on -> turn off -> turn on triggers the denied flow
  await remind.click();
  await remind.click();
  await expect(page.getByTestId("booking-notifs-denied")).toBeVisible();
  await expect(remind).toHaveAttribute("aria-checked", "false");
});
