/*
 * Locale switching re-renders the whole page with differently-sized copy
 * (Russian runs ~20% longer), so content above the reader shifts and the
 * viewport lands somewhere else. Wrap the state change with an anchor element
 * whose viewport position must survive the re-render: measure it before,
 * re-measure after React commits, and compensate with an instant scroll.
 *
 * `content-visibility: auto` sections make a single compensation impossible —
 * the browser re-measures off-screen sections at idle time, shifting the page
 * long after the switch. The `data-anchoring` root attribute (see the
 * `:root[data-anchoring]` CSS rules) forces those sections into one
 * synchronous layout for the duration of the swap, so the very first
 * measurement already sees the final geometry.
 */
export function withScrollAnchor(anchor: Element | null | undefined, mutate: () => void): void {
  if (!anchor || typeof window === "undefined") {
    mutate();
    return;
  }
  // Deliberately NEVER removed: re-enabling content-visibility lets the
  // browser re-collapse sections at idle time, shifting the page again long
  // after any settle window. Its benefit (cheap first paint) is already spent
  // by the time the visitor interacts, so the page stays fully laid out for
  // the rest of the session.
  document.documentElement.setAttribute("data-anchoring", "");
  const before = anchor.getBoundingClientRect().top;
  mutate();
  const compensate = () => {
    const delta = anchor.getBoundingClientRect().top - before;
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: "instant" });
  };
  // Seamlessness contract: every correction must land BEFORE the browser
  // paints the shifted frame, or the page visibly blinks.
  // - queueMicrotask runs after React's commit microtask but before paint —
  //   it catches the main re-render.
  // - The rAF loop pins the anchor pre-paint on every subsequent frame for
  //   ~600 ms, absorbing the passive-effect shifts (marquee re-measure etc.)
  //   in the same frame they happen.
  // - The timeouts are the background-tab fallback, where rAF never fires.
  queueMicrotask(compensate);
  const startedAt = performance.now();
  let raf = 0;
  const pin = () => {
    compensate();
    if (performance.now() - startedAt < 600) raf = requestAnimationFrame(pin);
  };
  raf = requestAnimationFrame(pin);
  setTimeout(compensate, 0);
  setTimeout(compensate, 150);
  setTimeout(() => {
    cancelAnimationFrame(raf);
    compensate();
  }, 600);
}

/**
 * Anchor for controls whose own position is viewport-pinned (the sticky
 * header): keep whatever section the visitor is reading at the top of the
 * viewport stable instead of the control itself.
 */
export function readingAnchor(): Element | null {
  if (typeof document === "undefined") return null;
  const probeY = Math.min(120, window.innerHeight / 3);
  return (
    document.elementFromPoint(window.innerWidth / 2, probeY)?.closest("section, footer, header") ?? null
  );
}
