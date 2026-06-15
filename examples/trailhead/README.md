# Trailhead — the flagship Telegram Mini App demo

Trailhead is a believable outdoor-adventure Mini App built entirely on
[`tg-mini-app-uikit`](../../packages/uikit). One product, one persona ("Maya, a
weekend hiker"), five tabs: **book** guided hikes, **pay** in Telegram Stars,
**check in** by QR on the trail, **train** toward a weekly streak, **chat** with a
guide, manage a **TON wallet**, and **re-skin** the whole app live in Platform Lab.

It runs in any desktop browser because it injects a mock Telegram bridge by
default (and shows a "MOCK" badge); opened inside a real Telegram client the same
hooks call the real bridge.

## Run it

```bash
npm install                # from the repo root (creates the workspace symlink)
npm run dev -w trailhead    # serves http://127.0.0.1:5173
```

Useful deep-link params: `?lang=ru` (Russian), `?fast=1` (tiny mock latency, for
demos/e2e), `?fail=1` (feed load fails → error/retry), `?failpay=1` (first Stars
payment is cancelled → checkout error/retry).

## Real Telegram preview

Use this when the demo must be opened as a real Telegram Mini App rather than a
desktop-browser mock. The command starts Vite, exposes it through a temporary
HTTPS `loca.lt` URL, verifies that the URL returns Trailhead, and optionally
updates a bot menu button through the Bot API.

```bash
TELEGRAM_BOT_TOKEN=123:abc \
TELEGRAM_BOT_USERNAME=my_trailhead_bot \
npm run telegram:preview -w trailhead
```

`TELEGRAM_BOT_TOKEN` is optional for tunnel-only verification, but a real Mini
App pass still needs a configured Telegram bot/client. If the token is present,
the script calls `setChatMenuButton` with a `web_app` menu button. Press that
menu button in Telegram, complete the checklist in `../../plans.md`, then stop
the script with `Ctrl-C`.

## The README recording (the ~30s hero)

Record the **signature chain** — it is the one thing a skeptic should watch and
conclude "real apps look like this, and only this kit ships these behaviors":

1. **Browse** — open the app on **Discover**. The feed loads (banner, category
   tabs, difficulty chips, search, infinite list of cards with ratings). Dismiss
   the first-run welcome and breeze past the three coach marks.
2. **Detail** — tap **Sunrise Ridge**. Gallery, guide bio, the route timeline.
3. **Book at depth** — press **Book — 450 Stars** → pick a date and the **7am**
   slot (the 11am slot is sold out and disabled) → **Continue — 450 Stars**.
   *Swipe back from the left edge* to the date/slot panel and forward again — the
   chosen slot survived (the draft lives above the nav stack).
4. **Pay** — on the summary, **Pay 450 Stars** → the snap-point checkout sheet →
   set a PIN (or use the biometric key) → the real Stars invoice round-trips →
   **confetti**, a success toast, and the booking is written to cloud storage.
5. **Wallet discount (optional cutaway)** — in **Profile**, connect the TON wallet
   behind the PIN. The "Trail Pass — 15% off" cell appears, and a fresh booking's
   total drops **450 → 382 Stars** in the summary *and* the pay button.
6. **Arrive** — switch to **Trips**. Pull to refresh. Swipe a booking to reveal
   **Cancel** with an **Undo** toast. Then **Check in** → scan the trailhead QR →
   biometric → location → the card flips to **"Checked in"**.
7. **Persist** — **reload the page**. The booking, the check-in, the streak, the
   wallet and the theme all survived. Nothing required a real Telegram client.

Two short B-roll clips round it out:

- **Swipe-back at depth** — push three panels deep in the booking funnel and
  edge-swipe back, the panel underneath revealed at a parallax offset.
- **Platform Lab** — in Profile → Platform Lab, drag the **radius** slider, flip to
  **dark**, switch the **accent**, toggle **device cutouts** and **RTL** — the
  whole app re-skins live, and the choices persist across a reload.

## What it proves (capability coverage)

Native buttons · safe areas · haptics · closing confirmation · live theme ·
swipe-back navigation at depth · Stars payments · TON wallet (causal discount) ·
calendar/slot/PIN forms · pull-to-refresh & swipe actions & long-press gestures ·
infinite/virtual lists · chat · gamification (streak, leaderboard, confetti) ·
persistence (close/reopen survival) · device APIs (QR, biometrics, location, add
to home) · theming, i18n (full ru/en) and accessibility · onboarding and
loading/empty/error states · snap-point sheets, action sheets, dialogs and toasts.

## Tests

```bash
npm run typecheck -w trailhead     # strict TS
npm run test -w trailhead          # Vitest unit (store, mock API, pricing, i18n, hooks)
npx playwright test --project=trailhead   # e2e (signature chain, a11y, reduced-motion), en + ru
```
