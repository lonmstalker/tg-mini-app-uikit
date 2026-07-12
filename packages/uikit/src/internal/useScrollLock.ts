import { useEffect } from "react";
import { tkSharedState } from "./registry";

/*
 * Body scroll lock shared by the modal overlays (TKSheet, TKDialog,
 * TKActionSheet). Uses REFERENCE COUNTING so stacked overlays keep the page
 * locked until the last one releases, and pins the body with `position: fixed`
 * + a negative `top` so iOS does not rubber-band the background behind the
 * scrim. The scroll position is restored on the final unlock. SSR-safe: a no-op
 * until a DOM is present. The counter lives on the shared globalThis registry
 * so duplicate package copies share one lock (INT-005).
 */

interface PrevBody {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  overflow: string;
}

interface ScrollLockState {
  count: number;
  scrollY: number;
  prevBody: PrevBody | null;
}

const state = () => tkSharedState<ScrollLockState>("scrollLock", () => ({ count: 0, scrollY: 0, prevBody: null }));

function tkAcquireScrollLock() {
  if (typeof document === "undefined") return;
  const s = state();
  if (++s.count > 1) return; // already locked by an outer overlay
  const body = document.body;
  s.scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  s.prevBody = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    overflow: body.style.overflow,
  };
  // pin the body in place — `position: fixed` also stops iOS rubber-banding
  // the background through the scrim's touchmove
  body.style.position = "fixed";
  body.style.top = `-${s.scrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
}

function tkReleaseScrollLock() {
  if (typeof document === "undefined") return;
  const s = state();
  if (s.count <= 0) {
    // Hard floor: a duplicated/skipped cleanup must never drive the count
    // negative (which would later leave the body pinned). Surface it in dev.
    s.count = 0;
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("useScrollLock: release called with no active lock — check for a duplicated cleanup.");
    }
    return;
  }
  if (--s.count > 0) return; // an outer overlay is still open
  const body = document.body;
  if (s.prevBody) {
    body.style.position = s.prevBody.position;
    body.style.top = s.prevBody.top;
    body.style.left = s.prevBody.left;
    body.style.right = s.prevBody.right;
    body.style.width = s.prevBody.width;
    body.style.overflow = s.prevBody.overflow;
    s.prevBody = null;
  }
  // restore the scroll position the body was pinned at
  window.scrollTo(0, s.scrollY);
}

/**
 * Locks page scroll while `active` is true. Reference-counted across overlays
 * and always released on cleanup, even if the component unmounts while open.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    tkAcquireScrollLock();
    return () => tkReleaseScrollLock();
  }, [active]);
}
