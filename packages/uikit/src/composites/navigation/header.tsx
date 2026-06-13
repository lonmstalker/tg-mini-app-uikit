import type { ReactNode } from "react";
import { TKIcon } from "../../atoms/icons";
import { useTKLocale } from "../../foundation/i18n";
import { usePageScrollTop } from "../../internal/pageScroll";

export interface TKHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  large?: boolean;
  /** Large title collapses into the compact bar as the `TKPage` content scrolls. */
  collapsing?: boolean;
  back?: boolean;
  onBack?: () => void;
  actions?: ReactNode;
  testId?: string;
}

export function TKHeader({ title, subtitle, large, collapsing, back = true, onBack, actions, testId }: TKHeaderProps) {
  const locale = useTKLocale();
  const scrollTop = usePageScrollTop();
  const collapsed = !!collapsing && large === true && scrollTop > 28;

  return (
    <div
      data-testid={testId}
      data-collapsed={collapsing ? collapsed : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: large ? "14px 16px 12px" : "0 16px",
        height: large ? undefined : 52,
        justifyContent: "center",
        background: "var(--tk-glass)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "0.5px solid var(--tk-sep)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {back ? (
          <button
            type="button"
            className="tk-press"
            aria-label={locale.back}
            onClick={onBack}
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
        {!large || collapsed ? (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              marginRight: back ? 18 : 0,
              opacity: large && !collapsed ? 0 : 1,
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
            gridTemplateRows: collapsed ? "0fr" : "1fr",
            transition: "grid-template-rows var(--tk-t2) var(--tk-ease)",
          }}
        >
          <div style={{ overflow: "hidden", opacity: collapsed ? 0 : 1, transition: "opacity var(--tk-t2) var(--tk-ease)" }}>
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
