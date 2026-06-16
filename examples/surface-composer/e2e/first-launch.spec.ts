import { expect, test } from "@playwright/test";
import { BIRTH_SEQUENCE } from "./fixtures/sequences";
import {
  expectNoForbiddenTerms,
  getRecorder,
  SURFACE,
  surfaceAttr,
  waitForMotionState,
} from "./helpers";

/*
 * US1 — first launch sells a Mini App outcome. The surface-composer "done" bar:
 * buyer-first gate, the birth choreography, first-touch → inspector, CTA
 * gravity, empty-space recognition, plus the SC-011 visual-snapshot gate.
 */

test.describe("US1 first launch — behaviour", () => {
  test("opens a buyer-first viewport: no tech vocabulary, no proof affordance, key parts present", async ({ page }) => {
    await page.goto("/");
    await waitForMotionState(page, "idle");

    // Buyer-first gate (Principle III, SC-002).
    await expect(page.getByTestId("proof-strip")).toHaveCount(0);
    await expectNoForbiddenTerms(page);

    // Promise + switcher + live surface + single action, all present & readable.
    await expect(page.getByText("Open. Trust. Order.")).toBeVisible();
    await expect(page.getByTestId("switcher")).toBeVisible();
    await expect(page.getByTestId("primary-action")).toBeVisible();

    // The shell stays a centered TMA surface — no horizontal overflow.
    const overflow = await page.locator(SURFACE).evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("births the surface from a single origin: seed → … → idle, one event per step", async ({ page }) => {
    await page.goto("/");
    await waitForMotionState(page, "idle");
    const rec = await getRecorder(page);
    expect(rec.map((e) => e.reaction)).toEqual([...BIRTH_SEQUENCE]);
    // Every birth event is system-sourced and carries the honest runtime status.
    expect(rec.every((e) => e.source === "system")).toBe(true);
    expect(new Set(rec.map((e) => e.status))).toEqual(new Set(["mock"]));
  });

  test("first meaningful touch opens the inspector with ≥1 named proof element + reveals the affordance", async ({ page }) => {
    await page.goto("/");
    await waitForMotionState(page, "idle");

    await page.locator('[data-slot="hero"]').click();
    await waitForMotionState(page, "inspector-open");

    const inspector = page.getByTestId("inspector");
    await expect(inspector).toBeVisible();
    await expect(inspector.getByText("TKHeader")).toBeVisible(); // a named UIKit proof element
    await expect(page.getByTestId("proof-strip")).toBeVisible(); // affordance now present

    const rec = await getRecorder(page);
    expect(rec.map((e) => e.reaction)).toContain("first-touch");
    expect(rec.map((e) => e.reaction)).toContain("inspector-open");
  });

  test("empty-space tap is recognized with no state change (FR-006)", async ({ page }) => {
    await page.goto("/");
    await waitForMotionState(page, "idle");

    // Tap the top-left corner of the surface (padding, not a slot or control).
    await page.locator(SURFACE).click({ position: { x: 3, y: 3 } });

    expect(await surfaceAttr(page, "data-motion-state")).toBe("idle"); // unchanged
    const rec = await getRecorder(page);
    expect(rec.map((e) => e.reaction)).toContain("empty-recognized");
  });

  test("CTA press emits a gravity event (US1 sc.4)", async ({ page }) => {
    await page.goto("/");
    await waitForMotionState(page, "idle");

    await page.getByTestId("primary-action").click();

    const rec = await getRecorder(page);
    expect(rec.map((e) => e.reaction)).toContain("cta-gravity");
  });
});

/*
 * Visual snapshot gate (SC-011). Transient frames are frozen via `?motion=…`
 * (animations disabled globally). Excluded transition frame: light-sweep.
 */
const SNAPSHOT_STATES = ["seed", "rails", "assembling", "idle", "first-touch", "inspector-open"] as const;

test.describe("US1 first launch — visual snapshots", () => {
  for (const state of SNAPSHOT_STATES) {
    test(`frame: ${state}`, async ({ page }) => {
      await page.goto(`/?motion=${state}`);
      await waitForMotionState(page, state);
      await expect(page).toHaveScreenshot(`first-launch-${state}.png`);
    });
  }
});
