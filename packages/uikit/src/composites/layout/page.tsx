import { useState, type CSSProperties, type ReactNode } from "react";
import { useKeyboard, useSafeArea } from "../../foundation/telegram";
import { TKPageScrollContext } from "../../internal/pageScroll";
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
  style?: CSSProperties;
  className?: string;
  testId?: string;
}

/**
 * Full-height mini app page: pinned header, scrollable content column,
 * pinned footer, with the safe-area plumbing done once.
 */
export function TKPage({
  header,
  footer,
  children,
  padding = 16,
  gap = 14,
  safeTop = true,
  safeBottom = true,
  style,
  className,
  testId,
}: TKPageProps) {
  const { inset, contentInset } = useSafeArea();
  const top = inset.top + contentInset.top;
  const bottom = inset.bottom + contentInset.bottom;
  const keyboard = useKeyboard();
  const [scrollTop, setScrollTop] = useState(0);
  return (
    <div
      className={className}
      data-testid={testId}
      style={{
        // Only shrink when this page owns a pinned footer that must clear the
        // keyboard. Scroll-only pages should keep their full height; shrinking
        // those can collapse a focused search/feed in Telegram clients that
        // already adjust the viewport.
        height: footer && keyboard.visible ? `calc(100% - ${keyboard.height}px)` : "100%",
        display: "flex",
        flexDirection: "column",
        // The header (e.g. TKHeader) reserves the top inset itself; padding here
        // too would stack two status-bar gaps, so only pad when there is none.
        paddingTop: safeTop && !header ? tkSafePad("top", top) : undefined,
        ...style,
      }}
    >
      {header ? (
        <TKPageScrollContext.Provider value={scrollTop}>
          <div style={{ flexShrink: 0, position: "relative", zIndex: 1 }}>{header}</div>
        </TKPageScrollContext.Provider>
      ) : null}
      <div
        tabIndex={0}
        data-tk-page-scroll
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        style={{
          flex: 1,
          minHeight: 0,
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
            paddingBottom: !footer && safeBottom ? tkSafePad("bottom", bottom, padding) : padding,
          }}
        >
          {children}
        </div>
      </div>
      {footer ? <div style={{ flexShrink: 0 }}>{footer}</div> : null}
    </div>
  );
}
