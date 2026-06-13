import { expect, test } from "@playwright/test";

const foundationStories = [
  { id: "foundation-theme--provider-themes", text: "Dark provider" },
  { id: "foundation-i18n--localized-controls", role: "button", name: "Готово" },
  { id: "foundation-options--grouped-options", role: "combobox", name: "City" },
  { id: "foundation-telegram--runtime-provider", text: "Telegram runtime vtest" },
] as const;

test.describe("foundation Storybook stories", () => {
  for (const story of foundationStories) {
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
