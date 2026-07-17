import { expect, test, type Page } from "@playwright/test";
import { passOnboarding } from "./helpers";

async function openDiscover(page: Page, query = "/?fast=1") {
  await page.goto(query);
  // The app boots async (the vendored bridge chunk loads before render), so a
  // bare count() right after goto() races the first render — on a cold CI
  // server it read 0, skipped onboarding, and the welcome overlay swallowed
  // every later click. Wait for the app to render first: the feed list mounts
  // in the same commit as the welcome sheet (and stays Playwright-visible
  // beneath it), so the count() check below is race-free. The check itself
  // stays: repeat openDiscover() calls on one page (the viewport loop) land
  // with onboarding already dismissed.
  await expect(page.getByTestId("feed-list")).toBeVisible();
  if ((await page.getByTestId("welcome-dismiss").count()) > 0) {
    await passOnboarding(page);
  }
}

async function overlapInCard(page: Page, id: string, metaPrefix: string): Promise<boolean> {
  return page.evaluate(
    ({ cardId, prefix }) => {
      const hit = document.querySelector(`[data-testid="feed-card-${cardId}"]`);
      const root = hit?.closest("[data-trailhead-feed-card]") ?? hit?.parentElement;
      if (!root) throw new Error(`feed card ${cardId} not found`);

      const byText = (match: (text: string) => boolean) =>
        Array.from(root.querySelectorAll<HTMLElement>("*")).find((el) => {
          const text = (el.textContent ?? "").trim();
          return text.length > 0 && match(text);
        });
      const price = root.querySelector<HTMLElement>(`[data-testid="feed-card-${cardId}-price"]`) ??
        byText((text) => /\d+\s+Stars$/.test(text));
      const meta = root.querySelector<HTMLElement>(`[data-testid="feed-card-${cardId}-meta"]`) ??
        byText((text) => text.startsWith(prefix));
      if (!price || !meta) throw new Error(`price/meta not found for ${cardId}`);

      const a = price.getBoundingClientRect();
      const b = meta.getBoundingClientRect();
      return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    },
    { cardId: id, prefix: metaPrefix },
  );
}

async function metadataIsSingleLine(page: Page, id: string): Promise<boolean> {
  return page.evaluate((cardId) => {
    const hit = document.querySelector(`[data-testid="feed-card-${cardId}"]`);
    const root = hit?.closest("[data-trailhead-feed-card]") ?? hit?.parentElement;
    const meta = root?.querySelector<HTMLElement>(`[data-testid="feed-card-${cardId}-meta"]`);
    if (!meta) throw new Error(`metadata not found for ${cardId}`);
    const rect = meta.getBoundingClientRect();
    return rect.height <= 24 && getComputedStyle(meta).whiteSpace === "nowrap";
  }, id);
}

async function openProfileLab(page: Page) {
  await openDiscover(page);
  await page.getByTestId("tabbar").getByRole("button", { name: "Profile" }).click();
  await page.getByTestId("open-lab").click();
  await expect(page.getByTestId("panel-profile-lab")).toBeVisible();
  await page.waitForTimeout(400);
}

test("polish: feed price and rating metadata do not collide at Telegram widths", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 700 },
  ]) {
    await page.setViewportSize(viewport);
    await openDiscover(page);

    await expect.poll(() => overlapInCard(page, "sunrise-ridge", "4.9")).toBe(false);
    await expect.poll(() => overlapInCard(page, "granite-peak", "4.7")).toBe(false);
    await expect.poll(() => metadataIsSingleLine(page, "sunrise-ridge")).toBe(true);
    await expect.poll(() => metadataIsSingleLine(page, "granite-peak")).toBe(true);
  }
});

test("polish: browser mock shows a visible back control on nested screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openDiscover(page);

  await page.getByTestId("feed-card-sunrise-ridge").click();
  await expect(page.getByTestId("panel-discover-detail")).toBeVisible();
  await expect(page.getByTestId("mock-back")).toBeVisible();

  await page.getByTestId("mock-back").getByRole("button").click();
  await expect(page.getByTestId("panel-discover-feed")).toBeVisible();
});

test("polish: date slot starts with a compact booking summary", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openDiscover(page);

  await page.getByTestId("feed-card-sunrise-ridge").click();
  await page.getByTestId("detail-book").click();
  await expect(page.getByTestId("panel-discover-datetime")).toBeVisible();
  await expect(page.getByTestId("datetime-summary")).toContainText("Sunrise Ridge");
  await expect(page.getByTestId("datetime-summary")).toContainText("1 Stars");
});

test("polish: guide same-trip badges stay compact and do not squeeze the row title", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openDiscover(page);

  await page.getByTestId("tabbar").getByRole("button", { name: "Guide" }).click();
  const row = page.getByTestId("guide-row-g-sora");
  await expect(row).toContainText("Same trip");
  await expect.poll(() =>
    row.getByText("Sora Voronova", { exact: true }).evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  ).toBe(true);
});

test("polish: Platform Lab reset footer does not overlap live controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openProfileLab(page);

  await expect.poll(() =>
    page.evaluate(() => {
      const reset = document.querySelector<HTMLElement>('[data-testid="lab-reset"]');
      const language = document.querySelector<HTMLElement>('[data-testid="lab-language"]');
      if (!reset || !language) throw new Error("lab reset/language controls not found");
      const a = reset.getBoundingClientRect();
      const b = language.getBoundingClientRect();
      return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    }),
  ).toBe(false);
});
