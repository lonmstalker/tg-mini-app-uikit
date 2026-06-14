import { expect, test } from "@playwright/test";

const atomStories = [
  { id: "atoms-buttons--button-variants", role: "button", name: "Filled" },
  { id: "atoms-buttons--icon-buttons", role: "button", name: "Favorite" },
  { id: "atoms-buttons--inline-buttons", role: "button", name: "Daily" },
  { id: "atoms-buttons--main-button-and-spinner", role: "button", name: "Pay" },
  { id: "atoms-controls--binary-controls", role: "checkbox", name: "Selected" },
  { id: "atoms-controls--chips", text: "Featured" },
  { id: "atoms-controls--sliders", role: "slider", name: "Discount" },
  { id: "atoms-controls--stepper-and-rating", role: "button", name: "Increase" },
  { id: "atoms-display--badges-and-counters", text: "Confirmed" },
  { id: "atoms-display--avatars", text: "+2" },
  { id: "atoms-display--media", text: "Image fallback" },
  { id: "atoms-display--spoiler-and-quote", text: "Telegram-style quote with an accent rail." },
  { id: "atoms-inputs--text-fields", role: "textbox", name: "Email" },
  { id: "atoms-inputs--text-area", role: "textbox", name: "Message" },
  { id: "atoms-inputs--search", selector: "input" },
  { id: "atoms-inputs--choice-inputs", role: "combobox", name: "City" },
  { id: "atoms-inputs--file-upload", text: "Upload receipt" },
  { id: "atoms-icons--icon-gallery", text: "check" },
  { id: "atoms-service--tappable-surface", text: "Tappable surface" },
  { id: "atoms-service--hidden-label", role: "button", name: "Unread notifications" },
] as const;

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
});
