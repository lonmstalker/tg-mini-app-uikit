# Element Patterns

These are thinking patterns, not copy-paste implementations. Always inspect the closest local analog before applying one.

## 1. Token-only addition

Example kinds: semantic warning color, elevation level, motion duration, density knob.

Expected outputs:

- token declaration in `packages/uikit/src/styles/tokens.css`;
- light, dark, and Telegram-themed mapping when relevant;
- docs or Storybook reference showing intended use;
- token contract or visual coverage when the token affects UI behavior;
- no raw consumers that bypass the semantic token.

## 2. Visual primitive

Example kinds: icon, status dot, ring, badge, avatar-like surface.

Expected outputs:

- semantic markup or minimal non-semantic markup with correct accessible naming;
- token-based styling for color, size, radius, motion, and focus;
- stable dimensions to avoid layout shift;
- Storybook story covering variants and states;
- render and a11y smoke tests.

## 3. Form control

Example kinds: input, select, OTP, slider, date-like surface.

Expected outputs:

- label, description, helper, and error wiring with stable IDs;
- controlled/uncontrolled contract and default value behavior;
- keyboard behavior, focus order, and disabled/readonly semantics;
- validation and parsing edge cases;
- tests for state transitions and interaction;
- stories for states, density/theme, and error/loading where relevant.

## 4. Overlay/floating component

Example kinds: dialog, sheet, popper, tooltip, action sheet-like surface.

Expected outputs:

- focus management, initial focus, focus restore, and Escape behavior;
- outside click/tap behavior when dismissible;
- portal, z-index, safe-area, viewport, and scroll locking decisions;
- scroll/resize/listener cleanup;
- screen reader semantics and background interaction rules;
- tests for keyboard, dismissal, cleanup, and SSR safety.

## 5. Navigation/layout component

Example kinds: tabbar, nav stack, page shell, safe-area layout.

Expected outputs:

- active/current state semantics;
- keyboard behavior and roving focus if applicable;
- safe-area, viewport, keyboard, and fullscreen behavior;
- focus restoration on navigation transitions;
- tokenized spacing and motion;
- stories covering narrow/mobile, RTL, and theme contexts when relevant.

## 6. Telegram runtime hook/provider/adapter

Example kinds: wrapper around a new WebApp method, event, sensor, storage API, or native button.

Expected outputs:

- guarded WebApp access via existing provider/hook patterns;
- SSR-safe imports and non-Telegram fallback;
- event/listener/sensor cleanup;
- feature detection and/or version gating with an explicit reason;
- Telegram mock updates;
- capability and unsupported-state tests;
- docs that state trust boundaries and fallback limits.

## 7. Pattern/template

Example kinds: wallet, checkout, booking, onboarding, chat, dashboard, future domain patterns.

Expected outputs:

- composition from existing primitives and atoms first;
- minimal domain assumptions and typed extension points;
- no hidden external side effects, network calls, or runtime dependencies;
- demo/story/docs showing reusable structure rather than app-specific data;
- clear boundary between reusable UIKit API and application-owned state or business logic.
