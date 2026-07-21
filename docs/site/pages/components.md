# Components

The public surface is grouped by workflow rather than by file.

- Actions: `TKButton`, `TKIconButton`, `TKMainButton`, `TKInlineButtons`, `TKTappable`, `TKSpinner`.
- Forms: `TKInput`, `TKTextarea`, `TKSelect`, `TKMultiselect`, `TKChipsInput`, `TKCalendar`, `TKDateInput`, `TKTimeInput`, `TKMaskedInput`, `TKPhoneInput`, `TKPinInput`, `TKOTP`, `TKFileInput`, `TKSlider`, `TKStepper`, `TKRating`, `TKCheckbox`, `TKRadioGroup`, `TKSwitch`, `TKSearch`, `TKSelectable`, `TKChip`, `TKChipGroup`, `TKFormField` (label/hint/error scaffolding; `TKFormInput` aliases `TKInput`), `TKNativeField`.
- Display: `TKText`, `TKTitle`, `TKCaption`, `TKBadge`, `TKDot`, `TKCounter`, `TKAvatar`, `TKAvatarStack`, `TKImage`, `TKImg`, `TKSpoiler`, `TKEllipsis`, `TKBlockquote`, `TKGallery`, `TKIcon`.
- Lists: `TKListGroup`, `TKCell`, `TKAccordion` (lazy), `TKInfiniteList`, `TKVirtualList` (fixed row height).
- Cards and stats: `TKCard`, `TKCardCell`, `TKCardChip`, `TKProductCardA`, `TKProductCardB`, `TKBannerCard`, `TKBookingCard`, `TKStatTile`, `TKXPHeader`, `TKLeaderboard`.
- Loading and status: `TKSkeleton`, `TKSkeletonText`, `TKSkeletonCard`, `TKSkeletonList`, `TKSkeletonTable`, `TKProgress`, `TKRing`, `TKBars`, `TKEmptyState`, `TKTimeline`, `TKAsyncState`/`AsyncBoundary` (exactly one of loading/error/empty).
- Navigation: `TKNavStack`, `TKNavPanel`, `useNav`, `TKHeader`, `TKTabbar`, `TKTabView` (keep-mounted bottom-tab shell), `TKKeepMountTabs`/`TKKeepMountTab` + `useTabActive`, `TKSegmented`, `TKCategoryTabs`, `TKSteps`, `TKPageDots`.
- Layout: `TKApp`, `TKAppShell`, `TKPage`, `TKSafeArea`, `TKBottomBar`, `TKVisuallyHidden`.
- Overlays: `TKSheet`, `TKDialog`, `TKActionSheet`, `TKPopper`, `TKTooltip`, `TKToastProvider`, `useTKToast`, `TKImageViewer`, `TKFrame`.
- Feedback: `TKNoticeBar` — a tone-colored announcement strip (`accent`/`green`/`orange`/`red`). Visibility is the consumer's: render/unrender it; the close button first collapses the height so content below slides up, then calls `onClose`. `marquee` scrolls only genuinely overflowing text and is disabled under reduced motion.
- Telegram patterns: `TKMessages`, `TKMessageBubble`, `TKWriteBar`, `TKOnboardingTooltip`, `TKConfetti`, `TKPullToRefresh`, `TKSwipeCell`, `TKSlotPicker`, `TKPaymentSummary`, `TKWalletConnectButton`, `TKWalletStatusCell`.
- Utility hooks: `useReducedMotion`, `useLongPress`, `useOptionalNav`, `useOptionalHaptics`, `useHasNativeChrome`, `useTKTheme`, `useTKLocale`, `useTKBusyAnnounce`.

Every component accepts `testId?: string` and forwards refs where a meaningful DOM root exists. Stateful controls use controlled/uncontrolled pairs.

## Reuse contracts (REU audit)

- **Custom glyphs.** Every `icon`-style prop accepts a built-in `TKIconName` *or* a ready element (own SVG, emoji, image). `TKIcon` itself takes `path` — custom SVG content rendered in the standard 24×24 stroke viewBox.
- **Per-instance colors.** `TKProgress`, `TKRing`, `TKBars`, `TKSlider`, `TKSwitch`, `TKCheckbox`, `TKRating` take a `color` prop; `TKSwipeCell` actions take `color` per action. No private CSS-variable overrides needed.
- **`style`/`className` reach the root.** Composites and templates merge the consumer `style` last (consumer wins) and append `className`. `TKHeader variant="plain"` drops the glass background/blur/hairline for use outside the `TKPage` slot; its title is a real heading (`headingLevel`, default 1, `0` opts out).
- **No demo data.** Components never invent plausible-looking content: `TKStatTile` without `bars` renders no sparkline, `TKEmptyState` without `icon`/`media` renders no illustration, product cards have no placeholder title.
- **One anchoring contract for every overlay.** `TKSheet`, `TKDialog`, `TKActionSheet`, and `TKImageViewer` portal into the nearest `.tk` root or `[data-tk-portal-root]` element — the same host toasts and `TKPopper` already use — so a transformed, positioned, or `overflow: hidden` ancestor cannot clip or displace them. Inside a `.tk` host they stay `position: absolute` (`fixed` is unreliable in the Telegram iOS webview while the keyboard or viewport animates); only with no host at all do they fall back to `position: fixed` against `document.body`. Portals mount client-side: SSR markup contains no overlay content.
- **Dev warnings for silent coupling.** The modal overlays (`TKSheet`, `TKDialog`, `TKActionSheet`, `TKImageViewer`) warn in dev when the resolved portal host outgrows the viewport — a `.tk` root on a scrolling page still anchors them off-screen (the "sheet opens below the screen" trap); `TKVirtualList` warns when its scroller resolves to 0px height.

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
