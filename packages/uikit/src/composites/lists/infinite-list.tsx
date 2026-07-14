import { Children, useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { TKVisuallyHidden } from "../../atoms/service";
import { useTKLocale } from "../../foundation/i18n";

/* ---------------- Infinite list ---------------- */

export interface TKInfiniteListProps {
  children?: ReactNode;
  /**
   * Called when the sentinel becomes visible and `hasMore` is true.
   *
   * Contract: each call MUST make progress — append children, or set `hasMore`
   * false (or, while a page is in flight, set `loading` true). If a call
   * settles with the same child count and `hasMore` still true (e.g. a failed
   * page fetch that neither appended nor cleared `hasMore`), the list treats
   * itself as STALLED and will not auto-retry; it waits until the child count
   * or `hasMore` changes (a consumer-driven retry) before firing again. This
   * is what stops an unbounded retry loop on a page error.
   */
  onLoadMore: () => void;
  hasMore?: boolean;
  /** Skip new requests while a page is in flight; re-checks on release. */
  loading?: boolean;
  /** Custom loader row shown while more content is expected. */
  loader?: ReactNode;
  /** SR announcement while a page loads (default `locale.loadingMore`). */
  loadingLabel?: ReactNode;
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
  loadingLabel,
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
  // Child count captured at the moment of the last fire. If a later settle
  // finds the count unchanged while `hasMore` is still true, the previous
  // onLoadMore made no progress (a stall — e.g. a page error) and we must NOT
  // re-arm and re-fire, or the list spins forever.
  const childCountRef = useRef(0);
  const lastFiredCountRef = useRef(-1);

  const maybeLoad = useCallback(() => {
    if (loadingRef.current || !hasMoreRef.current || firedRef.current) return;
    firedRef.current = true;
    lastFiredCountRef.current = childCountRef.current;
    loadRef.current();
  }, []);

  // Re-arm whenever the appended content changes too, not only on a `loading`
  // transition. Without this, an integrator who never wires the optional
  // `loading` prop and whose page is short enough to leave the sentinel inside
  // the rootMargin would load page 1 and then silently stall: the persistent
  // observer never re-fires for an unchanged "still visible" state.
  const childCount = Children.count(children);
  childCountRef.current = childCount;

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
    // A fire that settled without appending children (and `hasMore` is still
    // true) made no progress: leave the guard armed-shut so a non-advancing
    // onLoadMore can't spin. The next genuine input change (more children, or
    // `hasMore` flipping) re-runs this effect and clears the stall.
    if (firedRef.current && childCount === lastFiredCountRef.current) return;
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

  // Appended rows fade in (opacity-only WAAPI, one batch per loaded page) —
  // new content used to teleport into the list. DOM-count based so it works
  // for any child structure; reduced-motion aware; never touches layout.
  const listRef = useRef<HTMLDivElement>(null);
  const domRowsRef = useRef(0);
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const rows = Array.from(el.children).filter((c) => !c.hasAttribute("data-tk-sentinel")) as HTMLElement[];
    const prev = domRowsRef.current;
    domRowsRef.current = rows.length;
    if (prev === 0 || rows.length <= prev) return; // first page / shrink: nothing to reveal
    if (typeof rows[0]?.animate !== "function") return;
    if (el.closest('.tk[data-tk-motion="off"]')) return;
    if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (const row of rows.slice(prev)) row.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140, easing: "ease-out" });
  });

  const locale = useTKLocale();
  return (
    <div ref={listRef} data-testid={testId} aria-busy={loading || undefined} style={style}>
      {children}
      {hasMore ? (
        <div
          ref={sentinelRef}
          data-tk-sentinel
          role="status"
          aria-live="polite"
          style={{ width: "100%", padding: 12, boxSizing: "border-box" }}
        >
          {/* Announce new-content loading to AT; the skeleton stays decorative (LST-004 / CC-05). */}
          {loading ? <TKVisuallyHidden>{loadingLabel ?? locale.loadingMore}</TKVisuallyHidden> : null}
          <span aria-hidden="true">
            {loader ?? <span className="tk-skel" style={{ display: "block", width: 120, height: 12, borderRadius: 6, margin: "0 auto" }} />}
          </span>
        </div>
      ) : null}
    </div>
  );
}
