import { type CSSProperties, type ReactNode } from "react";
import { useSafeArea } from "../../foundation/telegram";

// `left`/`right` are PHYSICAL edges (never flip). `start`/`end` are LOGICAL: they
// map to padding-inline-start/end so they follow the writing direction (flip under
// `dir="rtl"`), using the matching physical safe-area inset as the magnitude (LAY-008).
export type TKSafeAreaEdge = "top" | "bottom" | "left" | "right" | "start" | "end";

const EDGE_ENV: Record<TKSafeAreaEdge, string> = {
  top: "env(safe-area-inset-top, 0px)",
  bottom: "env(safe-area-inset-bottom, 0px)",
  left: "env(safe-area-inset-left, 0px)",
  right: "env(safe-area-inset-right, 0px)",
  start: "env(safe-area-inset-left, 0px)",
  end: "env(safe-area-inset-right, 0px)",
};

// The provider publishes `--tk-safe-{edge} = max(env(...), jsPx)` and TKHeader/
// TKTabbar already read it; the layout family reads the SAME token so a consumer
// override of `--tk-safe-*` is honored everywhere, not just on the header (LAY-002).
const EDGE_VAR: Record<TKSafeAreaEdge, string> = {
  top: "--tk-safe-top",
  bottom: "--tk-safe-bottom",
  left: "--tk-safe-left",
  right: "--tk-safe-right",
  start: "--tk-safe-left",
  end: "--tk-safe-right",
};

const EDGE_PADDING: Record<TKSafeAreaEdge, keyof CSSProperties> = {
  top: "paddingTop",
  bottom: "paddingBottom",
  left: "paddingLeft",
  right: "paddingRight",
  start: "paddingInlineStart",
  end: "paddingInlineEnd",
};

// Logical edges borrow the matching physical device inset for their magnitude.
const EDGE_PHYSICAL: Record<TKSafeAreaEdge, "top" | "bottom" | "left" | "right"> = {
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
  start: "left",
  end: "right",
};

/**
 * Padding that clears a screen edge: the overridable `--tk-safe-{edge}` token
 * (same source TKHeader/TKTabbar use — LAY-002), floored by the JS-measured
 * `devicePx` inset so the Telegram chrome inset (absent from `env()`) is never
 * lost. Note: because of that floor a consumer override can GROW the inset but not
 * shrink it below a real device cutout — to zero it (e.g. an embedded preview with
 * no real safe area) the measured inset is already 0, so the override applies.
 */
export function tkSafePad(edge: TKSafeAreaEdge, devicePx: number, extraPx = 0): string {
  // Clamp to non-negative and guard NaN → 0 so a bad input never produces a
  // negative or invalid CSS length (LAY-009). The env() floor is preserved.
  const device = Number.isFinite(devicePx) ? Math.max(0, devicePx) : 0;
  const extra = Number.isFinite(extraPx) ? Math.max(0, extraPx) : 0;
  // Read the provider token (overridable) with an env() fallback, floored by the
  // JS-measured inset so the Telegram chrome inset (not in env()) is preserved.
  const base = `max(var(${EDGE_VAR[edge]}, ${EDGE_ENV[edge]}), ${device}px)`;
  return extra > 0 ? `calc(${base} + ${extra}px)` : base;
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
    const phys = EDGE_PHYSICAL[edge];
    if (!phys) continue; // ignore an unknown edge rather than emit an undefined-keyed style
    const device = (inset[phys] ?? 0) + (content ? (contentInset[phys] ?? 0) : 0);
    pads[EDGE_PADDING[edge]] = tkSafePad(edge, device) as never;
  }
  return (
    <div className={className} data-testid={testId} style={{ ...pads, ...style }}>
      {children}
    </div>
  );
}
