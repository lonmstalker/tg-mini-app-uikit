import { useLayoutEffect, useMemo, useRef, type CSSProperties, type ReactNode, type Ref } from "react";
import { tkRenderIcon, type TKIconProp } from "../../atoms/icons";
import { useTKLocale } from "../../foundation/i18n";
import { useSafeArea } from "../../foundation/telegram";
import { mergeRefs } from "../../internal/dom";
import { useControllable } from "../../internal/useControllable";

export interface TKWriteBarProps {
  onSend: (text: string) => void;
  /** Draft text (controlled). Omit for an uncontrolled bar (CHT-002). */
  value?: string;
  /** Initial draft when uncontrolled. */
  defaultValue?: string;
  /**
   * Fired as the draft changes. Note `onSend` is followed by `onChange("")` — in
   * controlled mode the bar does NOT own the value, so your store must apply that
   * empty string to actually clear the draft (CHT-002).
   */
  onChange?: (value: string) => void;
  /** Forwarded to the underlying `<textarea>` for focus (imperative `.value`
   *  clear only works uncontrolled — controlled value wins on the next render). */
  inputRef?: Ref<HTMLTextAreaElement>;
  placeholder?: string;
  /** Leading slot (attach button, custom action, etc.). */
  before?: ReactNode;
  /** Custom send icon: built-in name or a custom element (paper plane by default) (REU-004). */
  sendIcon?: TKIconProp;
  disabled?: boolean;
  /** Pad below the home indicator (default true). */
  safeArea?: boolean;
  testId?: string;
  style?: CSSProperties;
  className?: string;
}

/** Message input bar: auto-growing textarea, Enter sends, Shift+Enter breaks. */
export function TKWriteBar({
  onSend,
  value,
  defaultValue,
  onChange,
  inputRef,
  placeholder,
  before,
  sendIcon = "send",
  disabled,
  safeArea = true,
  testId,
  style,
  className,
}: TKWriteBarProps) {
  const locale = useTKLocale();
  const [text, setText] = useControllable(value, defaultValue ?? "", onChange);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const setAreaRef = useMemo(() => mergeRefs(areaRef, inputRef), [inputRef]);
  const { inset, contentInset } = useSafeArea();
  const bottom = inset.bottom + contentInset.bottom;

  // Keep the auto-grow height in sync with the value — including an external
  // (controlled) clear, which onChange alone wouldn't catch (CHT-002). useLayoutEffect
  // so the collapse paints in the same frame as the value change — no tall-box flash (CHT-006).
  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    if (text) el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  const send = () => {
    const next = text.trim();
    if (!next) return;
    onSend(next);
    setText("");
  };

  return (
    <div
      data-testid={testId}
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        padding: "8px 10px",
        paddingBottom: safeArea ? `max(env(safe-area-inset-bottom, 0px), ${bottom}px, 8px)` : 8,
        background: "var(--tk-glass)",
        backdropFilter: "var(--tk-bar-blur, blur(14px))",
        WebkitBackdropFilter: "var(--tk-bar-blur, blur(14px))",
        borderTop: "0.5px solid var(--tk-sep)",
        ...style,
      }}
    >
      {/* Fixed-size leading controls must not be squeezed as the textarea grows (REU-008). */}
      {before != null ? <span style={{ display: "inline-flex", flexShrink: 0 }}>{before}</span> : null}
      <textarea
        ref={setAreaRef}
        rows={1}
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        // Always a non-empty accessible name even without a placeholder (CHT-001).
        aria-label={placeholder ?? locale.composeMessage}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          // Don't send on the Enter that confirms an IME candidate (CHT-004).
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
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
        // Keep the composer focused: without this the tap first BLURS the
        // textarea, the keyboard starts closing, the bar moves out from under
        // the finger and the click never lands (CHT-007). Preventing the
        // pointerdown default keeps focus in the textarea; click still fires.
        onPointerDown={(event) => event.preventDefault()}
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
        {tkRenderIcon(sendIcon, { size: 19 })}
      </button>
    </div>
  );
}
