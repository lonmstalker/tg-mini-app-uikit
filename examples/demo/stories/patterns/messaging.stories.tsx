import type { Meta } from "@storybook/react-vite";
import { TKIconButton, TKMessageBubble, TKMessages, TKWriteBar } from "tg-mini-app-uikit";
import { FrameStory, Section, noop } from "../story-helpers";

const meta = {
  title: "Patterns/Messaging",
  parameters: {
    docs: {
      description: {
        component: "Messaging patterns for chat-like Mini Apps: bubbles, grouped feeds, and write bars.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = Record<string, unknown>;

const messages = [
  { id: "1", text: "Hi, is the order ready?", time: "14:20" },
  { id: "2", text: "Yes, courier pickup starts at 15:00.", out: true, time: "14:21", status: "read" as const },
  { id: "3", text: "Perfect, thanks.", time: "14:22" },
];

export const ChatFeed = {
  render: () => (
    <FrameStory>
      <Section style={{ height: "100%", justifyContent: "space-between", padding: 12 }}>
        <TKMessages messages={messages} />
        <TKWriteBar before={<TKIconButton icon="plus" label="Attach" variant="plain" />} onSend={noop} safeArea={false} />
      </Section>
    </FrameStory>
  ),
} satisfies Story;

export const BubbleVariants = {
  render: () => (
    <Section>
      <TKMessageBubble text="Incoming message" time="09:41" />
      <TKMessageBubble text="Outgoing sent" out time="09:42" status="sent" />
      <TKMessageBubble text="Outgoing read" out time="09:43" status="read" />
    </Section>
  ),
} satisfies Story;
