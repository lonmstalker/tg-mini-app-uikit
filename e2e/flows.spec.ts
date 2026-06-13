import { expect, test } from "@playwright/test";
import { fillCart, gotoApp } from "./helpers";

/**
 * ФЛОУ — end-to-end paths through every demo app (shop checkout already lives
 * in motion/a11y suites): booking slot → confirmation, game daily reward,
 * Platform Lab client APIs answered by the Telegram mock host.
 */

test.describe("booking", () => {
  test("service → time → confirm → booked", async ({ page }) => {
    const root = await gotoApp(page, "booking");

    // Step 1 — pick a different service
    await root.getByText("Dermatoscopy", { exact: true }).click();
    await root.getByRole("button", { name: "Continue" }).click();

    // Step 2 — pick a day and a free slot
    await root.getByRole("button", { name: /Wed/ }).click();
    await root.getByRole("button", { name: "16:00", exact: true }).click();
    await root.getByRole("button", { name: "Continue" }).click();

    // Step 3 — confirm shows the picked slot, busy slots stayed unbookable
    const confirm = root.getByRole("button", { name: /Confirm · Wed 16:00/ });
    await expect(confirm).toBeVisible();
    await expect(root.getByText("Dermatoscopy · ")).toHaveCount(0); // not booked yet
    await confirm.click();

    // Booked screen
    await expect(root.getByText("You're booked")).toBeVisible();
    await expect(root.getByText("Confirmed").first()).toBeVisible();
    await expect(root.getByText("Wed, Jun 17 · 16:00")).toBeVisible();

    // Reschedule resets the wizard to step 1
    await root.getByRole("button", { name: "Book another visit" }).click();
    await expect(root.getByText("Choose a service")).toBeVisible();
  });

  test("busy slot cannot be selected", async ({ page }) => {
    const root = await gotoApp(page, "booking");
    await root.getByRole("button", { name: "Continue" }).click();
    const busy = root.getByRole("button", { name: "10:45", exact: true });
    await expect(busy).toBeDisabled();
  });

  test("back navigation keeps selections", async ({ page }) => {
    const root = await gotoApp(page, "booking");
    await root.getByText("Chemical peel", { exact: true }).click();
    await root.getByRole("button", { name: "Continue" }).click();
    await root.getByRole("button", { name: "Back" }).click();
    await root.getByRole("button", { name: "Continue" }).click();
    await root.getByRole("button", { name: "Continue" }).click();
    await expect(root.getByText("Chemical peel").first()).toBeVisible();
  });
});

test.describe("game", () => {
  test("claim daily reward", async ({ page }) => {
    const root = await gotoApp(page, "game");
    await expect(root.getByText("2,140")).toBeVisible();

    await root.getByRole("button", { name: /Claim daily reward/ }).click();

    // Reward lands: coins, streak and leaderboard all update
    await expect(root.getByText("2,190")).toBeVisible();
    await expect(root.getByText("7 days")).toBeVisible();
    await expect(root.getByText("7,390")).toBeVisible();
    await expect(root.getByRole("button", { name: /next reward in/ })).toBeDisabled();
  });

  test("reset progress via action sheet", async ({ page }) => {
    const root = await gotoApp(page, "game");
    await root.getByRole("button", { name: "Options" }).click();
    await page.getByRole("button", { name: "Reset progress" }).click();
    await expect(root.getByText("0 days")).toBeVisible();
  });
});

test.describe("platform lab — client APIs through the mock host", () => {
  test("invoice resolves to paid", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    await root.getByRole("button", { name: /invoice/i }).first().click();
    await expect(page.getByText("invoice → paid")).toBeVisible();
  });

  test("QR scan returns mock payload", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    const qr = root.getByRole("button", { name: "QR scan", exact: true });
    await qr.scrollIntoViewIfNeeded();
    await expect(qr).toBeEnabled();
    await qr.click();
    await expect(page.getByText(/t\.me|demo|qr/i).last()).toBeVisible();
  });

  test("biometrics authenticates", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    const bio = root.getByRole("button", { name: /biometric/i }).first();
    await bio.scrollIntoViewIfNeeded();
    await expect(bio).toBeEnabled();
    await bio.click();
    await expect(page.getByText(/biometric → true/)).toBeVisible();
  });

  test("accelerometer starts", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    const sensor = root.getByRole("button", { name: /sensor/i }).first();
    await sensor.scrollIntoViewIfNeeded();
    await expect(sensor).toBeEnabled();
    await sensor.click();
    await expect(page.getByText(/sensor → /)).toBeVisible();
  });
});

test.describe("shop — error path and receipt", () => {
  test("declined payment shows the error dialog, retry recovers", async ({ page }) => {
    await fillCart(page);
    await page.locator("[data-demo-decline-toggle]").getByRole("switch").click();
    await page.locator("[data-demo-pay-button]").getByRole("button").click();

    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await expect(dialog.getByText("Payment declined")).toBeVisible();

    await dialog.getByRole("button", { name: "Try again" }).click();
    await expect(dialog).toBeHidden();

    // Decline switch was reset — the next payment succeeds with a receipt
    await page.locator("[data-demo-pay-button]").getByRole("button").click();
    await expect(page.locator("[data-demo-receipt]")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Payment confirmed")).toBeVisible();
  });
});
