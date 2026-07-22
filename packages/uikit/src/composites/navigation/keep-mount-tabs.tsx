import { Children, createContext, isValidElement, useContext, useDeferredValue, useEffect, useRef, type ReactNode } from "react";
import { useLazyRef } from "../../internal/useLazyRef";

/**
 * Keep-mount tab host: visited tabs stay MOUNTED (`display: contents` when
 * active; hidden ones are pulled out of flow and skipped via
 * `visibility: hidden` + `content-visibility: hidden`), so switching back is
 * instant — no data reload, no lost component state (form input values,
 * fetched data, timers) and, unlike the old `display: none`, no browser-reset
 * `scrollTop` inside the hidden tab. Unvisited tabs mount lazily on first
 * activation — through a DEFERRED render, so the tabbar highlight paints
 * before the heavy first mount. The nearest `[data-tk-page-scroll]` ancestor
 * (a TKPage scroller) is scrolled back to the top on every switch, matching
 * the remount-era UX.
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
  // A heavy first mount rides a deferred (interruptible) render: whatever
  // updated `active` (the tabbar pill) commits and paints first.
  const shown = useDeferredValue(active);
  // Visited-set lives across renders: once a tab has mounted it stays mounted.
  // The set is committed in an effect (never mutated during render) so a
  // discarded concurrent render can't leave a phantom "visited" tab behind;
  // the render below treats the CURRENT shown id as visited for first paint.
  const visitedRef = useLazyRef(() => new Set<string>());
  useEffect(() => {
    visitedRef.current.add(shown);
  }, [shown]);
  const activeWrapperRef = useRef<HTMLDivElement>(null);
  const prevActiveRef = useRef(shown);
  useEffect(() => {
    if (prevActiveRef.current === shown) return;
    prevActiveRef.current = shown;
    if (!scrollToTop) return;
    const scroller = activeWrapperRef.current?.closest("[data-tk-page-scroll]");
    if (scroller) scroller.scrollTop = 0;
  }, [shown, scrollToTop]);

  const tabs: { id: string; node: ReactNode }[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement<TKKeepMountTabProps>(child) && child.props.id) {
      tabs.push({ id: child.props.id, node: child });
    }
  });

  return (
    <>
      {tabs.map(({ id, node }) =>
        id === shown || visitedRef.current.has(id) ? (
          <div
            key={id}
            ref={id === shown ? activeWrapperRef : undefined}
            data-tk-keep-tab={id}
            data-testid={id === shown ? testId : undefined}
            {...(id === shown ? null : { inert: true })}
            style={
              id === shown
                ? { display: "contents" }
                : {
                    // Out of flow but NOT display:none — the browser keeps the
                    // hidden tab's inner scroll positions. content-visibility
                    // skips its layout/paint; older WebKit simply ignores it
                    // and falls back to plain visibility:hidden.
                    position: "absolute",
                    width: "100%",
                    visibility: "hidden",
                    contentVisibility: "hidden",
                    pointerEvents: "none",
                  }
            }
          >
            <TKTabActiveContext.Provider value={id === shown}>{node}</TKTabActiveContext.Provider>
          </div>
        ) : null,
      )}
    </>
  );
}
