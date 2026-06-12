import { expect, test } from "@playwright/test";
import { gallerySection, gotoApp } from "./helpers";

/**
 * ЛОКАЛИЗАЦИЯ — the `?locale=` boot param, the ru preset, the ar RTL flip and
 * the prop-beats-provider resolution order (M1).
 */

test.describe("localization", () => {
  test("?locale=ru renders the Russian preset everywhere", async ({ page }) => {
    await gotoApp(page, "gallery", { params: { locale: "ru" } });
    await gallerySection(page, "inputs");
    await expect(page.locator('input[placeholder="Поиск"]').first()).toBeVisible();
  });

  test("?locale=ar flips the document to RTL", async ({ page }) => {
    await gotoApp(page, "gallery", { params: { locale: "ar" } });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await gallerySection(page, "inputs");
    await expect(page.locator('input[placeholder="بحث"]').first()).toBeVisible();
  });

  test("a component-level prop beats the provider dictionary", async ({ page }) => {
    await gotoApp(page, "gallery");
    const section = await gallerySection(page, "localization");
    await expect(section.locator('input[placeholder="Find anything…"]')).toBeVisible();
    await expect(section.locator('input[placeholder="Prop beats provider"]')).toBeVisible();
  });

  test("the ru preset section shows Russian strings without a URL param", async ({ page }) => {
    await gotoApp(page, "gallery");
    const section = await gallerySection(page, "localization");
    await expect(section.locator('input[placeholder="Поиск"]')).toBeVisible();
    await expect(section.getByText("Готово")).toBeVisible();
  });
});
