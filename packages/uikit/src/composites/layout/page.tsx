import { useState, type CSSProperties, type ReactNode } from "react";
import { useSafeArea } from "../../foundation/telegram";
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
  /** Respect the top safe area / Telegram chrome (default true). */
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
  const [scrollTop, setScrollTop] = useState(0);
  return (
    <div
      className={className}
      data-testid={testId}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        paddingTop: safeTop ? tkSafePad("top", top) : undefined,
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
        style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}
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
