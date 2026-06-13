# Release checklist

Use this checklist after the automated gates in `plans.md` pass or when preparing a public package release.

## Automated browser policy

Required automation:

- Chromium for functional Playwright flows, accessibility, ARIA snapshots, keyboard behavior, motion, platform mock behavior, and demo app smoke tests.
- Reduced-motion Chromium project for `prefers-reduced-motion`.
- Visual Chromium for core visual snapshots.
- Visual WebKit for iOS Telegram WKWebView-sensitive rendering such as font rasterization, shadows, glass, and backdrop filters.
- Narrow 320 project for WCAG reflow and small Android Telegram viewport checks.
- DPR 2 and DPR 3 projects for density-sensitive snapshots.

Firefox is not required in the release gate right now. Add a non-visual Firefox smoke project only if maintainers decide desktop Firefox support must be explicitly guaranteed or a Firefox-specific regression is reported.

## Manual Telegram client smoke

Run this manual smoke before releases that touch Telegram runtime hooks, safe-area/viewport behavior, native buttons, haptics, storage, permissions, payments/share/link flows, or demo platform examples. For docs-only and test-only patch releases, record why manual Telegram smoke was skipped.

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

- Run the final automated verification loop from `plans.md`.
- Confirm package imports and `tg-mini-app-uikit/style.css` work from build output.
- Review `plans.md` outcomes for unresolved P0/P1 issues.

Before minor, major, or runtime/platform releases:

- Run the manual Telegram client smoke above on iOS and Android at minimum.
- Add Telegram Desktop when the changed surface is not mobile-only.
- Attach concise evidence to the release notes or issue/PR: platform, version, scenario, result, and any unsupported API observed.
