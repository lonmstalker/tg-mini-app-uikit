# Plans Index

## Purpose

This directory is the execution harness for the `packages/uikit/src` reorganization. It tracks the planned category split, required quality gates, reviewer-only questions, and doc-only task status.

## Documents

- [harness.md](harness.md): required workflow, skill gates, TDD discipline, reviewer boundary, validation commands.
- [plan.md](plan.md): current ExecPlan-style task plan and progress record.
- [components-foundation.md](components-foundation.md): foundation/runtime inventory: theme, i18n, Telegram runtime, internal helpers, package entrypoints.
- [components-tokens.md](components-tokens.md): design primitives: CSS tokens, typography, semantic states, spacing, radius, shadow, motion, z-index, breakpoints.
- [components-atoms.md](components-atoms.md): atoms and UI elements: buttons, inputs, selection controls, icons, badges, primitive display, tappable/link-like elements.
- [components-composites.md](components-composites.md): composed components: overlays, navigation, forms, lists, cards, chat, feedback, gestures, layout.
- [components-templates.md](components-templates.md): reusable page templates and patterns: onboarding, wallet, commerce, dashboard, connector setup, approval/history/error states.
- [components-cleanup.md](components-cleanup.md): cleanup candidates for source purity, including `patterns/gamification`, domain-specific surfaces, and demo-only app showcases.

## Status

- `harness.md`: drafted.
- `plan.md`: drafted.
- `components-foundation.md`: inventory drafted, reviewer questions open.
- `components-tokens.md`: inventory drafted, reviewer questions open.
- `components-atoms.md`: inventory drafted, reviewer questions open.
- `components-composites.md`: inventory drafted, reviewer questions open.
- `components-templates.md`: inventory drafted, reviewer questions open.
- `components-cleanup.md`: candidate inventory drafted, reviewer questions open.

## Update Rules

- Keep this index current whenever a plan file is added, renamed, completed, or blocked.
- Do not mark reviewer-only questions from the authoring session.
- Keep task statuses plain: `drafted`, `in progress`, `blocked`, `reviewed`, `implemented`, `verified`.
- Link every source file entry to tests, stories, and docs when those artifacts exist in the repo.
- Do not remove a source entry just because it is moved later. Update its path and status instead.

## Current Inventory Sources

Inventory was generated from:

- `packages/uikit/src`
- `packages/uikit/test`
- `packages/uikit/storybook`
- `docs/site/pages`
- `e2e`
- `packages/uikit/test/__snapshots__/api-surface.test.ts.snap`

## Validation

For this directory, run:

```bash
find plans -type f | sort
rg -n "Reviewer-only" plans
git diff --stat -- plans
git status --short
```
