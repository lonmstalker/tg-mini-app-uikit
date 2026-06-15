import { createContext, use, type ReactNode } from "react";
import type { TabId } from "./tabs";

/*
 * Lets a screen deep inside one tab's nav stack jump to another tab (e.g. the
 * checkout success CTA → Trips). App owns the active-tab state and provides the
 * setter here so features don't need to thread it through props.
 */
const TabNavContext = createContext<(tab: TabId) => void>(() => {});

export function TabNavProvider({ goToTab, children }: { goToTab: (tab: TabId) => void; children: ReactNode }) {
  return <TabNavContext.Provider value={goToTab}>{children}</TabNavContext.Provider>;
}

export function useGoToTab(): (tab: TabId) => void {
  return use(TabNavContext);
}
