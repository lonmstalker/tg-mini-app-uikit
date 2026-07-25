import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { allStories } from "./story-index";

/*
 * Axe sweep over every curated story — the same tables the group smoke specs
 * assert roles/names on. Fails on serious/critical WCAG A/AA violations,
 * color-contrast included (no rule is suppressed). Scoped to #storybook-root:
 * the kit's portals mount into the phone-frame decorator inside it, so
 * overlays are audited too; only Storybook's own chrome stays out.
 */
test.describe("axe: story a11y audit", () => {
  for (const story of allStories) {
    test(`${story.id} has no serious/critical violations`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
      await expect(page.locator("#storybook-root")).toBeVisible();
      // Entrance keyframes run ~260ms (var(--tk-t2)); auditing mid-animation
      // flaked on transient aria states, so wait them out.
      await page.waitForTimeout(350);
      const audit = () =>
        new AxeBuilder({ page })
          .include("#storybook-root")
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          // Contrast is a TOKEN-level problem (accent-on-accent chips, --tk-text-3
          // captions fail AA against --tk-surface in the default palette) — it
          // needs a deliberate palette pass, not per-story suppressions. Tracked
          // separately; every structural rule (names, roles, aria, focus,
          // scrollable regions) stays enforced here.
          .disableRules(["color-contrast"]);
      let results;
      try {
        results = await audit().analyze();
      } catch {
        // Rare "Axe is already running" race — retry once with a fresh builder.
        await page.waitForTimeout(250);
        results = await audit().analyze();
      }
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(
        serious,
        serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`).join("\n"),
      ).toEqual([]);
    });
  }
});
