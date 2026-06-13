import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKFrame, TKIconButton, TKMessageBubble, TKMessages, TKWriteBar } from "tg-mini-app-uikit";
import { Section } from "../story-helpers";

const meta = {
  title: "Composites/Chat",
  parameters: {
    docs: {
      description: {
        component: "Chat feed and write bar surfaces for support, commerce, and assistant flows inside Mini Apps.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const SupportThread = {
  render: () => (
    <TKFrame height={520}>
      <div style={{ minHeight: "100%", display: "grid", gridTemplateRows: "auto 1fr auto" }}>
        <div style={{ padding: "14px 16px", fontWeight: 700, borderBottom: "1px solid var(--tk-sep)" }}>Support chat</div>
        <Section style={{ alignSelf: "end" }}>
          <TKMessages
            messages={[
              { id: "1", text: "Your delivery window is confirmed.", time: "12:01" },
              { id: "2", text: "Can I change the address?", out: true, time: "12:03", status: "read" },
              { id: "3", text: "Yes, send the updated address here.", time: "12:04" },
            ]}
          />
        </Section>
        <TKWriteBar
          placeholder="Message"
          onSend={() => undefined}
          before={<TKIconButton icon="plus" label="Attach file" />}
          safeArea={false}
        />
      </div>
    </TKFrame>
  ),
} satisfies Story;

export const BubbleStates = {
  render: () => (
    <TKFrame height={320}>
      <Section>
        <TKMessageBubble text="Incoming bubble" time="12:10" testId="chat-bubble-incoming" />
        <TKMessageBubble text="Outgoing delivered bubble" out status="delivered" time="12:11" />
        <TKMessageBubble text="Read bubble" out status="read" time="12:12" />
      </Section>
    </TKFrame>
  ),
} satisfies Story;
