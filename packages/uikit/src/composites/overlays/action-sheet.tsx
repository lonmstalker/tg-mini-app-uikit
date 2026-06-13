import { forwardRef, useRef, type ReactNode } from "react";
import { TKIcon, type TKIconName } from "../../atoms/icons";
import { mergeRefs, tkZ } from "../../internal/dom";
import { useTKLocale } from "../../foundation/i18n";
import { useBackIntercept } from "../../foundation/telegram";
import { Scrim, useMountTransition, useOverlayA11y } from "./shared";

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
  testId?: string;
}

export const TKActionSheet = /* @__PURE__ */ forwardRef<HTMLDivElement, TKActionSheetProps>(function TKActionSheet(
  { open, onClose, items, cancelLabel, testId },
  forwardedRef,
) {
  const locale = useTKLocale();
  const { mounted, closing } = useMountTransition(open, 360);
  const ref = useRef<HTMLDivElement>(null);
  useOverlayA11y(mounted && !closing, ref, onClose);
  useBackIntercept(mounted && !closing && !!onClose, () => onClose?.());
  if (!mounted) return null;
  return (
    <>
      <Scrim closing={closing} onClick={onClose} />
      <div
        ref={mergeRefs(ref, forwardedRef)}
        data-testid={testId}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        style={{
          outline: "none",
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 10,
          zIndex: tkZ.sheet,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          animation: `${closing ? "tk-sheet-down" : "tk-sheet-up"} var(--tk-t3) ${closing ? "var(--tk-ease)" : "var(--tk-spring)"} both`,
        }}
      >
        <div
          style={{
            background: "var(--tk-surface)",
            borderRadius: "var(--tk-r-lg)",
            overflow: "hidden",
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
