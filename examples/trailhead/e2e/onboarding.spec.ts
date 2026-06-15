import { expect, test, type Page } from "@playwright/test";

/*
 * M6 acceptance — the first-run coach-mark tour, walked end to end (not skipped).
 * Three tooltips → an add-to-home prompt → the flag persists, so it does not
 * replay after a reload. Run in both languages.
 */

interface Locale {
  name: string;
  query: string;
  welcome: string;
  feed: string;
  tabs: string;
  streak: string;
  done: string;
  home: string;
}
const LOCALES: Locale[] = [
  {
    name: "en",
    query: "/?fast=1",
    welcome: "Welcome to Trailhead",
    feed: "Find your trail",
    tabs: "Five tabs",
    streak: "Build your streak",
    done: "Got it",
    home: "Add Trailhead to your home screen",
  },
  {
    name: "ru",
    query: "/?fast=1&lang=ru",
    welcome: "Добро пожаловать в Trailhead",
    feed: "Найдите свой маршрут",
    tabs: "Пять вкладок",
    streak: "Держите серию",
    done: "Понятно",
    home: "Добавить Trailhead на главный экран",
  },
];

const onboarding = (page: Page) => page.getByTestId("onboarding");

for (const locale of LOCALES) {
  test(`onboarding [${locale.name}]: walk the three coach marks, then it never replays`, async ({ page }) => {
    await page.goto(locale.query);

    // Welcome → start the tour.
    await expect(page.getByTestId("welcome")).toContainText(locale.welcome);
    await page.getByTestId("welcome-dismiss").click();

    // Step 1 (feed) → Next → step 2 (tabs) → Next → step 3 (streak).
    await expect(onboarding(page)).toContainText(locale.feed);
    await onboarding(page).getByRole("button").last().click();
    await expect(onboarding(page)).toContainText(locale.tabs);
    await onboarding(page).getByRole("button").last().click();
    await expect(onboarding(page)).toContainText(locale.streak);

    // Done → the add-to-home prompt appears and the tour closes.
    await onboarding(page).getByRole("button", { name: locale.done }).click();
    await expect(onboarding(page)).toHaveCount(0);
    await expect(page.getByText(locale.home)).toBeVisible();

    // Reopen: onboarding must not replay.
    await page.reload();
    await expect(page.getByTestId("tabbar")).toBeVisible();
    await expect(page.getByTestId("welcome")).toHaveCount(0);
    await expect(page.getByTestId("onboarding")).toHaveCount(0);
  });
}
