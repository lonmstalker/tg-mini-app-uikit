import { expect, test } from "@playwright/test";
import { REMIX_ORDER, REMIX_STEP_SEQUENCE } from "./fixtures/sequences";
import {
  dragSurface,
  getRecorder,
  gotoRemix,
  SURFACE,
  surfaceAttr,
  waitForBusinessContext,
  waitForMotionState,
} from "./helpers";

/*
 * US2 — one surface speaks many businesses. Remix order, morph-in-place, no
 * layout shift, continuity, three equivalent triggers, drag-locks-nearest, the
 * responsive matrix, plus the SC-011 remix snapshot frames.
 */

test.describe("US2 range remix — behaviour", () => {
  test("remixes in the fixed order shop → booking → wallet → support → community", async ({ page }) => {
    await gotoRemix(page);
    expect(await surfaceAttr(page, "data-business-context")).toBe("shop");
    for (let i = 1; i < REMIX_ORDER.length; i++) {
      await page.getByTestId("primary-action").click();
      await waitForBusinessContext(page, REMIX_ORDER[i]);
      expect(await surfaceAttr(page, "data-business-context")).toBe(REMIX_ORDER[i]);
    }
  });

  test("morphs in place — the same surface, no page cross-fade", async ({ page }) => {
    await gotoRemix(page);
    await page.locator(SURFACE).evaluate((el) => ((el as unknown as { __id: number }).__id = 7));
    await page.getByTestId("primary-action").click();
    await waitForBusinessContext(page, "booking");
    const sameNode = await page.locator(SURFACE).evaluate((el) => (el as unknown as { __id?: number }).__id === 7);
    expect(sameNode).toBe(true); // the surface element persisted (no remount/cross-fade)
    expect(await surfaceAttr(page, "data-scene")).toBe("rangeRemix");
  });

  test("primary action updates in place with no layout shift", async ({ page }) => {
    await gotoRemix(page);
    const before = await page.getByTestId("primary-action-bar").boundingBox();
    await page.getByTestId("primary-action").click();
    await waitForBusinessContext(page, "booking");
    const after = await page.getByTestId("primary-action-bar").boundingBox();
    expect(Math.abs((after?.y ?? 0) - (before?.y ?? 0))).toBeLessThanOrEqual(1);
  });

  test("continuity marks stay anchored across a remix (FR-004)", async ({ page }) => {
    await gotoRemix(page);
    const read = () =>
      page.locator(SURFACE).evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          originX: cs.getPropertyValue("--sc-origin-x").trim(),
          runtime: el.getAttribute("data-runtime-mode"),
          theme: el.closest(".sc-frame")?.getAttribute("data-frame-theme"),
        };
      });
    const before = await read();
    await page.getByTestId("primary-action").click();
    await waitForBusinessContext(page, "booking");
    const after = await read();
    expect(after).toEqual(before); // origin, runtime, theme unchanged
  });

  test("all three triggers emit the identical recorder sequence", async ({ page }) => {
    // 1) context chip
    await gotoRemix(page);
    await page.getByRole("button", { name: "Booking" }).click();
    await waitForMotionState(page, "continuity");
    expect((await getRecorder(page)).map((e) => e.reaction)).toEqual([...REMIX_STEP_SEQUENCE]);

    // 2) primary action
    await gotoRemix(page);
    await page.getByTestId("primary-action").click();
    await waitForMotionState(page, "continuity");
    expect((await getRecorder(page)).map((e) => e.reaction)).toEqual([...REMIX_STEP_SEQUENCE]);

    // 3) horizontal drag
    await gotoRemix(page);
    await dragSurface(page, -120);
    await waitForMotionState(page, "continuity");
    expect((await getRecorder(page)).map((e) => e.reaction)).toEqual([...REMIX_STEP_SEQUENCE]);
  });

  test("drag locks the nearest context (one step, not a free carousel)", async ({ page }) => {
    await gotoRemix(page);
    await dragSurface(page, -120); // swipe left → next context
    await waitForBusinessContext(page, "booking");
    expect(await surfaceAttr(page, "data-business-context")).toBe("booking"); // exactly one step
    const drag = (await getRecorder(page)).find((e) => e.reaction === "remix-recomposing");
    expect(drag?.source).toBe("pointer");
  });
});

/*
 * Responsive contract (SC-006, dom-contract §6): no overflow / no overlapping
 * controls at 320 / 375 / 430 px and desktop; the shell stays a centered TMA
 * surface; RTL + long Russian labels do not clip.
 */
const WIDTHS = [320, 375, 430, 1280];

test.describe("US2 range remix — responsive matrix", () => {
  for (const width of WIDTHS) {
    test(`no overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 880 });
      await page.goto("/?scene=rangeRemix&lang=ru");
      await waitForMotionState(page, "idle");

      // Surface never scrolls horizontally; the frame stays Telegram-width.
      const m = await page.locator(SURFACE).evaluate((el) => ({ overflow: el.scrollWidth - el.clientWidth }));
      expect(m.overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);

      const frame = await page.locator(".sc-frame").boundingBox();
      expect(frame?.width ?? 0, `frame stays centered TMA width at ${width}px`).toBeLessThanOrEqual(430);

      // Key controls are visible (long RU labels do not collapse the layout).
      await expect(page.getByTestId("primary-action")).toBeVisible();
      await expect(page.getByTestId("switcher")).toBeVisible();
    });
  }

  test("RTL + long Russian labels do not clip", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 880 });
    await page.goto("/?scene=rangeRemix&lang=ru");
    await waitForMotionState(page, "idle");
    await page.locator("html").evaluate((el) => el.setAttribute("dir", "rtl"));

    const overflow = await page.locator(SURFACE).evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.getByTestId("primary-action")).toBeVisible();
  });
});

/* Visual snapshot gate (SC-011): gated remix frames. */
const REMIX_FRAMES = ["remix-start", "separating", "rotating", "locked"] as const;

test.describe("US2 range remix — visual snapshots", () => {
  for (const state of REMIX_FRAMES) {
    test(`frame: ${state}`, async ({ page }) => {
      await page.goto(`/?scene=rangeRemix&context=booking&motion=${state}`);
      await waitForMotionState(page, state);
      await expect(page).toHaveScreenshot(`range-remix-${state}.png`);
    });
  }
});
