# Quickstart — UIKit Surface Composer (validation guide)

How to run and prove the first increment (US1 + US2). Implementation detail lives in
[plan.md](./plan.md) / [data-model.md](./data-model.md) / [contracts/dom-contract.md](./contracts/dom-contract.md);
tasks come from `/speckit-tasks`. This is a run/validate guide, not a code listing.

## Prerequisites

- Node + npm at the repo's pinned versions; `npm ci` at the repo root (workspaces install).
- The app lives at `examples/surface-composer` (workspace name `surface-composer`),
  dev port **5174**. `examples/trailhead` (port 5173) is untouched.

## Run

```bash
npm run dev -w surface-composer        # Vite dev server → http://127.0.0.1:5174
npm run dev -w surface-composer -- --  # query params: ?lang=ru (RU copy), ?mock=1 (force mock runtime)
```

The default path `/` opens the buyer-first first viewport (US1). Pressing the single
primary action advances to the remix scene (US2).

## Validate (maps to acceptance + success criteria)

### US1 — first launch sells a Mini App outcome

1. Open `/`. Confirm the first viewport shows the buyer promise (`Open. Trust. Order.`), the
   business switcher (shop / booking / wallet / support), the live surface, and one
   `I want this Mini App` action — **no overlap**, **no** token/runtime/recorder/test text,
   **no** build-proof affordance (SC-002).
2. Watch birth: `data-motion-state` advances `seed → rails → assembling → light-sweep → idle`;
   with copy hidden, motion alone reads as system-generated (SC-013).
3. First meaningful touch → `inspector-open`; the inspector opens from the contact point and
   surfaces ≥1 named UIKit proof element; build-proof affordance now present (US1 sc.3).
4. Press the CTA → fragments align toward it (CTA gravity); tap empty space → recognition ring,
   no state change (US1 sc.4–5).

### US2 — one surface speaks many businesses

5. Advance/remix through `shop → booking → wallet → support → community`. Confirm
   `data-business-context` changes in order; the surface morphs in place (no page cross-fade);
   primary action updates with **no layout shift**; tokens / safe-area / theme / runtime marks
   stay anchored (US2 sc.1–2).
6. Resize to 320 / 375 / 430 px and desktop: no overflow, no overlapping controls, shell stays
   a centered TMA surface (SC-006). Check RTL + long Russian labels.

### Cross-cutting

7. Reduced motion (`prefers-reduced-motion: reduce`): static birth + stepped remix substitute;
   **identical recorder events** to the full-motion path (SC-007).
8. Runtime mode label is honest: `native-mirror` / `mock` / `browser-fallback`; no native claim
   when only a fallback exists (SC-008 honesty; full US4 runtime pressure deferred).

## Test gates (must pass from a clean worktree)

```bash
# Surface Composer behaviour, snapshots, reduced-motion, responsive
npx playwright test --project=surface-composer

# Regression: existing demo stays green and unmodified
npx playwright test --project=trailhead

# App + kit health
npm run typecheck -w surface-composer
npm run build -w surface-composer
npm run typecheck            # uikit
npm run check:api            # unchanged baseline — proves no new public exports
npm run check:e2e-count      # FLOOR raised to include the new specs
npx react-doctor@latest --verbose --scope changed

# Refresh visual baselines when intentional
npx playwright test --project=surface-composer --update-snapshots
```

**Done bar** (constitution Quality Gates): the `surface-composer` project passes (behaviour +
visual snapshots at the SC-011 key states + reduced-motion parity + no-overlap matrix), the
`trailhead` suite stays green and unmodified, typecheck/build pass, `check:api` is unchanged
(no new public exports), and responsive + reduced-motion behaviour is proven, not asserted
from memory.
