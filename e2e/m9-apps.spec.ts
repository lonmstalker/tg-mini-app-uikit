import { expect, test } from "@playwright/test";
import { gotoApp } from "./helpers";

/**
 * M9 — product demos. Each app must expose one happy path and one explicit
 * failure/edge state so the gallery is a usable acceptance surface, not a
 * static placeholder.
 */

test("stars checkout: paid receipt and failed retry path", async ({ page }) => {
  await gotoApp(page, "stars");
  await page.getByTestId("stars-pay").click();
  await expect(page.getByTestId("stars-receipt")).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Back to plans" }).click();
  await page.getByTestId("stars-fail-toggle").getByRole("switch").click();
  await page.getByTestId("stars-pay").click();
  await expect(page.getByRole("alertdialog").getByText("Payment failed")).toBeVisible({ timeout: 10_000 });
});

test("onboarding identity: permission denial and setup completion", async ({ page }) => {
  const root = await gotoApp(page, "onboarding");
  await root.getByTestId("onb-continue").click();

  await root.getByTestId("onb-deny-toggle").click();
  await root.getByTestId("onb-contact").click();
  await expect(root.getByText("Permission denied")).toBeVisible();
  await root.getByRole("button", { name: "Try again" }).click();
  await root.getByTestId("onb-contact").click();
  await root.getByTestId("onb-continue").click();

  await root.getByTestId("onb-write").click();
  await root.getByTestId("onb-continue").click();
  await fillPin(page, "1234");
  await fillPin(page, "1234");
  await root.getByTestId("onb-skip-bio").click();
  await expect(root.getByTestId("onb-done")).toContainText("Setup complete");
});

test("demo switcher stays contained above identity steps", async ({ page }) => {
  const root = await gotoApp(page, "onboarding");
  await root.getByTestId("onb-continue").click();

  const geometry = await page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>("[data-demo-nav]");
    const steps = document.querySelector<HTMLElement>('[data-testid="onb-steps"]');
    const navBox = nav?.getBoundingClientRect();
    const stepBox = steps?.getBoundingClientRect();
    return {
      navBottom: navBox?.bottom ?? 0,
      stepTop: stepBox?.top ?? 0,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });

  expect(geometry.stepTop).toBeGreaterThanOrEqual(geometry.navBottom + 6);
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewportWidth);
});

test("desktop demo switcher scroll does not move the device frame", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto("/?app=shop");
  const stage = page.locator("[data-demo-stage]");
  await expect(stage).toBeVisible();
  const before = await stage.boundingBox();

  const scrollWidth = await page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>("[data-demo-nav]");
    const scroller = nav?.parentElement;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
    return document.documentElement.scrollWidth;
  });
  const after = await stage.boundingBox();

  expect(scrollWidth).toBeLessThanOrEqual(1200);
  expect(Math.abs((after?.x ?? 0) - (before?.x ?? 0))).toBeLessThan(1);
});

test("settings restore: save, restart and restore from cloud storage", async ({ page }) => {
  const root = await gotoApp(page, "settings");
  await root.getByTestId("settings-name").locator("input").fill("Nikita");
  await root.getByTestId("settings-save-cloud").click();
  await root.getByTestId("settings-restart").click();
  await expect(root.getByTestId("settings-name").locator("input")).toHaveValue("");

  await root.getByTestId("settings-load-cloud").click();
  await expect(root.getByTestId("settings-name").locator("input")).toHaveValue("Nikita");
  await expect(root.getByTestId("settings-snapshot")).toContainText("Loaded from Cloud");
});

test("support handoff: quick reply, operator link and rating", async ({ page }) => {
  const root = await gotoApp(page, "support");
  await root.getByRole("button", { name: "Refund" }).click();
  await expect(root.getByTestId("support-messages")).toContainText("Refund");

  await root.getByTestId("support-handoff").click();
  await expect(root.getByText("openTelegramLink")).toBeVisible();

  await root.getByLabel("Rating").getByRole("button", { name: "5 of 5" }).click();
  await expect(root.getByTestId("support-rating")).toContainText("5/5");
});

test("arcade: fullscreen, score movement and pause state", async ({ page }) => {
  const root = await gotoApp(page, "arcade");
  await root.getByTestId("arcade-fullscreen").click();
  await expect(root.getByText("Fullscreen", { exact: true })).toBeVisible();

  const ball = root.getByTestId("arcade-ball");
  const before = await ball.boundingBox();
  await root.getByTestId("arcade-move-left").click();
  const after = await ball.boundingBox();
  expect(after!.x).toBeLessThan(before!.x);
  await expect(root.getByTestId("arcade-score")).toContainText(/\d/);

  await root.getByTestId("arcade-bg").click();
  await expect(page.getByRole("alertdialog").getByText("Game paused")).toBeVisible();
});

test("feed: spoiler reveal, reaction, share and read marker", async ({ page }) => {
  const root = await gotoApp(page, "feed");
  await root.getByRole("button", { name: /show hidden content/i }).click();
  await expect(root.getByText("launch window")).toBeVisible();

  await root.getByRole("button", { name: "Like" }).first().click();
  await expect(root.getByTestId("feed-like-count").first()).toContainText("13");

  await root.getByTestId("feed-share").first().click();
  await expect(root.getByText("shareMessage")).toBeVisible();
  await expect(root.getByTestId("feed-read")).toContainText("read");
});

test("wallet flow: connect, validation failure, send and history update", async ({ page }) => {
  const root = await gotoApp(page, "wallet");
  await root.getByTestId("wallet-connect").click();
  await expect(root.getByText("14.72 TON")).toBeVisible({ timeout: 10_000 });

  await root.getByTestId("wallet-send-open").click();
  await root.getByText("Review").click();
  await expect(root.getByTestId("wallet-amount")).toContainText("Enter an amount");

  await root.getByTestId("wallet-amount").locator("input").fill("1.50");
  await root.getByLabel("Recipient address").fill("EQDemoWallet123456789");
  await root.getByText("Review").click();
  await page.getByTestId("wallet-send-confirm").click();
  await expect(root.getByTestId("wallet-history")).toContainText("Sent", { timeout: 10_000 });
  await expect(root.getByText("13.22 TON")).toBeVisible();
});

test("forms showcase: validation failure and summary sheet", async ({ page }) => {
  const root = await gotoApp(page, "forms", { params: { today: "2026-06-15" } });
  await root.getByTestId("forms-submit").click();
  await expect(root.getByTestId("forms-name")).toContainText("Name is required");

  await root.getByTestId("forms-name").locator("input").fill("Anna");
  await root.getByTestId("forms-phone").locator("input").fill("+1 555 123 4567");
  await expect(root.getByTestId("forms-phone").locator("input")).toHaveValue("+1 (555) 123-45-67");
  await root.getByTestId("forms-date").click();
  await page.getByLabel("Year").selectOption("1990");
  await page.getByLabel("Month", { exact: true }).selectOption("1");
  await page.getByRole("button", { name: "February 17, 1990" }).click();
  await expect(root.getByTestId("forms-date").locator("input")).toHaveValue(/1990/);
  await root.getByTestId("forms-time").locator("input").fill("1234");
  await expect(root.getByTestId("forms-time").locator("input")).toHaveValue("12:34");
  await root.getByTestId("forms-budget-exact").click();
  await page.getByTestId("forms-budget-min").locator("input").fill("1888");
  await page.getByTestId("forms-budget-apply").click();
  await expect(root.getByTestId("forms-budget-value")).toContainText("$1,888");
  await root.getByTestId("forms-license").click();
  await root.getByTestId("forms-submit").click();
  await expect(page.getByTestId("forms-summary")).toBeVisible();
});

async function fillPin(page: import("@playwright/test").Page, value: string) {
  for (const digit of value) {
    await page.getByTestId("onb-pin").getByRole("button", { name: digit }).click();
  }
}
