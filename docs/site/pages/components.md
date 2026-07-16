# Components

The public surface is grouped by workflow rather than by file.

- Actions: `TKButton`, `TKIconButton`, `TKMainButton`, `TKInlineButtons`, `TKTappable`, `TKSpinner`.
- Forms: `TKInput`, `TKTextarea`, `TKSelect`, `TKMultiselect`, `TKChipsInput`, `TKCalendar`, `TKDateInput`, `TKTimeInput`, `TKMaskedInput`, `TKPhoneInput`, `TKPinInput`, `TKFileInput`, `TKSlider`, `TKStepper`, `TKRating`, `TKCheckbox`, `TKRadioGroup`, `TKSwitch`.
- Display: `TKText`, `TKBadge`, `TKCounter`, `TKAvatar`, `TKAvatarStack`, `TKImage`, `TKSpoiler`, `TKEllipsis`, `TKBlockquote`, `TKGallery`, `TKIcon`.
- Navigation: `TKNavStack`, `TKNavPanel`, `useNav`, `TKHeader`, `TKTabbar`, `TKSegmented`, `TKCategoryTabs`, `TKSteps`, `TKPageDots`.
- Overlays: `TKSheet`, `TKDialog`, `TKActionSheet`, `TKPopper`, `TKTooltip`, `TKToastProvider`, `useTKToast`, `TKImageViewer`.
- Feedback: `TKNoticeBar` — a tone-colored announcement strip (`accent`/`green`/`orange`/`red`). Visibility is the consumer's: render/unrender it; the close button first collapses the height so content below slides up, then calls `onClose`. `marquee` scrolls only genuinely overflowing text and is disabled under reduced motion.
- Telegram patterns: `TKMessages`, `TKMessageBubble`, `TKWriteBar`, `TKOnboardingTooltip`, `TKConfetti`, `TKPullToRefresh`, `TKSwipeCell`, `TKPaymentSummary`, `TKWalletConnectButton`, `TKWalletStatusCell`.

Every component accepts `testId?: string` and forwards refs where a meaningful DOM root exists. Stateful controls use controlled/uncontrolled pairs.

`TKCalendar` range mode supports both start/end activation and press-drag selection; touch drag arms after a short hold so ordinary vertical page scrolling remains native.

## Accessibility contracts

Custom interactive controls expose native or explicit keyboard semantics:

- `TKChip` uses `aria-pressed` for selectable chips. Removable chips expose a keyboard-operable remove control named `Remove <label>`.
- `TKOTP` renders the resend action as a real button, so Enter and Space activate the same action as pointer input.
- `TKTabbar` is bottom navigation, not a tablist. The active item is exposed with `aria-current="page"`.
- `TKSteps` renders passive progress as non-focusable content. It renders buttons only when `onStepClick` makes steps interactive; the current step is exposed with `aria-current="step"`.
- `TKTooltip` links the trigger to the tooltip with `aria-describedby`, opens on hover and focus, and closes on Escape.
- `TKRing` exposes progress as `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`.
- `TKBars` is decorative by default. When `onBarClick` is provided, each bar is a named keyboard-operable button.
- `TKPinInput` shakes and clears on `error` (announced assertively) and pops the dot row green on `success` (polite `codeVerified` announcement); both fire the matching Telegram haptic.
- `TKEllipsis` clamps text visually only — assistive technology reads the full text while collapsed. The "show more" button renders only on real overflow, carries `aria-expanded`, and expand/collapse animates height (instant under reduced motion). Default is one-way expand; pass `collapsible` to allow folding back.
- `TKNoticeBar` uses `role="status"` (announced without stealing focus), names its close button from the locale, and keeps a static screen-reader copy of marquee text — the scrolling track is `aria-hidden`.
- `TKImageViewer` is a full-screen photo viewer: shared-element open from `originRef` (plain zoom+fade without it), pinch-zoom 1–3× with rubber-banding, double-tap zoom, swipe between frames at 1×, and 1:1 swipe-down to close with velocity hand-off. `alt` is required per image. Escape, the Telegram Back button, the tap on the backdrop, and ←/→ keys all work; focus is trapped while open and restored on close; page scroll is locked. Pinch/pan stay live under reduced motion — entrances and exits collapse to instant. `TKGallery` opens it on slide tap via `viewerImages` (index-aligned full-res images).

For overlays, `TKDialog`, `TKSheet`, and `TKActionSheet` own their focus behavior while open and restore or release focus on close according to their component contract. `TKSheet modal={false}` is the passive-preview opt-out: it omits the scrim, focus transfer/trap/restore, background inerting, scroll lock, Escape/Back interception, and Telegram swipe guard. Inside Telegram a modal overlay also hides the native Main/Secondary buttons while open (they sit beyond the scrim's reach in the client chrome) and restores them on close; pass `nativeButtons="keep"` when the overlay itself is driven by the native button.
