import { useCallback, useEffect, useRef, useState } from "react";
import { listExperiences, type Experience } from "../../data/mockApi";
import { useLang } from "../../i18n";

export type FeedPhase = "first-loading" | "first-error" | "ready" | "paging" | "page-error";

const dedupe = (list: Experience[]) => {
  const seen = new Set<string>();
  return list.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
};

/**
 * Cursor-paged experience feed with explicit loading / error / paging phases.
 * Guards against the double-fetch (a stale-response `reqId` guard + an
 * `inFlight` latch), so a second `onLoadMore` while a page is in flight — or a
 * language switch mid-request — never duplicates or races items.
 */
export function useExperiences() {
  const { lang } = useLang();
  const [items, setItems] = useState<Experience[]>([]);
  const [cursor, setCursor] = useState<number | null>(0);
  const [phase, setPhase] = useState<FeedPhase>("first-loading");
  const inFlight = useRef(false);
  const reqId = useRef(0);
  const cursorRef = useRef<number | null>(0);
  // Mirror cursor into a ref in an effect (not during render) so the async
  // `loadMore` reads the latest value without a render-phase side effect.
  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  const loadFirst = useCallback(async () => {
    const id = ++reqId.current;
    inFlight.current = true;
    setPhase("first-loading");
    setItems([]);
    setCursor(0);
    try {
      const page = await listExperiences(lang, 0);
      if (id !== reqId.current) return;
      setItems(dedupe(page.items));
      setCursor(page.nextCursor);
      setPhase("ready");
    } catch {
      if (id === reqId.current) setPhase("first-error");
    } finally {
      if (id === reqId.current) inFlight.current = false;
    }
  }, [lang]);

  const loadMore = useCallback(async () => {
    const cur = cursorRef.current;
    if (inFlight.current || cur == null) return;
    const id = ++reqId.current;
    inFlight.current = true;
    setPhase("paging");
    try {
      const page = await listExperiences(lang, cur);
      if (id !== reqId.current) return;
      setItems((prev) => dedupe([...prev, ...page.items]));
      setCursor(page.nextCursor);
      setPhase("ready");
    } catch {
      if (id === reqId.current) setPhase("page-error");
    } finally {
      if (id === reqId.current) inFlight.current = false;
    }
  }, [lang]);

  // (Re)load the first page on mount and whenever the language changes.
  useEffect(() => {
    void loadFirst();
  }, [loadFirst]);

  return {
    items,
    phase,
    hasMore: cursor != null,
    loading: phase === "first-loading" || phase === "paging",
    loadMore,
    retry: loadFirst,
  };
}
