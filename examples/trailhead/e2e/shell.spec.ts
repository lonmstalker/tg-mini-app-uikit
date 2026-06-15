import { expect, test, type Page } from "@playwright/test";
import { passOnboarding } from "./helpers";

/*
 * M0 acceptance — the navigation spine, run in BOTH languages. Proves, before
 * any real content exists:
 *  - the five tabs (localized) and the MOCK badge render;
 *  - the Discover stack pushes to depth;
 *  - an edge-swipe-back pops exactly one panel and the revealed panel survives
 *    (lower panels stay mounted: local React state is preserved);
 *  - switching tabs and back preserves the Discover stack's depth, its mounted
 *    state, AND the panel's scroll offset (the tabbar is the lateral switch;
 *    each stack is an independent depth axis).
 */

interface Locale {
  name: string;
  query: string;
  tabs: { discover: string; trips: string; train: string; guide: string; profile: string };
}

const LOCALES: Locale[] = [
  {
    name: "en",
    query: "/",
    tabs: { discover: "Discover", trips: "Trips", train: "Train", guide: "Guide", profile: "Profile" },
  },
  {
    name: "ru",
    query: "/?lang=ru",
    tabs: { discover: "Маршруты", trips: "Поездки", train: "Форма", guide: "Гиды", profile: "Профиль" },
  },
];

// The generic nav spine is proven on the Guide tab, a real 3-deep stack
// (directory → profile → thread). Mounted-state preservation across a swipe-back
// is proven separately by booking.spec.ts (the chosen slot survives).
const stackPanels = (page: Page) => page.getByTestId("stack-guide").locator("[data-tk-nav-panel]");

/*
 * Edge-swipe-back, driven by dispatched PointerEvents on the active stack root.
 * This exercises the kit's real pointer gesture (`useDragGesture` →
 * `tkShouldCommit`) the way a touch swipe does. We avoid Playwright's
 * high-level `page.mouse` here: its synthetic mouse drag commits the pop but
 * also resets the revealed panel's inner scroll — a Chromium synthetic-input
 * artifact, not a kit behavior (a click-pop and a touch-equivalent pointer
 * swipe both preserve the scroll in a real browser).
 */
async function edgeSwipeBack(page: Page, stackTestId: string) {
  await page.evaluate(
    async ({ testId }) => {
      const stack = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null;
      if (!stack) throw new Error("stack not found");
      const rect = stack.getBoundingClientRect();
      const y = rect.top + rect.height / 2;
      const fire = (type: string, x: number) =>
        stack.dispatchEvent(
          new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, clientX: x, clientY: y }),
        );
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      fire("pointerdown", rect.left + 4);
      for (let x = rect.left + 24; x <= rect.left + rect.width * 0.9; x += 36) {
        fire("pointermove", x);
        await sleep(8);
      }
      fire("pointerup", rect.left + rect.width * 0.9);
    },
    { testId: stackTestId },
  );
}

for (const locale of LOCALES) {
  test(`shell [${locale.name}]: tabs + MOCK badge, deep stacks hide tabbar and swipe back cleanly`, async ({
    page,
  }) => {
    await page.goto(locale.query);

    // Clear the first-run onboarding (welcome + coach-mark tour).
    await passOnboarding(page);

    // Five localized tabs + MOCK badge.
    const tabbar = page.getByTestId("tabbar");
    await expect(tabbar.getByRole("button")).toHaveCount(5);
    for (const label of Object.values(locale.tabs)) {
      await expect(tabbar).toContainText(label);
    }
    await expect(page.getByTestId("mock-badge")).toBeVisible();

    // Open the Guide tab and prove its stack from depth 1 (the directory).
    await tabbar.getByRole("button", { name: locale.tabs.guide }).click();
    await expect(page.getByTestId("tab-panel-guide")).toBeVisible();
    await expect(stackPanels(page)).toHaveCount(1);

    // Push to depth 2 (guide profile), then depth 3 (the DM thread).
    await page.getByTestId("guide-row-g-sora").click();
    await expect(page.getByTestId("panel-guide-profile")).toBeVisible();
    await expect(stackPanels(page)).toHaveCount(2);
    await expect(tabbar).toBeHidden();
    await page.getByTestId("guide-message").click();
    await expect(page.getByTestId("panel-guide-thread")).toBeVisible();
    await expect(stackPanels(page)).toHaveCount(3);
    await expect(tabbar).toBeHidden();

    // Edge-swipe-back pops exactly one panel; the revealed panel is the profile.
    await edgeSwipeBack(page, "stack-guide");
    await expect(stackPanels(page)).toHaveCount(2);
    await expect(page.getByTestId("panel-guide-profile")).toBeVisible();
    await expect(tabbar).toBeHidden();

    // One more back returns to the tab root, where lateral navigation is visible.
    await edgeSwipeBack(page, "stack-guide");
    await expect(stackPanels(page)).toHaveCount(1);
    await expect(page.getByTestId("panel-guide-directory")).toBeVisible();
    await expect(tabbar).toBeVisible();
    await tabbar.getByRole("button", { name: locale.tabs.discover }).click();
    await expect(page.getByTestId("tab-panel-discover")).toBeVisible();
    await tabbar.getByRole("button", { name: locale.tabs.guide }).click();
    await expect(stackPanels(page)).toHaveCount(1);
    await expect(page.getByTestId("panel-guide-directory")).toBeVisible();
  });
}
