import { expect, test } from "@playwright/test";

const tokenStories = [
  { id: "tokens-typography--type-scale", role: "heading", name: "Checkout summary" },
  { id: "tokens-semantic-tokens--semantic-swatches", text: "Semantic tokens" },
] as const;

test.describe("token Storybook stories", () => {
  for (const story of tokenStories) {
    test(`${story.id} renders`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
      const root = page.locator("#storybook-root");
      await expect(root).toBeVisible();
      if ("text" in story) {
        await expect(root.getByText(story.text, { exact: true }).first()).toBeVisible();
      } else {
        await expect(root.getByRole(story.role, { name: story.name, exact: true })).toBeVisible();
      }
    });
  }
});
