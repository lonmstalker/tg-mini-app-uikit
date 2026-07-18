import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TKTabView } from "tg-mini-app-uikit";
import { useVerticalSwipes, useViewport } from "@tg-mini-app/telegram";
import { useT } from "./i18n";
import { TABS, type TabId } from "./tabs";
import { MockBadge } from "./components/MockBadge";
import { Onboarding } from "./components/Onboarding";
import { DiscoverStack } from "./features/discover/DiscoverStack";
import { TripsStack } from "./features/trips/TripsStack";
import { ProfileStack } from "./features/profile/ProfileStack";
import { TrainStack } from "./features/train/TrainStack";
import { GuideStack } from "./features/guide/GuideStack";
import { TabNavProvider } from "./tab-nav";

/*
 * Persistent app shell. Each tab keeps its own mounted TKNavStack so switching
 * tabs preserves that stack's depth and scroll; inactive tabs are hidden with
 * `display:none` rather than unmounted, which retains their scroll position.
 */
export function App() {
  const t = useT();
  const [active, setActive] = useState(0);
  const [depthByTab, setDepthByTab] = useState<Record<TabId, number>>({
    discover: 1,
    trips: 1,
    train: 1,
    guide: 1,
    profile: 1,
  });
  const verticalSwipes = useVerticalSwipes();
  const viewport = useViewport();
  const tabbarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Defense-in-depth: a stray vertical drag should never minimize the Mini App.
  // The kit's overlays/page already guard this; disabling at the app root closes
  // the last gap. (No-op outside Telegram / when unsupported.)
  useEffect(() => {
    // A real client can launch the app half-height — claim the full viewport
    // once at startup. (No-op outside Telegram; idempotent when already expanded.)
    viewport.expand();
    verticalSwipes.disable();
    return () => {
      verticalSwipes.enable();
    };
    // run once for the app's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabItems = useMemo(
    () => TABS.map((tab) => ({ icon: tab.icon, label: t(tab.labelKey) })),
    [t],
  );

  const activeTab = TABS[active]?.id ?? "discover";
  const setTabDepth = useCallback((tab: TabId, depth: number) => {
    setDepthByTab((prev) => (prev[tab] === depth ? prev : { ...prev, [tab]: depth }));
  }, []);

  // Real root screens replace the placeholder spine as each milestone lands.
  const screens: Record<TabId, ReactNode> = {
    discover: <DiscoverStack visible={activeTab === "discover"} onDepthChange={(depth) => setTabDepth("discover", depth)} />,
    trips: <TripsStack visible={activeTab === "trips"} onDepthChange={(depth) => setTabDepth("trips", depth)} />,
    train: <TrainStack onDepthChange={(depth) => setTabDepth("train", depth)} />,
    guide: <GuideStack visible={activeTab === "guide"} onDepthChange={(depth) => setTabDepth("guide", depth)} />,
    profile: <ProfileStack visible={activeTab === "profile"} onDepthChange={(depth) => setTabDepth("profile", depth)} />,
  };

  const goToTab = (id: TabId) => {
    const next = TABS.findIndex((tab) => tab.id === id);
    if (next >= 0) setActive(next);
  };

  return (
    <TabNavProvider goToTab={goToTab}>
      <div
        data-testid="app-shell"
        // Capped at the bridge's stable viewport, not bare 100dvh: dvh tracks
        // the LAYOUT viewport, which Telegram iOS resizes LAST when the
        // keyboard opens — the shell stayed full-height, WebKit scrolled 345px
        // down to reveal the composer, then the late webview resize snapped
        // the scroll back (the two-jump "screen jerks" report, KB-4 tail).
        // The stable var lands ~400ms earlier, so the shell shrinks together
        // with the keyboard animation and WebKit never needs to pan.
        style={{
          height: "min(100dvh, var(--tg-viewport-stable-height, 100dvh))",
          display: "flex",
          flexDirection: "column",
          background: "var(--tk-bg)",
        }}
      >
        <TKTabView
          testId="tabbar"
          tabs={tabItems}
          panels={TABS.map((tab) => screens[tab.id])}
          panelTestId={(index) => `tab-panel-${TABS[index].id}`}
          value={active}
          onChange={setActive}
          hideTabbar={(depthByTab[activeTab] ?? 1) > 1}
          safeArea
          contentRef={contentRef}
          tabbarRef={tabbarRef}
        />
        <MockBadge />
        <Onboarding tabbarRef={tabbarRef} contentRef={contentRef} />
      </div>
    </TabNavProvider>
  );
}
