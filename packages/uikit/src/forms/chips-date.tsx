import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TKInput } from "../inputs";
import { TKSheet } from "../overlays";
import { TKIcon } from "../icons";
import { useControllable } from "../internal/useControllable";
import { TKCalendar } from "./calendar";

function documentLang(): string {
  if (typeof document !== "undefined" && document.documentElement.lang) return document.documentElement.lang;
  return "en";
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function sameDate(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isAllowedDate(d: Date, min?: Date, max?: Date, disabledDates?: (date: Date) => boolean): boolean {
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (min && day < new Date(min.getFullYear(), min.getMonth(), min.getDate()).getTime()) return false;
  if (max && day > new Date(max.getFullYear(), max.getMonth(), max.getDate()).getTime()) return false;
  return !disabledDates?.(d);
}

function parseDateInput(text: string): Date | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const iso = trimmed.match(/^(\d{4})\D+(\d{1,2})\D+(\d{1,2})$/);
  const parts = iso
    ? [Number(iso[3]), Number(iso[2]), Number(iso[1])]
    : (trimmed.match(/^(\d{1,2})\D+(\d{1,2})\D+(\d{4})$/)?.slice(1).map(Number) ?? null);
  if (!parts) return null;

  const [day, month, year] = parts;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function shouldValidateDateInput(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/[^0-9\s./-]/.test(trimmed)) return true;
  return trimmed.replace(/\D/g, "").length >= 8;
}

function yearRange(min?: Date, max?: Date): number[] {
  const now = new Date().getFullYear();
  const first = min?.getFullYear() ?? now - 100;
  const last = max?.getFullYear() ?? now + 20;
  return Array.from({ length: Math.max(1, last - first + 1) }, (_, i) => first + i);
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
  /** Message shown when manual entry is not a real allowed date. */
  invalidText?: ReactNode;
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
  invalidText = "Enter a valid date",
  testId,
}: TKDateInputProps) {
  const [date, setDate] = useControllable<Date | null>(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  const resolvedLang = lang ?? documentLang();
  const fmt = useMemo(() => new Intl.DateTimeFormat(resolvedLang, { day: "2-digit", month: "2-digit", year: "numeric" }), [resolvedLang]);
  const monthFmt = useMemo(() => new Intl.DateTimeFormat(resolvedLang, { month: "long" }), [resolvedLang]);
  const years = useMemo(() => yearRange(min, max), [min, max]);
  const initialMonth = startOfMonth(date ?? defaultValue ?? max ?? min ?? new Date());
  const [visibleMonth, setVisibleMonth] = useState(initialMonth);
  const [draft, setDraft] = useState(date ? fmt.format(date) : "");
  const [manualError, setManualError] = useState<ReactNode>(null);
  const manualChangeRef = useRef(false);

  useEffect(() => {
    setVisibleMonth(startOfMonth(date ?? defaultValue ?? max ?? min ?? new Date()));
  }, [date, defaultValue, max, min]);

  useEffect(() => {
    if (manualChangeRef.current) {
      manualChangeRef.current = false;
      return;
    }
    setDraft(date ? fmt.format(date) : "");
    setManualError(null);
  }, [date, fmt]);

  const setMonthPart = (year: number, month: number) => {
    setVisibleMonth(startOfMonth(new Date(year, month, 1)));
  };

  const handleDraftChange = (next: string) => {
    setDraft(next);
    if (!next.trim()) {
      setManualError(null);
      manualChangeRef.current = true;
      setDate(null);
      return;
    }
    const parsed = parseDateInput(next);
    if (!parsed || !isAllowedDate(parsed, min, max, disabledDates)) {
      if (shouldValidateDateInput(next)) {
        setManualError(invalidText);
        manualChangeRef.current = true;
        setDate(null);
      }
      return;
    }
    setManualError(null);
    if (sameDate(parsed, date)) return;
    manualChangeRef.current = true;
    setVisibleMonth(startOfMonth(parsed));
    setDate(parsed);
  };
  const fieldError = error ?? manualError;

  return (
    <div data-testid={testId}>
      <div onClick={() => !disabled && setOpen(true)}>
        <TKInput
          label={label}
          icon="calendar"
          placeholder={placeholder}
          value={draft}
          onChange={handleDraftChange}
          disabled={disabled}
          hint={hint}
          error={fieldError}
        />
      </div>
      <TKSheet open={open} onClose={() => setOpen(false)} title={sheetTitle ?? label}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 92px", gap: 8, marginBottom: 10 }}>
          <DatePartSelect
            ariaLabel="Month"
            value={visibleMonth.getMonth()}
            onChange={(next) => setMonthPart(visibleMonth.getFullYear(), Number(next))}
          >
            {Array.from({ length: 12 }, (_, month) => (
              <option key={month} value={month}>
                {monthFmt.format(new Date(2026, month, 1))}
              </option>
            ))}
          </DatePartSelect>
          <DatePartSelect
            ariaLabel="Year"
            value={visibleMonth.getFullYear()}
            onChange={(next) => setMonthPart(Number(next), visibleMonth.getMonth())}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </DatePartSelect>
        </div>
        <TKCalendar
          month={visibleMonth}
          onMonthChange={setVisibleMonth}
          value={date}
          onChange={(d) => {
            setManualError(null);
            setDate(d);
            setDraft(fmt.format(d));
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

function DatePartSelect({
  ariaLabel,
  value,
  onChange,
  children,
}: {
  ariaLabel: string;
  value: string | number;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <span style={{ position: "relative", display: "block", minWidth: 0 }}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          width: "100%",
          height: 40,
          border: "none",
          borderRadius: "var(--tk-r-md)",
          background: "var(--tk-surface-2)",
          color: "var(--tk-text)",
          font: "inherit",
          padding: "0 34px 0 10px",
          textTransform: ariaLabel === "Month" ? "capitalize" : undefined,
        }}
      >
        {children}
      </select>
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 11,
          top: "50%",
          transform: "translateY(-50%)",
          display: "inline-flex",
          color: "var(--tk-text-3)",
          pointerEvents: "none",
        }}
      >
        <TKIcon name="chevronDown" size={15} />
      </span>
    </span>
  );
}
