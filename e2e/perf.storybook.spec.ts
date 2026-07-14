import { expect, test, type CDPSession, type Page } from "@playwright/test";

/*
 * Structural perf assertions (2026-07-14 animation-smoothness plan, phase 0).
 *
 * Metrics are CDP counters (LayoutCount / RecalcStyleCount deltas over a
 * gesture window) and a React commit counter installed by the Storybook
 * decorator (window.__tkCommits) — never frame timings, which flake on CI.
 *
 * The contract: while a finger drags or a transform animation plays, the main
 * thread does no per-frame layout and React does not commit per pointer move.
 */

test.use({ hasTouch: true });

async function cdp(page: Page): Promise<CDPSession> {
  const session = await page.context().newCDPSession(page);
  await session.send("Performance.enable");
  return session;
}

async function counters(session: CDPSession) {
  const { metrics } = await session.send("Performance.getMetrics");
  const get = (name: string) => metrics.find((m) => m.name === name)?.value ?? 0;
  return { layout: get("LayoutCount"), recalc: get("RecalcStyleCount") };
}

const commits = (page: Page) => page.evaluate(() => (window as unknown as { __tkCommits?: number }).__tkCommits ?? 0);

/** Dispatch a ~60Hz touch drag through CDP so real TouchEvents (and the derived
 * PointerEvents) hit the page — Playwright's mouse API skips touch paths. */
async function driveDrag(
  page: Page,
  session: CDPSession,
  from: { x: number; y: number },
  to: { x: number; y: number },
  steps = 20,
) {
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: from.x, y: from.y }] });
  for (let i = 1; i <= steps; i++) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps },
      ],
    });
    await page.waitForTimeout(16);
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await expect(page.locator("#storybook-root")).toBeVisible();
  // Let mount layouts and entrance animations settle before measuring.
  await page.waitForTimeout(600);
}

test.describe("gesture and animation perf", () => {
  test("slider drag: no per-frame layout, no per-move React commits", async ({ page }) => {
    await openStory(page, "atoms-controls--sliders");
    const slider = page.getByRole("slider");
    const box = (await slider.boundingBox())!;
    const session = await cdp(page);

    const before = await counters(session);
    const commitsBefore = await commits(page);
    await driveDrag(
      page,
      session,
      { x: box.x + box.width * 0.64, y: box.y + box.height / 2 },
      { x: box.x + box.width * 0.2, y: box.y + box.height / 2 },
    );
    const after = await counters(session);
    const commitsAfter = await commits(page);

    // The only per-frame layout allowed is the value bubble's own text update,
    // contained (`contain: layout style`) to its 36px box — one bounded layout
    // per painted frame, never a track/page reflow. The drag is 20 steps.
    expect(after.layout - before.layout, "layouts during slider drag").toBeLessThanOrEqual(24);
    expect(commitsAfter - commitsBefore, "React commits during slider drag").toBeLessThanOrEqual(3);
  });

  test("sheet drag: no per-frame layout, no per-move React commits", async ({ page }) => {
    await openStory(page, "composites-overlays--modal-surfaces");
    const sheet = page.getByRole("dialog", { name: "Transfer details" });
    const grab = sheet.getByText("Transfer details");
    const box = (await grab.boundingBox())!;
    const session = await cdp(page);

    const before = await counters(session);
    const commitsBefore = await commits(page);
    await driveDrag(
      page,
      session,
      { x: box.x + box.width / 2, y: box.y + box.height / 2 },
      { x: box.x + box.width / 2, y: box.y + box.height / 2 + 120 },
    );
    const after = await counters(session);
    const commitsAfter = await commits(page);

    expect(after.layout - before.layout, "layouts during sheet drag").toBeLessThanOrEqual(3);
    expect(commitsAfter - commitsBefore, "React commits during sheet drag").toBeLessThanOrEqual(4);
  });

  test("pull-to-refresh: plain mid-list scroll does not thrash layout", async ({ page }) => {
    await openStory(page, "composites-gestures--pull-to-refresh");
    const list = page.getByText("Coffee Bar");
    const box = (await list.boundingBox())!;
    const session = await cdp(page);

    const before = await counters(session);
    // Scroll UP the content (finger moves up) — the opposite of a pull; PTR
    // handlers must not read/write layout on this path.
    await driveDrag(
      page,
      session,
      { x: box.x + box.width / 2, y: box.y + 10 },
      { x: box.x + box.width / 2, y: box.y - 70 },
    );
    const after = await counters(session);

    expect(after.layout - before.layout, "layouts during plain scroll over PTR").toBeLessThanOrEqual(2);
  });

  test("segmented switch: indicator animation is transform-only", async ({ page }) => {
    await openStory(page, "composites-navigation--segmented-and-tabs");
    const session = await cdp(page);
    const target = page.getByRole("radio", { name: "Two" }).first();

    const before = await counters(session);
    await target.click();
    // Cover the whole indicator transition window (t2 = 260ms).
    await page.waitForTimeout(450);
    const after = await counters(session);

    // One layout for the click-triggered React commit is fine; per-frame layout
    // (animating left/width) is not.
    expect(after.layout - before.layout, "layouts during segmented indicator animation").toBeLessThanOrEqual(3);
  });
});
