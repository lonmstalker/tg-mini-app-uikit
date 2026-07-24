import { expect, test, type Page } from "@playwright/test";
import { TELEGRAM_DEMO_URL } from "../src/shared/links";

const INSTALL_COMMAND = "npm i tg-mini-app-uikit";

async function openDemo(page: Page) {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/demo/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

async function openLanding(page: Page) {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

test("demo renders without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await openDemo(page);
  await expect(page.locator(".showcase-phone-screen")).toBeVisible();
  await expect(page.getByTestId("browser-demo-notice")).toContainText(
    "the kit runs fully without Telegram",
  );
  await expect(page.getByRole("link", { name: "Open in Telegram" })).toHaveAttribute(
    "href",
    TELEGRAM_DEMO_URL,
  );
  expect(errors).toEqual([]);
});

test("demo header theme toggle updates the provider theme", async ({ page }) => {
  await openDemo(page);
  const root = page.getByTestId("showcase-root");

  await expect(root).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(root).toHaveAttribute("data-theme", "light");
});

test("demo locale switch updates site and kit-owned strings together", async ({ page }) => {
  await openDemo(page);

  await page.getByTestId("site-locale-ru").click();

  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.getByTestId("browser-demo-notice")).toContainText(
    "UIKit полноценно работает и без Telegram",
  );
  await page.getByTestId("locale-demo-cluster").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("locale-demo-cluster")).toContainText("Не пришёл код?");
  await expect(page.getByTestId("locale-demo-cluster")).toContainText("Отправить ещё раз");

  // Locale-driven behavior default (REU-011): under ru the phone field masks
  // +7; back under en it is free international input.
  const phone = page.getByTestId("locale-phone").getByRole("textbox");
  await phone.fill("9261234567");
  await expect(phone).toHaveValue("+7 (926) 123-45-67");
  await page.getByTestId("site-locale-en").click();
  const phoneEn = page.getByTestId("locale-phone").getByRole("textbox");
  await phoneEn.fill("+371 2 123");
  await expect(phoneEn).toHaveValue("+371 2 123");
});

test("demo bento ImageViewer opens and closes", async ({ page }) => {
  await openDemo(page);
  await page.getByTestId("component-tile-image-viewer").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("lazy-image-viewer")).toHaveAttribute("data-lazy-state", "mounted");

  await page.getByTestId("image-preview-0").click();
  const viewer = page.getByTestId("bento-image-viewer");
  await expect(viewer).toBeVisible();
  await viewer.getByRole("button", { name: "Close" }).click();
  await expect(viewer).toBeHidden();
});

test("demo accent preset repaints the hero phone frame", async ({ page }) => {
  await openDemo(page);
  const phone = page.locator(".showcase-phone-screen");
  const accent = () => phone.evaluate((node) => getComputedStyle(node).getPropertyValue("--tk-accent").trim());
  const wordmarkAccent = () =>
    page.locator(".site-header .wordmark-mark stop").first().evaluate(
      (node) => getComputedStyle(node).stopColor,
    );
  const initialAccent = await accent();
  const initialWordmarkAccent = await wordmarkAccent();

  await page.getByTestId("tweaks-panel").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Use Green accent" }).click();
  await expect.poll(accent).not.toBe(initialAccent);
  await expect.poll(wordmarkAccent).not.toBe(initialWordmarkAccent);
});

test("landing renders without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await openLanding(page);
  await expect(page.locator(".landing-phone")).toBeVisible();
  expect(errors).toEqual([]);
});

test("landing live demo CTA opens the demo page", async ({ page }) => {
  await openLanding(page);

  await expect(page.getByTestId("landing-telegram-cta")).toHaveAttribute(
    "href",
    TELEGRAM_DEMO_URL,
  );

  await page.getByTestId("landing-demo-cta").click();

  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "iOS-flavored UI kit for Telegram Mini Apps",
    }),
  ).toBeVisible();
});

test("shared header scrollspy follows clicks and scrolling on both pages", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });

  for (const scenario of [
    { route: "/", target: "code", previous: "features" },
    { route: "/demo/", target: "components", previous: "features" },
  ]) {
    await page.goto(scenario.route);
    const targetLink = page.getByTestId(`site-nav-link-${scenario.target}`);
    const previousLink = page.getByTestId(`site-nav-link-${scenario.previous}`);

    await targetLink.click();
    await expect(page).toHaveURL(new RegExp(`#${scenario.target}$`));
    await expect(targetLink).toHaveAttribute("aria-current", "location");
    await expect.poll(() => page.locator(`#${scenario.target}`).evaluate(
      (section) => section.getBoundingClientRect().top,
    )).toBeGreaterThanOrEqual(60);
    expect(await page.locator(`#${scenario.target}`).evaluate(
      (section) => section.getBoundingClientRect().top,
    )).toBeLessThan(200);

    await page.locator(`#${scenario.previous}`).evaluate((section) =>
      section.scrollIntoView({ block: "start" }),
    );
    await expect(previousLink).toHaveAttribute("aria-current", "location");
    await expect(targetLink).not.toHaveAttribute("aria-current", "location");
  }
});

test("shared navigation and footer links expose visible keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openLanding(page);

  for (const target of [
    page.getByTestId("site-nav-link-features"),
    page.getByTestId("site-footer").getByRole("link", { name: "Docs" }),
  ]) {
    await target.focus();
    await expect(target).toBeFocused();
    await expect.poll(() => target.evaluate((node) => getComputedStyle(node).boxShadow)).not.toBe("none");
  }
});

test("landing theme toggle updates the provider theme", async ({ page }) => {
  await openLanding(page);
  const root = page.getByTestId("landing-root");

  await expect(root).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(root).toHaveAttribute("data-theme", "light");
});

test("explicit theme survives landing to demo navigation and reload while the unstored theme follows the system", async ({ page }) => {
  await openLanding(page);
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.getByTestId("landing-root")).toHaveAttribute("data-theme", "light");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("showcase-theme"))).toBe("light");

  await page.getByRole("link", { name: /Native-feel gestures/ }).click();
  await expect(page).toHaveURL(/\/demo\/#components$/);
  await expect(page.getByTestId("showcase-root")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.getByTestId("showcase-root")).toHaveAttribute("data-theme", "light");

  await page.evaluate(() => localStorage.setItem("showcase-theme", "sepia"));
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.reload();
  await expect(page.getByTestId("showcase-root")).toHaveAttribute("data-theme", "dark");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("showcase-theme"))).toBeNull();

  await page.evaluate(() => localStorage.removeItem("showcase-theme"));
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.reload();
  await expect(page.getByTestId("showcase-root")).toHaveAttribute("data-theme", "light");
});

test("autoplay sheet preserves document focus and scroll for two full scenario cycles", async ({ page }) => {
  test.setTimeout(45_000);
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "no-preference" });
  await page.goto("/demo/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const stage = page.locator(".showcase-phone-stage");
  await expect(stage).toHaveAttribute("data-scenario-autoplay", "running");
  const target = page.getByTestId("tweaks-reset");
  await target.evaluate((node) => (node as HTMLElement).focus({ preventScroll: true }));
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(stage).toBeInViewport();

  await page.evaluate(() => {
    const active = document.activeElement as HTMLElement | null;
    const initialScrollY = window.scrollY;
    const state = {
      target: active,
      initialScrollY,
      focusChanged: false,
      maxScrollDelta: 0,
    };
    window.addEventListener("focusin", () => {
      if (document.activeElement !== state.target) state.focusChanged = true;
    });
    window.addEventListener("scroll", () => {
      state.maxScrollDelta = Math.max(state.maxScrollDelta, Math.abs(window.scrollY - initialScrollY));
    });
    (window as typeof window & { __focusRepro?: typeof state }).__focusRepro = state;
  });

  await expect.poll(
    () => stage.getAttribute("data-scenario-cycle").then((value) => Number(value)),
    { timeout: 40_000 },
  ).toBeGreaterThanOrEqual(2);

  const result = await page.evaluate(() => {
    const state = (window as typeof window & {
      __focusRepro?: {
        target: Element | null;
        initialScrollY: number;
        focusChanged: boolean;
        maxScrollDelta: number;
      };
    }).__focusRepro!;
    return {
      activePreserved: document.activeElement === state.target,
      focusChanged: state.focusChanged,
      scrollY: window.scrollY,
      initialScrollY: state.initialScrollY,
      maxScrollDelta: state.maxScrollDelta,
    };
  });
  expect(result).toEqual({
    activePreserved: true,
    focusChanged: false,
    scrollY: result.initialScrollY,
    initialScrollY: result.initialScrollY,
    maxScrollDelta: 0,
  });
});

test("hero sheet becomes fully modal after user takeover", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "no-preference" });
  await page.goto("/demo/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const stage = page.locator(".showcase-phone-stage");
  // While the automaton runs, the frame content is inert — takeover happens
  // only through the explicit button, which also resets to a clean wallet.
  const phoneContent = stage.locator(".showcase-phone-content");
  await expect(phoneContent).toHaveAttribute("inert", "");
  await stage.getByTestId("wallet-take-control").click();
  await expect(stage).toHaveAttribute("data-scenario-autoplay", "stopped");
  await expect(phoneContent).not.toHaveAttribute("inert", "");
  await expect(page.getByTestId("wallet-sheet")).toBeHidden();
  await page.getByRole("button", { name: /Pay with Everyday.*4821/ }).click();

  const sheet = page.getByTestId("wallet-sheet");
  await expect(sheet).toHaveAttribute("aria-modal", "true");
  await expect.poll(() => sheet.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await expect(stage.locator("[data-tk-scrim]")).toBeVisible();
  await sheet.getByRole("button", { name: "Close" }).click();

  const featureDemo = page.locator(".feature-gesture-demo");
  await featureDemo.scrollIntoViewIfNeeded();
  await featureDemo.getByRole("button", { name: "Open draggable sheet" }).click();
  await expect(page.getByTestId("feature-sheet")).toHaveAttribute("aria-modal", "true");
  await page.getByTestId("feature-sheet").getByRole("button", { name: "Done" }).click();

  const bentoDemo = page.getByTestId("sheet-demo");
  await bentoDemo.scrollIntoViewIfNeeded();
  await bentoDemo.getByRole("button", { name: "Open sheet" }).click();
  await expect(page.getByTestId("bento-sheet")).toHaveAttribute("aria-modal", "true");
});

test("closing a modal keeps the page scroll position — no smooth restore from the top", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "no-preference" });
  await page.goto("/demo/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const bentoDemo = page.getByTestId("sheet-demo");
  await bentoDemo.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(0);

  await bentoDemo.getByRole("button", { name: "Open sheet" }).click();
  await expect(page.getByTestId("bento-sheet")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("bento-sheet")).toBeHidden();

  // The scroll-lock release restores instantly; with `scroll-behavior: smooth`
  // on <html> a plain scrollTo used to animate from 0 back down — sample a few
  // frames to catch any such transition.
  const samples = await page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const out: number[] = [];
        const tick = () => {
          out.push(window.scrollY);
          if (out.length >= 8) resolve(out);
          else requestAnimationFrame(tick);
        };
        tick();
      }),
  );
  for (const y of samples) expect(Math.abs(y - before)).toBeLessThan(2);
});

test("locale switch keeps the clicked control anchored in the viewport", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/demo/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Sweep to the bottom first so every lazy tile above the i18n section mounts
  // now — their late mounts shift the layout independently of the locale and
  // would contaminate the baseline.
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  const control = page.getByTestId("locale-switch");
  await control.scrollIntoViewIfNeeded();
  // Wait for the layout to settle across real delays before clicking.
  let settle = await control.evaluate((node) => node.getBoundingClientRect().top);
  for (let stable = 0, attempts = 0; stable < 2 && attempts < 20; attempts++) {
    await page.waitForTimeout(250);
    const top = await control.evaluate((node) => node.getBoundingClientRect().top);
    stable = Math.abs(top - settle) < 1 ? stable + 1 : 0;
    settle = top;
  }

  // The anchoring contract is "the control stays under the pointer", so the
  // baseline must be the control's position at POINTERDOWN time — not before
  // the click: when the settled control sits fractionally outside the
  // viewport, Playwright's click actionability re-scrolls it into view first,
  // and a pre-click baseline goes stale by a full viewport (the 827px CI
  // failure: linux font metrics parked the control 0.06px above the fold).
  await control.evaluate((node) => {
    (window as unknown as { __anchorBefore: number | null }).__anchorBefore = null;
    node.addEventListener(
      "pointerdown",
      () => {
        (window as unknown as { __anchorBefore: number | null }).__anchorBefore =
          node.getBoundingClientRect().top;
      },
      { capture: true, once: true },
    );
  });

  // Russian copy above the switch is longer — without anchoring the control
  // drifts out from under the pointer when the page re-renders.
  await control.getByText("Russian").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  const before = await page.evaluate(
    () => (window as unknown as { __anchorBefore: number | null }).__anchorBefore,
  );
  expect(before).not.toBeNull();
  await expect
    .poll(async () => Math.abs((await control.evaluate((node) => node.getBoundingClientRect().top)) - (before as number)))
    .toBeLessThan(2);
});

test("nested light theme preview recomputes ink colors on a dark page", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/demo/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const card = page.getByTestId("feature-theme-preview");
  await card.scrollIntoViewIfNeeded();
  await page.getByTestId("feature-theme-switch").getByText("Light", { exact: true }).click();
  // The ink formula must resolve against the PREVIEW's light text (#131c26),
  // not inherit the page's dark-theme mix (FND-004 regression guard).
  await expect
    .poll(() => card.evaluate((node) => getComputedStyle(node).getPropertyValue("--tk-accent-ink")))
    .toContain("#131c26");
});

test("feature pages render localized content without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });

  for (const slug of ["telegram", "motion", "accessibility", "architecture", "theming"]) {
    await page.goto(`/${slug}/`);
    const title = page.getByRole("heading", { level: 1 });
    await expect(title).toBeVisible();
    const englishTitle = await title.textContent();
    await expect(page.getByTestId("feature-blocks").locator("article").first()).toBeVisible();
    await expect(page.getByTestId("feature-hero-demo")).toBeVisible();

    await page.getByTestId("site-locale-ru").click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(title).not.toHaveText(englishTitle ?? "");
    // Reset the persisted locale so the next page starts from English.
    await page.evaluate(() => window.localStorage.removeItem("showcase-locale"));
  }

  expect(errors).toEqual([]);
});

test("explore separators stay single-source at every responsive column count and theme", async ({ page }) => {
  for (const colorScheme of ["light", "dark"] as const) {
    for (const width of [375, 768, 1080, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto("/");
      const links = page.locator(".landing-explore-links");
      await links.scrollIntoViewIfNeeded();
      const hoverTarget = links.locator("a").nth(1);
      const relativeBox = () => hoverTarget.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        const parentRect = node.parentElement!.getBoundingClientRect();
        return {
          x: rect.left - parentRect.left,
          y: rect.top - parentRect.top,
          width: rect.width,
          height: rect.height,
        };
      });
      const beforeHover = await relativeBox();
      await hoverTarget.hover();
      expect(await relativeBox(), `${colorScheme} ${width}px hover geometry`).toEqual(beforeHover);

      const metrics = await links.evaluate((node) => {
        const style = getComputedStyle(node);
        const rects = Array.from(node.children, (child) => child.getBoundingClientRect());
        const rows = new Map<number, DOMRect[]>();
        for (const rect of rects) {
          const top = Math.round(rect.top * 10) / 10;
          rows.set(top, [...(rows.get(top) ?? []), rect]);
        }
        const sortedRows = [...rows.entries()].sort(([a], [b]) => a - b);
        const horizontalSeams = sortedRows.flatMap(([, row]) =>
          row
            .sort((a, b) => a.left - b.left)
            .slice(1)
            .map((rect, index) => rect.left - row[index].right),
        );
        const verticalSeams = sortedRows.slice(1).map(([, row], index) => {
          const previousBottom = Math.max(...sortedRows[index][1].map((rect) => rect.bottom));
          return Math.min(...row.map((rect) => rect.top)) - previousBottom;
        });
        return {
          rowGap: style.rowGap,
          columnGap: style.columnGap,
          borderBlockStart: style.borderBlockStartWidth,
          borderBlockEnd: style.borderBlockEndWidth,
          childBorders: Array.from(node.children, (child) => {
            const childStyle = getComputedStyle(child);
            return [
              childStyle.borderBlockStartWidth,
              childStyle.borderBlockEndWidth,
              childStyle.borderInlineStartWidth,
              childStyle.borderInlineEndWidth,
            ];
          }),
          rowCount: sortedRows.length,
          horizontalSeams,
          verticalSeams,
        };
      });

      expect(metrics.rowGap, `${colorScheme} ${width}px row gap`).toBe("1px");
      expect(metrics.columnGap, `${colorScheme} ${width}px column gap`).toBe("1px");
      expect(metrics.borderBlockStart).toBe("1px");
      expect(metrics.borderBlockEnd).toBe("1px");
      expect(metrics.childBorders.flat()).toEqual(Array(24).fill("0px"));
      expect(metrics.rowCount).toBe(width < 768 ? 6 : width < 1080 ? 2 : 1);
      for (const seam of [...metrics.horizontalSeams, ...metrics.verticalSeams]) {
        expect(seam).toBeCloseTo(1, 1);
      }
    }
  }
});

test("skeleton demo replaces content for 1.2 seconds and is instant with reduced motion", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "no-preference" });
  await page.goto("/demo/");
  const demo = page.getByTestId("skeleton-demo");
  await demo.scrollIntoViewIfNeeded();
  await expect(demo).toHaveAttribute("data-reload-state", "content");
  await expect(page.getByTestId("skeleton-content")).toBeVisible();

  await demo.getByRole("button", { name: "Reload preview" }).click();
  await expect(demo).toHaveAttribute("data-reload-state", "loading");
  await expect(page.getByTestId("skeleton-loading")).toBeVisible();
  await expect(demo).toHaveAttribute("data-reload-state", "content", { timeout: 2_000 });

  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.reload();
  const reducedDemo = page.getByTestId("skeleton-demo");
  await reducedDemo.scrollIntoViewIfNeeded();
  await reducedDemo.getByRole("button", { name: "Reload preview" }).click();
  await expect(reducedDemo).toHaveAttribute("data-reload-state", "content");
  await expect(page.getByTestId("skeleton-content")).toBeVisible();
});

test("landing locale switch persists Russian across reload", async ({ page }) => {
  await openLanding(page);

  await page.getByTestId("site-locale-ru").click();

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "React UIKit в стиле iOS для мини-приложений Telegram",
    }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");

  await page.reload();

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "React UIKit в стиле iOS для мини-приложений Telegram",
    }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
});

test("shared header and footer stay contained across viewport, theme, and locale matrix", async ({ page }) => {
  test.setTimeout(60_000);

  for (const route of ["/", "/demo/"]) {
    for (const width of [375, 1280]) {
      for (const colorScheme of ["light", "dark"] as const) {
        for (const locale of ["en", "ru"] as const) {
          await page.setViewportSize({ width, height: 900 });
          await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
          await page.goto(route);
          await page.getByTestId(`site-locale-${locale}`).click();
          await expect(page.locator("html")).toHaveAttribute("lang", locale);
          await expect(
            page.getByTestId(route === "/" ? "landing-root" : "showcase-root"),
          ).toHaveAttribute("data-theme", colorScheme);

          const headerMetrics = await page.getByTestId("site-header").evaluate((header) => {
            const wordmark = header.querySelector(".site-wordmark")!.getBoundingClientRect();
            const toolbar = header.querySelector(".site-header-actions")!.getBoundingClientRect();
            const navigation = header.querySelector(".site-navigation")!;
            return {
              documentWidth: document.documentElement.scrollWidth,
              viewportWidth: document.documentElement.clientWidth,
              wordmarkLeft: wordmark.left,
              wordmarkRight: wordmark.right,
              toolbarLeft: toolbar.left,
              toolbarRight: toolbar.right,
              navigationDisplay: getComputedStyle(navigation).display,
            };
          });

          expect(headerMetrics.documentWidth, `${route} ${width}px ${colorScheme} ${locale}`).toBe(
            headerMetrics.viewportWidth,
          );
          expect(headerMetrics.wordmarkLeft).toBeGreaterThanOrEqual(0);
          expect(headerMetrics.wordmarkRight).toBeLessThanOrEqual(headerMetrics.toolbarLeft);
          expect(headerMetrics.toolbarRight).toBeLessThanOrEqual(width);
          expect(headerMetrics.navigationDisplay).toBe(width < 768 ? "none" : "block");

          const footer = page.getByTestId("site-footer");
          await footer.scrollIntoViewIfNeeded();
          await expect(footer.locator(".site-wordmark")).toBeVisible();
          await expect(footer.locator(".site-footer-group h2")).toHaveCount(2);
          const footerMetrics = await footer.evaluate((node) => {
            const groups = Array.from(
              node.querySelectorAll<HTMLElement>(".site-footer-group"),
              (group) => group.getBoundingClientRect(),
            );
            return {
              left: Math.min(...groups.map((rect) => rect.left)),
              right: Math.max(...groups.map((rect) => rect.right)),
            };
          });
          expect(footerMetrics.left).toBeGreaterThanOrEqual(0);
          expect(footerMetrics.right).toBeLessThanOrEqual(width);
        }
      }
    }
  }
});

test("landing install copy writes the command and shows a kit toast", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openLanding(page);

  await page.getByTestId("landing-install-copy").click();

  await expect(page.getByText("Install command copied")).toBeVisible();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(INSTALL_COMMAND);
});
