import {
  forwardRef,
  useEffect,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { TKSwitch } from "../../atoms/controls";
import { TKBadge } from "../../atoms/display";
import { TKIcon, type TKIconName } from "../../atoms/icons";
import type { TKPolymorphicProps } from "../../internal/polymorphic";

/* ---------------- Cell ---------------- */

// Press feedback lives in CSS so touch gets an :active flash that releases on
// tap-up (the old JS mouseenter/leave background stuck after touch). Hover is
// gated behind a real pointer; tokens.css is shared so we inject this once.
const TK_CELL_STYLE_ID = "tk-cell-style";
const TK_CELL_CSS = `
.tk-cell-tap { transition: background var(--tk-t1) var(--tk-ease); }
.tk-cell-tap:active { background: var(--tk-surface-2); }
.tk-cell-tap .tk-cell-chevron { transition: transform var(--tk-t2) var(--tk-spring); }
@media (hover: hover) {
  .tk-cell-tap:hover { background: var(--tk-surface-2); }
  .tk-cell-tap:hover .tk-cell-chevron { transform: translateX(2px); }
}
`;

function useCellStyle() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(TK_CELL_STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = TK_CELL_STYLE_ID;
    el.textContent = TK_CELL_CSS;
    document.head.appendChild(el);
  }, []);
}

export interface TKCellOwnProps {
  icon?: TKIconName;
  iconBg?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  value?: ReactNode;
  chevron?: boolean;
  badge?: ReactNode;
  danger?: boolean;
  onClick?: () => void;
  /** Controlled state of the trailing switch. */
  toggle?: boolean;
  defaultToggle?: boolean;
  onToggle?: (on: boolean) => void;
  /** Free-form trailing content (steppers, custom icons, ...). */
  after?: ReactNode;
  /** Let the title/subtitle wrap instead of truncating to one line (LST-006). */
  wrap?: boolean;
  /** Clamp the title/subtitle to N lines with an ellipsis (implies multi-line).
   *  Applied to title and subtitle independently. */
  lines?: number;
  testId?: string;
}

export type TKCellProps<T extends ElementType = "div"> = TKPolymorphicProps<T, TKCellOwnProps>;

function TKCellImpl(
  {
    as,
    icon,
    iconBg = "var(--tk-accent)",
    title,
    subtitle,
    value,
    chevron,
    badge,
    danger,
    onClick,
    toggle,
    defaultToggle,
    onToggle,
    after,
    wrap,
    lines,
    testId,
    className,
    ...rest
  }: TKCellOwnProps & { as?: ElementType; className?: string } & Record<string, unknown>,
  ref: ForwardedRef<HTMLElement>,
) {
  useCellStyle();
  const Tag = as ?? "div";
  const hasToggle = toggle !== undefined || defaultToggle !== undefined;
  const actionable = Boolean(onClick) && Tag !== "a" && !hasToggle;
  // Press feedback ONLY for genuinely actionable rows (click / link) — a decorative
  // chevron alone must not look tappable when it does nothing (LST-007).
  const tappable = Boolean(onClick) || Tag === "a";
  // Title/subtitle truncation: single-line ellipsis by default; `lines` clamps to N
  // lines, `wrap` lets it flow freely (LST-006).
  const textClamp: CSSProperties =
    lines && lines > 1
      ? { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: lines, overflow: "hidden", whiteSpace: "normal" }
      : wrap
        ? { whiteSpace: "normal" }
        : { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
  const activateFromKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (!actionable) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onClick?.();
  };
  return (
    <Tag
      {...rest}
      ref={ref as never}
      data-testid={testId}
      className={[tappable ? "tk-cell-tap" : "", className].filter(Boolean).join(" ") || undefined}
      role={actionable ? "button" : undefined}
      tabIndex={actionable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={activateFromKeyboard}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 14px",
        cursor: onClick || Tag === "a" ? "pointer" : "default",
        color: "inherit",
        textDecoration: "none",
        background: "transparent",
      }}
    >
      {icon ? (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: "var(--tk-r-xs)",
            background: iconBg,
            color: "var(--tk-on-accent, #fff)",
            flexShrink: 0,
          }}
        >
          <TKIcon name={icon} size={17} strokeWidth={2.1} />
        </span>
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "var(--tk-fz-body)",
            fontWeight: 500,
            color: danger ? "var(--tk-red)" : "var(--tk-text)",
            ...textClamp,
          }}
        >
          {title}
        </div>
        {/* `!= null` (not truthiness) so a subtitle of 0 or "" still renders, matching
            value/badge (LST-003 consistency). */}
        {subtitle != null ? (
          <div
            style={{
              fontSize: "var(--tk-fz-caption)",
              color: "var(--tk-text-2)",
              ...textClamp,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
      {/* `!= null` (not truthiness) so a legitimate value/badge of 0 or "" renders (LST-003) */}
      {badge != null ? <TKBadge tone="red">{badge}</TKBadge> : null}
      {value != null ? (
        <span data-tk-cell-value style={{ fontSize: "var(--tk-fz-body)", color: "var(--tk-text-2)", flexShrink: 0 }}>
          {value}
        </span>
      ) : null}
      {hasToggle ? (
        <span
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          style={{ display: "inline-flex" }}
        >
          <TKSwitch
            small
            ariaLabel={typeof title === "string" ? title : undefined}
            checked={toggle}
            defaultChecked={defaultToggle}
            onChange={onToggle}
          />
        </span>
      ) : null}
      {after}
      {chevron ? (
        <span className="tk-cell-chevron" style={{ display: "inline-flex", color: "var(--tk-text-3)" }}>
          <TKIcon name="chevronRight" size={16} strokeWidth={2.4} />
        </span>
      ) : null}
    </Tag>
  );
}

/** Settings-style row; `<TKCell as="a" href="...">` renders a link row. */
// ponytail: kept on the older `Record<string,unknown>`/`as never` polymorphic
// shape on purpose — LST-002 (its CC-12 typing finding) was refuted/skipped; the
// other polymorphic atoms (TKButton/TKTappable/TKCardCell) carry the clean
// `TKPolymorphicProps`/`TKPolymorphicRef` pattern.
export const TKCell = /* @__PURE__ */ forwardRef(TKCellImpl as never) as unknown as <T extends ElementType = "div">(
  props: TKCellProps<T> & { ref?: ForwardedRef<HTMLElement> },
) => ReactElement;
