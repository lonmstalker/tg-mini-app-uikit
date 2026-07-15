import { expect, test, type Page } from "@playwright/test";

async function openShowcase(page: Page) {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

test("renders the page without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await openShowcase(page);
  await expect(page.locator(".showcase-phone-screen")).toBeVisible();
  expect(errors).toEqual([]);
});

test("header theme toggle updates the provider theme", async ({ page }) => {
  await openShowcase(page);
  const root = page.getByTestId("showcase-root");

  await expect(root).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(root).toHaveAttribute("data-theme", "light");
});

test("bento ImageViewer opens and closes", async ({ page }) => {
  await openShowcase(page);
  await page.getByTestId("component-tile-image-viewer").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("lazy-image-viewer")).toHaveAttribute("data-lazy-state", "mounted");

  await page.getByTestId("image-preview-0").click();
  const viewer = page.getByTestId("bento-image-viewer");
  await expect(viewer).toBeVisible();
  await viewer.getByRole("button", { name: "Close" }).click();
  await expect(viewer).toBeHidden();
});

test("accent preset repaints the hero phone frame", async ({ page }) => {
  await openShowcase(page);
  const phone = page.locator(".showcase-phone-screen");
  const accent = () => phone.evaluate((node) => getComputedStyle(node).getPropertyValue("--tk-accent").trim());
  const initialAccent = await accent();

  await page.getByTestId("tweaks-panel").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Use Green accent" }).click();
  await expect.poll(accent).not.toBe(initialAccent);
});
