import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TKButton, TKFrame, TKPullToRefresh, TKSwipeCell, useLongPress } from "tg-mini-app-uikit";
import { Narrow, Section } from "../story-helpers";

const meta = {
  title: "Composites/Gestures",
  parameters: {
    docs: {
      description: {
        component: "Reusable gesture composites: pull-to-refresh, swipe actions, and long press handlers.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const PullToRefresh = {
  render: () => (
    <TKFrame height={360}>
      <TKPullToRefresh onRefresh={() => Promise.resolve()} style={{ height: 300 }}>
        <Section>
          <Narrow>
            <div>Pull feed to refresh</div>
            <div>Latest transactions</div>
          </Narrow>
        </Section>
      </TKPullToRefresh>
    </TKFrame>
  ),
} satisfies Story;

export const SwipeActions = {
  render: () => (
    <TKFrame height={240}>
      <Section>
        <TKSwipeCell trailing={[{ label: "Delete", icon: "trash", tone: "red", onAction: () => undefined }]}>
          <div style={{ padding: 16, background: "var(--tk-surface)" }}>Swipe row</div>
        </TKSwipeCell>
      </Section>
    </TKFrame>
  ),
} satisfies Story;

function LongPressPreview() {
  const [state, setState] = useState("Waiting");
  const handlers = useLongPress(() => setState("Long press fired"));
  return (
    <Section>
      <Narrow>
        <TKButton {...handlers} variant="surface">
          Hold action
        </TKButton>
        <div>{state}</div>
      </Narrow>
    </Section>
  );
}

export const LongPress = {
  render: () => (
    <TKFrame height={260}>
      <LongPressPreview />
    </TKFrame>
  ),
} satisfies Story;
