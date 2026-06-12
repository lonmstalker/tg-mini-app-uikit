import { expect, test } from "@playwright/test";
import { gallerySection, gotoApp } from "./helpers";

/**
 * DPR 2–3 — every real phone renders at deviceScaleFactor 2 or 3; hairline
 * separators, 0.5px borders and SVG strokes behave differently there. Runs in
 * the `visual-dpr2` / `visual-dpr3` projects (the project name lands in the
 * snapshot file name).
 */

test("gallery hairlines and shadows", async ({ page }) => {
  await gotoApp(page, "gallery");
  await expect(await gallerySection(page, "lists-cells")).toHaveScreenshot("dpr-lists-cells.png");
  await expect(await gallerySection(page, "selection-controls")).toHaveScreenshot("dpr-selection-controls.png");
});

test("shop home", async ({ page }) => {
  const root = await gotoApp(page, "shop");
  await expect(root).toHaveScreenshot("dpr-shop-home.png");
});
