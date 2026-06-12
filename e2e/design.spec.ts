import { expect, test } from "@playwright/test";
import { GALLERY_SECTIONS, fillCart, gallerySection, gotoApp, paintGallery } from "./helpers";

/**
 * ДИЗАЙН — visual regression of every gallery section (light + dark) and the
 * key app screens. Pixel comparison runs against per-platform baselines:
 * darwin locally, linux on CI (regenerate with `npm run test:e2e:update:linux`).
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

for (const theme of ["light", "dark"] as const) {
  const dark = theme === "dark";

  test.describe(`app screens — ${theme}`, () => {
    test("shop catalog", async ({ page }) => {
      const root = await gotoApp(page, "shop", { dark });
      await expect(root).toHaveScreenshot(`shop-home-${theme}.png`);
    });

    test("shop product sheet", async ({ page }) => {
      const root = await gotoApp(page, "shop", { dark });
      await page.locator('[data-demo-product="mug"]').click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(root).toHaveScreenshot(`shop-product-sheet-${theme}.png`);
    });

    test("shop cart with items", async ({ page }) => {
      await fillCart(page, { dark });
      await expect(page.locator('[data-demo-app="shop"]')).toHaveScreenshot(`shop-cart-${theme}.png`);
    });

    test("booking home", async ({ page }) => {
      const root = await gotoApp(page, "booking", { dark });
      await expect(root).toHaveScreenshot(`booking-home-${theme}.png`);
    });

    test("game home", async ({ page }) => {
      const root = await gotoApp(page, "game", { dark });
      await expect(root).toHaveScreenshot(`game-home-${theme}.png`);
    });

    test("platform lab", async ({ page }) => {
      const root = await gotoApp(page, "platform", { dark });
      await expect(root).toHaveScreenshot(`platform-home-${theme}.png`);
    });
  });

  test.describe(`gallery overlays open — ${theme}`, () => {
    for (const name of ["Bottom sheet", "Dialog", "Action sheet"] as const) {
      test(name.toLowerCase(), async ({ page }) => {
        await gotoApp(page, "gallery", { dark });
        await paintGallery(page); // full-page shot below — pin the scroll offset
        const section = await gallerySection(page, "overlays");
        await section.getByRole("button", { name, exact: true }).click();
        await expect(page.getByRole(name === "Dialog" ? "alertdialog" : "dialog")).toBeVisible();
        await expect(page.locator('[data-demo-app="gallery"]')).toHaveScreenshot(
          `gallery-overlay-${name.toLowerCase().replace(/\s+/g, "-")}-${theme}.png`,
        );
      });
    }
  });
}
