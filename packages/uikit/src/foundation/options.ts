import type { ReactNode } from "react";
import type { TKIconName } from "../atoms/icons";

/**
 * Option accepted by selection components (`TKSelect`, `TKSegmented`,
 * `TKRadioGroup`, `TKChipGroup`, `TKCategoryTabs`): either a plain string
 * or a full item with a separate value, label, icon and disabled flag.
 */
export type TKOption = string | TKOptionItem;

export interface TKOptionItem {
  value: string;
  /** Visible label; defaults to `value`. */
  label?: ReactNode;
  disabled?: boolean;
  icon?: TKIconName;
}

/** A labeled group of options (renders as a section header in dropdowns). */
export interface TKOptionGroup {
  label: ReactNode;
  options: TKOption[];
}

export function tkIsOptionGroup(option: TKOption | TKOptionGroup): option is TKOptionGroup {
  return typeof option === "object" && option !== null && "options" in option;
}

/** Flattens options/groups into items with their group label attached. */
export function tkFlattenOptions(
  options: Array<TKOption | TKOptionGroup>,
): Array<TKOptionItem & { label: ReactNode; group?: ReactNode }> {
  const out: Array<TKOptionItem & { label: ReactNode; group?: ReactNode }> = [];
  for (const entry of options) {
    if (tkIsOptionGroup(entry)) {
      for (const option of entry.options) out.push({ ...tkOptionItem(option), group: entry.label });
    } else {
      out.push(tkOptionItem(entry));
    }
  }
  return out;
}

/** Normalizes a `TKOption` to the object form with a guaranteed label. */
export function tkOptionItem(option: TKOption): TKOptionItem & { label: ReactNode } {
  return typeof option === "string"
    ? { value: option, label: option }
    : { ...option, label: option.label ?? option.value };
}
