import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKButton, TKIconButton, TKInlineButtons, TKMainButton, TKSpinner } from "tg-mini-app-uikit";
import { Narrow, Row, Section } from "../story-helpers";

const meta = {
  title: "Atoms/Buttons",
  parameters: {
    docs: {
      description: {
        component: "Atom action buttons, icon buttons, inline groups, loading indicators, and main actions.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const ButtonVariants = {
  render: () => (
    <Section>
      <Row>
        <TKButton>Filled</TKButton>
        <TKButton variant="tonal">Tonal</TKButton>
        <TKButton variant="outline">Outline</TKButton>
        <TKButton variant="destructive">Delete</TKButton>
      </Row>
      <Row>
        <TKButton icon="star" size="sm">
          Small
        </TKButton>
        <TKButton loading>Saving</TKButton>
        <TKButton as="a" href="https://example.com" variant="plain">
          Link action
        </TKButton>
      </Row>
    </Section>
  ),
} satisfies Story;

export const IconButtons = {
  render: () => (
    <Section>
      <Row>
        <TKIconButton icon="star" label="Favorite" />
        <TKIconButton icon="bell" label="Alerts" badge={3} />
        <TKIconButton icon="check" label="Done" active />
        <TKIconButton icon="close" label="Dismiss" variant="surface" />
      </Row>
    </Section>
  ),
} satisfies Story;

export const InlineButtons = {
  render: () => (
    <Narrow>
      <TKInlineButtons
        defaultValue="daily"
        items={[
          { id: "daily", label: "Daily", icon: "calendar" },
          { id: "weekly", label: "Weekly" },
          { id: "danger", label: "Reset", danger: true },
        ]}
      />
    </Narrow>
  ),
} satisfies Story;

export const MainButtonAndSpinner = {
  render: () => (
    <Section>
      <Narrow>
        <TKMainButton label="Pay" />
        <TKMainButton label="Processing" status="loading" />
        <TKMainButton label="Pay" successLabel="Paid" status="success" />
      </Narrow>
      <Row>
        <TKSpinner />
      </Row>
    </Section>
  ),
} satisfies Story;
