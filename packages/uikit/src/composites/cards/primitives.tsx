import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import type { TKPolymorphicProps, TKPolymorphicRef } from "../../internal/polymorphic";

/* ---------------- Generic card primitives ---------------- */

export interface TKCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  interactive?: boolean;
  /** Makes the card a `role="button"`. Set `aria-label`/`aria-labelledby` for its name (CRD-001). */
  onClick?: () => void;
  padding?: number | string;
  inset?: boolean;
  /** Canonical hairline outline. Use this instead of an ad-hoc inline `border`
   * so every outlined card across the app shares one separator value. */
  outlined?: boolean;
  /** Dims the card and disables its click/keyboard activation (CRD-008). */
  disabled?: boolean;
  testId?: string;
}

export const TKCard = /* @__PURE__ */ forwardRef<HTMLDivElement, TKCardProps>(function TKCard(
  { children, onClick, interactive, padding = 14, inset = true, outlined, disabled, testId, className, style, ...rest },
  ref,
) {
  // A disabled card is neither focusable nor activatable; press-feedback is off too.
  const active = !!onClick && !disabled;
  const isInteractive = (interactive ?? !!onClick) && !disabled;
  return (
    <div
      ref={ref}
      {...rest}
      data-testid={testId}
      // Keep the button role even when disabled so `aria-disabled` is meaningful (a
      // disabled button stays in the a11y tree); only focus + activation are gated (CRD-008).
      role={onClick ? "button" : undefined}
      tabIndex={active ? 0 : undefined}
      aria-disabled={disabled || undefined}
      onClick={active ? onClick : undefined}
      // Mirror a native button: Enter fires on keydown, Space on keyup; ignore key
      // repeat so holding the key triggers onClick once, not a stream (CRD-006).
      onKeyDown={(e) => {
        if (!active) return;
        if (e.key === "Enter" && !e.repeat) {
          e.preventDefault();
          onClick!();
        } else if (e.key === " ") {
          e.preventDefault(); // hold the page from scrolling; activation is on keyup
        }
      }}
      onKeyUp={(e) => {
        if (!active) return;
        if (e.key === " ") {
          e.preventDefault();
          onClick!();
        }
      }}
      className={[isInteractive ? "tk-press tk-press-soft" : "", className].filter(Boolean).join(" ")}
      style={{
        background: "var(--tk-surface)",
        borderRadius: inset ? "var(--tk-r-lg)" : 0,
        boxShadow: inset ? "var(--tk-shadow-sm)" : "none",
        border: outlined ? ".5px solid var(--tk-sep)" : undefined,
        padding,
        cursor: disabled ? "default" : onClick ? "pointer" : "default",
        opacity: disabled ? 0.5 : undefined,
        pointerEvents: disabled ? "none" : undefined,
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
  }: TKPolymorphicProps<ElementType, TKCardCellOwnProps>,
  ref: ForwardedRef<HTMLElement>,
) {
  const Tag = as ?? "div";
  return (
    <Tag
      {...rest}
      ref={ref}
      data-testid={testId}
      role={onClick && Tag === "div" ? "button" : undefined}
      tabIndex={onClick && Tag === "div" ? 0 : undefined}
      onClick={onClick}
      // Native-button keyboard semantics on the div-rendered button (CRD-006):
      // Enter on keydown (no repeat), Space on keyup. `as="a"/"button"` handle it natively.
      onKeyDown={(e: KeyboardEvent) => {
        if (!onClick || Tag !== "div") return;
        if (e.key === "Enter" && !e.repeat) {
          e.preventDefault();
          onClick();
        } else if (e.key === " ") {
          e.preventDefault();
        }
      }}
      onKeyUp={(e: KeyboardEvent) => {
        if (!onClick || Tag !== "div") return;
        if (e.key === " ") {
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
  props: TKCardCellProps<T> & { ref?: TKPolymorphicRef<T> },
) => ReactElement;

export interface TKCardChipProps extends Omit<HTMLAttributes<HTMLButtonElement>, "onClick"> {
  selected?: boolean;
  tone?: "accent" | "green" | "red" | "orange" | "gray";
  onClick?: () => void;
  /** Disables the chip: native `disabled`, no `onClick`, dimmed (CRD-002). */
  disabled?: boolean;
  testId?: string;
}

export const TKCardChip = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKCardChipProps>(function TKCardChip(
  { children, selected, tone = "accent", onClick, disabled, testId, className, style, ...rest },
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
  // Contrast-safe ink for the SELECTED (solid-tone-bg) chip (CRD-005):
  // - accent keeps the brand white-on-accent;
  // - green/red/orange are bright in every theme → a near-black ink (white fails AA);
  // - gray's bg is `--tk-text-2`, which FLIPS (dark in light theme, light in dark) —
  //   so its ink must flip too: `--tk-surface` is always the opposite of `--tk-text-2`.
  const selectedInk =
    tone === "accent" ? "var(--tk-on-accent)" : tone === "gray" ? "var(--tk-surface)" : "rgba(0,0,0,.86)";
  return (
    <button
      type="button"
      ref={ref}
      {...rest}
      data-testid={testId}
      aria-pressed={selected}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={["tk-press", className].filter(Boolean).join(" ")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 44, // CC-03 / CRD-003 touch target
        border: "none",
        borderRadius: "var(--tk-r-pill)",
        padding: "6px 10px",
        background: selected ? color : "var(--tk-surface-2)",
        color: selected ? selectedInk : ink,
        fontFamily: "inherit",
        fontSize: "var(--tk-fz-caption)",
        fontWeight: 700,
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "default" : onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </button>
  );
});
