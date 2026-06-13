import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { TKIcon } from "./icons";
import { TKIconButton } from "./buttons";
import { TKInput, type TKInputProps } from "./inputs";
import { TKSheet } from "./overlays";
import { useTKLocale } from "./i18n";
import { useControllable } from "./internal/useControllable";

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

/* ---------------- Masked input ---------------- */

export interface TKMaskedInputProps extends Omit<TKInputProps, "value" | "defaultValue" | "onChange" | "type"> {
  /** Mask template: `#` is a digit, anything else is a literal (e.g. `(###) ###-##-##`). */
  mask: string;
  value?: string;
  defaultValue?: string;
  /** Receives the formatted value and the raw digits. */
  onChange?: (formatted: string, raw: string) => void;
  inputMode?: "numeric" | "tel";
}

/** Applies a `#`-mask to a digit string (literals stop after the last digit). */
export function tkApplyMask(mask: string, raw: string): string {
  if (!raw) return "";
  let out = "";
  let di = 0;
  for (const ch of mask) {
    if (di >= raw.length) break;
    out += ch === "#" ? raw[di++] : ch;
  }
  return out;
}

export const TKMaskedInput = /* @__PURE__ */ forwardRef<HTMLInputElement, TKMaskedInputProps>(function TKMaskedInput(
  { mask, value, defaultValue = "", onChange, inputMode = "numeric", ...rest },
  ref,
) {
  const capacity = (mask.match(/#/g) ?? []).length;
  const toRaw = (s: string) => s.replace(/\D/g, "").slice(0, capacity);
  const [formatted, setFormatted] = useControllable(
    value,
    tkApplyMask(mask, toRaw(defaultValue)),
    undefined,
  );
  return (
    <TKInput
      {...rest}
      ref={ref}
      type="text"
      value={formatted}
      onChange={(next) => {
        const raw = toRaw(next);
        const fmt = tkApplyMask(mask, raw);
        setFormatted(fmt);
        onChange?.(fmt, raw);
      }}
    />
  );
});

export interface TKPhoneInputProps extends Omit<TKMaskedInputProps, "mask"> {
  /** Dial code prefix, e.g. `+7` (default) or `+380`. */
  defaultCountry?: string;
  /** National number mask after the dial code. */
  numberMask?: string;
}

export const TKPhoneInput = /* @__PURE__ */ forwardRef<HTMLInputElement, TKPhoneInputProps>(function TKPhoneInput(
  { defaultCountry = "+7", numberMask = "(###) ###-##-##", ...rest },
  ref,
) {
  return <TKMaskedInput {...rest} ref={ref} mask={`${defaultCountry} ${numberMask}`} inputMode="tel" />;
});

/* ---------------- Pin input ---------------- */

export interface TKPinInputProps {
  length?: number;
  onComplete?: (pin: string) => void;
  /** Shows the error shake and clears the entered digits. */
  error?: boolean;
  /** Adds a biometrics key to the pad. */
  onBiometricRequest?: () => void;
  title?: ReactNode;
  testId?: string;
  style?: CSSProperties;
}

/** PIN screen: dot indicators + on-screen 3×4 keypad, optional biometrics key. */
export function TKPinInput({ length = 4, onComplete, error, onBiometricRequest, title, testId, style }: TKPinInputProps) {
  const locale = useTKLocale();
  const [pin, setPin] = useState("");
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    if (error) setPin("");
  }, [error]);

  const push = (digit: string) => {
    setPin((p) => {
      if (p.length >= length) return p;
      const next = p + digit;
      if (next.length === length) {
        completeRef.current?.(next);
        return "";
      }
      return next;
    });
  };

  const keyStyle: CSSProperties = {
    height: 56,
    border: "none",
    borderRadius: "var(--tk-r-md)",
    background: "var(--tk-surface)",
    boxShadow: "var(--tk-shadow-sm)",
    fontFamily: "inherit",
    fontSize: "var(--tk-fz-title3)",
    fontWeight: 600,
    color: "var(--tk-text)",
    cursor: "pointer",
  };

  return (
    <div data-testid={testId} className={error ? "tk-shake" : undefined} style={{ display: "flex", flexDirection: "column", gap: 18, ...style }}>
      {title}
      <div aria-live="polite" style={{ display: "flex", gap: 14, justifyContent: "center" }}>
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: i < pin.length ? "var(--tk-accent)" : "var(--tk-surface-3)",
              boxShadow: error ? "0 0 0 2px var(--tk-red-12)" : "none",
              transition: "background var(--tk-t1) var(--tk-ease)",
            }}
          />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" className="tk-press" style={keyStyle} onClick={() => push(d)}>
            {d}
          </button>
        ))}
        {onBiometricRequest ? (
          <button
            type="button"
            className="tk-press"
            aria-label={locale.biometrics}
            style={{ ...keyStyle, color: "var(--tk-accent-ink)" }}
            onClick={onBiometricRequest}
          >
            <TKIcon name="fingerprint" size={24} />
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="tk-press" style={keyStyle} onClick={() => push("0")}>
          0
        </button>
        <button
          type="button"
          className="tk-press"
          aria-label={locale.backspace}
          style={{ ...keyStyle, color: "var(--tk-text-2)" }}
          onClick={() => setPin((p) => p.slice(0, -1))}
        >
          <TKIcon name="backspace" size={22} />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Chips input ---------------- */

export interface TKChipsInputProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  testId?: string;
}

/** Tag editor: Enter or comma commits a tag, Backspace removes the last one. */
export function TKChipsInput({ value, defaultValue = [], onChange, placeholder, label, hint, error, disabled, testId }: TKChipsInputProps) {
  const [tags, setTags] = useControllable(value, defaultValue, onChange);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [focus, setFocus] = useState(false);

  const commit = (text: string) => {
    const tag = text.trim();
    if (!tag || tags.includes(tag)) {
      setDraft("");
      return;
    }
    setTags([...tags, tag]);
    setDraft("");
  };

  const borderColor = error ? "var(--tk-red)" : focus ? "var(--tk-accent)" : "transparent";
  return (
    <div data-testid={testId} style={{ opacity: disabled ? 0.55 : 1 }}>
      {label ? (
        <div
          style={{
            fontSize: "var(--tk-fz-caption)",
            fontWeight: 600,
            letterSpacing: ".04em",
            textTransform: "uppercase",
            color: focus ? "var(--tk-accent)" : "var(--tk-text-2)",
            margin: "0 14px 6px",
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: "flex",
          flexWrap: "nowrap",
          overflowX: "auto",
          scrollbarWidth: "none",
          alignItems: "center",
          gap: 6,
          minHeight: 48,
          padding: "6px 14px",
          background: "var(--tk-surface)",
          borderRadius: "var(--tk-r-md)",
          boxShadow: `inset 0 0 0 1.5px ${borderColor}${focus && !error ? ", var(--tk-ring)" : ""}`,
          transition: "box-shadow var(--tk-t2) var(--tk-ease)",
          cursor: "text",
        }}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 8px",
              borderRadius: "var(--tk-r-pill)",
              background: "var(--tk-accent-12)",
              color: "var(--tk-accent-ink)",
              fontSize: "var(--tk-fz-caption)",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {tag}
            <span
              role="button"
              aria-label={`${tag} ×`}
              onClick={(e) => {
                e.stopPropagation();
                setTags(tags.filter((t) => t !== tag));
              }}
              style={{ display: "inline-flex", cursor: "pointer", opacity: 0.7 }}
            >
              <TKIcon name="close" size={12} strokeWidth={2.6} />
            </span>
          </span>
        ))}
        <input
          ref={inputRef}
          value={draft}
          aria-label={typeof label === "string" ? label : placeholder}
          placeholder={tags.length ? undefined : placeholder}
          disabled={disabled}
          onChange={(e) => {
            const next = e.target.value;
            if (next.endsWith(",")) commit(next.slice(0, -1));
            else setDraft(next);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(draft);
            } else if (e.key === "Backspace" && !draft && tags.length) {
              setTags(tags.slice(0, -1));
            }
          }}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            minWidth: 90,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "var(--tk-fz-body)",
            fontFamily: "inherit",
            color: "var(--tk-text)",
            boxShadow: "none",
          }}
        />
      </div>
      {hint || error ? (
        <div style={{ fontSize: "var(--tk-fz-caption)", color: error ? "var(--tk-red)" : "var(--tk-text-2)", margin: "6px 14px 0" }}>
          {error || hint}
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- Date / time fields ---------------- */

export interface TKDateInputProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  label?: ReactNode;
  placeholder?: string;
  min?: Date;
  max?: Date;
  disabledDates?: (date: Date) => boolean;
  weekStartsOn?: 0 | 1;
  lang?: string;
  /** Title of the picker sheet. */
  sheetTitle?: ReactNode;
  disabled?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  testId?: string;
}

/** Date field that opens a `TKCalendar` inside a bottom sheet (mobile pattern). */
export function TKDateInput({
  value,
  defaultValue = null,
  onChange,
  label,
  placeholder,
  min,
  max,
  disabledDates,
  weekStartsOn,
  lang,
  sheetTitle,
  disabled,
  hint,
  error,
  testId,
}: TKDateInputProps) {
  const [date, setDate] = useControllable<Date | null>(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  const resolvedLang = lang ?? documentLang();
  const fmt = useMemo(() => new Intl.DateTimeFormat(resolvedLang, { day: "2-digit", month: "2-digit", year: "numeric" }), [resolvedLang]);
  return (
    <div data-testid={testId}>
      <div onClick={() => !disabled && setOpen(true)}>
        <TKInput
          label={label}
          icon="calendar"
          placeholder={placeholder}
          value={date ? fmt.format(date) : ""}
          onChange={() => {}}
          clearable={false}
          disabled={disabled}
          hint={hint}
          error={error}
        />
      </div>
      <TKSheet open={open} onClose={() => setOpen(false)} title={sheetTitle ?? label}>
        <TKCalendar
          defaultMonth={date ?? undefined}
          value={date}
          onChange={(d) => {
            setDate(d);
            setOpen(false);
          }}
          min={min}
          max={max}
          disabledDates={disabledDates}
          weekStartsOn={weekStartsOn}
          lang={lang}
          style={{ boxShadow: "none", padding: 0 }}
        />
      </TKSheet>
    </div>
  );
}

export interface TKTimeInputProps extends Omit<TKMaskedInputProps, "mask" | "onChange"> {
  /** Receives `HH:MM` once the value is complete and valid, else null. */
  onChange?: (time: string | null) => void;
}

/**
 * Time field as a masked `HH:MM` input (chosen over wheel pickers: cheaper,
 * keyboard-friendly and consistent with TKMaskedInput — see Decision Log).
 */
export const TKTimeInput = /* @__PURE__ */ forwardRef<HTMLInputElement, TKTimeInputProps>(function TKTimeInput(
  { onChange, ...rest },
  ref,
) {
  return (
    <TKMaskedInput
      {...rest}
      ref={ref}
      mask="##:##"
      onChange={(fmt, raw) => {
        if (raw.length < 4) {
          onChange?.(null);
          return;
        }
        const h = Number(raw.slice(0, 2));
        const m = Number(raw.slice(2));
        onChange?.(h < 24 && m < 60 ? fmt : null);
      }}
    />
  );
});
