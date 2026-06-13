import { type CSSProperties, type ReactNode } from "react";
import { useSafeArea } from "../../foundation/telegram";

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

export function tkSafePad(edge: TKSafeAreaEdge, devicePx: number, extraPx = 0): string {
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
    pads[EDGE_PADDING[edge]] = tkSafePad(edge, device) as never;
  }
  return (
    <div className={className} data-testid={testId} style={{ ...pads, ...style }}>
      {children}
    </div>
  );
}
