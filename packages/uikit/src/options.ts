import type { ReactNode } from "react";
import type { TKIconName } from "./icons";

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

/** Normalizes a `TKOption` to the object form with a guaranteed label. */
export function tkOptionItem(option: TKOption): TKOptionItem & { label: ReactNode } {
  return typeof option === "string"
    ? { value: option, label: option }
    : { ...option, label: option.label ?? option.value };
}
