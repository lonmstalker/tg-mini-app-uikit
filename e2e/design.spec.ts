import { expect, test } from "@playwright/test";
import { GALLERY_SECTIONS, fillCart, gallerySection, gotoApp } from "./helpers";

/**
 * ДИЗАЙН — visual regression of every gallery section (light + dark) and the
 * key app screens. Pixel comparison runs against darwin baselines and is
 * skipped on CI (`ignoreSnapshots`), where these tests still execute every
 * flow as a smoke pass.
 */

for (const theme of ["light", "dark"] as const) {
  test.describe(`gallery — ${theme}`, () => {
    for (const slug of GALLERY_SECTIONS) {
      test(slug, async ({ page }) => {
        await gotoApp(page, "gallery", { dark: theme === "dark" });
        const section = await gallerySection(page, slug);
        await expect(section).toHaveScreenshot(`gallery-${slug}-${theme}.png`);
      });
    }
  });
}

test.describe("app screens", () => {
  test("shop catalog — light", async ({ page }) => {
    const root = await gotoApp(page, "shop");
    await expect(root).toHaveScreenshot("shop-home-light.png");
  });

  test("shop catalog — dark", async ({ page }) => {
    const root = await gotoApp(page, "shop", { dark: true });
    await expect(root).toHaveScreenshot("shop-home-dark.png");
  });

  test("shop product sheet", async ({ page }) => {
    const root = await gotoApp(page, "shop");
    await page.locator('[data-demo-product="mug"]').click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(root).toHaveScreenshot("shop-product-sheet.png");
  });

  test("shop cart with items", async ({ page }) => {
    await fillCart(page);
    await expect(page.locator('[data-demo-app="shop"]')).toHaveScreenshot("shop-cart.png");
  });

  test("booking home", async ({ page }) => {
    const root = await gotoApp(page, "booking");
    await expect(root).toHaveScreenshot("booking-home.png");
  });

  test("game home", async ({ page }) => {
    const root = await gotoApp(page, "game");
    await expect(root).toHaveScreenshot("game-home.png");
  });
});

test.describe("gallery overlays open", () => {
  for (const name of ["Bottom sheet", "Dialog", "Action sheet"] as const) {
    test(name.toLowerCase(), async ({ page }) => {
      await gotoApp(page, "gallery");
      const section = await gallerySection(page, "overlays");
      await section.getByRole("button", { name, exact: true }).click();
      await expect(page.getByRole(name === "Dialog" ? "alertdialog" : "dialog")).toBeVisible();
      await expect(page.locator('[data-demo-app="gallery"]')).toHaveScreenshot(
        `gallery-overlay-${name.toLowerCase().replace(/\s+/g, "-")}.png`,
      );
    });
  }
});
