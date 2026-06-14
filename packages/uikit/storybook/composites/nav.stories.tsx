import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKButton, TKCell, TKListGroup, TKNavPanel, TKNavStack, useNav } from "tg-mini-app-uikit";
import { Narrow, Screen, Section } from "../story-helpers";

const meta = {
  title: "Composites/Nav",
  parameters: {
    docs: {
      description: {
        component: "Stack navigation for Mini App panels with preserved panel state, swipe-back, and Telegram BackButton integration.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

function InboxPanel() {
  const nav = useNav();
  return (
    <Section>
      <Narrow>
        <TKListGroup title="Inbox">
          <TKCell title="Order #1408" subtitle="Tap to inspect delivery details" chevron onClick={() => nav.push("details", { order: 1408 })} />
          <TKCell title="Order #1409" subtitle="Awaiting payment" chevron onClick={() => nav.push("details", { order: 1409 })} />
        </TKListGroup>
      </Narrow>
    </Section>
  );
}

function DetailsPanel() {
  const nav = useNav();
  const params = nav.params as { order?: number };
  return (
    <Section>
      <Narrow>
        <div style={{ fontWeight: 700 }}>Order #{params.order}</div>
        <div style={{ color: "var(--tk-text-2)" }}>Courier pickup, payment status, and customer notes.</div>
        <TKButton full onClick={() => nav.pop()}>
          Back to inbox
        </TKButton>
      </Narrow>
    </Section>
  );
}

export const StackFlow = {
  parameters: { fullBleed: true },
  render: () => (
    <Screen>
      <TKNavStack initial="inbox" swipeBack="edge" testId="nav-story-stack" style={{ flex: 1, minHeight: 0 }}>
        <TKNavPanel id="inbox">
          <InboxPanel />
        </TKNavPanel>
        <TKNavPanel id="details">
          <DetailsPanel />
        </TKNavPanel>
      </TKNavStack>
    </Screen>
  ),
} satisfies Story;
