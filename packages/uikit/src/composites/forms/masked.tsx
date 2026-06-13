import { forwardRef, useEffect, useState, type ReactNode } from "react";
import { TKInput, type TKInputProps } from "../../atoms/inputs";
import { useControllable } from "../../internal/useControllable";

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
  { defaultCountry = "+7", numberMask = "(###) ###-##-##", value, defaultValue = "", onChange, ...rest },
  ref,
) {
  const defaultDial = normalizeDialCode(defaultCountry);
  const initial = formatPhoneValue(defaultValue, defaultDial, numberMask).formatted;
  const [internal, setInternal] = useState(initial);
  const display = value === undefined ? internal : formatPhoneValue(value, defaultDial, numberMask).formatted;

  const commit = (nextValue: string) => {
    const next = formatPhoneValue(nextValue, defaultDial, numberMask);
    if (value === undefined) setInternal(next.formatted);
    onChange?.(next.formatted, next.raw);
  };

  return <TKInput {...rest} ref={ref} value={display} onChange={commit} inputMode="tel" />;
});

function normalizeDialCode(country: string): string {
  return country.replace(/\D/g, "") || "7";
}

function maskCapacity(mask: string): number {
  return (mask.match(/#/g) ?? []).length;
}

function explicitDialCode(text: string, fallback: string): string | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("+")) return null;
  const separated = trimmed.match(/^\+(\d{1,3})(?=\D|$)/);
  if (separated) return separated[1];
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  return digits.slice(0, Math.min(fallback.length, digits.length));
}

function formatPhoneValue(text: string, defaultDial: string, numberMask: string): { formatted: string; raw: string } {
  const trimmed = text.trim();
  const startsWithDialPrefix = trimmed.startsWith("+");
  const digits = text.replace(/\D/g, "");
  if (!digits) return startsWithDialPrefix ? { formatted: "+", raw: "" } : { formatted: "", raw: "" };

  const explicitDial = explicitDialCode(text, defaultDial);
  const dial = explicitDial ?? defaultDial;
  const capacity = maskCapacity(numberMask);
  const national = (explicitDial == null ? digits : digits.slice(dial.length)).slice(0, capacity);
  const number = tkApplyMask(numberMask, national);
  const afterDial = startsWithDialPrefix ? trimmed.slice(1 + dial.length) : "";
  const hasDialSeparator = explicitDial != null && /^\D/.test(afterDial);
  const formatted = number ? `+${dial} ${number}` : hasDialSeparator ? `+${dial} ` : `+${dial}`;
  return { formatted, raw: `${dial}${national}` };
}

export interface TKTimeInputProps extends Omit<TKMaskedInputProps, "mask" | "onChange" | "inputMode"> {
  /** Receives canonical 24-hour `HH:MM` once a full valid time is entered, else null. */
  onChange?: (time: string | null) => void;
  /** Render a 12-hour clock with an AM/PM toggle. The emitted value stays canonical 24h. */
  hour12?: boolean;
  /** Shown when the field is left holding an incomplete entry. */
  invalidText?: ReactNode;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

function parseClock(text: string): { h: number; m: number } | null {
  const mt = /^(\d{1,2}):(\d{2})$/.exec(text.trim());
  if (!mt) return null;
  const h = Number(mt[1]);
  const m = Number(mt[2]);
  return h <= 23 && m <= 59 ? { h, m } : null;
}

/**
 * Sanitise raw digits so they can only ever form a real time. A single
 * oversized lead digit is promoted (24h `9`→`09`, minutes `7`→`07`) so the
 * field auto-advances instead of swallowing the keypress, and two-digit parts
 * are clamped to their range — `99:99` can never be typed.
 */
function clampTimeDigits(raw: string, hour12: boolean): string {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  if (!d) return "";
  const maxLead = hour12 ? 1 : 2;
  let hour: string;
  let rest: string;
  if (Number(d[0]) > maxLead) {
    hour = "0" + d[0];
    rest = d.slice(1);
  } else {
    hour = d.slice(0, 2);
    rest = d.slice(2);
  }
  if (hour.length === 2) {
    let hv = Number(hour);
    hv = hour12 ? (hv === 0 ? 12 : Math.min(hv, 12)) : Math.min(hv, 23);
    hour = pad2(hv);
  }
  let min = "";
  if (rest.length) {
    min = Number(rest[0]) > 5 ? "0" + rest[0] : rest.slice(0, 2);
    if (min.length === 2) min = pad2(Math.min(Number(min), 59));
  }
  return hour + min;
}

/** Canonical 24h string → display digits for the chosen clock. */
function toDigits(value: string, hour12: boolean): string {
  const clock = parseClock(value);
  if (clock) {
    const h = hour12 ? (clock.h % 12 === 0 ? 12 : clock.h % 12) : clock.h;
    return pad2(h) + pad2(clock.m);
  }
  return clampTimeDigits(value, hour12);
}

function digitsToCanonical(digits: string, hour12: boolean, meridiem: "AM" | "PM"): string | null {
  if (digits.length < 4) return null;
  const h = Number(digits.slice(0, 2));
  const m = Number(digits.slice(2));
  const h24 = hour12 ? (meridiem === "PM" ? (h % 12) + 12 : h % 12) : h;
  return `${pad2(h24)}:${pad2(m)}`;
}

function meridiemOf(value: string): "AM" | "PM" {
  const clock = parseClock(value);
  return clock && clock.h >= 12 ? "PM" : "AM";
}

/**
 * Time field as a masked input that can only ever hold a real time (chosen
 * over wheel pickers: cheaper, keyboard-friendly — see Decision Log). Set
 * `hour12` for a 12-hour clock with an AM/PM toggle; the value emitted by
 * `onChange` is always canonical 24-hour `HH:MM`.
 */
export const TKTimeInput = /* @__PURE__ */ forwardRef<HTMLInputElement, TKTimeInputProps>(function TKTimeInput(
  { value, defaultValue = "", onChange, hour12 = false, invalidText = "Enter a valid time", error, disabled, onBlur, suffix, ...rest },
  ref,
) {
  const initial = value ?? defaultValue;
  const [digits, setDigits] = useState(() => toDigits(initial, hour12));
  const [meridiem, setMeridiem] = useState<"AM" | "PM">(() => meridiemOf(initial));
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (value === undefined) return;
    setDigits(toDigits(value, hour12));
    setMeridiem(meridiemOf(value));
  }, [value, hour12]);

  const commit = (nextDigits: string, nextMeridiem: "AM" | "PM") => {
    onChange?.(digitsToCanonical(nextDigits, hour12, nextMeridiem));
  };

  const handleText = (next: string) => {
    const clamped = clampTimeDigits(next, hour12);
    setDigits(clamped);
    commit(clamped, meridiem);
  };

  const pickMeridiem = (next: "AM" | "PM") => {
    setMeridiem(next);
    commit(digits, next);
  };

  const incomplete = touched && digits.length > 0 && digits.length < 4;

  return (
    <TKInput
      {...rest}
      ref={ref}
      type="text"
      inputMode="numeric"
      disabled={disabled}
      value={tkApplyMask("##:##", digits)}
      onChange={handleText}
      error={error ?? (incomplete ? invalidText : undefined)}
      onBlur={(e) => {
        setTouched(true);
        onBlur?.(e);
      }}
      suffix={
        hour12 ? (
          <span
            role="group"
            aria-label="AM or PM"
            style={{ display: "inline-flex", gap: 2, padding: 2, borderRadius: "var(--tk-r-pill)", background: "var(--tk-surface-2)" }}
          >
            {(["AM", "PM"] as const).map((m) => {
              const on = meridiem === m;
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={on}
                  disabled={disabled}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickMeridiem(m)}
                  style={{
                    border: "none",
                    borderRadius: "var(--tk-r-pill)",
                    padding: "3px 8px",
                    fontFamily: "inherit",
                    fontSize: "var(--tk-fz-caption)",
                    fontWeight: 700,
                    cursor: disabled ? "default" : "pointer",
                    background: on ? "var(--tk-accent)" : "transparent",
                    color: on ? "var(--tk-on-accent)" : "var(--tk-text-2)",
                  }}
                >
                  {m}
                </button>
              );
            })}
          </span>
        ) : (
          suffix
        )
      }
    />
  );
});
