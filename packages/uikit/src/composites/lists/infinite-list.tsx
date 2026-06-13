import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/* ---------------- Infinite list ---------------- */

export interface TKInfiniteListProps {
  children?: ReactNode;
  /** Called when the sentinel becomes visible and `hasMore` is true. */
  onLoadMore: () => void;
  hasMore?: boolean;
  /** Custom loader row shown while more content is expected. */
  loader?: ReactNode;
  /** Root margin of the IntersectionObserver (default `240px`). */
  margin?: string;
  testId?: string;
  style?: CSSProperties;
}

/** IntersectionObserver-driven "load more" wrapper for any list. */
export function TKInfiniteList({ children, onLoadMore, hasMore = true, loader, margin = "240px", testId, style }: TKInfiniteListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadRef = useRef(onLoadMore);
  loadRef.current = onLoadMore;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadRef.current();
      },
      { rootMargin: margin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [hasMore, margin]);

  return (
    <div data-testid={testId} style={style}>
      {children}
      {hasMore ? (
        <div ref={sentinelRef} data-tk-sentinel style={{ display: "flex", justifyContent: "center", padding: 12 }}>
          {loader ?? <span className="tk-skel" style={{ width: 120, height: 12, borderRadius: 6 }} />}
        </div>
      ) : null}
    </div>
  );
}
