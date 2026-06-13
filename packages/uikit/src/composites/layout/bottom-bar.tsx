import { type CSSProperties, type ReactNode } from "react";
import { useSafeArea } from "../../foundation/telegram";
import { tkSafePad } from "./safe-area";

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
        paddingBottom: tkSafePad("bottom", bottom, paddingBottom),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
