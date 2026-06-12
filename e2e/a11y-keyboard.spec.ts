import { expect, test } from "@playwright/test";
import { computedStyle, fillCart, gallerySection, gotoApp, openGalleryOverlay } from "./helpers";

/**
 * A11Y / keyboard & focus — behavioral checks for the kit's focus traps,
 * combobox/slider keyboard contracts, toggle semantics and focus-visible ring.
 */

test("bottom sheet: focus trap, Escape, focus restore", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "overlays");
  const trigger = section.getByRole("button", { name: "Bottom sheet", exact: true });
  await trigger.click();
  const sheet = page.getByRole("dialog", { name: "Delivery time" });
  await expect(sheet).toBeVisible();

  // Focus lands on the first focusable element — the Close icon button.
  const close = sheet.getByRole("button", { name: "Close" });
  await expect(close).toBeFocused();

  // Tab cycle: Close -> 3 radios -> Confirm -> wraps to Close.
  for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
  await expect(sheet.getByRole("button", { name: "Confirm" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(sheet.getByRole("button", { name: "Confirm" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused(); // focus returns to the opener
});

test("dialog: alertdialog semantics and accessible name", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "overlays");
  const trigger = section.getByRole("button", { name: "Dialog", exact: true });
  await trigger.click();
  const dialog = page.getByRole("alertdialog", { name: "Delete account?" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("action sheet: trap active, item click closes it", async ({ page }) => {
  const sheet = await openGalleryOverlay(page, "Action sheet");
  await expect(sheet.getByRole("button", { name: "Share" })).toBeFocused();
  await sheet.getByRole("button", { name: "Remove from list" }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByText("Removed")).toBeVisible();
});

test("select: full combobox keyboard contract, disabled options skipped", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "inputs");
  const combo = section.getByRole("combobox").first(); // "City"
  await combo.focus();
  await expect(combo).toHaveAttribute("aria-expanded", "false");

  await page.keyboard.press("Enter");
  await expect(combo).toHaveAttribute("aria-expanded", "true");
  // Opens with the first enabled option (Lisbon) active.
  await expect(combo).toHaveAttribute("aria-activedescendant", /-opt-0$/);
  await page.keyboard.press("ArrowDown"); // Berlin
  await page.keyboard.press("ArrowDown"); // skips disabled Tbilisi -> Belgrade
  await expect(combo).toHaveAttribute("aria-activedescendant", /-opt-3$/);
  await page.keyboard.press("Enter");
  await expect(combo).toHaveAttribute("aria-expanded", "false");
  await expect(combo).toContainText("Belgrade");

  // Escape closes without changing the value.
  await page.keyboard.press("Enter");
  await expect(combo).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(combo).toHaveAttribute("aria-expanded", "false");
  await expect(combo).toContainText("Belgrade");
});

test("slider: arrows, PageUp, Home/End update value and aria-valuetext", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "slider");
  const slider = section.getByRole("slider");
  await slider.focus();
  await expect(slider).toHaveAttribute("aria-valuenow", "60");
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveAttribute("aria-valuenow", "61");
  await page.keyboard.press("PageUp");
  await expect(slider).toHaveAttribute("aria-valuenow", "71");
  await page.keyboard.press("Home");
  await expect(slider).toHaveAttribute("aria-valuenow", "0");
  await page.keyboard.press("End");
  await expect(slider).toHaveAttribute("aria-valuenow", "100");
  await expect(slider).toHaveAttribute("aria-valuetext", "100%");
});

test("toggles: switch and checkbox flip aria-checked, disabled radio inert", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "selection-controls");

  const toggle = section.getByRole("switch");
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute("aria-checked", "false");

  const checkbox = section.getByRole("checkbox");
  await expect(checkbox).toHaveAttribute("aria-checked", "true");
  await checkbox.click();
  await expect(checkbox).toHaveAttribute("aria-checked", "false");

  const radios = section.getByRole("radio");
  await radios.first().click();
  await expect(radios.first()).toHaveAttribute("aria-checked", "true");
  const disabled = radios.last(); // "Pickup — temporarily unavailable"
  await expect(disabled).toBeDisabled();
  await expect(disabled).toHaveAttribute("aria-checked", "false");
});

test("checkout is keyboard-operable end to end", async ({ page }) => {
  await fillCart(page);
  const payButton = page.locator("[data-demo-pay-button] button");
  // Reach the pay button with the keyboard alone (scrollable regions are
  // also tabbable in Chromium, so the path can be long).
  for (let i = 0; i < 60; i++) {
    if (await payButton.evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(payButton).toBeFocused();
  await page.keyboard.press("Enter");
  // Successful payment clears the cart and opens the receipt sheet.
  await expect(page.locator("[data-demo-receipt]")).toBeVisible({ timeout: 10_000 });
});

test("focus ring shows for keyboard focus only", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "buttons");
  const button = section.getByRole("button", { name: "Filled", exact: true });

  // Mouse click: :focus-visible must NOT draw the ring.
  await button.click();
  expect(await computedStyle(button, "outline-style")).toBe("none");

  // Keyboard: click the (non-focusable) section title to set the sequential
  // focus start point, then Tab onto the button.
  await section.locator("div").first().click();
  await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  expect(await computedStyle(button, "outline-style")).toBe("solid");
  // Chromium rounds 3.5px down in the computed value.
  expect(parseFloat(await computedStyle(button, "outline-width"))).toBeGreaterThanOrEqual(3);
});

test("Escape closes only the sheet, app state survives", async ({ page }) => {
  await fillCart(page);
  // Cart badge on the tabbar shows 1 item.
  const cartTab = page.locator("[data-demo-shop-tabbar]").getByRole("button", { name: "Cart" });
  await page.locator("[data-demo-shop-tabbar]").getByRole("button", { name: "Home" }).click();
  await page.locator('[data-demo-product="mug"]').click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(page.locator('[data-demo-app="shop"]')).toBeVisible();
  await cartTab.click();
  await expect(page.locator("[data-demo-pay-button]")).toBeVisible(); // cart kept its item
});
