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
  test("desktop shell is a dark cinematic stage with a centered phone frame", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 880 });
    await page.goto("/");
    await waitForMotionState(page, "idle");

    const stage = await page.getByTestId("sc-stage").evaluate((el) => {
      const bg = getComputedStyle(el).backgroundColor;
      const m = bg.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
      const luma = m.length >= 3 ? (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 : 1;
      return { bg, luma };
    });
    expect(stage.luma, `stage must be dark, got ${stage.bg}`).toBeLessThan(0.28);

    const frame = await page.locator(".sc-frame").boundingBox();
    expect(frame?.width ?? 0).toBeGreaterThanOrEqual(380);
    expect(frame?.width ?? 0).toBeLessThanOrEqual(430);
    const center = (frame?.x ?? 0) + (frame?.width ?? 0) / 2;
    expect(Math.abs(center - 640)).toBeLessThanOrEqual(2);
  });

  test("opens a buyer-first viewport: no tech vocabulary, buyer proof visible, build proof hidden", async ({ page }) => {
    await page.goto("/");
    await waitForMotionState(page, "idle");

    // Buyer-first gate (Principle III, SC-002).
    await expect(page.getByTestId("buyer-proof-strip")).toBeVisible();
    await expect(page.getByTestId("proof-strip")).toHaveCount(0);
    await expectNoForbiddenTerms(page);

    // Promise + switcher + live surface + single action, all present & readable.
    await expect(page.getByText("Your Mini App in Telegram")).toBeVisible();
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

    await page.locator('[data-slot="content"]').click();
    await waitForMotionState(page, "first-touch");

    const inspector = page.getByTestId("inspector");
    await expect(inspector).toBeVisible();
    await expect(inspector.getByText("Why it feels premium")).toBeVisible();
    await expect(inspector.getByText("UIKit proof appears after the buyer cares")).toBeVisible();
    await expect(inspector.getByText("TKHeader")).toBeVisible(); // a named UIKit proof element
    await expect(page.getByTestId("proof-strip")).toBeVisible(); // affordance now present

    const rec = await getRecorder(page);
    expect(rec.map((e) => e.reaction)).toContain("first-touch");
    expect(rec.map((e) => e.reaction)).toContain("inspector-open");
    expect(await surfaceAttr(page, "data-motion-state")).toBe("first-touch");
  });

  test("post-touch inspector includes alive loading, empty, and error states", async ({ page }) => {
    await page.goto("/");
    await waitForMotionState(page, "idle");

    await page.locator('[data-slot="content"]').click();
    await waitForMotionState(page, "first-touch");

    const states = page.getByTestId("state-strip");
    await expect(states.getByText("Loading")).toBeVisible();
    await expect(states.getByText("Empty")).toBeVisible();
    await expect(states.getByText("Error")).toBeVisible();
    await expect(states.getByRole("button", { name: "Retry" })).toBeVisible();
  });

  test("recorder events expose the deterministic public event shape", async ({ page }) => {
    await page.goto("/");
    await waitForMotionState(page, "idle");

    const rec = await getRecorder(page);
    expect(rec[0]).toEqual(
      expect.objectContaining({
        source: "system",
        target: "surface.birth",
        reaction: "birth-seed",
        status: "mock",
        scene: "firstLaunch",
        context: "shop",
        timestamp: 0,
      }),
    );
    expect(rec.every((e) => ["native", "mock", "fallback"].includes(e.status))).toBe(true);
    expect(rec.every((e) => typeof e.context === "string")).toBe(true);
    expect(rec.map((e) => e.motionState)).toEqual(["seed", "rails", "assembling", "idle"]);
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
 * Visual snapshot gate (SC-011). Transient frames are frozen via `?motion=…`.
 * The light sweep is a visual effect during assembly, not a public motion state.
 */
const SNAPSHOT_STATES = ["seed", "rails", "assembling", "idle", "first-touch"] as const;

test.describe("US1 first launch — visual snapshots", () => {
  for (const state of SNAPSHOT_STATES) {
    test(`frame: ${state}`, async ({ page }) => {
      await page.goto(`/?motion=${state}`);
      await waitForMotionState(page, state);
      await expect(page).toHaveScreenshot(`first-launch-${state}.png`);
    });
  }
});
