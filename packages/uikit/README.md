# tg-mini-app-uikit

iOS-flavored React UI kit for **Telegram Mini Apps** — design tokens, themed components, app patterns and a typed Telegram WebApp platform layer. Everything resolves from CSS custom properties, so one `TKProvider` re-themes the whole tree (including the live Telegram theme).

## Install

```bash
npm i tg-mini-app-uikit
```

React 18 or 19 is a peer dependency.

The package has no runtime dependencies besides React/React DOM. For non-Vite consumers import the stylesheet explicitly:

```tsx
import "tg-mini-app-uikit/style.css";
```

## Quick start

```tsx
import {
  TKProvider,
  TKPage,
  TKMainButton,
  TKToastProvider,
  useHaptics,
  useMainButton,
  useTelegramTheme,
  useTKToast,
} from "tg-mini-app-uikit";

function Screen() {
  const toast = useTKToast();
  const haptics = useHaptics();
  useMainButton({
    text: "Pay $24.00",
    onClick: () => {
      haptics.notification("success");
      toast.success("Paid");
    },
  });
  return (
    <TKPage>
      <TKMainButton label="Pay $24.00" onClick={() => toast.success("Paid")} />
    </TKPage>
  );
}

export function App() {
  const theme = useTelegramTheme();
  return (
    <TKProvider theme={theme} telegram style={{ height: "100dvh" }}>
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

Beyond theming, the kit ships a typed platform layer over `window.Telegram.WebApp`.
Every hook no-ops (or falls back to a browser equivalent) outside Telegram, and all
of them read the WebApp from `<TKTelegramProvider webApp={…}>` when present — inject
a mock there in package tests and Storybook stories:

```tsx
import { useMainButton, useBackButton, useViewport, useHaptics } from "tg-mini-app-uikit";

function Checkout({ total, onPay, onBack }: Props) {
  const haptics = useHaptics();
  const { isExpanded, expand } = useViewport();

  useBackButton(onBack);
  useMainButton({
    text: `Pay ${total}`,
    onClick: () => {
      haptics.impact("medium");
      onPay();
    },
  });
  // …
}
```

Core hooks: `useWebApp`, `useTelegramEvent`, `useTelegramTheme`, `useViewport`,
`useFullscreen`, `useActivity`, `useSafeArea`, `useMainButton`,
`useSecondaryButton`, `useBackButton`, `useSettingsButton`, `useHaptics`,
`useTelegramPopup`, `useInitData`, `useClosingConfirmation`.

Workflow hooks: `useTelegramLinks`, `useTelegramColors`, `useInvoice`,
`useShare`, `useDataTransport`, `useContactRequest`, `useWriteAccess`,
`useClipboard`, `useQrScanner`, `useHomeScreen`, `useEmojiStatus`,
`useDownloadFile`, `useChatRequest`, `useHideKeyboard`.

Storage/device hooks: `useCloudStorage`, `useDeviceStorage`, `useSecureStorage`,
`useBiometrics`, `useLocation`, `useMotionSensors`, `useVerticalSwipes`,
`useOrientationLock`. Every hook reports `isSupported` or returns a safe
unsupported result outside Telegram.

Layout primitives — `TKPage` (pinned header/footer + scrollable content),
`TKSafeArea` and `TKBottomBar` — combine `env(safe-area-inset-*)` with the live
Telegram insets, so device cutouts and fullscreen chrome are handled in one place.

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

Defined in [`src/tokens/tokens.css`](src/tokens/tokens.css), themed via `[data-theme]`.

- **Color** — `--tk-bg`, `--tk-surface(-2/-3)`, `--tk-text(-2/-3)`, `--tk-sep`, `--tk-accent` + derivatives (`-06/-12/-20/-35`, gradient, focus ring), `--tk-green/red/orange` (+ `-12` soft variants), `--tk-glass`, `--tk-scrim`, `--tk-shadow-sm/md/lg`.
- **Type** — SF-style modular scale from one base size: `caption2 ×0.69 · caption ×0.76 · footnote ×0.82 · sub ×0.88 · body ×1 · title3 ×1.18 · title2 ×1.38 · title1 ×1.65 · large ×2.05`. Weights: 700 titles, 600 emphasis, 400 text.
- **Shape** — `--tk-r-xs/sm/md/lg/xl` = 7/10/14/18/24 px × `--tk-rx`; pills are always fully round.
- **Motion** — `--tk-t1` 140 ms (presses), `--tk-t2` 260 ms (toggles, selection), `--tk-t3` 440 ms (sheets, charts, entrances), divided by `--tk-ms`. Springs for movement, ease-out for color/opacity.
- **Spacing** — 4 pt grid (4/8/12/16/24/32).

## Components

| Group      | Exports |
| ---------- | ------- |
| Theme      | `TKProvider`, `useTKTheme`, `tkThemeVars` |
| Typography | `TKText`, `TKTitle`, `TKCaption` |
| Telegram   | `TKTelegramProvider`, `useWebApp`, `useTelegramEvent`, `useTelegramTheme`, `useViewport`, `useFullscreen`, `useActivity`, `useSafeArea`, native button hooks, haptics, popups, storage, links, invoice, share, QR, clipboard, permissions, home screen, emoji status, download, chat, keyboard, biometrics, location, motion sensors |
| Layout     | `TKPage`, `TKSafeArea`, `TKBottomBar` |
| Service    | `TKVisuallyHidden`, `TKTappable` |
| Icons      | `TKIcon`, `TK_ICON_NAMES`, `TK_ICON_PATHS` (30 stroke icons) |
| Buttons    | `TKButton` (6 variants × 3 sizes, pill/full/icon), `TKIconButton`, `TKInlineButtons`, `TKMainButton` (idle → loading → success), `TKSpinner` |
| Controls   | `TKChip`, `TKChipGroup`, `TKCheckbox`, `TKRadioGroup`, `TKSwitch`, `TKSlider`, `TKStepper`, `TKRating` |
| Inputs     | `TKFormField`, `TKFormInput`, `TKInput`, `TKTextarea`, `TKSearch`, `TKSelect`, `TKMultiselect`, `TKSelectable`, `TKFileInput`, `TKOTP` |
| Display    | `TKBadge`, `TKDot`, `TKCounter`, `TKAvatar`, `TKImage` (loading/error states), `TKImg` (wireframe placeholder) |
| Navigation | `TKHeader`, `TKTabbar`, `TKSegmented`, `TKCategoryTabs`, `TKSteps`, `TKPageDots` |
| Lists      | `TKListGroup`, `TKCell`, `TKAccordion` |
| Cards      | `TKCard`, `TKCardCell`, `TKCardChip`, `TKProductCardA`, `TKProductCardB`, `TKBannerCard`, `TKBookingCard`, `TKStatTile` |
| Overlays   | `TKSheet`, `TKDialog`, `TKActionSheet`, `TKPopper`, `TKTooltip`, `TKToastProvider` + `useTKToast`, `TKFrame` |
| Feedback   | `TKSkeleton(-Card/-List)`, `TKProgress`, `TKRing`, `TKBars`, `TKEmptyState`, `TKTimeline` |
| Patterns   | `TKSlotPicker`, `TKPaymentSummary`, `TKXPHeader`, `TKLeaderboard`, `TKWalletConnectButton`, `TKWalletStatusCell` |

Selection components (`TKSelect`, `TKSegmented`, `TKRadioGroup`, `TKChipGroup`,
`TKCategoryTabs`) accept `TKOption[]` — plain strings or
`{ value, label, disabled, icon }` items; `string[]` keeps working as-is.

### Conventions

- **Controlled & uncontrolled.** Stateful components accept `value`/`checked` + `onChange` (controlled) or `defaultValue`/`defaultChecked` (uncontrolled).
- **Overlays are controlled** by an `open` prop; exit animations are handled internally. They position against the nearest positioned ancestor — by default the `TKProvider` root.
- **`TKMainButton`** runs its idle → loading → success machine automatically when `onClick` returns a promise; pass `status` to drive it manually.

```tsx
<TKMainButton label="Pay $24.00" successLabel="Paid" onClick={() => api.pay()} />
```

`TKMainButton` is the in-DOM fallback; inside Telegram prefer the native
`useMainButton` adapter — same idea, rendered by the client itself.

## Capability matrix

| Capability | Hooks / exports | Browser fallback |
| ---------- | --------------- | ---------------- |
| Theme, viewport, safe area | `useTelegramTheme`, `useViewport`, `useFullscreen`, `useSafeArea` | static state + CSS safe-area env |
| Native buttons | `useMainButton`, `useSecondaryButton`, `useBackButton`, `useSettingsButton` | no-op; use DOM components |
| Native UI | `useHaptics`, `useTelegramPopup`, `useHideKeyboard` | no-op or browser alert/confirm/blur |
| Storage | `useCloudStorage`, `useDeviceStorage`, `useSecureStorage` | scoped `localStorage` |
| Bot flows | `useInvoice`, `useShare`, `useDataTransport`, `useChatRequest` | unsupported/browser share where possible |
| Permissions | `useContactRequest`, `useWriteAccess`, `useClipboard`, `useQrScanner` | browser clipboard or unsupported |
| Bot API 8-9.6 extras | `useHomeScreen`, `useEmojiStatus`, `useDownloadFile` | unsupported/download anchor |
| Device APIs | `useBiometrics`, `useLocation`, `useMotionSensors`, `useVerticalSwipes`, `useOrientationLock` | unsupported |

The package-local Storybook and e2e specs inject an in-memory mock through
`<TKTelegramProvider webApp={mock.webApp}>`, so these hooks can be developed and
smoke-tested in a normal browser.
