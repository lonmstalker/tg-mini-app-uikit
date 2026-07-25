import { expect, type Page } from "@playwright/test";

/*
 * Shared no-horizontal-overflow walker for the reflow / RTL sweeps. Revived
 * from the pre-split `e2e/reflow.spec.ts` (removed in 954de5b): the document
 * must not scroll horizontally, and no element may escape the viewport unless
 * it lives inside a deliberate horizontal scroller (overflow-x: auto/scroll).
 */
export async function expectNoHorizontalOverflow(page: Page, label: string, opts: { documentOnly?: boolean } = {}) {
  const overflow = await page.evaluate((documentOnly) => {
    const doc = document.scrollingElement!;
    const docOverflow = doc.scrollWidth - doc.clientWidth;
    if (documentOnly) return { docOverflow, offenders: [] as string[] };
    const offenders: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
      const r = el.getBoundingClientRect();
      if (r.width > 1 && (r.right > window.innerWidth + 1 || r.left < -1)) {
        const style = getComputedStyle(el);
        // Horizontal carousels/scrollers overflow by design.
        if (style.overflowX === "auto" || style.overflowX === "scroll") continue;
        const scroller = (function findScroller(node: HTMLElement | null): boolean {
          for (let n = node; n && n !== document.body; n = n.parentElement) {
            const s = getComputedStyle(n);
            if (s.overflowX === "auto" || s.overflowX === "scroll") return true;
          }
          return false;
        })(el.parentElement);
        if (scroller) continue;
        offenders.push(
          `${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(" ")[0] : ""} (${Math.round(r.left)}..${Math.round(r.right)})`,
        );
      }
    }
    return { docOverflow, offenders: offenders.slice(0, 12) };
  }, opts.documentOnly ?? false);
  expect(overflow.docOverflow, `${label}: document scrolls horizontally`).toBeLessThanOrEqual(0);
  expect(overflow.offenders, `${label}: elements escape the viewport:\n${overflow.offenders.join("\n")}`).toEqual([]);
}

/** Open a story iframe and let entrance animations settle. */
export async function gotoStory(page: Page, id: string, globals?: string) {
  const g = globals ? `&globals=${globals}` : "";
  await page.goto(`/iframe.html?id=${id}&viewMode=story${g}`);
  await expect(page.locator("#storybook-root")).toBeVisible();
  await page.waitForTimeout(350);
}
