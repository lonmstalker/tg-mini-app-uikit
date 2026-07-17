import { forwardRef, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useKeyboard, useSafeArea } from "../../foundation/telegram";
import { TKPageScrollContext } from "../../internal/pageScroll";
import { TKPullToRefresh } from "../gestures/pull-to-refresh";
import { tkSafePad } from "./safe-area";

export interface TKPageProps {
  /** Pinned area above the scrollable content (e.g. `TKHeader`). */
  header?: ReactNode;
  /** Pinned area below it (e.g. `TKBottomBar` or `TKTabbar safeArea`). */
  footer?: ReactNode;
  children?: ReactNode;
  /** Content padding, px (default 16). */
  padding?: number;
  /** Vertical gap between content children, px (default 14). */
  gap?: number;
  /**
   * Respect the top safe area / Telegram chrome (default true). Ignored when a
   * `header` slot is present — the pinned header owns the top inset then
   * (`TKHeader` reserves it itself), so the page does not double-pad it.
   */
  safeTop?: boolean;
  /** Respect the bottom safe area when there is no footer (default true). */
  safeBottom?: boolean;
  /**
   * Accessible name for the scroll region. Set it to make the scroller a named,
   * keyboard-focusable `role="region"`; omitted, the scroller is NOT a tab stop
   * (avoids an unnamed focusable region — LAY-004).
   */
  scrollLabel?: string;
  /**
   * Pull-to-refresh for this page: TKPage wraps its OWN scroll container in a
   * `TKPullToRefresh` wired to the correct scroll target. Prefer this over
   * composing `TKPullToRefresh` yourself — wrapping a non-scroller (e.g. page
   * content inside the scroller) is the classic anti-pattern: the gesture
   * cannot see the scroll position, hijacks mid-list swipes and fires hidden
   * refreshes (GES-103).
   */
  onRefresh?: () => Promise<void>;
  style?: CSSProperties;
  className?: string;
  testId?: string;
}

/**
 * Full-height mini app page: pinned header, scrollable content column,
 * pinned footer, with the safe-area plumbing done once. The forwarded `ref`
 * points at the SCROLL container (the most-needed handle — scroll-to-top,
 * measurement; LAY-006).
 *
 * Keyboard contract: with a `footer`, the page height is
 * `calc(100% - var(--tk-kb-height))` — `--tk-kb-height` is written on the
 * `.tk` root by `useKeyboard`; the change lands in one jump (no layout
 * animation — the OS keyboard slide masks it). The var is the keyboard's
 * measured overlap with THIS root's box (KB-2), so a host that already keeps
 * the root above the keyboard — a `min(var(--tg-viewport-stable-height),
 * 100%)` cap on `#root`, an Android WebView resize, a WebKit pan — is
 * subtracted automatically instead of double-lifting the footer. Host caps
 * are safe to keep either way; they guard the expand jump.
 */
export const TKPage = /* @__PURE__ */ forwardRef<HTMLDivElement, TKPageProps>(function TKPage(
  {
    header,
    footer,
    children,
    padding = 16,
    gap = 14,
    safeTop = true,
    safeBottom = true,
    scrollLabel,
    onRefresh,
    style,
    className,
    testId,
  }: TKPageProps,
  ref,
) {
  const { inset, contentInset } = useSafeArea();
  const top = inset.top + contentInset.top;
  const bottom = inset.bottom + contentInset.bottom;
  const left = inset.left + contentInset.left;
  const right = inset.right + contentInset.right;
  const keyboard = useKeyboard();
  const footerRef = useRef<HTMLDivElement>(null);
  // The footer collapse must follow THIS page's .tk root, not the global
  // keyboard state: useKeyboard scopes --tk-kb-height to the root owning the
  // focused editable (FND-009), so in a multi-root app a keyboard in root A
  // must not collapse root B's footer. The var is written synchronously
  // before this re-render commits; outside any .tk root fall back to global.
  const ownRootLifted = () => {
    const root = footerRef.current?.closest<HTMLElement>(".tk");
    return !root || parseFloat(root.style.getPropertyValue("--tk-kb-height")) > 0;
  };
  // The raw scroll position lives in a ref; state (→ TKPageScrollContext) is a
  // single COLLAPSED boolean with hysteresis (collapse past 36px, expand under
  // 20px, hold between) — scrolling commits nothing except the two direction
  // flips. Publishing the position (even quantized) re-rendered the header on
  // every few pixels of the collapse band (LAY-001).
  const scrollTopRef = useRef(0);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const scroller = (
    <div
      ref={ref}
      tabIndex={scrollLabel ? 0 : undefined}
      role={scrollLabel ? "region" : undefined}
      aria-label={scrollLabel}
      data-tk-page-scroll
      // Only track scroll position when a header consumes it — otherwise every
      // scroll frame would re-render the whole page for nothing (LAY-001).
      onScroll={
        header
          ? (e) => {
              const px = e.currentTarget.scrollTop;
              scrollTopRef.current = px;
              // Same boolean → React bails out, no re-render.
              setHeaderCollapsed((prev) => (px > 36 ? true : px < 20 ? false : prev));
            }
          : undefined
      }
      style={{
        // Inside the pull-to-refresh wrapper the scroller fills it by height
        // (the wrapper owns the flex slot); standalone it takes the slot itself.
        ...(onRefresh ? { height: "100%" } : { flex: 1, minHeight: 0 }),
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        // Keep an overscroll at the top/bottom edge from chaining to the body,
        // which Telegram reads as the swipe-down-to-minimize gesture.
        overscrollBehavior: "contain",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap,
          padding,
          // Clear side cutouts / rounded corners in landscape (LAY-003).
          paddingLeft: tkSafePad("left", left, padding),
          paddingRight: tkSafePad("right", right, padding),
          paddingBottom: !footer && safeBottom ? tkSafePad("bottom", bottom, padding) : padding,
        }}
      >
        {children}
      </div>
    </div>
  );
  return (
    <div
      className={["tk-page", className].filter(Boolean).join(" ")}
      data-testid={testId}
      style={{
        // Only shrink when this page owns a pinned footer that must clear the
        // keyboard. Scroll-only pages should keep their full height; shrinking
        // those can collapse a focused search/feed in Telegram clients that
        // already adjust the viewport. The var (not keyboard.height state) is
        // the single animated source: useKeyboard quantizes it and pre-shrinks
        // on focusin, and the .tk-page transition turns the change into one
        // movement instead of a discrete jump per vv event.
        height: footer ? "calc(100% - var(--tk-kb-height, 0px))" : "100%",
        display: "flex",
        flexDirection: "column",
        // The header (e.g. TKHeader) reserves the top inset itself; padding here
        // too would stack two status-bar gaps, so only pad when there is none.
        paddingTop: safeTop && !header ? tkSafePad("top", top) : undefined,
        ...style,
      }}
    >
      {header ? (
        <TKPageScrollContext.Provider value={headerCollapsed}>
          <div style={{ flexShrink: 0, position: "relative", zIndex: 1 }}>{header}</div>
        </TKPageScrollContext.Provider>
      ) : null}
      {onRefresh ? (
        <TKPullToRefresh onRefresh={onRefresh} style={{ flex: 1, minHeight: 0, height: "auto" }}>
          {scroller}
        </TKPullToRefresh>
      ) : (
        scroller
      )}
      {footer ? (
        // While the keyboard is up the footer (tabbar/bottom bar) is useless and,
        // riding on the shrunk page, would float right above the keyboard covering
        // the focused input's results. It collapses via grid-template-rows 1fr→0fr
        // in the same single jump as the page shrink (nothing animates layout;
        // the OS keyboard slide masks it) — never display:none in that frame,
        // which would drop a mid-tap target (.tk-page-footer CSS).
        <div ref={footerRef} className="tk-page-footer" data-kb-open={keyboard.visible && ownRootLifted() ? "" : undefined}>
          <div style={{ overflow: "hidden", minHeight: 0 }}>{footer}</div>
        </div>
      ) : null}
    </div>
  );
});
