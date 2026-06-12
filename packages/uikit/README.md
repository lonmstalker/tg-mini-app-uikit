# tg-mini-app-uikit

iOS-flavored React UI kit for **Telegram Mini Apps** — design tokens, themed components and springy motion. Everything resolves from CSS custom properties, so one `TKProvider` re-themes the whole tree (including the live Telegram theme).

## Install

```bash
npm i tg-mini-app-uikit
```

React 18 or 19 is a peer dependency.

## Quick start

```tsx
import { TKProvider, TKButton, TKToastProvider, useTKToast } from "tg-mini-app-uikit";
import "tg-mini-app-uikit/style.css"; // not needed with Vite — index.js imports it

function Screen() {
  const toast = useTKToast();
  return <TKButton onClick={() => toast.success("Done")}>Tap me</TKButton>;
}

export function App() {
  return (
    <TKProvider theme="light" accent="#3390ec" style={{ height: "100dvh" }}>
      <TKToastProvider>
        <Screen />
      </TKToastProvider>
    </TKProvider>
  );
}
```

`TKProvider` renders the `.tk` root element, applies the theme and is `position: relative` — kit overlays (`TKSheet`, `TKDialog`, `TKActionSheet`, toasts) anchor to it. Make it your full-viewport app root.

### Theme knobs

| Prop          | Default     | Meaning                                          |
| ------------- | ----------- | ------------------------------------------------ |
| `theme`       | `"light"`   | `"light" \| "dark"`                              |
| `accent`      | `#3390ec`   | Accent color; every derivative is computed in CSS |
| `roundness`   | `1`         | Radius scale multiplier (0.4–1.6 feels right)     |
| `motionSpeed` | `1`         | Divides every duration                            |
| `motion`      | `"springy"` | `"springy" \| "smooth"` movement character        |
| `fontSize`    | `16`        | Base size; the whole type scale derives from it   |

### Telegram WebApp integration

Two lines of setup — the `telegram` flag maps every token to the user's live
`--tg-theme-*` variables, and `useTelegramTheme()` follows light/dark switches:

```tsx
import { TKProvider, useTelegramTheme } from "tg-mini-app-uikit";

export function App() {
  const theme = useTelegramTheme(); // syncs with WebApp.colorScheme + themeChanged
  return (
    <TKProvider theme={theme} telegram style={{ height: "100dvh" }}>
      …your mini app…
    </TKProvider>
  );
}
```

| Token            | Telegram variable                     |
| ---------------- | ------------------------------------- |
| `--tk-accent`    | `--tg-theme-button-color`             |
| `--tk-on-accent` | `--tg-theme-button-text-color`        |
| `--tk-bg`        | `--tg-theme-secondary-bg-color`       |
| `--tk-surface`   | `--tg-theme-section-bg-color`         |
| `--tk-text`      | `--tg-theme-text-color`               |
| `--tk-text-2`    | `--tg-theme-subtitle-text-color`      |
| `--tk-text-3`    | `--tg-theme-hint-color`               |
| `--tk-sep`       | `--tg-theme-section-separator-color`  |
| `--tk-red`       | `--tg-theme-destructive-text-color`   |

Tokens without a Telegram counterpart (`--tk-surface-2/3`, `--tk-green`, `--tk-orange`, `--tk-glass`, `--tk-scrim`, shadows) keep their own themed values.

## Design tokens

Defined in [`src/styles/tokens.css`](src/styles/tokens.css), themed via `[data-theme]`.

- **Color** — `--tk-bg`, `--tk-surface(-2/-3)`, `--tk-text(-2/-3)`, `--tk-sep`, `--tk-accent` + derivatives (`-06/-12/-20/-35`, gradient, focus ring), `--tk-green/red/orange` (+ `-12` soft variants), `--tk-glass`, `--tk-scrim`, `--tk-shadow-sm/md/lg`.
- **Type** — SF-style modular scale from one base size: `caption2 ×0.69 · caption ×0.76 · footnote ×0.82 · sub ×0.88 · body ×1 · title3 ×1.18 · title2 ×1.38 · title1 ×1.65 · large ×2.05`. Weights: 700 titles, 600 emphasis, 400 text.
- **Shape** — `--tk-r-xs/sm/md/lg/xl` = 7/10/14/18/24 px × `--tk-rx`; pills are always fully round.
- **Motion** — `--tk-t1` 140 ms (presses), `--tk-t2` 260 ms (toggles, selection), `--tk-t3` 440 ms (sheets, charts, entrances), divided by `--tk-ms`. Springs for movement, ease-out for color/opacity.
- **Spacing** — 4 pt grid (4/8/12/16/24/32).

## Components

| Group      | Exports |
| ---------- | ------- |
| Theme      | `TKProvider`, `useTKTheme`, `useTelegramTheme`, `tkThemeVars` |
| Icons      | `TKIcon`, `TK_ICON_NAMES`, `TK_ICON_PATHS` (30 stroke icons) |
| Buttons    | `TKButton` (6 variants × 3 sizes, pill/full/icon), `TKIconButton`, `TKMainButton` (idle → loading → success), `TKSpinner` |
| Controls   | `TKChip`, `TKChipGroup`, `TKCheckbox`, `TKRadioGroup`, `TKSwitch`, `TKSlider`, `TKStepper`, `TKRating` |
| Inputs     | `TKInput`, `TKSearch`, `TKSelect`, `TKOTP` |
| Display    | `TKBadge`, `TKDot`, `TKCounter`, `TKAvatar`, `TKImg` |
| Navigation | `TKHeader`, `TKTabbar`, `TKSegmented`, `TKCategoryTabs`, `TKSteps`, `TKPageDots` |
| Lists      | `TKListGroup`, `TKCell` |
| Cards      | `TKProductCardA`, `TKProductCardB`, `TKBannerCard`, `TKBookingCard`, `TKStatTile` |
| Overlays   | `TKSheet`, `TKDialog`, `TKActionSheet`, `TKToastProvider` + `useTKToast`, `TKFrame` |
| Feedback   | `TKSkeleton(-Card/-List)`, `TKProgress`, `TKRing`, `TKBars`, `TKEmptyState`, `TKTimeline` |
| Patterns   | `TKSlotPicker`, `TKPaymentSummary`, `TKXPHeader`, `TKLeaderboard` |

### Conventions

- **Controlled & uncontrolled.** Stateful components accept `value`/`checked` + `onChange` (controlled) or `defaultValue`/`defaultChecked` (uncontrolled).
- **Overlays are controlled** by an `open` prop; exit animations are handled internally. They position against the nearest positioned ancestor — by default the `TKProvider` root.
- **`TKMainButton`** runs its idle → loading → success machine automatically when `onClick` returns a promise; pass `status` to drive it manually.

```tsx
<TKMainButton label="Pay $24.00" successLabel="Paid" onClick={() => api.pay()} />
```

## Migrating from the `raw/` prototype

| Prototype (globals)                                    | Kit |
| ------------------------------------------------------ | --- |
| `<div class="tk" data-theme>` + manual CSS vars        | `<TKProvider theme accent …>` |
| `TKSpinnerInline`                                      | `TKSpinner` |
| `TKChipRow`                                            | `TKChipGroup` |
| `TKQty`                                                | `TKStepper` |
| `TKSheetDemo` / `TKModalDemo` / `TKActionSheetDemo`    | `TKSheet` / `TKDialog` / `TKActionSheet` (controlled, `open`/`onClose`) |
| `TKToastDemo`                                          | `TKToastProvider` + `useTKToast()` |
| `TKProgressDemo` / `TKBarsDemo`                        | `TKProgress` / `TKBars` (data via props) |
| Hard-coded demo data (leaderboard, timeline, summary…) | Props with the same visuals |
