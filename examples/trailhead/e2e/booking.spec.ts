import { expect, test, type Page } from "@playwright/test";
import { passOnboarding } from "./helpers";

/*
 * M2 acceptance — the believable core. Walks Discover feed → detail → date/slot
 * → summary → Stars checkout behind a PIN, asserts confetti/success and that the
 * booking is persisted. Plus: a mid-funnel swipe-back keeps the chosen slot, and
 * the feed's failure → error/retry → content path (the M1 carryover).
 */

interface Locale {
  name: string;
  query: string;
  detailTitle: string;
  trips: string;
}
const LOCALES: Locale[] = [
  { name: "en", query: "/?fast=1", detailTitle: "Sunrise Ridge", trips: "Trips" },
  { name: "ru", query: "/?fast=1&lang=ru", detailTitle: "Рассветный хребет", trips: "Поездки" },
];

const dismissWelcome = passOnboarding;

async function edgeSwipeBack(page: Page, stackTestId: string) {
  await page.evaluate(async ({ testId }) => {
    const stack = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null;
    if (!stack) throw new Error("stack not found");
    const rect = stack.getBoundingClientRect();
    const y = rect.top + rect.height / 2;
    const fire = (type: string, x: number) =>
      stack.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, clientX: x, clientY: y }));
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    fire("pointerdown", rect.left + 4);
    for (let x = rect.left + 24; x <= rect.left + rect.width * 0.9; x += 36) {
      fire("pointermove", x);
      await sleep(8);
    }
    fire("pointerup", rect.left + rect.width * 0.9);
  }, { testId: stackTestId });
}

async function pickSlot(page: Page, time: string) {
  const slot = page.getByTestId("datetime-slots").getByRole("button", { name: time, exact: true });
  await slot.click();
}

async function enterPin(page: Page, digits: string) {
  const pad = page.getByTestId("checkout-pin");
  for (const d of digits) {
    await pad.getByRole("button", { name: d, exact: true }).click();
  }
  const submit = pad.getByRole("button", { name: /Done|Готово/ });
  if (await submit.count()) await submit.click();
}

for (const locale of LOCALES) {
  test(`booking [${locale.name}]: feed → detail → slot → pay → confetti → persisted`, async ({ page }) => {
    await page.goto(locale.query);
    await dismissWelcome(page);

    // Feed → detail
    await page.getByTestId("feed-card-sunrise-ridge").click();
    await expect(page.getByTestId("panel-discover-detail")).toContainText(locale.detailTitle);
    await expect(page.getByTestId("tabbar")).toBeHidden();

    // detail → date/slot
    await page.getByTestId("detail-book").click();
    await expect(page.getByTestId("panel-discover-datetime")).toBeVisible();
    await pickSlot(page, "07:00");
    await expect(page.getByTestId("datetime-continue")).toBeEnabled();

    // date/slot → summary
    await page.getByTestId("datetime-continue").click();
    await expect(page.getByTestId("summary-rows")).toContainText("1");

    // pay → confirm → PIN → invoice → success
    await page.getByTestId("summary-pay").click();
    await expect(page.getByTestId("summary-pay")).toBeHidden();
    await page.getByTestId("confirm-pay").click();
    await expect(page.getByTestId("checkout-pin")).toBeVisible();
    await enterPin(page, "1234");
    await expect(page.getByTestId("checkout-view-trips")).toBeVisible();

    // Parse the persisted bookings and count those for the new experience.
    const sunriseCount = () =>
      page.evaluate(() => {
        const key = Object.keys(localStorage).find((k) => k.endsWith("th_bookings"));
        const raw = key ? localStorage.getItem(key) : null;
        if (!raw) return 0;
        try {
          return (JSON.parse(raw) as { experienceId: string }[]).filter((b) => b.experienceId === "sunrise-ridge").length;
        } catch {
          return 0;
        }
      });

    // booking persisted (the new sunrise-ridge booking joins the cedar-loop seed)
    await expect.poll(sunriseCount).toBe(1);
    // exactly one — no double-book from the re-entry latch / stable id

    // success CTA lands on Trips
    await page.getByTestId("checkout-view-trips").click();
    await expect(page.getByTestId("tab-panel-trips")).toBeVisible();

    // the NEW booking survives a reload (cloud-backed), not just the seed
    await page.reload();
    await expect(page.getByTestId("tabbar")).toBeVisible();
    expect(await sunriseCount()).toBe(1);
  });
}

test("booking: a failed payment shows error + retry, then succeeds", async ({ page }) => {
  await page.goto("/?fast=1&failpay=1");
  await dismissWelcome(page);

  await page.getByTestId("feed-card-sunrise-ridge").click();
  await page.getByTestId("detail-book").click();
  await pickSlot(page, "07:00");
  await page.getByTestId("datetime-continue").click();
  await page.getByTestId("summary-pay").click();
  await page.getByTestId("confirm-pay").click();
  await enterPin(page, "1234");

  // The first attempt is faked as cancelled → error state with a retry control.
  await expect(page.getByTestId("checkout-error")).toBeVisible();
  await page.getByTestId("checkout-retry").click();

  // Retry: re-enter the PIN (already set) → the payment now succeeds.
  await enterPin(page, "1234");
  await expect(page.getByTestId("checkout-view-trips")).toBeVisible();
});

test("booking: cancelled Stars payment offers an explicit demo completion without spending Stars", async ({ page }) => {
  await page.goto("/?fast=1&failpay=1&lang=ru");
  await dismissWelcome(page);

  await page.getByTestId("feed-card-sunrise-ridge").click();
  await page.getByTestId("detail-book").click();
  await pickSlot(page, "07:00");
  await page.getByTestId("datetime-continue").click();
  await page.getByTestId("summary-pay").click();
  await expect(page.getByTestId("summary-pay")).toBeHidden();

  await expect(page.getByTestId("checkout-safety")).toContainText("реальный платёж");
  await page.getByTestId("confirm-pay").click();
  await enterPin(page, "1234");

  await expect(page.getByTestId("checkout-error")).toContainText("звёзды не списаны");
  await expect(page.getByTestId("checkout-demo-paid")).toBeVisible();
  await page.getByTestId("checkout-demo-paid").click();
  await expect(page.getByTestId("checkout-view-trips")).toBeVisible();
  await page.getByRole("button", { name: /Close|Закрыть/ }).click();
  await expect(page.getByTestId("tab-panel-trips")).toBeVisible();
});

test("booking: checkout accepts a stored PIN longer than four digits", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("tg-demo-secure:th_pin", "123456");
  });
  await page.goto("/?fast=1");
  await dismissWelcome(page);

  await page.getByTestId("feed-card-sunrise-ridge").click();
  await page.getByTestId("detail-book").click();
  await pickSlot(page, "07:00");
  await page.getByTestId("datetime-continue").click();
  await page.getByTestId("summary-pay").click();
  await page.getByTestId("confirm-pay").click();

  await enterPin(page, "123456");
  await expect(page.getByTestId("checkout-view-trips")).toBeVisible();
});

test("booking: PIN sheet opens high enough to show the Done action", async ({ page }) => {
  await page.goto("/?fast=1&lang=ru");
  await dismissWelcome(page);

  await page.getByTestId("feed-card-sunrise-ridge").click();
  await page.getByTestId("detail-book").click();
  await pickSlot(page, "07:00");
  await page.getByTestId("datetime-continue").click();
  await page.getByTestId("summary-pay").click();
  await page.getByTestId("confirm-pay").click();

  await expect(page.getByTestId("checkout-pin")).toContainText("4-8");
  const done = page.getByTestId("checkout-pin").getByRole("button", { name: "Готово" });
  await expect(done).toBeVisible();
  await expect.poll(() =>
    page.evaluate(() => {
      const sheet = document.querySelector<HTMLElement>('[data-testid="checkout-sheet"]');
      const doneButton = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-testid="checkout-pin"] button')).find(
        (button) => button.textContent?.trim() === "Готово",
      );
      if (!sheet || !doneButton) throw new Error("sheet or Done button missing");
      return doneButton.getBoundingClientRect().bottom <= sheet.getBoundingClientRect().bottom - 8;
    }),
  ).toBe(true);
});

test("booking: mid-funnel swipe-back keeps the chosen slot", async ({ page }) => {
  await page.goto("/?fast=1");
  await dismissWelcome(page);

  await page.getByTestId("feed-card-blue-canyon").click();
  await page.getByTestId("detail-book").click();
  await pickSlot(page, "10:00");
  await expect(page.getByTestId("datetime-continue")).toBeEnabled();
  await page.getByTestId("datetime-continue").click();
  await expect(page.getByTestId("panel-discover-summary")).toBeVisible();

  // Swipe back from summary to date/slot — the slot must still be chosen, so the
  // Continue button is still enabled (the booking draft lives in the store).
  await edgeSwipeBack(page, "stack-discover");
  await expect(page.getByTestId("panel-discover-datetime")).toBeVisible();
  await expect(page.getByTestId("datetime-continue")).toBeEnabled();
});

test("feed: failure shows error + retry, clearing it shows content", async ({ page }) => {
  await page.goto("/?fast=1&fail=1");
  await dismissWelcome(page);

  // The failure flag makes the first feed load error out, with a retry control.
  await expect(page.getByTestId("feed-error")).toBeVisible();

  // Clear the flag, retry → content loads.
  await page.evaluate(() => {
    (window as unknown as { __trailheadApi?: { configureMockApi: (c: { fail: boolean }) => void } }).__trailheadApi?.configureMockApi(
      { fail: false },
    );
  });
  await page.getByTestId("feed-error").getByRole("button").first().click();
  await expect(page.getByTestId("feed-list")).toBeVisible();
  await expect(page.getByTestId("feed-card-sunrise-ridge")).toBeVisible();
});

test("feed: filters live in a sheet and reset without crowding the feed header", async ({ page }) => {
  await page.goto("/?fast=1");
  await dismissWelcome(page);
  await expect(page.getByTestId("feed-list")).toBeVisible();
  await expect(page.getByTestId("feed-categories")).toHaveCount(0);
  await expect(page.getByTestId("feed-chips")).toHaveCount(0);
  await expect(page.getByTestId("feed-search-toolbar")).toBeVisible();
  await expect(page.getByTestId("feed-filter-label")).toBeVisible();
  await expect(page.getByTestId("feed-search-toolbar")).toHaveAttribute("data-search-active", "false");

  await page.getByTestId("feed-filter-open").click();
  await expect(page.getByTestId("feed-filter-sheet")).toBeVisible();
  await page.getByTestId("feed-filter-cat-forest").click();
  await page.getByTestId("feed-filter-apply").click();

  await expect(page.getByTestId("feed-card-cedar-loop")).toBeVisible();
  await expect(page.getByTestId("feed-card-sunrise-ridge")).toHaveCount(0);

  await page.getByTestId("feed-filter-open").click();
  await page.getByTestId("feed-filter-reset-sheet").click();
  await page.getByTestId("feed-filter-apply").click();
  await expect(page.getByTestId("feed-card-sunrise-ridge")).toBeVisible();
});

test("feed: search expands over the filter label and collapses back on blur", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?fast=1&lang=ru");
  await dismissWelcome(page);

  const toolbar = page.getByTestId("feed-search-toolbar");
  const label = page.getByTestId("feed-filter-label");
  await expect(toolbar).toHaveAttribute("data-search-active", "false");
  await expect(label).toHaveAttribute("data-collapsed", "false");
  const idle = await page.evaluate(() => {
    const search = document.querySelector('[data-testid="feed-search"]');
    const filter = document.querySelector('[data-testid="feed-filter-open"]');
    if (!search || !filter) throw new Error("search toolbar not found");
    return {
      search: search.getBoundingClientRect().width,
      filter: filter.getBoundingClientRect().width,
    };
  });

  await page.getByPlaceholder("Поиск походов").click();
  await expect(toolbar).toHaveAttribute("data-search-active", "true");
  await expect(label).toHaveAttribute("data-collapsed", "true");
  const focusedDims = () => page.evaluate(() => {
    const search = document.querySelector('[data-testid="feed-search"]');
    const filter = document.querySelector('[data-testid="feed-filter-open"]');
    if (!search || !filter) throw new Error("search toolbar not found");
    return {
      search: search.getBoundingClientRect().width,
      filter: filter.getBoundingClientRect().width,
    };
  });
  await expect.poll(async () => (await focusedDims()).search).toBeGreaterThan(idle.search);
  await expect.poll(async () => (await focusedDims()).filter).toBeLessThan(idle.filter);

  await page.getByTestId("feed-filter-open").click();
  await expect(page.getByTestId("feed-filter-sheet")).toBeVisible();
  await expect(toolbar).toHaveAttribute("data-search-active", "false");
  await expect(label).toHaveAttribute("data-collapsed", "false");
});

test("feed: focusing search keeps the route list mounted", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?fast=1&lang=ru");
  await dismissWelcome(page);

  await expect(page.getByTestId("feed-list")).toBeVisible();
  await page.getByPlaceholder("Поиск походов").click();
  await expect(page.getByTestId("feed-list")).toBeVisible();
  await expect(page.getByTestId("feed-filter-open")).toBeVisible();

  await page.getByPlaceholder("Поиск походов").fill("кедр");
  await expect(page.getByTestId("feed-card-cedar-loop")).toBeVisible();
  await expect(page.getByTestId("feed-card-sunrise-ridge")).toHaveCount(0);
});

test("feed: focusing search hides the bottom tabbar while the keyboard overlaps the viewport", async ({ page }) => {
  await page.addInitScript(() => {
    const listeners = new Set<() => void>();
    const viewport = {
      height: 844,
      offsetTop: 0,
      addEventListener: (event: string, handler: () => void) => {
        if (event === "resize") listeners.add(handler);
      },
      removeEventListener: (_event: string, handler: () => void) => {
        listeners.delete(handler);
      },
    };
    Object.defineProperty(window, "innerHeight", { value: 844, configurable: true });
    Object.defineProperty(window, "visualViewport", { value: viewport, configurable: true });
    (window as unknown as { __trailheadKeyboard: (height: number) => void }).__trailheadKeyboard = (height: number) => {
      viewport.height = 844 - height;
      listeners.forEach((handler) => handler());
    };
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?fast=1&lang=ru");
  await dismissWelcome(page);

  await expect(page.getByTestId("tabbar")).toBeVisible();
  await page.getByPlaceholder("Поиск походов").click();
  await page.evaluate(() => (window as unknown as { __trailheadKeyboard: (height: number) => void }).__trailheadKeyboard(320));
  await expect(page.getByTestId("tabbar")).toBeHidden();

  await page.evaluate(() => (window as unknown as { __trailheadKeyboard: (height: number) => void }).__trailheadKeyboard(0));
  await expect(page.getByTestId("tabbar")).toBeVisible();
});
