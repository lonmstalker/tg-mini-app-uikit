import { expect, test, type Locator, type Page } from "@playwright/test";
import { fillCart, gallerySection, gotoApp, paintGallery } from "./helpers";

/**
 * СОСТОЯНИЯ — visual regression of non-default component states: hover,
 * pressed, focus ring, open popovers, MainButton state machine, image
 * skeleton, visible toast, shop payment error and receipt.
 */

/** Tab from the page root until the target element owns focus (keyboard modality → :focus-visible). */
async function tabUntil(page: Page, target: Locator, browserName: string, max = 40) {
  await page.locator("body").click({ position: { x: 5, y: 5 } }); // deterministic start
  // Safari/WebKit skips buttons on plain Tab; Option+Tab walks all controls.
  const key = browserName === "webkit" ? "Alt+Tab" : "Tab";
  for (let i = 0; i < max; i++) {
    await page.keyboard.press(key);
    if (await target.evaluate((el) => el === document.activeElement || el.contains(document.activeElement))) return;
  }
  throw new Error("tabUntil: target never received focus");
}

test.describe("buttons — interaction states", () => {
  test("hover", async ({ page }) => {
    await gotoApp(page, "gallery");
    const section = await gallerySection(page, "buttons");
    await section.getByRole("button", { name: "Filled", exact: true }).hover();
    await expect(section).toHaveScreenshot("states-button-hover.png");
  });

  test("pressed", async ({ page }) => {
    await gotoApp(page, "gallery");
    const section = await gallerySection(page, "buttons");
    const button = section.getByRole("button", { name: "Filled", exact: true });
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(section).toHaveScreenshot("states-button-pressed.png");
    await page.mouse.up();
  });

  test("focus ring", async ({ page, browserName }) => {
    await gotoApp(page, "gallery");
    const section = await gallerySection(page, "buttons");
    const button = section.getByRole("button", { name: "Filled", exact: true });
    await tabUntil(page, button, browserName);
    await expect(section).toHaveScreenshot("states-button-focus.png");
  });
});

test.describe("popovers open", () => {
  test("select open", async ({ page }) => {
    const root = await gotoApp(page, "gallery");
    await paintGallery(page);
    const section = await gallerySection(page, "inputs");
    await section.getByRole("combobox").click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(root).toHaveScreenshot("states-select-open.png");
  });

  test("multiselect open", async ({ page }) => {
    const root = await gotoApp(page, "gallery");
    await paintGallery(page);
    const section = await gallerySection(page, "form-primitives");
    await section.getByRole("combobox").click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(root).toHaveScreenshot("states-multiselect-open.png");
  });

  test("tooltip visible", async ({ page }) => {
    const root = await gotoApp(page, "gallery");
    await paintGallery(page);
    const section = await gallerySection(page, "composition-primitives");
    await section.getByRole("button", { name: "Hover tooltip" }).hover();
    await expect(page.getByRole("tooltip")).toBeVisible();
    await expect(root).toHaveScreenshot("states-tooltip.png");
  });
});

test.describe("main button state machine", () => {
  test("loading", async ({ page }) => {
    await gotoApp(page, "gallery");
    const section = await gallerySection(page, "main-button");
    await section.getByRole("button", { name: /Pay/ }).click();
    await expect(section.getByRole("button")).toHaveAttribute("aria-busy", "true");
    await expect(section).toHaveScreenshot("states-main-button-loading.png");
  });

  test("success", async ({ page }) => {
    await gotoApp(page, "gallery");
    const section = await gallerySection(page, "main-button");
    await section.getByRole("button", { name: /Pay/ }).click();
    await expect(section.getByText("Paid")).toBeVisible({ timeout: 5_000 });
    await expect(section).toHaveScreenshot("states-main-button-success.png");
  });
});

test.describe("feedback", () => {
  test("toast visible", async ({ page }) => {
    const root = await gotoApp(page, "gallery");
    await paintGallery(page);
    const section = await gallerySection(page, "overlays");
    await section.getByRole("button", { name: "Success toast" }).click();
    await expect(page.getByRole("status").getByText("Order placed")).toBeVisible();
    await expect(root).toHaveScreenshot("states-toast.png");
  });

  test("image skeleton phase", async ({ page }) => {
    // Hold the photo request so TKImage stays in its skeleton phase.
    await page.route("**/demo-slow-photo*", () => new Promise(() => {}));
    const root = await gotoApp(page, "gallery");
    const slow = page.locator("[data-demo-slow-image]");
    await slow.scrollIntoViewIfNeeded();
    await expect(slow).toHaveScreenshot("states-image-skeleton.png");
  });
});

test.describe("shop — payment outcomes", () => {
  test("payment error sheet", async ({ page }) => {
    await fillCart(page);
    await page.locator("[data-demo-decline-toggle]").getByRole("switch").click();
    await page.locator("[data-demo-pay-button]").getByRole("button").click();
    await expect(page.getByRole("alertdialog")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[data-demo-app="shop"]')).toHaveScreenshot("states-payment-error.png");
  });

  test("receipt", async ({ page }) => {
    await fillCart(page);
    await page.locator("[data-demo-pay-button]").getByRole("button").click();
    await expect(page.locator("[data-demo-receipt]")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[data-demo-app="shop"]')).toHaveScreenshot("states-receipt.png");
  });
});
