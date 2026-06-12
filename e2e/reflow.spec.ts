import { expect, test, type Page } from "@playwright/test";
import { GALLERY_SECTIONS, gallerySection, gotoApp, type DemoApp } from "./helpers";

/**
 * REFLOW (WCAG 1.4.10) — runs in the `narrow-320` project (320 CSS px wide,
 * the smallest real Android Telegram viewport, equivalent to 400% zoom of a
 * 1280px desktop). No screen may require horizontal scrolling.
 */

const APPS: DemoApp[] = ["shop", "booking", "game", "platform", "gallery"];

async function expectNoHorizontalOverflow(page: Page, label: string, opts: { documentOnly?: boolean } = {}) {
  const overflow = await page.evaluate((documentOnly) => {
    const doc = document.scrollingElement!;
    const docOverflow = doc.scrollWidth - doc.clientWidth;
    if (documentOnly) return { docOverflow, offenders: [] as string[] };
    // Also catch inner scrollers pushed wider than the viewport
    const offenders: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
      const r = el.getBoundingClientRect();
      if (r.width > 1 && (r.right > window.innerWidth + 1 || r.left < -1)) {
        const style = getComputedStyle(el);
        // horizontal carousels/scrollers are allowed to overflow by design
        if (style.overflowX === "auto" || style.overflowX === "scroll") continue;
        if (el.closest('[data-demo-hscroll], [style*="overflow-x"]')) continue;
        const scroller = (function findScroller(node: HTMLElement | null): boolean {
          for (let n = node; n && n !== document.body; n = n.parentElement) {
            const s = getComputedStyle(n);
            if (s.overflowX === "auto" || s.overflowX === "scroll") return true;
          }
          return false;
        })(el.parentElement);
        if (scroller) continue;
        offenders.push(`${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(" ")[0] : ""} (${Math.round(r.left)}..${Math.round(r.right)})`);
      }
    }
    return { docOverflow, offenders: offenders.slice(0, 12) };
  }, opts.documentOnly ?? false);
  expect(overflow.docOverflow, `${label}: document scrolls horizontally`).toBeLessThanOrEqual(0);
  expect(overflow.offenders, `${label}: elements escape the 320px viewport:\n${overflow.offenders.join("\n")}`).toEqual([]);
}

for (const app of APPS) {
  test(`${app} reflows at 320px`, async ({ page }) => {
    await gotoApp(page, app);
    if (app === "gallery") {
      for (const slug of GALLERY_SECTIONS) await gallerySection(page, slug);
    }
    await expectNoHorizontalOverflow(page, app);
  });
}

test("zoom 200% does not force horizontal scrolling (shop)", async ({ page }) => {
  // WCAG 1.4.10: content must reflow at 320 CSS px. 640px viewport + 200%
  // zoom = an effective 320px page — the "zoomed in browser" scenario.
  await page.setViewportSize({ width: 640, height: 874 });
  await gotoApp(page, "shop");
  await page.evaluate(() => {
    (document.documentElement.style as CSSStyleDeclaration & { zoom: string }).zoom = "200%";
  });
  await page.waitForTimeout(100);
  // Element rects are reported in zoomed coordinates — only the document
  // metric is meaningful here.
  await expectNoHorizontalOverflow(page, "shop @ zoom 200%", { documentOnly: true });
});

test.describe("320px visual spot checks", () => {
  test("shop home", async ({ page }) => {
    const root = await gotoApp(page, "shop");
    await expect(root).toHaveScreenshot("narrow-shop-home.png");
  });

  test("gallery buttons + inputs", async ({ page }) => {
    await gotoApp(page, "gallery");
    await expect(await gallerySection(page, "buttons")).toHaveScreenshot("narrow-gallery-buttons.png");
    await expect(await gallerySection(page, "inputs")).toHaveScreenshot("narrow-gallery-inputs.png");
  });

  test("booking home", async ({ page }) => {
    const root = await gotoApp(page, "booking");
    await expect(root).toHaveScreenshot("narrow-booking-home.png");
  });
});
