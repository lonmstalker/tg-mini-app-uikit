# Telegram Mini App Design Constraints

Platform playbook for design work in **tg-mini-app-uikit**. Read it before directing any screen, flow, or component here. It is design-facing: it shapes intent, layout, states, and acceptance criteria, and ends at handoff notes — it does not prescribe code (route that to `impeccable`, or `uikit-element-development` for reusable kit elements).

A Mini App is **not a website**. It is a webview hosted inside the Telegram client on a phone, wrapped in Telegram's own chrome. Design every decision against that frame.

## 1. The host frame and safe areas (the #1 pitfall)

Telegram draws a header (with its Back/⋯ controls) and the device draws a home indicator / notch. Two inset systems coexist and **disagree**:

- `env(safe-area-inset-*)` — device cutouts. Inside the Telegram webview this is frequently **0** even on notched phones.
- Telegram's JS insets (`safeAreaInset` / `contentSafeAreaInset`) — the *real* space the device + Telegram chrome occupy, especially in expanded/fullscreen mode.

Design rules:

- **Nothing tappable or essential may sit in the safe-area gap.** Bottom-anchored surfaces — sheets, action sheets, toasts, the write bar, the bottom action bar — must visibly clear the home indicator. Top-anchored surfaces (top toasts, fullscreen headers) must clear the Telegram header / notch.
- Specify the inset as a requirement, not a nicety: "the Cancel button sits above the home indicator in expanded mode." Implementation bridges the JS inset into the kit's `--tk-safe-*` tokens; your job is to *require* it.
- Don't design full-bleed bottom CTAs that assume a flush edge. Reserve the inset.
- The viewport height changes (collapsed ↔ expanded ↔ fullscreen, and on keyboard). Design layouts that reflow, not fixed-height compositions.

## 2. Native chrome vs in-DOM controls

Telegram exposes native **MainButton, SecondaryButton, BackButton, SettingsButton**. Decide per surface:

- **Primary commit action** (Pay, Continue, Confirm) → prefer the native **MainButton**: it lives in the Telegram chrome, is always reachable, and matches user expectation. Do not *also* render an in-DOM primary button doing the same thing — pick one so the action never appears twice.
- **Back / dismiss** → the native **BackButton** and the system edge-swipe are the primary back affordance on mobile (there is no Escape key). Any overlay (sheet, dialog, action sheet) must make Back **close the overlay first**, then pop the nav stack — never let Back close the whole app while a layer is open. Require this explicitly.
- A back press / edge-swipe must map to exactly one action — no double-fire (close overlay *and* pop a screen).
- Secondary/settings actions → native Secondary/Settings buttons when they fit the platform idiom.

## 3. Keyboard behavior

The on-screen keyboard covers the bottom of the viewport. On iOS WebViews it shrinks only the *visual* viewport, not the layout viewport, so naive bottom-pinned UI ends up **behind** the keyboard.

- For any form with a pinned footer/CTA or a chat write bar: require that the submit control and the focused field stay **visible above the keyboard**.
- Don't place critical content in the bottom ~40% of a form screen that the keyboard will cover.
- Design the "keyboard open" state explicitly as one of the screen states.

## 4. Gestures and scroll

- **Swipe-down-to-minimize** is a Telegram gesture enabled by default. A downward drag over a bottom sheet, action sheet, dialog, or a scrollable area can collapse the whole app. Require that modal surfaces and pull/scroll areas **contain** the gesture (overscroll contained; the platform gesture muted while the surface owns the vertical axis).
- **Edge-swipe-back** is reserved by the OS/Telegram. Keep horizontal-swipe content (carousels, swipeable rows) **away from the screen edges** — reserve an edge inset so the user's edge swipe doesn't fight app navigation.
- Long-press, swipe-to-reveal, and pull-to-refresh must not fire alongside a tap/scroll. Specify which gesture owns which axis.

## 5. Haptics

Telegram provides haptic feedback (selection, impact light/medium/heavy, notification success/warning/error). Use it as **confirmation of meaningful state change**, sparingly:

- selection on segmented/tab/picker changes; impact on commit or threshold-crossing (pull-to-refresh armed, swipe action fired); notification on success/error outcomes.
- Never on every render or every scroll tick. A haptic that fires when nothing changed reads as a bug. Specify the exact trigger.

## 6. Theming

The app runs in two theming modes and must hold up in both: the kit's **light/dark** theme and the **live Telegram theme** (`--tg-theme-*`, which the user's client controls and can be any palette).

- Direct designs in **semantic tokens** (`--tk-*`: text, surface, accent, separator, etc.), never hardcoded hex. The kit already maps Telegram theme params onto its tokens.
- Don't assume a specific brand color, light background, or contrast — the user's Telegram theme may invert your assumptions. Check contrast intent in both modes.
- Header/background/bottom-bar colors can be set to match the app; specify the intended chrome colors as part of the screen direction.

## 7. Motion and ergonomics

- The kit's character is **iOS-flavored, springy**. Match it: short, spring-eased transitions; directional navigation (push enters from the right, back returns from the left — never the reverse). Honor reduced-motion.
- One-handed phone use: keep primary actions in the thumb zone (bottom), secondary/destructive actions out of accidental-tap range. Minimum 44px tap targets.
- Overlays must stack predictably and never render off-screen or clipped by a rounded/`overflow:hidden` container; anchored poppers/tooltips must stay on-screen within the safe area.

## 8. Telegram Mini App design review checklist

When critiquing or specifying a screen here, confirm:

- Bottom-anchored controls clear the home indicator; top content clears the Telegram header/notch.
- Primary action is unambiguous and not duplicated (native MainButton vs in-DOM).
- Back/edge-swipe closes the top layer first; never closes the app with an overlay open; fires once.
- Form CTA and focused field stay above the keyboard; "keyboard open" state is defined.
- No modal/scroll surface lets the swipe-down collapse the app; edge-swipe zones are reserved.
- Haptics fire only on real state changes, with the trigger named.
- Holds up in light, dark, and an arbitrary live Telegram theme; colors are semantic tokens.
- Empty / error / loading / first-run / offline states are defined.
- Motion is directional and reduced-motion safe; tap targets ≥ 44px.

## 9. Handoff mapping

In handoff notes, name the implementation owner per item:

- Reusable kit surface (token, component, overlay, form control, nav/layout, Telegram runtime hook) → **`uikit-element-development`**, with the safe-area / native-button / keyboard / gesture / theming requirements stated as acceptance criteria.
- One-off visual craft, polish, or app-screen composition from existing kit parts → **`impeccable`**.

Always express Mini-App constraints as **acceptance criteria** ("Back closes the sheet, not the app"; "CTA stays above the keyboard"; "Cancel clears the home indicator"), not as code.
