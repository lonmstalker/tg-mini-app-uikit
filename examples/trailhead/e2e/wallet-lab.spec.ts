import { expect, test, type Page } from "@playwright/test";
import { passOnboarding } from "./helpers";

/*
 * M4 acceptance — wallet → Trail Pass discount, and Platform Lab live re-theming.
 *  - connecting the mock wallet (behind a PIN) shows the Trail Pass cell and a
 *    subsequent booking's summary shows the 15% Trail Pass line before the
 *    demo Stars cap is applied;
 *  - dragging the radius slider changes a card's computed border-radius;
 *  - flipping to dark changes the page root's computed background.
 */

interface Locale {
  name: string;
  query: string;
  profileTab: string;
}
const LOCALES: Locale[] = [
  { name: "en", query: "/?fast=1", profileTab: "Profile" },
  { name: "ru", query: "/?fast=1&lang=ru", profileTab: "Профиль" },
];

const dismissWelcome = passOnboarding;

async function enterPin(page: Page, padTestId: string, digits: string) {
  const pad = page.getByTestId(padTestId);
  for (const d of digits) await pad.getByRole("button", { name: d, exact: true }).click();
  const submit = pad.getByRole("button", { name: /Done|Готово/ });
  if (await submit.count()) await submit.click();
}

async function connectWallet(page: Page, profileTab: string) {
  await page.getByTestId("tabbar").getByRole("button", { name: profileTab }).click();
  await page.getByTestId("wallet-connect").click();
  await enterPin(page, "pin-gate-input", "1234");
  await expect(page.getByTestId("wallet-status")).toBeVisible();
  await expect(page.getByTestId("trail-pass")).toBeVisible();
}

async function bookToSummary(page: Page) {
  await page.getByTestId("tabbar").getByRole("button").first().click(); // Discover
  await page.getByTestId("feed-card-sunrise-ridge").click();
  await page.getByTestId("detail-book").click();
  await page.getByTestId("datetime-slots").getByRole("button", { name: "07:00", exact: true }).click();
  await page.getByTestId("datetime-continue").click();
  await expect(page.getByTestId("panel-discover-summary")).toBeVisible();
}

for (const locale of LOCALES) {
  test(`wallet [${locale.name}]: connecting applies Trail Pass before the 1 Star demo cap`, async ({ page }) => {
    await page.goto(locale.query);
    await dismissWelcome(page);
    await connectWallet(page, locale.profileTab);
    await bookToSummary(page);

    // 450 → -68 Trail Pass → -381 demo safety cap → 1 Star charge.
    const rows = page.getByTestId("summary-rows");
    await expect(rows).toContainText("450");
    await expect(rows).toContainText("-68");
    await expect(rows).toContainText("-381");
    await expect(page.getByTestId("summary-pay")).toContainText("1");
  });
}

test("profile: rename dialog carries a labelled text field and updates the greeting", async ({ page }) => {
  // Demo surface for the KB-4 dialog fix: on a real device this dialog must
  // stay centered in the visible viewport while the keyboard is open.
  await page.goto("/?fast=1");
  await dismissWelcome(page);
  await page.getByTestId("tabbar").getByRole("button", { name: "Profile" }).click();
  await page.getByTestId("profile-rename").click();
  const dialog = page.getByRole("alertdialog", { name: "Display name" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Name", { exact: true }).fill("Marta");
  await dialog.getByTestId("rename-save").click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText("Hi, Marta")).toBeVisible();
});

test("platform lab: radius slider and dark toggle re-skin the app live", async ({ page }) => {
  await page.goto("/?fast=1");
  await dismissWelcome(page);

  await page.getByTestId("tabbar").getByRole("button", { name: "Profile" }).click();
  await page.getByTestId("open-lab").click();
  await expect(page.getByTestId("panel-profile-lab")).toBeVisible();

  // Radius slider raises the preview card's border-radius.
  const radiusOf = () =>
    page.getByTestId("lab-preview-card").evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
  const before = await radiusOf();
  const slider = page.getByTestId("lab-radius").getByRole("slider");
  await slider.focus();
  for (let i = 0; i < 5; i++) await slider.press("ArrowRight");
  await expect.poll(radiusOf).toBeGreaterThan(before);

  // Dark toggle flips the theme and the page root background.
  const bgOf = () =>
    page.getByTestId("app-shell").evaluate((el) => getComputedStyle(el).backgroundColor);
  const lightBg = await bgOf();
  await page.getByTestId("lab-appearance").getByText("Dark").click();
  await expect(page.getByTestId("app-root")).toHaveAttribute("data-theme", "dark");
  await expect.poll(bgOf).not.toBe(lightBg);
});

test("platform lab: choices persist across a reload", async ({ page }) => {
  await page.goto("/?fast=1");
  await dismissWelcome(page);
  await page.getByTestId("tabbar").getByRole("button", { name: "Profile" }).click();
  await page.getByTestId("open-lab").click();

  await page.getByTestId("lab-appearance").getByText("Dark").click();
  await expect(page.getByTestId("app-root")).toHaveAttribute("data-theme", "dark");
  // also raise the radius
  const slider = page.getByTestId("lab-radius").getByRole("slider");
  await slider.focus();
  for (let i = 0; i < 4; i++) await slider.press("ArrowRight");
  const rxOf = () => page.getByTestId("app-root").evaluate((el) => getComputedStyle(el).getPropertyValue("--tk-rx").trim());
  const rxBefore = await rxOf();
  expect(Number(rxBefore)).toBeGreaterThan(1);

  await page.reload();
  // dark AND the raised radius both survive the reload (one DeviceStorage slice).
  await expect(page.getByTestId("app-root")).toHaveAttribute("data-theme", "dark");
  await expect.poll(rxOf).toBe(rxBefore);
});
