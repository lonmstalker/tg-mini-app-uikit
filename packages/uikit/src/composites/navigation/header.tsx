import { type ReactNode } from "react";
import { TKIcon } from "../../atoms/icons";
import { useTKLocale } from "../../foundation/i18n";
import { useSafeArea } from "../../foundation/telegram";
import { useOptionalNav } from "../nav";
import { usePageHeaderCollapsed } from "../../internal/pageScroll";
import { useCollapse } from "../../internal/useCollapse";

export interface TKHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  large?: boolean;
  /** Large title collapses into the compact bar as the `TKPage` content scrolls. */
  collapsing?: boolean;
  /** `true`/`false` to force the back control, or `"auto"` to derive it from the enclosing `TKNavStack` (shown while depth > 1, popping it). */
  back?: boolean | "auto";
  onBack?: () => void;
  actions?: ReactNode;
  testId?: string;
}

export function TKHeader({ title, subtitle, large, collapsing, back = true, onBack, actions, testId }: TKHeaderProps) {
  const locale = useTKLocale();
  // The enclosing TKPage publishes ONE hysteresis-guarded boolean (collapse
  // past 36px, expand under 20px) — the header re-renders only on the two
  // direction flips, never per scroll frame.
  const collapsed = usePageHeaderCollapsed();
  const { inset, contentInset } = useSafeArea();
  const safeTop = inset.top + contentInset.top;
  // `back="auto"` derives visibility + handler from the enclosing nav stack —
  // and hides the arrow while the stack drives the NATIVE Telegram Back button
  // (nav.nativeBack), so the user never sees two back controls for one pop.
  // In a plain browser (no Telegram chrome) the arrow is the only "back" and
  // stays.
  const nav = useOptionalNav();
  const showBack = back === "auto" ? (nav?.depth ?? 1) > 1 && !nav?.nativeBack : back;
  const handleBack = onBack ?? (back === "auto" ? nav?.pop : undefined);
  const collapsible = !!collapsing && large === true;
  const isCollapsed = collapsible && collapsed;
  // The large title collapses by animating its measured height through WAAPI
  // (no grid-template-rows in a transition list, reduced-motion aware).
  const largeTitle = useCollapse(!isCollapsed);

  return (
    <div
      data-testid={testId}
      data-collapsed={collapsing ? isCollapsed : undefined}
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
        background: "var(--tk-glass)",
        backdropFilter: "var(--tk-bar-blur, blur(14px))",
        WebkitBackdropFilter: "var(--tk-bar-blur, blur(14px))",
        borderBottom: "0.5px solid var(--tk-sep)",
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
          <div style={{ fontSize: "var(--tk-fz-body)", fontWeight: 600 }}>{title}</div>
          {subtitle && !large ? (
            <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)" }}>{subtitle}</div>
          ) : null}
        </div>
        {actions ? <div style={{ display: "flex", gap: 6 }}>{actions}</div> : null}
      </div>
      {large ? (
        <div ref={largeTitle.ref} aria-hidden={isCollapsed || undefined} style={largeTitle.style}>
          <div style={{ opacity: isCollapsed ? 0 : 1, transition: "opacity var(--tk-t2) var(--tk-ease)" }}>
            <div style={{ fontSize: "var(--tk-fz-title1)", fontWeight: 700, letterSpacing: 0 }}>{title}</div>
            {subtitle ? (
              <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)" }}>{subtitle}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
