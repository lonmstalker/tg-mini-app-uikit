import { expect, test } from "@playwright/test";
import { allStories } from "./story-index";
import { expectNoHorizontalOverflow, gotoStory } from "./sweep-helpers";

/*
 * REFLOW (WCAG 1.4.10) over every curated story at 320 CSS px — the smallest
 * real Android Telegram viewport (equivalent to 400% zoom of a 1280px
 * desktop). No story may require horizontal scrolling — at the default font
 * and at the 18px large-font toolbar setting (A7: survive real content).
 * The narrow viewport is pinned here in-spec, not via a separate Playwright
 * project, so the sweep cannot silently detach from the config.
 */
test.use({ viewport: { width: 320, height: 874 } });

test.describe("reflow: stories at 320px", () => {
  for (const story of allStories) {
    test(`${story.id} reflows at 320px`, async ({ page }) => {
      await gotoStory(page, story.id);
      await expectNoHorizontalOverflow(page, story.id);
    });

    test(`${story.id} reflows at 320px with 18px font`, async ({ page }) => {
      await gotoStory(page, story.id, "fontSize:18");
      await expectNoHorizontalOverflow(page, `${story.id} @ 18px font`);
    });
  }
});

test("zoom 200% does not force horizontal scrolling (page shell)", async ({ page }) => {
  // WCAG 1.4.10: 640px viewport + 200% zoom = an effective 320px page — the
  // "zoomed-in browser" scenario. Element rects are reported in zoomed
  // coordinates, so only the document metric is meaningful.
  await page.setViewportSize({ width: 640, height: 874 });
  await gotoStory(page, "foundation-layout--page-shell");
  await page.evaluate(() => {
    (document.documentElement.style as CSSStyleDeclaration & { zoom: string }).zoom = "200%";
  });
  await page.waitForTimeout(100);
  await expectNoHorizontalOverflow(page, "page shell @ zoom 200%", { documentOnly: true });
});
