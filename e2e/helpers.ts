import { expect, test, type Locator, type Page } from "@playwright/test";

export type DemoApp = "shop" | "booking" | "game" | "platform" | "gallery";

/** All gallery section anchors, in DOM order (slug = title before the first "·"). */
export const GALLERY_SECTIONS = [
  "playground",
  "buttons",
  "main-button",
  "selection-controls",
  "slider",
  "steps",
  "inputs",
  "form-primitives",
  "forms-2-0",
  "composition-primitives",
  "otp",
  "chips",
  "navigation",
  "lists-cells",
  "cards",
  "images",
  "media",
  "icons",
  "display-2-0",
  "feedback",
  "data",
  "empty-states",
  "overlays",
  "gestures",
  "popper",
  "stress",
  "stress-locales",
  "chat",
  "wow",
  "patterns",
  "localization",
  "layout",
  "theme-matrix",
  "tg-theme",
] as const;

export type GallerySlug = (typeof GALLERY_SECTIONS)[number];

/** Deep-link into a demo app (narrow mode renders it full-viewport). */
export async function gotoApp(
  page: Page,
  app: DemoApp,
  opts: { dark?: boolean; params?: Record<string, string> } = {},
): Promise<Locator> {
  const params = { ...(opts.params ?? {}) };
  // dynamic Booking dates would drift the visual baselines day to day
  if (app === "booking" && !params.today) params.today = "2026-06-15";
  const extra = Object.keys(params).length ? "&" + new URLSearchParams(params).toString() : "";
  await page.goto(`/?app=${app}${opts.dark ? "&dark=1" : ""}${extra}`);
  // The skeleton shimmer is an infinite pseudo-element animation; Playwright's
  // animations:"disabled" pauses it at a nondeterministic offset, which made
  // screenshot specs flake (~1 in 6). Freeze it in the pixel-comparing
  // projects only (the motion spec asserts the animation actually runs).
  const project = test.info().project.name;
  if (/visual|narrow|dpr/.test(project)) {
    await page.addStyleTag({ content: ".tk-skel::after { animation: none !important; transform: translateX(-90%); }" });
  }
  const root = page.locator(`[data-demo-app="${app}"]`);
  await expect(root).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return root;
}

/** Scrolls a gallery section into view and waits for content-visibility paint. */
export async function gallerySection(page: Page, slug: GallerySlug): Promise<Locator> {
  const section = page.locator(`[data-demo-section="${slug}"]`);
  await section.scrollIntoViewIfNeeded();
  // content-visibility: auto paints on intersection; a frame guarantees layout
  await section.evaluate((el) => new Promise(requestAnimationFrame));
  await expect(section).toBeVisible();
  return section;
}

/**
 * Forces layout/paint of every lazy (content-visibility: auto) gallery
 * section. Full-page screenshots taken at a scrolled position need this:
 * unpainted sections above the target keep their estimated height, so the
 * scroll offset would differ run to run.
 */
export async function paintGallery(page: Page) {
  for (const slug of GALLERY_SECTIONS) await gallerySection(page, slug);
}

/** Computed style of an element (or its pseudo-element). */
export function computedStyle(loc: Locator, prop: string, pseudo?: string): Promise<string> {
  return loc.evaluate(
    (el, arg) => getComputedStyle(el, arg.pseudo ?? null).getPropertyValue(arg.prop),
    { prop, pseudo },
  );
}

/** Horizontal scale factor from a computed `transform` matrix ("none" -> 1). */
export function matrixScaleX(transform: string): number {
  const m = transform.match(/matrix\(([^)]+)\)/);
  return m ? parseFloat(m[1].split(",")[0]) : 1;
}

/** Horizontal translation from a computed `transform` matrix ("none" -> 0). */
export function matrixTranslateX(transform: string): number {
  const m = transform.match(/matrix\(([^)]+)\)/);
  return m ? parseFloat(m[1].split(",")[4]) : 0;
}

/** Opens one of the gallery overlay demos and returns the overlay locator. */
export async function openGalleryOverlay(
  page: Page,
  button: "Bottom sheet" | "Dialog" | "Action sheet",
): Promise<Locator> {
  await gotoApp(page, "gallery");
  const section = await gallerySection(page, "overlays");
  await section.getByRole("button", { name: button, exact: true }).click();
  const overlay = page.getByRole(button === "Dialog" ? "alertdialog" : "dialog");
  await expect(overlay).toBeVisible();
  return overlay;
}

/** Adds the mug to the shop cart and opens the Cart tab. */
export async function fillCart(page: Page, opts: { dark?: boolean } = {}) {
  await gotoApp(page, "shop", opts);
  await page.locator('[data-demo-product="mug"]').click();
  await page.locator("[data-demo-product-sheet]").getByRole("button", { name: /Add / }).click();
  await page.locator("[data-demo-shop-tabbar]").getByRole("button", { name: "Cart" }).click();
  await expect(page.locator("[data-demo-pay-button]")).toBeVisible();
}
