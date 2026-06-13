import { expect, test } from "@playwright/test";
import {
  computedStyle,
  gallerySection,
  gotoApp,
  matrixScaleX,
  matrixTranslateX,
  openGalleryOverlay,
} from "./helpers";

/**
 * АНИМАЦИИ — asserts the motion system through computed styles: which
 * keyframes run, with which durations and easings, and that exit animations
 * keep overlays mounted until they finish. No screenshots involved.
 */

const SPRING = "cubic-bezier(0.34, 1.45, 0.58, 1)";
const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

test("bottom sheet enters with tk-sheet-up on the spring curve", async ({ page }) => {
  const sheet = await openGalleryOverlay(page, "Bottom sheet");
  await expect(sheet).toHaveAttribute("aria-modal", "true");
  expect(await computedStyle(sheet, "animation-name")).toBe("tk-sheet-up");
  expect(await computedStyle(sheet, "animation-duration")).toBe("0.44s"); // --tk-t3
  expect(await computedStyle(sheet, "animation-timing-function")).toBe(SPRING);
});

test("scrim fades in behind the sheet", async ({ page }) => {
  await openGalleryOverlay(page, "Bottom sheet");
  const scrim = page.locator('div[style*="tk-fade-in"]');
  await expect(scrim).toBeVisible();
  expect(await computedStyle(scrim, "animation-name")).toBe("tk-fade-in");
  expect(await computedStyle(scrim, "animation-duration")).toBe("0.26s"); // --tk-t2
});

test("bottom sheet exit keeps it mounted through tk-sheet-down", async ({ page }) => {
  const sheet = await openGalleryOverlay(page, "Bottom sheet");
  await page.keyboard.press("Escape");
  // Still attached: the closing state swaps the keyframe and easing.
  await expect.poll(() => computedStyle(sheet, "animation-name")).toBe("tk-sheet-down");
  expect(await computedStyle(sheet, "animation-timing-function")).toBe(EASE);
  await expect(sheet).toBeHidden(); // unmounts after the 380ms close window
});

test("dialog enters with tk-modal-in and exits through tk-fade-out", async ({ page }) => {
  const dialog = await openGalleryOverlay(page, "Dialog");
  expect(await computedStyle(dialog, "animation-name")).toBe("tk-modal-in");
  expect(await computedStyle(dialog, "animation-duration")).toBe("0.26s"); // --tk-t2
  expect(await computedStyle(dialog, "animation-timing-function")).toBe(SPRING);
  await dialog.getByRole("button", { name: "Cancel" }).click();
  expect(await computedStyle(dialog, "animation-name")).toBe("tk-fade-out");
  await expect(dialog).toBeHidden();
});

test("action sheet slides like a sheet and closes after selecting", async ({ page }) => {
  const sheet = await openGalleryOverlay(page, "Action sheet");
  expect(await computedStyle(sheet, "animation-name")).toBe("tk-sheet-up");
  await sheet.getByRole("button", { name: "Share" }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByText("Shared")).toBeVisible(); // toast confirms onSelect ran
});

test("toast animates in, then out on auto-dismiss", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "overlays");
  // The out-keyframe window is only 350ms before the node is removed, so
  // watch for it with a DOM listener instead of polling.
  const sawToastOut = page.evaluate(
    () =>
      new Promise<boolean>((resolve) => {
        document.addEventListener(
          "animationstart",
          (e) => {
            if ((e as AnimationEvent).animationName === "tk-toast-out") resolve(true);
          },
          true,
        );
        setTimeout(() => resolve(false), 6_000);
      }),
  );
  await section.getByRole("button", { name: "Success toast" }).click();
  const toast = page.locator('div[style*="tk-toast"]', { hasText: "Order placed" });
  await expect(toast).toBeVisible();
  expect(await computedStyle(toast, "animation-name")).toBe("tk-toast-in");
  expect(await sawToastOut).toBe(true); // auto-dismiss flipped to tk-toast-out
  await expect(toast).toBeHidden();
});

test("spinner spins forever with tk-spin", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "feedback");
  const spinner = section.locator('[style*="tk-spin"]').first();
  expect(await computedStyle(spinner, "animation-name")).toBe("tk-spin");
  expect(await computedStyle(spinner, "animation-duration")).toBe("0.7s");
  expect(await computedStyle(spinner, "animation-iteration-count")).toBe("infinite");
});

test("skeleton shimmer runs on the ::after pseudo-element", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "feedback");
  const skel = section.locator(".tk-skel").first();
  expect(await computedStyle(skel, "animation-name", "::after")).toBe("tk-shimmer");
  expect(await computedStyle(skel, "animation-duration", "::after")).toBe("1.3s");
});

test("badge pulse ring loops tk-pulse on the ::after pseudo-element", async ({ page }) => {
  // Counterpart of the reduced-motion "pulse is disabled" check: the ring
  // must actually run when motion is allowed.
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "chips");
  const pulse = section.locator(".tk-pulse").first();
  expect(await computedStyle(pulse, "animation-name", "::after")).toBe("tk-pulse");
  expect(await computedStyle(pulse, "animation-duration", "::after")).toBe("1.8s"); // 1800ms / --tk-ms
  expect(await computedStyle(pulse, "animation-iteration-count", "::after")).toBe("infinite");
});

test("segmented control thumb slides to the active option", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "navigation");
  const thumb = section.locator('div[style*="translateX"]').first();
  expect(await computedStyle(thumb, "transition-duration")).toBe("0.26s"); // --tk-t2
  const before = matrixTranslateX(await computedStyle(thumb, "transform"));
  const pickup = section.getByRole("button", { name: "Pickup", exact: true });
  await pickup.click();
  await expect(pickup).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => matrixTranslateX(await computedStyle(thumb, "transform")))
    .toBeGreaterThan(before + 50);
});

test(".tk-press squeezes to scale(.96) while pressed", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "buttons");
  const button = section.getByRole("button", { name: "Filled", exact: true });
  const box = (await button.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect
    .poll(async () => matrixScaleX(await computedStyle(button, "transform")))
    .toBeLessThan(0.97);
  await page.mouse.up();
  await expect
    .poll(async () => matrixScaleX(await computedStyle(button, "transform")))
    .toBeGreaterThan(0.99);
});

test("counter pops with tk-pop when its value changes", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "chips");
  await section.getByRole("button", { name: "+1" }).click();
  const pop = section.locator(".tk-pop").first();
  expect(await computedStyle(pop, "animation-name")).toBe("tk-pop");
  expect(await computedStyle(pop, "animation-timing-function")).toBe(SPRING);
});

test.describe("tweaks panel knobs (wide shell)", () => {
  test.use({ viewport: { width: 1440, height: 950 } });

  test("speed knob rescales every motion token via --tk-ms", async ({ page }) => {
    await page.goto("/?app=shop");
    await expect(page.locator("[data-demo-frame]")).toBeVisible();
    const pressable = page.locator('[data-demo-frame] .tk-press').first();
    // .tk-press transitions: transform t2, filter t1, opacity t1.
    expect(await computedStyle(pressable, "transition-duration")).toBe("0.26s, 0.14s, 0.14s");
    // TweaksPanel sliders: roundness, speed, font size — in DOM order.
    const speed = page.getByRole("slider").nth(1);
    await speed.focus();
    await page.keyboard.press("End"); // motionSpeed -> ×2
    await expect
      .poll(() => computedStyle(pressable, "transition-duration"))
      .toBe("0.13s, 0.07s, 0.07s");
  });

  test("motion character knob swaps the spring for the smooth curve", async ({ page }) => {
    await page.goto("/?app=shop");
    await expect(page.locator("[data-demo-frame]")).toBeVisible();
    const pressable = page.locator('[data-demo-frame] .tk-press').first();
    expect(await computedStyle(pressable, "transition-timing-function")).toContain(
      "cubic-bezier(0.34, 1.45, 0.58, 1)", // springy default
    );
    await page.getByRole("button", { name: "Smooth", exact: true }).click();
    await expect
      .poll(() => computedStyle(pressable, "transition-timing-function"))
      .toContain("cubic-bezier(0.25, 0.6, 0.3, 1)"); // TK_SMOOTH
  });
});
