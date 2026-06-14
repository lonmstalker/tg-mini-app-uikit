import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { TKIconButton } from "../../atoms/buttons";
import { TKIcon } from "../../atoms/icons";
import { useTKLocale } from "../../foundation/i18n";
import { useControllable } from "../../internal/useControllable";

/* ---------------- Calendar ---------------- */

export type TKDateRange = [Date, Date];

export interface TKCalendarProps {
  mode?: "single" | "range";
  /** Selected date (single mode). */
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  /** Selected range (range mode). `null` is emitted when a new range starts. */
  range?: TKDateRange | null;
  defaultRange?: TKDateRange | null;
  onRangeChange?: (range: TKDateRange | null) => void;
  /** Visible month (any date within it). */
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  min?: Date;
  max?: Date;
  /** Predicate marking dates unavailable. */
  disabledDates?: (date: Date) => boolean;
  /** First day of week: 1 = Monday (default), 0 = Sunday. */
  weekStartsOn?: 0 | 1;
  /** BCP-47 locale for month/weekday names (Intl). Defaults to the document language. */
  lang?: string;
  /** Clickable month/year selectors in the calendar header. */
  partSelectors?: boolean;
  testId?: string;
  style?: CSSProperties;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** `Date` → `yyyy-mm-dd` (local) for a deterministic `data-tk-date` selector. */
function isoDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function sameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function addMonths(d: Date, n: number): Date {
  const day = d.getDate();
  const next = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDay));
  return next;
}

function calendarYearRange(anchor: Date, min?: Date, max?: Date): number[] {
  const center = anchor.getFullYear();
  const first = min?.getFullYear() ?? center - 50;
  const last = max?.getFullYear() ?? center + 20;
  return Array.from({ length: Math.max(1, last - first + 1) }, (_, i) => first + i);
}

function documentLang(): string {
  if (typeof document !== "undefined" && document.documentElement.lang) return document.documentElement.lang;
  return "en";
}

/** Inline month calendar: single or range selection, AA keyboard grid. */
export function TKCalendar({
  mode = "single",
  value,
  defaultValue = null,
  onChange,
  range,
  defaultRange = null,
  onRangeChange,
  month,
  defaultMonth,
  onMonthChange,
  min,
  max,
  disabledDates,
  weekStartsOn = 1,
  lang,
  partSelectors = true,
  testId,
  style,
}: TKCalendarProps) {
  const locale = useTKLocale();
  const resolvedLang = lang ?? documentLang();
  const [selected, setSelected] = useControllable<Date | null>(value, defaultValue, onChange as (d: Date | null) => void);
  const [selectedRange, setSelectedRange] = useControllable<TKDateRange | null>(range, defaultRange, onRangeChange);
  const [pendingStart, setPendingStart] = useState<Date | null>(null);
  // True while the `null` currently flowing through the controlled `range` prop
  // is one this calendar emitted itself (first click of a new range), so the
  // reset effect below can ignore it instead of wiping the pending start.
  const selfRangeResetRef = useRef(false);
  const initialMonth = defaultMonth ?? (mode === "range" ? selectedRange?.[0] : selected) ?? new Date();
  const [visibleMonth, setVisibleMonth] = useControllable<Date>(month, startOfDay(initialMonth), onMonthChange);
  const [focusDate, setFocusDate] = useState<Date | null>(null);
  const [picker, setPicker] = useState<"none" | "month" | "year">("none");
  const gridRef = useRef<HTMLDivElement>(null);
  // Only move DOM focus into the grid when navigation was keyboard-initiated, so
  // arrow-button / part-selector month changes don't steal focus.
  const keyboardNavRef = useRef(false);
  const today = startOfDay(new Date());

  const fmtDay = useMemo(
    () => new Intl.DateTimeFormat(resolvedLang, { month: "long", day: "numeric", year: "numeric" }),
    [resolvedLang],
  );
  const fmtMonth = useMemo(() => new Intl.DateTimeFormat(resolvedLang, { month: "long", year: "numeric" }), [resolvedLang]);
  const fmtMonthName = useMemo(() => new Intl.DateTimeFormat(resolvedLang, { month: "long" }), [resolvedLang]);
  const fmtWeekday = useMemo(() => new Intl.DateTimeFormat(resolvedLang, { weekday: "short" }), [resolvedLang]);
  const years = useMemo(() => calendarYearRange(visibleMonth, min, max), [max, min, visibleMonth]);

  const isDisabled = (d: Date): boolean => {
    if (min && startOfDay(d) < startOfDay(min)) return true;
    if (max && startOfDay(d) > startOfDay(max)) return true;
    return !!disabledDates?.(d);
  };

  // 6-week grid covering the visible month
  const weeks = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const shift = (first.getDay() - weekStartsOn + 7) % 7;
    const start = addDays(first, -shift);
    const out: Date[][] = [];
    for (let w = 0; w < 6; w++) out.push(Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)));
    return out;
  }, [visibleMonth, weekStartsOn]);

  // 2017-01-01 is a Sunday — stable weekday header labels
  const weekdayLabels = useMemo(
    () => Array.from({ length: 7 }, (_, i) => fmtWeekday.format(new Date(2017, 0, 1 + ((weekStartsOn + i) % 7)))),
    [fmtWeekday, weekStartsOn],
  );

  const pick = (d: Date) => {
    if (isDisabled(d)) return;
    if (mode === "single") {
      setSelected(d);
      return;
    }
    if (!pendingStart) {
      setPendingStart(d);
      selfRangeResetRef.current = true;
      setSelectedRange(null);
    } else {
      const [a, b] = pendingStart <= d ? [pendingStart, d] : [d, pendingStart];
      setPendingStart(null);
      setSelectedRange([a, b]);
    }
  };

  const setMonthPart = (year: number, monthIndex: number) => {
    setPicker("none");
    keyboardNavRef.current = false;
    setFocusDate(null);
    setVisibleMonth(new Date(year, monthIndex, 1));
  };

  // Pointer-driven month change (arrow buttons): don't steal focus into the grid.
  const stepMonth = (delta: number) => {
    setPicker("none");
    keyboardNavRef.current = false;
    setFocusDate(null);
    setVisibleMonth(addMonths(visibleMonth, delta));
  };

  const moveFocus = (from: Date, e: KeyboardEvent) => {
    let next: Date | null = null;
    if (e.key === "ArrowRight") next = addDays(from, 1);
    else if (e.key === "ArrowLeft") next = addDays(from, -1);
    else if (e.key === "ArrowDown") next = addDays(from, 7);
    else if (e.key === "ArrowUp") next = addDays(from, -7);
    else if (e.key === "Home") next = addDays(from, -(((from.getDay() - weekStartsOn + 7) % 7)));
    else if (e.key === "End") next = addDays(from, 6 - ((from.getDay() - weekStartsOn + 7) % 7));
    else if (e.key === "PageDown") next = addMonths(from, 1);
    else if (e.key === "PageUp") next = addMonths(from, -1);
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(from);
      return;
    } else return;
    e.preventDefault();
    keyboardNavRef.current = true;
    setFocusDate(next);
    if (next.getMonth() !== visibleMonth.getMonth() || next.getFullYear() !== visibleMonth.getFullYear()) {
      setVisibleMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  // Focus follows keyboard navigation across month switches, but only when the
  // last navigation was keyboard-initiated — arrow-button / part-selector month
  // changes (which set `keyboardNavRef` false) must not pull focus into the grid.
  useEffect(() => {
    if (!keyboardNavRef.current || !focusDate || !gridRef.current) return;
    const btn = gridRef.current.querySelector<HTMLButtonElement>(`[data-tk-date="${isoDate(focusDate)}"]`);
    btn?.focus();
  }, [focusDate, visibleMonth]);

  // Reset the in-progress range start when the EXTERNAL range prop changes, so a
  // controlled reset doesn't leave a dangling pending pick. Ignore the `null`
  // this calendar emits itself on the first click of a new range — in
  // controlled mode that round-trips through `range` and would otherwise wipe
  // the start we just set, making the range impossible to close on re-select.
  useEffect(() => {
    if (selfRangeResetRef.current) {
      selfRangeResetRef.current = false;
      return;
    }
    setPendingStart(null);
  }, [range]);

  const inRange = (d: Date): boolean => {
    const r = selectedRange;
    if (!r) return false;
    const t = startOfDay(d).getTime();
    return t >= startOfDay(r[0]).getTime() && t <= startOfDay(r[1]).getTime();
  };

  const isSelected = (d: Date): boolean =>
    mode === "single"
      ? sameDay(d, selected)
      : sameDay(d, selectedRange?.[0]) || sameDay(d, selectedRange?.[1]) || sameDay(d, pendingStart);

  const tabbableDate =
    (focusDate && focusDate.getMonth() === visibleMonth.getMonth() ? focusDate : null) ??
    (mode === "single" && selected && selected.getMonth() === visibleMonth.getMonth() ? selected : null) ??
    weeks.flat().find((d) => d.getMonth() === visibleMonth.getMonth() && !isDisabled(d)) ??
    weeks[0][0];

  return (
    <div data-testid={testId} style={{ background: "var(--tk-surface)", borderRadius: "var(--tk-r-lg)", boxShadow: "var(--tk-shadow-sm)", padding: 12, ...style }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <TKIconButton
          icon="chevronLeft"
          size="sm"
          variant="plain"
          label={locale.prevMonth}
          onClick={() => stepMonth(-1)}
        />
        {partSelectors ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minWidth: 0, flex: "1 1 auto" }}>
            <CalendarPartTrigger
              ariaLabel="Month"
              expanded={picker === "month"}
              capitalize
              grow
              onClick={() => setPicker((p) => (p === "month" ? "none" : "month"))}
            >
              {fmtMonthName.format(visibleMonth)}
            </CalendarPartTrigger>
            <CalendarPartTrigger
              ariaLabel="Year"
              expanded={picker === "year"}
              width={86}
              onClick={() => setPicker((p) => (p === "year" ? "none" : "year"))}
            >
              {visibleMonth.getFullYear()}
            </CalendarPartTrigger>
          </div>
        ) : (
          <span style={{ fontWeight: 700, fontSize: "var(--tk-fz-body)", textTransform: "capitalize" }}>
            {fmtMonth.format(visibleMonth)}
          </span>
        )}
        <TKIconButton
          icon="chevronRight"
          size="sm"
          variant="plain"
          label={locale.nextMonth}
          onClick={() => stepMonth(1)}
        />
      </div>
      {picker === "year" ? (
        <CalendarPartList
          ariaLabel="Year"
          columns={4}
          autoScroll
          options={years.map((year) => ({ value: year, label: String(year), selected: year === visibleMonth.getFullYear() }))}
          onPick={(year) => setMonthPart(year, visibleMonth.getMonth())}
        />
      ) : picker === "month" ? (
        <CalendarPartList
          ariaLabel="Month"
          columns={3}
          capitalize
          options={Array.from({ length: 12 }, (_, monthIndex) => ({
            value: monthIndex,
            label: fmtMonthName.format(new Date(2026, monthIndex, 1)),
            selected: monthIndex === visibleMonth.getMonth(),
          }))}
          onPick={(monthIndex) => setMonthPart(visibleMonth.getFullYear(), monthIndex)}
        />
      ) : (
        <div ref={gridRef} role="grid" aria-label={fmtMonth.format(visibleMonth)} aria-multiselectable={mode === "range" || undefined}>
        <div role="row" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
          {weekdayLabels.map((w) => (
            <span
              key={w}
              role="columnheader"
              style={{
                textAlign: "center",
                fontSize: "var(--tk-fz-caption2)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".04em",
                color: "var(--tk-text-3)",
              }}
            >
              {w}
            </span>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} role="row" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {week.map((d) => {
              const outside = d.getMonth() !== visibleMonth.getMonth();
              const disabled = isDisabled(d);
              const sel = isSelected(d);
              const mid = mode === "range" && inRange(d) && !sel;
              const isToday = sameDay(d, today);
              return (
                <span key={d.getTime()} role="gridcell" style={{ display: "flex", justifyContent: "center", padding: "1px 0" }}>
                  <button
                    type="button"
                    data-tk-date={isoDate(d)}
                    aria-label={fmtDay.format(d)}
                    aria-selected={sel}
                    aria-current={isToday ? "date" : undefined}
                    disabled={disabled}
                    tabIndex={sameDay(d, tabbableDate) ? 0 : -1}
                    onClick={() => pick(d)}
                    onKeyDown={(e) => moveFocus(d, e)}
                    className={disabled ? undefined : "tk-press"}
                    style={{
                      position: "relative",
                      width: 38,
                      height: 38,
                      border: "none",
                      borderRadius: mid ? 0 : "var(--tk-r-pill)",
                      fontFamily: "inherit",
                      fontSize: "var(--tk-fz-sub)",
                      fontWeight: sel || isToday ? 700 : 500,
                      fontVariantNumeric: "tabular-nums",
                      background: sel ? "var(--tk-accent)" : mid ? "var(--tk-accent-12)" : "transparent",
                      color: disabled
                        ? "var(--tk-text-3)"
                        : sel
                          ? "var(--tk-on-accent)"
                          : isToday
                            ? "var(--tk-accent-ink)"
                            : outside
                              ? "var(--tk-text-3)"
                              : "var(--tk-text)",
                      opacity: disabled ? 0.5 : 1,
                      cursor: disabled ? "default" : "pointer",
                      textDecoration: disabled ? "line-through" : "none",
                    }}
                  >
                    {d.getDate()}
                    {isToday && !sel ? (
                      <span
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          bottom: 5,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: "var(--tk-accent)",
                        }}
                      />
                    ) : null}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
        </div>
      )}
    </div>
  );
}

function CalendarPartTrigger({
  ariaLabel,
  expanded,
  capitalize,
  grow,
  width,
  onClick,
  children,
}: {
  ariaLabel: string;
  expanded: boolean;
  capitalize?: boolean;
  grow?: boolean;
  width?: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-expanded={expanded}
      onClick={onClick}
      style={{
        flex: grow ? "1 1 auto" : undefined,
        width,
        minWidth: 0,
        height: 34,
        border: "none",
        borderRadius: "var(--tk-r-md)",
        background: "var(--tk-surface-2)",
        color: "var(--tk-text)",
        font: "inherit",
        fontWeight: 700,
        padding: "0 8px 0 10px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
        cursor: "pointer",
        textTransform: capitalize ? "capitalize" : undefined,
        boxShadow: expanded ? "inset 0 0 0 1.5px var(--tk-accent)" : "none",
        transition: "box-shadow var(--tk-t2) var(--tk-ease)",
      }}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{children}</span>
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          color: "var(--tk-text-3)",
          transform: expanded ? "rotate(180deg)" : "none",
          transition: "transform var(--tk-t2) var(--tk-ease)",
        }}
      >
        <TKIcon name="chevronDown" size={15} />
      </span>
    </button>
  );
}

interface CalendarPartOption {
  value: number;
  label: string;
  selected: boolean;
}

function CalendarPartList({
  ariaLabel,
  options,
  onPick,
  columns,
  capitalize,
  autoScroll,
}: {
  ariaLabel: string;
  options: CalendarPartOption[];
  onPick: (value: number) => void;
  columns: number;
  capitalize?: boolean;
  autoScroll?: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!autoScroll) return;
    const selected = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    selected?.scrollIntoView?.({ block: "center" });
  }, [autoScroll]);
  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={ariaLabel}
      style={{
        maxHeight: 286,
        overflowY: "auto",
        overscrollBehavior: "contain",
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 6,
        padding: 2,
        scrollbarWidth: "thin",
      }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="option"
          aria-selected={o.selected}
          onClick={() => onPick(o.value)}
          className="tk-press"
          style={{
            height: 40,
            border: "none",
            borderRadius: "var(--tk-r-md)",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "var(--tk-fz-sub)",
            fontWeight: o.selected ? 700 : 500,
            fontVariantNumeric: "tabular-nums",
            textTransform: capitalize ? "capitalize" : undefined,
            background: o.selected ? "var(--tk-accent)" : "var(--tk-surface-2)",
            color: o.selected ? "var(--tk-on-accent)" : "var(--tk-text)",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
