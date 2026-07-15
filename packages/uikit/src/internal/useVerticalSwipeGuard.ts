import { useEffect } from "react";
import { useWebApp } from "@tg-mini-app/telegram";
import { tkSharedState } from "./registry";
import { useLatest } from "./useLatest";

/*
 * Suppresses Telegram's native "swipe down to minimize/close the Mini App"
 * gesture while a surface that owns the vertical axis is active — a dragged
 * TKSheet, an in-flight TKPullToRefresh pull, etc. Telegram enables that swipe
 * by default, so without this a downward drag inside an overlay can collapse
 * the whole app instead of doing its own thing.
 *
 * Reference-counted across components like `useScrollLock`, so stacked or
 * concurrent consumers keep the gesture disabled until the last one releases,
 * and the user's prior preference is restored on the final release. The count
 * lives on the shared globalThis registry (INT-005). SSR-safe and a no-op
 * outside Telegram / on clients without the API.
 */

interface SwipeApi {
  isVerticalSwipesEnabled?: boolean;
  enableVerticalSwipes?: () => unknown;
  disableVerticalSwipes?: () => unknown;
}

interface SwipeGuardState {
  count: number;
  // The swipe-enabled state captured before the first guard disabled it.
  prevEnabled: boolean | null;
}

const state = () => tkSharedState<SwipeGuardState>("swipeGuard", () => ({ count: 0, prevEnabled: null }));

function tkAcquireSwipeGuard(wa: SwipeApi | undefined) {
  if (!wa?.disableVerticalSwipes) return;
  const s = state();
  if (++s.count > 1) return; // an outer guard already disabled it
  s.prevEnabled = wa.isVerticalSwipesEnabled ?? true;
  try {
    wa.disableVerticalSwipes();
  } catch {
    /* unsupported on this client version */
  }
}

function tkReleaseSwipeGuard(wa: SwipeApi | undefined) {
  if (!wa?.disableVerticalSwipes) return;
  const s = state();
  if (s.count <= 0) {
    s.count = 0; // hard floor against a duplicated cleanup
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("useVerticalSwipeGuard: release called with no active guard — check for a duplicated cleanup.");
    }
    return;
  }
  if (--s.count > 0) return; // an outer guard is still active
  // Only re-enable when swipes were enabled before we stepped in.
  if (s.prevEnabled && wa.enableVerticalSwipes) {
    try {
      wa.enableVerticalSwipes();
    } catch {
      /* unsupported on this client version */
    }
  }
  s.prevEnabled = null;
}

/**
 * Disables the Telegram vertical-swipe gesture while `active` is true.
 * Reference-counted and always released on cleanup. Reads the latest WebApp from
 * a ref and depends on `active` plus whether the swipe API is available — so a
 * changing `useWebApp()` identity no longer thrashes enable/disable mid-overlay
 * (INT-007), yet a WebApp that resolves AFTER the overlay opened still engages
 * the guard once it becomes available (the startup race a `[active]`-only dep
 * would miss).
 */
export function useVerticalSwipeGuard(active: boolean) {
  const wa = useWebApp() as SwipeApi | undefined;
  const waRef = useLatest(wa);
  const apiReady = typeof wa?.disableVerticalSwipes === "function";
  useEffect(() => {
    if (!active) return;
    tkAcquireSwipeGuard(waRef.current);
    return () => tkReleaseSwipeGuard(waRef.current);
  }, [active, apiReady]);
}
