import { expect, test } from "@playwright/test";
import { gallerySection, gotoApp } from "./helpers";

/**
 * FORCED-COLORS / PREFERS-CONTRAST — Windows High Contrast and increased
 * contrast preferences. Snapshot the key control sections and assert that
 * interactive elements stay visible (system colors, no vanished borders).
 */

const SECTIONS = ["buttons", "selection-controls", "inputs"] as const;

test.describe("forced-colors: active", () => {
  test.use({ contextOptions: { forcedColors: "active" } });

  for (const slug of SECTIONS) {
    test(slug, async ({ page }) => {
      await gotoApp(page, "gallery");
      const section = await gallerySection(page, slug);
      await expect(section).toHaveScreenshot(`forced-colors-${slug}.png`);
    });
  }

  test("buttons keep visible boundaries", async ({ page }) => {
    await gotoApp(page, "gallery");
    const section = await gallerySection(page, "buttons");
    for (const name of ["Filled", "Tonal", "Outline"]) {
      const btn = section.getByRole("button", { name, exact: true });
      const { color, bg } = await btn.evaluate((el) => {
        const s = getComputedStyle(el);
        return { color: s.color, bg: s.backgroundColor };
      });
      expect(color, `${name}: text must not match its background`).not.toBe(bg);
    }
  });
});

test.describe("prefers-contrast: more", () => {
  for (const slug of SECTIONS) {
    test(slug, async ({ page }) => {
      await page.emulateMedia({ contrast: "more" });
      await gotoApp(page, "gallery");
      const section = await gallerySection(page, slug);
      await expect(section).toHaveScreenshot(`contrast-more-${slug}.png`);
    });
  }
});
