# UIKit Component Reorganization Workflow

## Purpose

This document defines the workflow for using the component plan files in `plans/` to reorganize `packages/uikit/src` into clear reusable UIKit categories:

- tokens: design primitives and semantic CSS contracts;
- atoms: low-level UI elements and form controls;
- composites: reusable composed components, overlays, navigation, feedback, lists, cards, gestures, and layout;
- templates: reusable screen and flow patterns;
- cleanup: files that may be too app-specific, demo-specific, or domain-specific for `src`.

This is the operating plan for future implementation. It is not a record of the harness creation task.

## Harness Contract

The executor must use [harness.md](harness.md) as the source of truth for guardrails. The short version:

- Work from one `components-*.md` file at a time.
- Do not close reviewer-only questions as the implementation author.
- Use `uikit-element-development`, `impeccable`, and `superpowers:test-driven-development` for every source-changing component task.
- Keep every touched source file below 2000 lines.
- Keep `examples/demo` until Storybook and visual evidence have been migrated or replaced.
- Treat public import compatibility as optional, but document every breaking change in API tests, snapshots, docs, stories, and migration notes.

## Component Files

- [components-foundation.md](components-foundation.md): package entrypoints, theme, i18n, Telegram runtime, options, internal helpers.
- [components-tokens.md](components-tokens.md): `tokens.css`, typography, semantic states, spacing, radius, shadow, motion, z-index, breakpoints.
- [components-atoms.md](components-atoms.md): buttons, inputs, controls, icons, primitive display, tappable/link-like elements.
- [components-composites.md](components-composites.md): overlays, forms, cards, lists, navigation, layout, chat, feedback, gestures.
- [components-templates.md](components-templates.md): commerce, wallet, onboarding, dashboard, connector setup, approval/history/error/degraded flows.
- [components-cleanup.md](components-cleanup.md): gamification, demo-only candidates, domain-specific cards, app-specific showcases.

## Per-Component Workflow

For each source entry in a component file:

1. Classify the element.
   Confirm whether the file is a token, atom, composite, template, foundation runtime surface, or cleanup candidate. If the current document category is wrong, update the entry and cross-link the correct document before editing source.

2. Inspect analogs and evidence.
   Read related tests, stories, docs, API snapshots, and closest source analogs listed in the entry. Add missing evidence links before changing implementation.

3. Define the contract.
   Record public/internal status, target category path, exported names, props/types, default behavior, controlled/uncontrolled authority, state transitions, SSR behavior, non-Telegram fallback, Telegram trust boundaries, and breaking-change impact.

4. Write the failing test first.
   Add the narrowest useful test before production changes. Run it and record the expected failure in the entry's TDD checklist.

5. Implement the smallest passing change.
   Move, split, generalize, or delete only the planned surface. Keep behavior covered by the failing test. Do not mix unrelated cleanup.

6. Run focused validation.
   Run the narrow unit/contract/SSR/story/API checks listed in the entry. Update the entry with actual commands and outcomes.

7. Run visual validation for public/visual surfaces.
   Use `impeccable` with `product.md` and `design.md` loaded. Cover light, dark, Telegram theme, narrow/mobile, RTL/locale when relevant, reduced motion, no-overlap, and stable-layout checks.

8. Update docs and stories.
   If the source remains public, ensure Storybook and docs represent the final API. If the source moves to demo-only, ensure equivalent demo/story evidence remains before removing public exports.

9. Request reviewer-subagent review.
   The reviewer-subagent answers each reviewer-only yes/no question with evidence. The implementation author must leave these boxes open.

10. Commit or hand off only after evidence is recorded.
    The component entry must include test evidence, visual evidence where applicable, reviewer answers, known risks, and remaining follow-up before the implementation is considered ready.

## Required Checks By Category

Tokens:

- Verify semantic token names, light/dark mappings, Telegram theme mappings, contrast, reduced motion, and no accidental `--tk-separator` drift away from canonical `--tk-sep`.
- Use `packages/uikit/test/tokens-contract.test.ts` and token visual specs as the first evidence surface.

Atoms:

- Verify accessible names, keyboard use, focus visibility, disabled/loading/error/readonly states, stable sizing, and token-based styles.
- Use interaction tests before visual checks.

Composites:

- Verify focus management, cleanup of listeners/timers/observers, async race behavior, portals, z-index, safe-area behavior, and mobile/narrow layout.
- Use SSR and a11y tests when browser globals, overlays, or Telegram runtime are involved.

Templates:

- Verify the pattern is reusable and not a hidden app flow.
- Keep app data, network assumptions, and demo-only state out of package source.

Cleanup:

- Prove the candidate is app-specific or demo-specific before removal.
- Preserve or replace tests, stories, docs, and visual evidence before public exports are deleted.

## Reviewer-Only Questions

Every component entry keeps these questions open until a reviewer-subagent answers them:

- Code: does the implementation match the planned API and category boundary?
- Visual: does the visual result pass `impeccable` review and local visual evidence?
- Performance: does it avoid avoidable re-renders, layout work, timers, and bundle growth?
- Logic: are state transitions, async behavior, cleanup, and fallbacks correct?
- Category fit: does the file belong in this category after reorganization?
- Src purity: is `src` free from app-specific or demo-only behavior for this element?
- Test adequacy: did tests fail first and then cover the accepted behavior?

Reviewer answers must be `Да` or `Нет` with evidence. Author answers are invalid.

## Validation Loop

Run these after every component-plan update:

```bash
find plans -type f | sort
rg -n "Reviewer-only" plans
git diff --stat -- plans
git status --short
```

Run these before claiming implementation readiness for any source-changing slice:

```bash
npm run typecheck
npm run test:unit
npm run check:stories
npm run build -w tg-mini-app-uikit
npm run stories:build -w tg-mini-app-uikit-demo
npm run check:package
```

Run e2e or visual suites only when the touched slice affects browser behavior, public visuals, Telegram runtime, layout, motion, accessibility, or demo/story evidence.

## Current Known Constraints

- The repo may have unrelated dirty changes. Do not revert or stage unrelated files.
- Storybook evidence currently lives in `examples/demo/stories`.
- The demo workspace is still an evidence surface and must not be deleted opportunistically.
- Existing component source files were below 2000 lines during the initial inventory; keep checking this before and after future source edits.
