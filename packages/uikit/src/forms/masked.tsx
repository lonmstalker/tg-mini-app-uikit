import { forwardRef, useEffect, useState } from "react";
import { TKInput, type TKInputProps } from "../inputs";
import { useControllable } from "../internal/useControllable";

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
  const digits = text.replace(/\D/g, "");
  if (!digits) return { formatted: "", raw: "" };

  const explicitDial = explicitDialCode(text, defaultDial);
  const dial = explicitDial ?? defaultDial;
  const capacity = maskCapacity(numberMask);
  const national = (explicitDial == null ? digits : digits.slice(dial.length)).slice(0, capacity);
  const number = tkApplyMask(numberMask, national);
  const formatted = number ? `+${dial} ${number}` : `+${dial}`;
  return { formatted, raw: `${dial}${national}` };
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
  { value, defaultValue = "", onChange, ...rest },
  ref,
) {
  const [draft, setDraft] = useState(value ?? defaultValue);

  useEffect(() => {
    if (value !== undefined) setDraft(value);
  }, [value]);

  return (
    <TKMaskedInput
      {...rest}
      ref={ref}
      value={draft}
      mask="##:##"
      onChange={(fmt, raw) => {
        setDraft(fmt);
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
