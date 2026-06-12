import { expect, test } from "@playwright/test";
import { computedStyle, gotoApp } from "./helpers";

/**
 * PLATFORM LAB — the Bot API state fields and sensors through the mock host:
 * `set*Color` repaints the client chrome, behavior toggles round-trip through
 * the `WebApp.is*` fields, DeviceOrientation honours `need_absolute`, and
 * closing confirmation intercepts `close()`. Design assertions go through
 * computed styles, so the spec stays pixel-free and platform-independent.
 */

test.describe("appearance — WebApp colors drive the client chrome", () => {
  test("setHeaderColor tints the header and reports the value back", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    const header = page.locator("[data-demo-platform-header]");
    await expect(header).toHaveCSS("background-color", "rgb(255, 255, 255)"); // light header_bg_color

    await root.getByRole("button", { name: "Accent header", exact: true }).click();
    await expect(header).toHaveCSS("background-color", "rgb(51, 144, 236)"); // #3390ec
    await expect(root.getByText("#3390ec", { exact: true })).toBeVisible(); // useTelegramColors().headerColor
    await expect(root.getByRole("log")).toContainText('setHeaderColor("#3390ec")');

    await root.getByRole("button", { name: "Reset header", exact: true }).click();
    await expect(header).toHaveCSS("background-color", "rgb(255, 255, 255)");
  });

  test("keyword colors follow the theme", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    const header = page.locator("[data-demo-platform-header]");

    await root.getByRole("button", { name: "Reset header", exact: true }).click(); // "bg_color" keyword
    await root.getByRole("button", { name: "Dark", exact: true }).click();
    await expect(header).toHaveCSS("background-color", "rgb(23, 33, 43)"); // dark bg_color #17212b
  });

  test("setBottomBarColor repaints the native button bar", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    const bar = page.locator("[data-demo-platform-bottombar]");
    await expect(bar).toBeVisible(); // MainButton is on by default

    await root.getByRole("button", { name: "Accent bottom bar", exact: true }).click();
    await expect(bar).toHaveCSS("background-color", "rgb(28, 147, 227)"); // #1c93e3
  });

  test("chrome color changes animate on the .25s ease curve", async ({ page }) => {
    await gotoApp(page, "platform");
    const header = page.locator("[data-demo-platform-header]");
    expect(await computedStyle(header, "transition-duration")).toBe("0.25s");
    expect(await computedStyle(header, "transition-property")).toContain("background-color");
  });
});

test.describe("behavior flags — vertical swipes, orientation, closing", () => {
  test("vertical swipes round-trip through isVerticalSwipesEnabled", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    const swipes = root.getByRole("switch", { name: "Vertical swipes to close" });

    await expect(swipes).toBeChecked(); // enabled by default, like the real client
    await swipes.click();
    await expect(swipes).not.toBeChecked();
    await expect(root.getByRole("log")).toContainText("disableVerticalSwipes()");

    await swipes.click();
    await expect(swipes).toBeChecked();
    await expect(root.getByRole("log")).toContainText("enableVerticalSwipes()");
  });

  test("orientation lock round-trips through isOrientationLocked", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    const lock = root.getByRole("switch", { name: "Lock orientation" });

    await expect(lock).not.toBeChecked();
    await lock.click();
    await expect(lock).toBeChecked();
    await expect(root.getByRole("log")).toContainText("lockOrientation()");

    await lock.click();
    await expect(root.getByRole("log")).toContainText("unlockOrientation()");
  });

  test("closing confirmation intercepts close() until confirmed", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    await root.getByRole("switch", { name: "Ask before closing" }).click();
    await expect(root.getByText("isClosingConfirmationEnabled").locator("..")).toContainText("true");

    // The chrome ✕ shares the same accessible name — scope to the mini app sheet.
    const closeButton = page.locator("[data-demo-platform-sheet]").getByRole("button", { name: "Close mini app" });
    await closeButton.click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog.getByText("Close the app?")).toBeVisible();

    // Cancel keeps the mini app alive
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
    await expect(root.getByText("Mini app closed")).toHaveCount(0);

    // Confirming actually closes, relaunch restores
    await closeButton.click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Close anyway" }).click();
    await expect(root.getByText("Mini app closed")).toBeVisible();
    await root.getByRole("button", { name: "Relaunch" }).click();
    await expect(root.getByText("Mini app closed")).toHaveCount(0);
  });
});

test.describe("motion sensors — useMotionSensors against the mock", () => {
  test("device orientation honours need_absolute and streams readings", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    await root.getByRole("switch", { name: "Absolute orientation (need_absolute)" }).click();

    const row = root.locator('[data-demo-sensor="orientation"]');
    await row.getByRole("button", { name: "Start" }).click();
    await expect(row).toContainText("α 0.66");
    await expect(row).toContainText("absolute");
    await expect(root.getByRole("log")).toContainText("DeviceOrientation.start(60, absolute)");

    await row.getByRole("button", { name: "Stop" }).click();
    await expect(row).toContainText("not started");
  });

  test("accelerometer and gyroscope start and stop independently", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    const accel = root.locator('[data-demo-sensor="accelerometer"]');
    const gyro = root.locator('[data-demo-sensor="gyroscope"]');

    await accel.getByRole("button", { name: "Start" }).click();
    await expect(accel).toContainText("y 9.77"); // gravity reading
    await expect(gyro).toContainText("not started");

    await gyro.getByRole("button", { name: "Start" }).click();
    await expect(gyro).toContainText("rad/s");

    await accel.getByRole("button", { name: "Stop" }).click();
    await expect(accel).toContainText("not started");
    await expect(gyro).toContainText("x 0.01"); // still running
  });
});

test.describe("viewport sheet motion", () => {
  test("expand animates the sheet height on the 340ms client curve", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    const sheet = page.locator("[data-demo-platform-sheet]");

    expect(await computedStyle(sheet, "transition-property")).toContain("height");
    expect(await computedStyle(sheet, "transition-duration")).toBe("0.34s");
    expect(await computedStyle(sheet, "transition-timing-function")).toBe("cubic-bezier(0.3, 0.8, 0.3, 1)");

    const collapsed = (await sheet.boundingBox())!.height;
    await root.getByRole("button", { name: "Expand", exact: true }).click();
    await expect(page.locator("[data-demo-platform-grabber]")).toHaveAttribute(
      "aria-label",
      "Collapse the mini app",
    );
    await expect.poll(async () => (await sheet.boundingBox())!.height).toBeGreaterThan(collapsed + 100);
  });
});

test.describe("keyboard operability of the new controls", () => {
  test("behavior switches toggle with Space", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    const swipes = root.getByRole("switch", { name: "Vertical swipes to close" });

    await swipes.focus();
    await page.keyboard.press("Space");
    await expect(swipes).not.toBeChecked();
    await page.keyboard.press("Space");
    await expect(swipes).toBeChecked();
  });

  test("appearance buttons activate with Enter", async ({ page }) => {
    const root = await gotoApp(page, "platform");
    const header = page.locator("[data-demo-platform-header]");

    await root.getByRole("button", { name: "Accent header", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(header).toHaveCSS("background-color", "rgb(51, 144, 236)");
  });
});
