import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKIconButton, TKMessageBubble, TKMessages, TKWriteBar } from "tg-mini-app-uikit";
import { AppScreen, Screen } from "../story-helpers";

const meta = {
  title: "Templates/Chat",
  parameters: {
    docs: {
      description: {
        component: "Chat template — message feed + write bar — for support, commerce, and assistant flows inside Mini Apps.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const SupportThread = {
  // Full chat screen: header on top, scrollable feed, write bar pinned at the bottom.
  parameters: { fullBleed: true },
  render: () => (
    <Screen>
      <div style={{ padding: "14px 16px", fontWeight: 700, borderBottom: "1px solid var(--tk-sep)" }}>Support chat</div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "12px 14px" }}>
        <TKMessages
          messages={[
            { id: "1", text: "Your delivery window is confirmed.", time: "12:01" },
            { id: "2", text: "Can I change the address?", out: true, time: "12:03", status: "read" },
            { id: "3", text: "Yes, send the updated address here.", time: "12:04" },
          ]}
        />
      </div>
      <TKWriteBar
        placeholder="Message"
        onSend={() => undefined}
        before={<TKIconButton icon="plus" label="Attach file" />}
        safeArea={false}
      />
    </Screen>
  ),
} satisfies Story;

export const BubbleStates = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <TKMessageBubble text="Incoming bubble" time="12:10" testId="chat-bubble-incoming" />
      <TKMessageBubble text="Outgoing delivered bubble" out status="delivered" time="12:11" />
      <TKMessageBubble text="Read bubble" out status="read" time="12:12" />
    </AppScreen>
  ),
} satisfies Story;
