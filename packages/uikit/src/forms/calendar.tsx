import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { TKIconButton } from "../buttons";
import { useTKLocale } from "../i18n";
import { useControllable } from "../internal/useControllable";

/* ---------------- Calendar ---------------- */

export type TKDateRange = [Date, Date];

export interface TKCalendarProps {
  mode?: "single" | "range";
  /** Selected date (single mode). */
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  /** Selected range (range mode). */
  range?: TKDateRange | null;
  defaultRange?: TKDateRange | null;
  onRangeChange?: (range: TKDateRange) => void;
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
  testId?: string;
  style?: CSSProperties;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
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
  testId,
  style,
}: TKCalendarProps) {
  const locale = useTKLocale();
  const resolvedLang = lang ?? documentLang();
  const [selected, setSelected] = useControllable<Date | null>(value, defaultValue, onChange as (d: Date | null) => void);
  const [selectedRange, setSelectedRange] = useControllable<TKDateRange | null>(
    range,
    defaultRange,
    onRangeChange as (r: TKDateRange | null) => void,
  );
  const [pendingStart, setPendingStart] = useState<Date | null>(null);
  const initialMonth = defaultMonth ?? (mode === "range" ? selectedRange?.[0] : selected) ?? new Date();
  const [visibleMonth, setVisibleMonth] = useControllable<Date>(month, startOfDay(initialMonth), onMonthChange);
  const [focusDate, setFocusDate] = useState<Date | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const fmtDay = useMemo(
    () => new Intl.DateTimeFormat(resolvedLang, { month: "long", day: "numeric", year: "numeric" }),
    [resolvedLang],
  );
  const fmtMonth = useMemo(() => new Intl.DateTimeFormat(resolvedLang, { month: "long", year: "numeric" }), [resolvedLang]);
  const fmtWeekday = useMemo(() => new Intl.DateTimeFormat(resolvedLang, { weekday: "short" }), [resolvedLang]);

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
      setSelectedRange(null);
    } else {
      const [a, b] = pendingStart <= d ? [pendingStart, d] : [d, pendingStart];
      setPendingStart(null);
      setSelectedRange([a, b]);
    }
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
    setFocusDate(next);
    if (next.getMonth() !== visibleMonth.getMonth() || next.getFullYear() !== visibleMonth.getFullYear()) {
      setVisibleMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  // focus follows keyboard navigation across month switches
  useEffect(() => {
    if (!focusDate || !gridRef.current) return;
    const btn = gridRef.current.querySelector<HTMLButtonElement>(`[data-tk-date="${focusDate.toDateString()}"]`);
    btn?.focus();
  }, [focusDate, visibleMonth]);

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
        <TKIconButton icon="chevronLeft" size="sm" variant="plain" label={locale.prevMonth} onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))} />
        <span style={{ fontWeight: 700, fontSize: "var(--tk-fz-body)", textTransform: "capitalize" }}>
          {fmtMonth.format(visibleMonth)}
        </span>
        <TKIconButton icon="chevronRight" size="sm" variant="plain" label={locale.nextMonth} onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))} />
      </div>
      <div ref={gridRef} role="grid" aria-label={fmtMonth.format(visibleMonth)}>
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
              return (
                <span key={d.getTime()} role="gridcell" style={{ display: "flex", justifyContent: "center", padding: "1px 0" }}>
                  <button
                    type="button"
                    data-tk-date={d.toDateString()}
                    aria-label={fmtDay.format(d)}
                    aria-pressed={sel}
                    disabled={disabled}
                    tabIndex={sameDay(d, tabbableDate) ? 0 : -1}
                    onClick={() => pick(d)}
                    onKeyDown={(e) => moveFocus(d, e)}
                    className={disabled ? undefined : "tk-press"}
                    style={{
                      width: 38,
                      height: 38,
                      border: "none",
                      borderRadius: mid ? 0 : "var(--tk-r-pill)",
                      fontFamily: "inherit",
                      fontSize: "var(--tk-fz-sub)",
                      fontWeight: sel ? 700 : 500,
                      fontVariantNumeric: "tabular-nums",
                      background: sel ? "var(--tk-accent)" : mid ? "var(--tk-accent-12)" : "transparent",
                      color: disabled
                        ? "var(--tk-text-3)"
                        : sel
                          ? "var(--tk-on-accent)"
                          : outside
                            ? "var(--tk-text-3)"
                            : "var(--tk-text)",
                      opacity: disabled ? 0.5 : 1,
                      cursor: disabled ? "default" : "pointer",
                      textDecoration: disabled ? "line-through" : "none",
                    }}
                  >
                    {d.getDate()}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
