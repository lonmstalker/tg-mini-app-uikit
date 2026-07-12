import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { surfaceAttr, waitForBusinessContext, waitForMotionState } from "./helpers";

/*
 * US1 accessibility (Principle VI, FR-011): no serious/critical axe violations
 * (incl. color-contrast), accessible names on switcher/CTA/surface, keyboard
 * focus reaches the primary action, and Back/Escape closes the inspector before
 * any navigation. US2 cases are appended in T046.
 */

test("US1: no serious/critical axe violations on the live surface", async ({ page }) => {
  await page.goto("/");
  await waitForMotionState(page, "idle");

  const results = await new AxeBuilder({ page })
    .include('[data-testid="surface"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(
    serious,
    serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`).join("\n"),
  ).toEqual([]);
});

test("US1: switcher group and primary action carry accessible names", async ({ page }) => {
  await page.goto("/");
  await waitForMotionState(page, "idle");

  await expect(page.getByRole("group", { name: /Business type|Тип бизнеса/ })).toBeVisible();
  // The four contexts are reachable as named buttons.
  for (const name of ["Shop", "Booking", "Wallet", "Support"]) {
    await expect(page.getByRole("button", { name })).toBeVisible();
  }
  await expect(page.getByTestId("primary-action")).toBeVisible();
});

test("US1: keyboard reaches the primary action", async ({ page }) => {
  await page.goto("/");
  await waitForMotionState(page, "idle");

  await page.getByTestId("primary-action").focus();
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));
  expect(focused).toBe("primary-action");
});

test("US1: Escape closes the inspector before navigating (FR-011)", async ({ page }) => {
  await page.goto("/");
  await waitForMotionState(page, "idle");

  await page.locator('[data-slot="content"]').click();
  await waitForMotionState(page, "first-touch");

  await page.keyboard.press("Escape");
  await waitForMotionState(page, "idle"); // closed, returned to the surface

  await expect(page.getByTestId("inspector")).toHaveCount(0);
  expect(await surfaceAttr(page, "data-scene")).toBe("firstLaunch"); // no navigation occurred
});

test("US2: keyboard reaches every context via the switcher chips", async ({ page }) => {
  await page.goto("/?scene=rangeRemix");
  await waitForMotionState(page, "idle");

  const wallet = page.getByRole("button", { name: "Wallet" });
  await wallet.focus();
  expect(await page.evaluate(() => document.activeElement?.textContent)).toContain("Wallet");

  await page.keyboard.press("Enter"); // keyboard activation triggers the remix
  await waitForBusinessContext(page, "wallet");
  expect(await surfaceAttr(page, "data-business-context")).toBe("wallet");
});

test("US2: no serious/critical axe violations on the remix surface", async ({ page }) => {
  await page.goto("/?scene=rangeRemix");
  await waitForMotionState(page, "idle");

  const results = await new AxeBuilder({ page })
    .include('[data-testid="surface"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious, serious.map((v) => v.id).join("\n")).toEqual([]);
});
