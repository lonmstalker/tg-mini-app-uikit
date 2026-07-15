import { useCallback, useState } from "react";
import { useLatest } from "./useLatest";

/**
 * Options-object form of {@link useControllable} (INT-DX-007). Self-documents
 * which argument is the controlled value vs the default, and the optional
 * `name` is used in the dev-only controlled↔uncontrolled warning.
 */
export interface TKControllableOptions<T> {
  /** The controlled value, or `undefined` for uncontrolled. */
  value: T | undefined;
  /** Initial value when uncontrolled — read once, on first render. */
  defaultValue: T;
  onChange?: (value: T) => void;
  /** Component-prop label for the dev warning, e.g. `"TKSwitch.checked"`. */
  name?: string;
}

/**
 * Controlled/uncontrolled state helper. When `controlled` is defined the
 * component mirrors it and only reports changes through `onChange`.
 *
 * `defaultValue` is honored only on the first render (React semantics): a later
 * change to it is intentionally ignored. In development a one-time warning is
 * emitted when a value flips between controlled and uncontrolled (INT-004) — the
 * classic React footgun that silently drops state.
 *
 * Accepts either the positional form `(controlled, defaultValue, onChange)` or
 * the self-documenting options object `({ value, defaultValue, onChange, name })`.
 */
export function useControllable<T>(options: TKControllableOptions<T>): [T, (value: T) => void];
export function useControllable<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void];
export function useControllable<T>(
  a: T | undefined | TKControllableOptions<T>,
  b?: T,
  c?: (value: T) => void,
): [T, (value: T) => void] {
  // The options form is the sole argument; the positional form always passes
  // at least `controlled` and `defaultValue`.
  const isOptions = arguments.length === 1 && typeof a === "object" && a !== null && "defaultValue" in (a as object);
  const opts = isOptions ? (a as TKControllableOptions<T>) : null;
  const controlled = opts ? opts.value : (a as T | undefined);
  const defaultValue = opts ? opts.defaultValue : (b as T);
  const onChange = opts ? opts.onChange : c;
  const name = opts?.name;

  const [internal, setInternal] = useState(defaultValue);
  const isControlled = controlled !== undefined;
  const isControlledRef = useLatest(isControlled);

  if (process.env.NODE_ENV !== "production" && isControlledRef.current !== isControlled) {
    const label = name ?? "A useControllable value";
    const dir = isControlledRef.current ? "controlled to uncontrolled" : "uncontrolled to controlled";
    // eslint-disable-next-line no-console
    console.error(
      `${label} is changing from ${dir}. Pick one mode for its lifetime. ` +
        "For an async-loaded value, keep it controlled from the first render with " +
        "`value={data?.x ?? defaultValue}` instead of letting it start undefined.",
    );
  }

  const onChangeRef = useLatest(onChange);

  const set = useCallback((next: T) => {
    if (!isControlledRef.current) setInternal(next);
    onChangeRef.current?.(next);
  }, []);

  return [isControlled ? (controlled as T) : internal, set];
}
