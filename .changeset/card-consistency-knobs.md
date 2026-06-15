---
"tg-mini-app-uikit": minor
---

Add card/list consistency knobs so screens stop hand-rolling divergent styles.

- `TKCard` gains `outlined` — one canonical hairline (`.5px var(--tk-sep)`) instead of ad-hoc inline borders.
- `TKAvatar` and `TKBookingCard` gain `shape` / `avatarShape` (`"circle" | "rounded"`) so place/media thumbnails read as rounded squares while people stay circular.
- `TKSwipeCell` gains `radius` — the cell clips its sliding actions with `overflow:hidden`, so wrapping a rounded card needs this to keep the corners (and let a roundness scale show through) instead of clipping them square.

All additive and backward-compatible (defaults preserve prior output).
