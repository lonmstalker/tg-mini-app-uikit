# Release checklist

Use this checklist after the automated gates (lint, typecheck, unit, Playwright) pass or when preparing a public package release.

## Automated browser policy

Running today (`playwright.config.ts`):

- Chromium (402×874, DPR 1) over the package Storybook: render smoke + role/name per story, axe sweep (`e2e/a11y.storybook.spec.ts`), gesture perf asserts, 320 px WCAG reflow (`e2e/reflow.storybook.spec.ts`, viewport pinned in-spec) and RTL sweep (`e2e/rtl.storybook.spec.ts`).
- Demo-app suites (`trailhead`, `surface-composer`, `showcase`) with their own axe, width-matrix, and RTL checks.

Deferred — NOT in the gate today; add deliberately, not by assuming they exist:

- Visual snapshot projects (Chromium and WebKit — iOS Telegram WKWebView-sensitive rendering: font rasterization, shadows, glass, backdrop filters).
- Reduced-motion Chromium project for `prefers-reduced-motion`.
- DPR 2 and DPR 3 projects for density-sensitive snapshots.
- Firefox: only if maintainers decide desktop Firefox support must be explicitly guaranteed or a Firefox-specific regression is reported.

## Manual Telegram client smoke

Run this manual smoke before releases that touch Telegram runtime hooks, safe-area/viewport behavior, native buttons, haptics, storage, permissions, payments/share/link flows, or Storybook runtime examples. For docs-only and test-only patch releases, record why manual Telegram smoke was skipped.

Recommended platforms:

- iOS Telegram
- Android Telegram
- Telegram Desktop

Record the Telegram app version, OS version, device or emulator, build URL, and result.

Scenarios:

- Theme switch: light/dark, Telegram theme variables, dynamic theme change without reload.
- Viewport: expand/collapse, fullscreen enter/exit, stable height, keyboard open/close.
- Safe area: top/bottom cutouts, fullscreen chrome inset, `TKPage`, `TKSafeArea`, `TKBottomBar`, `TKTabbar`, and `TKWriteBar`.
- Native buttons: BackButton, MainButton, SecondaryButton, SettingsButton show/hide, click handlers, loading/progress, disabled state, cleanup after navigation.
- Haptics: impact, selection, success, and error paths where supported.
- Storage: CloudStorage save/load/clear, DeviceStorage set/get where supported, SecureStorage set/get where supported. Confirm browser fallback is not presented as secure storage.
- Permissions and device APIs: QR scanner, clipboard, contact request, write access, location, biometrics, accelerometer, device orientation with `need_absolute`, and gyroscope where supported.
- Links and commerce: external link, Telegram link, invoice, share, `sendData`, inline query, download file, chat request.
- Closing and navigation: closing confirmation, vertical swipes, orientation lock, app back stack, sheet/dialog Escape/back behavior.

Every release:

- Run the full automated verification loop (lint, typecheck, unit, Playwright, build).
- Confirm package imports and `tg-mini-app-uikit/style.css` work from build output.
- Review open issues for unresolved P0/P1 items.

Before minor, major, or runtime/platform releases:

- Run the manual Telegram client smoke above on iOS and Android at minimum.
- Add Telegram Desktop when the changed surface is not mobile-only.
- Attach concise evidence to the release notes or issue/PR: platform, version, scenario, result, and any unsupported API observed.
