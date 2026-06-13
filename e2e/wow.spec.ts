import { expect, test } from "@playwright/test";
import { gallerySection, gotoApp } from "./helpers";

/**
 * TELEGRAM-ПАТТЕРНЫ (M7) — чат, onboarding-тур, конфетти, хаптика в логе
 * Platform Lab, пресеты темы.
 */

test("chat: write bar sends and the bubble joins the feed with ticks", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "chat");
  const chat = section.getByTestId("demo-chat");
  await chat.getByPlaceholder("Message").fill("Спасибо!");
  await chat.getByRole("button", { name: "Send" }).click();
  await expect(chat.getByText("Спасибо!")).toBeVisible();
  await expect(chat.getByPlaceholder("Message")).toHaveValue("");
});

test("onboarding tour: steps advance and the tour ends", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "wow");
  await section.getByTestId("demo-start-tour").click();
  await expect(page.getByText("Coach marks")).toBeVisible();
  await page.getByTestId("demo-tour").getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Микро-награды")).toBeVisible();
  await page.getByTestId("demo-tour").getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.getByText("Микро-награды")).toBeHidden();
});

test("confetti bursts and cleans up; reduced-motion renders nothing", async ({ page }) => {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "wow");
  await section.getByTestId("demo-confetti-btn").click();
  await expect(page.getByTestId("demo-confetti")).toBeVisible();
  await expect(page.getByTestId("demo-confetti")).toBeHidden({ timeout: 4000 });

  // reduced motion: the canvas never appears
  const ctx = await page.context().browser()!.newContext({ reducedMotion: "reduce", viewport: { width: 402, height: 874 } });
  const rm = await ctx.newPage();
  await rm.goto("/?app=gallery");
  const rmSection = rm.locator('[data-demo-section="wow"]');
  await rmSection.scrollIntoViewIfNeeded();
  await rmSection.getByTestId("demo-confetti-btn").click();
  await expect(rm.getByTestId("demo-confetti")).toHaveCount(0);
  await ctx.close();
});

test("haptics are written to the Platform Lab event log", async ({ page }) => {
  await gotoApp(page, "platform");
  // any kit switch inside the lab fires a selection haptic via the provider
  const toggle = page.locator('[data-demo-app="platform"]').getByRole("switch").first();
  await toggle.scrollIntoViewIfNeeded();
  await toggle.click();
  await expect(page.locator('[data-demo-app="platform"]').getByText(/haptic.*selection/i).first()).toBeVisible();
});
