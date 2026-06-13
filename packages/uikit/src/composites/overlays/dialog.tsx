import { forwardRef, useId, useRef, type ReactNode } from "react";
import { TKIcon, type TKIconName } from "../../atoms/icons";
import { mergeRefs, tkZ } from "../../internal/dom";
import { useBackIntercept } from "../../foundation/telegram";
import { Scrim, useMountTransition, useOverlayA11y } from "./shared";

/* ---------------- Dialog ---------------- */

export type TKDialogTone = "accent" | "green" | "red" | "orange";

const DIALOG_TONES: Record<TKDialogTone, [color: string, bg: string]> = {
  accent: ["var(--tk-accent)", "var(--tk-accent-12)"],
  green: ["var(--tk-green)", "var(--tk-green-12)"],
  red: ["var(--tk-red)", "var(--tk-red-12)"],
  orange: ["var(--tk-orange)", "var(--tk-orange-12)"],
};

export interface TKDialogProps {
  open: boolean;
  onClose?: () => void;
  /** Fires on Enter — wire it to the single primary action of the dialog. */
  onConfirm?: () => void;
  icon?: TKIconName;
  tone?: TKDialogTone;
  title?: ReactNode;
  text?: ReactNode;
  children?: ReactNode;
  /** Action buttons, laid out in equal columns. */
  actions?: ReactNode;
  testId?: string;
}

export const TKDialog = /* @__PURE__ */ forwardRef<HTMLDivElement, TKDialogProps>(function TKDialog(
  { open, onClose, onConfirm, icon, tone = "accent", title, text, children, actions, testId },
  forwardedRef,
) {
  const { mounted, closing } = useMountTransition(open, 260);
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlayA11y(mounted && !closing, ref, onClose, onConfirm);
  useBackIntercept(mounted && !closing && !!onClose, () => onClose?.());
  if (!mounted) return null;
  const [color, bg] = DIALOG_TONES[tone] ?? DIALOG_TONES.accent;
  return (
    <>
      <Scrim closing={closing} onClick={onClose} />
      <div
        style={{ position: "absolute", left: 24, right: 24, top: "50%", zIndex: tkZ.dialog, transform: "translateY(-50%)" }}
      >
        <div
          ref={mergeRefs(ref, forwardedRef)}
          data-testid={testId}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          tabIndex={-1}
          style={{
            outline: "none",
            background: "var(--tk-surface)",
            borderRadius: "var(--tk-r-lg)",
            boxShadow: "var(--tk-shadow-lg)",
            padding: "20px 18px 14px",
            textAlign: "center",
            animation: `${closing ? "tk-fade-out" : "tk-modal-in"} var(--tk-t2) ${closing ? "var(--tk-ease)" : "var(--tk-spring)"} both`,
          }}
        >
          {icon ? (
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                margin: "0 auto 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: bg,
                color,
              }}
            >
              <TKIcon name={icon} size={24} />
            </div>
          ) : null}
          {title ? (
            <div id={titleId} style={{ fontSize: "var(--tk-fz-title3)", fontWeight: 700, marginBottom: 4 }}>{title}</div>
          ) : null}
          {text ? (
            <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)", marginBottom: 16 }}>{text}</div>
          ) : null}
          {children}
          {actions ? (
            <div style={{ display: "grid", gridAutoColumns: "1fr", gridAutoFlow: "column", gap: 8 }}>{actions}</div>
          ) : null}
        </div>
      </div>
    </>
  );
});
