---
date: 2026-06-16
topic: tma-native-lab-demo
status: brainstorm-refined-checkpoints
---

# TMA Native Lab Demo Brainstorm

## What We Were Trying To Solve

The goal is not to build another component gallery or another believable consumer
app like Trailhead. The goal is to create a demo that answers a sharper product
question:

> Why do Telegram Mini Apps need to exist at all?

The demo must make the answer felt, not merely explained. It should show that a
bot alone cannot create a continuous, sensor-aware, stateful, native-feeling
interface, while a normal website can approximate parts of it only with more
friction and weaker Telegram context. The demo should show that a TMA can combine
Telegram chrome, runtime APIs, device sensors, native buttons, permissions,
haptics, live theme, storage, and a polished UIKit surface into one coherent
experience.

## Existing Demo Context

The current shipped demo is `examples/trailhead`: an outdoor-adventure Mini App
with five tabs and one persona. It already proves a large consumer-product flow:

- Discover guided hikes.
- View detail and gallery.
- Book through a multi-panel funnel.
- Pay with Telegram Stars behind PIN/biometrics.
- Use TON wallet for a Trail Pass discount.
- Check in by QR, biometrics, and location.
- Train toward a streak.
- Chat with a guide.
- Re-skin the app in Platform Lab.
- Persist booking, check-in, wallet, streak, and theme across reload.

Because Trailhead already covers consumer booking, Stars, QR check-in, TON
discount, chat, gamification, theming, i18n, persistence, onboarding, loading,
error, empty states, pull-to-refresh, swipe actions, action sheets, dialogs,
toasts, sheets, and deep nav stacks, the next demo should avoid another
`catalog -> detail -> booking -> pay -> status` story.

The new demo should instead showcase:

- Telegram runtime introspection.
- Device motion/orientation/fullscreen behavior.
- Live safe-area and viewport handling.
- Permission-first UX.
- Browser/mock fallback honesty.
- Dense platform proof, not just attractive product UI.
- A high-quality motion experience that is meaningful, not decorative.

## Initial Idea Lenses

We explored ideas through at least 12 lenses to avoid duplicated or weak concepts:

1. Everyday utility.
2. B2B operations.
3. Creator economy.
4. Finance and trust.
5. Education.
6. Health and self-care without medical promises.
7. Community and governance.
8. Support and CRM.
9. Media and content.
10. Device/API-first experiences.
11. Games and loyalty.
12. Developer tools and meta-demos.

The filtering rule was strict: duplicated ideas and generic filler should not
count. Anything too close to Trailhead's travel/booking/payment/check-in shape
was deprioritized.

## Full Idea Inventory

### 1. Домовой штаб ЖК

Residents create building-management requests, vote on house issues, issue guest
passes, and track incident statuses.

- UIKit shown beyond Trailhead: `TKFileInput`, `TKRadioGroup`, `TKDateInput`,
  `TKTimeline`, request lifecycles, voting, document-like flows.
- User surprise: a resident files an emergency request with a photo, votes, and
  issues a guest pass in one Telegram-native flow.
- Confidence in UIKit: shows that the kit handles mundane real service workflows,
  not only beautiful consumer booking.
- UIKit additions: `TKPoll`, `TKIssueCard`, `TKPassCard`, request/SLA template.

### 2. Семейный бюджет в чате

A family budget tool with expenses, limits, private approvals, and shared
summaries.

- UIKit shown beyond Trailhead: `TKBars`, `TKInput`, `TKSegmented`, `TKSpoiler`,
  money states, private secure flows.
- User surprise: a large expense requires PIN/biometrics and immediately updates
  the family limit.
- Confidence in UIKit: sensitive data, local recovery, and error handling feel
  reliable.
- UIKit additions: `TKMoneyInput`, `TKBudgetRing`, masked currency helpers.

### 3. Кухонный планировщик недели

Weekly meal planning, grocery list generation, allergen substitutions, and shared
household lists.

- UIKit shown beyond Trailhead: `TKCheckbox`, `TKChipsInput`, `TKMultiselect`,
  swipe grocery actions.
- User surprise: replacing an allergen instantly rebuilds the shopping list.
- Confidence in UIKit: controlled forms and rapidly changing lists remain stable.
- UIKit additions: `TKRecipeCard`, `TKGroceryList`, drag/sort for ingredients.

### 4. Личный кабинет кружков ребёнка

Parent portal for children's classes: schedule, attendance, payments, documents.

- UIKit shown beyond Trailhead: `TKCalendar`, `TKFileInput`, `TKPhoneInput`,
  `TKTimeline`, document states.
- User surprise: attendance, document upload, and payment status live in one
  compact Mini App.
- Confidence in UIKit: family-service workflows with documents and schedules feel
  practical.
- UIKit additions: `TKAttendanceGrid`, `TKDocumentCell`, attendance date-range
  pattern.

### 5. Консьерж-сервис дома

A home concierge for repairs, delivery windows, cleaning, dry cleaning, and
service statuses.

- UIKit shown beyond Trailhead: `TKTimeInput`, `TKSelect`, `TKStepper`,
  `TKActionSheet`, service order lifecycle.
- User surprise: delivery/service windows and live dispatcher statuses feel like a
  native service app inside Telegram.
- Confidence in UIKit: cancellations, reschedules, and SLA states are handled
  cleanly.
- UIKit additions: `TKServiceOrderCard`, `TKTimeWindowPicker`, SLA badge.

### 6. Смена бариста

Operational checklist for opening/closing a cafe shift, incidents, stock, and
photo proof.

- UIKit shown beyond Trailhead: `TKCheckbox`, `TKFileInput`, `TKCounter`,
  `TKProgress`, operational checklists.
- User surprise: closing a shift becomes a guided mission with proof and summary.
- Confidence in UIKit: repeated B2B floor workflows are possible in a small TMA.
- UIKit additions: `TKChecklist`, `TKUploadQueue`, `TKShiftSummary`.

### 7. Курьерский диспетчер

Courier route, parcel scanning, delivery statuses, address disputes, and proof
actions.

- UIKit shown beyond Trailhead: `TKVirtualList`, `TKSwipeCell`, `useQrScanner`,
  `useLocation`, route states.
- User surprise: scan a parcel, resolve an address dispute, and update delivery
  status without leaving Telegram.
- Confidence in UIKit: long lists and field device APIs remain fast and usable.
- UIKit additions: `TKRouteStopCard`, `TKScanResult`, geo chip/pattern.

### 8. Складская инвентаризация

Warehouse inventory counting, discrepancies, supervisor approval, and audit
trail.

- UIKit shown beyond Trailhead: `TKSearch`, `TKStepper`, `TKOTP`,
  `TKSkeletonTable`, `TKVirtualList`, scan/result states.
- User surprise: discrepancy requires supervisor OTP and becomes part of the audit
  log.
- Confidence in UIKit: data entry, long lists, and operational errors are handled
  seriously.
- UIKit additions: `TKDataTable`, `TKAuditLog`, barcode/QR inventory pattern.

### 9. Полевой мерчандайзер

Field visit workflow with store visits, photo reports, geostamp, deviations, and
review.

- UIKit shown beyond Trailhead: `TKFileInput`, `useLocation`, `TKRating`,
  `TKTimeline`, report review states.
- User surprise: a visit cannot be closed without shelf photo and geostamp.
- Confidence in UIKit: device proof and human review can coexist in one Mini App.
- UIKit additions: `TKPhotoChecklist`, `TKGeoStamp`, `TKVisitCard`.

### 10. Сервисная служба лифтов

Maintenance service desk for lift incidents, SLA, assigned technicians, and repair
timeline.

- UIKit shown beyond Trailhead: `TKBadge`, `TKTimeline`, `TKActionSheet`,
  `TKDialog`, priority incident states.
- User surprise: emergency ticket and scheduled inspection have clearly different
  visual and interaction priority.
- Confidence in UIKit: serious operational states are possible without toy-like
  UI.
- UIKit additions: `TKSlaTimer`, `TKIncidentCard`, priority color scale tokens.

### 11. Комиссионный кабинет художника

Commission queue, briefs, advance payment, revisions, and final file delivery.

- UIKit shown beyond Trailhead: `TKTextarea`, `TKFileInput`, `TKSteps`,
  `TKPaymentSummary`, revision flow.
- User surprise: the full creative pipeline is visible from brief to final file.
- Confidence in UIKit: file-heavy creative agreements can be modeled cleanly.
- UIKit additions: `TKMilestoneTracker`, `TKRevisionThread`, file preview.

### 12. Fan Club Pass

Gated fan content, membership levels, wallet-based access, and reactions.

- UIKit shown beyond Trailhead: `TKWalletStatusCell`, `TKBadge`, `TKSpoiler`,
  gated content.
- User surprise: content unlocks based on pass verification, not a generic login.
- Confidence in UIKit: wallet patterns support membership, not only discounts.
- UIKit additions: `TKAccessGate`, `TKMembershipCard`, NFT/pass verification
  pattern.

### 13. Drop Room Для Мерча

Limited merch drop with waitlist, countdown, stock reservation, and one-per-user
rules.

- UIKit shown beyond Trailhead: `TKCounter`, `TKProgress`, `TKProductCardA/B`,
  toast/queue states.
- User surprise: queue, reservation, and sold-out states feel live.
- Confidence in UIKit: high-pressure commerce can be represented honestly.
- UIKit additions: `TKCountdown`, `TKQueuePosition`, stock reservation pattern.

### 14. Биржа Telegram-Стикеров

Sticker commission marketplace with pack preview, approval, revisions, and
delivery.

- UIKit shown beyond Trailhead: `TKGallery`, `TKFileInput`, `TKSteps`,
  `TKMessages`, approval states.
- User surprise: sticker pack preview and approval happen inline with the order
  thread.
- Confidence in UIKit: media approval workflows are first-class.
- UIKit additions: `TKAssetPreview`, `TKApprovalBar`, sticker-pack template.

### 15. Creator Tip Jar

Creator support goals, tips, leaderboard, and shareable thank-you cards.

- UIKit shown beyond Trailhead: `TKBars`, `TKLeaderboard`, `TKConfetti`,
  `useShare`, goal progress.
- User surprise: donation immediately moves a public goal and creates a
  shareable thank-you card.
- Confidence in UIKit: payments can be social and lightweight, not only checkout.
- UIKit additions: `TKGoalMeter`, `TKShareCard`, donation receipt pattern.

### 16. Групповая Касса

Shared contribution pool for gifts/events, payer states, reminders, and
transparent history.

- UIKit shown beyond Trailhead: `TKPaymentSummary`, `TKAvatarStack`,
  `TKProgress`, split states.
- User surprise: everyone sees who paid, who owes, and what remains.
- Confidence in UIKit: complex money states can stay transparent.
- UIKit additions: `TKSplitBill`, `TKPayerRow`, `TKContributionProgress`.

### 17. Escrow Для Фриланса

Trusted deal workflow for freelancer milestones, locked funds, acceptance, and
disputes.

- UIKit shown beyond Trailhead: `TKSteps`, `TKDialog`, `TKSpoiler`,
  `TKPaymentSummary`, secure confirmation, dispute states.
- User surprise: funds are locked, milestones are accepted, and disputes open
  from a clear status sheet.
- Confidence in UIKit: high-trust money flows can feel safe.
- UIKit additions: `TKEscrowStatus`, `TKDisputeSheet`, `TKMilestonePayment`.

### 18. Крипто-Абонемент Клуба

Wallet-connected club membership with token/pass verification and access levels.

- UIKit shown beyond Trailhead: wallet cells, `TKBadge`, `TKListGroup`, gated
  settings.
- User surprise: connecting a wallet instantly changes club access and UI state.
- Confidence in UIKit: wallet can be an identity/access primitive.
- UIKit additions: `TKTokenGate`, `TKSubscriptionPass`, typed wallet capability
  helpers.

### 19. Раздел Счета В Кафе

Receipt splitting with item selection, per-person totals, and shared payment
requests.

- UIKit shown beyond Trailhead: `TKCheckbox`, `TKStepper`, `useShare`,
  `TKPaymentSummary`.
- User surprise: each person chooses items and receives a precise share.
- Confidence in UIKit: financial recalculation-heavy forms stay clear.
- UIKit additions: `TKReceiptItem`, `TKSplitSummary`, OCR/import placeholder.

### 20. Мини-Страховка Мероприятия

Light insurance flow with coverage selection, exclusions, and risk explanations.

- UIKit shown beyond Trailhead: `TKSpoiler`, `TKRadioGroup`, `TKCheckbox`,
  `TKDialog`.
- User surprise: exclusions are readable, not buried in a wall of text.
- Confidence in UIKit: regulated-ish explanations can be handled responsibly.
- UIKit additions: `TKDisclosureGroup`, `TKRiskBadge`, policy summary template.

### 21. Экзаменационный Спринт

Study sprint with mock tests, weak topic diagnostics, and weekly plan.

- UIKit shown beyond Trailhead: `TKBars`, `TKRing`, `TKRadioGroup`,
  `TKAccordion`, diagnostics.
- User surprise: mock-test results rebuild the weekly plan.
- Confidence in UIKit: progress-heavy education is possible beyond Trailhead's
  streak.
- UIKit additions: `TKQuizQuestion`, `TKSkillRadar`, spaced-repetition pattern.

### 22. Языковой Разговорный Клуб

Pairing users for language practice with topic prompts, session schedule, and
peer rating.

- UIKit shown beyond Trailhead: `TKMessages`, `TKRating`, `TKTimeInput`,
  `useChatRequest`.
- User surprise: Mini App pairs users, gives a topic, and opens a practice flow.
- Confidence in UIKit: bot/app handoff can become a real learning experience.
- UIKit additions: `TKPairingCard`, `TKVoicePrompt`, conversation timer.

### 23. Онбординг Сотрудников

Employee onboarding modules, policy acknowledgement, tests, and team progress.

- UIKit shown beyond Trailhead: `TKSteps`, `TKFileInput`, `TKCheckbox`,
  `TKProgress`.
- User surprise: HR onboarding works inside Telegram without a separate portal.
- Confidence in UIKit: enterprise workflows with docs and acknowledgements work.
- UIKit additions: `TKPolicyAck`, `TKChecklist`, `TKCertificateCard`.

### 24. Музыкальная Практика

Music homework with media submission, teacher feedback, and practice history.

- UIKit shown beyond Trailhead: `TKFileInput`, `TKMessages`, `TKRating`,
  `TKTimeline`.
- User surprise: homework media and teacher comments live in one feedback loop.
- Confidence in UIKit: media-heavy education flows are practical.
- UIKit additions: `TKMediaRecorder`, `TKAudioBubble`, rubric score card.

### 25. Курс По Безопасности

Branching safety training with scenarios, checklists, and certificate.

- UIKit shown beyond Trailhead: `TKOnboardingTooltip`, `TKDialog`, `TKSteps`,
  `TKEmptyState`.
- User surprise: choices have visible consequences in the scenario.
- Confidence in UIKit: compliance/training flows can be engaging and clear.
- UIKit additions: `TKScenarioCard`, branching quiz primitives.

### 26. Дневник Самочувствия

Private mood, sleep, trigger, and note journal.

- UIKit shown beyond Trailhead: `TKSlider`, `TKBars`, `TKTextarea`,
  `useSecureStorage`.
- User surprise: private graphs unlock only after PIN.
- Confidence in UIKit: sensitive calm UI is possible.
- UIKit additions: `TKMoodScale`, `TKJournalEntry`, privacy lock pattern.

### 27. Терапевтические Домашние Задания

Private therapy exercises with gentle progress and reflection prompts.

- UIKit shown beyond Trailhead: `TKAccordion`, `TKCheckbox`, `TKProgress`, secure
  storage.
- User surprise: exercises open gradually without aggressive gamification.
- Confidence in UIKit: the system can support careful, private UX.
- UIKit additions: `TKReflectionPrompt`, `TKPrivateModeBanner`.

### 28. Клиника Быстрых Анкет

Pre-visit questionnaires, document upload, queue status, and clinic intake.

- UIKit shown beyond Trailhead: `TKFormField`, `TKMaskedInput`, `TKPhoneInput`,
  `TKFileInput`.
- User surprise: form, docs, and queue status fit into a clean TMA flow.
- Confidence in UIKit: mobile WebView forms can feel reliable.
- UIKit additions: form validation helpers, `TKDocumentUpload`, `TKQueueStatus`.

### 29. План Восстановления После Травмы

Rehab plan with pain scale, exercise progress, and specialist feedback.

- UIKit shown beyond Trailhead: `TKRing`, `TKSlider`, `TKTimeline`,
  `TKMessages`.
- User surprise: pain/load input changes the recommended exercise.
- Confidence in UIKit: adaptive flows and careful warnings can be designed well.
- UIKit additions: `TKExerciseCard`, `TKPainScale`, safety warning pattern.

### 30. Аптечный Помощник Семьи

Medication schedule, stock, refills, and family reminders.

- UIKit shown beyond Trailhead: `TKTimeInput`, `TKCounter`, `TKSwipeCell`,
  `TKDialog`.
- User surprise: the app warns before medicine runs out and offers refill.
- Confidence in UIKit: repeated reminder flows can be clear and safe.
- UIKit additions: `TKMedicationSchedule`, `TKDoseStepper`, reminder preferences.

### 31. Клубное Голосование

Agenda, discussion, weighted votes, quorum, and protocol.

- UIKit shown beyond Trailhead: `TKRadioGroup`, `TKBars`, `TKSpoiler`,
  `useInitData`.
- User surprise: the result feels like an official protocol, not a casual poll.
- Confidence in UIKit: identity-aware governance flows are possible.
- UIKit additions: `TKPoll`, `TKVoteReceipt`, quorum/protocol components.

### 32. Соседский Обмен Вещами

Borrow/lend/return flow with reputation and disputes.

- UIKit shown beyond Trailhead: `TKProductCardA/B`, `TKAvatar`, `TKRating`,
  `TKSwipeCell`.
- User surprise: lending, returning, and reputation happen in one compact flow.
- Confidence in UIKit: peer-to-peer trust can be modeled.
- UIKit additions: `TKBorrowCard`, `TKReturnState`, reputation badge.

### 33. Волонтерский Штаб

Volunteer coordination with roles, shifts, urgent tasks, and broadcasts.

- UIKit shown beyond Trailhead: `TKListGroup`, `TKChipGroup`, `TKProgress`,
  `useShare`.
- User surprise: urgent tasks become shareable cards with role shortages.
- Confidence in UIKit: coordination UI can be fast and legible.
- UIKit additions: `TKShiftPicker`, `TKUrgencyBanner`, volunteer roster pattern.

### 34. Книжный Клуб

Reading schedule, quotes, spoiler-safe discussion, ratings.

- UIKit shown beyond Trailhead: `TKBlockquote`, `TKSpoiler`, `TKRating`,
  `TKMessages`.
- User surprise: quotes and spoiler-safe threads feel natural in Telegram.
- Confidence in UIKit: community content apps do not need to be generic feeds.
- UIKit additions: `TKQuoteCard`, `TKReadingProgress`, spoiler discussion pattern.

### 35. Родительский Комитет

Class payments, polls, documents, events, and consent history.

- UIKit shown beyond Trailhead: `TKPaymentSummary`, `TKFileInput`, poll patterns,
  status lists.
- User surprise: payments, polls, and documents stop being scattered across chat.
- Confidence in UIKit: mixed money/document/consent flows stay organized.
- UIKit additions: `TKPoll`, `TKConsentRow`, group collection template.

### 36. Support Cockpit Для Бота

Operator cockpit for bot support tickets, priority, macros, and internal notes.

- UIKit shown beyond Trailhead: `TKVirtualList`, `TKBadge`, `TKActionSheet`,
  `TKTextarea`, `TKSkeletonTable`, `TKSegmented`.
- User surprise: an operator handles real tickets inside Telegram instead of a
  separate CRM.
- Confidence in UIKit: dense B2B UI with real operational load is feasible.
- UIKit additions: `TKTicketCard`, `TKMacroPicker`, `TKDataTable`, internal note
  pattern.

### 37. Возвраты Интернет-Магазина

Return/refund flow with evidence upload, reason selection, review, and decision.

- UIKit shown beyond Trailhead: `TKFileInput`, `TKSteps`, `TKDialog`,
  `TKTimeline`.
- User surprise: the return process is clear and trustable rather than a support
  black box.
- Confidence in UIKit: commerce support is deeper than a product card.
- UIKit additions: `TKReturnReasonPicker`, `TKEvidenceUpload`, refund status.

### 38. Incident Room

Mobile command center for incidents, owners, timeline, and postmortem draft.

- UIKit shown beyond Trailhead: `TKTimeline`, `TKBadge`, `TKTextarea`,
  `useShare`.
- User surprise: status, owners, and postmortem live in a compact mobile command
  surface.
- Confidence in UIKit: high-stakes B2B updates are possible in TMA.
- UIKit additions: `TKIncidentHeader`, `TKOwnerStack`, postmortem template.

### 39. NPS Recovery Desk

Negative feedback recovery with sentiment, playbooks, follow-up, and outcome.

- UIKit shown beyond Trailhead: `TKRating`, `TKBars`, `TKMessages`,
  `TKActionSheet`.
- User surprise: a bad review turns into a guided recovery workflow.
- Confidence in UIKit: feedback loops can be closed, not merely collected.
- UIKit additions: `TKNpsCard`, `TKSentimentBadge`, recovery playbook component.

### 40. Appointment Triage

Triage incoming appointment requests, slots, manager assignments, no-show risk.

- UIKit shown beyond Trailhead: `TKCalendar`, `TKTimeInput`, `TKSelect`,
  `TKSwipeCell`.
- User surprise: managers move appointments between slots with compact controls.
- Confidence in UIKit: calendar/time workflows work beyond Trailhead's slot
  picker.
- UIKit additions: `TKScheduleBoard`, `TKAvailabilityGrid`, no-show badge.

### 41. Watch Party Companion

Synchronized watch party with live reactions, trivia, and spoiler safety.

- UIKit shown beyond Trailhead: `TKSpoiler`, `TKMessages`, `TKInlineButtons`,
  `TKProgress`.
- User surprise: live reactions and trivia follow the episode timeline.
- Confidence in UIKit: entertainment UX can be real-time-ish and polished.
- UIKit additions: `TKReactionBar`, `TKTriviaCard`, sync marker.

### 42. Подкаст-Клуб

Episode notes, voting for guest questions, bonus materials, and downloads.

- UIKit shown beyond Trailhead: `TKAccordion`, `TKBlockquote`, `TKFileInput`,
  `useDownloadFile`.
- User surprise: listeners collect notes and bonus material without leaving
  Telegram.
- Confidence in UIKit: media content workflows and download lifecycle are covered.
- UIKit additions: `TKEpisodeCard`, `TKDownloadCell`, timestamp note UI.

### 43. Telegram Newsletter Studio

Newsletter drafting, preview, segments, test send, and publishing checklist.

- UIKit shown beyond Trailhead: `TKTextarea`, `TKSteps`, `TKSegmented`,
  `useClipboard`, `useShare`.
- User surprise: authoring and preview happen where the audience already is.
- Confidence in UIKit: creator/admin tools can be built in TMA.
- UIKit additions: `TKPreviewFrame`, `TKMarkdownEditor`, publish checklist.

### 44. Фото-Челлендж

Photo challenge with upload, gallery, moderation, and rankings.

- UIKit shown beyond Trailhead: `TKFileInput`, `TKGallery`, `TKRating`,
  `TKLeaderboard`.
- User surprise: uploaded work immediately joins a moderated community gallery.
- Confidence in UIKit: visual UGC workflows can be handled.
- UIKit additions: `TKUploadGrid`, `TKModerationBadge`, image crop/preview
  pattern.

### 45. Мини-Энциклопедия События

Event guide with program, speakers, materials, search, and saved downloads.

- UIKit shown beyond Trailhead: `TKSearch`, `TKCategoryTabs`, `TKAccordion`,
  `useDownloadFile`.
- User surprise: a whole event guide fits as a fast offline-like reference.
- Confidence in UIKit: information architecture and search can be first-class.
- UIKit additions: `TKAgendaItem`, `TKSpeakerCard`, saved materials pattern.

### 46. QR-Пропускник Мероприятия

Access-control scanner for valid/used/fraud tickets and manual override.

- UIKit shown beyond Trailhead: `useQrScanner`, `TKBadge`, `TKDialog`,
  `TKTimeline`.
- User surprise: staff see valid/used/fraud state instantly.
- Confidence in UIKit: operator access-control flows can be fast and reliable.
- UIKit additions: `TKAccessResult`, `TKScanHistory`, fraud warning pattern.

### 47. Clipboard Cleaner

Utility that recognizes pasted addresses, wallets, tracking numbers, and offers
actions.

- UIKit shown beyond Trailhead: `useClipboard`, `TKActionSheet`, `TKCardCell`,
  `TKToast`.
- User surprise: pasted text becomes structured Telegram-native actions.
- Confidence in UIKit: bridge fallback and utility UX stay graceful.
- UIKit additions: `TKClipboardField`, parser result cards.

### 48. Contact Exchange Booth

Consent-first contact exchange with Telegram contact request and shareable card.

- UIKit shown beyond Trailhead: `useContactRequest`, `TKAvatar`, `TKDialog`,
  `TKToast`, `useShare`, permission denial states.
- User surprise: contacts are exchanged through a clean consent flow, not manual
  chat messages.
- Confidence in UIKit: permissions, refusals, and fallbacks are handled maturely.
- UIKit additions: `TKContactCard`, `TKConsentSheet`, QR/vCard primitives.

### 49. Motion Mini-Lab

Sensor lab for motion, orientation, fullscreen, and calibration.

- UIKit shown beyond Trailhead: `useMotionSensors`, `useOrientationLock`,
  `useFullscreen`, `TKBars`, capability states.
- User surprise: tilting the phone controls a live UI scene.
- Confidence in UIKit: rare Telegram/device APIs receive a concrete showcase.
- UIKit additions: `TKSensorMeter`, `TKCalibrationStep`, device capability panel.

### 50. Download Center

Tickets, PDFs, media packs, download queue, retry, and history.

- UIKit shown beyond Trailhead: `useDownloadFile`, `TKSkeletonTable`,
  `TKProgress`, `TKSwipeCell`.
- User surprise: download history and retries feel like a real native app.
- Confidence in UIKit: boring-but-critical file lifecycle is covered.
- UIKit additions: `TKDownloadCell`, `TKFilePreview`, retry/download queue.

### 51. Quiz League Для Канала

Daily quizzes, seasons, leaderboard, answer reveal, and settlement.

- UIKit shown beyond Trailhead: `TKRadioGroup`, `TKProgress`, `TKLeaderboard`,
  `TKConfetti`.
- User surprise: a channel quiz has seasons and clear answer reveal.
- Confidence in UIKit: gamification can be systemic, not just streaks.
- UIKit additions: `TKQuizQuestion`, `TKAnswerReveal`, season leaderboard
  variants.

### 52. Collectible Album

Collectible cards with packs, rarity, duplicates, trading, and wallet-gated
access.

- UIKit shown beyond Trailhead: `TKGallery`, `TKProgress`, `TKBadge`,
  wallet-gated packs.
- User surprise: cards open, duplicates become trades, rarity is visible.
- Confidence in UIKit: rich state visuals and collectible economy are possible.
- UIKit additions: `TKCollectibleCard`, `TKRarityBadge`, trade offer pattern.

### 53. City Bingo

Location-aware city challenge board without travel booking.

- UIKit shown beyond Trailhead: `TKCheckbox`, `TKGallery`, `useLocation`,
  `TKProgress`.
- User surprise: location confirms some bingo cells as proof-of-presence.
- Confidence in UIKit: location can support playful proof, not only check-in.
- UIKit additions: `TKBingoGrid`, `TKProofBadge`, geofence helper pattern.

### 54. Prediction Market Для Фанатов

Fan predictions with deadline, locked state, settlement, and leaderboard.

- UIKit shown beyond Trailhead: `TKSlider`, `TKRadioGroup`, `TKBars`,
  `TKTimeline`.
- User surprise: predictions lock, resolve, and display settlement clearly.
- Confidence in UIKit: open/locked/resolved/disputed states can be modeled.
- UIKit additions: `TKPredictionCard`, `TKSettlementTimeline`, odds/probability
  display.

### 55. Puzzle Inbox

Bot-delivered puzzles solved in Mini App with hints and persistent progress.

- UIKit shown beyond Trailhead: `TKOTP`, `TKSpoiler`, `TKProgress`, bot deep-link
  flows.
- User surprise: a bot message becomes an interactive puzzle surface.
- Confidence in UIKit: tight bot-to-app loops are possible without heavy product
  scope.
- UIKit additions: `TKPuzzleStep`, hint/reveal component, deep-link scenario
  helper.

### 56. Telegram Capability Inspector

Live inspector for Telegram WebApp capabilities, support states, mock/fallback,
and runtime events.

- UIKit shown beyond Trailhead: `useWebApp`, `useViewport`, `useActivity`,
  `useTelegramEvent`, `useTelegramPopup`, `useClipboard`, `useContactRequest`,
  `useWriteAccess`, `useDownloadFile`, `useMotionSensors`, fallback states.
- User surprise: developer sees exactly what Telegram supports on this device,
  what is mocked, and what falls back.
- Confidence in UIKit: direct proof that UIKit is a typed Telegram platform
  layer, not only components.
- UIKit additions: `TKCapabilityMatrix`, event log viewer, public
  `tg-mini-app-uikit/testing`.

### 57. Theme QA Bench

Live QA screen for dark/light, Telegram theme, safe areas, RTL, contrast, and
token stress cases.

- UIKit shown beyond Trailhead: `TKProvider`, `tkThemeVars`, `useTKTheme`,
  `TKFrame`, `TKSafeArea`.
- User surprise: one screen shows how arbitrary Telegram themes affect real UI.
- Confidence in UIKit: token/theming claims become inspectable.
- UIKit additions: `TKThemeInspector`, contrast checker, token sample grid.

### 58. Bot Launch Checklist

Production-readiness checklist for BotFather, menu button, manifest, env vars,
deploy, and smoke checks.

- UIKit shown beyond Trailhead: `TKSteps`, `TKCheckbox`, `TKFileInput`,
  `useWriteAccess`, `useShare`, `useClipboard`.
- User surprise: the path from package to production Mini App is visible inside
  the app itself.
- Confidence in UIKit: UIKit understands launch reality, not only runtime UI.
- UIKit additions: `TKLaunchChecklist`, `TKEnvVarCell`, manifest validator card.

### 59. Mini App Analytics Cockpit

Mobile analytics cockpit for events, funnels, retention, filters, and exports.

- UIKit shown beyond Trailhead: `TKBars`, `TKSkeletonTable`, `TKSegmented`,
  `TKDateInput`, `TKStatTile`, `TKSearch`.
- User surprise: funnel and retention analytics fit into a TMA dashboard.
- Confidence in UIKit: data-heavy admin and monitoring screens are possible.
- UIKit additions: `TKDataTable`, `TKMetricCard`, `TKFunnelChart`, date-range
  picker.

### 60. Mock Scenario Recorder

Scenario runner that records steps, validates GIF/screens, and proves flows are
reproducible.

- UIKit shown beyond Trailhead: `TKSteps`, `TKProgress`, `TKFrame`, `TKToast`,
  bridge mock state.
- User surprise: choose a scenario, run it, and receive a proof artifact.
- Confidence in UIKit: the kit is not only visually polished but testable.
- UIKit additions: public `tg-mini-app-uikit/testing`, `TKScenarioRunner`,
  `TKRecordingStatus`.

## Top 10 Shortlist

The 60 ideas were filtered down to the most interesting candidates. The top 10
were selected because they create the most new demo surface relative to
Trailhead:

1. Telegram Capability Inspector.
2. Mock Scenario Recorder.
3. Support Cockpit for a bot.
4. Mini App Analytics Cockpit.
5. Bot Launch Checklist.
6. Escrow for freelance deals.
7. Warehouse Inventory.
8. Homeowners/Residential HQ.
9. Motion Mini-Lab.
10. Contact Exchange Booth.

The rest were weaker for this purpose because they either repeated a Trailhead
shape, were mostly generic content/community/product flows, or were interesting
as products but weaker as a proof of TMA-native capability.

## Why These 10 Survived

### 1. Telegram Capability Inspector

It is the clearest way to show that UIKit is a typed Telegram platform layer, not
only a component library. It exposes support/mocked/fallback/unsupported states
and makes runtime behavior visible.

### 2. Mock Scenario Recorder

It turns UIKit into a self-proving product: demos, mock bridge, e2e behavior, and
recording can all be reproducible. This makes the kit feel serious to engineers.

### 3. Support Cockpit

It proves UIKit can handle dense B2B interfaces, not just consumer flows. It
shows lists, priorities, macros, notes, and operational pressure.

### 4. Mini App Analytics Cockpit

It proves that data-heavy dashboards can work on mobile Telegram surfaces:
funnels, retention, events, filters, skeleton tables, and exports.

### 5. Bot Launch Checklist

It sells the journey from npm package to production Mini App. This is less flashy
than sensors, but highly persuasive for developers.

### 6. Escrow For Freelance Deals

It shows trust and money beyond a normal checkout. Locked funds, milestones, and
disputes are stronger proof than another payment button.

### 7. Warehouse Inventory

It is deliberately unglamorous. If UIKit can handle dense inventory, OTP
approval, audit logs, and scanning, it feels robust.

### 8. Homeowners/Residential HQ

It is mass-market and understandable: requests, votes, passes, incidents, and
documents. It shows everyday service workflows.

### 9. Motion Mini-Lab

It can contribute to the physical wow only when motion is part of a broader
Reality Split stress moment. Tilting a device and watching UI respond is not
enough by itself.

### 10. Contact Exchange Booth

It is a small, sharp proof of permission-first UX: contact access, denial states,
share, fallback, and consent.

## Final Direction: TMA Native Lab

After the shortlist, the strongest direction was to combine Telegram Capability
Inspector and Motion Mini-Lab, then selectively borrow from Theme QA Bench, Mock
Scenario Recorder, Bot Launch Checklist, and Contact Exchange Booth.

The result should not be called a capability inspector. It should be packaged as:

> TMA Native Lab

Alternative names:

- TMA Native Lab.
- TMA Reactor.
- Native Proof Lab.
- Telegram Runtime Lab.
- Mini App Native Lab.

Recommended name: **TMA Native Lab**.

## 2026-06-16 Magic Pivot: Living Telegram Surface

The current hero direction must pivot. Revenue recovery, bot comparison, website
comparison, capability cards, and platform proof are not the first wow. They can
support the demo after the audience already feels that the product is alive.

The primary wow is a **Living Telegram Surface**: a Telegram message becomes a
premium Mini App surface, and every touch proves that the interface has weight,
attention, continuity, and hidden depth.

Working names:

- Living Telegram Surface.
- Telegram Matter.
- Message Becomes App.
- Native Telegram Matter.

Recommended experience name for the first scene: **Living Telegram Surface**.

### Who This Must Impress

This is not for random first-time visitors. The first audience is people who
have already seen many generic Telegram Mini Apps, crypto launch pages, TON
clients, airdrop screens, task apps, and template-heavy mobile dashboards.

Target viewers:

- Telegram and TON product founders who want their Mini App to feel premium.
- Channel, drop, fan club, community, and launchpad owners who sell status,
  access, scarcity, or identity inside Telegram.
- Product and design leads who have seen enough generic cards, gradients,
  dashboards, and form flows to ignore them immediately.
- Senior frontend engineers who will only care after the magic proves it can be
  decomposed into reusable UIKit primitives.

The pitch to this audience is not "this has MainButton, theme, and safe areas."
The pitch is "this Telegram surface feels alive, native, inspectable, and hard
to fake with a cheap template."

### The Signature Moment

The demo must run inside the Telegram Mini App itself. Do not move the primary
experience into real Telegram dialogs, external chat screens, or a video. The
first screen can show a Telegram-origin object, but it must be rendered as an
in-app scene inside the WebView.

Start with a **Launch Echo**: an in-app object that looks like the Telegram
message, channel post, deep-link card, or bot handoff that opened the Mini App.
The user taps, drags, presses, or nudges this launch object, and it physically
unfolds into the living Mini App surface.

The transition must preserve continuity:

- the launch object becomes the first app surface instead of being replaced by a
  page;
- avatar, chat identity, theme, `start_param`, and current action state flow
  into the app as simulated or real launch context;
- Telegram chrome and safe-area constraints frame the app surface without
  pretending that the user is still in an external chat screen;
- the surface breathes in a calm idle state before the user touches it again;
- the result can compress into an in-app result card that is ready to share back
  through Telegram.

This is the Apple-style principle to borrow: one impossible-looking interaction
first, explanation second. The user should feel "the launch object became the
app" before reading any labels.

### Living Interaction Rules

Every interactive object needs a response. Not every object needs noise, but no
important object should feel dead.

- Idle state: the main surface has subtle breathing, small light response, or
  depth shift. It should feel awake, not animated for decoration.
- Tap: controls compress, rebound, and settle with native-feeling timing.
- Hover or pointer proximity: objects lean, brighten, reveal affordance, or
  expose a thin interaction contour.
- Drag: objects show mass, inertia, constraints, and snap points.
- Long press: the object lifts into an inspectable layer instead of opening a
  generic modal.
- Empty-space tap: a context pulse travels from the in-app launch object to app
  state, showing that the surface understood the interaction.
- Back or dismiss: the surface folds back through the same object continuity,
  not a hard route cut.

Animation is valid only when it does one of these jobs:

- acknowledges user intent;
- preserves Telegram-to-app continuity;
- reveals hidden state;
- explains a platform constraint;
- rewards exploration without blocking the task.

### Accidental Delight Inventory

The demo needs small discoveries that make the product feel expensive. These
should be deterministic, accessible, and tied to UIKit state, not random
decorations.

- Rotate the central `Telegram Matter` object with pointer or touch, comparable
  in satisfaction to freely spinning a high-quality TON symbol.
- Tap the launch object edge to reveal safe-area contours and magnetic rails.
- Press the avatar to pull identity, chat, and access layers into view.
- Tap a status chip to unfurl a short event trail from the live scenario.
- Nudge the bottom action bar to show native button handoff and keyboard-safe
  rebound.
- Drag a layer near a forbidden zone and let safe-area magnetism repel it.
- Deny a permission and watch the surface recompose instead of showing a dead
  error state.
- Switch theme while the object is mid-interaction and let tokens remap without
  tearing the surface.
- Tap a hidden seam on the central object to reveal `Show UIKit Layers`.

These are not easter eggs for their own sake. They are proof that UIKit can make
Mini Apps feel tactile, responsive, and cared for at every contact point.

### Design Serves Function

The product must not build functionality only to justify visual effects. The
visual effects exist because the function is Telegram-native continuity.

Core functions that deserve motion:

- Launch continuity: Telegram-origin object becomes app object inside the TMA.
- Context transfer: user, chat, theme, permissions, and action state enter the
  app without feeling like a page reload.
- Constraint handling: safe area, keyboard, viewport, native chrome, and back
  behavior shape the surface in visible ways.
- Layer inspection: developers can reveal how the living surface is made from
  UIKit primitives after the first wow.
- Result return: the app can fold into an in-app result card ready for Telegram
  sharing.

Design rule: if an animation does not make one of these functions clearer, it
does not belong in the first experience.

### UIKit Reveal After The Magic

The first 10 seconds sell magic. The next layer sells UIKit.

After the user has touched the living surface, expose `Show UIKit Layers`:

- tokens and theme roles;
- native chrome ownership;
- safe-area and viewport constraints;
- permission state machines;
- sheets, buttons, chips, lists, and status surfaces;
- runtime events and mock bridge;
- reduced-motion equivalent;
- recorder-backed proof.

Developer flexibility is still important, but it is not the hook. It is the
reason the magic can be reused instead of being a one-off demo.

### Superseded First-Screen Ideas

These concepts can remain as supporting proof, but they are no longer first
screen wow:

- Revenue Recovery Split.
- Operations Closure Split.
- Service Recovery Split.
- Bot Wall as the first scene.
- Website Maze as the first scene.
- Capability Inspector as the first scene.
- MainButton, theme, safe area, haptics, sensors, or storage as the emotional
  peak.

Use them after the audience has already felt the living Telegram surface.

### Magic Acceptance Criteria

- Within 10 seconds, a viewer wants to poke the interface just to see what else
  responds.
- Every primary touch target has a visible, purposeful response.
- At least five accidental micro-interactions exist and are discoverable without
  instructions.
- The central object can be rotated, dragged, expanded, or inspected.
- The first wow is understandable without business metrics, API labels, or an
  event log.
- Reduced-motion mode keeps the same continuity and meaning without physics.
- The final implementation can prove each magic moment through scenario data,
  accessibility states, and recorder evidence.

## 2026-06-16 Refinement Checkpoints

This pass tightens the idea around five checkpoints. The goal is a demo that
feels remarkable because it creates a live, comparative platform moment under
the user's hands, not because it lists standard Telegram Mini App functions.

### Checkpoint 1: Wow Is Not The Baseline

MainButton, BackButton, safe area, Telegram theme, haptics, storage, and
permission wrappers are table stakes. They are important proof, but they are not
the wow effect. Many Telegram Mini Apps can show a MainButton, react to theme,
or present a permission flow. Treat those capabilities as credibility rails, not
as the emotional peak.

The demo's wow must come from a moment that feels hard to copy in a generic TMA
gallery:

- The user performs one physical or contextual stress action.
- Bot, website, and TMA versions react side by side to the same action.
- The bot version reaches a boundary without being mocked as bad.
- The website version shows friction, drift, or missing Telegram context.
- The TMA version absorbs the stress and recomposes itself live.
- The user can inspect exactly why the TMA version survived.

This creates a real "now I get it" moment. The wow is not "Telegram has native
buttons." The wow is seeing the same situation break in one surface, become
awkward in another, and become fluid in the TMA.

Pass criteria:

- No standard TMA capability is described as the wow by itself.
- Native chrome and theme handling are framed as proof infrastructure.
- The first major surprise is a comparative stress moment, not an API checklist.
- Browser/mock mode can still stage the stress honestly, but labels the source.

### Checkpoint 2: The Signature Wow Is A Reality Split

The strongest concept is a **Reality Split Chamber**. The first memorable scene
shows one task rendered in three synchronized surfaces:

- Bot Wall: command messages, inline actions, and a useful but discontinuous
  interaction model.
- Website Maze: a normal web surface that can build UI but has to reconstruct
  Telegram context manually.
- TMA Native Lab: a compact instrument that reads Telegram context, handles
  device stress, and keeps the interaction coherent.

The user sends one "stress pulse" into all three surfaces:

- Tilt the phone or move the desktop mock puck.
- Open the keyboard while a bottom action is present.
- Switch Telegram theme or simulate a live theme change.
- Deny a permission and continue.
- Trigger a viewport/fullscreen change.

The three surfaces respond at the same time. Bot Wall cannot become a continuous
surface. Website Maze can respond, but shows extra prompts, context gaps,
collision risk, or fallback work. TMA Native Lab reflows, logs, labels, and
continues without hiding the edge case.

The visual should feel like an x-ray of product reality, not a sci-fi effect.
The user should leave with one sentence: "I saw why this needs to be a Mini App."

Pass criteria:

- The first viewport contains the split reality surface, not a hero or API grid.
- The first 30 seconds include one stress pulse across bot, website, and TMA.
- The TMA pane wins through continuity and context, not through prettier styling.
- The event log proves what happened in the TMA pane after the user notices it.
- The bot and website panes are fair, useful, and factually limited.

### Checkpoint 3: Motion Has A Runtime Job

Motion should be mapped to platform events and user decisions, not to page
decoration. The demo needs a small motion grammar:

- `themeChanged`: tokens crossfade in 150-200 ms while labels and status chips
  explain which `--tk-*` roles changed.
- `viewportChanged` and fullscreen: the frame updates to real dimensions while
  guide rails use transform and opacity to show what moved.
- Safe-area/content inset changes: magnetic rails repel cards before they enter
  forbidden zones, making notch and home-indicator constraints visible.
- Motion sensors: pitch and roll add inertial translation and small rotation to
  cards; threshold crossing triggers one haptic impact and an event-log mark.
- Orientation lock: the chamber rotates its control axis and keeps the readable
  labels upright, proving that motion is calibrated rather than decorative.
- Reduced motion: physics is replaced by static meters, fades, and exact numeric
  deltas, so the proof remains clear.

The best animation is the one that makes continuity visible. The bot pane should
stop where command surfaces naturally stop. The website pane should show friction
without caricature. The TMA pane should preserve flow through measured,
inspectable motion. Avoid page-load choreography. Avoid layout-property
animation. Avoid movement that cannot be tied to a runtime state, a gesture
boundary, a permission decision, or a proof artifact.

### Checkpoint 4: UIKit Must Be Revealed As Layers

TMA Native Lab should expose UIKit as a working stack, not as a pile of widgets.
Each scene should reveal one layer:

- Tokens and theme: `TKProvider`, `tkThemeVars`, Telegram theme inheritance,
  light/dark/live Telegram modes, semantic state colors, density, radius, and
  reduced motion.
- Layout and chrome: `TKSafeArea`, `TKPage`, `TKBottomBar`, native
  MainButton/SecondaryButton/BackButton/SettingsButton behavior, viewport,
  keyboard, fullscreen, and content safe areas.
- Navigation and overlays: stack navigation, tabs, sheets, dialogs, action
  sheets, toasts, poppers, focus recovery, and BackButton overlay-first
  behavior.
- Data and feedback: `TKVirtualList`, skeletons, progress, bars, timeline,
  empty/error/loading states, and event logs.
- Forms and permissions: inputs, OTP/PIN, switches, radio groups, sliders,
  contact/write access, clipboard, download/share, storage, QR, location, and
  biometrics.
- Runtime and testing: mock bridge, capability detection, event simulation,
  scenario runner, recording status, and browser fallback honesty.

The demo should make the package boundary visible. Reusable UIKit primitives
should stay generic; app-specific scenes such as Bot Wall, Website Maze, Native
Handshake, Motion Chamber, and Native Proof Card can compose those primitives
without becoming public APIs by default.

### Checkpoint 5: Harvest UIKit Improvements

The demo should produce a high-signal backlog for UIKit, grouped by reuse
confidence:

Must evaluate as reusable package surface:

- `TKCapabilityMatrix`: support, mocked, fallback, unsupported, loading, error.
- `TKCapabilityCard`: capability title, live status, event count, last event,
  fallback copy, and accessibility description.
- `TKPermissionGate`: a reusable permission state machine surface for default,
  requesting, granted, denied, unsupported, mock, and error states.
- `TKRuntimeEventLog`: compact chronological event feed with filters for chrome,
  viewport, theme, permissions, storage, sensors, and mock events.
- `TKSafeAreaVisualizer`: debug/education overlay for device insets, content
  insets, keyboard, and bottom chrome.
- `TKSensorMeter` and `TKCalibrationStep`: motion values, confidence,
  calibration, unavailable state, and reduced-motion fallback.

Likely reusable if multiple demos/stories need them:

- `TKViewportFrame`: Telegram-like device frame for docs, stories, and proof
  capture.
- `TKMockModeBadge`: visible runtime honesty marker for browser and injected mock
  states.
- `TKChromeBoundary`: layout helper that reserves native button, tabbar, and home
  indicator zones without duplicating native controls.
- `TKProofCard`: share/download-ready summary of actual capabilities used,
  mocked, denied, or unsupported.
- `TKScenarioRunner` and `TKRecordingStatus`: deterministic scenario execution
  for docs, GIF capture, and e2e evidence.

Keep app-only unless a generic contract emerges:

- Bot Wall.
- Website Maze.
- Native Handshake choreography.
- Motion Chamber composition.
- Native Proof Card copy and visual narrative.

If the runtime package split remains, the plan should also decide which proof
surfaces belong to `tg-mini-app-uikit`, which belong to
`@tg-mini-app/telegram`, and which belong only to demo/testing imports.

### Subagent Checkpoint Protocol

The implementation plan should not let one agent judge all dimensions of this
demo. Use subagents as checkpoint owners, not only as generic helpers:

- Idea/product subagent: owns the thesis that every scene still answers why TMA
  is stronger than a bot message or a plain website for this specific native
  interaction.
- Wow and motion subagent: owns the first-30-second Reality Split stress pulse,
  sensor motion, haptic thresholds, reduced-motion alternative, and the rule that
  every animation must explain a runtime state.
- UIKit surface subagent: maps every scene to existing UIKit exports, proposed
  reusable additions, and app-only composition; rejects public exports that are
  only useful for this demo story.
- Telegram runtime/testing subagent: owns capability detection, mock/native
  labeling, `@tg-mini-app/telegram` or `tg-mini-app-uikit/testing` boundaries,
  event simulation, scenario runner, and recorder proof.
- Accessibility and platform subagent: owns keyboard flow, focus recovery,
  screen-reader labels, reduced motion, RTL/locale stress, safe areas, keyboard,
  BackButton overlay priority, and gesture conflict checks.
- Visual QA subagent: owns light/dark/live Telegram themes, 320 px layout,
  no-overlap checks, product-register restraint, and rejection of decorative
  effects that do not prove platform behavior.

Blocking gates for these subagents:

- Reviewer-gated matrix: the implementation plan should list Idea/Product,
  Motion, UIKit Surface, Runtime/Testing/Recorder, Accessibility/Telegram
  Platform, and Visual QA checkpoints with `approved`, `blocked`, or
  `needs split` verdicts. The implementation author cannot close their own
  reviewer gates.
- First-30-second Reality Split Proof: the motion subagent returns a
  frame-by-frame sequence for one stress pulse across Bot Wall, Website Maze, and
  TMA Native Lab. Pass only if the TMA pane wins through continuity and context,
  not through prettier styling or a standard native button.
- Motion Cause Map: every animation in Native Handshake and Motion Chamber names
  its trigger, runtime event, duration, animated properties, haptic rule, and
  reduced-motion replacement. Motion not tied to the Reality Split stress pulse,
  `themeChanged`, `viewportChanged`, safe area, sensor threshold, permission
  state, gesture boundary, or proof artifact is rejected.
- Baseline Capability Filter: MainButton, BackButton, safe area, theme mapping,
  and ordinary permission flows cannot be used as wow claims by themselves. They
  only count when they help the Reality Split reveal a meaningful platform
  boundary.
- Sensor Wow Parity: the same Motion Chamber scene must work in real sensor
  mode, desktop/mock puck mode, and sensor-unavailable mode. Each mode shows
  calibration confidence, threshold crossing, event log, and honest
  native/mock/unavailable labeling.
- Event Log Source Of Truth: Native Proof Card is derived from the event log, not
  from hard-coded success copy. Each log row should include timestamp,
  capability, source (`native`, `mock`, `fallback`, or `unavailable`), event
  name, payload summary, and correlation with a visible reaction.
- Recorder Evidence Gate: recorder mode captures at least Reality Split,
  motion mock, permission denial, and final proof card. Acceptance includes
  deterministic steps, width, duration, no blank frames, and motion/static
  threshold checks.
- Safe-Area And Viewport Live Boundaries: `viewportChanged`, fullscreen, content
  safe area, keyboard collision, home indicator, and swipe-to-minimize
  protection are visible, logged, and prevent tappable cards from entering
  forbidden zones.
- Public Surface Diff: before planning public additions, the UIKit surface
  subagent writes the current public barrels and package exports, then classifies
  each candidate as existing export, internal helper, `tg-mini-app-uikit` public,
  `@tg-mini-app/telegram` public, `@tg-mini-app/telegram/testing`, or app-only.
- Layer Reveal Map: every scene gets a mapping of `scene -> UIKit layer ->
  existing exports -> missing generic surface -> app-only composition`. This
  prevents the demo from becoming one large custom widget that hides the kit.
- Runtime Package Boundary: capability detection, mock bridge, sensors, storage
  trust, event simulation, and testing helpers default to `@tg-mini-app/telegram`
  or `@tg-mini-app/telegram/testing` when that package boundary exists. UIKit
  owns visual primitives and composition helpers, not raw runtime behavior.
- Reusable Contract Gate: every candidate public `TK*` surface needs generic
  props, typed states, accessibility naming, SSR/browser fallback behavior,
  Telegram absence behavior, Storybook/docs/tests, and a package-surface
  decision. If the contract contains Native Lab copy, fixed choreography, proof
  narrative, fixed capability groups, or recorder script details, it stays
  app-only.
- Demo Choreography Quarantine: Bot Wall, Website Maze, Reality Split Chamber,
  Reality Split Core, Native Handshake, Motion Chamber, and Native Proof Card
  remain demo compositions until an independent generic use case exists outside
  this demo.
- Native Chrome Ownership: MainButton, SecondaryButton, BackButton, and
  SettingsButton are driven through existing runtime wrappers/hooks, not ad hoc
  `window.Telegram` access. Native mode does not duplicate the primary CTA as an
  in-DOM button.
- Fallback And Trust: browser secure-storage fallback is never described as
  secure storage, denied/unsupported permissions remain visible, and
  `initDataUnsafe` is not treated as trusted proof.
- Export Evidence: any new public export requires API snapshot/export check,
  unit or contract tests, SSR import/render test, Storybook coverage, docs, and
  runtime/mock tests where applicable. A new `tg-mini-app-uikit/testing` path is
  blocked unless the plan explains why `@tg-mini-app/telegram/testing` is
  insufficient.

Each checkpoint should return concrete findings: what is strong, what is risky,
what should stay app-only, and what must become a reusable UIKit primitive. The
main implementation agent integrates the findings and does not mark the demo
done until the subagent notes are reconciled with the plan and verification
evidence. Checkpoint disagreements should be recorded as named decision records:
public API disputes require UIKit Surface plus Runtime/Testing agreement; motion
versus accessibility conflicts resolve toward readable, focus-safe,
reduced-motion behavior; product versus implementation conflicts resolve against
the UX acceptance criteria, not against convenience.

## 2026-06-16 Expert, User, And Business Agent Validation

Two validation rounds were run after the initial refinement.

Round 1 used experienced Telegram Mini App reviewers:

- Senior Telegram Mini Apps platform engineer.
- Telegram creator/growth product lead.
- Principal product designer for mobile developer tools and design systems.
- Senior QA/automation engineer for Telegram Mini Apps.
- Senior Telegram bot ecosystem architect.

Round 2 used market-side agents, because money and adoption come from users and
businesses, not from UIKit maintainers:

- User agent: active Telegram community participant for drops, fan clubs, events,
  mini games, and social sharing.
- User agent: everyday Telegram power user for deliveries, support, documents,
  payments, schools, home services, and appointments.
- User/admin agent: Telegram group admin and community moderator.
- Business agent: small service owner/operator using Telegram for bookings,
  delivery, support, repeat sales, and follow-up.
- Business agent: creator/channel monetization lead for paid clubs, drops, fan
  content, events, subscriptions, merch, and member access.
- Business agent: B2B operations buyer for support desks, field operations,
  education/admin portals, residential services, courier, and warehouse flows.

### Shared Validation Verdict

All agents agreed on the same core point: Reality Split has high potential, but
the current shape can still become a developer-facing runtime inspector. Users
and businesses will not pay, share, or adopt because the demo proves MainButton,
theme, safe area, haptics, sensors, or capability cards. They care when the Mini
App protects a valuable outcome inside Telegram.

The demo must therefore move from:

- capability stress;
- visual motion;
- API proof;
- generic bot versus website comparison;
- engineering-native proof card;

to:

- user outcome under stress;
- business outcome under stress;
- chat-to-app-to-chat continuity;
- visible saved money, saved time, saved access, or saved decision;
- proof that is readable before the event log is opened.

### What Experienced Telegram Reviewers Need For Wow

Experienced TMA reviewers are not impressed by standard WebApp features. They
need:

- one canonical first-30-second storyboard, not five possible stress pulses;
- a real runtime stress test, especially keyboard, viewport, bottom chrome, safe
  areas, permission denial, and reload/restore;
- a bot-to-app-to-chat round trip, not only a WebView comparison;
- event log as source of truth, with timestamp, source, event name, payload
  summary, and visible reaction;
- Proof Recorder as a blocking acceptance gate, not an optional README tool;
- honest Telegram launch and trust boundaries: `start_param`, `chat_type`,
  `chat_instance`, `query_id`, write access, server-validated `initData`, and
  display-only `initDataUnsafe`;
- no fake website strawman: a plain website outside the Telegram bridge loses
  Telegram context, while a website using Telegram WebApp is already a TMA
  surface.

The engineering wow is not "we support many APIs." It is "this high-friction
Telegram lifecycle survives, and the proof is inspectable."

### What User Agents Need For Wow

User agents were clear: the first screen needs a human stakes scenario. They
will not care about a capability lab until after they feel the value.

Strong user anchors:

- Fan Pass Drop: claim a scarce pass from a channel post before stock runs out.
- Everyday Service Recovery: submit a delivery, home service, school, document,
  support, or payment task without losing flow.
- Community Decision: turn messy chat discussion into a decision, access update,
  support handoff, or shareable protocol.

User wow means:

- "I got the pass."
- "My queue position survived."
- "My request was sent."
- "My photo/document stayed attached."
- "My contact was not shared after I refused."
- "The status survived reload."
- "I can send the result back to the chat."

The event log is not the user proof. The user proof is a short result card:
pass claimed, request sent, contact protected, status saved, decision published,
or follow-up ready.

### What Business Agents Need For Wow

Business agents were stricter than users. They need a reason to pay.

Small service buyer verdict:

- Current idea is technical wow, not enough business wow.
- They would pay for a loop where a customer comes from chat, opens TMA at the
  right step, books, pays, uploads evidence, gets support, receives bot follow-up,
  and the owner sees money or saved operator time.

Creator monetization buyer verdict:

- Current idea shows why TMA is better than a bot or site, but not why it makes
  money.
- The demo needs lost revenue versus recovered revenue: channel post, gated drop,
  paid pass, reservation, payment or claim, abandoned-flow recovery, shareable
  revenue proof.

B2B operations buyer verdict:

- Current idea shows platform capability, but not operational closure.
- The demo needs a dirty task: support ticket, warehouse mismatch, residential
  incident, courier dispute, field proof, supervisor approval, SLA status, and
  exportable audit summary.

Business wow means:

- "This recovered the sale."
- "This saved the SLA."
- "This reduced manual replies."
- "This prevented a lost ticket."
- "This closed the support case."
- "This published a decision back to chat."
- "This gave me an audit trail."

### Market-Validated Scenario Options

Do not implement all of these at once. Choose one primary scenario before
planning. The current market validation says a generic Native Lab is too broad.

Recommended public-wow scenario:

- **Revenue Recovery Split**.
- Channel post launches a limited fan pass or drop.
- Stress pulse: stock countdown, keyboard or promo input, permission denial,
  theme/viewport change, payment or reservation step, reload/restore.
- Bot Wall can route and notify, but cannot keep a live claim surface.
- Website Maze can sell, but leaks Telegram context, requires more login/share
  work, and risks keyboard/CTA friction.
- TMA pane keeps member context, reservation, payment or claim state, fallback,
  and share proof in one flow.
- Final user proof: `Pass #128/500 claimed`, reaction time, queue survived,
  refusal respected, share to chat.
- Final business proof: recovered revenue, abandoned flow avoided, share clicks,
  upgraded members, follow-up permission.

Recommended B2B-buyer scenario:

- **Operations Closure Split**.
- Telegram ticket or field task launches a TMA.
- Stress pulse: long task list, one urgent item, QR or barcode scan mismatch,
  photo proof, geo mismatch, permission denial, supervisor approval, reload.
- Bot Wall can notify and collect commands, but the audit trail is fragmented.
- Website Maze can collect the form, but adds login/context switching and manual
  follow-up.
- TMA pane keeps task, proof, approval, fallback, SLA, and chat return in one
  flow.
- Final buyer proof: operation closed, SLA saved, proof attached, supervisor
  decision, client notified, manual steps avoided.

Recommended everyday-user scenario:

- **Service Recovery Split**.
- A user opens a delivery, residential, school, document, support, or payment
  issue from a Telegram chat.
- Stress pulse: keyboard, photo/document upload, contact denial, Back behavior,
  theme shift, reload.
- TMA pane keeps the request coherent and returns a clear status card.
- Final user proof: request id, photo attached, contact not shared, status saved,
  operator or parent can receive the card.

### Revised First-30-Second Rule

The first 30 seconds must not start with the lab. They must start with an outcome
that users or businesses recognize.

Required beats:

- 0-3 seconds: show a Telegram entry point with stakes, such as channel drop,
  support ticket, group decision, or service request.
- 3-7 seconds: open the split surface with Bot Wall, Website Maze, and TMA pane.
- 7-15 seconds: trigger one dirty stress pulse that threatens the outcome.
- 15-22 seconds: show the bot and website limits without making them look stupid.
- 22-27 seconds: show the TMA preserve the outcome through continuity, context,
  fallback, and recoverable state.
- 27-30 seconds: show a human-readable outcome card before opening any event log.

The event log, capability matrix, proof recorder, and native handshake are the
forensic layer after the market wow. They explain why the outcome survived. They
are not the product promise.

### Market Validation Gates

The next implementation plan must include these gates:

- User wow gate: a non-technical user can describe the outcome without saying
  "API", "safe area", "MainButton", "theme", or "runtime".
- Business wow gate: a buyer can point to revenue recovered, time saved, errors
  reduced, support closed, access granted, or decision published.
- Share proof gate: the final card is something a user or business would send to
  a chat, channel, operator, customer, parent, or admin.
- Bot respect gate: Bot Wall remains useful as router, notifier, command surface,
  and follow-up layer.
- Website honesty gate: Website Maze shows real Telegram-context friction, not a
  broken or unfair website.
- Recorder gate: every market proof is derived from deterministic scenario data
  and event log, not hand-written success copy.
- Scope gate: if a feature only impresses developers, it belongs after the market
  wow or in docs, not in the first screen.

## Product Thesis

TMA Native Lab is an interactive demo that answers:

> Why are Telegram Mini Apps useful compared with bots and normal websites?

The answer:

- A bot can trigger actions, but cannot be a continuous, sensor-aware,
  layout-aware, permission-aware interface.
- A website can build UI, but has more friction around identity, theme, Telegram
  chrome, bot handoff, permissions, native buttons, and runtime context.
- A TMA can combine Telegram runtime, device APIs, bot flows, native controls,
  safe areas, haptics, storage, and polished app UI into a single experience.

The demo should make this difference physical and emotional. The user should not
just read about it; they should tilt, tap, feel haptics, see native button
choreography, watch safe areas react, and inspect capability states.

## Experience Structure

### Scene 1: Bot Wall

Purpose: show what bots are good at, and where they stop.

The user sees a Telegram-like bot surface: message, inline buttons, quick reply,
and command-style choices. It is useful but flat.

Interactions:

- User tries to rotate or manipulate a capability card.
- User tries to inspect sensors or safe areas.
- Bot Wall explains that a bot can trigger actions but cannot become a continuous
  interactive surface.

Design requirement:

- This scene should not mock bots unfairly. Bots are framed as excellent command
  surfaces, but limited for continuous native interaction.

### Scene 2: Website Maze

Purpose: show why a normal website has more friction in Telegram context.

The user sees a web-like flow with obstacles:

- Login prompt.
- Theme mismatch.
- Browser-style permission prompt.
- Back behavior ambiguity.
- CTA colliding with keyboard/safe area.
- Separate share/contact/download flows.

The point is not that websites are bad. The point is that websites can build UI
but must rebuild Telegram context manually.

Visual metaphor:

- Friction appears as physical blockers around the interface.
- Switching to TMA mode removes blockers through native runtime handshake.

### Scene 3: Reality Split Chamber

Purpose: create the actual wow moment.

This scene is not a component showcase. It is a synchronized stress test. The
user sees Bot Wall, Website Maze, and TMA Native Lab respond to the same action
at the same time.

Stress pulses:

- Tilt or drag a device puck.
- Open the keyboard near a bottom action.
- Deny contact or clipboard permission.
- Switch theme while content is mid-interaction.
- Simulate viewport/fullscreen change.

Expected reaction:

- Bot Wall remains useful for commands but cannot become a continuous responsive
  surface.
- Website Maze can react but accumulates extra prompts, layout risk, or context
  reconstruction work.
- TMA Native Lab preserves the user's flow, shows what changed, and keeps the
  interaction inspectable.

Design requirement:

- This is the emotional peak of the demo.
- Do not sell this as a pile of APIs.
- Do not make the TMA pane win by looking more decorated.
- Make the win come from continuity, context, and graceful survival under stress.
- The user should understand the point before opening the event log.

### Scene 4: Native Handshake

Purpose: prove how the TMA pane survived the Reality Split stress.

The screen syncs with Telegram:

- Live theme maps into `--tk-*` tokens.
- Safe-area and content insets become visible as a magnetic field.
- Viewport expand/fullscreen changes layout.
- Native MainButton and BackButton become part of the flow.
- Event log shows runtime events.
- Haptics confirm meaningful state changes.

This is not the wow by itself. It is the credibility layer after the wow: the
demo shows which platform contracts made the TMA pane coherent.

Design requirement:

- Do not duplicate a native MainButton with an in-DOM primary button.
- Back closes the top layer first: sheet/dialog/action sheet before nav.
- Bottom controls clear the home indicator.
- Top content clears Telegram chrome and notch.

### Scene 5: Motion Chamber

Purpose: make device APIs physical and memorable.

The central object becomes a live capability stage. The user tilts the phone and
the UI responds:

- Tilt left/right shifts capability cards.
- Downward tilt reveals swipe-to-minimize protection.
- Rotation demonstrates orientation/fullscreen capability.
- Threshold crossing triggers haptic impact.
- Calibration panel shows sensor confidence.
- Desktop/mock mode uses a draggable device puck to simulate motion.

Important: this is not a decorative physics toy. Every movement explains a TMA
runtime concern.

Design requirement:

- Motion must respect reduced-motion.
- Sensor unavailable state must be first-class.
- Desktop/mock fallback must be honest and visibly labeled.

### Scene 6: Permission And Trust Lab

Purpose: prove that TMA handles permissions and trust gracefully.

Permission cards:

- Clipboard: paste and recognize a token/address/tracking number.
- Contact request: consent-first contact exchange.
- Write access: allow bot follow-up after user action.
- Download/share: create and export a proof card.
- Secure/cloud storage: save lab progress and restore after reload.

The key message: permission denial is not a broken state; it is a supported
state.

Design requirement:

- Each permission card has default, granted, denied, unsupported, mock, loading,
  and error states.
- User refusal should produce a calm alternative path, not a dead end.

### Scene 7: Proof Recorder

Purpose: turn the demo into an artifact for README, docs, and engineering trust.

At the end, the user receives a Native Proof Card:

- Live theme used.
- Safe area handled.
- Native MainButton/BackButton used.
- Haptics triggered.
- Motion sensors calibrated or mocked.
- Permissions requested and handled.
- Storage restored.
- Share/download completed or gracefully unavailable.

Optional recording mode:

- Run scenario.
- Capture step log.
- Generate GIF or screenshot proof.
- Validate no blank frames and expected motion/static thresholds.

## The Central Visual Object: Reality Split Core

The first screen should already be the experience. Do not put a marketing hero in
front of it.

Core idea:

- A split surface where Bot Wall, Website Maze, and TMA Native Lab receive the
  same stress pulse.
- A functional set of capability cards, arranged as the control surface for the
  TMA pane.
- Cards are not decorative; each represents why the TMA pane survived the stress.
- Cards can be tilted, dragged, opened, expanded, and inspected.
- When the device moves, the cards respond with spring motion.
- Safe-area zones behave like magnetic boundaries.
- The event log and proof card explain the TMA result after the user has already
  felt the split.

Possible card groups:

- Chrome: MainButton, SecondaryButton, BackButton, SettingsButton.
- Runtime: theme, viewport, safe area, fullscreen, activity.
- Device: motion, orientation, haptics, location, QR, biometrics.
- Permissions: contact, write access, clipboard, download/share.
- State: cloud storage, device storage, secure storage, init data.
- Proof: mock mode, event log, scenario runner.

## Design And Motion Language

The visual tone should be a precise native instrument, not sci-fi decoration and
not a landing page.

Motion principles:

- iOS-like springy motion.
- Directional navigation: push from right, back from left.
- Magnetic safe-area behavior.
- Haptics only on real state changes.
- Cards rotate or translate only when motion explains a real capability.
- Reduced motion replaces physics with fades, scale, and static indicators.
- Animation durations stay mostly in the 150-250 ms product range; the first
  Reality Split pulse can earn one slightly longer 300-360 ms beat if it remains
  inspectable.
- Motion uses transform, opacity, clip, and variable interpolation. Real layout
  snaps to the measured Telegram values instead of animating fake layout states.
- Gesture thresholds are visible before they are crossed: cards approach safe
  rails, permission cards show pending state, and sensor confidence changes
  before haptics fire.

Interaction patterns:

- Native MainButton is the primary scene action when native chrome exists, but it
  is a baseline control, not a wow device.
- SecondaryButton appears only when there is a genuine alternate action.
- BackButton rewinds the current scene or closes the top overlay first.
- Sheets and dialogs own the vertical gesture while open.
- Horizontal interactive content reserves the edge-swipe-back zone.
- Event log remains one tap away, because the demo is a proof tool as much as a
  polished experience.

## Why This Shows What Bots Cannot

Bots can:

- Send messages.
- Show inline buttons.
- Trigger command-style interactions.
- Link into Mini Apps.

Bots cannot provide the same continuous experience:

- No continuous motion sensor UI.
- No live safe-area layout.
- No app-like layered navigation.
- No custom dense interface.
- No in-app permission lab.
- No physical object manipulation.
- No native-feeling controls beyond bot UI primitives.

The demo should respect bots while making their boundary obvious.

## Why This Shows Websites Are More Work

Websites can build UI, but in Telegram they must solve extra friction:

- Matching Telegram theme.
- Understanding Telegram chrome and content safe areas.
- Handling Telegram Back/MainButton expectations.
- Bridging bot identity and follow-up flows.
- Handling Telegram-specific permissions.
- Creating testable Telegram runtime mocks.
- Avoiding keyboard/safe-area collisions.

TMA Native Lab should not claim "websites cannot do this"; it should show
"websites can approximate parts, but TMA gives a tighter native Telegram
contract."

## What This Proves About UIKit

This demo proves that UIKit is not just a set of components:

- It is a TMA-native design system.
- It can adapt to arbitrary Telegram themes.
- It understands safe areas, viewport, keyboard, native chrome, and gestures.
- It gives developers a typed Telegram runtime layer.
- It can use mock and fallback states honestly.
- It supports immersive motion without losing accessibility.
- It can produce a demo that is both impressive and testable.

## Required UIKit Additions

Reusable kit/system additions to evaluate first:

- `TKCapabilityMatrix`: support/mocked/fallback/unsupported matrix.
- `TKCapabilityCard`: capability card with live status, event count, and fallback
  copy.
- `TKRuntimeEventLog`: compact event feed for Telegram runtime events, simulated
  events, and native callback proof.
- `TKSensorStage`: motion/orientation/fullscreen visual stage that can run from
  real sensor data or a browser mock puck.
- `TKSensorMeter`: pitch/roll/acceleration/confidence display with unavailable
  and reduced-motion states.
- `TKCalibrationStep`: guided sensor calibration.
- `TKPermissionGate`: reusable permission state machine surface.
- `TKSafeAreaVisualizer`: educational/debug safe-area overlay for device,
  content, keyboard, and chrome insets.
- `TKThemeInspector`: live Telegram theme and contrast preview.
- `TKScenarioRunner`: step-by-step demo runner.
- `TKRecordingStatus`: scenario recording progress/status surface.
- `TKMockModeBadge`: visible browser/mock/native runtime honesty marker.
- `TKProofCard`: share/download-ready capability summary.
- Public testing entrypoint: documented mock bridge/testing import, either from
  `tg-mini-app-uikit/testing` or the runtime package if the split lands.

Possible app-only composition:

- Bot Wall scene.
- Website Maze scene.
- Reality Split Chamber scene.
- Reality Split Core composition.
- Native Handshake scene.
- Motion Chamber scene.
- Permission and Trust Lab scene.
- Native Proof Card.

## UX Acceptance Criteria

- The first viewport is interactive. No static landing page before the demo.
- The first 30 seconds include one Reality Split stress pulse across bot,
  website, and TMA surfaces.
- MainButton, safe area, theme mapping, and basic permission handling are not
  treated as wow claims by themselves.
- The wow moment is understandable before the user reads the event log.
- The user can understand the difference between bot, website, and TMA through
  direct interaction, not only explanatory text.
- MainButton is used for primary scene progression and is not duplicated by an
  in-DOM primary button.
- Back closes overlays before navigating scenes.
- Bottom controls clear the home indicator.
- Top content clears Telegram chrome/notch.
- Keyboard-open states are defined for any form or text entry.
- Vertical gestures in sheets/scroll surfaces do not accidentally minimize the
  Mini App.
- Horizontal gestures reserve edge-swipe-back space.
- Haptics fire only on real state changes:
  - selection on picker/segment changes;
  - impact on threshold crossing or scene activation;
  - notification on success/error proof states.
- Light, dark, and arbitrary live Telegram themes are supported through semantic
  `--tk-*` tokens.
- Reduced-motion mode remains clear and polished.
- Mock/browser mode is honest and visible.
- Motion maps to runtime events or interaction thresholds, and does not animate
  layout properties.
- Sensor unavailable, permission denied, and mock fallback states are visually
  designed, keyboard reachable, and represented in the final proof card.
- Permission denied/unsupported states are first-class.
- Reload restores meaningful lab progress.
- The final proof card summarizes actual capabilities used or mocked.
- Recorder mode can produce a deterministic proof path for at least Reality
  Split, native handshake proof, motion mock, permission denial, and final
  proof-card states.

## Anti-Goals

- Do not make another Trailhead-like consumer booking app.
- Do not make a static API table with green checkmarks.
- Do not make a decorative motion toy disconnected from Telegram runtime.
- Do not build a marketing landing page before the product surface.
- Do not shame bots or websites; show their boundaries factually.
- Do not hide unsupported APIs; unsupported and mock states are part of the
  trust story.

## Recommended Next Step

Turn this brainstorm into an implementation plan for a new demo workspace, likely
under `examples/tma-native-lab` or `examples/native-lab`.

The plan should first decide whether reusable pieces belong in UIKit proper, in
the Telegram runtime package, or in app-only demo composition. Reusable elements
such as capability cards, permission gates, safe-area visualizer, sensor meters,
event logs, proof cards, scenario runner, and public testing exports should be
evaluated through the repo's UIKit element development process before being added
to the public package surface.
