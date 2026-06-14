import { expect, test } from "@playwright/test";

const templateStories = [
  { id: "templates-commerce--booking-checkout", text: "Book slot" },
  { id: "templates-cards--product-cards", text: "Travel tripod" },
  { id: "templates-cards--promotional-cards", text: "Weekend bonus" },
  { id: "templates-wallet--wallet-states", role: "button", name: "Connect wallet" },
  { id: "templates-gamification--progress-and-leaderboard", text: "Anna" },
  { id: "templates-chat--support-thread", text: "Support chat" },
  { id: "templates-chat--bubble-states", testId: "chat-bubble-incoming" },
  { id: "templates-onboarding--coach-mark", testId: "onboarding-tooltip" },
  { id: "templates-onboarding--confetti-burst", testId: "template-confetti" },
] as const;

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
