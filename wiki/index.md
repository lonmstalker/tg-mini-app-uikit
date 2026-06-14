# Project wiki — index


This is a Karpathy-style LLM wiki: a directory of plain-markdown pages that the
coding agent owns and maintains as the project's durable, compounding knowledge
base. Instead of re-deriving the same facts every session, the agent reads the
relevant pages first and records verified facts here afterward.

The rules that govern this wiki live in [`.claude/agents.md`](../.claude/agents.md).
Read them before editing anything here. In short: one concept per page, link
related pages with `[[double-brackets]]`, flag contradictions instead of silently
overwriting, and never rewrite the append-only logs.


## Entity pages

- [[project]] — the repository at a glance: monorepo layout, the kit, the demo, where plans and this wiki live.
- [[trailhead-demo]] — the flagship demo Mini App (Trailhead): architecture, signature chain, milestones, where the ExecPlan is.
- [[telegram-runtime]] — the Telegram WebApp layer: provider, injectable mock, back-button arbitration, vertical-swipe guard.
- [[navstack]] — the `TKNavStack` swipe-back navigation spine, the kit's headline differentiator.
- [[i18n]] — localization: the kit's `TKLocale`/`TKLocaleProvider` and the demo's full Russian + English policy.
- [[testing-and-review]] — TDD (unit + e2e), visual + contrast verification, and the per-checkpoint reviewer-agent protocol.


## Logs (append-only — never edit a past line)

- [`log.md`](log.md) — every wiki operation (create/update), newest at the bottom.
- [`goals.log.md`](goals.log.md) — every goal/milestone and each status change, with verified outcomes.
