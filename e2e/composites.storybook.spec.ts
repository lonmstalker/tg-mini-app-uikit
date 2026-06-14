import { expect, test } from "@playwright/test";

const compositeStories = [
  { id: "composites-overlays--modal-surfaces", text: "Confirm payout" },
  { id: "composites-overlays--action-sheet", text: "Share receipt" },
  { id: "composites-overlays--tooltip", role: "button", name: "Settlement status" },
  { id: "composites-overlays--anchored-popper", text: "Archive" },
  { id: "composites-overlays--toasts", text: "Saved to Telegram CloudStorage" },
  { id: "composites-forms--calendar-and-date-input", text: "Delivery date" },
  { id: "composites-forms--masked-inputs", text: "Invite code" },
  { id: "composites-forms--pin-and-chips", text: "Wallet access" },
  { id: "composites-cards--card-primitives", text: "Wallet" },
  { id: "composites-feedback--skeletons", testId: "feedback-skeletons" },
  { id: "composites-feedback--progress-and-bars", text: "64%" },
  { id: "composites-feedback--empty-and-timeline", text: "No orders" },
  { id: "composites-gestures--pull-to-refresh", text: "Pull feed to refresh" },
  { id: "composites-gestures--swipe-actions", text: "Swipe row" },
  { id: "composites-gestures--long-press", role: "button", name: "Hold action" },
  { id: "composites-lists--grouped-cells", text: "Settings" },
  { id: "composites-lists--accordion-list", text: "Delivery window" },
  { id: "composites-lists--loading-and-virtualization", text: "Feed item" },
  { id: "composites-navigation--header-and-tabbar", text: "Orders" },
  { id: "composites-navigation--segmented-and-tabs", role: "button", name: "Two" },
  { id: "composites-navigation--steps-and-dots", text: "Confirm" },
  { id: "composites-nav--stack-flow", text: "Inbox" },
  { id: "composites-carousel--product-slides", text: "Matte case" },
] as const;

test.describe("composite Storybook stories", () => {
  for (const story of compositeStories) {
    test(`${story.id} renders`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
      const root = page.locator("#storybook-root");
      await expect(root).toBeVisible();
      if ("text" in story) {
        await expect(root.getByText(story.text, { exact: true }).first()).toBeVisible();
      } else if ("role" in story) {
        await expect(root.getByRole(story.role, { name: story.name, exact: true })).toBeVisible();
      } else {
        await expect(root.getByTestId(story.testId)).toBeVisible();
      }
    });
  }
});
