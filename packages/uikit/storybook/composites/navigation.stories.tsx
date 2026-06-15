import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TKButton,
  TKCategoryTabs,
  TKHeader,
  TKIconButton,
  TKPageDots,
  TKSegmented,
  TKSteps,
  TKTabbar,
  TKTabView,
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
