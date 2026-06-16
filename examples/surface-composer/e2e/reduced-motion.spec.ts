import { expect, test } from "@playwright/test";
import { emulateReducedMotion, getRecorder, waitForMotionState } from "./helpers";

/*
 * Reduced motion is a DESIGNED static state, not "animations off" (FR-010,
 * SC-007): the reduced-motion path emits the IDENTICAL recorder sequence to the
 * full-motion path. US2 cases are appended in T046.
 */

async function birthReactions(page: import("@playwright/test").Page): Promise<string[]> {
  await page.goto("/");
  await waitForMotionState(page, "idle");
  return (await getRecorder(page)).map((e) => e.reaction);
}

test("US1 birth: reduced-motion emits the identical recorder sequence as full motion", async ({ page }) => {
  const full = await birthReactions(page);

  await emulateReducedMotion(page);
  const reduced = await birthReactions(page);

  expect(reduced).toEqual(full);
});

test("US1: motion tokens collapse to ~instant under reduced motion", async ({ page }) => {
  await emulateReducedMotion(page);
  await page.goto("/");
  await waitForMotionState(page, "idle");

  const dur = await page
    .getByTestId("surface")
    .evaluate((el) => getComputedStyle(el).getPropertyValue("--sc-duration-assemble").trim());
  expect(dur).toBe("1ms");
});

async function remixReactions(page: import("@playwright/test").Page): Promise<string[]> {
  await page.goto("/?scene=rangeRemix");
  await waitForMotionState(page, "idle");
  await page.getByTestId("primary-action").click();
  await waitForMotionState(page, "continuity");
  return (await getRecorder(page)).map((e) => e.reaction);
}

test("US2 remix: reduced-motion emits the identical recorder sequence as full motion", async ({ page }) => {
  const full = await remixReactions(page);

  await emulateReducedMotion(page);
  const reduced = await remixReactions(page);

  expect(reduced).toEqual(full);
});

test("US2: reduced-motion remix substitute is a gated snapshot frame", async ({ page }) => {
  await emulateReducedMotion(page);
  await page.goto("/?scene=rangeRemix&context=booking&motion=rotating");
  await waitForMotionState(page, "rotating");
  await expect(page).toHaveScreenshot("range-remix-reduced-rotating.png");
});
