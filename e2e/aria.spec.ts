import { expect, test } from "@playwright/test";
import { fillCart, gallerySection, gotoApp } from "./helpers";

/**
 * ARIA-СНАПШОТЫ — fixes the role/name tree of whole screens. Complements axe:
 * axe checks rules, these capture "how the screen reads" to assistive tech.
 * Snapshots are plain-text YAML and platform-independent, so they compare on
 * CI as well.
 */

test.describe("app screens read correctly", () => {
  test("shop catalog", async ({ page }) => {
    const root = await gotoApp(page, "shop");
    await expect(root).toMatchAriaSnapshot({ name: "shop-catalog.aria.yml" });
  });

  test("shop cart", async ({ page }) => {
    await fillCart(page);
    await expect(page.locator('[data-demo-app="shop"]')).toMatchAriaSnapshot({ name: "shop-cart.aria.yml" });
  });

  test("booking wizard", async ({ page }) => {
    const root = await gotoApp(page, "booking");
    await expect(root).toMatchAriaSnapshot({ name: "booking.aria.yml" });
  });

  test("game arena", async ({ page }) => {
    const root = await gotoApp(page, "game");
    await expect(root).toMatchAriaSnapshot({ name: "game.aria.yml" });
  });

  test("platform lab", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    await expect(root).toMatchAriaSnapshot({ name: "platform.aria.yml" });
  });
});

test.describe("gallery sections read correctly", () => {
  for (const slug of ["buttons", "selection-controls", "inputs", "form-primitives", "navigation", "lists-cells", "overlays"] as const) {
    test(slug, async ({ page }) => {
      await gotoApp(page, "gallery");
      const section = await gallerySection(page, slug);
      await expect(section).toMatchAriaSnapshot({ name: `gallery-${slug}.aria.yml` });
    });
  }
});

test("open dialog reads as an alertdialog with both actions", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "overlays");
  await section.getByRole("button", { name: "Dialog", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toMatchAriaSnapshot({ name: "gallery-dialog-open.aria.yml" });
});
