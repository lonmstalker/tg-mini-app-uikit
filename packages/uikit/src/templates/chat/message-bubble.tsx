import { memo, type CSSProperties, type ReactNode } from "react";
import { TKIcon } from "../../atoms/icons";

export type TKMessageStatus = "sent" | "delivered" | "read";

export interface TKMessage {
  id: string;
  text?: ReactNode;
  /** Outgoing (right side). */
  out?: boolean;
  time?: ReactNode;
  status?: TKMessageStatus;
  /** Custom bubble content below the text (images, files, etc.). */
  children?: ReactNode;
}

export interface TKMessageBubbleProps extends Omit<TKMessage, "id"> {
  /** Last bubble of a same-side group: gets the tail corner and meta row. */
  tail?: boolean;
  /** Merged onto the bubble itself (background, width, ...), consumer values win (REU-007). */
  style?: CSSProperties;
  className?: string;
  testId?: string;
}

// Memoized so an unchanged bubble doesn't re-render when its TKMessages parent
// updates (a long thread re-rendered every bubble on each new message — CHT-005).
export const TKMessageBubble = /* @__PURE__ */ memo(function TKMessageBubble({
  text,
  out,
  time,
  status,
  tail = true,
  children,
  style,
  className,
  testId,
}: TKMessageBubbleProps) {
  return (
    <div
      data-tk-bubble
      data-tk-tail={tail}
      data-testid={testId}
      style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start" }}
    >
      <div
        className={className}
        style={{
          maxWidth: "78%",
          minWidth: 0,
          // Long unbroken text / URLs wrap inside the bubble instead of overflowing
          // the narrow WebView (CHT-003).
          overflowWrap: "anywhere",
          padding: "8px 12px",
          borderRadius: "var(--tk-r-lg)",
          ...(tail
            ? out
              ? { borderBottomRightRadius: "var(--tk-r-xs)" }
              : { borderBottomLeftRadius: "var(--tk-r-xs)" }
            : null),
          background: out ? "var(--tk-accent)" : "var(--tk-surface)",
          color: out ? "var(--tk-on-accent)" : "var(--tk-text)",
          boxShadow: out ? "0 4px 12px -6px var(--tk-accent-35)" : "var(--tk-shadow-sm)",
          fontSize: "var(--tk-fz-sub)",
          lineHeight: 1.35,
          ...style,
        }}
      >
        {text}
        {children}
        {time != null || status ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              marginLeft: 8,
              fontSize: "var(--tk-fz-caption2)",
              opacity: 0.75,
              verticalAlign: "bottom",
              float: "right",
              transform: "translateY(3px)",
            }}
          >
            {time}
            {out && status ? (
              <span data-tk-ticks style={{ display: "inline-flex", marginLeft: 1 }}>
                <TKIcon name="check" size={12} strokeWidth={2.6} />
                {status !== "sent" ? (
                  <TKIcon name="check" size={12} strokeWidth={2.6} style={{ marginLeft: -7, opacity: status === "read" ? 1 : 0.55 }} />
                ) : null}
              </span>
            ) : null}
          </span>
        ) : null}
      </div>
    </div>
  );
});
