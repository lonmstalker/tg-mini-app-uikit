import { useState, type CSSProperties, type ReactNode } from "react";

/* ---------------- Virtual list (fixed row height) ---------------- */

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
export function TKVirtualList<T>({ items, itemHeight, height, renderItem, overscan = 6, testId, style }: TKVirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const first = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visible = Math.ceil(height / itemHeight) + overscan * 2;
  const slice = items.slice(first, first + visible);
  return (
    <div
      data-testid={testId}
      tabIndex={0}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
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
