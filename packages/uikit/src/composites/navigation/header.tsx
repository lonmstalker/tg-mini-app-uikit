import { type CSSProperties, type ReactNode } from "react";
import { TKIcon } from "../../atoms/icons";
import { useTKLocale } from "../../foundation/i18n";
import { useBackButtonWanted, useSafeArea } from "../../foundation/telegram";
import { useHasNativeChrome } from "../../foundation/chrome";
import { useOptionalNav } from "../nav";
import { usePageHeaderCollapsed } from "../../internal/pageScroll";
import { useCollapse } from "../../internal/useCollapse";

export interface TKHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  large?: boolean;
  /** Large title collapses into the compact bar as the `TKPage` content scrolls. */
  collapsing?: boolean;
  /**
   * `"auto"` (default) renders the arrow only when it is the ONLY back control:
   * inside a `TKNavStack` it follows the stack (depth > 1, hidden while the
   * stack drives the NATIVE Telegram Back button); standalone it needs an
   * `onBack` and steps aside when a real client already shows the native
   * button. `true`/`false` force it.
   */
  back?: boolean | "auto";
  onBack?: () => void;
  actions?: ReactNode;
  /**
   * `"glass"` (default) is the TKPage slot look: blurred glass background and a
   * bottom hairline. `"plain"` drops that chrome for use inside custom layouts
   * where the floating glass plate reads as a stray gray bar (REU-005).
   */
  variant?: "glass" | "plain";
  /** ARIA heading level of the title (default 1). Pass `0` to keep a plain div. */
  headingLevel?: number;
  /** Merged onto the bar root, consumer values win (REU-007). */
  style?: CSSProperties;
  className?: string;
  testId?: string;
}

export function TKHeader({
  title,
  subtitle,
  large,
  collapsing,
  back = "auto",
  onBack,
  actions,
  variant = "glass",
  headingLevel = 1,
  style,
  className,
  testId,
}: TKHeaderProps) {
  const locale = useTKLocale();
  // The enclosing TKPage publishes ONE hysteresis-guarded boolean (collapse
  // past 36px, expand under 20px) — the header re-renders only on the two
  // direction flips, never per scroll frame.
  const collapsed = usePageHeaderCollapsed();
  const { inset, contentInset } = useSafeArea();
  const safeTop = inset.top + contentInset.top;
  // `back="auto"` (the default) renders the arrow only when it is the ONLY
  // back control. In a nav stack it defers to the stack — hidden while the
  // stack drives the NATIVE Telegram Back button (nav.nativeBack). Standalone
  // it needs an `onBack`, and steps aside when a real client already shows the
  // native button for the same press (an overlay's or `useBackButton`'s
  // intercept). In a plain browser the arrow is the only "back" and stays.
  const nav = useOptionalNav();
  const hasNativeChrome = useHasNativeChrome();
  const backWanted = useBackButtonWanted();
  const showBack =
    back === "auto"
      ? nav
        ? nav.depth > 1 && !nav.nativeBack
        : !!onBack && !(hasNativeChrome && backWanted)
      : back;
  const handleBack = onBack ?? (back === "auto" ? nav?.pop : undefined);
  const collapsible = !!collapsing && large === true;
  const isCollapsed = collapsible && collapsed;
  // The page title must be a real heading for AT, not an anonymous div. Both
  // the compact and large nodes carry it — aria-hidden already exposes exactly
  // one of them at a time (REU-005).
  const headingProps =
    headingLevel > 0 ? ({ role: "heading", "aria-level": headingLevel } as const) : undefined;
  // The large title collapses by animating its measured height through WAAPI
  // (no grid-template-rows in a transition list, reduced-motion aware).
  const largeTitle = useCollapse(!isCollapsed);

  return (
    <div
      data-testid={testId}
      data-collapsed={collapsing ? isCollapsed : undefined}
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: large ? "14px 16px 12px" : "0 16px",
        // Reserve the top device cutout / Telegram chrome so the bar reads
        // correctly when used as a sticky/fixed element under the status bar.
        paddingTop: `calc(${large ? 14 : 0}px + max(var(--tk-safe-top), ${safeTop}px))`,
        height: large ? undefined : 52,
        boxSizing: "border-box",
        justifyContent: "center",
        ...(variant === "glass"
          ? {
              background: "var(--tk-glass)",
              backdropFilter: "var(--tk-bar-blur, blur(14px))",
              WebkitBackdropFilter: "var(--tk-bar-blur, blur(14px))",
              borderBottom: "0.5px solid var(--tk-sep)",
            }
          : null),
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {showBack ? (
          <button
            type="button"
            className="tk-press"
            aria-label={locale.back}
            onClick={handleBack}
            style={{
              display: "inline-flex",
              border: "none",
              background: "transparent",
              padding: 0,
              color: "var(--tk-accent)",
              marginLeft: -6,
            }}
          >
            <TKIcon name="chevronLeft" size={24} strokeWidth={2.3} />
          </button>
        ) : null}
        <div
          // Both titles stay MOUNTED: the compact one crossfades in as the large
          // one collapses — a transition on a freshly-mounted node never runs,
          // which left the old conditional render popping in with no fade.
          aria-hidden={large && !isCollapsed ? true : undefined}
          style={{
            flex: 1,
            textAlign: "center",
            marginRight: showBack ? 18 : 0,
            opacity: !large || isCollapsed ? 1 : 0,
            transition: "opacity var(--tk-t2) var(--tk-ease)",
          }}
        >
          <div {...headingProps} style={{ fontSize: "var(--tk-fz-body)", fontWeight: 600 }}>{title}</div>
          {subtitle && !large ? (
            <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)" }}>{subtitle}</div>
          ) : null}
        </div>
        {actions ? <div style={{ display: "flex", gap: 6 }}>{actions}</div> : null}
      </div>
      {large ? (
        <div ref={largeTitle.ref} aria-hidden={isCollapsed || undefined} style={largeTitle.style}>
          <div style={{ opacity: isCollapsed ? 0 : 1, transition: "opacity var(--tk-t2) var(--tk-ease)" }}>
            <div {...headingProps} style={{ fontSize: "var(--tk-fz-title1)", fontWeight: 700, letterSpacing: 0 }}>{title}</div>
            {subtitle ? (
              <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)" }}>{subtitle}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
