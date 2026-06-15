import { expect, test, type Page } from "@playwright/test";
import { passOnboarding } from "./helpers";

/*
 * M3 acceptance — Trips + the signature QR check-in. Completes the chain:
 *  - pull-to-refresh runs without minimizing the app;
 *  - swipe a booking cell to reveal Cancel, with an Undo toast that restores it;
 *  - the QR → biometric → location check-in flips the card to "Checked in",
 *    and it stays so after a reload.
 */

interface Locale {
  name: string;
  query: string;
  tripsTab: string;
  checkIn: string;
  cancel: string;
  undo: string;
  checkedIn: string;
}
const LOCALES: Locale[] = [
  { name: "en", query: "/?fast=1", tripsTab: "Trips", checkIn: "Check in", cancel: "Cancel", undo: "Undo", checkedIn: "Checked in" },
  { name: "ru", query: "/?fast=1&lang=ru", tripsTab: "Поездки", checkIn: "Отметиться", cancel: "Отменить", undo: "Вернуть", checkedIn: "Отмечено" },
];

async function openTrips(page: Page, tripsTab: string) {
  await passOnboarding(page);
  await page.getByTestId("tabbar").getByRole("button", { name: tripsTab }).click();
  await expect(page.getByTestId("panel-trips-list")).toBeVisible();
}

/** A horizontal pointer swipe across a cell to reveal its trailing actions. */
async function swipeLeft(page: Page, testId: string) {
  await page.evaluate(async ({ id }) => {
    const el = document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
    if (!el) throw new Error("cell not found");
    const r = el.getBoundingClientRect();
    const y = r.top + r.height / 2;
    const fire = (type: string, x: number) =>
      el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, clientX: x, clientY: y }));
    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
    fire("pointerdown", r.right - 20);
    for (let x = r.right - 44; x >= r.left + r.width * 0.25; x -= 22) {
      fire("pointermove", x);
      await sleep(10);
    }
    fire("pointerup", r.left + r.width * 0.25);
    await sleep(50);
  }, { id: testId });
}

for (const locale of LOCALES) {
  test(`checkin [${locale.name}]: QR → biometric → location flips the booking and survives reload`, async ({ page }) => {
    await page.goto(locale.query);
    await openTrips(page, locale.tripsTab);

    // The seed booking is "Confirmed" with a Check in action.
    await expect(page.getByTestId("trip-status-bk-seed")).not.toContainText(locale.checkedIn);
    await page.getByTestId("trip-card-bk-seed").getByText(locale.checkIn).click();
    await expect(page.getByTestId("panel-trips-detail")).toBeVisible();

    // Run the device chain.
    await page.getByTestId("checkin-cta").click();
    await expect(page.getByTestId("checkin-done")).toBeVisible();
    await expect(page.getByTestId("checkin-status-badge")).toContainText(locale.checkedIn);

    // Back in the list, the card now reads "Checked in".
    await page.getByTestId("checkin-back").click();
    await expect(page.getByTestId("trip-status-bk-seed")).toContainText(locale.checkedIn);

    // It survives a reload (persisted to cloud storage).
    await page.reload();
    await expect(page.getByTestId("tabbar")).toBeVisible();
    await page.getByTestId("tabbar").getByRole("button", { name: locale.tripsTab }).click();
    await expect(page.getByTestId("trip-status-bk-seed")).toContainText(locale.checkedIn);
  });
}

test("checkin: demo path explains how to test without a physical QR stand", async ({ page }) => {
  await page.goto("/?fast=1&lang=ru");
  await openTrips(page, "Поездки");

  await page.getByTestId("trip-card-bk-seed").getByText("Отметиться").click();
  await expect(page.getByTestId("checkin-test-card")).toContainText("Проверка без QR-стенда");
  await page.getByTestId("checkin-demo").click();
  await expect(page.getByTestId("checkin-done")).toBeVisible();
  await expect(page.getByTestId("checkin-status-badge")).toContainText("Отмечено");
});

test("trips: swipe to cancel shows an Undo toast that restores the booking", async ({ page }) => {
  await page.goto("/?fast=1");
  await openTrips(page, "Trips");

  await expect(page.getByTestId("trips-gesture-hints")).toContainText("Swipe");
  await expect(page.getByTestId("trips-gesture-hints")).toContainText("Pull");

  // Reveal the trailing actions with a swipe (fullSwipe is off, so the swipe
  // opens the rail rather than auto-firing the first action), then tap Cancel.
  await swipeLeft(page, "trip-cell-bk-seed");
  const cancel = page.getByTestId("trip-cell-bk-seed").getByText("Cancel");
  await expect(cancel).toBeVisible();
  await cancel.click();

  // The list is now empty, and an Undo toast is shown.
  await expect(page.getByTestId("trips-empty")).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();

  // Undo restores the booking.
  await expect(page.getByTestId("trip-card-bk-seed")).toBeVisible();
});

test("trips: pull-to-refresh indicator is reachable from the top of the page", async ({ page }) => {
  await page.goto("/?fast=1");
  await openTrips(page, "Trips");

  await expect.poll(() =>
    page.evaluate(() => {
      const panel = document.querySelector<HTMLElement>('[data-testid="panel-trips-list"]');
      const refresh = document.querySelector<HTMLElement>('[data-testid="trips-refresh"]');
      if (!panel || !refresh) throw new Error("trips panel or refresh root missing");
      return Math.abs(refresh.getBoundingClientRect().top - panel.getBoundingClientRect().top);
    }),
  ).toBeLessThan(6);

  await page.evaluate(async () => {
    const el = document.querySelector('[data-testid="trips-refresh"]') as HTMLElement | null;
    if (!el) throw new Error("no refresh");
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const fire = (type: string, y: number) =>
      el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, clientX: x, clientY: y }));
    fire("pointerdown", r.top + 18);
    fire("pointermove", r.top + 118);
  });
  const indicator = page.getByTestId("trips-refresh").locator(".tk-ptr");
  await expect(indicator).toBeVisible();
  await expect.poll(async () => {
    const box = await indicator.boundingBox();
    return box ? Math.min(box.width, box.height) : 0;
  }).toBeGreaterThanOrEqual(32);
});

test("trips: pull-to-refresh runs without minimizing the app", async ({ page }) => {
  await page.goto("/?fast=1");
  await openTrips(page, "Trips");

  // Pull down on the list; the kit guards vertical swipes during the pull, so
  // the app must not collapse and the list must remain.
  await page.evaluate(() => {
    const el = document.querySelector('[data-testid="trips-refresh"]') as HTMLElement | null;
    if (!el) throw new Error("no refresh");
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const fire = (type: string, y: number) =>
      el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, clientX: x, clientY: y }));
    fire("pointerdown", r.top + 10);
    for (let y = r.top + 30; y <= r.top + 180; y += 20) fire("pointermove", y);
    fire("pointerup", r.top + 180);
  });

  // The list is intact and the app was never closed/minimized (vertical swipes
  // are disabled at the app root, and the pull guards them too).
  await expect(page.getByTestId("trip-card-bk-seed")).toBeVisible();
  const closed = await page.evaluate(
    () => (window as unknown as { __trailheadMock?: { getState: () => { closed: boolean } } }).__trailheadMock?.getState().closed === true,
  );
  expect(closed).toBeFalsy();
});
