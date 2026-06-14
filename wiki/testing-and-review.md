# Testing, visual verification, and reviewer protocol


**Summary**: The demo is built test-first (unit + e2e) with thorough user-scenario
coverage, every checkpoint passes a visual + contrast check, and every checkpoint
ends with independent reviewer agents whose claims are re-verified before anything
is called done.
**Status**: policy set
**Updated**: 2026-06-14

---

## TDD (unit + e2e)

- Red-green-refactor: write a failing test before the implementation, for every
  demo feature and every kit fix the demo forces.
- Unit layer: Vitest + Testing Library in the demo workspace. Targets include the
  store reducer, the mock-API latency/failure behavior, price/discount math, the
  i18n key-parity check, and persistence serialization.
- E2e layer: Playwright. The `webServer` is a top-level config array (Storybook
  entry + a demo `npm run dev -w trailhead` entry); a `trailhead` project sets its
  own `testDir`, `testMatch`, and `baseURL` (the global `testMatch` is
  `**/*.storybook.spec.ts` and would otherwise exclude demo specs).

## User-scenario coverage

Cover happy paths, edge cases, and failure/empty/loading states, in BOTH locales:
feed paging and skeletons; book → pay (Stars) → confetti → persisted; mid-funnel
swipe-back keeps state; biometric-PIN gate; pull-to-refresh without minimizing;
swipe-to-cancel with Undo; QR check-in; wallet connect + 15% discount; Platform Lab
re-skin; close/reopen rehydration; overlay back-priority.

## Visual verification (every checkpoint)

- Placement contract: related controls are where a user expects them (MainButton at
  the bottom, BackButton/header at the top, tabbar at the bottom, checkout reachable
  from the funnel). Assert it, don't assume it.
- No-break-on-action: interactions must not break layout — no horizontal overflow,
  no overlap of fixed chrome, safe areas respected; functionality keeps working.
- Contrast on state-change colors: any action that changes a color (selected,
  active, error, checked-in) must stay contrast-compliant (WCAG AA; axe
  `color-contrast` passes, and an action-driven color asserts a computed contrast
  ratio at or above AA against its background).
- Evidence: Playwright screenshots across {light, dark} × {ru, en} × key states,
  plus the live preview tools.

## Reviewer-agent protocol (do not trust at face value)

- At each checkpoint spawn at least two independent reviewer agents (e.g. a
  code-reviewer and a skeptic told to refute "done").
- Their output is a CLAIM, not a verdict. Re-verify every material claim against
  source, a re-run of the tests/build, and the running app before acting on it.
- Record the goal, the reviewers' findings, the independent re-verification result,
  and the evidence in [`goals.log.md`](goals.log.md) — append-only.

## Related

- [[i18n]] · [[trailhead-demo]] · [[telegram-runtime]]

## Sources

- evidence: `trailhead-demo.plan.md` (Validation and Acceptance); root
  `playwright.config.ts`; kit `vitest` setup.
