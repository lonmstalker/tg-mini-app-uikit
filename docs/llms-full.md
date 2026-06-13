# tg-mini-app-uikit full AI reference

This is the long-form companion to `llms.txt`. It is written for coding agents that need to produce correct React code against the kit without scraping the source tree.

## Component inventory

Actions: `TKButton`, `TKIconButton`, `TKMainButton`, `TKInlineButtons`, `TKTappable`, `TKSpinner`.

Forms: `TKInput`, `TKTextarea`, `TKSelect`, `TKMultiselect`, `TKChipsInput`, `TKMaskedInput`, `TKPhoneInput`, `TKTimeInput`, `TKCalendar`, `TKDateInput`, `TKPinInput`, `TKOTP`, `TKFileInput`, `TKCheckbox`, `TKRadioGroup`, `TKSwitch`, `TKSlider`, `TKStepper`, `TKRating`, `TKSearch`, `TKSelectable`, `TKFormField`.

Display and media: `TKText`, `TKTitle`, `TKCaption`, `TKBadge`, `TKDot`, `TKCounter`, `TKAvatar`, `TKAvatarStack`, `TKImage`, `TKImg`, `TKSpoiler`, `TKBlockquote`, `TKGallery`, `TKIcon`, `TK_ICON_NAMES`.

Navigation: `TKNavStack`, `TKNavPanel`, `useNav`, `TKHeader`, `TKTabbar`, `TKSegmented`, `TKCategoryTabs`, `TKSteps`, `TKPageDots`.

Overlays and feedback: `TKSheet`, `TKDialog`, `TKActionSheet`, `TKPopper`, `TKTooltip`, `TKToastProvider`, `useTKToast`, `TKFrame`.

Patterns: `TKMessages`, `TKMessageBubble`, `TKWriteBar`, `TKOnboardingTooltip`, `TKConfetti`, `TKPullToRefresh`, `TKSwipeCell`, `TKSlotPicker`, `TKPaymentSummary`, `TKXPHeader`, `TKLeaderboard`, `TKWalletConnectButton`, `TKWalletStatusCell`, `TKEmptyState`, `TKSkeletonText`, `TKSkeletonCard`, `TKProgress`, `TKRing`, `TKBars`, `TKTimeline`.

## Telegram platform hooks

Hooks cover Bot API 9.6 and degrade to safe browser fallbacks: `useWebApp`, `useTelegramTheme`, `useViewport`, `useSafeArea`, `useMainButton`, `useSecondaryButton`, `useBackButton`, `useBackIntercept`, `useBackDispatcher`, `useSettingsButton`, `useHaptics`, `useOptionalHaptics`, `useTelegramPopup`, `useCloudStorage`, `useDeviceStorage`, `useSecureStorage`, `useInitData`, `useInvoice`, `useShare`, `useClipboard`, `useQrScanner`, `useBiometrics`, `useLocation`, `useMotionSensors`, `useFullscreen`, `useOrientationLock`, `useHomeScreen`, `useEmojiStatus`, `useContactRequest`, `useWriteAccess`, `useChatRequest`, `useDownloadFile`, `useDataTransport`, `useTelegramLinks`, `useTelegramColors`, `useClosingConfirmation`, `useActivity`, `useKeyboard`, `useHideKeyboard`, `useTelegramEvent`.

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
