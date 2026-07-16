import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useInsertionEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";

/* ---------------- Virtual list (fixed row height) ---------------- */

export interface TKVirtualListHandle {
  /** Scroll the viewport so row `index` sits at the top. */
  scrollToIndex: (index: number) => void;
}

export interface TKVirtualListProps<T> {
  items: T[];
  /** Fixed row height, px. */
  itemHeight: number;
  /**
   * Viewport height (px or CSS length). Omit to fill the parent (`100%`) — but
   * then the PARENT must have a resolved height (e.g. a flex child with
   * `minHeight:0`), or `100%` collapses to 0 and the list shows nothing.
   */
  height?: number | string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Stable row key by item identity; defaults to the absolute index (LST-DX-003). */
  getKey?: (item: T, index: number) => string | number;
  /** Extra rows rendered above/below the viewport (default 6). */
  overscan?: number;
  /**
   * Window/scroll-parent mode (LST-001): instead of owning a fixed-height inner
   * scroller, the list flows inline and windows against an ancestor's scroll —
   * `"window"` for the page, or a ref to a scrollable ancestor. `height` is then
   * ignored. Use this when the list lives inside a page-level scroller.
   */
  scrollParent?: "window" | RefObject<HTMLElement | null>;
  /**
   * Accessible name for the scrollable region (fixed-height mode). The scroller
   * is keyboard-focusable so keyboard users can scroll it; naming it tells them
   * what the region contains.
   */
  "aria-label"?: string;
  testId?: string;
  style?: CSSProperties;
}

/**
 * Windowed list for weak WebViews: renders only the visible rows plus
 * overscan. Fixed row height in this first iteration (see M11 in the archived plan, `git show 6aa57cb:plans.md`, for
 * the variable-height candidate).
 */
function TKVirtualListImpl<T>(
  { items, itemHeight, height, renderItem, getKey, overscan = 6, scrollParent, "aria-label": ariaLabel, testId, style }: TKVirtualListProps<T>,
  ref: Ref<TKVirtualListHandle>,
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const windowMode = scrollParent != null;
  const heightStyle = height ?? "100%";
  const initialViewport = typeof height === "number" ? height : 0;
  const [scrollTop, setScrollTop] = useState(0);
  const [viewport, setViewport] = useState(initialViewport);
  const scrollTopRef = useRef(0);
  const firstRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Resolve the scroll ancestor (page or element) into state, re-reading every
  // render so a ref whose `.current` is assigned AFTER mount is still picked up —
  // a plain dep can't watch `ref.current` (LST-001).
  const [parentEl, setParentEl] = useState<HTMLElement | Window | null>(null);
  useEffect(() => {
    const next =
      !windowMode || typeof window === "undefined"
        ? null
        : scrollParent === "window"
          ? window
          : (scrollParent?.current ?? null);
    setParentEl((prev) => (prev === next ? prev : next));
  });

  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index: number) => {
        const node = scrollRef.current;
        if (!node) return;
        const target = Math.max(0, Math.min(index, items.length - 1)) * itemHeight;
        if (!windowMode) {
          node.scrollTop = target;
          return;
        }
        if (parentEl === window) {
          window.scrollTo({ top: node.getBoundingClientRect().top + window.scrollY + target });
        } else if (parentEl) {
          const p = parentEl as HTMLElement;
          p.scrollTop = node.getBoundingClientRect().top - p.getBoundingClientRect().top + p.scrollTop + target;
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemHeight, windowMode, parentEl, items.length],
  );

  // Fixed-height mode: keep the window in sync on container resize.
  useEffect(() => {
    if (windowMode) return;
    const node = scrollRef.current;
    setViewport(typeof height === "number" ? height : (node?.clientHeight ?? 0));
    if (!node || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.height;
      if (typeof next === "number") setViewport(next);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [height, windowMode]);

  // Window/scroll-parent mode: window against the ancestor's scroll offset and
  // the list's own offset within it, instead of owning a scroller (LST-001).
  useEffect(() => {
    if (!parentEl) return;
    const parent = parentEl;
    const measure = () => {
      const node = scrollRef.current;
      if (!node) return;
      let nextViewport: number;
      let nextScrollTop: number;
      if (parent === window) {
        nextViewport = window.innerHeight;
        nextScrollTop = Math.max(0, window.scrollY - (node.getBoundingClientRect().top + window.scrollY));
      } else {
        const p = parent as HTMLElement;
        nextViewport = p.clientHeight;
        const listTop = node.getBoundingClientRect().top - p.getBoundingClientRect().top + p.scrollTop;
        nextScrollTop = Math.max(0, p.scrollTop - listTop);
      }
      setViewport(nextViewport);
      // Only re-render when the rendered window actually shifts (weak WebViews).
      const computedFirst = Math.max(0, Math.floor(nextScrollTop / itemHeight) - overscan);
      if (computedFirst !== firstRef.current) setScrollTop(nextScrollTop);
    };
    const onScroll = () => {
      if (typeof requestAnimationFrame === "undefined") return measure();
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        measure();
      });
    };
    measure();
    parent.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // Element scrollers can change height without a window resize (TMA keyboard,
    // flex reflow) — observe the parent itself so the viewport stays correct.
    let ro: ResizeObserver | undefined;
    if (parent !== window && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(onScroll);
      ro.observe(parent as HTMLElement);
    }
    return () => {
      parent.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro?.disconnect();
      if (rafRef.current !== null && typeof cancelAnimationFrame !== "undefined") {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentEl, itemHeight, overscan]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null && typeof cancelAnimationFrame !== "undefined") {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Fixed-mode scroll: re-render only when the window actually shifts, ≤ once per
  // frame (leading edge lands the first scroll immediately, trailing catches rest).
  const sync = (top: number) => {
    const computedFirst = Math.max(0, Math.floor(top / itemHeight) - overscan);
    if (computedFirst !== firstRef.current) setScrollTop(top);
  };

  const onScroll = (next: number) => {
    scrollTopRef.current = next;
    if (typeof requestAnimationFrame === "undefined") {
      sync(next);
      return;
    }
    if (rafRef.current !== null) return;
    sync(next);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      sync(scrollTopRef.current);
    });
  };

  const first = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  // Committed window start, mirrored for the scroll dedupers (render-safe write).
  useInsertionEffect(() => {
    firstRef.current = first;
  });
  const visible = Math.ceil(viewport / itemHeight) + 1 + overscan * 2;
  const end = Math.min(items.length, first + visible);
  const slice = items.slice(first, end);
  const spacer = (
    <div style={{ height: items.length * itemHeight, position: "relative" }}>
      {slice.map((item, i) => (
        <div
          key={getKey ? getKey(item, first + i) : first + i}
          style={{ position: "absolute", top: (first + i) * itemHeight, left: 0, right: 0, height: itemHeight }}
        >
          {renderItem(item, first + i)}
        </div>
      ))}
    </div>
  );

  // Window mode: flow inline (no own scroller); fixed mode: own the scroller.
  return windowMode ? (
    <div ref={scrollRef} data-testid={testId} style={{ position: "relative", ...style }}>
      {spacer}
    </div>
  ) : (
    <div
      ref={scrollRef}
      data-testid={testId}
      // Scrollable-region keyboard access (axe: scrollable-region-focusable):
      // the scroller must be Tab-reachable so keyboard users can arrow/page it.
      // role="region" + aria-label name it; an unnamed region maps to generic,
      // so the role is inert until a consumer passes the label.
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      onScroll={(e) => onScroll(e.currentTarget.scrollTop)}
      style={{ height: heightStyle, overflowY: "auto", WebkitOverflowScrolling: "touch", position: "relative", ...style }}
    >
      {spacer}
    </div>
  );
}

/** Windowed list; pass a ref to access `scrollToIndex`. */
export const TKVirtualList = /* @__PURE__ */ forwardRef(TKVirtualListImpl) as <T>(
  props: TKVirtualListProps<T> & { ref?: Ref<TKVirtualListHandle> },
) => ReactElement;
