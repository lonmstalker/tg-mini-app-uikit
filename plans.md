# Polish the Trailhead demo for real Telegram Mini App viewing

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This file follows the OpenAI Codex ExecPlan convention from "Using PLANS.md for multi-hour problem solving". It is intentionally self-contained: a future contributor should be able to read only this file plus the current repository and understand why the work matters, what to change, how to verify it, and how to recover from partial progress. When this file is revised, update every affected section, not just the checklist.


## Purpose / Big Picture

Trailhead is the flagship demo application for `tg-mini-app-uikit`. It is not just a component gallery; it is meant to prove that the kit can compose a believable Telegram Mini App under real platform constraints: native bottom buttons, native back behavior, safe areas, Telegram theme colors, haptics, Stars payment, sheets, storage, and narrow WebView layout.

The next improvement is a design polish pass focused on how the demo looks when it is watched inside the Telegram Mini App container. A plain desktop browser with the injected mock bridge is useful for development, but it is not the final judge. The final judge is a real Telegram client opening the demo as a Mini App: the native Main Button and Back Button must feel integrated, Telegram safe areas must be respected, dark and light themes must follow the client, and the first minute of the demo must read as a product flow rather than a web page inside WebView.

After this work, a reviewer should be able to open Trailhead in Telegram, complete the signature flow from Discover to booking to Trips, and see a compact, polished, Telegram-native product surface. The biggest visible changes are: the first-run welcome no longer clips, the Discover feed cards read cleanly, nested screens have obvious back behavior even in mock/browser previews, booking date and checkout screens are more compact, Platform Lab no longer confuses the user-facing profile flow, and dark theme keeps strong contrast.


## Progress

- [x] (2026-06-15 10:46Z) Captured the design audit findings into this OpenAI-style ExecPlan. No production code has been changed.
- [x] (2026-06-15 11:09Z) Established browser/mock visual baselines before implementation at 390 by 844, 360 by 780, and 320 by 700. Baseline screenshots were kept outside the repository at `/tmp/trailhead-baseline-2026-06-15`.
- [ ] Establish a real Telegram Mini App WebView baseline. Blocked locally by missing tunnel/bot/client configuration; no `cloudflared`, `ngrok`, `localtunnel`, or Telegram bot/tunnel environment variables were available on this machine.
- [x] (2026-06-15 11:09Z) Polished the Discover first viewport: replaced the large hero-style banner with a compact recommendation row and rebuilt feed cards around `TKCard` composition with stable price placement and one-line non-interactive rating metadata.
- [x] (2026-06-15 11:09Z) Improved browser/mock nested navigation affordance with a mock-only `TKHeader` back fallback across nested demo screens while preserving native Telegram Back Button behavior for real clients.
- [x] (2026-06-15 11:09Z) Compacted the booking flow: DateSlot now shows the selected hike and price before the calendar, the calendar is denser, and checkout sheet spacing is tightened.
- [x] (2026-06-15 11:09Z) Separated Platform Lab from the user-facing Profile story by moving it into a clearly marked demo tools section; shortened guide same-trip badges in both English and Russian.
- [x] (2026-06-15 11:09Z) Re-ran automated gates and browser/mock visual verification. Final screenshots were kept outside the repository at `/tmp/trailhead-polish-final-2026-06-15`; in-app Browser smoke verified feed metadata and mock back behavior.
- [x] (2026-06-15 11:19Z) Created an ephemeral HTTPS preview candidate with `npx --yes localtunnel --port 5173 --local-host 127.0.0.1`. The tunnel URL `https://purple-days-kick.loca.lt/` returned the Trailhead Vite HTML by `curl -L` while active; this narrows the local blocker to missing Telegram bot/client Mini App launch, not missing HTTPS transport.
- [x] (2026-06-15 11:19Z) Added an injected real-bridge e2e proxy at `examples/trailhead/e2e/telegram-bridge.spec.ts`. It installs `window.Telegram.WebApp` before app boot and verifies that Trailhead hides browser-only mock chrome, drives native MainButton and BackButton handlers, and emits selection haptics after slot selection.
- [x] (2026-06-15 11:31Z) Added a reproducible real-Telegram preview helper at `examples/trailhead/scripts/telegram-preview.mjs` and documented it in `examples/trailhead/README.md`. It starts Vite, opens a temporary HTTPS localtunnel URL, verifies Trailhead HTML, and, when `TELEGRAM_BOT_TOKEN` is present, calls Bot API `setChatMenuButton` with a `web_app` menu button.
- [x] (2026-06-15 11:35Z) Deployed the production Trailhead build to the existing `visitka` server at `https://201-51-25-123.sslip.io/trailhead/`. The current root Mini App remains served by `visitka-bot-1`; Caddy now serves only `/trailhead/*` from `/srv/trailhead` and continues to proxy all other paths to `bot:8080`.
- [x] (2026-06-15 11:35Z) Wired the deployed Trailhead URL into the existing `lonmstalker_bot` only for `OWNER_CHAT_ID`: Bot API `setChatMenuButton` returned a `web_app` owner menu button pointing at `https://201-51-25-123.sslip.io/trailhead/`, and an owner-only message with an inline `web_app` button was sent.
- [x] (2026-06-15 12:05Z) Fixed the real-client issue pass reported after deployment: biometric unlock now performs `init` and `requestAccess` before `authenticate`; Stars payment now requests a real Bot API invoice link from `my-work-bot`; TON wallet connect now uses TonConnect UI and a deployed manifest; mock-only cutout controls are hidden in real Telegram; guides, feed cards, route cards, skeletons, and infinite-list loaders now have Telegram-style hairline separation and stable width.
- [x] (2026-06-15 12:05Z) Extended `my-work-bot` so it can serve and deploy the Trailhead demo: added `just deploy-trailhead-demo`, `/demo` BotCommand, `/start` and `/demo` WebApp buttons, Caddy `/trailhead/` static route, protected `/api/trailhead/invoice`, and `pre_checkout_query` acceptance for Stars payments.
- [x] (2026-06-15 12:07Z) Rebuilt and redeployed both artifacts to `visitka`: Trailhead static dist was synced to `/opt/visitka/trailhead-dist`, and `visitka-bot-1` was recreated from a freshly built `ghcr.io/lonmstalker/my-work-bot:latest` image. Root app, `/trailhead/`, TON manifest, Bot commands, and invoice endpoint were all smoke-tested after deployment.
- [x] (2026-06-15 12:32Z) Fixed the second real-client feedback pass: production Trailhead no longer auto-injects the mock bridge, loads and validates the official Telegram WebApp script before boot, ignores plain-browser Telegram stubs without launch data, hides mock-only cutout/RTL/closing controls from real/non-mock runtime, replaces the feed inline filters with a filter sheet, improves the light-theme search field, adds feed-card-shaped skeletons, and prevents empty checkout from rendering `0 Stars`.
- [x] (2026-06-15 12:32Z) Rebuilt and redeployed the updated Trailhead static build to `visitka`; public smoke confirmed `/trailhead/`, the new JS asset, TonConnect manifest, unauthenticated invoice `401`, authenticated invoice `200`, and deployed render without `MOCK` or inline filter rows.
- [x] (2026-06-15 13:00Z) Fixed and redeployed the third feedback pass: search focus keeps the feed mounted, `TKSearch` no longer squeezes the Russian cancel label, nested booking/check-in/detail flows hide the bottom tabbar, native MainButton ownership is scoped to the visible tab stack, Trips statuses use a compact pill instead of the old badge, and check-in now has an explicit demo path when no physical QR stand is available. The updated static build was deployed to `visitka` under `/trailhead/`.
- [x] (2026-06-15 14:02Z) Fixed the fourth feedback pass: focused search hides the bottom tabbar while the keyboard overlaps the viewport, checkout warns before real Stars payments and offers an explicit demo completion after a cancelled invoice, checkout/profile PIN entry supports variable 4-8 digit codes, and Discover now uses one animated search/filter toolbar with the filter label collapsing to an icon while search is active.
- [x] (2026-06-15 14:04Z) Rebuilt and redeployed the fourth feedback pass to `visitka`; public smoke confirmed `https://201-51-25-123.sslip.io/trailhead/`, the new `index-B1PdVzCN.js` asset, production render without `MOCK`, and the deployed search/filter toolbar behavior.
- [x] (2026-06-15 14:40Z) Fixed the fifth feedback pass locally: checkout final charge is capped to `1 Star`, checkout hides the MainButton while the payment sheet is open, closing a completed demo payment returns to Trips instead of a dead checkout, PIN dots render only as digits are entered, keyboard detection ignores Telegram viewport drag without focused text input, and Trips opens with visible swipe/pull-to-refresh hints.
- [x] (2026-06-15 14:41Z) Redeployed the fifth feedback pass to `visitka`; public smoke confirmed `https://201-51-25-123.sslip.io/trailhead/`, the new `index-CIOBpOCG.js` asset, production render without `MOCK`, `1 Star` checkout cap, hidden checkout pay action under the sheet, dynamic PIN dots, and Trips gesture hints.
- [x] (2026-06-15 15:00Z) Fixed the sixth feedback pass locally: Trips pull-to-refresh now starts at the top of the Trips page and exposes a visible indicator, keyboard state resyncs on focus/blur/visibility so the bottom navbar is not left hidden after re-entry, checkout PIN explains the 4-8 digit flow, profile wallet PIN explains first-time PIN setup, and the Stars PIN sheet snaps high enough to show `Готово` without dragging.
- [x] (2026-06-15 15:05Z) Rebuilt and redeployed the sixth feedback pass to `visitka`; public smoke confirmed `https://201-51-25-123.sslip.io/trailhead/`, the new `index-DdkZB0Gy.js` asset, and the deployed Trips pull-to-refresh indicator in mock Telegram mode.
- [x] (2026-06-15 16:13Z) Fixed the seventh feedback pass locally: pull-to-refresh now renders a visible 38px indicator as soon as the pull starts, native MainButton click handlers ignore raw Telegram click events while disabled/loading/hidden, and DateSlot cannot navigate to checkout before a time is selected.
- [x] (2026-06-15 16:24Z) Rebuilt and redeployed the seventh feedback pass to `visitka`; public smoke confirmed `https://201-51-25-123.sslip.io/trailhead/`, the new `index-i-t-ooR-.js` asset, and a deployed 38px Trips pull-to-refresh indicator in mock Telegram mode.
- [x] (2026-06-15 16:29Z) Pushed branch `codex/trailhead-polish-plans` and opened draft PR https://github.com/lonmstalker/tg-mini-app-uikit/pull/2. It stays draft because the only remaining acceptance item is manual visual validation inside a real Telegram client.
- [ ] Re-run real Telegram visual verification when a real Telegram client plus HTTPS Mini App URL are available.


## Surprises & Discoveries

- Observation: The repository currently has `trailhead-demo.plan.md`, but no root-level `plans.md`.
  Evidence: `rg --files -g 'plans.md' -g '*plan*.md'` returned only `trailhead-demo.plan.md` before this file was created.

- Observation: `trailhead-demo.plan.md` records that an older root `plans.md` was not an ExecPlan and was deliberately avoided for the original demo build.
  Evidence: `trailhead-demo.plan.md` says the old root `plans.md` was an audit report in git history, and the Trailhead build plan used a distinct filename to avoid confusion.

- Observation: The current app already has strong Telegram infrastructure.
  Evidence: `examples/trailhead/src/AppFrame.tsx` wraps the app in `TKProvider` with `telegram`, `useTelegramTheme`, and persisted theme knobs; `examples/trailhead/src/App.tsx` uses `TKTabbar` and per-tab `TKNavStack`; `examples/trailhead/src/components/PrimaryAction.tsx` uses `useMainButton` in real Telegram and `TKMainButton` fallback in browser.

- Observation: The largest visual issues are visible at normal Telegram-like mobile width.
  Evidence: a 390 by 844 Playwright pass showed a clipped welcome title, feed-card price/rating collisions, a large DateSlot first viewport, long guide badges squeezing row content, Platform Lab bottom action overlapping lower controls, and dark-theme contrast weaknesses around the banner CTA.

- Observation: Real Telegram viewing changes the acceptance bar.
  Evidence: the browser mock can show the DOM fallback `TKMainButton`, but a real Telegram client moves the primary action into native Telegram chrome. A browser-only screenshot can prove layout regressions, but cannot prove native Main Button, native Back Button, client safe-area behavior, haptics, or theme synchronization.

- Observation: The first-run welcome did not reproduce as a measurable text-overflow problem in the current browser/mock pass.
  Evidence: 320, 360, and 390px Playwright measurements showed the welcome title text range inside its card. No production change was made to onboarding in this pass; the visible layout was still included in before screenshots.

- Observation: Browser mock mode should be detected through the demo's mock handle, not by assuming every `WebApp` object is real Telegram.
  Evidence: `TKTelegramProvider` receives an injected mock object in browser mode, while a real Telegram client makes `useMockHandle()` return `null`. The mock-only header fallback is therefore gated through `useMockHandle()`, not by duplicating native chrome in real clients.

- Observation: A local real-Telegram verification path was not available in this checkout.
  Evidence: `command -v cloudflared`, `command -v ngrok`, `command -v lt`, and `command -v localtunnel` returned nothing, and the environment exposed no Telegram bot, ngrok, Cloudflare, or tunnel variables. Without a bot URL and a real Telegram client, the native Main Button, Back Button, haptics, safe area, and theme sync acceptance items remain unverified.

- Observation: An HTTPS preview can be created without adding project dependencies by using npm's one-shot package execution.
  Evidence: with the Trailhead dev server on `127.0.0.1:5173`, `npx --yes localtunnel --port 5173 --local-host 127.0.0.1` returned `https://purple-days-kick.loca.lt/`, and `curl -L https://purple-days-kick.loca.lt/` returned the Trailhead `index.html`.

- Observation: The demo's real-bridge code path can be regression-tested without pretending it is a real Telegram client.
  Evidence: `examples/trailhead/e2e/telegram-bridge.spec.ts` injects a structural `window.Telegram.WebApp` before module load. The test proves the mock badge and DOM primary button disappear, native BackButton pops the detail screen, native MainButton advances into DateSlot, DateSlot's native Continue button changes from inactive to active after slot selection, and haptic selection feedback is sent.

- Observation: The remaining real-client pass can now be started from a repo-local command once bot credentials are available.
  Evidence: `npm run telegram:preview -w trailhead` successfully started Vite, received `https://bright-heads-end.loca.lt` from localtunnel, verified the HTTPS response contained the Trailhead Vite app, and correctly skipped the Bot API step because `TELEGRAM_BOT_TOKEN` was not set.

- Observation: The existing `visitka` host is a Caddy-fronted Docker deployment suitable for hosting the Trailhead static build beside the current bot.
  Evidence: `docker ps` on `visitka` showed `visitka-bot-1` on the internal compose network and `visitka-caddy-1` publishing ports 80/443. `/opt/visitka/Caddyfile` served `201-51-25-123.sslip.io` and proxied to `bot:8080`; adding a `/trailhead/*` static route kept the root route on the original bot.

- Observation: Public browser smoke now proves the deployed Trailhead build is not only reachable as HTML, but renders the demo app.
  Evidence: a Playwright smoke against `https://201-51-25-123.sslip.io/trailhead/?fast=1` dismissed onboarding, waited for `feed-list`, found visible `Sunrise Ridge`, and read `450 Stars` plus `4.9 · 284` metadata without page errors.

- Observation: The original Stars checkout path was not a valid Telegram payment integration.
  Evidence: `examples/trailhead/src/features/discover/Checkout.tsx` called `openInvoice` with a synthetic `https://t.me/$trailhead-...` URL. The deployed follow-up now creates a real invoice URL through `my-work-bot` at `/api/trailhead/invoice`; a signed `initData` smoke returned `200` and a `https://t.me/$...` invoice URL.

- Observation: The visually broken "two ovals in the center" skeleton came from the reusable infinite-list sentinel, not only from Trailhead screen code.
  Evidence: `TKInfiniteList` centered its sentinel with flex. A full-width `TKSkeletonList` passed as a loader therefore shrank and appeared centered. The sentinel now stretches to `width: 100%`, and the default tiny loader keeps its own centered block styling.

- Observation: Telegram biometric authentication needs the manager lifecycle, not just an `authenticate` call.
  Evidence: Trailhead now routes biometric actions through `authenticateWithBiometrics`, which performs `init()`, checks availability, requests access if needed, and only then calls `authenticate()`.

- Observation: The deployed production build was still entering mock mode because `examples/trailhead/src/main.tsx` created a mock bridge whenever `getTelegramWebApp()` was absent.
  Evidence: real Telegram Desktop screenshots showed the `MOCK` badge, fake Stars path, and mock-only controls. The production bootstrap now creates the mock only in dev or via explicit `?mock=1`.

- Observation: `telegram-web-app.js` creates a browser stub even outside Telegram, so presence of `window.Telegram.WebApp` alone is not enough to prove a real Mini App launch.
  Evidence: production preview loaded the official script in a plain browser and exposed a version-6.0 WebApp without `initData` or `initDataUnsafe.user`. The bootstrap now discards that stub before rendering, keeping browser fallback honest while accepting real launch data.

- Observation: The `0 Stars` summary came from rendering checkout against an already reset cart.
  Evidence: `Checkout.tsx` previously computed `computeCheckout(cart.basePriceStars ?? 0, ...)` even when the summary panel was reached with no active cart. It now renders a `checkout-empty` state instead of a disabled `Оплатить 0 Stars` footer.

- Observation: Hidden but still-mounted tab stacks can continue to own Telegram native chrome.
  Evidence: `App.tsx` keeps every tab panel mounted for state preservation. Before the third pass, nested screens computed `active` only from their local stack, so an inactive tab could still mount `useMainButton`. The app now passes top-level tab visibility into each stack and hides the tabbar while the active stack is deeper than its root.

- Observation: Search collapse in real clients is consistent with shrinking scroll-only pages for keyboard overlap.
  Evidence: `TKPage` applied keyboard height reduction even when a page had no footer. The Discover feed has no page footer, so keyboard focus did not need this shrink. `TKPage` now only reduces height when it owns a pinned footer.

- Observation: The Russian search cancel action needed an explicit flex guard.
  Evidence: visual smoke at 390px showed the cancel label could shrink to a single visible character after focusing search. `TKSearch` now gives the field `minWidth: 0` and prevents the cancel button from flex-shrinking.

- Observation: A separate filter button row wastes the first viewport and makes search focus feel broken in Telegram.
  Evidence: the fourth feedback pass moved Discover to a single toolbar. `TKSearch` now supports host-owned collapse controls, and Playwright verifies the filter button shrinks from 116px to 44px while the search expands from 234px to 306px at 390px width.

- Observation: Telegram viewport shrink is not sufficient evidence that the soft keyboard is open.
  Evidence: after pulling a Mini App down and returning, `visualViewport` can change while no text input is focused. `useKeyboard` now requires an editable active element before setting `.tk-kb-open`, which keeps the bottom navbar from disappearing after Telegram chrome gestures.

- Observation: The public demo must cap real Stars exposure without pretending the payment is fake.
  Evidence: `computeCheckout` now keeps the catalog price and Trail Pass accounting rows, then applies a `Demo safety cap` line so the final invoice amount is `1 Star`. The confirmation sheet still warns that Telegram may charge that Star and offers a no-spend demo completion after a cancelled invoice.

- Observation: The missing pull-to-refresh feedback was caused by composition, not by the gesture engine alone.
  Evidence: `TripsList` mounted `TKPullToRefresh` around only the card list below the title and hint card, so a pull from the top of the page did not enter the refresh root. `TKPullToRefresh` now can wrap a full `TKPage`, uses the inner page scroll position when present, and the refresh indicator is covered by unit and e2e checks.

- Observation: The checkout PIN keypad could be cut off because the sheet kept the confirmation snap point after switching content.
  Evidence: `Checkout.tsx` used `snapPoints={[0.55, 0.92]}` but never moved from the low snap when `phase` changed from `confirm` to `pin`. The sheet now snaps to the high point for PIN entry, and the PIN copy explicitly says to enter 4-8 digits and press `Готово`.

- Observation: Native Telegram click events must be guarded independently from `MainButton.setParams({ is_active: false })`.
  Evidence: the demo keeps hidden tab stacks mounted and tests can call the raw MainButton click listener directly. `useNativeButton` now stores whether the native button is visible, enabled, and not loading before invoking the latest click callback; DateSlot also guards its local `nav.push("summary")` call behind `canContinue`.


## Decision Log

- Decision: Treat this work as Telegram Mini App polish, not a general web redesign.
  Rationale: The owner explicitly clarified that the demo will be watched inside Telegram Mini Apps. The plan therefore prioritizes native Telegram behavior, safe areas, compact screens, and WebView rhythm over desktop-browser presentation.
  Date/Author: 2026-06-15 / Codex.

- Decision: Keep the new plan in root `plans.md`.
  Rationale: The user explicitly requested `plans.md`. The existing `trailhead-demo.plan.md` is already a large, dirty build ExecPlan for creating Trailhead; this file is a separate living plan for the next design-polish pass.
  Date/Author: 2026-06-15 / Codex.

- Decision: Use the OpenAI ExecPlan structure without wrapping the file in a Markdown code fence.
  Rationale: The OpenAI ExecPlan guidance says a standalone `.md` file whose entire content is the ExecPlan should omit the outer triple backticks.
  Date/Author: 2026-06-15 / Codex.

- Decision: Browser/mock visual checks are required but insufficient.
  Rationale: Browser checks are faster and deterministic, but they do not exercise the actual native Main Button, Back Button, safe-area, haptic, or Telegram theme container. Completion requires at least one real Telegram Mini App visual pass.
  Date/Author: 2026-06-15 / Codex.

- Decision: Prefer reusing UIKit components over adding app-specific custom UI.
  Rationale: Trailhead is meant to sell `tg-mini-app-uikit`; custom feed cards, custom welcome dialog structure, and ad hoc control rows weaken the demo because they hide the kit's reusable component vocabulary.
  Date/Author: 2026-06-15 / Codex.

- Decision: Keep demo-specific polish in Trailhead, but fix reusable UIKit bugs where the demo exposes them.
  Rationale: Most required behaviors were achievable with existing UIKit primitives (`TKCard`, `TKHeader`, `TKPage`, `TKSheet`, `TKListGroup`, `TKSegmented`, and `PrimaryAction`). The later centered skeleton defect was a reusable `TKInfiniteList`/`TKSkeletonList` layout bug, so that fix belongs in `packages/uikit/src`.
  Date/Author: 2026-06-15 / Codex.

- Decision: Use a compact non-interactive rating display in feed cards instead of `TKRating`.
  Rationale: `TKRating` renders star buttons even when readonly, which is correct for the component but too wide and semantically noisy inside a narrow tappable feed row. A single-star metadata line keeps rating plus review count unbroken at 320px without nested interactive controls.
  Date/Author: 2026-06-15 / Codex.

- Decision: Use one-shot `npx localtunnel` only as an ephemeral preview candidate for real Telegram validation.
  Rationale: The repository has no committed tunnel/deploy workflow and no tunnel binary installed. `npx localtunnel` creates an HTTPS URL without changing `package.json`, but it still does not prove Mini App behavior until a Telegram bot/client opens that URL as a Mini App.
  Date/Author: 2026-06-15 / Codex.

- Decision: Automate only the safe, credential-gated Bot API setup step.
  Rationale: Telegram's official Bot API exposes `setChatMenuButton` for a bot menu button, including a `MenuButtonWebApp` shape that launches a Web App. The helper therefore updates the bot menu only when `TELEGRAM_BOT_TOKEN` is explicitly provided, and never stores credentials in the repository. Creating or configuring a Main Mini App direct link still remains a BotFather/client action.
  Date/Author: 2026-06-15 / Codex.

- Decision: Deploy Trailhead under `/trailhead/` on the existing `visitka` domain instead of replacing the root Mini App.
  Rationale: The existing bot already owns the root route and API paths. A path-scoped static route lets the demo Mini App coexist on the same host and certificate without changing the current bot container or its public root behavior.
  Date/Author: 2026-06-15 / Codex.

- Decision: Set the Trailhead bot menu button only for `OWNER_CHAT_ID`.
  Rationale: The deployed server already has a production bot. A chat-specific `setChatMenuButton` gives the owner a real Telegram launch path for Trailhead without changing the bot's default menu for all users.
  Date/Author: 2026-06-15 / Codex.

- Decision: Move Stars invoice creation to `my-work-bot` and require signed Mini App `initData`.
  Rationale: A static Mini App cannot safely create invoice links because Bot API requires the bot token. The backend can create `XTR` invoices without exposing the token, and the existing initData validator prevents unauthenticated public invoice-link creation.
  Date/Author: 2026-06-15 / Codex.

- Decision: Use TonConnect UI only for the real Telegram path and keep the old deterministic demo wallet in mock/browser mode.
  Rationale: Real TON wallet integration needs TonConnect manifest and wallet UI. Browser/e2e mock mode still needs deterministic Trail Pass behavior without opening an external wallet modal during automated tests.
  Date/Author: 2026-06-15 / Codex.

- Decision: Production Trailhead must not silently fall back to fake Telegram behavior.
  Rationale: The demo is now deployed as a real Mini App. If the real Telegram bridge is absent, production should remain an honest browser fallback; fake Stars, fake TON, mock cutouts, and `MOCK` badge are reserved for dev/e2e or explicit `?mock=1`.
  Date/Author: 2026-06-15 / Codex.

- Decision: Move Discover filters into a sheet instead of keeping category tabs and difficulty chips inline.
  Rationale: The screenshot showed the inline filter area already crowding the first viewport with only a few options. A sheet scales to more categories and keeps the feed header focused on search plus one compact filter entry.
  Date/Author: 2026-06-15 / Codex.

- Decision: Keep search and filters in one animated toolbar.
  Rationale: Telegram's narrow viewport cannot afford a second control row under search. The search field starts compact beside a labeled filter button, expands over the label on focus, and leaves only an icon-sized filter action; blur or filter-open collapses search and restores the label.
  Date/Author: 2026-06-15 / Codex.

- Decision: Keep the full-kit size-limit gates, but raise the CJS budget from `48 kB` to `48.2 kB` and the ESM budget from `47 kB` to `47.1 kB`.
  Rationale: Variable-length PIN entry, safer keyboard-focus/native-button guards, and the visible pull-to-refresh indicator add small legitimate integration overhead. The ESM increase was kept to 0.1 kB after moving static indicator styling out of inline JS; tree-shaking budgets remain unchanged, and `check:package` still enforces publint, ATTW, size-limit, and docs gates.
  Date/Author: 2026-06-15 / Codex.


## Outcomes & Retrospective

Browser/mock implementation is complete for this pass. Discover now opens with a compact recommendation row and denser card list; feed cards keep price and rating/review metadata separate at 320 and 390px; nested demo screens show a visible mock-only back header; DateSlot starts with a selected-hike summary and price; Checkout sheet spacing is tighter; Profile separates real settings from demo tooling; Platform Lab's reset footer no longer overlaps the language control; Guide same-trip badges are short in English and Russian.

The initial polish implementation deliberately stayed in `examples/trailhead` plus its e2e coverage and i18n dictionaries. The follow-up real-client issue pass also touched reusable UIKit list/feedback internals because the centered skeleton defect came from `TKInfiniteList` and `TKSkeletonList`, not only from the demo app.

Verification evidence:

- `npm run typecheck -w trailhead` passed.
- `npm run test -w trailhead` passed: 7 files, 33 tests.
- `npm run build -w trailhead` passed.
- `npx playwright test --project=trailhead --reporter=line` passed: 31 tests.
- `npm run typecheck` passed.
- `npm run test:unit` passed: 47 files, 612 tests.
- `npm run build` passed.
- `npm run check:stories` passed: 113/113 Storybook export coverage.
- `npm run check:package` passed after the package build completed. A previous parallel run failed only because `check:package` started before `packages/uikit/dist` existed.
- `npm run test:e2e -- --reporter=line` passed: 92 tests.
- In-app Browser smoke at 390 by 844 passed: feed price and metadata did not overlap, metadata was `nowrap`, mock back appeared on detail and returned to feed.
- `npx playwright test --project=trailhead examples/trailhead/e2e/telegram-bridge.spec.ts examples/trailhead/e2e/polish.spec.ts --reporter=line` passed: 6 tests.
- `npx playwright test --project=trailhead examples/trailhead/e2e/telegram-bridge.spec.ts --reporter=line` passed: 1 test. This is not the real Telegram pass, but it verifies the app's `window.Telegram.WebApp` branch for native MainButton, BackButton, and haptic selection routing.
- `curl -L https://purple-days-kick.loca.lt/` returned the Trailhead Vite HTML while the local dev server and tunnel were running.
- `npm run telegram:preview -w trailhead -- --help` passed and printed the real Telegram preview workflow and env contract.
- `npm run telegram:preview -w trailhead` successfully produced and verified `https://bright-heads-end.loca.lt`; the script remained running as intended for a manual Telegram pass and was stopped with `Ctrl-C`.
- `npm run build -w trailhead -- --base=/trailhead/` passed and produced `/trailhead/assets/...` references in `dist/index.html`.
- `rsync -az --delete examples/trailhead/dist/ visitka:/opt/visitka/trailhead-dist/` completed successfully.
- On `visitka`, `docker compose up -d caddy` recreated only `visitka-caddy-1`; `visitka-bot-1` remained up, and `docker exec visitka-caddy-1 caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile` reported a valid configuration.
- `curl -I https://201-51-25-123.sslip.io/` returned `HTTP/2 200` from the existing root app, while `curl -I https://201-51-25-123.sslip.io/trailhead/` returned `HTTP/2 200` from Caddy's static file server and `/trailhead/assets/index-jsIMt7Uf.js` returned JavaScript.
- Bot API verification for `lonmstalker_bot` returned an owner-specific `web_app` menu button with text `Trailhead demo` and URL `https://201-51-25-123.sslip.io/trailhead/`; an owner chat message with an inline `Open Trailhead demo` web app button was sent.
- Playwright production smoke against `https://201-51-25-123.sslip.io/trailhead/?fast=1` passed: title was `Trailhead — Telegram Mini App demo`, mock badge appeared in normal browser mode, and the Discover feed rendered `Sunrise Ridge`, `450 Stars`, and rating metadata.
- `npm run test -w tg-mini-app-uikit -- test/lists-reorg.test.tsx test/feedback-reorg.test.tsx` passed: 2 files, 7 tests.
- `npx react-doctor@latest --verbose --scope changed` reported 100/100 for the changed tracked UIKit files. It skipped `examples/trailhead` because that directory is untracked in this checkout; Trailhead was covered by its own unit, typecheck, build, and e2e gates.
- `cargo fmt --all -- --check`, `cargo check -p bot`, and `cargo test -p bot` passed in `/Users/nikitakocnev/IdeaProjects/my-work-bot/my-work-bot`.
- `npx playwright test --project=trailhead examples/trailhead/e2e/wallet-lab.spec.ts examples/trailhead/e2e/train-guide.spec.ts examples/trailhead/e2e/booking.spec.ts --reporter=line` passed: 14 tests.
- `just deploy-trailhead-demo` passed and synced the Trailhead build to `visitka`.
- `just deploy` passed after a 7m56s amd64 release build, loaded the image onto `visitka`, and recreated `visitka-bot-1`.
- `curl` smoke after deployment returned `200` for `https://201-51-25-123.sslip.io/`, `200` for `https://201-51-25-123.sslip.io/trailhead/`, and `200` for `/trailhead/tonconnect-manifest.json`.
- Unauthenticated `POST /api/trailhead/invoice` returned `401`; the same endpoint with freshly signed `initData` returned `200` plus a real `https://t.me/$...` invoice URL.
- Bot API `getMyCommands?language_code=ru` returned `/start`, `/demo`, and `/forget`; a new owner chat message with an inline Trailhead WebApp button was sent.
- Second feedback pass verification:
  - `npm run typecheck -w trailhead` passed.
  - `npm run test -w trailhead` passed: 7 files, 33 tests.
  - `npm run build -w trailhead -- --base=/trailhead/` passed.
  - `npm run test -w tg-mini-app-uikit -- test/coverage-components.test.tsx test/inputs-reorg.test.tsx` passed: 2 files, 31 tests.
  - `npx playwright test --project=trailhead examples/trailhead/e2e/booking.spec.ts examples/trailhead/e2e/wallet-lab.spec.ts examples/trailhead/e2e/telegram-bridge.spec.ts examples/trailhead/e2e/shell.spec.ts --reporter=line` passed: 13 tests.
  - `npm run check:stories` passed: 113/113 Storybook export coverage.
  - `npm run check:package` passed: publint, arethetypeswrong, size-limit, and docs gate.
- Second feedback pass deploy/browser smoke:
  - `npx react-doctor@latest --verbose --scope changed` exited 0; diagnostics JSON was empty, with reported changed-scope score 87/100.
  - In-app Browser production preview at 390 by 844 rendered without `MOCK`, without inline filter rows, with one search field and a filter sheet. Selecting `Лес` filtered to forest cards and reset restored the feed.
  - `just deploy-trailhead-demo` rebuilt and synced the static build to `visitka`.
  - Public smoke returned `200` for `https://201-51-25-123.sslip.io/trailhead/`, `200` for the new JS asset, `200` for `/trailhead/tonconnect-manifest.json`, `401` for unauthenticated `POST /api/trailhead/invoice`, and `200` with a `t.me` invoice host for a freshly signed authenticated invoice request.
  - In-app Browser smoke against the deployed URL rendered the app without `MOCK`, with `feed-filter-open`, `feed-search`, and no `feed-categories`.
- Third feedback pass verification:
  - `npm run typecheck` in `examples/trailhead` passed.
  - `npm run test -- --run src/features/trips/useCheckIn.test.tsx` in `examples/trailhead` passed: 1 file, 3 tests.
  - `npm run test -w tg-mini-app-uikit -- --run test/telegram-capabilities.test.tsx test/m6-nav.test.tsx test/layout-reorg.test.tsx` passed: 3 files, 48 tests.
  - `npx playwright test examples/trailhead/e2e/booking.spec.ts examples/trailhead/e2e/checkin.spec.ts examples/trailhead/e2e/shell.spec.ts examples/trailhead/e2e/telegram-bridge.spec.ts` passed: 15 tests.
  - `npm run build` at repo root passed for `tg-mini-app-uikit`.
  - `npm run build` in `examples/trailhead` passed.
  - Headless Chrome visual smoke at 390 by 844 confirmed focused search retained 8 route cards and a full `Отмена` action; check-in showed a compact 123px `Подтверждено` status pill, hidden tabbar parent, and the demo check-in card.
  - `just deploy-trailhead-demo` passed from `/Users/nikitakocnev/IdeaProjects/my-work-bot/my-work-bot`; it built Trailhead with `--base=/trailhead/`, synced `dist` to `visitka:/opt/visitka/trailhead-dist/`, and confirmed `visitka-caddy-1` running.
  - Public smoke returned `HTTP/2 200` for `https://201-51-25-123.sslip.io/trailhead/` and served the new `/trailhead/assets/index-BxvSsXHW.js` asset.
  - Headless Chrome smoke against `https://201-51-25-123.sslip.io/trailhead/?fast=1&lang=ru` confirmed production render without `MOCK`, focused search retained 8 cards with full `Отмена`, and check-in hid the tabbar parent while showing the compact status and demo card.
- Fourth feedback pass verification:
  - `npm run test -w tg-mini-app-uikit -- --run test/m4-forms.test.tsx` passed: 1 file, 41 tests.
  - `npx playwright test examples/trailhead/e2e/booking.spec.ts -g "cancelled Stars|stored PIN|keyboard overlaps"` passed: 3 tests.
  - `npm run test -w tg-mini-app-uikit -- --run test/m4-forms.test.tsx test/telegram-capabilities.test.tsx test/m6-nav.test.tsx test/layout-reorg.test.tsx` passed: 4 files, 89 tests.
  - `npx playwright test examples/trailhead/e2e/booking.spec.ts examples/trailhead/e2e/wallet-lab.spec.ts examples/trailhead/e2e/a11y.spec.ts` passed: 17 tests.
  - `npm run typecheck` in `examples/trailhead` passed.
  - `npm run test -w tg-mini-app-uikit -- --run test/coverage-components.test.tsx test/inputs-reorg.test.tsx test/m4-forms.test.tsx` passed: 3 files, 73 tests.
  - `npm run build` at repo root passed for `tg-mini-app-uikit`.
  - `npm run build` in `examples/trailhead` passed.
  - Headless Chrome production-preview smoke at 390 by 844 confirmed the search/filter toolbar idle state, focused icon-only state, sheet-open restored label state, cancelled-Stars demo fallback, and 6-digit stored PIN success.
  - `just deploy-trailhead-demo` passed from `/Users/nikitakocnev/IdeaProjects/my-work-bot/my-work-bot`; it built Trailhead with `--base=/trailhead/`, synced `dist` to `visitka:/opt/visitka/trailhead-dist/`, and confirmed `visitka-caddy-1` running.
  - Public smoke returned `HTTP/2 200` for `https://201-51-25-123.sslip.io/trailhead/` and served `/trailhead/assets/index-B1PdVzCN.js`.
  - Headless Chrome smoke against `https://201-51-25-123.sslip.io/trailhead/?fast=1&lang=ru` confirmed production render without `MOCK`, idle search/filter toolbar, focused icon-only filter state, and restored filter label after opening the sheet.
- Fifth feedback pass local verification:
  - `npm run test -w trailhead` passed: 7 files, 34 tests.
  - `npm run typecheck` in `examples/trailhead` passed.
  - `npm run build` in `examples/trailhead` passed.
  - `npm run test:unit` passed: 47 files, 616 tests.
  - `npm run build` at repo root passed for `tg-mini-app-uikit`.
  - `npm run check:stories` passed: 113/113 Storybook export coverage.
  - `npm run check:package` passed after the CJS full-kit budget was adjusted to `48.2 kB`; ESM and tree-shaking budgets remain under their existing limits.
  - `npx playwright test examples/trailhead/e2e/booking.spec.ts examples/trailhead/e2e/wallet-lab.spec.ts examples/trailhead/e2e/checkin.spec.ts examples/trailhead/e2e/telegram-bridge.spec.ts examples/trailhead/e2e/polish.spec.ts examples/trailhead/e2e/a11y.spec.ts --reporter=line` passed: 28 tests.
  - `npx react-doctor@latest --verbose --scope changed` exited 0 with score 87/100. It reported no changed source files in untracked `examples/trailhead`, which is covered by Trailhead unit, typecheck, build, e2e, and preview smoke.
  - Headless Chrome production-preview smoke at 390 by 844 confirmed the `1 Stars` demo cap row, hidden `summary-pay` while the checkout sheet is open, dynamic PIN dots with no pre-rendered dots, and Trips swipe/pull hints.
  - `just deploy-trailhead-demo` passed from `/Users/nikitakocnev/IdeaProjects/my-work-bot/my-work-bot`; it built Trailhead with `--base=/trailhead/`, synced `dist` to `visitka:/opt/visitka/trailhead-dist/`, and confirmed `visitka-caddy-1` running.
  - Public smoke returned `HTTP/2 200` for `https://201-51-25-123.sslip.io/trailhead/` and `HTTP/2 200` for `/trailhead/assets/index-CIOBpOCG.js`.
  - Unauthenticated `POST /api/trailhead/invoice` with `totalStars: 1` returned `401`, confirming public invoice creation still requires Telegram `initData`.
  - Headless Chrome smoke against `https://201-51-25-123.sslip.io/trailhead/?fast=1&lang=ru` confirmed production render without `MOCK`, the `1 Stars` demo cap row, hidden checkout pay action while the sheet is open, dynamic PIN dots, and Trips gesture hints.
- Sixth feedback pass verification:
  - `npm run test -w tg-mini-app-uikit -- --run test/m3-gestures.test.tsx test/telegram-capabilities.test.tsx` passed: 2 files, 58 tests.
  - `npm run typecheck -w trailhead` passed.
  - `npm run test -w trailhead` passed: 7 files, 34 tests.
  - `npm run build -w trailhead -- --base=/trailhead/` passed and produced `/trailhead/assets/index-DdkZB0Gy.js`.
  - `npx playwright test --project=trailhead examples/trailhead/e2e/checkin.spec.ts examples/trailhead/e2e/booking.spec.ts --reporter=line` passed: 18 tests.
  - `npm run typecheck -w tg-mini-app-uikit` passed.
  - `npm run build -w tg-mini-app-uikit` passed.
  - `npm run check:package` passed: zero runtime dependencies, publint, ATTW, size-limit, and docs gate.
  - `rsync -az --delete examples/trailhead/dist/ visitka:/opt/visitka/trailhead-dist/` completed successfully.
  - `curl -fsS https://201-51-25-123.sslip.io/trailhead/` returned the deployed HTML referencing `/trailhead/assets/index-DdkZB0Gy.js`, and that asset returns `HTTP/2 200`.
  - Public Playwright smoke against `https://201-51-25-123.sslip.io/trailhead/?mock=1&fast=1&lang=ru` passed: onboarding dismissed, Trips opened, `trips-refresh` was aligned with `panel-trips-list`, and the refresh indicator became visible after a pull gesture.
- Seventh feedback pass verification:
  - RED checks reproduced the missing visible pull indicator and raw native MainButton click bypass before the fix.
  - `npm run typecheck -w tg-mini-app-uikit` passed.
  - `npm run test -w tg-mini-app-uikit -- --run test/m3-gestures.test.tsx test/telegram-buttons-events.test.tsx` passed: 2 files, 36 tests.
  - `npm run test -w tg-mini-app-uikit` passed: 47 files, 618 tests.
  - `npm run typecheck -w trailhead` passed.
  - `npm run test -w trailhead` passed: 7 files, 34 tests.
  - `npm run build -w tg-mini-app-uikit` passed.
  - `npm run build -w trailhead -- --base=/trailhead/` passed and produced `/trailhead/assets/index-i-t-ooR-.js`.
  - `npx react-doctor@latest --verbose --scope changed` passed with Trailhead at `100` and no changed-scope findings.
  - `npm run check:stories` passed: 113/113 Storybook export coverage.
  - `npm run check:package` passed: zero runtime dependencies, publint, ATTW, size-limit, and docs gate.
  - `npx playwright test --project=trailhead --reporter=line` passed: 42 tests.
  - `rsync -az --delete examples/trailhead/dist/ visitka:/opt/visitka/trailhead-dist/` completed successfully.
  - `curl -fsS https://201-51-25-123.sslip.io/trailhead/` returned the deployed HTML referencing `/trailhead/assets/index-i-t-ooR-.js`, and that asset returns `HTTP/2 200`.
  - Public Playwright smoke against `https://201-51-25-123.sslip.io/trailhead/?mock=1&fast=1` passed: onboarding dismissed, Trips opened, and the deployed pull-to-refresh indicator measured `38x38`.
  - Draft PR opened: https://github.com/lonmstalker/tg-mini-app-uikit/pull/2.

Remaining blocker: real Telegram visual validation has not been performed by this agent. The deployed URL is now available through the existing bot's `/demo` command and the sent WebApp button, so the remaining manual step is to open Trailhead in Telegram and verify native Main Button, native Back Button, safe areas, haptics, TON wallet modal, and Stars payment UI in the real client.


## Context and Orientation

The repository is an npm workspace for a React and TypeScript Telegram Mini Apps UI kit. The published package source is in `packages/uikit`, and the flagship demo app is in `examples/trailhead`. Trailhead imports `tg-mini-app-uikit` and demonstrates a hiking product with five tabs: Discover, Trips, Train, Guide, and Profile.

A Telegram Mini App is a web application opened inside Telegram's in-app WebView. Telegram exposes a JavaScript bridge at `window.Telegram.WebApp`. The kit wraps this bridge in hooks such as `useMainButton`, `useBackButton`, `useHaptics`, `useSafeArea`, `useViewport`, `useInvoice`, `useCloudStorage`, `useDeviceStorage`, and `useSecureStorage`. The browser mock simulates this bridge so the app can run locally, but the mock is not identical to a real Telegram client.

The files most relevant to this polish pass are:

- `examples/trailhead/src/App.tsx`: app shell, tabbar, per-tab stacks, onboarding anchors.
- `examples/trailhead/src/AppFrame.tsx`: providers, Telegram theme mapping, language and visual preferences.
- `examples/trailhead/src/components/PrimaryAction.tsx`: native Main Button integration and browser fallback.
- `examples/trailhead/src/components/Onboarding.tsx`: first-run welcome and coach marks.
- `examples/trailhead/src/features/discover/Feed.tsx`: Discover feed, filters, search, and custom experience tiles.
- `examples/trailhead/src/features/discover/ExperienceDetail.tsx`: detail page, gallery, stats, guide quote, route, and book action.
- `examples/trailhead/src/features/discover/DateSlot.tsx`: date and time selection.
- `examples/trailhead/src/features/discover/Checkout.tsx`: summary, payment sheet, PIN, invoice, success and error flows.
- `examples/trailhead/src/features/guide/GuideDirectory.tsx`: guide list and long-press action sheet.
- `examples/trailhead/src/features/profile/Profile.tsx`: profile, wallet, settings, and entry to Platform Lab.
- `examples/trailhead/src/features/profile/PlatformLab.tsx`: live theme controls.
- `packages/uikit/src/index.ts` and `packages/uikit/test/__snapshots__/api-surface.test.ts.snap`: source of truth for public `TK*` components and hooks.

Important component and hook vocabulary:

- `TKPage` is the full-height Mini App page wrapper with scroll area, safe-area behavior, and optional header/footer slots.
- `TKTabbar` is the bottom tab navigation.
- `TKNavStack` is the per-tab push navigation stack. It integrates with Telegram Back Button while stack depth is greater than one.
- `TKMainButton` is the DOM fallback for Telegram's native Main Button.
- `TKBottomBar` pins bottom actions inside the app when the native Telegram button is unavailable.
- `TKSheet`, `TKDialog`, and `TKActionSheet` are overlay patterns that intercept back behavior.
- `TKCard`, `TKCardCell`, `TKImage`, `TKImg`, `TKRating`, `TKBadge`, `TKPaymentSummary`, `TKListGroup`, `TKCell`, `TKSegmented`, `TKSlider`, `TKSearch`, `TKSkeletonList`, `TKEmptyState`, and `TKToastProvider` are the reusable kit pieces this work should favor.

The design context for this repository is product UI, not a landing page. The UI should be restrained, compact, task-oriented, Telegram-aware, and built from semantic `--tk-*` tokens. Do not add decorative SaaS hero patterns, nested cards, gradient text, glassmorphism as a default, or broad raw-color styling. Use cards only when they frame a real item or control group.


## Plan of Work

Start by establishing a fresh baseline. Run the demo locally in browser mock mode and capture the same states that were audited: welcome, onboarding coach mark, Discover feed, Experience detail, DateSlot before and after slot selection, Checkout summary, Checkout confirm sheet, Trips, Train, Guide, Profile, Platform Lab, Platform Lab dark, and Discover dark. Then open the same demo in a real Telegram Mini App WebView using the project's normal bot/deployment/tunnel workflow. If there is no stable Telegram URL yet, create a temporary HTTPS preview URL for the Vite app and configure the Telegram bot's Mini App URL for that preview. Do not mark the plan complete until a real Telegram client has been used for the final visual pass.

Polish the first-run welcome. In `examples/trailhead/src/components/Onboarding.tsx`, replace the custom fixed welcome dialog structure with a kit-consistent sheet-like layout or a `TKSheet` if it fits the first-run flow. The title must not clip at 320px, 360px, or 390px. The copy and CTA should remain focused: Trailhead lets the user book guided hikes, pay in Telegram Stars, and check in on the trail. Keep safe-area padding and avoid oversized decorative media. If the app is running in real Telegram, the welcome must not fight native bottom chrome.

Polish the Discover feed. In `examples/trailhead/src/features/discover/Feed.tsx`, replace the custom `ExperienceTile` layout with a component composition based on the kit's card/cell vocabulary. The target structure is a compact row card: media on the left, title and location in the center, price as a stable trailing or bottom-aligned element, and rating plus review count as one unbroken metadata line. Avoid the current collision where price, numeric rating, dot separator, and review count compete in the same narrow right column. Keep the whole card tappable and accessible, but do not introduce nested interactive controls. If a read-only `TKRating` still renders internal buttons, keep the full-card click target outside that interactive subtree as the current implementation does, or choose a non-interactive rating display if the kit provides one by then.

Tighten the feed's first viewport. The current hero-style `TKBannerCard` dominates the top of Discover and feels closer to a web hero than a Telegram task surface. Keep a promotional entry, but make it smaller and more Telegram-native: either a compact banner with reduced height, or a list-style recommendation cell that opens the signature hike. The filters should read as quick controls, not a large marketing section. Preserve `TKCategoryTabs`, `TKChipGroup`, and `TKSearch`, but tune spacing so at least two complete experience cards are visible on a 390px Telegram viewport after the first-run flow is dismissed.

Improve nested navigation affordances. `TKNavStack` already connects to Telegram's native Back Button, but a browser/mock reviewer cannot see that native button. Add a fallback `TKHeader` or equivalent kit-consistent header only when there is no real Telegram bridge and the active stack depth is greater than one. In real Telegram, do not duplicate the native Back Button with an extra in-app back button unless platform testing proves the native button is not visible in the target client. The acceptance behavior is simple: in Telegram, the native Back Button pops detail/date/checkout/profile-lab screens; in browser mock, a visible header back control does the same.

Compact the booking date flow. In `examples/trailhead/src/features/discover/DateSlot.tsx`, reduce the feeling of a full web form. The default view should show a compact selected-experience summary, quick date choices or a compact calendar surface, time slots, and a single primary continuation action. If a full monthly calendar remains, consider opening it from a sheet or collapsible region rather than consuming most of the first viewport. The user should always see what they are booking and what the current price is before tapping Continue.

Polish Checkout. `examples/trailhead/src/features/discover/Checkout.tsx` already uses a `TKSheet`, `TKPaymentSummary`, haptics, invoice, PIN, toast, and success states. Keep that structure. Improve spacing so the sheet reads like a Telegram confirmation sheet rather than a desktop modal, and ensure the underlying tabbar is visually de-emphasized or safely separated when the sheet is open. In real Telegram, the native Main Button should own the primary pay action; the DOM fallback is only for browser/mock mode.

Separate Platform Lab from the user profile story. `examples/trailhead/src/features/profile/Profile.tsx` currently places Platform Lab beside user settings. That is useful for demonstrating the kit, but confusing as product UX. Either move Platform Lab behind a clearly marked demo/developer section, rename it to make its purpose explicit, or expose it through a Telegram SettingsButton/debug entry when running in demo mode. In `examples/trailhead/src/features/profile/PlatformLab.tsx`, make the reset action footer-aware so it cannot overlap lower controls such as Language, cutouts, or RTL.

Shorten Guide list badges. In `examples/trailhead/src/features/guide/GuideDirectory.tsx`, the "On your Sunrise Ridge trip" badge is too long for a compact row. Replace it with shorter copy such as "Same trip" or move the longer text to the guide profile/detail screen. The guide list should show names and roles without truncation pressure at 390px, and it must still work in Russian where text may be longer.

Check dark theme as a first-class mode. The current dark mode mostly works, but some CTA and metadata colors look like automatic token application rather than deliberate design. Verify contrast for banner CTA, feed price, search placeholder, selected tabs, disabled Main Button, and sheet surfaces. Use semantic tokens and Telegram theme variables instead of raw one-off colors.


## Concrete Steps

Work from the repository root:

    /Users/nikitakocnev/RustroverProjects/tg-mini-app-uikit

Begin with a clean understanding of local state:

    git status --short
    rg --files -g 'plans.md' -g '*plan*.md'

Run the local browser preview:

    npm run dev -w trailhead -- --host 127.0.0.1 --port 5173

Open `http://127.0.0.1:5173/` at 390 by 844, 360 by 780, and 320 by 700. Capture before screenshots for the states listed in `Plan of Work`. If Playwright is used, keep screenshots outside the repository unless the team decides to update snapshot fixtures.

For real Telegram verification, expose the demo through an HTTPS URL suitable for Telegram's WebView. The exact tunnel or deployment method may vary by machine. Record the chosen method in `Decision Log` before using it. The important requirement is that the URL is opened by Telegram as a Mini App, not just by a mobile browser. In that real client, verify native Main Button, native Back Button, theme, haptics, safe area, and keyboard behavior.

Make small, testable edits in this order:

1. First-run welcome.
2. Discover feed cards and banner density.
3. Navigation fallback for browser/mock, while preserving native Back Button in Telegram.
4. DateSlot compactness and booking summary.
5. Checkout sheet spacing and bottom action behavior.
6. Profile and Platform Lab separation.
7. Guide badge copy and row density.
8. Dark theme contrast polish.

After each area, run the narrowest useful tests first. At minimum, run the demo typecheck and relevant e2e specs before broad gates:

    npm run typecheck -w trailhead
    npm run test -w trailhead
    npm run test:e2e -- e2e/demo2.spec.ts
    npm run test:e2e -- examples/trailhead/e2e

If the exact e2e selector changes because the current Playwright config routes specs differently, inspect `playwright.config.ts` and `examples/trailhead/e2e` and run the equivalent Trailhead specs. Do not update visual baselines until the visual difference has been reviewed as intended.

Before completion, run the broad repository gates that are relevant to demo and kit integration:

    npm run typecheck
    npm run test:unit
    npm run build
    npm run check:package
    npm run test:e2e

If these are too broad for an intermediate checkpoint, record what was run in `Progress` and leave the broader gates for final validation. Do not claim completion until final validation has been run or a blocker is explicitly recorded.


## Validation and Acceptance

Acceptance is user-visible. A reviewer should open the demo inside Telegram and be able to complete this flow without visual glitches:

Open the Mini App in Telegram. Dismiss first-run onboarding. On Discover, the welcome state does not clip, the top section feels compact, and at least two trail cards are readable without metadata collisions. Tap Sunrise Ridge. The detail screen opens, back behavior is obvious, and the primary Book action appears in the native Telegram Main Button area. Continue to date and time. The date flow shows the selected hike and price while letting the user pick a time without excessive vertical dead space. Continue to checkout. The payment confirmation sheet uses Telegram-like sheet behavior, does not collide with the tabbar or safe area, and the pay action is native in Telegram. Complete or simulate payment, then verify the booking appears under Trips.

Run the same flow in dark theme. Text, CTA, metadata, disabled states, and selected states must remain readable. The feed price and rating metadata must not collide. The dark Discover banner CTA must pass contrast by inspection and, where automated contrast checks exist, by test.

Run the same critical screens at 320px width in browser mock mode. No heading, button label, tab label, guide badge, price, rating, or primary action may clip or overlap. Long Russian strings must be checked, not assumed.

Native Telegram acceptance must include these observations:

- Main Button appears as Telegram native chrome on Detail, DateSlot, Checkout, and Platform Lab reset where applicable.
- Back Button appears and pops nested screens in real Telegram when stack depth is greater than one.
- Safe areas avoid notches, home indicator, bottom Telegram chrome, and sheet handles.
- Theme follows Telegram light and dark modes.
- Haptics fire on meaningful selection, confirmation, success, and error actions where supported, while no-oping safely outside Telegram.
- Browser/mock mode remains usable and honest, with visible fallback controls and the `MOCK` badge.

Automated gates should be green. If any broad existing gate fails for an unrelated dirty-tree reason, record the command, failure, and why it is unrelated. Then run the narrowest gate that proves the changed behavior.


## Idempotence and Recovery

This work should be additive and reversible. Do not rewrite the app architecture. Do not replace `TKNavStack`, `TKProvider`, `TKTelegramProvider`, or the store. Keep edits scoped to the demo surfaces and only touch `packages/uikit/src` if a reusable component gap or bug blocks a correct demo implementation.

If a visual change causes e2e failures, first determine whether the failure is a legitimate selector/behavior regression, an intended visual update, or a brittle snapshot. Do not regenerate snapshots as a reflex. Fix the UI or test intent first, then update baselines only after review.

If real Telegram testing is blocked by bot configuration or missing HTTPS preview, do not mark the plan complete. Record the blocker in `Progress`, keep browser/mock work separate, and leave the real Telegram validation checkbox unchecked.

If a file already has unrelated user changes, preserve them. Read the file before editing, apply the smallest patch, and do not revert unrelated modifications.

Stop the local dev server after verification unless a user explicitly asks to keep it running.


## Artifacts and Notes

Design audit observations that motivated this plan:

- First-run welcome at 390px clipped the title "Welcome to Trailhead" on the right.
- Discover feed cards showed the trail price, numeric rating, separator, and review count competing in the same right-side area.
- The Discover top banner consumed a large first-viewport area and felt closer to a web hero than a Telegram list surface.
- DateSlot showed a full monthly calendar that dominated the first screen, with no compact selected-hike summary near the bottom action.
- Checkout was functionally strong but needs real Telegram Main Button validation, because browser fallback is not equivalent.
- Guide list rows used a long badge, "On your Sunrise Ridge trip", that squeezed names and roles.
- Profile mixed real user settings with Platform Lab, a developer/demo control surface.
- Platform Lab bottom reset action visually overlapped the lower control area.
- Dark mode worked structurally but needs targeted contrast review for banner CTA, feed metadata, and disabled/selected states.

Relevant public UIKit surface confirmed by source:

- Layout and navigation: `TKPage`, `TKBottomBar`, `TKSafeArea`, `TKTabbar`, `TKNavStack`, `TKNavPanel`, `TKHeader`.
- Cards and display: `TKCard`, `TKCardCell`, `TKBannerCard`, `TKBookingCard`, `TKImage`, `TKImg`, `TKAvatar`, `TKAvatarStack`, `TKBadge`, `TKRating`.
- Forms and controls: `TKSearch`, `TKChipGroup`, `TKSegmented`, `TKSlider`, `TKSwitch`, `TKCalendar`, `TKSlotPicker`, `TKPinInput`.
- Overlays and feedback: `TKSheet`, `TKDialog`, `TKActionSheet`, `TKToastProvider`, `TKEmptyState`, `TKSkeletonList`, `TKSpinner`.
- Telegram hooks: `useMainButton`, `useBackButton`, `useBackIntercept`, `useHaptics`, `useOptionalHaptics`, `useSafeArea`, `useViewport`, `useTelegramTheme`, `useInvoice`, `useClosingConfirmation`, `useHomeScreen`.

OpenAI ExecPlan principles embedded in this file:

- The plan is self-contained and assumes no previous chat.
- The plan produces observable product behavior, not just code changes.
- Progress, discoveries, decisions, and retrospective are living sections.
- Commands and validation are explicit.
- The final acceptance is phrased as what a human can observe in the running system.


## Interfaces and Dependencies

Do not introduce a new UI library. Use `tg-mini-app-uikit` components and hooks first. If a component is missing a small prop needed for a reusable behavior, prefer adding that prop to the kit with tests rather than hardcoding a one-off Trailhead workaround. If the need is specific to the Trailhead demo story, keep it in `examples/trailhead`.

The key demo-level interface is `PrimaryAction` in `examples/trailhead/src/components/PrimaryAction.tsx`. It must continue to provide native `useMainButton` behavior in real Telegram and DOM fallback behavior outside Telegram. Any changes to bottom actions should go through or preserve this abstraction.

The key navigation interface is `TKNavStack` plus `useNav`. Do not create a parallel router for this polish pass. Browser/mock back fallback should read stack state and call `useNav().pop()`; real Telegram should continue to rely on native Back Button integration.

The theme interface is `TKProvider` with `telegram`, `accent`, `roundness`, `motion`, and `fontSize` props in `examples/trailhead/src/AppFrame.tsx`. Preserve Telegram theme synchronization through `useTelegramTheme`. Avoid raw colors except where existing demo data uses stable illustrative hues; even there, prefer mapping into semantic surfaces when practical.

The persistence and language interfaces are the existing store and i18n layers under `examples/trailhead/src/store` and `examples/trailhead/src/i18n`. Do not hardcode user-facing strings. Any new copy must be added to both English and Russian dictionaries and verified in Russian at narrow width.

The external dependency for final validation is a real Telegram client that can open the demo as a Mini App through an HTTPS URL. Browser mock mode is a development dependency, not the final acceptance environment.


## Change Notes

- 2026-06-15 / Codex: Created this root `plans.md` from the design audit, using the OpenAI ExecPlan structure and adding the explicit constraint that the demo must be judged inside a real Telegram Mini App WebView.
