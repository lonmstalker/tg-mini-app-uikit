# Trailhead demo


**Summary**: The flagship demo Mini App — an outdoor-adventure product (one
persona, one week) that exercises every distinctive kit capability in its natural
habitat; it is both the README marketing piece and the kit's hardest integration
test.
**Status**: SHIPPED — all milestones M0–M6 built & reviewer-verified
**Updated**: 2026-06-15

> Built: the demo workspace lives at `examples/trailhead` (Vite + React 19 + TS).
> `npm run dev -w trailhead` serves the five real tabs (Discover/Trips/Train/Guide/
> Profile), each owning an independent [[navstack]]. The full signature chain runs in a
> plain browser (book → pay 450 Stars behind a PIN → confetti → QR check-in → reload
> survives), en + ru. 33 unit + 26 e2e green; kit gates + prod-parity build green.
> Per-milestone outcomes in [`goals.log.md`](goals.log.md) (G1 DONE). Run + recording
> script: `examples/trailhead/README.md`. One carryover: a real `/testing` package
> export (kept a documented source alias).

---

## What it is

One product, one persona ("Maya, a weekend hiker"), five tabs, each owning its own
[[navstack]] instance (the tabbar is the lateral switch; each stack is the depth
axis):

- Discover — feed of guided hikes → detail → 3-panel booking funnel → Stars checkout.
- Trips — booking list, pull-to-refresh, swipe actions, QR check-in on the trail.
- Train — weekly streak ring, leaderboard, session-detail push.
- Guide — member directory → profile → DM chat.
- Profile — TON wallet (Trail Pass discount), settings, and Platform Lab live theming.

## Signature chain (the README recording)

Book a hike → pay 450 Telegram Stars behind a biometric PIN (Trail Pass shaves
15%) → confetti → next morning scan the trailhead QR (QR + biometrics + location)
→ card flips to "checked in" → reload → all state survived. No competitor demo
chains Stars + biometrics + QR + persistence in one thread.

## Where the plan is

The full build plan is the ExecPlan at `trailhead-demo.plan.md` (repository root),
written to the OpenAI Codex PLANS.md canon. Milestones M0–M6. Build status and
verified outcomes are tracked in [`goals.log.md`](goals.log.md).

## Hard requirements (from the product owner)

- No Storybook for the demo (Storybook is package-only). See [[project]].
- Full Russian + English, no exceptions. See [[i18n]].
- TDD unit + e2e with thorough user-scenario coverage; per-checkpoint reviewer
  agents whose claims are independently re-verified; visual + contrast checks at
  every checkpoint. See [[testing-and-review]].

## Related

- [[navstack]] · [[telegram-runtime]] · [[i18n]] · [[testing-and-review]] · [[project]]

## Sources

- evidence: `trailhead-demo.plan.md`; kit exports in `packages/uikit/src/index.ts`.
