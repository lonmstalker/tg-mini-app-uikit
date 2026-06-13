import type { ReactNode } from "react";
import { useControllable } from "../../internal/useControllable";

export interface TKSlotDay {
  label: string;
  date: ReactNode;
}

export interface TKSlotPickerProps {
  days: TKSlotDay[];
  slots: string[];
  /** Slots rendered as unavailable. */
  busy?: string[];
  day?: number;
  defaultDay?: number;
  onDayChange?: (index: number) => void;
  slot?: string;
  defaultSlot?: string;
  onSlotChange?: (slot: string) => void;
  columns?: number;
  testId?: string;
}

export function TKSlotPicker({
  days,
  slots,
  busy = [],
  day,
  defaultDay = 0,
  onDayChange,
  slot,
  defaultSlot,
  onSlotChange,
  columns = 3,
  testId,
}: TKSlotPickerProps) {
  const [dayIdx, setDayIdx] = useControllable(day, defaultDay, onDayChange);
  const [slotVal, setSlotVal] = useControllable(slot, defaultSlot ?? "", onSlotChange);
  return (
    <div data-testid={testId} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 7 }}>
        {days.map((dayItem, index) => {
          const on = index === dayIdx;
          return (
            <button
              type="button"
              key={`${dayItem.label}-${index}`}
              className="tk-press"
              onClick={() => setDayIdx(index)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "8px 0",
                border: "none",
                borderRadius: "var(--tk-r-sm)",
                background: on ? "var(--tk-accent)" : "var(--tk-surface)",
                color: on ? "var(--tk-on-accent)" : "var(--tk-text)",
                boxShadow: on ? "0 5px 14px -5px var(--tk-accent-35)" : "var(--tk-shadow-sm)",
                fontFamily: "inherit",
                transition:
                  "background var(--tk-t2) var(--tk-ease), color var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
              }}
            >
              <span
                style={{
                  fontSize: "var(--tk-fz-caption2)",
                  fontWeight: 600,
                  opacity: on ? 0.8 : 0.55,
                  textTransform: "uppercase",
                  letterSpacing: 0,
                }}
              >
                {dayItem.label}
              </span>
              <span style={{ fontSize: "var(--tk-fz-body)", fontWeight: 700 }}>{dayItem.date}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8 }}>
        {slots.map((slotItem) => {
          const disabled = busy.includes(slotItem);
          const on = slotItem === slotVal;
          return (
            <button
              type="button"
              key={slotItem}
              className={disabled ? undefined : "tk-press"}
              disabled={disabled}
              onClick={() => setSlotVal(slotItem)}
              style={{
                padding: "10px 0",
                border: "none",
                borderRadius: "var(--tk-r-sm)",
                background: on ? "var(--tk-accent)" : "var(--tk-surface)",
                color: disabled ? "var(--tk-text-3)" : on ? "var(--tk-on-accent)" : "var(--tk-text)",
                boxShadow: on ? "0 5px 14px -5px var(--tk-accent-35)" : disabled ? "none" : "var(--tk-shadow-sm)",
                fontSize: "var(--tk-fz-sub)",
                fontWeight: 600,
                fontFamily: "inherit",
                fontVariantNumeric: "tabular-nums",
                textDecoration: disabled ? "line-through" : "none",
                cursor: disabled ? "default" : "pointer",
                transition:
                  "background var(--tk-t2) var(--tk-ease), color var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
              }}
            >
              {slotItem}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface TKSummaryRow {
  label: ReactNode;
  value: ReactNode;
  /** Render the value in green (discounts, promos). */
  accent?: boolean;
  /** Total row: bigger type and a divider above. */
  total?: boolean;
}

export interface TKPaymentSummaryProps {
  rows: TKSummaryRow[];
  children?: ReactNode;
  testId?: string;
}

export function TKPaymentSummary({ rows, children, testId }: TKPaymentSummaryProps) {
  return (
    <div
      data-testid={testId}
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-lg)",
        boxShadow: "var(--tk-shadow-sm)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {rows.map((row, index) => (
        <span key={index} style={{ display: "contents" }}>
          {row.total ? <div style={{ height: 0.5, background: "var(--tk-sep)", margin: "2px 0" }} /> : null}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              fontSize: row.total ? "var(--tk-fz-title3)" : "var(--tk-fz-sub)",
              fontWeight: row.total ? 700 : 400,
              color: row.accent ? "var(--tk-green)" : row.total ? "var(--tk-text)" : "var(--tk-text-2)",
            }}
          >
            <span>{row.label}</span>
            <span
              style={{
                fontVariantNumeric: "tabular-nums",
                fontWeight: row.total ? 700 : 600,
                color: row.accent ? "var(--tk-green)" : "var(--tk-text)",
              }}
            >
              {row.value}
            </span>
          </div>
        </span>
      ))}
      {children}
    </div>
  );
}
