---
"tg-mini-app-uikit": patch
---

Derived ink colors (`--tk-accent-ink`, `--tk-red-ink`, `--tk-green-ink`, `--tk-orange-ink`) now recompute on every provider instead of only the outermost one — a nested `TKProvider` with its own theme (e.g. a light preview inside a dark page) no longer inherits the outer theme's unreadable mixes.
