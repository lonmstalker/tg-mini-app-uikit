import {
  Children,
  forwardRef,
  useState,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { TKIcon, type TKIconName } from "./icons";
import { TKBadge } from "./display";
import { TKSwitch } from "./controls";
import { useControllable } from "./internal/useControllable";
import type { TKPolymorphicProps } from "./internal/polymorphic";

/* ---------------- List group ---------------- */

export interface TKListGroupProps {
  children?: ReactNode;
  title?: ReactNode;
  footer?: ReactNode;
  inset?: boolean;
  testId?: string;
}

export function TKListGroup({ children, title, footer, inset = true, testId }: TKListGroupProps) {
  return (
    <div data-testid={testId}>
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
  /** Free-form trailing content (steppers, custom icons, …). */
  after?: ReactNode;
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
    testId,
    ...rest
  }: TKCellOwnProps & { as?: ElementType } & Record<string, unknown>,
  ref: ForwardedRef<HTMLElement>,
) {
  const Tag = as ?? "div";
  const [hover, setHover] = useState(false);
  const hasToggle = toggle !== undefined || defaultToggle !== undefined;
  return (
    <Tag
      {...rest}
      ref={ref as never}
      data-testid={testId}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 14px",
        cursor: onClick || Tag === "a" ? "pointer" : "default",
        color: "inherit",
        textDecoration: "none",
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
      {hasToggle ? (
        <TKSwitch
          small
          ariaLabel={typeof title === "string" ? title : undefined}
          checked={toggle}
          defaultChecked={defaultToggle}
          onChange={onToggle}
        />
      ) : null}
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
    </Tag>
  );
}

/** Settings-style row; `<TKCell as="a" href="…">` renders a link row. */
// the cast below defines the public generic signature; forwardRef's own
// inference chokes on the required `title` + rest-record combination
export const TKCell = /* @__PURE__ */ forwardRef(TKCellImpl as never) as unknown as <T extends ElementType = "div">(
  props: TKCellProps<T> & { ref?: ForwardedRef<HTMLElement> },
) => ReactElement;

/* ---------------- Accordion ---------------- */

export interface TKAccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  subtitle?: ReactNode;
  icon?: TKIconName;
  iconBg?: string;
  disabled?: boolean;
}

export interface TKAccordionProps {
  items: TKAccordionItem[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  multiple?: boolean;
  title?: ReactNode;
  footer?: ReactNode;
  inset?: boolean;
  testId?: string;
}

export function TKAccordion({
  items,
  value,
  defaultValue = [],
  onChange,
  multiple,
  title,
  footer,
  inset = true,
  testId,
}: TKAccordionProps) {
  const [open, setOpen] = useControllable(value, defaultValue, onChange);

  const toggle = (id: string) => {
    setOpen(
      open.includes(id)
        ? open.filter((item) => item !== id)
        : multiple
          ? [...open, id]
          : [id],
    );
  };

  return (
    <TKListGroup title={title} footer={footer} inset={inset} testId={testId}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div key={item.id}>
            <button
              type="button"
              className={item.disabled ? undefined : "tk-press tk-press-soft"}
              aria-expanded={isOpen}
              disabled={item.disabled}
              onClick={() => !item.disabled && toggle(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                border: "none",
                background: "transparent",
                color: item.disabled ? "var(--tk-text-3)" : "var(--tk-text)",
                fontFamily: "inherit",
                textAlign: "left",
                cursor: item.disabled ? "default" : "pointer",
              }}
            >
              {item.icon ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: "var(--tk-r-xs)",
                    background: item.iconBg ?? "var(--tk-accent)",
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  <TKIcon name={item.icon} size={17} strokeWidth={2.1} />
                </span>
              ) : null}
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "var(--tk-fz-body)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.title}
                </span>
                {item.subtitle ? (
                  <span
                    style={{
                      display: "block",
                      marginTop: 1,
                      color: "var(--tk-text-2)",
                      fontSize: "var(--tk-fz-caption)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.subtitle}
                  </span>
                ) : null}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  color: "var(--tk-text-3)",
                  transform: isOpen ? "rotate(180deg)" : "none",
                  transition: "transform var(--tk-t2) var(--tk-spring)",
                }}
              >
                <TKIcon name="chevronDown" size={17} strokeWidth={2.4} />
              </span>
            </button>
            <div
              aria-hidden={!isOpen}
              style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: "grid-template-rows var(--tk-t3) var(--tk-ease)",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    padding: item.icon ? "0 14px 14px 56px" : "0 14px 14px",
                    color: "var(--tk-text-2)",
                    fontSize: "var(--tk-fz-sub)",
                    lineHeight: 1.38,
                  }}
                >
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </TKListGroup>
  );
}
