import { useEffect, type ReactNode } from "react";
import { useControllable } from "../../internal/useControllable";
import { useTKLocale } from "../../foundation/i18n";

// Standard visually-hidden style: text reachable by AT, invisible on screen.
const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

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
  /**
   * Fired on selection. ALSO fired programmatically with `""` when the current
   * slot is reconciled away (it left `slots` or entered `busy`, e.g. after a day
   * change — PTN-004). Don't treat every call as a user tap (e.g. don't fire
   * haptics on the `""` reconcile).
   */
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
  const locale = useTKLocale();
  const [dayIdx, setDayIdx] = useControllable(day, defaultDay, onDayChange);
  const [slotVal, setSlotVal] = useControllable(slot, defaultSlot ?? "", onSlotChange);
  // Reconcile the selection when slots/busy change (e.g. the day switched): if the
  // chosen slot is gone or now busy, clear it so the highlight and the parent's
  // state never point at an absent/sold-out slot (PTN-004). Uncontrolled clears
  // internal state; controlled emits the cleared value via onSlotChange.
  // Key on content, not array identity, so an inline `slots`/`busy` (new ref each
  // render) doesn't re-run the body every commit.
  const slotsKey = slots.join("|");
  const busyKey = busy.join("|");
  useEffect(() => {
    if (slotVal && (!slots.includes(slotVal) || busy.includes(slotVal))) setSlotVal("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotsKey, busyKey, slotVal, setSlotVal]);
  // Clamp the active day so an out-of-range index still highlights a real day (PTN-005).
  const activeDay = days.length > 0 ? Math.max(0, Math.min(dayIdx, days.length - 1)) : -1;
  return (
    <div data-testid={testId} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 7 }}>
        {days.map((dayItem, index) => {
          const on = index === activeDay;
          return (
            <button
              type="button"
              key={`${dayItem.label}-${index}`}
              className="tk-press"
              aria-pressed={on}
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
              // ponytail: a Tab-navigated group of selectable toggle buttons (aria-pressed),
              // not an arrow-key radiogroup — so no roving/role=radio here. Busy slots drop
              // aria-pressed (they aren't selectable) and stay focusable with aria-disabled +
              // a non-color "unavailable" cue so AT perceives them, not only line-through (PTN-002).
              aria-pressed={disabled ? undefined : on}
              aria-disabled={disabled || undefined}
              onClick={() => {
                if (!disabled) setSlotVal(slotItem);
              }}
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
              {disabled ? <span style={srOnly}> — {locale.unavailable}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface TKSummaryRow {
  /** Stable identity for React keys (CC-11/PTN-008) — falls back to index. */
  id?: string;
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
        // A real flex wrapper keyed by stable identity (not index + display:contents)
        // so reorder/removal keeps each row's node and its divider together (PTN-008).
        <div key={row.id ?? index} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
        </div>
      ))}
      {children}
    </div>
  );
}
