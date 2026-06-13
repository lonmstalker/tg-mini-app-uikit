# Design Context

## Design Register

Product UI. Design serves repeated work: building, inspecting, testing, and shipping Telegram Mini App interfaces.

## Physical Scene

A product engineer is checking a Mini App checkout, settings, or platform permission flow inside a narrow Telegram WebView during development, then comparing the same component in Storybook on a desktop monitor before shipping. The UI must read as stable, native-feeling, and operational rather than decorative.

## Visual Direction

Use a restrained product interface: tinted neutral surfaces, one primary Telegram-friendly accent, clear state colors, compact hierarchy, and strong component consistency. The kit can feel iOS-flavored, but it should not copy platform chrome so literally that Telegram theme variables, Android/WebView behavior, or app branding become second-class.

## Color

- Prefer semantic `--tk-*` tokens over raw colors.
- Use Telegram theme variables when `TKProvider telegram` is enabled.
- For new token work, prefer OKLCH reasoning and avoid pure black or pure white as new design decisions.
- Keep the default strategy restrained: neutral surfaces and one accent used for primary actions, selected states, focus, and state indicators.
- Preserve state vocabulary: success, warning, error, info, disabled, selected, loading, unsupported.
- `--tk-sep` is the canonical separator token; `--tk-separator` is compatibility only.

## Typography

- Use the existing system-oriented product typography scale.
- Keep UI labels, buttons, helper text, table-like data, and controls compact and readable.
- Use hierarchy through size and weight, not decorative fonts.
- Keep prose line length around 65-75 characters in documentation-like surfaces.
- Do not use fluid viewport-based type scaling for product controls.

## Layout

- Prioritize predictable app structure over visual novelty.
- Avoid nested cards and decorative card grids.
- Use full-width bands, panels, lists, sheets, and tool surfaces where they match Mini App workflows.
- Keep stable dimensions for controls that can change state: buttons, sliders, counters, tabs, sheets, loading placeholders, icons, and list rows.
- Verify narrow/mobile layout at Telegram-like widths and safe-area conditions.
- Text must not overlap or overflow its component.

## Components

Every public visual component should define:

- default, hover, focus, active, disabled, loading, error, empty, readonly, selected, and unsupported states where relevant;
- keyboard behavior and focus visibility;
- accessible name and description wiring;
- light, dark, Telegram theme, RTL/locale, reduced-motion, and narrow/mobile behavior where relevant;
- Storybook evidence for public visual surfaces;
- tests aligned with risk and state complexity.

## Motion

- Motion should convey state, feedback, reveal, dismissal, or loading.
- Prefer transform and opacity.
- Respect reduced motion.
- Keep product transitions short, generally 150-250 ms.
- Avoid decorative choreography and page-load sequences.

## Telegram Mini App Constraints

- Components must work inside narrow mobile WebViews and desktop Telegram shells.
- Safe area, viewport changes, keyboard appearance, native buttons, haptics, Telegram theme variables, and runtime absence are core design constraints.
- Native Telegram button wrappers and runtime hooks should be used instead of ad hoc global access.
- Browser fallback states must be honest; for example, browser secure-storage fallback is not secure storage.

## Visual Quality Checks

Before accepting visual/public changes:

- Check light and dark themes.
- Check Telegram theme mapping.
- Check 320 px narrow layout and mobile safe-area conditions where relevant.
- Check RTL and locale stress when text or layout direction can change.
- Check reduced motion.
- Check hover, focus, pressed, open, loading, error, empty, disabled, selected, and unsupported states where relevant.
- Check that text, icons, badges, controls, overlays, and sheets do not overlap.
- Check performance risk: no avoidable layout animation, unnecessary timers, broad imports, or unstable context values.

## Banned Patterns

- Side-stripe accent borders on cards, list items, callouts, or alerts.
- Gradient text.
- Decorative glassmorphism as a default style.
- Hero-metric layouts inside product surfaces.
- Identical decorative card grids used as a substitute for information architecture.
- Modal-first solutions where inline, sheet, popover, or progressive disclosure would fit better.
- App-specific demo behavior exported as reusable UIKit API without a generic contract.
