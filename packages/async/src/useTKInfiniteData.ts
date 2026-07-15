import { useCallback, useEffect, useInsertionEffect, useRef, useState } from "react";
import type { Page } from "./page";

export type TKInfiniteDataPhase = "first-loading" | "first-error" | "ready" | "paging" | "page-error";

export interface TKInfiniteData<T> {
  items: T[];
  phase: TKInfiniteDataPhase;
  /** True while a next page exists (the cursor is not null). */
  hasMore: boolean;
  /** True during the first load or while paging — wire to a sentinel's `loading`. */
  loading: boolean;
  /** Fetch the next page (no-op while in flight or exhausted). */
  loadMore: () => void;
  /** Re-attempt the page that errored (alias of loadMore — same cursor). */
  retryPage: () => void;
  /** Reload from the first page. */
  retry: () => void;
}

export interface UseTKInfiniteDataOptions<T> {
  /** Stable identity per item, used to dedupe across pages (default: none). */
  getKey?: (item: T) => string;
}

/**
 * Cursor-paginated data with explicit loading/error/paging phases and a
 * stale-response guard (a request id) plus an in-flight latch — so a second
 * `loadMore` while a page is in flight, or a `deps` change mid-request, never
 * duplicates or races items. `lang`/locale stays OUT of here: bake it into the
 * caller's `fetchPage` and list it in `deps`, keeping this engine i18n-free.
 *
 * On a page error the cursor does not advance and `phase` becomes `page-error`
 * (with `hasMore` still true): pair it with a UI that stops auto-loading and
 * offers `retryPage`, exactly like `TKInfiniteList`'s stall contract.
 */
export function useTKInfiniteData<T>(
  fetchPage: (cursor: number) => Promise<Page<T>>,
  deps: unknown[],
  options: UseTKInfiniteDataOptions<T> = {},
): TKInfiniteData<T> {
  const { getKey } = options;
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<number | null>(0);
  const [phase, setPhase] = useState<TKInfiniteDataPhase>("first-loading");
  const inFlight = useRef(false);
  const reqId = useRef(0);
  const cursorRef = useRef<number | null>(0);
  const fetchRef = useRef(fetchPage);
  // Read `fetchPage`/`getKey` through refs so an inline callback (a fresh
  // identity every render — the common case) does NOT re-create `loadFirst`
  // and re-trigger the mount effect in a loop. `deps` is the explicit re-fetch
  // trigger; identity churn must never be.
  const getKeyRef = useRef(getKey);
  useInsertionEffect(() => {
    fetchRef.current = fetchPage;
    getKeyRef.current = getKey;
  });
  // Mirror cursor into a ref (in an effect, not during render) so async
  // `loadMore` reads the latest value without a render-phase side effect.
  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  const dedupe = useCallback((list: T[]): T[] => {
    const getKeyFn = getKeyRef.current;
    if (!getKeyFn) return list;
    const seen = new Set<string>();
    return list.filter((it) => {
      const k = getKeyFn(it);
      return seen.has(k) ? false : (seen.add(k), true);
    });
  }, []);

  const loadFirst = useCallback(async () => {
    const id = ++reqId.current;
    inFlight.current = true;
    setPhase("first-loading");
    setItems([]);
    setCursor(0);
    try {
      const page = await fetchRef.current(0);
      if (id !== reqId.current) return;
      setItems(dedupe(page.items));
      setCursor(page.nextCursor);
      setPhase("ready");
    } catch {
      if (id === reqId.current) setPhase("first-error");
    } finally {
      if (id === reqId.current) inFlight.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dedupe, ...deps]);

  const loadMore = useCallback(async () => {
    const cur = cursorRef.current;
    if (inFlight.current || cur == null) return;
    const id = ++reqId.current;
    inFlight.current = true;
    setPhase("paging");
    try {
      const page = await fetchRef.current(cur);
      if (id !== reqId.current) return;
      setItems((prev) => dedupe([...prev, ...page.items]));
      setCursor(page.nextCursor);
      setPhase("ready");
    } catch {
      if (id === reqId.current) setPhase("page-error");
    } finally {
      if (id === reqId.current) inFlight.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dedupe, ...deps]);

  // (Re)load the first page on mount and whenever `deps` change.
  useEffect(() => {
    void loadFirst();
  }, [loadFirst]);

  return {
    items,
    phase,
    hasMore: cursor != null,
    loading: phase === "first-loading" || phase === "paging",
    loadMore,
    retryPage: loadMore,
    retry: loadFirst,
  };
}
