import { expect, test } from "@playwright/test";
import { compositeStories } from "./story-index";

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

  test("sheet from a clipped, transformed card portals to the phone viewport (REU-009)", async ({ page }) => {
    await page.goto("/iframe.html?id=composites-overlays--portaled-from-scrolling-content&viewMode=story");
    await page.getByRole("button", { name: "Open sheet from a clipped, transformed card" }).click();
    const sheet = page.getByRole("dialog", { name: "Escaped the trap" });
    await expect(sheet).toBeVisible();
    // Portaled into the phone frame's [data-tk-portal-root] viewport — not
    // trapped inside the transformed/overflow:hidden card it was opened from.
    await expect(sheet.locator("..")).toHaveAttribute("data-tk-portal-root", /.*/);
  });

  test("non-modal sheet opens without stealing document focus", async ({ page }) => {
    await page.goto("/iframe.html?id=composites-overlays--non-modal-sheet&viewMode=story");
    const trigger = page.getByTestId("non-modal-sheet-trigger");
    await trigger.click();
    await expect(page.getByRole("dialog", { name: "Autoplay preview" })).not.toHaveAttribute("aria-modal");
    await expect(page.locator("[data-tk-scrim]")).toHaveCount(0);
    await expect.poll(() => trigger.evaluate((node) => document.activeElement === node)).toBe(true);
  });

  test("calendar range commits a real mouse drag", async ({ page }) => {
    await page.goto("/iframe.html?id=composites-forms--calendar-range-drag&viewMode=story");
    const start = page.getByRole("button", { name: "June 10, 2026" });
    const end = page.getByRole("button", { name: "June 14, 2026" });
    const [startBox, endBox] = await Promise.all([start.boundingBox(), end.boundingBox()]);
    expect(startBox).not.toBeNull();
    expect(endBox).not.toBeNull();

    await page.mouse.move(startBox!.x + startBox!.width / 2, startBox!.y + startBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(endBox!.x + endBox!.width / 2, endBox!.y + endBox!.height / 2, { steps: 8 });
    await page.mouse.up();

    await expect(page.getByTestId("calendar-range-status")).toHaveText(
      "Selected range: Jun 10, 2026 – Jun 14, 2026",
    );

    await page.getByRole("button", { name: "June 22, 2026" }).click();
    await expect(page.getByTestId("calendar-range-status")).toHaveText("Selected range: Choose the end date");
    await page.getByRole("button", { name: "June 24, 2026" }).click();
    await expect(page.getByTestId("calendar-range-status")).toHaveText(
      "Selected range: Jun 22, 2026 – Jun 24, 2026",
    );
  });
});
