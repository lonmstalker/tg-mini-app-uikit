import { forwardRef, useEffect, useId, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { TKFormField, TKInput, type TKInputProps } from "../../atoms/inputs";
import { TKIcon } from "../../atoms/icons";
import { useTKLocale } from "../../foundation/i18n";
import { useControllable } from "../../internal/useControllable";
import { tkBuildCountries, tkCountryFlag, tkResolveCountry, type TKPhoneCountry } from "./phone-countries";
import { TKNativeField } from "./native-input";

function phoneDocumentLang(): string {
  if (typeof document !== "undefined" && document.documentElement.lang) return document.documentElement.lang;
  return "en";
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
  /** Initial country as an ISO code (`"RU"`) or a dial code (`"+7"`, default). */
  defaultCountry?: string;
  /** National number mask after the dial code (overrides the country preset). */
  numberMask?: string;
  /**
   * Split the field into a country picker (a native `<select>`, so the OS shows
   * its own wheel/list) plus a national-number input. Lets users dial any
   * country instead of typing the code by hand.
   */
  countrySelect?: boolean;
  /** Country list for the picker (defaults to the full ISO list, localized via `lang`). */
  countries?: readonly TKPhoneCountry[];
  /** BCP-47 language for localized country names (defaults to the document language). */
  lang?: string;
}

export const TKPhoneInput = /* @__PURE__ */ forwardRef<HTMLInputElement, TKPhoneInputProps>(function TKPhoneInput(
  { defaultCountry = "+7", numberMask, countrySelect, countries, lang, value, defaultValue = "", onChange, ...rest },
  ref,
) {
  if (countrySelect) {
    return (
      <TKPhoneCountryField
        ref={ref}
        defaultCountry={defaultCountry}
        numberMask={numberMask}
        countries={countries}
        lang={lang}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        {...rest}
      />
    );
  }
  const defaultDial = normalizeDialCode(defaultCountry);
  const mask = numberMask ?? "(###) ###-##-##";
  const initial = formatPhoneValue(defaultValue, defaultDial, mask).formatted;
  const [internal, setInternal] = useState(initial);
  const display = value === undefined ? internal : formatPhoneValue(value, defaultDial, mask).formatted;

  const commit = (nextValue: string) => {
    const next = formatPhoneValue(nextValue, defaultDial, mask);
    if (value === undefined) setInternal(next.formatted);
    onChange?.(next.formatted, next.raw);
  };

  return <TKInput {...rest} ref={ref} value={display} onChange={commit} inputMode="tel" />;
});

/** Country-picker variant: native `<select>` for the dial code + national field. */
const TKPhoneCountryField = /* @__PURE__ */ forwardRef<HTMLInputElement, TKPhoneInputProps>(function TKPhoneCountryField(
  { defaultCountry = "+7", numberMask, countries, lang, value, defaultValue = "", onChange, label, hint, error, disabled, placeholder, testId },
  ref,
) {
  const locale = useTKLocale();
  const fieldId = useId();
  const list = useMemo(
    () => (countries && countries.length ? countries : tkBuildCountries(lang ?? phoneDocumentLang())),
    [countries, lang],
  );

  const parse = (text: string): { country: TKPhoneCountry; digits: string } => {
    const raw = (text ?? "").replace(/\D/g, "");
    let country = tkResolveCountry(defaultCountry, list);
    if ((text ?? "").trim().startsWith("+") && raw) {
      const match = [...list].sort((a, b) => b.dial.length - a.dial.length).find((c) => raw.startsWith(c.dial));
      if (match) country = match;
    }
    const digits = raw.startsWith(country.dial) ? raw.slice(country.dial.length) : raw;
    return { country, digits };
  };

  const initial = parse(value ?? defaultValue);
  const [country, setCountry] = useState(initial.country);
  const [digits, setDigits] = useState(initial.digits);
  const [focus, setFocus] = useState(false);

  // Re-sync when used as a controlled field.
  useEffect(() => {
    if (value === undefined) return;
    const next = parse(value);
    setCountry(next.country);
    setDigits(next.digits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const mask = numberMask ?? country.mask;
  const capacity = maskCapacity(mask);
  const national = tkApplyMask(mask, digits.slice(0, capacity));

  const emit = (nextCountry: TKPhoneCountry, nextDigits: string) => {
    const formatted = nextDigits ? `+${nextCountry.dial} ${tkApplyMask(numberMask ?? nextCountry.mask, nextDigits)}` : `+${nextCountry.dial}`;
    onChange?.(formatted, `${nextCountry.dial}${nextDigits}`);
  };

  const onPickCountry = (index: number) => {
    const next = list[index];
    if (!next) return;
    const trimmed = digits.slice(0, maskCapacity(numberMask ?? next.mask));
    if (value === undefined) setCountry(next);
    if (value === undefined) setDigits(trimmed);
    emit(next, trimmed);
  };

  const onTypeNumber = (text: string) => {
    const next = text.replace(/\D/g, "").slice(0, capacity);
    if (value === undefined) setDigits(next);
    emit(country, next);
  };

  const selectedIndex = list.indexOf(country);
  const borderColor = error ? "var(--tk-red)" : focus ? "var(--tk-accent)" : "transparent";
  const cellStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: 48,
    background: "var(--tk-surface)",
    borderRadius: "var(--tk-r-md)",
    boxShadow: `inset 0 0 0 1.5px ${borderColor}${focus && !error ? ", var(--tk-ring)" : ""}`,
    transition: "box-shadow var(--tk-t2) var(--tk-ease)",
    opacity: disabled ? 0.55 : 1,
  };

  return (
    <TKFormField label={label} hint={hint} error={error} htmlFor={fieldId} disabled={disabled} testId={testId}>
      <div style={cellStyle}>
        <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 4, padding: "0 10px 0 14px", height: "100%", fontSize: "var(--tk-fz-body)", color: "var(--tk-text)", whiteSpace: "nowrap" }}>
          <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>{tkCountryFlag(country.iso)}</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>+{country.dial}</span>
          <span aria-hidden style={{ display: "inline-flex", color: "var(--tk-text-3)" }}>
            <TKIcon name="chevronDown" size={15} />
          </span>
          <select
            aria-label={locale.countryCode}
            disabled={disabled}
            value={selectedIndex >= 0 ? selectedIndex : ""}
            onChange={(e) => onPickCountry(Number(e.target.value))}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, border: "none", cursor: disabled ? "default" : "pointer", appearance: "none", fontSize: 16 }}
          >
            {list.map((c, i) => (
              <option key={`${c.iso}-${c.dial}`} value={i}>
                {tkCountryFlag(c.iso)} {c.name} +{c.dial}
              </option>
            ))}
          </select>
        </span>
        <span aria-hidden style={{ width: 1, alignSelf: "stretch", margin: "10px 0", background: "var(--tk-sep)" }} />
        <input
          ref={ref}
          id={fieldId}
          type="text"
          inputMode="tel"
          disabled={disabled}
          value={national}
          placeholder={placeholder ?? mask}
          aria-invalid={!!error}
          onChange={(e) => onTypeNumber(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{ flex: 1, minWidth: 0, height: "100%", border: "none", outline: "none", background: "transparent", padding: "0 14px", fontSize: "var(--tk-fz-body)", fontFamily: "inherit", color: "var(--tk-text)", fontVariantNumeric: "tabular-nums", boxShadow: "none" }}
        />
      </div>
    </TKFormField>
  );
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
  /** Use the OS-native `<input type="time">` picker instead of the masked field. */
  native?: boolean;
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
export const TKTimeInput = /* @__PURE__ */ forwardRef<HTMLInputElement, TKTimeInputProps>(function TKTimeInput(props, ref) {
  if (props.native) return <TKNativeTimeField {...props} ref={ref} />;
  return <TKMaskedTimeField {...props} ref={ref} />;
});

const TKNativeTimeField = /* @__PURE__ */ forwardRef<HTMLInputElement, TKTimeInputProps>(function TKNativeTimeField(
  { value, defaultValue = "", onChange, label, hint, error, disabled, name, testId },
  ref,
) {
  const [internal, setInternal] = useState(value ?? defaultValue);
  const current = value ?? internal;
  return (
    <TKNativeField
      ref={ref}
      type="time"
      icon="clock"
      value={current}
      onChange={(next) => {
        if (value === undefined) setInternal(next);
        onChange?.(next || null);
      }}
      label={label}
      hint={hint}
      error={error}
      disabled={disabled}
      name={name}
      testId={testId}
    />
  );
});

const TKMaskedTimeField = /* @__PURE__ */ forwardRef<HTMLInputElement, TKTimeInputProps>(function TKMaskedTimeField(
  { value, defaultValue = "", onChange, hour12 = false, invalidText = "Enter a valid time", error, disabled, onBlur, suffix, native: _native, ...rest },
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
