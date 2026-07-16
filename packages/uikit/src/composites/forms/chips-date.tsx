import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TKInput } from "../../atoms/inputs";
import { TKSheet } from "../overlays";
import { TKIcon } from "../../atoms/icons";
import { useControllable } from "../../internal/useControllable";
import { useOptionalHaptics } from "../../foundation/telegram";
import { useTKLocale } from "../../foundation/i18n";
import { TKCalendar } from "./calendar";
import { TKNativeField } from "./native-input";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** `Date` → `yyyy-mm-dd` for a native date input. */
function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** `yyyy-mm-dd` → `Date` (local), or null when malformed. */
function fromISODate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

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

/**
 * Field order (day/month positions) the locale uses for a numeric date, derived
 * from `Intl.DateTimeFormat.formatToParts` so manual entry matches what the
 * field displays (e.g. en-US shows MM/DD/YYYY, ru-RU shows DD.MM.YYYY).
 */
// Cache the resolved order per locale so the Intl formatter is built once per
// language, not on every keystroke that parses a manual date.
const localeOrderCache = new Map<string, { dayFirst: boolean }>();

function localeDateOrder(lang: string): { dayFirst: boolean } {
  const cached = localeOrderCache.get(lang);
  if (cached) return cached;
  let result: { dayFirst: boolean } = { dayFirst: true };
  try {
    const parts = new Intl.DateTimeFormat(lang, { day: "2-digit", month: "2-digit", year: "numeric" }).formatToParts(
      new Date(2026, 0, 1),
    );
    // single pass: first day/month part decides the order
    const first = parts.find((p) => p.type === "day" || p.type === "month");
    result = { dayFirst: first?.type !== "month" };
  } catch {
    /* unknown locale — fall back to day-first */
  }
  localeOrderCache.set(lang, result);
  return result;
}

/** Build a real `Date` from y/m/d, rejecting overflow (e.g. month 13, day 32). */
function makeDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

/**
 * Parse manual date entry. Always accepts ISO `yyyy-mm-dd`; for the
 * two-numbers-then-year form the day/month order follows the locale (so US
 * users typing `mm/dd/yyyy` and others typing `dd/mm/yyyy` both work), and
 * falls back to the swapped order when the locale order is unambiguously
 * invalid (e.g. `17/02` can only be day-first since 17 is not a month).
 */
function parseDateInput(text: string, lang: string): Date | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const iso = trimmed.match(/^(\d{4})\D+(\d{1,2})\D+(\d{1,2})$/);
  if (iso) return makeDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const dmy = trimmed.match(/^(\d{1,2})\D+(\d{1,2})\D+(\d{4})$/);
  if (!dmy) return null;
  const a = Number(dmy[1]);
  const b = Number(dmy[2]);
  const year = Number(dmy[3]);
  const dayFirst = localeDateOrder(lang).dayFirst;
  // Primary interpretation follows the locale; the secondary swaps day/month.
  const primary = dayFirst ? makeDate(year, b, a) : makeDate(year, a, b);
  if (primary) return primary;
  return dayFirst ? makeDate(year, a, b) : makeDate(year, b, a);
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
  // Value of the tag that just collided, flashed once so a duplicate isn't
  // silently dropped. Cleared after the shake animation finishes.
  const [duplicate, setDuplicate] = useState<string | null>(null);
  const dupTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const haptics = useOptionalHaptics();

  useEffect(() => () => clearTimeout(dupTimer.current), []);

  const flashDuplicate = (tag: string) => {
    haptics.notification("warning");
    setDuplicate(tag);
    clearTimeout(dupTimer.current);
    dupTimer.current = setTimeout(() => setDuplicate(null), 400);
  };

  const commit = (text: string) => {
    const tag = text.trim();
    if (!tag) {
      setDraft("");
      return;
    }
    if (tags.includes(tag)) {
      // Surface the collision (shake + haptic) instead of dropping it silently.
      flashDuplicate(tag);
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
      {/* Mouse-only convenience: a click on the field chrome forwards focus to the
          real <input> (chips' remove buttons stopPropagation). Keyboard users Tab
          to the input directly, so this wrapper is presentational. */}
      <div
        role="presentation"
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
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className={duplicate === tag ? "tk-shake" : undefined}
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
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                setTags(tags.filter((t) => t !== tag));
              }}
              style={{
                display: "inline-flex",
                border: "none",
                background: "transparent",
                color: "inherit",
                cursor: disabled ? "default" : "pointer",
                opacity: 0.7,
                padding: 0,
              }}
            >
              <TKIcon name="close" size={12} strokeWidth={2.6} />
            </button>
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
            // Split on every comma, not just a trailing one, so pasting or typing
            // "red, green, blue" commits three chips and keeps the last segment as
            // the live draft (instead of one malformed comma-laden tag). All
            // complete segments are added in a single setTags so the batched
            // updates don't clobber one another, de-duping against existing tags.
            if (next.includes(",")) {
              const parts = next.split(",");
              const seen = new Set(tags);
              const additions: string[] = [];
              for (const part of parts.slice(0, -1)) {
                const tag = part.trim();
                if (tag && !seen.has(tag)) {
                  seen.add(tag);
                  additions.push(tag);
                }
              }
              if (additions.length) setTags([...tags, ...additions]);
              setDraft(parts[parts.length - 1].trimStart());
            } else {
              setDraft(next);
            }
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
  /** Use the OS-native `<input type="date">` picker instead of the sheet calendar. */
  native?: boolean;
  testId?: string;
}

/** Date field: native `<input type="date">` or the in-sheet `TKCalendar`. */
export function TKDateInput(props: TKDateInputProps) {
  return props.native ? <NativeDateInput {...props} /> : <SheetDateInput {...props} />;
}

function NativeDateInput({ value, defaultValue = null, onChange, label, min, max, disabled, hint, error, testId }: TKDateInputProps) {
  const [date, setDate] = useControllable<Date | null>(value, defaultValue, onChange);
  return (
    <TKNativeField
      type="date"
      icon="calendar"
      value={date ? toISODate(date) : ""}
      min={min ? toISODate(min) : undefined}
      max={max ? toISODate(max) : undefined}
      onChange={(next) => setDate(next ? fromISODate(next) : null)}
      label={label}
      hint={hint}
      error={error}
      disabled={disabled}
      testId={testId}
    />
  );
}

/** Date field that opens a `TKCalendar` inside a bottom sheet (mobile pattern). */
function SheetDateInput({
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
  const locale = useTKLocale();
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
  const [picker, setPicker] = useState<"none" | "month" | "year">("none");
  const manualChangeRef = useRef(false);

  // Key the sync effects on the date's VALUE (getTime), not the Date identity:
  // callers routinely pass `new Date(...)` inline for value/min/max, whose fresh
  // identity every render would otherwise re-run these — yanking the calendar
  // back to the selected month and clobbering a draft mid-edit. min/max/
  // defaultValue are intentionally NOT dependencies; the view follows only the
  // selected date and explicit actions.
  const dateTime = date ? date.getTime() : null;

  useEffect(() => {
    if (dateTime != null) setVisibleMonth(startOfMonth(new Date(dateTime)));
  }, [dateTime]);

  useEffect(() => {
    if (manualChangeRef.current) {
      manualChangeRef.current = false;
      return;
    }
    setDraft(dateTime != null ? fmt.format(new Date(dateTime)) : "");
    setManualError(null);
  }, [dateTime, fmt]);

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
    const parsed = parseDateInput(next, resolvedLang);
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
      {/* The field stays directly editable for manual entry; the calendar
          opens from its own trigger button — opening the sheet on any field
          click made manual entry unreachable on touch (a tap is the only way to
          focus, and it would pop the sheet over the keyboard). */}
      <TKInput
        label={label}
        placeholder={placeholder}
        value={draft}
        onChange={handleDraftChange}
        disabled={disabled}
        hint={hint}
        error={fieldError}
        suffix={
          <button
            type="button"
            aria-label={locale.openCalendar}
            aria-haspopup="dialog"
            aria-expanded={open}
            disabled={disabled}
            onClick={() => !disabled && setOpen(true)}
            className="tk-press"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "transparent",
              color: "var(--tk-text-3)",
              cursor: disabled ? "default" : "pointer",
              padding: 0,
            }}
          >
            <TKIcon name="calendar" size={20} />
          </button>
        }
      />
      <TKSheet
        open={open}
        onClose={() => {
          setPicker("none");
          setOpen(false);
        }}
        title={sheetTitle ?? label}
      >
        {/* Month / year triggers open an in-sheet listbox instead of a native
            `<select>`, whose OS popup balloons to full-screen on long lists. */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <DatePartTrigger
            ariaLabel="Month"
            expanded={picker === "month"}
            capitalize
            grow
            onClick={() => setPicker((p) => (p === "month" ? "none" : "month"))}
          >
            {monthFmt.format(visibleMonth)}
          </DatePartTrigger>
          <DatePartTrigger
            ariaLabel="Year"
            expanded={picker === "year"}
            width={104}
            onClick={() => setPicker((p) => (p === "year" ? "none" : "year"))}
          >
            {visibleMonth.getFullYear()}
          </DatePartTrigger>
        </div>
        {picker === "year" ? (
          <DatePartList
            ariaLabel="Year"
            columns={4}
            autoScroll
            options={years.map((year) => ({ value: year, label: String(year), selected: year === visibleMonth.getFullYear() }))}
            onPick={(year) => {
              setMonthPart(year, visibleMonth.getMonth());
              setPicker("none");
            }}
          />
        ) : picker === "month" ? (
          <DatePartList
            ariaLabel="Month"
            columns={3}
            capitalize
            options={Array.from({ length: 12 }, (_, month) => ({
              value: month,
              label: monthFmt.format(new Date(2026, month, 1)),
              selected: month === visibleMonth.getMonth(),
            }))}
            onPick={(month) => {
              setMonthPart(visibleMonth.getFullYear(), month);
              setPicker("none");
            }}
          />
        ) : (
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
            partSelectors={false}
            style={{ boxShadow: "none", padding: 0 }}
          />
        )}
      </TKSheet>
    </div>
  );
}

function DatePartTrigger({
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
        height: 40,
        border: "none",
        borderRadius: "var(--tk-r-md)",
        background: "var(--tk-surface-2)",
        color: "var(--tk-text)",
        font: "inherit",
        padding: "0 10px 0 12px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
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

interface DatePartOption {
  value: number;
  label: string;
  selected: boolean;
}

function DatePartList({
  ariaLabel,
  options,
  onPick,
  columns,
  capitalize,
  autoScroll,
}: {
  ariaLabel: string;
  options: DatePartOption[];
  onPick: (value: number) => void;
  columns: number;
  capitalize?: boolean;
  autoScroll?: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!autoScroll) return;
    const selected = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    // `scrollIntoView` is absent in jsdom — guard so unit tests don't throw.
    selected?.scrollIntoView?.({ block: "center" });
  }, [autoScroll]);
  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={ariaLabel}
      style={{
        maxHeight: 256,
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
            height: 44,
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
