import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import type { TKPolymorphicProps } from "../../internal/polymorphic";

/* ---------------- Generic card primitives ---------------- */

export interface TKCardProps {
  children?: ReactNode;
  interactive?: boolean;
  onClick?: () => void;
  padding?: number | string;
  inset?: boolean;
  /** Canonical hairline outline. Use this instead of an ad-hoc inline `border`
   * so every outlined card across the app shares one separator value. */
  outlined?: boolean;
  testId?: string;
  className?: string;
  style?: CSSProperties;
}

export const TKCard = /* @__PURE__ */ forwardRef<HTMLDivElement, TKCardProps>(function TKCard(
  { children, onClick, interactive, padding = 14, inset = true, outlined, testId, className, style },
  ref,
) {
  const isInteractive = interactive ?? !!onClick;
  return (
    <div
      ref={ref}
      data-testid={testId}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={[isInteractive ? "tk-press tk-press-soft" : "", className].filter(Boolean).join(" ")}
      style={{
        background: "var(--tk-surface)",
        borderRadius: inset ? "var(--tk-r-lg)" : 0,
        boxShadow: inset ? "var(--tk-shadow-sm)" : "none",
        border: outlined ? ".5px solid var(--tk-sep)" : undefined,
        padding,
        cursor: onClick ? "pointer" : "default",
        outline: "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
});

export interface TKCardCellOwnProps {
  children?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  before?: ReactNode;
  after?: ReactNode;
  onClick?: () => void;
  compact?: boolean;
  testId?: string;
  className?: string;
  style?: CSSProperties;
}

export type TKCardCellProps<T extends ElementType = "div"> = TKPolymorphicProps<T, TKCardCellOwnProps>;

function TKCardCellImpl(
  {
    as,
    children,
    title,
    subtitle,
    before,
    after,
    onClick,
    compact,
    testId,
    className,
    style,
    ...rest
  }: TKCardCellOwnProps & { as?: ElementType } & Record<string, unknown>,
  ref: ForwardedRef<HTMLElement>,
) {
  const Tag = as ?? "div";
  return (
    <Tag
      {...rest}
      ref={ref as never}
      data-testid={testId}
      role={onClick && Tag === "div" ? "button" : undefined}
      tabIndex={onClick && Tag === "div" ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e: KeyboardEvent) => {
        if (!onClick || Tag !== "div") return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={[onClick ? "tk-press tk-press-soft" : "", className].filter(Boolean).join(" ")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        minHeight: compact ? 44 : 54,
        padding: compact ? "8px 10px" : "11px 12px",
        borderRadius: "var(--tk-r-md)",
        cursor: onClick || Tag === "a" ? "pointer" : "default",
        color: "inherit",
        textDecoration: "none",
        outline: "none",
        ...style,
      }}
    >
      {before}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title ? (
          <div style={{ fontSize: "var(--tk-fz-body)", fontWeight: 600, color: "var(--tk-text)" }}>{title}</div>
        ) : null}
        {subtitle ? (
          <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)", marginTop: 1 }}>{subtitle}</div>
        ) : null}
        {children}
      </div>
      {after}
    </Tag>
  );
}

/** Card row; `<TKCardCell as="a" href="…">` renders a link row. */
export const TKCardCell = /* @__PURE__ */ forwardRef(TKCardCellImpl) as <T extends ElementType = "div">(
  props: TKCardCellProps<T> & { ref?: ForwardedRef<HTMLElement> },
) => ReactElement;

export interface TKCardChipProps {
  children?: ReactNode;
  selected?: boolean;
  tone?: "accent" | "green" | "red" | "orange" | "gray";
  onClick?: () => void;
  testId?: string;
  className?: string;
  style?: CSSProperties;
}

export const TKCardChip = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKCardChipProps>(function TKCardChip(
  { children, selected, tone = "accent", onClick, testId, className, style },
  ref,
) {
  const color =
    tone === "green"
      ? "var(--tk-green)"
      : tone === "red"
        ? "var(--tk-red)"
        : tone === "orange"
          ? "var(--tk-orange)"
          : tone === "gray"
            ? "var(--tk-text-2)"
            : "var(--tk-accent)";
  const ink =
    tone === "green"
      ? "var(--tk-green-ink)"
      : tone === "red"
        ? "var(--tk-red-ink)"
        : tone === "orange"
          ? "var(--tk-orange-ink)"
          : tone === "gray"
            ? "var(--tk-text-2)"
            : "var(--tk-accent-ink)";
  return (
    <button
      type="button"
      ref={ref}
      data-testid={testId}
      aria-pressed={selected}
      onClick={onClick}
      className={["tk-press", className].filter(Boolean).join(" ")}
      style={{
        border: "none",
        borderRadius: "var(--tk-r-pill)",
        padding: "6px 10px",
        background: selected ? color : "var(--tk-surface-2)",
        color: selected ? "var(--tk-on-accent)" : ink,
        fontFamily: "inherit",
        fontSize: "var(--tk-fz-caption)",
        fontWeight: 700,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </button>
  );
});
