import { Children, createContext, isValidElement, useContext, useEffect, useRef, type ReactNode } from "react";

/**
 * Keep-mount tab host: visited tabs stay MOUNTED (`display: contents` when
 * active, `display: none` when hidden), so switching back is instant — no data
 * reload, no lost component state (form input values, fetched data, timers).
 * Note the limit: `display: none` destroys layout, so the browser resets the
 * `scrollTop` of any scroller INSIDE a hidden tab — scroll position is not
 * preserved (re-apply it from state if a tab needs that). Unvisited tabs
 * mount lazily on first activation. The nearest `[data-tk-page-scroll]`
 * ancestor (a TKPage scroller) is scrolled back to the top on every switch,
 * matching the remount-era UX.
 *
 * `display: contents` (not a plain block) keeps the active tab's children
 * direct flex items of the TKPage content column, so its `gap` still applies.
 */
export interface TKKeepMountTabsProps {
  /** Id of the visible `TKKeepMountTab`. */
  active: string;
  /** Scroll the enclosing page scroller to the top on tab switch (default true). */
  scrollToTop?: boolean;
  /** Rendered on the ACTIVE tab's wrapper (the only visible one). */
  testId?: string;
  children?: ReactNode;
}

export interface TKKeepMountTabProps {
  id: string;
  children?: ReactNode;
}

/** Declares one tab of a `TKKeepMountTabs`. */
export function TKKeepMountTab({ children }: TKKeepMountTabProps) {
  return <>{children}</>;
}

const TKTabActiveContext = /* @__PURE__ */ createContext(true);

/**
 * True while the enclosing `TKKeepMountTab` is the visible one — gate polling,
 * subscriptions and animations of a kept-mounted but hidden screen with it.
 * Defaults to `true` outside any keep-mount host, so a screen used standalone
 * behaves as always-active.
 */
export function useTabActive(): boolean {
  return useContext(TKTabActiveContext);
}

export function TKKeepMountTabs({ active, scrollToTop = true, testId, children }: TKKeepMountTabsProps) {
  // Visited-set lives across renders: once a tab has mounted it stays mounted.
  // The set is committed in an effect (never mutated during render) so a
  // discarded concurrent render can't leave a phantom "visited" tab behind;
  // the render below treats the CURRENT active id as visited for first paint.
  const visitedRef = useRef(new Set<string>());
  useEffect(() => {
    visitedRef.current.add(active);
  }, [active]);
  const activeWrapperRef = useRef<HTMLDivElement>(null);
  const prevActiveRef = useRef(active);
  useEffect(() => {
    if (prevActiveRef.current === active) return;
    prevActiveRef.current = active;
    if (!scrollToTop) return;
    const scroller = activeWrapperRef.current?.closest("[data-tk-page-scroll]");
    if (scroller) scroller.scrollTop = 0;
  }, [active, scrollToTop]);

  const tabs: { id: string; node: ReactNode }[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement<TKKeepMountTabProps>(child) && child.props.id) {
      tabs.push({ id: child.props.id, node: child });
    }
  });

  return (
    <>
      {tabs.map(({ id, node }) =>
        id === active || visitedRef.current.has(id) ? (
          <div
            key={id}
            ref={id === active ? activeWrapperRef : undefined}
            data-tk-keep-tab={id}
            data-testid={id === active ? testId : undefined}
            style={{ display: id === active ? "contents" : "none" }}
          >
            <TKTabActiveContext.Provider value={id === active}>{node}</TKTabActiveContext.Provider>
          </div>
        ) : null,
      )}
    </>
  );
}
