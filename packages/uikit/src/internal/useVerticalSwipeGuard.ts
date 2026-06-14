import { useEffect } from "react";
import { useWebApp } from "../foundation/telegram/provider";

/*
 * Suppresses Telegram's native "swipe down to minimize/close the Mini App"
 * gesture while a surface that owns the vertical axis is active — a dragged
 * TKSheet, an in-flight TKPullToRefresh pull, etc. Telegram enables that swipe
 * by default, so without this a downward drag inside an overlay can collapse
 * the whole app instead of doing its own thing.
 *
 * Reference-counted across components like `useScrollLock`, so stacked or
 * concurrent consumers keep the gesture disabled until the last one releases,
 * and the user's prior preference is restored on the final release. SSR-safe
 * and a no-op outside Telegram / on clients without the API.
 */

interface SwipeApi {
  isVerticalSwipesEnabled?: boolean;
  enableVerticalSwipes?: () => unknown;
  disableVerticalSwipes?: () => unknown;
}

let tkSwipeGuardCount = 0;
// The swipe-enabled state captured before the first guard disabled it.
let tkSwipePrevEnabled: boolean | null = null;

function tkAcquireSwipeGuard(wa: SwipeApi | undefined) {
  if (!wa?.disableVerticalSwipes) return;
  if (++tkSwipeGuardCount > 1) return; // an outer guard already disabled it
  tkSwipePrevEnabled = wa.isVerticalSwipesEnabled ?? true;
  try {
    wa.disableVerticalSwipes();
  } catch {
    /* unsupported on this client version */
  }
}

function tkReleaseSwipeGuard(wa: SwipeApi | undefined) {
  if (!wa?.disableVerticalSwipes) return;
  if (tkSwipeGuardCount === 0) return;
  if (--tkSwipeGuardCount > 0) return; // an outer guard is still active
  // Only re-enable when swipes were enabled before we stepped in.
  if (tkSwipePrevEnabled && wa.enableVerticalSwipes) {
    try {
      wa.enableVerticalSwipes();
    } catch {
      /* unsupported on this client version */
    }
  }
  tkSwipePrevEnabled = null;
}

/**
 * Disables the Telegram vertical-swipe gesture while `active` is true.
 * Reference-counted and always released on cleanup.
 */
export function useVerticalSwipeGuard(active: boolean) {
  const wa = useWebApp() as SwipeApi | undefined;
  useEffect(() => {
    if (!active) return;
    tkAcquireSwipeGuard(wa);
    return () => tkReleaseSwipeGuard(wa);
  }, [active, wa]);
}
