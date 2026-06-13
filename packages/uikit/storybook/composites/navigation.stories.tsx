import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TKButton,
  TKCategoryTabs,
  TKFrame,
  TKHeader,
  TKIconButton,
  TKPageDots,
  TKSegmented,
  TKSteps,
  TKTabbar,
} from "tg-mini-app-uikit";
import { Narrow, Row, Section, options } from "../story-helpers";

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
  render: () => (
    <TKFrame height={520}>
      <div style={{ minHeight: "100%", display: "grid", gridTemplateRows: "auto 1fr auto" }}>
        <TKHeader
          title="Orders"
          subtitle="3 active deliveries"
          actions={<TKIconButton icon="settings" label="Order settings" />}
        />
        <Section>
          <Narrow>
            <div style={{ fontWeight: 700 }}>Today</div>
            <div style={{ color: "var(--tk-text-2)" }}>Courier pickup is scheduled for 18:30.</div>
            <TKButton full>Open route</TKButton>
          </Narrow>
        </Section>
        <TKTabbar
          tabs={[
            { icon: "home", label: "Home" },
            { icon: "bell", label: "Alerts", count: 4 },
            { icon: "settings", label: "Settings" },
          ]}
          value={1}
          safeArea
        />
      </div>
    </TKFrame>
  ),
} satisfies Story;

export const SegmentedAndTabs = {
  render: () => (
    <TKFrame height={380}>
      <Section>
        <Narrow>
          <TKSegmented options={options} defaultValue="two" full />
          <TKCategoryTabs tabs={["All", "Paid", "Pending", "Archived"]} defaultValue={1} />
          <div style={{ color: "var(--tk-text-2)" }}>Paid orders are ready for settlement.</div>
        </Narrow>
      </Section>
    </TKFrame>
  ),
} satisfies Story;

export const StepsAndDots = {
  render: () => (
    <TKFrame height={360}>
      <Section>
        <Narrow>
          <TKSteps steps={["Cart", "Pay", "Confirm"]} current={1} />
          <Row style={{ justifyContent: "center" }}>
            <TKPageDots count={4} defaultPage={1} />
          </Row>
        </Narrow>
      </Section>
    </TKFrame>
  ),
} satisfies Story;
