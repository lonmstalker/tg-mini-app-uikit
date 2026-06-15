import { expect, type Page } from "@playwright/test";

/*
 * Clears the first-run onboarding so a spec can reach the app: dismiss the
 * welcome modal, then skip the coach-mark tour. The add-to-home prompt is a
 * non-blocking toast, so nothing else needs dismissing.
 */
export async function passOnboarding(page: Page) {
  await page.getByTestId("welcome-dismiss").click();
  // The tour tooltip's first button is "Skip" (a plain-variant button).
  await page.getByTestId("onboarding").getByRole("button").first().click();
  await expect(page.getByTestId("welcome")).toHaveCount(0);
  await expect(page.getByTestId("onboarding")).toHaveCount(0);
}
