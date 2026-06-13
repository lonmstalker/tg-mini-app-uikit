import { useRef, type CSSProperties, type ReactNode } from "react";
import { TKIcon, type TKIconName } from "./icons";
import { TKCounter } from "./display";
import { tkOptionItem, type TKOption } from "./options";
import { useSafeArea } from "./telegram";
import { useControllable } from "./internal/useControllable";
import { tkFormat, useTKLocale } from "./i18n";
import { tkRovingNext, tkTabbableIndex } from "./internal/roving";
import { usePageScrollTop } from "./internal/pageScroll";

/* ---------------- Header / nav bar ---------------- */

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
            <div style={{ fontSize: "var(--tk-fz-title1)", fontWeight: 700, letterSpacing: "-.02em" }}>{title}</div>
            {subtitle ? (
              <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)" }}>{subtitle}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- Tab bar ---------------- */

export interface TKTabItem {
  icon: TKIconName;
  label: string;
  count?: number;
}

export interface TKTabbarProps {
  tabs: TKTabItem[];
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
  /** Extend the bar below the home indicator (`env(safe-area-inset-bottom)`). */
  safeArea?: boolean;
  testId?: string;
}

export function TKTabbar({ tabs, value, defaultValue = 0, onChange, safeArea, testId }: TKTabbarProps) {
  const [active, setActive] = useControllable(value, defaultValue, onChange);
  const { inset, contentInset } = useSafeArea();
  const safeBottom = inset.bottom + contentInset.bottom;
  return (
    <div
      data-testid={testId}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
        background: "var(--tk-glass)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: "0.5px solid var(--tk-sep)",
        minHeight: "var(--tk-tabbar-h, auto)",
        padding: "8px 0 10px",
        paddingBottom: safeArea ? `calc(max(var(--tk-safe-bottom), ${safeBottom}px) + 10px)` : 10,
      }}
    >
      {tabs.map((t, i) => {
        const on = i === active;
        return (
          <button
            type="button"
            key={t.label}
            onClick={() => setActive(i)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              border: "none",
              background: "transparent",
              fontFamily: "inherit",
              cursor: "pointer",
              color: on ? "var(--tk-accent)" : "var(--tk-text-2)",
              transition: "color var(--tk-t2) var(--tk-ease)",
              padding: 0,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 46,
                height: 30,
                borderRadius: "var(--tk-r-pill)",
                background: on ? "var(--tk-accent-12)" : "transparent",
                transform: on ? "translateY(-1px)" : "none",
                transition: "background var(--tk-t2) var(--tk-ease), transform var(--tk-t2) var(--tk-spring)",
                position: "relative",
              }}
            >
              <TKIcon name={t.icon} size={22} strokeWidth={on ? 2.2 : 2} />
              {t.count ? (
                <span style={{ position: "absolute", top: -3, right: 2 }}>
                  <TKCounter value={t.count} />
                </span>
              ) : null}
            </span>
            <span style={{ fontSize: "var(--tk-fz-caption2)", fontWeight: on ? 600 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Segmented control ---------------- */

export interface TKSegmentedProps {
  options: TKOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  full?: boolean;
  testId?: string;
}

export function TKSegmented({ options, value, defaultValue, onChange, full, testId }: TKSegmentedProps) {
  const items = options.map(tkOptionItem);
  const firstEnabled = items.find((item) => !item.disabled);
  const [val, setVal] = useControllable(value, defaultValue ?? firstEnabled?.value ?? "", onChange);
  const idx = Math.max(0, items.findIndex((item) => item.value === val));
  const n = items.length;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const disabledAt = (i: number) => !!items[i]?.disabled;
  const tabbable = tkTabbableIndex(idx, n, disabledAt);
  return (
    <div
      data-testid={testId}
      style={{
        position: "relative",
        display: full ? "grid" : "inline-grid",
        gridTemplateColumns: `repeat(${n}, 1fr)`,
        width: full ? "100%" : undefined,
        padding: 3,
        borderRadius: "var(--tk-r-sm)",
        background: "var(--tk-surface-3)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          bottom: 3,
          left: 3,
          width: `calc((100% - 6px) / ${n})`,
          transform: `translateX(${idx * 100}%)`,
          transition: "transform var(--tk-t2) var(--tk-spring)",
          background: "var(--tk-surface)",
          borderRadius: "calc(var(--tk-r-sm) - 3px)",
          boxShadow: "var(--tk-shadow-sm)",
        }}
      />
      {items.map((item, i) => (
        <button
          type="button"
          key={item.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          tabIndex={i === tabbable ? 0 : -1}
          disabled={item.disabled}
          aria-pressed={item.value === val}
          onClick={() => setVal(item.value)}
          onKeyDown={(e) => {
            const next = tkRovingNext(e.key, i, n, disabledAt, "horizontal");
            if (next == null) return;
            e.preventDefault();
            setVal(items[next].value);
            refs.current[next]?.focus();
          }}
          style={{
            position: "relative",
            zIndex: 1,
            border: "none",
            background: "transparent",
            padding: "7px 16px",
            fontSize: "var(--tk-fz-sub)",
            fontWeight: item.value === val ? 600 : 500,
            fontFamily: "inherit",
            color: item.disabled ? "var(--tk-text-3)" : item.value === val ? "var(--tk-text)" : "var(--tk-text-2)",
            cursor: item.disabled ? "default" : "pointer",
            opacity: item.disabled ? 0.45 : 1,
            transition: "color var(--tk-t2) var(--tk-ease)",
            whiteSpace: "nowrap",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Category tabs (scrollable underline) ---------------- */

export interface TKCategoryTabsProps {
  tabs: TKOption[];
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
  style?: CSSProperties;
  testId?: string;
}

export function TKCategoryTabs({ tabs, value, defaultValue = 0, onChange, style, testId }: TKCategoryTabsProps) {
  const [active, setActive] = useControllable(value, defaultValue, onChange);
  const items = tabs.map(tkOptionItem);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const disabledAt = (i: number) => !!items[i]?.disabled;
  const tabbable = tkTabbableIndex(active, items.length, disabledAt);
  return (
    <div
      data-testid={testId}
      style={{ display: "flex", gap: 4, overflowX: "auto", scrollbarWidth: "none", padding: "0 12px", ...style }}
    >
      {items.map((item, i) => {
        const on = i === active;
        return (
          <button
            type="button"
            key={item.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            tabIndex={i === tabbable ? 0 : -1}
            disabled={item.disabled}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              const next = tkRovingNext(e.key, i, items.length, disabledAt, "horizontal");
              if (next == null) return;
              e.preventDefault();
              setActive(next);
              refs.current[next]?.focus();
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "8px 10px 6px",
              border: "none",
              background: "transparent",
              fontSize: "var(--tk-fz-sub)",
              fontWeight: on ? 700 : 500,
              fontFamily: "inherit",
              color: on ? "var(--tk-text)" : "var(--tk-text-2)",
              cursor: item.disabled ? "default" : "pointer",
              opacity: item.disabled ? 0.45 : 1,
              whiteSpace: "nowrap",
              transition: "color var(--tk-t2) var(--tk-ease)",
            }}
          >
            {item.label}
            <span
              style={{
                width: 18,
                height: 3,
                borderRadius: 2,
                background: "var(--tk-accent)",
                transform: on ? "scaleX(1)" : "scaleX(0)",
                transition: "transform var(--tk-t2) var(--tk-spring)",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Progress steps ---------------- */

export interface TKStepsProps {
  steps: string[];
  current: number;
  /** Makes step circles clickable (e.g. to navigate back). */
  onStepClick?: (index: number) => void;
  testId?: string;
}

export function TKSteps({ steps, current, onStepClick, testId }: TKStepsProps) {
  return (
    <div data-testid={testId} style={{ display: "flex", alignItems: "flex-start" }}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <span key={s} style={{ display: "contents" }}>
            {i > 0 ? (
              <div
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  margin: "13px 6px 0",
                  background: "var(--tk-surface-3)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 2,
                    background: "var(--tk-accent)",
                    width: i <= current ? "100%" : "0%",
                    transition: "width var(--tk-t3) var(--tk-ease)",
                  }}
                />
              </div>
            ) : null}
            <button
              type="button"
              onClick={onStepClick ? () => onStepClick(i) : undefined}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                border: "none",
                background: "transparent",
                padding: 0,
                cursor: onStepClick ? "pointer" : "default",
                fontFamily: "inherit",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  fontSize: "var(--tk-fz-caption)",
                  fontWeight: 700,
                  background: done || active ? "var(--tk-accent)" : "var(--tk-surface-3)",
                  color: done || active ? "var(--tk-on-accent)" : "var(--tk-text-2)",
                  boxShadow: active ? "var(--tk-ring)" : "none",
                  transition: "background var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
                }}
              >
                {done ? <TKIcon name="check" size={14} strokeWidth={3} /> : i + 1}
              </span>
              <span
                style={{
                  fontSize: "var(--tk-fz-caption)",
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--tk-text)" : "var(--tk-text-2)",
                  whiteSpace: "nowrap",
                }}
              >
                {s}
              </span>
            </button>
          </span>
        );
      })}
    </div>
  );
}

/* ---------------- Page dots ---------------- */

export interface TKPageDotsProps {
  count: number;
  page?: number;
  defaultPage?: number;
  onChange?: (page: number) => void;
  testId?: string;
}

export function TKPageDots({ count, page, defaultPage = 0, onChange, testId }: TKPageDotsProps) {
  const locale = useTKLocale();
  const [cur, setCur] = useControllable(page, defaultPage, onChange);
  return (
    <div data-testid={testId} style={{ display: "flex", gap: 7 }}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          type="button"
          key={i}
          onClick={() => setCur(i)}
          aria-label={tkFormat(locale.page, { page: i + 1 })}
          style={{
            width: i === cur ? 24 : 8,
            height: 8,
            borderRadius: 4,
            border: "none",
            padding: 0,
            cursor: "pointer",
            background: i === cur ? "var(--tk-accent)" : "var(--tk-text-3)",
            transition: "width var(--tk-t2) var(--tk-spring), background var(--tk-t2) var(--tk-ease)",
          }}
        />
      ))}
    </div>
  );
}
