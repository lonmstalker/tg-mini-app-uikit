import { useEffect, useState } from "react";

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
 * overlay closes, so it can never drift upward across a session.
 */

// Mirrors `--tk-z-overlay`; the first overlay keeps the historical 10/11 pair.
const TK_LAYER_BASE = 10;
const TK_LAYER_STEP = 2;

let tkActiveLayers = 0;
let tkTopLayer = 0;

export interface TKOverlayLayer {
  /** z-index for this overlay's scrim. */
  scrimZ: number;
  /** z-index for this overlay's panel (one above its scrim). */
  panelZ: number;
}

/**
 * Returns the z-index pair for an overlay that is mounted while `active` is
 * true. Until the mount effect assigns a slot the overlay behaves like the
 * first layer, so a lone overlay matches the historical z-index exactly.
 */
export function useOverlayLayer(active: boolean): TKOverlayLayer {
  const [level, setLevel] = useState(0);
  useEffect(() => {
    if (!active) return;
    tkActiveLayers += 1;
    const assigned = ++tkTopLayer;
    setLevel(assigned);
    return () => {
      tkActiveLayers -= 1;
      if (tkActiveLayers <= 0) {
        tkActiveLayers = 0;
        tkTopLayer = 0;
      }
    };
  }, [active]);
  const slot = Math.max(level, 1);
  const base = TK_LAYER_BASE + (slot - 1) * TK_LAYER_STEP;
  return { scrimZ: base, panelZ: base + 1 };
}
