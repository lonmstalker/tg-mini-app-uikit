import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TKButton,
  TKCategoryTabs,
  TKHeader,
  TKIconButton,
  TKKeepMountTab,
  TKKeepMountTabs,
  TKPageDots,
  TKSegmented,
  TKSteps,
  TKTabbar,
  TKTabView,
  useTabActive,
} from "tg-mini-app-uikit";
import { AppScreen, Narrow, Row, Screen, options } from "../story-helpers";

function TabViewDemo() {
  const [tab, setTab] = useState(0);
  const body = (label: string) => (
    <div style={{ padding: 20, height: "100%", display: "grid", placeItems: "center", fontWeight: 600 }}>{label}</div>
  );
  return (
    <TKTabView
      value={tab}
      onChange={setTab}
      safeArea
      tabs={[
        { icon: "home", label: "Home" },
        { icon: "search", label: "Search" },
        { icon: "user", label: "You" },
      ]}
      panels={[body("Home — kept mounted"), body("Search"), body("You")]}
    />
  );
}

const meta = {
  title: "Composites/Navigation",
  parameters: {
    docs: {
      description: {
        component: "Reusable navigation composites: app headers, bottom tabs, segmented controls, category tabs, steps, and page dots.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const HeaderAndTabbar = {
  // App-shell screen: fills the device, header pinned on top, tabbar on the bottom.
  parameters: { fullBleed: true },
  render: () => (
    <Screen>
      <TKHeader
        title="Orders"
        subtitle="3 active deliveries"
        actions={<TKIconButton icon="settings" label="Order settings" />}
      />
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontWeight: 700 }}>Today</div>
        <div style={{ color: "var(--tk-text-2)" }}>Courier pickup is scheduled for 18:30.</div>
        <TKButton full>Open route</TKButton>
      </div>
      <TKTabbar
        tabs={[
          { icon: "home", label: "Home" },
          { icon: "bell", label: "Alerts", count: 4 },
          { icon: "settings", label: "Settings" },
        ]}
        value={1}
        safeArea
      />
    </Screen>
  ),
} satisfies Story;

// A7: an unbroken header title must ellipsize next to its actions, and long
// category labels stay usable because the tab row is a deliberate horizontal
// scroller (the reflow sweep allows overflow-x scrollers by design).
const UNBROKEN_TITLE = "Grundstücksverkehrsgenehmigungszuständigkeitsübertragungsverordnung";

export const StressHeader = {
  parameters: { fullBleed: true },
  render: () => (
    <Screen>
      <TKHeader
        title={UNBROKEN_TITLE}
        subtitle={`Расширенный подзаголовок: ${UNBROKEN_TITLE}`}
        actions={<TKIconButton icon="settings" label="Настройки заказа" />}
      />
      <div style={{ padding: "10px 0" }}>
        <TKCategoryTabs
          tabs={["Все категории сразу", "Электротранспорт и аксессуары", UNBROKEN_TITLE, "Скидки"]}
          defaultValue={0}
        />
      </div>
      <div style={{ flex: 1 }} />
    </Screen>
  ),
} satisfies Story;

export const SegmentedAndTabs = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <Narrow>
        <TKSegmented options={options} defaultValue="two" full />
        <TKCategoryTabs tabs={["All", "Paid", "Pending", "Archived"]} defaultValue={1} />
        <div style={{ color: "var(--tk-text-2)" }}>Paid orders are ready for settlement.</div>
      </Narrow>
    </AppScreen>
  ),
} satisfies Story;

export const StepsAndDots = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <Narrow>
        <TKSteps steps={["Cart", "Pay", "Confirm"]} current={1} />
        <Row style={{ justifyContent: "center" }}>
          <TKPageDots count={4} defaultPage={1} />
        </Row>
      </Narrow>
    </AppScreen>
  ),
} satisfies Story;

export const TabView = {
  // Keep-mounted bottom tabs: each panel survives a tab switch; the tabbar hides
  // on a deep screen or when the keyboard is up.
  parameters: { fullBleed: true },
  render: () => <TabViewDemo />,
} satisfies Story;

function PollingScreen({ label }: { label: string }) {
  const active = useTabActive();
  const [ticks, setTicks] = useState(0);
  // The whole point of useTabActive: a hidden-but-mounted tab stops polling.
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTicks((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return (
    <div style={{ padding: 20, display: "grid", gap: 8 }}>
      <strong>{label}</strong>
      <span>
        polling ticks: {ticks} ({active ? "polling" : "paused — tab hidden"})
      </span>
      <input placeholder="type here, switch tabs, come back" style={{ padding: 8 }} />
    </div>
  );
}

function KeepMountDemo() {
  const [tab, setTab] = useState("a");
  return (
    <Narrow>
      <TKSegmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "a", label: "Tab A" },
          { value: "b", label: "Tab B" },
        ]}
      />
      <TKKeepMountTabs active={tab}>
        <TKKeepMountTab id="a">
          <PollingScreen label="Tab A" />
        </TKKeepMountTab>
        <TKKeepMountTab id="b">
          <PollingScreen label="Tab B" />
        </TKKeepMountTab>
      </TKKeepMountTabs>
    </Narrow>
  );
}

export const KeepMountTabs = {
  // Visited tabs stay mounted (input/scroll state survives a switch); a hidden
  // tab reads useTabActive()=false and pauses its polling.
  render: () => <KeepMountDemo />,
} satisfies Story;

/**
 * REU-004/005/007: the header outside the TKPage slot (`variant="plain"`,
 * real heading semantics) and a tabbar with a custom SVG glyph, a ReactNode
 * label and consumer style overrides.
 */
export const OutsideThePageSlot = {
  parameters: { fullBleed: true },
  render: () => {
    const debtsIcon = (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <path d="M4 7h16v10H4zM4 11h16M8 15h3" />
      </svg>
    );
    return (
      <Screen>
        <TKHeader title="История" variant="plain" headingLevel={1} />
        <div style={{ flex: 1 }} />
        <TKTabbar
          style={{ background: "var(--tk-surface)" }}
          tabs={[
            { icon: "home", label: "Главная" },
            { icon: debtsIcon, label: "Долги" },
            { icon: "clock", label: <em>История</em> },
          ]}
        />
      </Screen>
    );
  },
} satisfies Story;
