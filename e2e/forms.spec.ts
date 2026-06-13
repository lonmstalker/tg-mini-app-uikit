import { expect, test } from "@playwright/test";
import { gallerySection, gotoApp } from "./helpers";

/**
 * ФОРМЫ 2.0 (M4) — calendar range, searchable select, chips input, pin pad.
 * Полный пользовательский флоу появится в Forms showcase (M9.8).
 */

test("calendar: range selection across a month boundary", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "forms-2-0");
  const calendar = section.getByTestId("demo-calendar");
  await calendar.getByRole("button", { name: "June 28, 2026" }).click();
  await calendar.getByRole("button", { name: /next month/i }).click();
  await calendar.getByRole("button", { name: "July 4, 2026" }).click();
  // both ends render as selected; the in-between days get the range tint
  await calendar.getByRole("button", { name: /previous month/i }).click();
  await expect(calendar.getByRole("button", { name: "June 28, 2026" })).toHaveAttribute("aria-pressed", "true");
});

test("searchable select filters and picks inside groups", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "forms-2-0");
  const select = section.getByTestId("demo-search-select");
  await select.getByRole("combobox").click();
  await select.getByPlaceholder("Search").fill("se");
  await expect(select.getByRole("option", { name: /Seoul/ })).toBeVisible();
  await expect(select.getByRole("option", { name: /Lisbon/ })).toBeHidden();
  await select.getByRole("option", { name: /Seoul/ }).click();
  await expect(select.getByRole("combobox")).toContainText("Seoul");
});

test("multiselect select-all toggles all options", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "forms-2-0");
  const ms = section.getByTestId("demo-selectall");
  await ms.getByRole("combobox").click();
  await ms.getByRole("option", { name: "Select all" }).click();
  await expect(ms.getByRole("combobox")).toContainText("Cinnamon");
  await expect(ms.getByRole("combobox")).toContainText("Oat milk");
});

test("chips input: typing + Enter adds, × removes", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "forms-2-0");
  const chips = section.getByTestId("demo-chips-input");
  await chips.getByRole("textbox").fill("typescript");
  await chips.getByRole("textbox").press("Enter");
  await expect(chips.getByText("typescript")).toBeVisible();
  await chips.getByRole("button", { name: "Remove design" }).click();
  await expect(chips.getByText("design", { exact: true })).toBeHidden();
});

test("pin pad: keypad entry completes, biometrics key works", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "forms-2-0");
  const pin = section.getByTestId("demo-pin");
  for (const d of ["2", "0", "2", "6"]) await pin.getByRole("button", { name: d, exact: true }).click();
  await expect(section.getByText("entered 2026")).toBeVisible();
  await pin.getByRole("button", { name: /biometrics/i }).click();
  await expect(section.getByText("biometrics")).toBeVisible();
});

test("date input opens the calendar sheet and picks", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "forms-2-0");
  await section.getByTestId("demo-date-input").click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await sheet.getByRole("button", { name: "June 22, 2026" }).click();
  await expect(sheet).toBeHidden();
  await expect(section.getByTestId("demo-date-input").locator("input")).toHaveValue(/22/);
});
