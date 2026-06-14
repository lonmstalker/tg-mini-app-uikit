# Goal log (append-only)


One line per goal EVENT. A status change is a NEW line, never an edit of an old
one. Newest at the bottom. `DONE` lines must cite verification evidence (tests
passing, build green, reviewers' claims independently re-verified). Timestamps are
ISO-8601 UTC. Statuses: `OPEN | IN_PROGRESS | BLOCKED | DONE | REVERTED`. Format:

    <ISO-8601 UTC> | <goal-id> | <status> | <goal statement> | evidence: <…>

The goal-id is hierarchical: `G1` is a goal, `G1.M0` a milestone under it. See the
reviewer + verification discipline in [[testing-and-review]] and the rules in
`.claude/agents.md`.

---

- 2026-06-14T21:06Z | G1 | OPEN | Ship the Trailhead flagship demo per trailhead-demo.plan.md (milestones M0–M6), satisfying: no demo Storybook, full ru/en, TDD unit+e2e, per-checkpoint reviewer verification, visual+contrast checks. | evidence: ExecPlan at repo root; requirements set by product owner 2026-06-14.
- 2026-06-14T21:06Z | G1.M0 | OPEN | App shell + per-tab TKNavStack + injected mock + MOCK badge; swipe-back and back-priority proven on placeholder panels. | evidence: gate is shell.spec.ts (red before M0, green after).
- 2026-06-14T21:16Z | G1.plan | DONE | Authored the ExecPlan + Karpathy wiki + .claude/agents.md; folded in the five owner requirements (no demo Storybook, full ru/en, TDD unit+e2e, per-checkpoint reviewer verification, visual+contrast checks). | evidence: a reviewer agent claimed all 5 COVERED + flagged stale present-tense `plans.md` references; independently re-verified via `git status` (`D plans.md`) and `git show HEAD:plans.md` (audit still in history, commit 6aa57cb) and corrected every reference to past/archived; canon order, zero-tables, wiki-link resolution, and tooling-availability checks all green.
