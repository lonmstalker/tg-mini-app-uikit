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
  // React flushes the discrete event's state update synchronously within this
  // task, so a macrotask sees the committed layout. Passive effects (marquee
  // re-measure, announce hooks) can shift it once more a frame later — with
  // content-visibility permanently off the geometry is stable after that, so
  // two trailing passes settle everything. Deliberately NOT rAF: background
  // tabs throttle animation frames indefinitely.
  setTimeout(compensate, 0);
  setTimeout(compensate, 150);
  setTimeout(compensate, 450);
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
