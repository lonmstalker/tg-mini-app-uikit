# Surface Composer

The flagship demo that sells the reusable **`tg-mini-app-uikit`**: one continuous,
Telegram-native surface that is _born_ from a single origin point (US1), then
_remixes_ across shop → booking → wallet → support → community without losing
token, safe-area, theme, or runtime continuity (US2). Buyer value leads; the
UIKit proof appears only after a meaningful touch.

This increment ships **US1 + US2** at full fidelity. US3–US6 are specified but
deferred (the scene machine enumerates all six scenes; only the first two render).

> `examples/trailhead` is a separate demo and is **not** touched by this app.

## Run

```bash
npm run dev -w surface-composer          # Vite dev server → http://127.0.0.1:5174
```

Deep-link knobs (read once at startup):

| Param | Effect |
|-------|--------|
| `?lang=ru` / `?lang=en` | Language override (RU exercises long-label / overflow). |
| `?mock=1` / `?mock=0` | Force / disable the injected mock runtime. |
| `?hud=1` | Dev-only recorder HUD on the stage (never in the buyer frame). |
| `?scene=rangeRemix` | Start on the remix scene (settled). |
| `?motion=<state>` `&context=<ctx>` | Freeze a motion frame for snapshotting. |

## What to look for

- **US1** — open `/`: the surface births `seed → rails → assembling → light-sweep → idle`
  from the seed; the first viewport is buyer-only (no token/runtime/recorder/test
  vocabulary, no proof affordance). A first meaningful touch opens the inspector
  (≥1 named UIKit element) and reveals the proof strip. The CTA exhibits gravity.
- **US2** — press the primary action, tap a context chip, or drag horizontally:
  the same surface morphs in place across the five businesses while tokens,
  safe-area, theme, origin, runtime mark, and the primary-action position stay
  anchored.

## Validate (the "done" bar)

```bash
# Surface Composer behaviour + visual snapshots + reduced-motion + responsive
npx playwright test --project=surface-composer
npx playwright test --project=surface-composer --update-snapshots   # refresh baselines

# App + kit health
npm run typecheck -w surface-composer
npm run build -w surface-composer
npm run test -w surface-composer        # demo-only unit logic
npm run check:api                       # unchanged baseline → no new public exports
npm run check:e2e-count                 # FLOOR includes the new specs

# Regression: the other demo stays green and unmodified
npx playwright test --project=trailhead
```

## How it is built

- Composed **only** from existing public `TK*` exports; demo-only helpers (seed,
  rails, contact ring, gravity, inspector via `TKSheet`, recorder HUD) live here
  under `src/` and never leak into the kit (Principle II).
- Every visible effect is a deterministic motion-state transition exposed on the
  surface root `<main>` (`data-scene` / `data-motion-state` / `data-runtime-mode`
  / `data-business-context` / `data-reduced-motion`) plus one recorder event,
  read in tests via `window.__composerRecorder()`.
- Motion animates `transform` / `opacity` / CSS-var interpolation only — no
  layout-property animation, no WebGL. Reduced motion is a designed static path
  that emits the **identical** recorder events.
