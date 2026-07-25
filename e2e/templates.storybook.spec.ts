import { expect, test } from "@playwright/test";
import { templateStories } from "./story-index";

test.describe("template Storybook stories", () => {
  for (const story of templateStories) {
    test(`${story.id} renders`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
      const root = page.locator("#storybook-root");
      await expect(root).toBeVisible();
      if ("text" in story) {
        await expect(root.getByText(story.text, { exact: true }).first()).toBeVisible();
      } else if ("role" in story) {
        await expect(root.getByRole(story.role, { name: story.name, exact: true }).first()).toBeVisible();
      } else {
        await expect(root.getByTestId(story.testId)).toBeVisible();
      }
    });
  }
});
