import { useState, type CSSProperties, type ReactNode } from "react";
import { TKPageScrollContext } from "./internal/pageScroll";
import { useSafeArea } from "./telegram";

/*
 * Layout primitives. All of them combine the CSS `env(safe-area-inset-*)`
 * value with the live Telegram insets (via `useSafeArea`), so they work in
 * a plain browser, inside Telegram and in fullscreen mini apps alike.
 */

export type TKSafeAreaEdge = "top" | "bottom" | "left" | "right";

const EDGE_ENV: Record<TKSafeAreaEdge, string> = {
  top: "env(safe-area-inset-top, 0px)",
  bottom: "env(safe-area-inset-bottom, 0px)",
  left: "env(safe-area-inset-left, 0px)",
  right: "env(safe-area-inset-right, 0px)",
};

const EDGE_PADDING: Record<TKSafeAreaEdge, keyof CSSProperties> = {
  top: "paddingTop",
  bottom: "paddingBottom",
  left: "paddingLeft",
  right: "paddingRight",
};

function safePad(edge: TKSafeAreaEdge, devicePx: number, extraPx = 0): string {
  return extraPx > 0
    ? `calc(max(${EDGE_ENV[edge]}, ${devicePx}px) + ${extraPx}px)`
    : `max(${EDGE_ENV[edge]}, ${devicePx}px)`;
}

export interface TKSafeAreaProps {
  /** Edges to pad (default top and bottom). */
  edges?: TKSafeAreaEdge[];
  /** Also reserve the space covered by the Telegram chrome (default true). */
  content?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  testId?: string;
}

/** Pads its children away from device cutouts and the Telegram chrome. */
export function TKSafeArea({
  edges = ["top", "bottom"],
  content = true,
  children,
  style,
  className,
  testId,
}: TKSafeAreaProps) {
  const { inset, contentInset } = useSafeArea();
  const pads: CSSProperties = {};
  for (const edge of edges) {
    const device = (inset[edge] ?? 0) + (content ? contentInset[edge] ?? 0 : 0);
    pads[EDGE_PADDING[edge]] = safePad(edge, device) as never;
  }
  return (
    <div className={className} data-testid={testId} style={{ ...pads, ...style }}>
      {children}
    </div>
  );
}

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
 * pinned footer — with the safe-area plumbing done once.
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
        paddingTop: safeTop ? safePad("top", top) : undefined,
        ...style,
      }}
    >
      {header ? (
        <TKPageScrollContext.Provider value={scrollTop}>
          <div style={{ flexShrink: 0, position: "relative", zIndex: 1 }}>{header}</div>
        </TKPageScrollContext.Provider>
      ) : null}
      {/* tabIndex keeps the scroll region keyboard-reachable even when the
          page content has no focusable children (WCAG 2.1.1 / axe
          scrollable-region-focusable). */}
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
            paddingBottom: !footer && safeBottom ? safePad("bottom", bottom, padding) : padding,
          }}
        >
          {children}
        </div>
      </div>
      {footer ? <div style={{ flexShrink: 0 }}>{footer}</div> : null}
    </div>
  );
}

export interface TKBottomBarProps {
  children?: ReactNode;
  /** Frosted-glass background (default true). */
  blur?: boolean;
  /** Hairline separator on top (default true). */
  separator?: boolean;
  /** Horizontal padding, px (default 16). */
  paddingX?: number;
  /** Top padding, px (default 10). */
  paddingTop?: number;
  /** Bottom padding before the safe-area inset is added, px (default 10). */
  paddingBottom?: number;
  style?: CSSProperties;
  className?: string;
  testId?: string;
}

/** Pinned bottom action bar (main buttons, totals) that clears the home indicator. */
export function TKBottomBar({
  children,
  blur = true,
  separator = true,
  paddingX = 16,
  paddingTop = 10,
  paddingBottom = 10,
  style,
  className,
  testId,
}: TKBottomBarProps) {
  const { inset, contentInset } = useSafeArea();
  const bottom = inset.bottom + contentInset.bottom;
  return (
    <div
      className={className}
      data-testid={testId}
      style={{
        background: blur ? "var(--tk-glass)" : "var(--tk-bg)",
        backdropFilter: blur ? "blur(14px)" : undefined,
        WebkitBackdropFilter: blur ? "blur(14px)" : undefined,
        borderTop: separator ? "0.5px solid var(--tk-sep)" : "none",
        padding: `${paddingTop}px ${paddingX}px`,
        paddingBottom: safePad("bottom", bottom, paddingBottom),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
