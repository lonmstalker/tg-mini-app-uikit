import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TKIcon, type TKIconName } from "../../atoms/icons";
import { useTKLocale } from "../../foundation/i18n";
import { useSafeArea } from "../../foundation/telegram";

export interface TKWriteBarProps {
  onSend: (text: string) => void;
  placeholder?: string;
  /** Leading slot (attach button, custom action, etc.). */
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
        onChange={(event) => {
          setText(event.target.value);
          const el = event.currentTarget;
          el.style.height = "auto";
          el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
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
