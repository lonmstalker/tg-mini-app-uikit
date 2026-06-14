import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
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
  /** Viewport height, px. */
  height: number;
  renderItem: (item: T, index: number) => ReactNode;
  /** Extra rows rendered above/below the viewport (default 6). */
  overscan?: number;
  testId?: string;
  style?: CSSProperties;
}

/**
 * Windowed list for weak WebViews: renders only the visible rows plus
 * overscan. Fixed row height in this first iteration (see plans.md M11 for
 * the variable-height candidate).
 */
function TKVirtualListImpl<T>(
  { items, itemHeight, height, renderItem, overscan = 6, testId, style }: TKVirtualListProps<T>,
  ref: Ref<TKVirtualListHandle>,
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewport, setViewport] = useState(height);
  const scrollTopRef = useRef(0);
  const firstRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index: number) => {
        const node = scrollRef.current;
        if (node) node.scrollTop = index * itemHeight;
      },
    }),
    [itemHeight],
  );

  // Keep the rendered window in sync when the container is resized.
  useEffect(() => {
    setViewport(height);
    const node = scrollRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.height;
      if (typeof next === "number") setViewport(next);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [height]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null && typeof cancelAnimationFrame !== "undefined") {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Re-render only when the rendered window actually shifts, and at most once
  // per frame. Leading edge so the first scroll of a burst lands immediately;
  // a trailing frame catches the final resting position.
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
  firstRef.current = first;
  const visible = Math.ceil(viewport / itemHeight) + 1 + overscan * 2;
  const end = Math.min(items.length, first + visible);
  const slice = items.slice(first, end);
  return (
    <div
      ref={scrollRef}
      data-testid={testId}
      tabIndex={0}
      onScroll={(e) => onScroll(e.currentTarget.scrollTop)}
      style={{ height, overflowY: "auto", WebkitOverflowScrolling: "touch", position: "relative", ...style }}
    >
      <div style={{ height: items.length * itemHeight, position: "relative" }}>
        {slice.map((item, i) => (
          <div
            key={first + i}
            style={{ position: "absolute", top: (first + i) * itemHeight, left: 0, right: 0, height: itemHeight }}
          >
            {renderItem(item, first + i)}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Windowed list; pass a ref to access `scrollToIndex`. */
export const TKVirtualList = /* @__PURE__ */ forwardRef(TKVirtualListImpl) as <T>(
  props: TKVirtualListProps<T> & { ref?: Ref<TKVirtualListHandle> },
) => ReactElement;
