# Components

The public surface is grouped by workflow rather than by file.

- Actions: `TKButton`, `TKIconButton`, `TKMainButton`, `TKInlineButtons`, `TKTappable`, `TKSpinner`.
- Forms: `TKInput`, `TKTextarea`, `TKSelect`, `TKMultiselect`, `TKChipsInput`, `TKCalendar`, `TKDateInput`, `TKTimeInput`, `TKMaskedInput`, `TKPhoneInput`, `TKPinInput`, `TKFileInput`, `TKSlider`, `TKStepper`, `TKRating`, `TKCheckbox`, `TKRadioGroup`, `TKSwitch`.
- Display: `TKText`, `TKBadge`, `TKCounter`, `TKAvatar`, `TKAvatarStack`, `TKImage`, `TKSpoiler`, `TKBlockquote`, `TKGallery`, `TKIcon`.
- Navigation: `TKNavStack`, `TKNavPanel`, `useNav`, `TKHeader`, `TKTabbar`, `TKSegmented`, `TKCategoryTabs`, `TKSteps`, `TKPageDots`.
- Overlays: `TKSheet`, `TKDialog`, `TKActionSheet`, `TKPopper`, `TKTooltip`, `TKToastProvider`, `useTKToast`.
- Telegram patterns: `TKMessages`, `TKMessageBubble`, `TKWriteBar`, `TKOnboardingTooltip`, `TKConfetti`, `TKPullToRefresh`, `TKSwipeCell`, `TKPaymentSummary`, `TKWalletConnectButton`, `TKWalletStatusCell`.

Every component accepts `testId?: string` and forwards refs where a meaningful DOM root exists. Stateful controls use controlled/uncontrolled pairs.
