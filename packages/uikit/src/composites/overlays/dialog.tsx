import { Children, forwardRef, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { tkRenderIcon, type TKIconProp } from "../../atoms/icons";
import { mergeRefs } from "../../internal/dom";
import { Scrim, useAnchorGuard, useModalOverlay, useMountTransition } from "./shared";

/**
 * Keeps the dialog centered in the *visual* viewport so the on-screen keyboard
 * never hides it (a dialog with an input inside would otherwise sit behind the
 * keyboard, centered on the full layout viewport). Returns a px center to use
 * as `top` while a keyboard is open, or null to fall back to `top: 50%`.
 */
function useViewportCenter(active: boolean): number | null {
  const [center, setCenter] = useState<number | null>(null);
  useEffect(() => {
    if (!active || typeof window === "undefined" || !window.visualViewport) {
      setCenter(null);
      return;
    }
    const vv = window.visualViewport;
    const update = () => {
      // Only override the CSS centering once something (the keyboard) actually
      // shrinks the viewport, so framed/non-keyboard cases keep `top: 50%`.
      const shrunk = window.innerHeight - vv.height > 120;
      setCenter(shrunk ? vv.offsetTop + vv.height / 2 : null);
    };
    update();
    vv.addEventListener("resize", update, { passive: true });
    vv.addEventListener("scroll", update, { passive: true });
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [active]);
  return center;
}

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
  /** Built-in icon name, or a custom element for glyphs outside the set (REU-004). */
  icon?: TKIconProp;
  tone?: TKDialogTone;
  title?: ReactNode;
  text?: ReactNode;
  children?: ReactNode;
  /** Action buttons. */
  actions?: ReactNode;
  /**
   * Action layout: `"row"` = equal columns, `"stacked"` = full-width rows,
   * `"auto"` (default) stacks when there are more than two actions so 3+ buttons
   * or long localized labels don't truncate in a narrow WebView (OVL-005).
   */
  actionsLayout?: "row" | "stacked" | "auto";
  /** Native Telegram Main/Secondary buttons while open: `"suppress"` (default) hides them, `"keep"` leaves them to the app. */
  nativeButtons?: "suppress" | "keep";
  /** Merged onto the dialog card, consumer values win (REU-007). */
  style?: CSSProperties;
  className?: string;
  testId?: string;
}

export const TKDialog = /* @__PURE__ */ forwardRef<HTMLDivElement, TKDialogProps>(function TKDialog(
  {
    open,
    onClose,
    onConfirm,
    icon,
    tone = "accent",
    title,
    text,
    children,
    actions,
    actionsLayout = "auto",
    nativeButtons,
    style,
    className,
    testId,
  },
  forwardedRef,
) {
  const ref = useRef<HTMLDivElement>(null);
  const { mounted, closing } = useMountTransition(open, 260, ref);
  // Compositor promotion only while the entrance/exit keyframes play — a
  // permanent will-change would leak a layer per mounted dialog.
  const [entered, setEntered] = useState(false);
  const titleId = useId();
  const textId = useId();
  // One ordered call for the five modal hooks: focus-trap + Escape, scroll-lock,
  // swipe-guard, z-stacking and the Telegram Back button (INT-DX-001).
  const { scrimZ, panelZ } = useModalOverlay({ mounted, active: mounted && !closing, ref, onClose, onConfirm, nativeButtons });
  const keyboardCenter = useViewportCenter(mounted && !closing);
  // Dev guard: absolute-centered against the positioned ancestor (REU-006).
  useAnchorGuard("TKDialog", mounted, ref);
  if (!mounted) return null;
  const [color, bg] = DIALOG_TONES[tone] ?? DIALOG_TONES.accent;
  return (
    <>
      <Scrim closing={closing} onClick={onClose} z={scrimZ} />
      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          top: keyboardCenter != null ? keyboardCenter : "50%",
          zIndex: panelZ,
          transform: "translateY(-50%)",
        }}
      >
        <div
          ref={mergeRefs(ref, forwardedRef)}
          data-testid={testId}
          className={className}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={text ? textId : undefined}
          tabIndex={-1}
          onAnimationEnd={(e) => {
            if (e.animationName === "tk-modal-in") setEntered(true);
          }}
          style={{
            outline: "none",
            background: "var(--tk-surface)",
            borderRadius: "var(--tk-r-lg)",
            boxShadow: "var(--tk-shadow-lg)",
            padding: "20px 18px 14px",
            textAlign: "center",
            animation: `${closing ? "tk-fade-out" : "tk-modal-in"} var(--tk-t2) ${closing ? "var(--tk-ease)" : "var(--tk-spring)"} both`,
            willChange: entered && !closing ? undefined : "transform, opacity",
            ...style,
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
              {tkRenderIcon(icon, { size: 24 })}
            </div>
          ) : null}
          {title ? (
            <div id={titleId} style={{ fontSize: "var(--tk-fz-title3)", fontWeight: 700, marginBottom: 4 }}>{title}</div>
          ) : null}
          {text ? (
            <div id={textId} style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)", marginBottom: 16 }}>{text}</div>
          ) : null}
          {children}
          {actions ? (
            <div
              style={
                actionsLayout === "stacked" || (actionsLayout === "auto" && Children.toArray(actions).length > 2)
                  ? { display: "grid", gridAutoFlow: "row", gap: 8 }
                  : // minmax(0, 1fr): a 1fr grid track floors at min-content, so two
                    // long-labeled buttons overflowed the card instead of
                    // truncating inside their columns (REU-008).
                    { display: "grid", gridAutoColumns: "minmax(0, 1fr)", gridAutoFlow: "column", gap: 8 }
              }
            >
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
});
