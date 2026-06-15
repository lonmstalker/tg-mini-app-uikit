import type { TKIconName } from "tg-mini-app-uikit";
import type { DictKey } from "./i18n";

export type TabId = "discover" | "trips" | "train" | "guide" | "profile";

export interface TabDef {
  id: TabId;
  icon: TKIconName;
  /** i18n key for the tabbar label. */
  labelKey: DictKey;
}

/** The five tabs, in display order. */
export const TABS: TabDef[] = [
  { id: "discover", icon: "home", labelKey: "tab.discover" },
  { id: "trips", icon: "ticket", labelKey: "tab.trips" },
  { id: "train", icon: "fire", labelKey: "tab.train" },
  { id: "guide", icon: "chat", labelKey: "tab.guide" },
  { id: "profile", icon: "user", labelKey: "tab.profile" },
];
