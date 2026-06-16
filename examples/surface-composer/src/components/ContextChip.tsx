/*
 * Demo-only wrapper over the kit's TKChip (Principle II — composition, not a new
 * export). Used by the business switcher; keeps a single styling/behaviour seam
 * for the four context chips.
 */
import type { ReactNode } from "react";
import { TKChip, type TKIconName } from "tg-mini-app-uikit";

export interface ContextChipProps {
  selected?: boolean;
  icon?: TKIconName;
  onClick?: () => void;
  children: ReactNode;
}

export function ContextChip({ selected, icon, onClick, children }: ContextChipProps) {
  return (
    <TKChip selected={selected} icon={icon} onClick={onClick}>
      {children}
    </TKChip>
  );
}
