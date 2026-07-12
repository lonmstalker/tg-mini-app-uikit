import { type HTMLAttributes, type ReactNode } from "react";
import { useSafeArea } from "../../foundation/telegram";
import { tkSafePad } from "./safe-area";

export interface TKBottomBarProps extends HTMLAttributes<HTMLElement> {
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
  testId?: string;
}

/**
 * Pinned bottom action bar (main buttons, totals) that clears the home indicator.
 * Renders a `<footer>` landmark by default; pass `role`/`aria-label` (or any other
 * native attribute) to relabel it (LAY-005).
 */
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
  ...rest
}: TKBottomBarProps) {
  const { inset, contentInset } = useSafeArea();
  const bottom = inset.bottom + contentInset.bottom;
  const left = inset.left + contentInset.left;
  const right = inset.right + contentInset.right;
  return (
    <footer
      {...rest}
      className={className}
      data-testid={testId}
      style={{
        background: blur ? "var(--tk-glass)" : "var(--tk-bg)",
        backdropFilter: blur ? "blur(14px)" : undefined,
        WebkitBackdropFilter: blur ? "blur(14px)" : undefined,
        borderTop: separator ? "0.5px solid var(--tk-sep)" : "none",
        paddingTop,
        paddingBottom: tkSafePad("bottom", bottom, paddingBottom),
        // Clear a side cutout / rounded corner in landscape so actions don't get
        // clipped under the notch (LAY-003).
        paddingLeft: tkSafePad("left", left, paddingX),
        paddingRight: tkSafePad("right", right, paddingX),
        ...style,
      }}
    >
      {children}
    </footer>
  );
}
