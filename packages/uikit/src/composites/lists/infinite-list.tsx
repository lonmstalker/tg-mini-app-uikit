import { Children, useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/* ---------------- Infinite list ---------------- */

export interface TKInfiniteListProps {
  children?: ReactNode;
  /** Called when the sentinel becomes visible and `hasMore` is true. */
  onLoadMore: () => void;
  hasMore?: boolean;
  /** Skip new requests while a page is in flight; re-checks on release. */
  loading?: boolean;
  /** Custom loader row shown while more content is expected. */
  loader?: ReactNode;
  /** Root margin of the IntersectionObserver (default `240px`). */
  margin?: string;
  testId?: string;
  style?: CSSProperties;
}

/** IntersectionObserver-driven "load more" wrapper for any list. */
export function TKInfiniteList({
  children,
  onLoadMore,
  hasMore = true,
  loading = false,
  loader,
  margin = "240px",
  testId,
  style,
}: TKInfiniteListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadRef = useRef(onLoadMore);
  loadRef.current = onLoadMore;
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;
  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  // One load-more per page: set when a load fires, re-armed when the sentinel
  // leaves the viewport or `loading` settles. Without it the two observers
  // below (both seeded on mount with the sentinel already in the 240px margin)
  // each called onLoadMore, double-fetching the first page.
  const firedRef = useRef(false);

  const maybeLoad = useCallback(() => {
    if (loadingRef.current || !hasMoreRef.current || firedRef.current) return;
    firedRef.current = true;
    loadRef.current();
  }, []);

  // Re-arm whenever the appended content changes too, not only on a `loading`
  // transition. Without this, an integrator who never wires the optional
  // `loading` prop and whose page is short enough to leave the sentinel inside
  // the rootMargin would load page 1 and then silently stall: the persistent
  // observer never re-fires for an unchanged "still visible" state.
  const childCount = Children.count(children);

  // Persistent observer for scroll-driven loading. Re-arms the guard whenever
  // the sentinel scrolls out of view so a later re-entry can load again.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry && !entry.isIntersecting) {
          firedRef.current = false;
          return;
        }
        maybeLoad();
      },
      { rootMargin: margin, threshold: 0 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [hasMore, margin, maybeLoad]);

  // When loading settles, re-arm and re-check the CURRENT intersection (a
  // persistent observer wouldn't re-deliver an unchanged "still visible" state),
  // so a short page that leaves the sentinel on screen loads the next one.
  useEffect(() => {
    if (loading || !hasMore) return;
    firedRef.current = false;
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) maybeLoad();
        io.disconnect();
      },
      { rootMargin: margin, threshold: 0 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [loading, hasMore, margin, maybeLoad, childCount]);

  return (
    <div data-testid={testId} style={style}>
      {children}
      {hasMore ? (
        <div ref={sentinelRef} data-tk-sentinel style={{ width: "100%", padding: 12, boxSizing: "border-box" }}>
          {loader ?? <span className="tk-skel" style={{ display: "block", width: 120, height: 12, borderRadius: 6, margin: "0 auto" }} />}
        </div>
      ) : null}
    </div>
  );
}
