import { expect, test } from "@playwright/test";
import { allStories } from "./story-index";
import { expectNoHorizontalOverflow, gotoStory } from "./sweep-helpers";

/*
 * RTL sweep: every curated story under dir="rtl" (the Storybook `rtl` toolbar
 * global, applied to document.documentElement by the preview decorator). The
 * assert is layout survival — nothing may escape the viewport when the axis
 * flips (A7). Runs at the default 402px frame.
 */
test.describe("rtl: stories under dir=rtl", () => {
  for (const story of allStories) {
    test(`${story.id} survives RTL`, async ({ page }) => {
      await gotoStory(page, story.id, "rtl:rtl");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expectNoHorizontalOverflow(page, `${story.id} @ rtl`);
    });
  }
});
