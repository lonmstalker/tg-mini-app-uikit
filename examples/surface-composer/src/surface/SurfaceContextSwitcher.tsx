/*
 * The business-type switcher: four chips (shop / booking / wallet / support).
 * `community` is deliberately absent — it is reached through the US2 remix set,
 * not the switcher (D7). Each chip is a real button, so Tab + Enter reach every
 * context (a11y parity, FR-011); the live remix behaviour is injected via
 * `onSelect` so the same control drives US1 selection and US2 remix.
 */
import type { TKIconName } from "tg-mini-app-uikit";
import { ContextChip } from "../components/ContextChip";
import { useT, type DictKey } from "../i18n";
import type { BusinessContext } from "../app/composerReducer";

const CHIPS: ReadonlyArray<{ id: Exclude<BusinessContext, "community">; icon: TKIconName; key: DictKey }> = [
  { id: "shop", icon: "cart", key: "switcher.shop" },
  { id: "booking", icon: "calendar", key: "switcher.booking" },
  { id: "wallet", icon: "wallet", key: "switcher.wallet" },
  { id: "support", icon: "chat", key: "switcher.support" },
];

export interface SurfaceContextSwitcherProps {
  value: BusinessContext;
  onSelect: (context: BusinessContext) => void;
}

export function SurfaceContextSwitcher({ value, onSelect }: SurfaceContextSwitcherProps) {
  const t = useT();
  return (
    <div className="sc-switcher" role="group" aria-label={t("switcher.aria")} data-testid="switcher">
      {CHIPS.map((c) => (
        <ContextChip key={c.id} selected={value === c.id} onClick={() => onSelect(c.id)} icon={c.icon}>
          {t(c.key)}
        </ContextChip>
      ))}
    </div>
  );
}
