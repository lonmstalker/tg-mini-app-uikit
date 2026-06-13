import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKCaption, TKText, TKTitle } from "tg-mini-app-uikit";
import { Narrow, Section } from "../story-helpers";

const meta = {
  title: "Tokens/Typography",
  parameters: {
    docs: {
      description: {
        component: "Token-backed typography components for titles, body text, captions, tones, and truncation.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const TypeScale = {
  render: () => (
    <Section>
      <Narrow>
        <TKCaption uppercase>Type scale</TKCaption>
        <TKTitle level={1}>Checkout summary</TKTitle>
        <TKTitle level={2}>Payment method</TKTitle>
        <TKText as="p" tone="secondary">
          Compact text stays readable inside a narrow Telegram WebView while using semantic token sizes.
        </TKText>
        <TKText tone="accent" weight={600}>
          Accent text uses the same primary token as selected controls.
        </TKText>
      </Narrow>
    </Section>
  ),
} satisfies Story;
