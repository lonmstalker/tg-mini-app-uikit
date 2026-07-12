import type { ChangeEvent, ReactNode } from "react";

export * from "./input";
export * from "./form-field";
export * from "./textarea";
export * from "./selectable";

/**
 * Shared field contract every form control should extend (INP-DX-001 / CC-15),
 * so swapping one field for another is a zero-surprise edit. `onChange` is
 * value-first with an OPTIONAL native event, so a `(value) => void` handler is
 * always assignable. `V` is the value type (`string`, `string[]`, `boolean`, …).
 */
export interface TKFieldProps<V> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  /** Form-submission field name. */
  name?: string;
  id?: string;
  testId?: string;
  value?: V;
  defaultValue?: V;
  /** Value-first; the native `event` is present only for native `<input>`-backed
   *  controls and is `undefined` for click/keyboard-driven ones (radio, select). */
  onChange?: (value: V, event?: ChangeEvent<HTMLElement>) => void;
}
