import { expect, test, type Page } from "@playwright/test";
import { passOnboarding } from "./helpers";

/*
 * M1 acceptance — close/reopen rehydration. Each Playwright test gets a fresh
 * browser context (empty localStorage, which backs the mock's CloudStorage), so
 * the onboarding shows on first run. Completing it (welcome + coach-mark tour)
 * persists the onboarding flag; after a reload the onboarding must NOT replay and
 * the seeded booking must survive.
 */

interface Locale {
  name: string;
  query: string;
  welcomeTitle: string;
}

const LOCALES: Locale[] = [
  { name: "en", query: "/", welcomeTitle: "Welcome to Trailhead" },
  { name: "ru", query: "/?lang=ru", welcomeTitle: "Добро пожаловать в Trailhead" },
];

const bookingsInStorage = (page: Page) =>
  page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) => k.endsWith("th_bookings"));
    return key ? localStorage.getItem(key) : null;
  });

for (const locale of LOCALES) {
  test(`persistence [${locale.name}]: onboarding does not replay, booking survives reload`, async ({ page }) => {
    await page.goto(locale.query);

    // First run: the welcome shows, in the right language.
    const welcome = page.getByTestId("welcome");
    await expect(welcome).toBeVisible();
    await expect(welcome).toContainText(locale.welcomeTitle);

    // The seed booking is already persisted on first hydration.
    await expect.poll(() => bookingsInStorage(page)).toContain("bk-seed");

    // Complete onboarding (welcome + tour) → the flag persists.
    await passOnboarding(page);

    // Reopen: the onboarding must not replay, and the booking is still stored.
    await page.reload();
    await expect(page.getByTestId("tabbar")).toBeVisible();
    await expect(page.getByTestId("welcome")).toHaveCount(0);
    await expect(page.getByTestId("onboarding")).toHaveCount(0);
    await expect.poll(() => bookingsInStorage(page)).toContain("bk-seed");
  });
}
