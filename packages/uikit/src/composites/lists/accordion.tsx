import { useState, type ReactNode } from "react";
import { TKIcon, type TKIconName } from "../../atoms/icons";
import { useControllable } from "../../internal/useControllable";
import { TKListGroup } from "./list-group";

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
  /** Mount item content only after the item first opens. */
  lazy?: boolean;
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
  lazy,
  testId,
}: TKAccordionProps) {
  const [open, setOpen] = useControllable(value, defaultValue, onChange);
  const [everOpened, setEverOpened] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setEverOpened((m) => (m[id] ? m : { ...m, [id]: true }));
    setOpen(open.includes(id) ? open.filter((item) => item !== id) : multiple ? [...open, id] : [id]);
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
                  {!lazy || isOpen || everOpened[item.id] ? item.content : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </TKListGroup>
  );
}
