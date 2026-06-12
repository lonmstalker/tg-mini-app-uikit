import { Children, useState, type ReactNode } from "react";
import { TKIcon, type TKIconName } from "./icons";
import { TKBadge } from "./display";
import { TKSwitch } from "./controls";

/* ---------------- List group ---------------- */

export interface TKListGroupProps {
  children?: ReactNode;
  title?: ReactNode;
  footer?: ReactNode;
  inset?: boolean;
}

export function TKListGroup({ children, title, footer, inset = true }: TKListGroupProps) {
  return (
    <div>
      {title ? (
        <div
          style={{
            fontSize: "var(--tk-fz-caption)",
            fontWeight: 600,
            letterSpacing: ".05em",
            textTransform: "uppercase",
            color: "var(--tk-text-2)",
            margin: "0 16px 7px",
          }}
        >
          {title}
        </div>
      ) : null}
      <div
        style={{
          background: "var(--tk-surface)",
          borderRadius: inset ? "var(--tk-r-md)" : 0,
          overflow: "hidden",
          boxShadow: inset ? "var(--tk-shadow-sm)" : "none",
        }}
      >
        {Children.toArray(children).map((c, i) => (
          <div key={i}>
            {i > 0 ? <div style={{ height: 0.5, background: "var(--tk-sep)", marginLeft: 54 }} /> : null}
            {c}
          </div>
        ))}
      </div>
      {footer ? (
        <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)", margin: "7px 16px 0" }}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- Cell ---------------- */

export interface TKCellProps {
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
  /** Free-form trailing content (steppers, custom icons, …). */
  after?: ReactNode;
}

export function TKCell({
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
}: TKCellProps) {
  const [hover, setHover] = useState(false);
  const hasToggle = toggle !== undefined || defaultToggle !== undefined;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 14px",
        cursor: onClick ? "pointer" : "default",
        background: hover && (onClick || chevron) ? "var(--tk-surface-2)" : "transparent",
        transition: "background var(--tk-t1) var(--tk-ease)",
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
            color: "#fff",
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
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              fontSize: "var(--tk-fz-caption)",
              color: "var(--tk-text-2)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
      {badge ? <TKBadge tone="red">{badge}</TKBadge> : null}
      {value ? (
        <span style={{ fontSize: "var(--tk-fz-body)", color: "var(--tk-text-2)", flexShrink: 0 }}>{value}</span>
      ) : null}
      {hasToggle ? <TKSwitch small checked={toggle} defaultChecked={defaultToggle} onChange={onToggle} /> : null}
      {after}
      {chevron ? (
        <span
          style={{
            display: "inline-flex",
            color: "var(--tk-text-3)",
            transform: hover ? "translateX(2px)" : "none",
            transition: "transform var(--tk-t2) var(--tk-spring)",
          }}
        >
          <TKIcon name="chevronRight" size={16} strokeWidth={2.4} />
        </span>
      ) : null}
    </div>
  );
}
