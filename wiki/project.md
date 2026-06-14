# Project — tg-mini-app-uikit


**Summary**: An npm-workspaces monorepo whose one published package is a React UI
kit for Telegram Mini Apps; a flagship demo app and a Karpathy-style wiki sit
alongside it.
**Status**: verified
**Updated**: 2026-06-14

---

## Layout

- Repository root holds `package.json` (`name: tg-mini-app-uikit-workspace`,
  `private`, `workspaces: ["packages/*"]`). The demo adds `"examples/*"`.
- `packages/uikit` — the only published package, npm name `tg-mini-app-uikit`,
  version 0.2.0. See [[telegram-runtime]], [[navstack]], [[i18n]].
- `packages/uikit/storybook` — package-local Storybook for components. Storybook
  is for the kit's components only; the [[trailhead-demo]] app has none.
- `examples/trailhead` — the flagship demo (greenfield; created by the ExecPlan).
- `wiki/` — this knowledge base.
- `trailhead-demo.plan.md` (repository root) — the demo's ExecPlan.
- `plans.md` (repository root) — a one-off audit report, NOT an ExecPlan. It was
  deleted from the working tree (staged `D`); it survives in git history
  (`git show HEAD:plans.md`, last touched in `6aa57cb`). Do not treat it as the plan.

## Build, test, consume

- `npm run build` builds the kit into `packages/uikit/dist` (JS entry +
  `style.css`). Consumers import `tg-mini-app-uikit` and once import
  `tg-mini-app-uikit/style.css`.
- `npm run typecheck`, `npm run test:unit` (vitest), `npm run test:e2e`
  (Playwright), `npm run stories` (Storybook on 6006).
- Node 18+. React 18 or 19 (peer). Zero runtime dependencies beyond React.

## Related

- [[trailhead-demo]] · [[telegram-runtime]] · [[testing-and-review]]

## Sources

- evidence: root `package.json`, `packages/uikit/package.json`.
