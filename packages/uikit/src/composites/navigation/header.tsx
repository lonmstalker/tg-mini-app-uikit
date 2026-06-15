import { useEffect, useState, type ReactNode } from "react";
import { TKIcon } from "../../atoms/icons";
import { useTKLocale } from "../../foundation/i18n";
import { useSafeArea } from "../../foundation/telegram";
import { useOptionalNav } from "../nav";
import { usePageScrollTop } from "../../internal/pageScroll";

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
  const scrollTop = usePageScrollTop();
  const { inset, contentInset } = useSafeArea();
  const safeTop = inset.top + contentInset.top;
  // `back="auto"` derives visibility + handler from the enclosing nav stack.
  const nav = useOptionalNav();
  const showBack = back === "auto" ? (nav?.depth ?? 1) > 1 : back;
  const handleBack = onBack ?? (back === "auto" ? nav?.pop : undefined);
  // Hysteresis: collapse past 36px, expand back under 20px, hold in between so
  // the large title does not dither when scrollTop hovers around the threshold.
  const [collapsed, setCollapsed] = useState(false);
  const collapsible = !!collapsing && large === true;
  useEffect(() => {
    if (!collapsible) return;
    setCollapsed((prev) => (scrollTop > 36 ? true : scrollTop < 20 ? false : prev));
  }, [collapsible, scrollTop]);
  const isCollapsed = collapsible && collapsed;

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
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
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
        {!large || isCollapsed ? (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              marginRight: showBack ? 18 : 0,
              opacity: large && !isCollapsed ? 0 : 1,
              transition: "opacity var(--tk-t2) var(--tk-ease)",
            }}
          >
            <div style={{ fontSize: "var(--tk-fz-body)", fontWeight: 600 }}>{title}</div>
            {subtitle && !large ? (
              <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)" }}>{subtitle}</div>
            ) : null}
          </div>
        ) : (
          <div style={{ flex: 1 }} />
        )}
        {actions ? <div style={{ display: "flex", gap: 6 }}>{actions}</div> : null}
      </div>
      {large ? (
        <div
          style={{
            display: "grid",
            gridTemplateRows: isCollapsed ? "0fr" : "1fr",
            transition: "grid-template-rows var(--tk-t2) var(--tk-ease)",
          }}
        >
          <div style={{ overflow: "hidden", opacity: isCollapsed ? 0 : 1, transition: "opacity var(--tk-t2) var(--tk-ease)" }}>
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
