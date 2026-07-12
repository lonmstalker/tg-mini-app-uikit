import { useRef, useState } from "react";
import { tkZIndex } from "./dom";
import { tkSharedState } from "./registry";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/*
 * Stacking-order manager for the modal overlays (TKSheet, TKDialog,
 * TKActionSheet). Each open overlay claims an incrementing level so a
 * later-opened overlay — both its scrim AND its panel — always renders above an
 * earlier one. Without it every scrim shares a single z-index (`--tk-z-overlay`)
 * while panels share another (`--tk-z-sheet`/`--tk-z-dialog`), so a second
 * overlay's scrim fails to cover the first overlay's panel and the one beneath
 * shows through.
 *
 * The levels live below `--tk-z-toast`/`--tk-z-tooltip`/`--tk-z-popper` (raised
 * far above this band in tokens.css) so toasts, tooltips and anchored poppers
 * still float over every modal. The counter resets to zero once the last
 * overlay closes, so it can never drift upward across a session. State lives on
 * the shared globalThis registry (INT-005) and the slot is claimed in a layout
 * effect (INT-006) so the first painted frame already has the correct z.
 */

// Mirrors `--tk-z-overlay`; the first overlay keeps the historical 10/11 pair.
const TK_LAYER_BASE = tkZIndex("overlay");
const TK_LAYER_STEP = 2;

interface OverlayLayerState {
  active: number;
  top: number;
}

export interface TKOverlayLayer {
  /** z-index for this overlay's scrim. */
  scrimZ: number;
  /** z-index for this overlay's panel (one above its scrim). */
  panelZ: number;
}

/**
 * Returns the z-index pair for an overlay that is mounted while `active` is
 * true. Until the layout effect assigns a slot the overlay behaves like the
 * first layer, so a lone overlay matches the historical z-index exactly.
 */
export function useOverlayLayer(active: boolean): TKOverlayLayer {
  const [level, setLevel] = useState(0);
  // Slot held by THIS instance — reused across a StrictMode double-invoke so the
  // re-mount does not claim a fresh (higher) slot and inflate z (INT-006).
  const slotRef = useRef(0);
  useIsomorphicLayoutEffect(() => {
    if (!active) return;
    const s = tkSharedState<OverlayLayerState>("overlay", () => ({ active: 0, top: 0 }));
    s.active += 1;
    if (slotRef.current === 0) slotRef.current = ++s.top;
    setLevel(slotRef.current);
    return () => {
      s.active -= 1;
      if (s.active <= 0) {
        s.active = 0;
        s.top = 0;
        slotRef.current = 0;
      }
    };
  }, [active]);
  const slot = Math.max(level, 1);
  const base = TK_LAYER_BASE + (slot - 1) * TK_LAYER_STEP;
  return { scrimZ: base, panelZ: base + 1 };
}
