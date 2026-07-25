import { expect, test } from "@playwright/test";
import { atomStories } from "./story-index";

test.describe("atom Storybook stories", () => {
  for (const story of atomStories) {
    test(`${story.id} renders`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
      const root = page.locator("#storybook-root");
      await expect(root).toBeVisible();
      if ("text" in story) {
        await expect(root.getByText(story.text, { exact: true }).first()).toBeVisible();
      } else if ("role" in story) {
        await expect(root.getByRole(story.role, { name: story.name, exact: true })).toBeVisible();
      } else {
        await expect(root.locator(story.selector).first()).toBeVisible();
      }
    });
  }

  test("select dropdown escapes an overflow:hidden card (REU-010)", async ({ page }) => {
    await page.goto("/iframe.html?id=atoms-inputs--dropdown-escapes-clipping&viewMode=story");
    await page.getByRole("combobox", { name: "City (clipped card)" }).click();
    // The card is 120px tall with overflow:hidden; the portaled list renders
    // below it, so the option is actually clickable — a clipped inline list
    // would fail the actionability check here.
    await page.getByRole("option", { name: "Belgrade" }).click();
    await expect(page.getByRole("combobox", { name: "City (clipped card)" })).toContainText("Belgrade");
  });
});
