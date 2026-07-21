import { forwardRef, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { tkRenderIcon, type TKIconProp } from "../../atoms/icons";
import { mergeRefs } from "../../internal/dom";
import { useTKLocale } from "../../foundation/i18n";
import { Scrim, useAnchorGuard, useModalOverlay, useMountTransition, useOverlayPortal } from "./shared";

/* ---------------- Action sheet ---------------- */

export interface TKActionItem {
  /** Built-in icon name, or a custom element for glyphs outside the set (REU-004). */
  icon?: TKIconProp;
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
  /** Native Telegram Main/Secondary buttons while open: `"suppress"` (default) hides them, `"keep"` leaves them to the app. */
  nativeButtons?: "suppress" | "keep";
  /** Merged onto the panel wrapper, consumer values win (REU-007). */
  style?: CSSProperties;
  className?: string;
  testId?: string;
}

export const TKActionSheet = /* @__PURE__ */ forwardRef<HTMLDivElement, TKActionSheetProps>(function TKActionSheet(
  { open, onClose, items, cancelLabel, ariaLabel, nativeButtons, style, className, testId },
  forwardedRef,
) {
  const locale = useTKLocale();
  const ref = useRef<HTMLDivElement>(null);
  const { mounted, closing } = useMountTransition(open, 360, ref);
  // Compositor promotion only while the entrance/exit keyframes play — a
  // permanent will-change would leak a layer per mounted action sheet.
  const [entered, setEntered] = useState(false);
  // Portal into the shared overlay host (`.tk` / [data-tk-portal-root], body
  // fallback) so a positioned/transformed ancestor can't trap the sheet (REU-009).
  const portal = useOverlayPortal();
  // Five modal hooks in one ordered call; panelProps pre-builds role/aria-modal/
  // tabIndex/z so the panel is spread-ready (INT-DX-001). Active is gated on the
  // resolved host so the focus-trap engages once the portaled node exists.
  const { scrimZ, panelProps } = useModalOverlay({ mounted, active: mounted && !closing && !!portal.host, ref, onClose, nativeButtons });
  // Dev guard: bottom-anchored against the portal host (REU-006).
  useAnchorGuard("TKActionSheet", mounted, ref, portal.host);
  if (!mounted) return portal.marker;
  return portal.render(
    <>
      <Scrim closing={closing} onClick={onClose} z={scrimZ} fixed={portal.fixed} />
      <div
        ref={mergeRefs(ref, forwardedRef)}
        data-testid={testId}
        className={className}
        {...panelProps}
        aria-label={ariaLabel ?? locale.actions}
        onAnimationEnd={(e) => {
          if (e.animationName === "tk-sheet-up") setEntered(true);
        }}
        style={{
          ...panelProps.style,
          // Deliberate: the panel is tabIndex={-1} (never Tab-reachable) and only
          // takes programmatic focus as a trap fallback; real keyboard focus lands
          // on the sheet's buttons, which keep the `.tk :focus-visible` outline.
          outline: "none",
          position: portal.fixed ? "fixed" : "absolute",
          left: 10,
          right: 10,
          bottom: "calc(10px + var(--tk-safe-bottom))",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          animation: `${closing ? "tk-sheet-down" : "tk-sheet-up"} var(--tk-t3) ${closing ? "var(--tk-ease)" : "var(--tk-spring)"} both`,
          willChange: entered && !closing ? undefined : "transform",
          ...style,
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
              {tkRenderIcon(item.icon, { size: 19 })}
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
