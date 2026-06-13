# Component Testing Matrix

This matrix captures the required test surface for the Telegram Mini Apps UI kit. It is scoped to the current package exports and the existing unit/e2e layout.

## Forms And Inputs

Components: `TKInput`, `TKTextarea`, `TKFormField`, `TKSearch`, `TKSelect`, `TKMultiselect`, `TKOTP`, `TKFileInput`, `TKCalendar`, `TKDateInput`, `TKMaskedInput`, `TKPhoneInput`, `TKTimeInput`, `TKPinInput`, `TKChipsInput`, `TKSelectable`.

Required cases:
- Unit: controlled/uncontrolled values, disabled state, hints/errors via `aria-describedby`, clear/password/counter behavior, mask truncation, invalid date/time, file preview cleanup, search cancel/expand, chip add/remove.
- Integration: date input sheet with month/year selectors, min/max/disabled dates, select/multiselect in constrained surfaces, form validation states in package-local Storybook sections.
- A11y: combobox/listbox names and keyboard flow, calendar grid keyboard, file row as button, OTP/PIN accessible labels, hidden actions outside tab order.
- Visual/e2e: focus/error/disabled/progress/preview, RTL, narrow viewport, long labels, high text scale.

Best files to extend: `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/otp.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `e2e/forms.spec.ts`, `e2e/a11y-keyboard.spec.ts`.

## Controls

Components: `TKCheckbox`, `TKRadioGroup`, `TKSwitch`, `TKChip`, `TKChipGroup`, `TKSlider`, `TKStepper`, `TKRating`.

Required cases:
- Unit: bounds, disabled keyboard/pointer, controlled state, haptics opt-in, removable chip stop-propagation, rating half-star math.
- Interaction: pointer drag, arrows/Home/End/PageUp/PageDown, stepper autorepeat, keyboard chip remove.
- A11y: `aria-checked`, mixed checkbox, roving tabindex, slider `aria-valuetext`, standalone switch names.
- Visual/e2e: hover/pressed/focus/forced-colors/DPR states.

Best files to extend: `packages/uikit/test/controls.test.tsx`, `packages/uikit/test/m2-roving.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`, `e2e/a11y-keyboard.spec.ts`, `e2e/states.spec.ts`.

## Overlays

Components: `TKSheet`, `TKDialog`, `TKActionSheet`, `TKPopper`, `TKTooltip`, `TKToastProvider`, `TKFrame`.

Required cases:
- Unit: focus trap, Escape/confirm, focus restore, scrim close, non-dismissible mode, snap clamp, closing timers, popper placement, toast queue/action/duration.
- Integration: nested overlay priority, select inside sheet, native back button priority.
- A11y: `aria-modal`, `aria-labelledby`, alertdialog name, tooltip focus, toast live region.
- Visual/e2e: open/closing animation, scrim, dark/light, reduced motion, swipe close, outside click.

Best files to extend: `packages/uikit/test/m3-gestures.test.tsx`, `packages/uikit/test/toasts.test.tsx`, `e2e/gestures.spec.ts`, `e2e/a11y-keyboard.spec.ts`, `e2e/motion.spec.ts`, `e2e/states.spec.ts`.

## Navigation

Components: `TKHeader`, `TKTabbar`, `TKSegmented`, `TKCategoryTabs`, `TKSteps`, `TKPageDots`, `TKNavStack`, `useNav`.

Required cases:
- Unit: push/pop/replace/popTo, params, state preservation, swipe-back modes, controlled nav controls, disabled options, safe-area counters.
- Integration: booking stack, shop tabbar, Telegram BackButton priority, scroll restoration.
- A11y: roving controls, current tab/page semantics, passive steps not focusable, hidden panels not announced.
- Visual/e2e: collapsing header, tabbar safe area, 320px overflow, RTL.

Best files to extend: `packages/uikit/test/m6-nav.test.tsx`, `packages/uikit/test/m2-roving.test.tsx`, `packages/uikit/test/m5-display.test.tsx`, `e2e/nav.spec.ts`, `e2e/flows.spec.ts`, `e2e/aria.spec.ts`.

## Display, Media, Lists

Components: badges, counters, avatars, `TKImage`, `TKImg`, spoiler, blockquote, skeletons, progress/ring/bars, empty state, timeline, gallery, lists/cells, accordion, infinite/virtual list.

Required cases:
- Unit: image load/error/fallback, avatar src reset, progress/ring clamping and ARIA, bar click/keyboard, IntersectionObserver trigger/disconnect, virtual scroll math, accordion lazy/multiple/disabled, cell toggle/link/action semantics.
- Integration: image skeleton route, virtual list scroll, product cards/list cells in app flows.
- A11y: spoiler hidden/revealed state, image alt, progress/ring/chart semantics, accordion expanded state, actionable list rows.
- Visual/e2e: DPR, reduced motion, skeletons, image error/blur-up, long text.

Best files to extend: `packages/uikit/test/m5-display.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `e2e/display.spec.ts`, `e2e/states.spec.ts`, `e2e/reduced-motion.spec.ts`, `e2e/density.spec.ts`.

## Telegram Platform Primitives

Components/hooks: `TKTelegramProvider`, native button hooks, haptics, popup, theme/viewport/safe area, storage, init data, fullscreen, links, invoice, share, QR, clipboard, permissions, biometrics/location/sensors.

Required cases:
- Unit: supported/unsupported gates, success/failure/cancel callbacks, event subscribe/unsubscribe, unmount cleanup, native button params/progress/shine/custom emoji, storage native/local/batch/restore/errors, sensor start/stop/unmount.
- Integration: mock host native clicks, colors, safe area, viewport expand, QR/invoice/settings restore.
- A11y: fallback DOM buttons, popup/log controls.
- Visual/e2e: Telegram theme variables, safe-area layout, header/bottom bar colors, dark/light.

Best files to extend: `packages/uikit/test/telegram-capabilities.test.tsx`, `packages/uikit/test/telegram-buttons-events.test.tsx`, `packages/uikit/test/main-button.test.tsx`, `e2e/platform.spec.ts`, `e2e/tokens.spec.ts`, `e2e/m9-apps.spec.ts`.

## Patterns

Components: `TKSlotPicker`, `TKPaymentSummary`, `TKXPHeader`, `TKLeaderboard`, wallet adapters, chat, onboarding tooltip, confetti, product/card patterns.

Required cases:
- Unit: slot day/slot controlled state, busy slots, payment totals/accent/children, XP clamp, leaderboard current user, wallet connected/loading/address, write bar safe area/autogrow, onboarding storage errors/seen/target missing, confetti RAF/reduced motion.
- Integration: booking, wallet send failure/success, support chat handoff/rating, onboarding identity, stars checkout.
- A11y: wallet/chat controls, slot selected state, leaderboard readability, coach-mark focus.
- Visual/e2e: app screens, long labels, RTL/narrow, success and failure paths.

Best files to extend: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `e2e/wow.spec.ts`, `e2e/flows.spec.ts`, `e2e/m9-apps.spec.ts`, `e2e/design.spec.ts`.

## Current Additions

This pass added regression coverage for:
- Storybook docs generation and deterministic package-local dev server script in `scripts/check-stories-coverage.mjs`.
- `TKInput` label/description/invalid/clear-button accessibility.
- `TKSearch` hidden cancel button accessibility.
- `TKChipsInput` keyboard-removable chips.
- `TKCell` keyboard row activation and nested switch isolation.
