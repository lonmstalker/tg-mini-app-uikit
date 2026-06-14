import { useEffect } from "react";

/*
 * Body scroll lock shared by the modal overlays (TKSheet, TKDialog,
 * TKActionSheet). Uses module-level REFERENCE COUNTING so stacked overlays
 * keep the page locked until the last one releases, and pins the body with
 * `position: fixed` + a negative `top` so iOS does not rubber-band the
 * background behind the scrim. The scroll position is restored on the final
 * unlock. SSR-safe: a no-op until a DOM is present.
 */

let tkScrollLockCount = 0;
let tkScrollY = 0;
let tkPrevBody: {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  overflow: string;
} | null = null;

function tkAcquireScrollLock() {
  if (typeof document === "undefined") return;
  if (++tkScrollLockCount > 1) return; // already locked by an outer overlay
  const body = document.body;
  tkScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  tkPrevBody = {
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
  body.style.top = `-${tkScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
}

function tkReleaseScrollLock() {
  if (typeof document === "undefined") return;
  if (tkScrollLockCount === 0) return;
  if (--tkScrollLockCount > 0) return; // an outer overlay is still open
  const body = document.body;
  if (tkPrevBody) {
    body.style.position = tkPrevBody.position;
    body.style.top = tkPrevBody.top;
    body.style.left = tkPrevBody.left;
    body.style.right = tkPrevBody.right;
    body.style.width = tkPrevBody.width;
    body.style.overflow = tkPrevBody.overflow;
    tkPrevBody = null;
  }
  // restore the scroll position the body was pinned at
  window.scrollTo(0, tkScrollY);
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
