import { expect, test } from "@playwright/test";
import { gallerySection, gotoApp } from "./helpers";

/**
 * ДИСПЛЕИ (M5) — icon search/copy, spoiler reveal, carousel paging,
 * virtual list windowing, collapsing header.
 */

test("icon search filters the grid and a click copies the name", async ({ page }) => {
  await gotoApp(page, "gallery");
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  const section = await gallerySection(page, "icons");
  await section.getByTestId("demo-icon-search").locator("input").fill("qr");
  await expect(section.getByRole("button", { name: "qr", exact: true })).toBeVisible();
  await expect(section.getByRole("button", { name: "bell", exact: true })).toBeHidden();
  await section.getByRole("button", { name: "qr", exact: true }).click();
  await expect(page.getByText("qr", { exact: true }).last()).toBeVisible(); // toast
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe("qr");
});

test("spoiler reveals on tap and unhides from the a11y tree", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "display-2-0");
  const spoiler = section.getByTestId("demo-spoiler");
  await expect(spoiler.locator('[aria-hidden="true"]')).toHaveCount(1);
  await spoiler.click();
  await expect(spoiler.locator('[aria-hidden="true"]')).toHaveCount(0);
});

test("carousel: dots page the track", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "display-2-0");
  const carousel = section.getByTestId("demo-carousel");
  await carousel.getByRole("button", { name: "Page 3" }).click();
  await expect(carousel.getByText("slide 3")).toBeInViewport();
});

test("virtual list windows 10k rows", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "display-2-0");
  const virt = section.getByTestId("demo-virtual");
  // far rows are not in the DOM at all
  expect(await virt.locator("text=Item 9000").count()).toBe(0);
  await virt.evaluate((el) => (el.scrollTop = 9000 * 44));
  await expect(virt.getByText("Item 9001", { exact: true })).toBeVisible();
  expect(await virt.locator("text=Item 1 ").count()).toBe(0);
});

test("collapsing header shrinks on scroll and restores", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "display-2-0");
  const frame = section.getByTestId("demo-collapsing");
  const header = frame.locator("[data-collapsed]");
  await expect(header).toHaveAttribute("data-collapsed", "false");
  await frame.locator("[data-tk-page-scroll]").evaluate((el) => (el.scrollTop = 200));
  await expect(header).toHaveAttribute("data-collapsed", "true");
  await frame.locator("[data-tk-page-scroll]").evaluate((el) => (el.scrollTop = 0));
  await expect(header).toHaveAttribute("data-collapsed", "false");
});
