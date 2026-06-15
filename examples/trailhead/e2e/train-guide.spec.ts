import { expect, test, type Page } from "@playwright/test";
import { passOnboarding } from "./helpers";

/*
 * M5 acceptance — the thickened Train and Guide tabs.
 *  - Train pushes a session detail (TKSteps), and swipe-back returns to the list.
 *  - Guide: directory → long-press action sheet → profile → Message → DM thread,
 *    where a sent bubble shows a delivered/read status.
 */

interface Locale {
  name: string;
  query: string;
  train: string;
  guide: string;
}
const LOCALES: Locale[] = [
  { name: "en", query: "/?fast=1", train: "Train", guide: "Guide" },
  { name: "ru", query: "/?fast=1&lang=ru", train: "Форма", guide: "Гиды" },
];

const dismissWelcome = passOnboarding;

async function edgeSwipeBack(page: Page, stackTestId: string) {
  await page.evaluate(async ({ testId }) => {
    const stack = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null;
    if (!stack) throw new Error("stack not found");
    const r = stack.getBoundingClientRect();
    const y = r.top + r.height / 2;
    const fire = (t: string, x: number) =>
      stack.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, pointerId: 1, clientX: x, clientY: y }));
    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
    fire("pointerdown", r.left + 4);
    for (let x = r.left + 24; x <= r.left + r.width * 0.9; x += 36) {
      fire("pointermove", x);
      await sleep(8);
    }
    fire("pointerup", r.left + r.width * 0.9);
  }, { testId: stackTestId });
}

for (const locale of LOCALES) {
  test(`train [${locale.name}]: push a session detail, swipe-back returns to the list`, async ({ page }) => {
    await page.goto(locale.query);
    await dismissWelcome(page);

    await page.getByTestId("tabbar").getByRole("button", { name: locale.train }).click();
    await expect(page.getByTestId("panel-train-home")).toBeVisible();
    await expect(page.getByTestId("train-ring")).toBeVisible();
    await expect(page.getByTestId("train-leaderboard")).toBeVisible();

    // Push a session detail (TKSteps) and swipe back to the dashboard.
    await page.getByTestId("session-s-4").click();
    await expect(page.getByTestId("panel-train-session")).toBeVisible();
    await expect(page.getByTestId("session-steps")).toBeVisible();
    await edgeSwipeBack(page, "stack-train");
    await expect(page.getByTestId("panel-train-home")).toBeVisible();
  });

  test(`guide [${locale.name}]: directory → profile → DM thread with a delivered status`, async ({ page }) => {
    await page.goto(locale.query);
    await dismissWelcome(page);

    await page.getByTestId("tabbar").getByRole("button", { name: locale.guide }).click();
    await expect(page.getByTestId("panel-guide-directory")).toBeVisible();

    // Tap a guide → profile → Message → thread.
    await page.getByTestId("guide-row-g-sora").click();
    await expect(page.getByTestId("panel-guide-profile")).toBeVisible();
    await page.getByTestId("guide-message").click();
    await expect(page.getByTestId("panel-guide-thread")).toBeVisible();

    // Send a message; the sent bubble appears and its status ticks to delivered/read.
    const messages = page.getByTestId("guide-messages");
    // status check-marks present before sending (the loaded read message)
    const checksBefore = await messages.locator("svg").count();
    const writeBar = page.getByTestId("guide-write");
    await writeBar.locator("textarea, input").fill("See you at 7am!");
    await writeBar.getByRole("button").last().click();
    await expect(messages).toContainText("See you at 7am!");
    // The sent bubble's status progresses sent → delivered → read: a second
    // check-mark appears, so the thread gains 2 status marks for the new bubble.
    await expect.poll(() => messages.locator("svg").count()).toBeGreaterThanOrEqual(checksBefore + 2);
  });
}

test("guide: long-press opens the action sheet", async ({ page }) => {
  await page.goto("/?fast=1");
  await dismissWelcome(page);
  await page.getByTestId("tabbar").getByRole("button", { name: "Guide" }).click();
  await expect(page.getByTestId("panel-guide-directory")).toBeVisible();

  // Hold the row past the long-press duration → the action sheet opens.
  await page.evaluate(() => {
    const el = document.querySelector('[data-testid="guide-row-g-ilya"]') as HTMLElement;
    const r = el.getBoundingClientRect();
    el.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: r.left + 40, clientY: r.top + 30 }),
    );
  });
  await expect(page.getByTestId("guide-actions")).toBeVisible({ timeout: 2000 });
  await expect(page.getByTestId("guide-actions")).toContainText("Message");
});
