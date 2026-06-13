import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { GALLERY_SECTIONS, fillCart, gallerySection, gotoApp } from "./helpers";

/**
 * A11Y / axe-core — WCAG 2.0/2.1 A+AA scans of every app screen and every
 * gallery section. Serious and critical violations fail the test.
 */

/**
 * Known kit-level debt, excluded from the blocking scan but tracked by the
 * burn-down audit below:
 * - color-contrast: tinted-surface text was fixed in M2.2 (`--tk-text-2/3`
 *   now pass AA, brand text uses the AA `--tk-*-ink` colors). What remains
 *   is white-on-solid-brand chrome (filled buttons, counters) — the accent
 *   is user-supplied (Telegram theme), so its contrast is the host app's
 *   design decision, not a kit bug.
 */
const KNOWN_DEBT_RULES = ["color-contrast"];

async function expectNoSeriousViolations(page: Page, include: string) {
  const results = await new AxeBuilder({ page })
    .include(include)
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .disableRules(KNOWN_DEBT_RULES)
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(
    serious,
    serious
      .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)
      .join("\n"),
  ).toEqual([]);
}

test.describe("app screens", () => {
  test("shop catalog", async ({ page }) => {
    await gotoApp(page, "shop");
    await expectNoSeriousViolations(page, '[data-demo-app="shop"]');
  });

  test("shop cart", async ({ page }) => {
    await fillCart(page);
    await expectNoSeriousViolations(page, '[data-demo-app="shop"]');
  });

  test("shop product sheet", async ({ page }) => {
    await gotoApp(page, "shop");
    await page.locator('[data-demo-product="mug"]').click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectNoSeriousViolations(page, "[data-demo-product-sheet]");
  });

  test("booking", async ({ page }) => {
    await gotoApp(page, "booking");
    await expectNoSeriousViolations(page, '[data-demo-app="booking"]');
  });

  test("game", async ({ page }) => {
    await gotoApp(page, "game");
    await expectNoSeriousViolations(page, '[data-demo-app="game"]');
  });

  test("platform", async ({ page }) => {
    await gotoApp(page, "platform");
    await expectNoSeriousViolations(page, '[data-demo-app="platform"]');
  });

  test("dark theme — shop + gallery top", async ({ page }) => {
    await gotoApp(page, "shop", { dark: true });
    await expectNoSeriousViolations(page, '[data-demo-app="shop"]');
  });
});

test.describe("gallery sections", () => {
  for (const slug of GALLERY_SECTIONS) {
    test(slug, async ({ page }) => {
      await gotoApp(page, "gallery");
      await gallerySection(page, slug);
      await expectNoSeriousViolations(page, `[data-demo-section="${slug}"]`);
    });
  }
});

/**
 * Contrast burn-down: paid down to zero in M2.2 — this test keeps it there.
 * Adding new low-contrast UI fails here with the exact node list attached.
 */
const CONTRAST_BUDGET = 0;

test("contrast burn-down — debt must not grow", async ({ page }, testInfo) => {
  await gotoApp(page, "gallery");
  for (const slug of GALLERY_SECTIONS) await gallerySection(page, slug);
  const results = await new AxeBuilder({ page })
    .include('[data-demo-app="gallery"]')
    .withRules(["color-contrast"])
    .analyze();
  await testInfo.attach("color-contrast-violations.json", {
    body: JSON.stringify(results.violations, null, 2),
    contentType: "application/json",
  });
  const nodes = results.violations.reduce((n, v) => n + v.nodes.length, 0);
  test.info().annotations.push({ type: "contrast-violations", description: String(nodes) });
  expect(
    nodes,
    `color-contrast debt grew past the budget (${nodes} > ${CONTRAST_BUDGET}); fix the new nodes instead of raising the budget`,
  ).toBeLessThanOrEqual(CONTRAST_BUDGET);
});
