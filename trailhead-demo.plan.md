# Build the Trailhead flagship demo Mini App


This file is an ExecPlan: a self-contained execution plan written for a reader
who has this repository's working tree and nothing else — no memory of any prior
chat, design panel, or conversation. It follows the OpenAI Codex PLANS.md
convention ("Using PLANS.md for multi-hour problem solving",
developers.openai.com/cookbook/articles/codex_exec_plans). Read it top to bottom;
every term of art is defined the first time it is used.


## Purpose / Big Picture


Today this repository ships a React UI kit for Telegram Mini Apps
(`tg-mini-app-uikit`, ~180 `TK*` components and ~60 `use*` hooks) and a
package-local Storybook that shows those components one at a time. What it does
**not** have is a single, runnable application that proves the components compose
into a real product under real Mini App constraints (native buttons, safe areas,
payments, persistence, navigation depth). Every competing kit's demo is likewise
a static component gallery.

A "Telegram Mini App" is a web app that runs inside the Telegram client's
in-app browser (a WebView), with a JavaScript bridge exposed at
`window.Telegram.WebApp` (the "Bot API WebApp interface"). This kit wraps that
bridge in typed hooks and can inject a fake bridge (a "mock") so the same code
runs in an ordinary browser.

After this change a developer can run one command and open **Trailhead** — a
believable outdoor-adventure Mini App (book guided hikes, pay in Telegram Stars,
check in by QR on the trail, train toward a weekly streak, chat with a guide,
manage a TON wallet, and re-skin the whole app live). It is one product with one
persona ("Maya, a weekend hiker") across one week of her life. Its purpose is
twofold and both halves must stay true at all times:

1. It is the kit's flagship marketing artifact: a short screen recording of it is
   the README hero. A skeptic watching it should conclude "real apps look like
   this, and only this kit ships these behaviors."

2. It is the kit's hardest integration test: it exercises every distinctive
   capability of the kit in the place a real user would actually meet it, so
   building it surfaces real bugs the per-component Storybook hides.

How to observe it working when the plan is complete: run
`npm run dev -w trailhead` from the repository root, open the printed local URL in
a desktop browser, and walk the "signature chain" (defined in Artifacts and
Notes): browse the feed, book a hike, pay 450 Stars behind a biometric PIN, watch
confetti, switch to the Trips tab, scan the trailhead QR to flip the booking to
"checked in", then reload the page and confirm every piece of state is still
there. None of that requires a real Telegram client, because the demo injects a
mock bridge by default and prints a visible "MOCK" badge; opened inside a real
Telegram client the same hooks call the real bridge.


## Progress


Checklist is the single source of truth for "what is done". Every stopping point
must update it. Timestamps are UTC (`Z`).

- [x] (2026-06-14 18:30Z) Chose the product concept (Trailhead) and verified its
      three load-bearing behaviors exist in the kit source: edge swipe-back in
      `packages/uikit/src/composites/nav.tsx`, a real `openInvoice` round-trip in
      `packages/uikit/src/foundation/telegram/capabilities.ts`, snap-point sheets
      in `packages/uikit/src/composites/overlays/sheet.tsx`.
- [x] (2026-06-14 18:30Z) Confirmed mock-injection API: `TKTelegramProvider`
      accepts a `webApp` prop (`packages/uikit/src/foundation/telegram/provider.tsx:90`)
      and a mock factory exists at `packages/uikit/test/support/telegram/mock.ts`
      (not a public package export — see Decision Log).
- [ ] M0 — App shell + mock + empty per-tab nav stacks; swipe-back and back-button
      priority proven on placeholder panels. (completed: —; remaining: all)
- [ ] M1 — Mock-data layer with tunable latency/failure + above-stack store
      mirrored to Telegram storage; close/reopen rehydration works.
- [ ] M2 — Discover tab end-to-end: feed → detail → 3-panel booking funnel →
      snap-point checkout sheet → biometric PIN → real Stars round-trip →
      confetti → booking persisted.
- [ ] M3 — Trips tab: booking list, pull-to-refresh, swipe actions, and the
      QR + biometric + location check-in. Completes the signature chain.
- [ ] M4 — Profile tab: TON wallet connect, Trail Pass discount wired back into
      M2's line items, and Platform Lab live theming.
- [ ] M5 — Thicken the thin tabs: Train (streak/leaderboard with a session-detail
      push) and Guide (directory → profile → DM, with long-press).
- [ ] M6 — First-run onboarding coach marks, error/empty states, accessibility +
      reduced-motion pass, e2e specs, and the README recording script.


## Surprises & Discoveries


Record unexpected repository facts here as they are found, with evidence. The
entries below were established while writing this plan and are load-bearing for
the work; a novice must not re-derive them by trial and error.

- Observation: There is no demo or example application in the repository; only a
  package-local Storybook exists.
  Evidence: `find . -type d -not -path '*/node_modules/*'` shows
  `packages/uikit/storybook` but no `examples/` or `apps/` directory; root
  `package.json` `workspaces` is `["packages/*"]` only.

- Observation: The Telegram mock the tests and Storybook use is NOT exported from
  the package; it lives under test support.
  Evidence: `grep -rn createMockTelegram packages/uikit/src` returns nothing;
  the factory is at `packages/uikit/test/support/telegram/mock.ts` and is also
  imported by `packages/uikit/storybook/.storybook/preview.tsx`.

- Observation: Back-button arbitration is already centralized in the provider, so
  overlays and nav stacks cooperate without custom wiring.
  Evidence: `packages/uikit/src/foundation/telegram/provider.tsx` defines a LIFO
  `backQueue` and exports `useBackIntercept(active, handler, showNativeButton)`;
  the nav stack and overlays push interceptors onto it.

- Observation: The repository previously had a *different* file named `plans.md`
  at its root — an audit report, not an ExecPlan — now deleted from the working
  tree but preserved in git history.
  Evidence: `git status` shows `D plans.md` (staged deletion); `git show
  HEAD:plans.md` still returns it, opening with "Воркфлоу отработал: 87 агентов"
  (last touched in commit `6aa57cb`). This ExecPlan uses a distinct filename,
  `trailhead-demo.plan.md` at the repository root (see Decision Log).

- Observation: Durable project knowledge is kept in a Karpathy-style wiki at
  `wiki/`, governed by `.claude/agents.md`; this plan's per-checkpoint outcomes are
  appended to `wiki/goals.log.md`.
  Evidence: `wiki/index.md`, `wiki/goals.log.md`, `.claude/agents.md` exist in the
  tree.

- Observation: The deleted root `plans.md` audit (in git history) is a pre-fix
  snapshot; its most important findings (#1–#3, the vertical-swipe conflict that
  could minimize the whole Mini App) are ALREADY resolved in the current working tree. A ref-counted guard
  `src/internal/useVerticalSwipeGuard.ts` is wired into `TKSheet`, `TKDialog`,
  `TKActionSheet`, and `TKPullToRefresh`, and `TKPage` already sets
  `overscroll-behavior: contain`. So the demo inherits correct behavior for free;
  the milestone job is to VERIFY it stays correct under real navigation, not to
  fix it. Other audit findings may or may not still be open — treat each as
  "verify, then fix only if still reproducing", per Idempotence and Recovery.
  Evidence: `useVerticalSwipeGuard.ts` exists and is imported by
  `packages/uikit/src/composites/overlays/sheet.tsx:88` and
  `packages/uikit/src/composites/gestures/pull-to-refresh.tsx:34`;
  `packages/uikit/src/composites/layout/page.tsx:85` sets `overscrollBehavior:"contain"`.


## Decision Log


- Decision: Keep this ExecPlan as `trailhead-demo.plan.md` at the repository root.
  Rationale: the root `plans.md` (a separate audit report, since deleted from the
  working tree but kept in git history) is not an ExecPlan; a distinct, descriptive
  filename keeps the two from ever being confused.
  Date/Author: 2026-06-14 / Claude.

- Decision: The demo lives in a new npm workspace at `examples/trailhead`, and
  the root `workspaces` array gains `"examples/*"`.
  Rationale: npm workspaces give the demo a real dependency on
  `tg-mini-app-uikit` (`"tg-mini-app-uikit": "*"`) that resolves by symlink, so
  the demo consumes the kit the way an external team would, while staying inside
  this monorepo's tooling.
  Date/Author: 2026-06-14 / Claude.

- Decision: During development the demo's Vite config aliases the bare import
  `tg-mini-app-uikit` to the kit's *source* (`packages/uikit/src/index.ts`) for
  instant hot reload, and a separate "prod-parity" build resolves the bare import
  to the kit's built `dist/` (the published entry).
  Rationale: source alias removes the rebuild-on-every-change loop during
  development; the dist build proves the published package — types, CSS export,
  tree-shaking — actually works for consumers. Both must pass before M6 is done.
  Date/Author: 2026-06-14 / Claude.

- Decision: Expose the existing mock as a public package subpath
  `tg-mini-app-uikit/testing` (re-exporting `createMockTelegram` and the
  `TelegramWebApp` type) and have the demo import the mock from there, rather than
  reaching into `packages/uikit/test/support`.
  Rationale: a flagship demo that imports another package's *test internals* is a
  bad example for the teams it is meant to teach; a documented `/testing` entry is
  itself a differentiator (a browser-testable Telegram mock) and keeps the demo
  honest. If exposing the subpath proves larger than a milestone's budget, the
  fallback is a Vite alias `@uikit-testing` → the test-support file, recorded
  here when taken.
  Date/Author: 2026-06-14 / Claude.

- Decision: The demo defaults to the injected mock bridge and renders a visible
  "MOCK" badge; every native-dependent capability (Stars invoice, TON connect,
  QR, biometrics, location) degrades to a simulated success/cancel path in mock
  mode and calls the real bridge when `window.Telegram.WebApp` is present.
  Rationale: the demo must run for anyone in a plain browser yet never lie about
  what is real. Honesty about what is faked is a stated product principle.
  Date/Author: 2026-06-14 / Claude.

- Decision: When a milestone's demo flow is blocked by an open kit bug, fix the
  bug in `packages/uikit/src` as part of that milestone, with a kit-level test,
  rather than working around it in demo code.
  Rationale: "the demo drives kit hardening" is the whole point of building it as
  an integration test; a workaround in demo code would hide the very defect the
  demo exists to catch.
  Date/Author: 2026-06-14 / Claude.

- Decision: Target React 19 and Vite 6 for the demo, matching the kit's own
  devDependencies.
  Rationale: the kit already builds and tests on React 19 / Vite 6; matching
  avoids a second toolchain and proves React 19 readiness, a stated edge over
  TelegramUI.
  Date/Author: 2026-06-14 / Claude.

- Decision: The demo has NO Storybook of its own; Storybook stays package-only
  (`packages/uikit/storybook`, for the kit's components).
  Rationale: the demo's job is to prove components compose into a real running
  product, which Storybook does not show; a second Storybook would duplicate the
  component gallery the demo exists to surpass.
  Date/Author: 2026-06-15 / Claude.

- Decision: Build the demo test-first (TDD red-green-refactor). The demo workspace
  ships its own Vitest + Testing Library unit layer AND Playwright e2e, with
  thorough user-scenario coverage (happy paths, edge cases, failure/empty/loading
  states), and every kit fix the demo forces is also written test-first.
  Rationale: the demo is the kit's hardest integration test; tests written after
  the fact codify whatever was built rather than what users need, and miss the
  edge/error states that are half the point of the demo.
  Date/Author: 2026-06-15 / Claude.

- Decision: The demo is fully bilingual Russian + English with zero hardcoded
  user-facing strings. Dictionaries are typed `examples/trailhead/src/i18n/en.ts`
  and `ru.ts` sharing one key type; the kit's own strings are localized via a
  per-language `TKLocale` passed to `TKLocaleProvider`; the active language follows
  the Telegram client language and is switchable in Platform Lab, persisted via
  `useDeviceStorage`.
  Rationale: "full ru/en, no exceptions" is a stated owner requirement; a shared
  key type makes a missing translation a compile error, and a key-parity unit test
  makes it a red test.
  Date/Author: 2026-06-15 / Claude.

- Decision: Every checkpoint (M0–M6) ends with an independent reviewer-agent pass
  that is itself re-verified. Spawn at least two reviewers (e.g. a code-reviewer and
  a skeptic told to refute "done"); treat their output as claims, not verdicts;
  re-check each material claim against source, a fresh test/build run, and the
  running app; then append the goal, the claims, the re-verification result, and the
  evidence to `wiki/goals.log.md` (append-only).
  Rationale: the owner requires reviewer agents at each checkpoint and that they not
  be trusted at face value; recording the re-verification keeps the history honest.
  Date/Author: 2026-06-15 / Claude.

- Decision: Every checkpoint includes a visual-verification pass on the running app:
  a placement contract (related controls are where the user expects them — MainButton
  bottom, header/Back top, tabbar bottom, checkout reachable from the funnel);
  no-break-on-action (interactions never produce overflow, overlap of fixed chrome,
  or broken safe areas, and functionality keeps working); and contrast on any
  action-driven color change (selected/active/error/checked-in colors stay WCAG-AA
  contrast-compliant — axe `color-contrast` passes and a state-change color asserts a
  computed ratio at or above AA). Evidence is Playwright screenshots across
  {light, dark} × {ru, en} × key states plus the live preview tools.
  Rationale: the owner requires that components sit where users expect, that actions
  break neither function nor visuals, and that state colors are contrastive.
  Date/Author: 2026-06-15 / Claude.

- Decision: Maintain project knowledge in a Karpathy-style wiki at `wiki/`, governed
  by `.claude/agents.md`; record each milestone goal and its verified outcome in the
  append-only `wiki/goals.log.md`.
  Rationale: it stops every session from re-deriving the same facts and gives the
  reviewer-verification discipline a durable, write-once home.
  Date/Author: 2026-06-15 / Claude.


## Outcomes & Retrospective


Fill this in at the end of each milestone and at completion: what now works that
did not, what was cut, which kit bugs the demo forced fixes for, and what the
README recording ended up showing. Empty until M0 lands.


## Context and Orientation


Assume the reader has never seen this repository. Orient yourself first, then
build.

This is an npm-workspaces monorepo. The repository root is the directory holding
the root `package.json` (`"name": "tg-mini-app-uikit-workspace"`,
`"private": true`, `"workspaces": ["packages/*"]`). The only published package is
`packages/uikit`, published to npm as `tg-mini-app-uikit`. Node 18+ is required
(`packages/uikit/package.json` `engines`).

The kit is built with Vite into `packages/uikit/dist` and exposes two things a
consumer needs: the JavaScript entry (bare import `tg-mini-app-uikit`) and a
stylesheet (`tg-mini-app-uikit/style.css`). Importing the entry alone is not
enough to see styled components — the CSS must be imported once at app startup.
The kit's public API is the set of `TK*` components and `use*` hooks re-exported
from `packages/uikit/src/index.ts`.

The pieces this demo leans on, by file:

- Theming: `TKProvider` (`packages/uikit/src/foundation/theme.tsx`) sets CSS
  custom properties for accent color, corner radius, density, motion character,
  and type scale on the subtree. Changing its props re-skins everything live.
  `useTelegramTheme()` follows the Telegram client's light/dark and theme colors.

- Telegram runtime: `TKTelegramProvider`
  (`packages/uikit/src/foundation/telegram/provider.tsx`) supplies the WebApp
  bridge to all `use*` hooks. Its `webApp` prop overrides
  `window.Telegram.WebApp`; pass a mock here. The native MainButton, BackButton,
  haptics, popups, storage, invoice, QR, biometrics, and location are exposed as
  hooks (`useMainButton`, `useBackButton`, `useHaptics`, `useInvoice`,
  `useQrScanner`, `useBiometrics`, `useLocation`, `useCloudStorage`,
  `useSecureStorage`, `useDeviceStorage`, …). `useBackIntercept` is the
  arbitration primitive: anything that should claim the Back button while open
  registers here, last-in-first-out.

- Navigation: `TKNavStack` and `useNav` (`packages/uikit/src/composites/nav.tsx`)
  implement an iOS-style push/pop stack. "Swipe-back" means dragging from the
  screen's left edge pops the top panel, with the panel underneath revealed at a
  parallax offset; lower panels stay mounted, so their scroll position and form
  state survive a pop. The stack registers with `useBackIntercept` so the native
  Telegram Back button pops it.

- Layout and safe areas: `TKPage`, `TKSafeArea`, `TKBottomBar`
  (`packages/uikit/src/composites/layout/`) combine CSS `env(safe-area-inset-*)`
  with the live Telegram insets so notches and home indicators are handled once.

- The flows the milestones assemble already exist as components: feed/cards
  (`templates/cards`, `composites/cards`, `composites/carousel`), lists
  (`composites/lists`: `TKInfiniteList`, `TKVirtualList`, `TKListGroup`,
  `TKAccordion`), forms (`composites/forms`: `TKCalendar`, `TKSlotPicker`,
  `TKPinInput`), gestures (`composites/gestures`: `TKPullToRefresh`,
  `TKSwipeCell`, `useLongPress`), overlays (`composites/overlays`: `TKSheet`,
  `TKDialog`, `TKActionSheet`, and toasts via `TKToastProvider` + the `useTKToast`
  hook), payments
  (`composites/cards`/`templates/patterns`: `TKPaymentSummary`, `TKSummaryRow`,
  `TKBookingCard`, plus `useInvoice`), wallet (`templates/patterns/wallet`:
  `TKWalletConnectButton`, `TKWalletStatusCell`), gamification
  (`templates/patterns/gamification`: `TKXPHeader`, `TKLeaderboard`,
  `TKStatTile`, `TKRing`, `TKConfetti`), chat (`templates/chat`: `TKMessages`,
  `TKMessageBubble`, `TKWriteBar`), onboarding (`templates/onboarding`:
  `TKOnboardingTooltip`), and i18n (`foundation/i18n.tsx`: `TKLocaleProvider`).

The Telegram mock: `createMockTelegram(options)` in
`packages/uikit/test/support/telegram/mock.ts` returns an object implementing the
`TelegramWebApp` interface with deterministic, timer-free behavior (resolvable
buttons, scripted sensor readings, in-memory storage). It is what makes the demo
runnable without Telegram. The plan promotes it to a public `/testing` subpath
(see Decision Log); until then it is reachable only by relative path inside the
monorepo.

Existing commands you will reuse (run from the repository root):

    npm run build         # builds the kit into packages/uikit/dist
    npm run typecheck     # strict TypeScript for the kit
    npm run test:unit     # kit unit tests (vitest)
    npm run test:e2e      # Playwright end-to-end tests
    npm run stories       # Storybook at http://127.0.0.1:6006


## Plan of Work


Build in the order below. Each milestone ends in something observably working, so
a stop after any milestone leaves the demo runnable. File paths are written
relative to the new workspace `examples/trailhead` unless they name another
package. The app's own source lives under `examples/trailhead/src`.

Every milestone follows the same definition-of-done loop (see the Decision Log for
why each step exists):

1. Append an `IN_PROGRESS` line for the milestone to `wiki/goals.log.md`.
2. Write the failing tests first — unit (Vitest + Testing Library) and/or e2e
   (Playwright) — covering the milestone's happy path, edge cases, and
   failure/empty/loading states, in BOTH Russian and English.
3. Implement until green; every new user-facing string is added to BOTH `en.ts` and
   `ru.ts` (a missing key is a type error and a red key-parity test).
4. Run the gates: `npm run typecheck`, the demo unit tests, the demo e2e, and
   `npm run build -w trailhead`.
5. Visual-verify on the running app: placement contract, no-break-on-action, and
   contrast on any action-driven color change (Validation and Acceptance lists the
   exact assertions).
6. Spawn at least two independent reviewer agents, then independently re-verify
   each material claim against source, a fresh gate run, and the running app — do
   not trust the reviewers at face value.
7. Append a `DONE` line to `wiki/goals.log.md` citing the evidence, and update the
   affected `wiki/` entity pages.

M0 — Shell and spine first. This de-risks the riskiest part (navigation) before
any content exists. Add `"examples/*"` to the root `package.json` `workspaces`.
Scaffold `examples/trailhead` as a Vite + React 19 + TypeScript app with a
`package.json` depending on `tg-mini-app-uikit` (`"*"`). Add
`examples/trailhead/vite.config.ts` with `@vitejs/plugin-react` and the
dev-time alias `tg-mini-app-uikit` → `../../packages/uikit/src/index.ts`. In
`src/main.tsx`, import `tg-mini-app-uikit/style.css`, then wrap the app in
`TKTelegramProvider` (with a mock from `createMockTelegram`, defaulting to light;
platform is fixed to iOS), `TKProvider`, `TKLocaleProvider`, and `TKToastProvider`.
Bootstrap i18n now: create `src/i18n/en.ts` and `src/i18n/ru.ts` sharing one key
type, a `useT()` helper for the demo's strings, and the per-language `TKLocale`
passed to `TKLocaleProvider`; default the language from the Telegram client
language. From here on, no user-facing string is hardcoded. In `src/App.tsx`
render a persistent `TKTabbar` (five tabs: Discover, Trips, Train, Guide,
Profile) over a `TKBottomBar` safe-area inset, and give each tab its own
`TKNavStack` instance holding one placeholder panel. The critical property to
build and prove here: the tabbar is the lateral switch and each tab's `TKNavStack`
is the independent depth axis, so switching tabs preserves each stack's depth and
scroll. `TKPage` already sets `overscroll-behavior: contain` and the kit's
overlays already guard vertical swipes; as defense-in-depth at the app root, also
call `useVerticalSwipes().disable()` while the app is mounted (its returned API is
`{ isEnabled, enable, disable, isSupported }`) so a stray vertical drag never
minimizes the Mini App. Render a fixed "MOCK" badge whenever `getTelegramWebApp()`
returns null (no real Telegram bridge present).

M1 — Data, latency, persistence. Create `src/data/mockApi.ts`: a single async
data source for experiences, bookings, training sessions, people, and chat
messages, with a tunable artificial delay and an injectable failure flag, so
skeletons and error states are demonstrable on demand. Create `src/store/` — a
small app store (plain React context + reducer is sufficient; no external state
library) that holds bookings, cart, streak XP, theme preferences, the onboarding
flag, and wallet status, living *above* all nav stacks so a back-swipe inside a
funnel never discards it. Mirror the store to Telegram storage:
`useCloudStorage` for bookings/streak/onboarding/check-in, `useSecureStorage` for
the PIN, `useDeviceStorage` for theme preferences. Rehydrate on startup. Prove
the close/reopen beat: set the onboarding flag, reload the page, confirm
onboarding does not replay.

M2 — Discover end-to-end (the believable core). Build the Discover stack root as
a feed: a hero `TKBannerCard`, `TKCategoryTabs`, `TKChipGroup` filters,
`TKSearch`, and `TKInfiniteList` of `TKProductCardA` tiles with `TKRating`, with
`TKSkeletonList` on first load and while paging. Tapping a tile `nav.push()`es the
experience detail (`TKGallery`, `TKBlockquote` guide bio, `TKTimeline` route).
The booking is a three-panel push funnel — Detail → Date/Slot → Summary — so
swipe-back is exercised at depth and a half-built booking survives a back-swipe
because its state lives in the M1 store. Date/Slot uses `TKCalendar` and
`TKSlotPicker` (7am vs 9am, sold-out slots disabled). The native MainButton reads
"Continue — 450 Stars". Summary uses `TKPaymentSummary` and `TKSummaryRow`; paying
opens a snap-point `TKSheet` confirm (the kit's sheet already guards vertical
swipes while open — verify it still does), then a `TKPinInput` gated by
`useBiometrics`, then `useInvoice` fires the Stars invoice (mock resolves it).
Success drops `TKConfetti`, shows a toast via `useTKToast()`, renders with
`useClosingConfirmation(true)` (a declarative render-time hook, not an imperative
arm call), and writes the booking to the store and cloud storage. Haptics fire on
each step. Verify two findings from the archived `plans.md` audit (now in git
history only) against the current tree before assuming work: if `TKInfiniteList`
still double-fetches the first page (finding #16) or `TKPinInput`'s last dot still
fails to light (finding #14 — the kit may already hold the fill via a
`PIN_FILL_HOLD_MS` delay), fix the kit per the Decision Log; otherwise note it as
already-resolved.

M3 — Trips and the QR check-in. The Trips stack root lists `TKBookingCard`s with
status dots. `TKPullToRefresh` re-fetches status (the kit already guards vertical
swipes during the pull via `useVerticalSwipeGuard` — verify). `TKSwipeCell`
reveals Reschedule / Cancel with an Undo toast (`useTKToast()`); an empty list
shows `TKEmptyState`.
The signature push: a "Check in at trailhead" action runs `useQrScanner` →
`useBiometrics` → `useLocation`, flips the card to "Checked in", and persists it.
After this milestone the full signature chain (book → pay → arrive → persist)
runs end to end.

M4 — Profile, wallet, and Platform Lab. The Profile stack root has a
`TKWalletConnectButton`; once connected, `TKWalletStatusCell` shows the address
and a "Trail Pass active — 15% off Stars checkout" cell. Wire that 15% back into
M2's `TKSummaryRow` line items so the wallet causally lowers the Stars total. Gate
wallet actions with `TKPinInput` backed by `useSecureStorage`, `useBiometrics` as
the fast path. A settings `TKListGroup` (`TKCell` rows, a `useClosingConfirmation`
toggle, a `TKDialog` disconnect confirm) includes a row that pushes Platform Lab:
a panel whose `TKSlider`/`TKSegmented`/`TKSwitch` controls drive `TKProvider`
knobs live (accent, radius, density, motion, type scale), with a toggle that flips
the injected mock between light and dark via the mock handle's `setColorScheme`
(syncing `--tg-theme-*` via `useTelegramTheme`), a `setDeviceCutouts` toggle that
adds simulated notch/home-indicator insets, and an RTL switch via
`TKLocaleProvider`. Choices persist via `useDeviceStorage`. Note: the mock has no
platform setter, so an iOS↔Android swap is out of scope unless the mock is
extended with one (optional kit work, recorded as a deferral if attempted).

M5 — Thicken the thin tabs so neither drifts back toward a gallery. Train: a
`TKXPHeader` with a `TKRing` ("Day 5 of 7 — ready for Sunrise Ridge"), `TKCounter`,
a `TKStatTile` grid, `TKProgress` bars, and a `TKLeaderboard` of friends booked on
the *same* trip; a sticky `TKListGroup` groups sessions by week and tapping one
`nav.push()`es a session detail (`TKSteps`, `TKAccordion`) so Train also rides the
swipe-back spine. Guide: a short `TKVirtualList` directory with `TKAvatarStack`,
`useLongPress` opening a `TKActionSheet` (Message / Share trip / Mute); tapping a
person pushes their profile, then "Message" opens a `TKMessages` thread with
`TKMessageBubble` statuses and a `TKWriteBar` that respects the keyboard and safe
area (`useKeyboard` + `TKBottomBar`). If scope bites, Train and Guide degrade to a
flat dashboard and a single thread without breaking the signature chain (the demo
can ship as a four-tab cut: Discover/Trips/Train/Profile).

M6 — Finish. First-run onboarding: three `TKOnboardingTooltip` coach marks
pointing at the tabbar, the edge-swipe-back gesture, and the streak ring, plus a
`useHomeScreen` "add to home screen" prompt, all gated by the M1 onboarding flag.
Add the error/retry state on a faked failed checkout and the empty states. Do an
accessibility and `prefers-reduced-motion` pass (keyboard reachability of every
flow, focus return from overlays). Write Playwright specs (Validation and
Acceptance) and the README recording script that walks the signature chain, a
swipe-back at depth, and Platform Lab.


## Concrete Steps


All commands run from the repository root unless stated. Replace `ROOT` with the
absolute repository path on this machine,
`/Users/nikitakocnev/RustroverProjects/tg-mini-app-uikit`.

Step 0 — confirm a clean, building baseline before adding anything:

    cd /Users/nikitakocnev/RustroverProjects/tg-mini-app-uikit
    npm run build
    npm run typecheck

Expected: the build writes `packages/uikit/dist/index.js`,
`packages/uikit/dist/style.css`, and `.d.ts` files; typecheck prints no errors.

Step 1 (M0) — register the workspace. Edit the root `package.json` so
`workspaces` is `["packages/*", "examples/*"]`. Then create the demo manifest at
`examples/trailhead/package.json` with name `trailhead`, `"private": true`,
`"type": "module"`, scripts `dev`/`build`/`preview` (Vite) and `test` (`vitest run`),
a dependency `"tg-mini-app-uikit": "*"`, and devDependencies matching the kit's
plus the test tooling (`react`/`react-dom` 19, `vite` 6, `@vitejs/plugin-react`,
`typescript`, `vitest`, `@testing-library/react`, `@testing-library/user-event`,
`jsdom`). Install so the workspace symlink is created:

    cd /Users/nikitakocnev/RustroverProjects/tg-mini-app-uikit
    npm install

Expected: `node_modules/tg-mini-app-uikit` is a symlink into `packages/uikit`, and
`ls examples/trailhead/node_modules` is absent (workspaces hoist to the root).

Step 2 (M0) — add `examples/trailhead/vite.config.ts`, `index.html`,
`src/main.tsx`, and `src/App.tsx` per Plan of Work, then run the dev server:

    npm run dev -w trailhead

Expected: Vite prints a local URL (for example `http://localhost:5173/`). Opening
it shows the five-tab Trailhead shell with a "MOCK" badge and placeholder panels.

Step 3 (M0 verification) — before building content, prove the spine by hand:
push two placeholder panels in Discover, drag from the left edge to pop one and
confirm the panel underneath is revealed with its scroll intact; switch to Trips
and back and confirm Discover is still two panels deep. This manual check is
promoted to an automated spec in Validation and Acceptance.

Step 4 (each later milestone) — after writing the milestone's tests-first and
implementing to green, run the full gate (kit checks too, because milestones may
fix kit bugs):

    npm run typecheck
    npm run test:unit
    npm run test -w trailhead
    npx playwright test --project=trailhead
    npm run build -w trailhead

Expected: typecheck, kit unit tests, demo unit tests, and demo e2e all pass; the
demo production build succeeds. Any kit source change made under the Decision Log
must come with a kit unit test that fails before the change and passes after. Then
run the visual + contrast pass and the reviewer-verification gate (Validation and
Acceptance) before appending the milestone's `DONE` line to `wiki/goals.log.md`.

Step 5 (prod-parity, before M6 is done) — build the kit and run the demo against
the built `dist` (not the source alias), to prove the published package works:

    npm run build
    TRAILHEAD_USE_DIST=1 npm run build -w trailhead

Expected: with the source alias disabled (the `vite.config.ts` reads
`TRAILHEAD_USE_DIST`), the demo still type-checks and builds against
`tg-mini-app-uikit/dist`, including `tg-mini-app-uikit/style.css` and the
`tg-mini-app-uikit/testing` subpath.


## Validation and Acceptance


Validation is mandatory and every criterion below is phrased as observable
behavior. The demo's end-to-end tests reuse the repository's existing Playwright
setup, with one structural caveat: in `@playwright/test` 1.60 `webServer` is a
**top-level** config option, not a per-project one. So in `playwright.config.ts`,
make `webServer` an array — keep the existing Storybook entry and add a second
entry that runs `npm run dev -w trailhead` — and add a `trailhead` project that
sets its own `testDir: "examples/trailhead/e2e"`, its own `testMatch` (the current
top-level `testMatch` is `**/*.storybook.spec.ts`, which would otherwise exclude
the demo specs), and a `baseURL` pointing at the demo dev server.

The demo also has its own unit layer (Vitest + Testing Library + jsdom), run with
`npm run test -w trailhead`. Unit targets, written test-first: the store reducer
(actions produce the expected next state), `mockApi` (honors the delay and throws
under the failure flag), price/discount math (the Trail Pass 15% applied to line
items), persistence serialization (a slice round-trips through the storage hooks),
and i18n key-parity (`en.ts` and `ru.ts` have identical key sets — fails red on a
missing translation).

Run the demo e2e with:

    npx playwright test --project=trailhead

Per-milestone acceptance:

- M0: a spec `shell.spec.ts` opens the app, asserts five tabs and the MOCK badge
  are visible, pushes two panels in Discover, performs an edge-swipe-back, asserts
  one panel remains and its scroll offset is unchanged, switches to Trips and back
  and asserts Discover is still one panel deep. It must fail before M0 and pass
  after.

- M1: a spec `persistence.spec.ts` completes onboarding (or sets the flag),
  reloads the page, and asserts the onboarding coach marks do not reappear and a
  seeded booking is still listed. Toggling the mock failure flag shows an error
  state with a retry control; clearing it and retrying shows content.

- M2: a spec `booking.spec.ts` walks Discover feed → detail → date/slot → summary,
  presses the MainButton, completes the biometric PIN, resolves the mock Stars
  invoice, and asserts confetti is shown and the new booking appears in the store;
  separately, a mid-funnel edge-swipe-back returns to the previous panel with the
  chosen slot still selected.

- M3: `checkin.spec.ts` runs pull-to-refresh without minimizing the app, swipes a
  booking cell to reveal Cancel with an Undo toast, and completes the QR check-in
  so the card reads "Checked in" and stays so after reload.

- M4: `wallet-lab.spec.ts` connects the mock wallet, asserts the Trail Pass cell
  appears and a subsequent booking's Stars total is 15% lower, then opens Platform
  Lab, drags the radius slider and asserts the computed `border-radius` (in pixels)
  of a named card element differs from its pre-drag value, then flips the mock to
  dark via `setColorScheme("dark")` and asserts the computed background color of
  the page root differs from its pre-flip value. (No Android assertion: the mock
  has no platform setter.)

- M5: `train-guide.spec.ts` pushes a session detail in Train (swipe-back returns
  to the list) and opens a Guide DM via directory → profile → Message, asserting a
  sent bubble shows a delivered/read status.

- M6: `npx playwright test --project=trailhead` is green; an axe accessibility
  assertion on each tab root reports no serious or critical violations; with
  `prefers-reduced-motion` emulated, no entrance animation runs. The kit's own
  gates still pass: `npm run typecheck`, `npm run test:unit`, `npm run build`,
  `npm run check:package`.

Cross-cutting acceptance — applies to every milestone, not just one:

- User scenarios: each milestone's e2e covers its happy path, at least one edge
  case, and its failure/empty/loading states. The standing scenario set the suite
  must keep green: feed paging with skeletons; book → pay → confetti → persisted;
  mid-funnel swipe-back keeps the chosen slot; biometric-PIN gate blocks then
  allows; pull-to-refresh without minimizing; swipe-to-cancel with Undo; QR
  check-in survives reload; wallet connect lowers the Stars total 15%; Platform Lab
  re-skin; close/reopen rehydration; an open overlay takes the back press before
  the stack pops.

- Internationalization: a unit test asserts `en.ts`/`ru.ts` key parity; an e2e runs
  the signature chain once in Russian and once in English and asserts the rendered
  copy matches each dictionary (catching any hardcoded string); no user-facing
  literal text appears in components.

- Visual: a placement-contract spec asserts the MainButton is at the bottom, the
  header/Back at the top, the tabbar at the bottom, and checkout is reachable from
  the funnel. A no-break spec asserts that after each interaction there is no
  horizontal overflow (`scrollWidth <= clientWidth`), no overlap of fixed chrome,
  and safe-area padding is intact. Visual-regression screenshots are taken across
  {light, dark} × {ru, en} × key states.

- Contrast: axe `color-contrast` passes on every screen; additionally, any action
  that changes a color (selected, active, error, checked-in) asserts the new
  color's computed contrast ratio against its background is at or above WCAG AA
  (4.5:1 text, 3:1 large text / UI).

- Reviewer-verification gate: a milestone is "done" only after at least two
  independent reviewer agents run AND each material claim is independently
  re-verified against source, a fresh gate run, and the running app; the goal, the
  claims, and the re-verification result are appended to `wiki/goals.log.md`.

Whole-demo acceptance: from a clean checkout, `npm install` then
`npm run dev -w trailhead` serves the app; a human can complete the signature
chain in a desktop browser with no Telegram client, in both Russian and English;
and the prod-parity build (Concrete Steps, Step 5) succeeds.


## Idempotence and Recovery


Re-running `npm install`, `npm run build`, and `npm run dev -w trailhead` is
safe and repeatable. Scaffolding steps create files; re-running them overwrites
the demo's own files only and never touches `packages/uikit/src` except where a
Decision-Log kit fix is intended.

If a milestone uncovers an open kit bug, the recovery is to fix it in
`packages/uikit/src` with a failing-first kit test, not to patch around it in the
demo. The archived `plans.md` audit (deleted from the working tree, in git
history) lists candidate bugs, but it is a pre-fix snapshot: several findings
(notably the vertical-swipe conflict #1–#3, and likely the PIN last-dot #14) are
already fixed in the working tree, so each must be re-verified against current
source before being treated as open. If such a fix is larger than the milestone's
budget, the safe fallback is to stub the affected demo step behind the mock (for
example, resolve the Stars invoice without the real `TKSheet` drag) and record the
deferral in Progress and Surprises so it is not mistaken for done.

If scope runs short, the safe degradation is the four-tab cut
(Discover/Trips/Train/Profile, Guide hidden) and flat Train/Guide; this preserves
the signature chain and the marketing story. Removing the `"examples/*"` workspace
entry and the `examples/trailhead` directory fully reverts the demo with no effect
on the published package.

Avoid destructive commands. Do not run `npm run test:e2e:update` (it rewrites the
kit's visual snapshots) as part of demo work; the demo has its own Playwright
project and its own (non-visual) specs.


## Artifacts and Notes


The signature chain (the primary README recording, ~30 seconds): browse the feed,
open Sunrise Ridge, pick a date and the 7am slot, press "Continue — 450 Stars",
pass the biometric PIN while the Trail Pass shaves 15% off the line items, watch
confetti, then in Trips scan the trailhead QR so the card flips to "Checked in",
then reload and show every piece of state survived.

Capability coverage the finished demo must show, with where each lives (kept as
prose, not a table, per format): Telegram runtime — native buttons, safe areas,
haptics, closing confirmation, live theme — is present on every surface;
swipe-back navigation is the spine of all five tabs and runs at depth in the
booking funnel; Stars payments live in the booking funnel; the TON wallet lives in
Profile and causally discounts the Stars total; rich forms (calendar, slot picker,
PIN) live in booking and the wallet gate; gestures live in Trips (pull-to-refresh,
swipe actions) and Guide (long-press); lists at scale are the Discover feed, the
Train week groups, and the Guide directory; chat is the Guide thread;
gamification is the Train streak, leaderboard, and the confetti on success;
persistence is the close/reopen survival of bookings, streak, PIN, and theme;
device APIs are the QR/biometric/location check-in plus share and add-to-home;
theming, i18n, and accessibility are Platform Lab plus the reduced-motion and
keyboard passes; onboarding and loading/empty/error states appear on first run and
under the mock's tunable latency and failure; overlays are the snap-point checkout
sheet, action sheets, dialogs, and toasts; cards and media are the feed and the
experience detail gallery and timeline.

Deliberately omitted rather than forced into a contrived place (the honest cost of
not reaching 100% naturally): motion sensors, emoji status, fullscreen, OTP, and
masked/phone inputs. Forcing them would make the demo the feature-dump it is meant
to disprove.


## Interfaces and Dependencies


Prescriptive choices so a novice does not invent alternatives.

Runtime stack: React 19 and React-DOM 19; Vite 6 with `@vitejs/plugin-react`;
TypeScript 5.8 in strict mode. No state-management library — the app store is a
React context plus `useReducer`. No data-fetching library — the mock API is a
module of `async` functions. No CSS framework — styling comes from the kit's
tokens and component styles; the demo adds only layout glue. No Storybook in the
demo workspace — Storybook stays in `packages/uikit` for the kit's components.

Test tooling (the demo's own devDependencies): `vitest`, `@testing-library/react`,
`@testing-library/user-event`, and `jsdom` for the unit layer; `@playwright/test`
and `@axe-core/playwright` for e2e, accessibility, and contrast. Demo unit specs
live beside their source as `*.test.ts(x)`; demo e2e specs live in
`examples/trailhead/e2e`.

The i18n dictionary shape: `src/i18n/en.ts` exports a typed `en` object; its type
is the single source of truth (`export type Dict = typeof en`), and
`src/i18n/ru.ts` is typed `const ru: Dict`, so a missing or misspelled key fails
`tsc`. A `useT()` helper reads the active dictionary; templated strings use the
kit's `tkFormat` placeholder convention. The kit's own component strings are
localized by passing a per-language `TKLocale` (English defaults + a Russian
mapping) to `TKLocaleProvider`. The active language is stored in `themePrefs`
(persisted via `useDeviceStorage`) and defaults from the Telegram client language.

Package dependency: `examples/trailhead` depends on `tg-mini-app-uikit` at `"*"`,
resolved by the workspace symlink. The demo imports components and hooks from the
bare entry `tg-mini-app-uikit`, the stylesheet from `tg-mini-app-uikit/style.css`
(once, in `src/main.tsx`), and the mock from `tg-mini-app-uikit/testing`.

The mock-injection contract (already in the kit, do not redesign): render
`<TKTelegramProvider webApp={mock}>` at the root, where
`mock = createMockTelegram({ colorScheme })` (the only option is
`colorScheme?: "light" | "dark"`; platform is fixed to iOS, there is no platform
option). The returned object is a `TelegramWebApp` augmented with live-control
methods the demo holds onto for Platform Lab: `setColorScheme("light"|"dark")` and
`setDeviceCutouts(boolean)`. The provider falls back to `window.Telegram.WebApp`
when `webApp` is omitted, so the same build runs inside a real Telegram client
unchanged. The "MOCK" badge is shown when `getTelegramWebApp()` returns null (no
real bridge present).

The new public subpath this plan adds to the kit (Decision Log): a
`tg-mini-app-uikit/testing` export mapping to a built entry that re-exports
`createMockTelegram` and the `TelegramWebApp` type. Add it to
`packages/uikit/package.json` `exports` alongside `"./style.css"`, build it from
the existing `test/support/telegram/mock.ts` (moved or re-exported from a source
location included in the build), and cover it with the kit's package checks
(`npm run check:package`).

The app store shape (minimum fields the milestones read and write):
`bookings` (id, experience, date, slot, status: pending | paid | checkedIn,
priceStars), `cart` (the in-progress booking before payment), `streak` (xp,
dayOfWeek), `wallet` (connected, address, trailPassActive), `themePrefs`
(accent, radius, density, motion, typeScale, rtl, colorScheme, cutouts), and
`onboardingDone` (boolean). The store exposes typed actions; persistence is a
subscriber that writes changed slices to the matching Telegram storage hook.

The mock API surface (minimum functions): `listExperiences(cursor)` →
paged experiences for the infinite feed; `getExperience(id)`; `listBookings()`;
`listSessions()`; `listPeople()`; `listMessages(threadId)` and
`sendMessage(threadId, text)`. Each takes the tunable delay and may throw when the
failure flag is set, so loading and error states are demonstrable.
