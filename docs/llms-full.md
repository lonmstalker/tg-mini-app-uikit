# tg-mini-app-uikit full AI reference

This is the long-form companion to `llms.txt`. It is written for coding agents that need to produce correct React code against the kit without scraping the source tree.

## Component inventory

Providers and app bootstrap: `TKProvider` (the `.tk` root: CSS variables, overlay/toast anchor), `TKTelegramProvider` (bridge + haptics, `webApp=` mock injection), `TKLocaleProvider`, `TKApp` (providers + host background — it does not mount the shell), `TKAppShell` (stable-viewport-capped app column — no iOS keyboard two-jump; mount it yourself under `TKApp`), `TKViewportForensics` (on-device debug overlay behind `?kbdebug=1`). App entry: `tkResolveTelegramBridge()` loads the vendored bridge and classifies the launch via `isRealTelegramBridge`.

Actions: `TKButton`, `TKIconButton`, `TKMainButton`, `TKInlineButtons`, `TKTappable`, `TKSpinner`.

Forms: `TKInput`, `TKTextarea`, `TKSelect`, `TKMultiselect`, `TKChipsInput`, `TKMaskedInput`, `TKPhoneInput`, `TKTimeInput`, `TKCalendar`, `TKDateInput`, `TKPinInput`, `TKOTP`, `TKFileInput`, `TKCheckbox`, `TKRadioGroup`, `TKSwitch`, `TKSlider`, `TKStepper`, `TKRating`, `TKSearch`, `TKSelectable`, `TKChip`, `TKChipGroup`, `TKFormField` (`TKFormInput` aliases `TKInput`), `TKNativeField`.

Display and media: `TKText`, `TKTitle`, `TKCaption`, `TKBadge`, `TKDot`, `TKCounter`, `TKAvatar`, `TKAvatarStack`, `TKImage`, `TKImg`, `TKSpoiler`, `TKEllipsis` (visual clamp + show-more, SR reads full text), `TKBlockquote`, `TKGallery`, `TKIcon`, `TK_ICON_NAMES`, `TKVisuallyHidden`.

Lists: `TKListGroup`, `TKCell`, `TKAccordion` (lazy), `TKInfiniteList`, `TKVirtualList` (fixed row height), `TKSwipeCell`.

Cards and stats: `TKCard`, `TKCardCell`, `TKCardChip`, `TKProductCardA`, `TKProductCardB`, `TKBannerCard`, `TKBookingCard`, `TKStatTile`, `TKXPHeader`, `TKLeaderboard`.

Navigation: `TKNavStack`, `TKNavPanel`, `useNav`, `TKHeader` (`back="auto"` dedups the native Back button), `TKTabbar`, `TKTabView` (keep-mounted bottom-tab shell), `TKKeepMountTabs`/`TKKeepMountTab` + `useTabActive`, `TKSegmented`, `TKCategoryTabs`, `TKSteps`, `TKPageDots`.

Layout: `TKPage`, `TKSafeArea`, `TKBottomBar`.

Overlays and feedback: `TKSheet` (`modal={false}` passive mode), `TKDialog`, `TKActionSheet`, `TKPopper`, `TKTooltip`, `TKToastProvider`, `useTKToast`, `TKImageViewer` (shared-element open, pinch-zoom, swipe-down close), `TKNoticeBar` (tone strip, marquee), `TKFrame`. Modal overlays suppress the native Main/Secondary buttons while open; opt out per overlay with `nativeButtons="keep"`.

Loading and status: `TKSkeleton`, `TKSkeletonText`, `TKSkeletonCard`, `TKSkeletonList`, `TKSkeletonTable`, `TKProgress`, `TKRing`, `TKBars`, `TKEmptyState`, `TKTimeline`, `TKAsyncState`/`AsyncBoundary` (exactly one of loading/error/empty).

Patterns: `TKMessages`, `TKMessageBubble`, `TKWriteBar`, `TKOnboardingTooltip`, `TKConfetti`, `TKPullToRefresh`, `TKSlotPicker`, `TKPaymentSummary`, `TKWalletConnectButton`, `TKWalletStatusCell`.

## Telegram platform hooks

Hooks cover Bot API 9.6 and degrade to safe browser fallbacks: `useWebApp`, `useTelegramTheme`, `useViewport`, `useSafeArea`, `useMainButton`, `useSecondaryButton`, `useBackButton`, `useBackIntercept`, `useBackDispatcher`, `useSettingsButton`, `useHaptics`, `useOptionalHaptics`, `useTelegramPopup`, `useCloudStorage`, `useDeviceStorage`, `useSecureStorage`, `useInitData`, `useInvoice`, `useShare`, `useClipboard`, `useQrScanner`, `useBiometrics`, `useLocation`, `useMotionSensors`, `useFullscreen`, `useOrientationLock`, `useHomeScreen`, `useEmojiStatus`, `useContactRequest`, `useWriteAccess`, `useChatRequest`, `useDownloadFile`, `useDataTransport`, `useTelegramLinks`, `useTelegramColors`, `useClosingConfirmation`, `useActivity`, `useKeyboard` (visualViewport + host-managed-keyboard modes), `useHideKeyboard`, `useTelegramEvent`, `useTelegramEnvironment` (the "am I really inside Telegram?" primitive), `useVerticalSwipes` (swipe-to-minimize), `useSuppressNativeButtons`/`useNativeButtonsSuppressed` (overlay arbitration of native buttons), `useBackButtonWanted` (native Back already claimed by an interceptor), `useTKHostBackground` (paint html/body for bare-`TKProvider` apps).

UIKit-side hooks: `useHasNativeChrome` (native chrome vs in-DOM fallbacks), `useReducedMotion`, `useLongPress`, `useOptionalNav`, `useTKTheme`, `useTKLocale`, `useTKBusyAnnounce`.

## Reusable pattern examples

- Stars checkout: `TKCardChip`, `TKPaymentSummary`, `useInvoice`, receipt state, `TKConfetti`.
- Identity onboarding: `TKGallery`, `TKPageDots`, contact/write-access requests, `TKPinInput`, `useBiometrics`, emoji status.
- Storage restore: `useCloudStorage`, `useDeviceStorage`, `useSecureStorage` with explicit save/load controls.
- Support handoff: `TKMessages`, `TKWriteBar`, quick-reply `TKChip`, `useTelegramLinks`, `TKRating`.
- Arcade: fullscreen, orientation lock, deterministic motion sensor reads and a paused state on background.
- Feed: `TKSpoiler`, `TKBlockquote`, reactions with `TKChip` + `TKCounter`, `useShare`, read markers.
- Wallet: `TKWalletConnectButton`, `TKWalletStatusCell`, send confirmation with `TKDialog`, history with `TKInfiniteList`.
- Forms: `TKDateInput`, `TKPhoneInput`, `TKChipsInput`, `TKFileInput`, range `TKSlider`, summary `TKSheet`.

## Do not

- Do not add runtime dependencies to the kit package.
- Do not hardcode user-facing strings inside reusable kit components; use locale props or `TKLocaleProvider`.
- Do not bypass the provider root for overlays or toasts.
- Do not implement ad hoc Telegram back behavior; use `useBackIntercept` or `TKNavStack`.
- Do not animate layout properties for interaction feedback; use transform and opacity.
