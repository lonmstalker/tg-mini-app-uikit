import { expect, test } from "@playwright/test";
import { computedStyle, gallerySection, gotoApp, openGalleryOverlay } from "./helpers";

/**
 * АНИМАЦИИ / prefers-reduced-motion — runs in a context with
 * `reducedMotion: "reduce"`. tokens.css collapses --tk-t1/t2/t3 to 1ms and
 * silences decorative shimmer/pulse, while purely informational spinners keep
 * spinning and overlays stay fully functional.
 */

test("motion tokens collapse to 1ms", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "buttons");
  const button = section.getByRole("button", { name: "Filled", exact: true });
  expect(await computedStyle(button, "transition-duration")).toBe("0.001s, 0.001s, 0.001s");
});

test("decorative shimmer and pulse are disabled", async ({ page }) => {
  await gotoApp(page, "gallery");
  const feedback = await gallerySection(page, "feedback");
  const skel = feedback.locator(".tk-skel").first();
  expect(await computedStyle(skel, "animation-name", "::after")).toBe("none");

  const chips = await gallerySection(page, "chips");
  const pulse = chips.locator(".tk-pulse").first();
  expect(await computedStyle(pulse, "animation-name", "::after")).toBe("none");
  expect(await computedStyle(pulse, "opacity", "::after")).toBe("0");
});

test("informational spinner keeps spinning", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "feedback");
  const spinner = section.locator('[style*="tk-spin"]').first();
  expect(await computedStyle(spinner, "animation-name")).toBe("tk-spin");
  expect(await computedStyle(spinner, "animation-iteration-count")).toBe("infinite");
});

test("overlays still open and close, just instantly", async ({ page }) => {
  const sheet = await openGalleryOverlay(page, "Bottom sheet");
  expect(await computedStyle(sheet, "animation-duration")).toBe("0.001s");
  await page.keyboard.press("Escape");
  // The fixed 380ms unmount window still applies; the sheet must disappear.
  await expect(sheet).toBeHidden();
});
