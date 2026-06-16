import { expect, type Page } from "@playwright/test";

/*
 * Surface Composer e2e helpers. Determinism rule (D9, dom-contract §1): wait on
 * DOM state via `page.waitForFunction`, NEVER `waitForTimeout`. The recorder is
 * read through the deterministic `window.__composerRecorder` accessor.
 */

export const SURFACE = '[data-testid="surface"]';

/** Block until the surface root reports the given `data-motion-state`. */
export async function waitForMotionState(page: Page, state: string): Promise<void> {
  await page.waitForFunction(
    (s) => document.querySelector('[data-testid="surface"]')?.getAttribute("data-motion-state") === s,
    state,
  );
}

/** Block until the surface root reports the given `data-business-context`. */
export async function waitForBusinessContext(page: Page, context: string): Promise<void> {
  await page.waitForFunction(
    (c) => document.querySelector('[data-testid="surface"]')?.getAttribute("data-business-context") === c,
    context,
  );
}

export async function surfaceAttr(page: Page, attr: string): Promise<string | null> {
  return page.locator(SURFACE).getAttribute(attr);
}

export interface RecorderEventLite {
  id: string;
  scene: string;
  source: string;
  target: string;
  reaction: string;
  status: string;
  motionState: string;
  businessContext?: string;
  timestamp: number;
}

/** Read the full recorder log via the deterministic accessor (dom-contract §2). */
export async function getRecorder(page: Page): Promise<RecorderEventLite[]> {
  return page.evaluate(() => {
    const read = (window as unknown as { __composerRecorder?: () => RecorderEventLite[] }).__composerRecorder;
    return read ? read() : [];
  });
}

/** Assert the recorder's reaction sequence equals an expected ordered list (a fixture). */
export async function expectReactionSequence(page: Page, expected: readonly string[]): Promise<void> {
  const rec = await getRecorder(page);
  expect(rec.map((e) => e.reaction)).toEqual([...expected]);
}

/*
 * Vocabulary that must NOT appear in the buyer-first first viewport (Principle
 * III, SC-002). Curated to be technical terms a buyer surface would never use,
 * so a hit is a real leak, not a false positive.
 */
export const FORBIDDEN_TERMS = [
  "token",
  "recorder",
  "runtime",
  "mock",
  "fallback",
  "uikit",
  "component",
  "snapshot",
  "reducer",
  "playwright",
  "fixture",
  "motion-state",
  "data-attribute",
] as const;

export async function visibleText(page: Page, scope: string = SURFACE): Promise<string> {
  return (await page.locator(scope).innerText()).toLowerCase();
}

/** Fail if any forbidden buyer-first term is visible in the scope. */
export async function expectNoForbiddenTerms(page: Page, scope: string = SURFACE): Promise<void> {
  const text = await visibleText(page, scope);
  const hits = FORBIDDEN_TERMS.filter((t) => text.includes(t));
  expect(hits, `forbidden buyer-first vocabulary present: ${hits.join(", ")}`).toEqual([]);
}

export async function emulateReducedMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
}

/** Load the range-remix scene directly, settled at idle (shop). */
export async function gotoRemix(page: Page): Promise<void> {
  await page.goto("/?scene=rangeRemix");
  await waitForMotionState(page, "idle");
}

/** Drag the surface horizontally by `dx` px (a swipe gesture, not a tap). */
export async function dragSurface(page: Page, dx: number): Promise<void> {
  const box = await page.locator(SURFACE).boundingBox();
  if (!box) throw new Error("surface has no bounding box");
  const y = box.y + box.height * 0.4;
  const startX = box.x + box.width / 2;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(startX + dx, y, { steps: 8 });
  await page.mouse.up();
}
