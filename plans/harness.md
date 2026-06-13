# Plans Harness

## Purpose

This harness governs the future reorganization of `packages/uikit/src` into tokens, atoms, composites, templates, and cleanup candidates. It is documentation-only for this task. Future implementation work must update these files as a living execution record before touching source.

## Scope Guard

- Source reorganization tasks are governed by `plans/**`.
- Do not move components, edit tests, update snapshots, or modify package exports while creating this harness.
- Future execution may change `packages/uikit/src`, `packages/uikit/test`, `packages/uikit/storybook`, `docs/site/pages`, and e2e specs only when a checked task in `plans/plan.md` explicitly calls for it.
- `examples` is not an evidence surface. Storybook evidence must live inside the package under `packages/uikit/storybook/<category>`; atoms use `packages/uikit/storybook/atoms`.
- Old source deep-path import surfaces must not be preserved. Every breaking change must update API tests, API snapshots, docs, and the relevant component plan entry.
- Every source-changing element slice must add or update all three artifacts before it can be marked implemented: unit test, Storybook story, and e2e test.

## Required Skills

Future component work must use these skills in this order:

1. `uikit-element-development`: classify the element, inspect analogs, define API, use tokens, protect Telegram runtime, add tests, add stories/docs, validate.
2. `impeccable`: run visual/product UI review for every visual or public surface.
3. `superpowers:test-driven-development`: apply RED, verified FAIL, GREEN, refactor for every component, hook, token contract, and behavior change.

Before future visual work, run the `impeccable` context loader and consume the full output. The repository now has `product.md` and `design.md` at the root for that preflight. If either file is missing, empty, or placeholder-like in a later checkout, visual work is blocked until the user either restores product/design context or explicitly approves a fallback.

## TDD Rule

For every source-changing component task:

1. Write the narrow failing test first.
2. Run the narrow command and record the expected failure.
3. Implement the smallest code change that can pass.
4. Run the narrow command and record the pass.
5. Run the category regression command.
6. Add or update the element Storybook entry under `packages/uikit/storybook/<category>`.
7. Add or update the element e2e coverage that exercises the Storybook story or the production surface.
8. Refactor only while tests stay green.

Documentation-only edits such as this harness do not require RED/GREEN production-code cycles, but they must still be verified with doc-specific commands.

## Reviewer Boundary

The author of source changes must not close reviewer-only questions. Only a separate reviewer-subagent can mark a reviewer question as `Да` or `Нет`, and every mark must include evidence: command, screenshot, diff reference, or file link.

Reviewer-only questions must stay unmarked in author-authored component plans:

```markdown
- Code: [ ] Да [ ] Нет - Does the implementation match the planned API and category boundary?
```

## File Size Rule

Every touched source or component file must stay below 2000 lines. Before and after future implementation, run:

```bash
find packages/uikit/src -type f -exec wc -l {} + | sort -n
```

If a touched file would exceed 2000 lines, split it by responsibility before continuing.

## Standard Component Entry

Every source entry in `components-*.md` must keep this shape:

```markdown
### `path/to/file`

- Source: `path/to/file`
- Category: token | foundation | atom | composite | template | cleanup
- Related tests: `path` or `None found in current inventory`
- Related stories: `path` or `None found in current inventory`
- Related docs: `path` or `None found in current inventory`
- Current status: keep | move | split | delete | demo-only candidate | needs reviewer
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Artifact checklist: [ ] unit test [ ] Storybook [ ] e2e test
- Reviewer-only yes/no questions:
  - Code: [ ] Да [ ] Нет - Does the implementation match the planned API and category boundary?
  - Visual: [ ] Да [ ] Нет - Does the visual result pass `impeccable` review and local visual evidence?
  - Performance: [ ] Да [ ] Нет - Does it avoid avoidable re-renders, layout work, timers, and bundle growth?
  - Logic: [ ] Да [ ] Нет - Are state transitions, async behavior, cleanup, and fallbacks correct?
  - Category fit: [ ] Да [ ] Нет - Does the file belong in this category after reorganization?
  - Src purity: [ ] Да [ ] Нет - Is `src` free from app-specific or demo-only behavior for this element?
  - Test adequacy: [ ] Да [ ] Нет - Did tests fail first and then cover the accepted behavior?
```

## Validation Commands

After any edit to `plans/**`, run:

```bash
find plans -type f | sort
rg -n "Reviewer-only" plans
git diff --stat -- plans
git status --short
```

Acceptance for this harness task:

- `plans/**` contains the requested files.
- Reviewer-only questions are present and unmarked.
- Answered-reviewer markers and placeholder markers do not appear.
- No implementation refactor started.
