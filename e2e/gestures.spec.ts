import { expect, test, type Locator, type Page } from "@playwright/test";
import { gallerySection, gotoApp } from "./helpers";

/**
 * ЖЕСТЫ (M3) — pull-to-refresh, swipe actions, sheet snap points and
 * swipe-to-close, dropdown layering inside a sheet.
 */

async function centerInView(target: Locator) {
  await target.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior }));
  // lazily painted sections above can shift the scroll position — wait for a stable box
  let prev = "";
  for (let i = 0; i < 20; i++) {
    const box = await target.boundingBox();
    const cur = JSON.stringify(box);
    if (cur === prev) return;
    prev = cur;
    await target.page().waitForTimeout(50);
  }
}

/** Waits until the element's box stops moving (entry animations, snaps). */
async function waitSettled(target: Locator) {
  let prev = "";
  for (let i = 0; i < 30; i++) {
    const cur = JSON.stringify(await target.boundingBox());
    if (cur === prev) return;
    prev = cur;
    await target.page().waitForTimeout(60);
  }
}

async function dragBy(page: Page, target: Locator, dx: number, dy: number, steps = 12) {
  await waitSettled(target);
  const box = (await target.boundingBox())!;
  const startX = box.x + box.width / 2;
  const startY = box.y + Math.min(box.height / 2, 40);
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(startX + (dx * i) / steps, startY + (dy * i) / steps);
  }
  await page.mouse.up();
}

test("pull-to-refresh triggers onRefresh exactly once per pull", async ({ page }) => {
  await gotoApp(page, "gallery");
  await gallerySection(page, "gestures");
  const ptr = page.getByTestId("demo-ptr");
  await centerInView(ptr);
  await dragBy(page, ptr, 0, 220);
  await expect(page.locator("[data-demo-ptr-count]")).toHaveText("1");
  // a short pull below the threshold does nothing
  await dragBy(page, ptr, 0, 40);
  await expect(page.locator("[data-demo-ptr-count]")).toHaveText("1");
});

test("swipe cell: partial swipe reveals actions, tap acts, full swipe fires", async ({ page }) => {
  await gotoApp(page, "gallery");
  await gallerySection(page, "gestures");
  const row = page.getByTestId("demo-swipe-flat-white");
  await centerInView(row);
  await dragBy(page, row, -120, 0);
  const archive = row.getByRole("button", { name: "Archive" });
  await expect(archive).toBeVisible();
  await archive.click();
  await expect(page.getByText("Flat white archived")).toBeVisible();

  // full swipe on another row deletes it (first trailing action is Archive,
  // so configure: full swipe fires the FIRST action of the side)
  const bun = page.getByTestId("demo-swipe-cinnamon-bun");
  await centerInView(bun);
  await dragBy(page, bun, -360, 0, 18);
  await expect(page.getByText("Cinnamon bun archived")).toBeVisible();
});

test("sheet: snap points via drag and swipe-to-close", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "gestures");
  await section.getByRole("button", { name: "Snap-point sheet" }).click();
  const sheet = page.getByTestId("demo-snap-sheet");
  await expect(sheet).toBeVisible();
  await waitSettled(sheet);
  const h1 = (await sheet.boundingBox())!.height;

  // drag the grabber up — snaps to the taller point
  await dragBy(page, sheet, 0, -200);
  await waitSettled(sheet);
  const h2 = (await sheet.boundingBox())!.height;
  expect(h2).toBeGreaterThan(h1 + 80);

  // drag down twice: back to the low snap, then close
  await dragBy(page, sheet, 0, 300);
  await dragBy(page, sheet, 0, 260);
  await expect(sheet).toBeHidden();
});

test("select dropdown inside a sheet stays clickable above it", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "gestures");
  await section.getByRole("button", { name: "Snap-point sheet" }).click();
  const sheet = page.getByTestId("demo-snap-sheet");
  const combo = sheet.getByRole("combobox");
  await combo.click();
  await expect(combo).toHaveAttribute("aria-expanded", "true");
  await sheet.getByRole("option", { name: "Belgrade" }).click();
  await expect(combo).toContainText("Belgrade");
});

test("dismissible sheet closes by swipe, non-dismissible logic covered by unit tests", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "overlays");
  await section.getByRole("button", { name: "Bottom sheet", exact: true }).click();
  const sheet = page.getByRole("dialog", { name: "Delivery time" });
  await expect(sheet).toBeVisible();
  await dragBy(page, sheet, 0, 240);
  await expect(sheet).toBeHidden();
});
