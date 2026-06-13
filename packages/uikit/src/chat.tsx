import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TKIcon, type TKIconName } from "./icons";
import { useTKLocale } from "./i18n";
import { useSafeArea } from "./telegram";

/* ---------------- Chat: messages & write bar (M7.1) ---------------- */

export type TKMessageStatus = "sent" | "delivered" | "read";

export interface TKMessage {
  id: string;
  text?: ReactNode;
  /** Outgoing (right side). */
  out?: boolean;
  time?: ReactNode;
  status?: TKMessageStatus;
  /** Custom bubble content below the text (images, files, …). */
  children?: ReactNode;
}

export interface TKMessageBubbleProps extends Omit<TKMessage, "id"> {
  /** Last bubble of a same-side group: gets the tail corner + meta row. */
  tail?: boolean;
  testId?: string;
}

export function TKMessageBubble({ text, out, time, status, tail = true, children, testId }: TKMessageBubbleProps) {
  return (
    <div
      data-tk-bubble
      data-tk-tail={tail}
      data-testid={testId}
      style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start" }}
    >
      <div
        style={{
          maxWidth: "78%",
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
}

export interface TKMessagesProps {
  messages: TKMessage[];
  testId?: string;
  style?: CSSProperties;
}

/** Chat feed: groups consecutive same-side messages, tail on the last one. */
export function TKMessages({ messages, testId, style }: TKMessagesProps) {
  return (
    <div data-testid={testId} style={{ display: "flex", flexDirection: "column", gap: 3, ...style }}>
      {messages.map((m, i) => {
        const next = messages[i + 1];
        const tail = !next || !!next.out !== !!m.out;
        const prev = messages[i - 1];
        const groupStart = !prev || !!prev.out !== !!m.out;
        return (
          <div key={m.id} style={{ marginTop: groupStart && i > 0 ? 8 : 0 }}>
            <TKMessageBubble {...m} tail={tail} />
          </div>
        );
      })}
    </div>
  );
}

export interface TKWriteBarProps {
  onSend: (text: string) => void;
  placeholder?: string;
  /** Leading slot (attach button …). */
  before?: ReactNode;
  /** Custom send icon (paper plane by default). */
  sendIcon?: TKIconName;
  disabled?: boolean;
  /** Pad below the home indicator (default true). */
  safeArea?: boolean;
  testId?: string;
  style?: CSSProperties;
}

/** Message input bar: auto-growing textarea, Enter sends, Shift+Enter breaks. */
export function TKWriteBar({ onSend, placeholder, before, sendIcon = "send", disabled, safeArea = true, testId, style }: TKWriteBarProps) {
  const locale = useTKLocale();
  const [text, setText] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const { inset, contentInset } = useSafeArea();
  const bottom = inset.bottom + contentInset.bottom;

  const send = () => {
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText("");
    if (areaRef.current) areaRef.current.style.height = "auto";
  };

  return (
    <div
      data-testid={testId}
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        padding: "8px 10px",
        paddingBottom: safeArea ? `max(env(safe-area-inset-bottom, 0px), ${bottom}px, 8px)` : 8,
        background: "var(--tk-glass)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: "0.5px solid var(--tk-sep)",
        ...style,
      }}
    >
      {before}
      <textarea
        ref={areaRef}
        rows={1}
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={placeholder}
        onChange={(e) => {
          setText(e.target.value);
          const el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        style={{
          flex: 1,
          minWidth: 0,
          maxHeight: 120,
          resize: "none",
          border: "none",
          outline: "none",
          borderRadius: "var(--tk-r-lg)",
          padding: "10px 14px",
          background: "var(--tk-surface)",
          color: "var(--tk-text)",
          fontFamily: "inherit",
          fontSize: "var(--tk-fz-body)",
          lineHeight: 1.35,
          boxShadow: "inset 0 0 0 1px var(--tk-sep)",
        }}
      />
      <button
        type="button"
        className="tk-press"
        aria-label={locale.send}
        disabled={disabled || !text.trim()}
        onClick={send}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          flexShrink: 0,
          border: "none",
          borderRadius: "50%",
          background: text.trim() ? "var(--tk-accent)" : "var(--tk-surface-3)",
          color: text.trim() ? "var(--tk-on-accent)" : "var(--tk-text-3)",
          transition: "background var(--tk-t2) var(--tk-ease), color var(--tk-t2) var(--tk-ease)",
          cursor: text.trim() ? "pointer" : "default",
        }}
      >
        <TKIcon name={sendIcon} size={19} />
      </button>
    </div>
  );
}
