import { forwardRef, useState, type CSSProperties } from "react";
import { TKIcon } from "../icons";
import { useControllable } from "../../internal/useControllable";
import { useTKLocale } from "../../foundation/i18n";

export interface TKSearchProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onCancel?: () => void;
  onFocusChange?: (focused: boolean) => void;
  cancelLabel?: string;
  /** Set to false when a host layout owns the close/collapse affordance. */
  showCancelAction?: boolean;
  /** Animate from a compact search field to the available width on focus. */
  expandOnFocus?: boolean;
  /** Compact width used while `expandOnFocus` is enabled and the field is idle. */
  collapsedWidth?: number | string;
  /** Expanded width used while `expandOnFocus` is enabled and the field is focused or filled. */
  expandedWidth?: number | string;
  testId?: string;
}

export const TKSearch = /* @__PURE__ */ forwardRef<HTMLInputElement, TKSearchProps>(function TKSearch(
  {
    placeholder,
    value,
    defaultValue = "",
    onChange,
    onCancel,
    onFocusChange,
    cancelLabel,
    showCancelAction = true,
    expandOnFocus,
    collapsedWidth = 260,
    expandedWidth = "100%",
    testId,
  },
  ref,
) {
  const locale = useTKLocale();
  const [val, setVal] = useControllable(value, defaultValue, onChange);
  const [focus, setFocus] = useState(false);
  const showCancel = showCancelAction && (focus || !!val);
  const expandStyle = expandOnFocus
    ? ({
        "--tk-search-collapsed": typeof collapsedWidth === "number" ? `${collapsedWidth}px` : collapsedWidth,
        "--tk-search-expanded": typeof expandedWidth === "number" ? `${expandedWidth}px` : expandedWidth,
      } as CSSProperties)
    : undefined;
  return (
    <div
      data-testid={testId}
      data-tk-search-expand={expandOnFocus || undefined}
      data-tk-search-filled={!!val || undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        maxWidth: "100%",
        width: expandOnFocus ? undefined : "100%",
        transition: expandOnFocus ? "width var(--tk-t3) var(--tk-ease)" : undefined,
        ...expandStyle,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flex: 1,
          minWidth: 0,
          height: 40,
          padding: "0 12px",
          borderRadius: "var(--tk-r-md)",
          background: "var(--tk-surface)",
          boxShadow: focus ? "var(--tk-ring)" : "inset 0 0 0 0.5px var(--tk-sep)",
          transition: "box-shadow var(--tk-t2) var(--tk-ease)",
        }}
      >
        <span style={{ color: "var(--tk-text-2)", display: "inline-flex" }}>
          <TKIcon name="search" size={17} />
        </span>
        <input
          className="tk-search-input"
          ref={ref}
          value={val}
          placeholder={placeholder ?? locale.search}
          onChange={(e) => setVal(e.target.value)}
          onFocus={() => {
            setFocus(true);
            onFocusChange?.(true);
          }}
          onBlur={() => {
            setFocus(false);
            onFocusChange?.(false);
          }}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "var(--tk-fz-body)",
            fontFamily: "inherit",
            color: "var(--tk-text)",
            minWidth: 0,
            boxShadow: "none",
          }}
        />
      </div>
      {showCancelAction ? (
        <button
          type="button"
          aria-hidden={showCancel ? undefined : true}
          tabIndex={showCancel ? undefined : -1}
          onClick={() => {
            setVal("");
            setFocus(false);
            onFocusChange?.(false);
            onCancel?.();
          }}
          style={{
            border: "none",
            background: "transparent",
            color: "var(--tk-accent-ink)",
            fontSize: "var(--tk-fz-body)",
            fontFamily: "inherit",
            cursor: "pointer",
            flexShrink: 0,
            padding: 0,
            maxWidth: showCancel ? 90 : 0,
            opacity: showCancel ? 1 : 0,
            overflow: "hidden",
            transition: "max-width var(--tk-t3) var(--tk-ease), opacity var(--tk-t2) var(--tk-ease)",
            whiteSpace: "nowrap",
          }}
        >
          {cancelLabel ?? locale.cancel}
        </button>
      ) : null}
    </div>
  );
});
