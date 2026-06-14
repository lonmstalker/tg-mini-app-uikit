# Agent rules — project wiki maintenance


This file is the "schema" for a Karpathy-style LLM wiki: it turns a generic coding
agent into a disciplined maintainer of the project's durable knowledge base under
`wiki/`. These rules are binding for any agent (human or AI) working in this
repository.

To make these rules always-on for Claude Code, reference this file from the root
`CLAUDE.md` (Claude Code auto-loads `CLAUDE.md`, not `.claude/agents.md`). Codex
users: reference it from `AGENTS.md`.


## What the wiki is

`wiki/` is a directory of plain-markdown pages the agent owns and maintains as the
project's compounding memory. Unlike a chat or a RAG search, it is pre-compiled,
interlinked knowledge: read it before acting, write verified facts back after.
`wiki/index.md` is the hub. It is distinct from:

- the ExecPlan `trailhead-demo.plan.md` (the live build plan — tasks and status), and
- the cross-session personal memory under the user's `~/.claude/.../memory/`.

Link between them; do not duplicate. Durable project facts go in the wiki; live
build progress goes in the plan and the goal log.


## Read protocol

Before any non-trivial task, read `wiki/index.md` and the entity pages relevant to
the task. Prefer a wiki page over re-deriving a fact from the codebase; if the page
and the code disagree, the code wins — fix the page and flag the contradiction.


## Write protocol (entity pages)

- One concept per page. If a page starts covering two ideas, split it and update
  `wiki/index.md` and `wiki/log.md`.
- Record only VERIFIED, durable facts (things true next month, not this turn's
  scratch). Cite evidence (a `file:line` or a URL) in a `## Sources` section.
- Cross-link related pages with `[[page-slug]]` (the filename without `.md`). A
  link to a page that does not exist yet is fine — it marks a page worth writing.
- Never silently overwrite a conflicting fact. Add a `CONTRADICTION FLAG:` line
  describing the conflict and which source is currently trusted and why.
- Page template:

      # Title
      **Summary**: one sentence.
      **Status**: verified | draft | needs-review
      **Updated**: YYYY-MM-DD
      ---
      ## (sections)
      ## Related
      - [[other-page]]
      ## Sources
      - evidence: file:line or URL

After creating or updating a page, append one line to `wiki/log.md`.


## Append-only logs — never rewrite history

Two logs are append-only. You may ONLY add lines at the bottom. Never edit or
delete a past line; a correction is a NEW line that references the one it corrects.
Timestamps are ISO-8601 UTC (e.g. `2026-06-14T21:06Z`).

`wiki/log.md` — wiki operations:

    <UTC> | <create|update|split|merge|deprecate> | <page(s)> | <summary> | by: <author>

`wiki/goals.log.md` — the goal log (see next section).


## Goal append-log discipline

Every goal and every milestone gets an append-only trail in `wiki/goals.log.md`.

- Open a goal: append an `OPEN` line with a hierarchical id (`G1`, `G1.M0`, …) and
  a one-line goal statement.
- Every status change is a NEW line, never an edit:
  `OPEN → IN_PROGRESS → DONE` (or `BLOCKED`, `REVERTED`).
- A `DONE` line MUST cite verification evidence: tests passing, build green, and —
  where reviewer agents were used — that their claims were independently
  re-verified (see below). "Looks done" is not evidence.
- Line format:

      <UTC> | <goal-id> | <OPEN|IN_PROGRESS|BLOCKED|DONE|REVERTED> | <statement> | evidence: <…>

This log is the project's honest history of intent and outcome. Treat it as
write-once: the value is that a past line is never quietly changed.


## Verification discipline (do not trust agents at face value)

When a reviewer agent (or any sub-agent) reports a finding or a "done", treat it as
a CLAIM, not a verdict. Independently re-verify each material claim against source,
a fresh run of the relevant tests/build, and the running app before acting on it or
recording it as a wiki fact. Record the goal, the reviewers' claims, the
re-verification result, and the evidence in `wiki/goals.log.md`. A fact enters the
wiki only after it survives this check.


## Maintenance cadence

- Start of a task: read the index + relevant pages; open or advance the matching
  goal-log line.
- End of a task or checkpoint: append the goal-log outcome with evidence; update or
  create the entity pages whose facts changed; append to `wiki/log.md`.
- Keep pages tight. Prune or `deprecate` (logged) facts proven wrong.
