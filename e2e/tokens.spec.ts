import { expect, test } from "@playwright/test";
import { gallerySection, gotoApp } from "./helpers";

/**
 * ТОКЕНЫ — the kit's theming surface: accent/roundness/fontSize matrix, the
 * .tk-tg mode inheriting --tg-theme-* host variables (the kit's signature
 * feature) and safe-area insets coming from the Telegram host.
 */

for (const theme of ["light", "dark"] as const) {
  test(`theme matrix — ${theme}`, async ({ page }) => {
    await gotoApp(page, "gallery", { dark: theme === "dark" });
    const section = await gallerySection(page, "theme-matrix");
    await expect(section).toHaveScreenshot(`tokens-theme-matrix-${theme}.png`);
  });
}

test("tg-theme — Telegram palette inheritance", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "tg-theme");
  await expect(section).toHaveScreenshot("tokens-tg-theme.png");
});

test("token knobs via URL — accent, roundness, fontSize", async ({ page }) => {
  await gotoApp(page, "gallery", {
    params: { accent: "e5484d", roundness: "1.6", fontSize: "19" },
  });
  const section = await gallerySection(page, "buttons");
  await expect(section).toHaveScreenshot("tokens-knobs-red-round-large.png");
});

test.describe("safe area — host insets visible", () => {
  test("layout section with cutout + chrome insets", async ({ page }) => {
    await gotoApp(page, "gallery", { params: { insets: "1" } });
    const section = await gallerySection(page, "layout");
    await expect(section).toHaveScreenshot("tokens-layout-insets.png");
  });

  test("layout section without insets", async ({ page }) => {
    await gotoApp(page, "gallery");
    const section = await gallerySection(page, "layout");
    await expect(section).toHaveScreenshot("tokens-layout-no-insets.png");
  });
});

test("RTL boot flag flips the document", async ({ page }) => {
  await gotoApp(page, "gallery", { params: { rtl: "1" } });
  expect(await page.evaluate(() => document.documentElement.dir)).toBe("rtl");
  const section = await gallerySection(page, "stress-locales");
  await expect(section).toHaveScreenshot("tokens-rtl-stress-locales.png");
});
