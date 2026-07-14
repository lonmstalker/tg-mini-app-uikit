import { forwardRef, useRef, useState, type ReactNode } from "react";
import { TKIcon, type TKIconName } from "../../atoms/icons";
import { mergeRefs } from "../../internal/dom";
import { useTKLocale } from "../../foundation/i18n";
import { Scrim, useModalOverlay, useMountTransition } from "./shared";

/* ---------------- Action sheet ---------------- */

export interface TKActionItem {
  icon?: TKIconName;
  label: ReactNode;
  danger?: boolean;
  onSelect?: () => void;
}

export interface TKActionSheetProps {
  open: boolean;
  onClose?: () => void;
  items: TKActionItem[];
  cancelLabel?: ReactNode;
  /** Accessible name for the dialog (defaults to the localized `locale.actions`). */
  ariaLabel?: string;
  testId?: string;
}

export const TKActionSheet = /* @__PURE__ */ forwardRef<HTMLDivElement, TKActionSheetProps>(function TKActionSheet(
  { open, onClose, items, cancelLabel, ariaLabel, testId },
  forwardedRef,
) {
  const locale = useTKLocale();
  const ref = useRef<HTMLDivElement>(null);
  const { mounted, closing } = useMountTransition(open, 360, ref);
  // Compositor promotion only while the entrance/exit keyframes play — a
  // permanent will-change would leak a layer per mounted action sheet.
  const [entered, setEntered] = useState(false);
  // Five modal hooks in one ordered call; panelProps pre-builds role/aria-modal/
  // tabIndex/z so the panel is spread-ready (INT-DX-001).
  const { scrimZ, panelProps } = useModalOverlay({ mounted, active: mounted && !closing, ref, onClose });
  if (!mounted) return null;
  return (
    <>
      <Scrim closing={closing} onClick={onClose} z={scrimZ} />
      <div
        ref={mergeRefs(ref, forwardedRef)}
        data-testid={testId}
        {...panelProps}
        aria-label={ariaLabel ?? locale.actions}
        onAnimationEnd={(e) => {
          if (e.animationName === "tk-sheet-up") setEntered(true);
        }}
        style={{
          ...panelProps.style,
          outline: "none",
          position: "absolute",
          left: 10,
          right: 10,
          bottom: "calc(10px + var(--tk-safe-bottom))",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          animation: `${closing ? "tk-sheet-down" : "tk-sheet-up"} var(--tk-t3) ${closing ? "var(--tk-ease)" : "var(--tk-spring)"} both`,
          willChange: entered && !closing ? undefined : "transform",
        }}
      >
        <div
          data-tk-actions-list
          style={{
            background: "var(--tk-surface)",
            borderRadius: "var(--tk-r-lg)",
            // Cap the list and scroll it so a long item set (share targets, etc.)
            // can't push the top items / cancel button off-screen in a short
            // WebView; the cancel button is a sibling below, so it stays pinned
            // (OVL-004).
            maxHeight: "calc(100% - var(--tk-safe-top) - var(--tk-safe-bottom) - 96px)",
            overflowY: "auto",
            overscrollBehavior: "contain",
            boxShadow: "var(--tk-shadow-lg)",
          }}
        >
          {items.map((item, i) => (
            <button
              type="button"
              key={i}
              onClick={() => {
                item.onSelect?.();
                onClose?.();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "14px 16px",
                border: "none",
                borderTop: i > 0 ? "0.5px solid var(--tk-sep)" : "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "var(--tk-fz-body)",
                fontWeight: 500,
                fontFamily: "inherit",
                color: item.danger ? "var(--tk-red)" : "var(--tk-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--tk-surface-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {item.icon ? <TKIcon name={item.icon} size={19} /> : null}
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="tk-press"
          style={{
            width: "100%",
            padding: "14px 16px",
            border: "none",
            borderRadius: "var(--tk-r-lg)",
            background: "var(--tk-surface)",
            boxShadow: "var(--tk-shadow-lg)",
            fontSize: "var(--tk-fz-body)",
            fontWeight: 700,
            fontFamily: "inherit",
            color: "var(--tk-accent-ink)",
          }}
        >
          {cancelLabel ?? locale.cancel}
        </button>
      </div>
    </>
  );
});
