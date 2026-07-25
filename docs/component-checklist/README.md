# Чеклист компонентов по правилам кита

Легенда: `✓` правило выполнено · `✗` нарушено · `!` сработал детектор, нужен
человеческий взгляд · `·` неприменимо · `?` проверяется вручную.

Сгенерировано `npm run check:rules` из [docs/component-rules.md](../component-rules.md).
Файл перезаписывается — правьте скрипт в `scripts/component-rules/`, не отчёт.

Компонентов: **116** · правил на компонент: **26** ·
с нарушениями: **0**.

Разделы: [app](app.md) · [atoms](atoms.md) · [atoms/buttons](atoms-buttons.md) · [atoms/controls](atoms-controls.md) · [atoms/display](atoms-display.md) · [atoms/inputs](atoms-inputs.md) · [composites](composites.md) · [composites/cards](composites-cards.md) · [composites/feedback](composites-feedback.md) · [composites/forms](composites-forms.md) · [composites/gestures](composites-gestures.md) · [composites/layout](composites-layout.md) · [composites/lists](composites-lists.md) · [composites/navigation](composites-navigation.md) · [composites/overlays](composites-overlays.md) · [foundation](foundation.md) · [telegram](telegram.md) · [templates](templates.md) · [templates/cards](templates-cards.md) · [templates/chat](templates-chat.md) · [templates/patterns](templates-patterns.md) · [tokens](tokens.md)

## Правила

| правило | что проверяет | ✗ | ! | ? |
| --- | --- | :-: | :-: | :-: |
| **M1** | Three anchors per absorbed trap | 0 | 0 | 0 |
| **M2** | Warn when you cannot absorb | 0 | 0 | 103 |
| **M3** | Promote learnings into the kit | 0 | 0 | 0 |
| **M4** | Instrument before the third fix | 0 | 0 | 0 |
| **A1** | className/style reach the root, consumer style last | 0 | 0 | 0 |
| **A2** | Icon escape hatch (TKIconProp) | 0 | 0 | 0 |
| **A3** | Per-instance color prop | 0 | 0 | 0 |
| **A4** | Never invent demo data | 0 | 0 | 0 |
| **A5** | No invisible regional defaults | 0 | 0 | 0 |
| **A6** | Controlled AND uncontrolled | 0 | 0 | 0 |
| **A7** | Survive real content | 0 | 0 | 116 |
| **A8** | Public API is deliberate | 0 | 0 | 0 |
| **B1** | Overlays portal; absolute inside the host | 0 | 0 | 0 |
| **B2** | One TKAppShell at the stable viewport | 0 | 0 | 0 |
| **B3** | Never fight the host over the keyboard | 0 | 0 | 4 |
| **B4** | Paint html/body in the host theme | 0 | 0 | 0 |
| **B5** | Bridge vendored, classified by platform | 0 | 0 | 0 |
| **B6** | Method presence is not feature detection | 0 | 0 | 0 |
| **B7** | Native chrome goes through arbitration | 0 | 0 | 0 |
| **B8** | Own the vertical axis explicitly | 0 | 0 | 0 |
| **B9** | Trust boundary | 0 | 0 | 1 |
| **C1** | SSR-safe | 0 | 0 | 0 |
| **C2** | Everything cleans up | 0 | 0 | 0 |
| **C3** | A11y is the contract | 0 | 0 | 0 |
| **C4** | Motion on transform/opacity | 0 | 0 | 0 |
| **D** | Definition of done evidence | 0 | 0 | 0 |

## Сводка по компонентам

| компонент | группа | ✗ | ! | ? |
| --- | --- | :-: | :-: | :-: |
| `AsyncBoundary` | composites/feedback | 0 | 0 | 2 |
| `TKAccordion` | composites/lists | 0 | 0 | 2 |
| `TKActionSheet` | composites/overlays | 0 | 0 | 1 |
| `TKApp` | app | 0 | 0 | 2 |
| `TKAppShell` | composites/layout | 0 | 0 | 2 |
| `TKAsyncBoundary` | composites/feedback | 0 | 0 | 2 |
| `TKAsyncState` | composites/feedback | 0 | 0 | 2 |
| `TKAvatar` | atoms/display | 0 | 0 | 2 |
| `TKAvatarStack` | atoms/display | 0 | 0 | 2 |
| `TKBadge` | atoms/display | 0 | 0 | 2 |
| `TKBannerCard` | templates/cards | 0 | 0 | 2 |
| `TKBars` | composites/feedback | 0 | 0 | 2 |
| `TKBlockquote` | atoms/display | 0 | 0 | 2 |
| `TKBookingCard` | templates/cards | 0 | 0 | 2 |
| `TKBottomBar` | composites/layout | 0 | 0 | 2 |
| `TKButton` | atoms/buttons | 0 | 0 | 2 |
| `TKCalendar` | composites/forms | 0 | 0 | 2 |
| `TKCaption` | tokens | 0 | 0 | 2 |
| `TKCard` | composites/cards | 0 | 0 | 2 |
| `TKCardCell` | composites/cards | 0 | 0 | 2 |
| `TKCardChip` | composites/cards | 0 | 0 | 2 |
| `TKCategoryTabs` | composites/navigation | 0 | 0 | 3 |
| `TKCell` | composites/lists | 0 | 0 | 2 |
| `TKCheckbox` | atoms/controls | 0 | 0 | 2 |
| `TKChip` | atoms/controls | 0 | 0 | 2 |
| `TKChipGroup` | atoms/controls | 0 | 0 | 2 |
| `TKChipsInput` | composites/forms | 0 | 0 | 2 |
| `TKConfetti` | templates | 0 | 0 | 2 |
| `TKCounter` | atoms/display | 0 | 0 | 2 |
| `TKDateInput` | composites/forms | 0 | 0 | 2 |
| `TKDialog` | composites/overlays | 0 | 0 | 2 |
| `TKDot` | atoms/display | 0 | 0 | 2 |
| `TKEllipsis` | atoms/display | 0 | 0 | 2 |
| `TKEmptyState` | composites/feedback | 0 | 0 | 2 |
| `TKFileInput` | atoms/inputs | 0 | 0 | 2 |
| `TKFormField` | atoms/inputs | 0 | 0 | 2 |
| `TKFormInput` | atoms/inputs | 0 | 0 | 2 |
| `TKFrame` | composites/overlays | 0 | 0 | 1 |
| `TKGallery` | composites | 0 | 0 | 2 |
| `TKHeader` | composites/navigation | 0 | 0 | 2 |
| `TKIcon` | atoms | 0 | 0 | 1 |
| `TKIconButton` | atoms/buttons | 0 | 0 | 2 |
| `TKImage` | atoms/display | 0 | 0 | 2 |
| `TKImageViewer` | composites/overlays | 0 | 0 | 1 |
| `TKImg` | atoms/display | 0 | 0 | 2 |
| `TKInfiniteList` | composites/lists | 0 | 0 | 2 |
| `TKInlineButtons` | atoms/buttons | 0 | 0 | 1 |
| `TKInput` | atoms/inputs | 0 | 0 | 2 |
| `TKKeepMountTab` | composites/navigation | 0 | 0 | 2 |
| `TKKeepMountTabs` | composites/navigation | 0 | 0 | 2 |
| `TKLeaderboard` | templates/patterns | 0 | 0 | 2 |
| `TKListGroup` | composites/lists | 0 | 0 | 2 |
| `TKLocaleProvider` | foundation | 0 | 0 | 2 |
| `TKMainButton` | atoms/buttons | 0 | 0 | 2 |
| `TKMaskedInput` | composites/forms | 0 | 0 | 2 |
| `TKMessageBubble` | templates/chat | 0 | 0 | 2 |
| `TKMessages` | templates/chat | 0 | 0 | 2 |
| `TKMultiselect` | atoms/inputs | 0 | 0 | 2 |
| `TKNativeField` | composites/forms | 0 | 0 | 2 |
| `TKNavPanel` | composites | 0 | 0 | 1 |
| `TKNavStack` | composites | 0 | 0 | 1 |
| `TKNoticeBar` | composites/feedback | 0 | 0 | 2 |
| `TKOnboardingTooltip` | templates | 0 | 0 | 3 |
| `TKOTP` | atoms/inputs | 0 | 0 | 2 |
| `TKPage` | composites/layout | 0 | 0 | 2 |
| `TKPageDots` | composites/navigation | 0 | 0 | 2 |
| `TKPaymentSummary` | templates/patterns | 0 | 0 | 2 |
| `TKPhoneInput` | composites/forms | 0 | 0 | 2 |
| `TKPinInput` | composites/forms | 0 | 0 | 2 |
| `TKPopper` | composites/overlays | 0 | 0 | 2 |
| `TKProductCardA` | templates/cards | 0 | 0 | 2 |
| `TKProductCardB` | templates/cards | 0 | 0 | 2 |
| `TKProgress` | composites/feedback | 0 | 0 | 2 |
| `TKProvider` | foundation | 0 | 0 | 2 |
| `TKPullToRefresh` | composites/gestures | 0 | 0 | 1 |
| `TKRadioGroup` | atoms/controls | 0 | 0 | 2 |
| `TKRating` | atoms/controls | 0 | 0 | 2 |
| `TKRing` | composites/feedback | 0 | 0 | 2 |
| `TKSafeArea` | composites/layout | 0 | 0 | 2 |
| `TKSearch` | atoms/inputs | 0 | 0 | 2 |
| `TKSegmented` | composites/navigation | 0 | 0 | 1 |
| `TKSelect` | atoms/inputs | 0 | 0 | 2 |
| `TKSelectable` | atoms/inputs | 0 | 0 | 2 |
| `TKSheet` | composites/overlays | 0 | 0 | 1 |
| `TKSkeleton` | composites/feedback | 0 | 0 | 2 |
| `TKSkeletonCard` | composites/feedback | 0 | 0 | 2 |
| `TKSkeletonList` | composites/feedback | 0 | 0 | 2 |
| `TKSkeletonTable` | composites/feedback | 0 | 0 | 2 |
| `TKSkeletonText` | composites/feedback | 0 | 0 | 2 |
| `TKSlider` | atoms/controls | 0 | 0 | 1 |
| `TKSlotPicker` | templates/patterns | 0 | 0 | 2 |
| `TKSpinner` | atoms/buttons | 0 | 0 | 2 |
| `TKSpoiler` | atoms/display | 0 | 0 | 2 |
| `TKStatTile` | templates/cards | 0 | 0 | 2 |
| `TKStepper` | atoms/controls | 0 | 0 | 2 |
| `TKSteps` | composites/navigation | 0 | 0 | 2 |
| `TKSwipeCell` | composites/gestures | 0 | 0 | 2 |
| `TKSwitch` | atoms/controls | 0 | 0 | 2 |
| `TKTabbar` | composites/navigation | 0 | 0 | 2 |
| `TKTabView` | composites/navigation | 0 | 0 | 2 |
| `TKTappable` | atoms | 0 | 0 | 2 |
| `TKTelegramProvider` | telegram | 0 | 0 | 2 |
| `TKText` | tokens | 0 | 0 | 2 |
| `TKTextarea` | atoms/inputs | 0 | 0 | 2 |
| `TKTimeInput` | composites/forms | 0 | 0 | 2 |
| `TKTimeline` | composites/feedback | 0 | 0 | 2 |
| `TKTitle` | tokens | 0 | 0 | 2 |
| `TKToastProvider` | composites/overlays | 0 | 0 | 2 |
| `TKTooltip` | composites/overlays | 0 | 0 | 2 |
| `TKViewportForensics` | telegram | 0 | 0 | 4 |
| `TKVirtualList` | composites/lists | 0 | 0 | 1 |
| `TKVisuallyHidden` | atoms | 0 | 0 | 2 |
| `TKWalletConnectButton` | templates/patterns | 0 | 0 | 2 |
| `TKWalletStatusCell` | templates/patterns | 0 | 0 | 2 |
| `TKWriteBar` | templates/chat | 0 | 0 | 2 |
| `TKXPHeader` | templates/patterns | 0 | 0 | 2 |
