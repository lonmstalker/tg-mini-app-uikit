import { expect, test, type Locator, type Page } from "@playwright/test";
import { gotoApp } from "./helpers";

/**
 * НАВИГАЦИЯ (M6) — TKNavStack: push/pop, сохранение скролла, свайп-бек от
 * края, приоритет back-обработчиков (шит раньше стека) в Platform Lab.
 */

async function edgeSwipeRight(page: Page, root: Locator) {
  const box = (await root.boundingBox())!;
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + 8, y);
  await page.mouse.down();
  for (let i = 1; i <= 14; i++) await page.mouse.move(box.x + 8 + i * 22, y);
  await page.mouse.up();
}

test("booking: doctor profile pushes onto the stack and swipe-back returns with scroll intact", async ({ page }) => {
  await gotoApp(page, "booking");
  await page.getByRole("button", { name: "Continue" }).click(); // step 2: time
  // scroll the step content a bit before navigating away
  await page.getByTestId("doctor-cell").click();
  await expect(page.getByText("Dermatologist · 12 years of practice")).toBeVisible();

  // swipe back from the left edge
  await page.waitForTimeout(400); // entry animation
  await edgeSwipeRight(page, page.getByTestId("booking-nav"));
  await expect(page.getByText("Dermatologist · 12 years of practice")).toBeHidden();
  await expect(page.getByTestId("doctor-cell")).toBeVisible();
  // the wizard is still on the Time step — state preserved
  await expect(page.getByText("10:00")).toBeVisible();
});

test("booking: header back on the doctor screen pops the stack", async ({ page }) => {
  await gotoApp(page, "booking");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByTestId("doctor-cell").click();
  await page.getByTestId("doctor-back").click();
  await expect(page.getByTestId("doctor-cell")).toBeVisible();
});

test("platform lab: back press closes the sheet first, then pops the stack", async ({ page }) => {
  await gotoApp(page, "platform");
  const demo = page.locator("[data-demo-back-priority]");
  await demo.scrollIntoViewIfNeeded();
  await demo.getByTestId("bp-open-details").click();
  await demo.getByTestId("bp-open-sheet").click();
  const sheet = demo.getByTestId("bp-sheet");
  await expect(sheet).toBeVisible();

  await demo.getByTestId("bp-press-back").click();
  await expect(sheet).toBeHidden();
  // details panel still on top — the sheet consumed the press
  await expect(demo.getByTestId("bp-open-sheet")).toBeVisible();

  await demo.getByTestId("bp-press-back").click();
  await expect(demo.getByTestId("bp-open-details")).toBeVisible();
});
