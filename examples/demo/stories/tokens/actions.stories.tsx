import type { Meta } from "@storybook/react-vite";
import { TKButton, TKIconButton, TKInlineButtons, TKMainButton, TKSpinner, TKWalletConnectButton } from "tg-mini-app-uikit";
import { Narrow, Row, Section, noop } from "../story-helpers";

const meta = {
  title: "Tokens/Actions",
  parameters: {
    docs: {
      description: {
        component: "Action primitives: buttons, icon buttons, inline action groups, and Telegram-style primary actions.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = Record<string, unknown>;

type ButtonArgs = {
  label: string;
  variant: "filled" | "tonal" | "outline" | "plain" | "destructive" | "surface";
  size: "sm" | "md" | "lg";
  full: boolean;
  loading: boolean;
  disabled: boolean;
};

export const Buttons = {
  args: {
    label: "Continue",
    variant: "filled",
    size: "md",
    full: false,
    loading: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: "select", options: ["filled", "tonal", "outline", "plain", "destructive", "surface"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  render: (args: ButtonArgs) => (
    <Section>
      <TKButton {...args}>{args.label}</TKButton>
      <Row>
        <TKButton>Filled</TKButton>
        <TKButton variant="tonal">Tonal</TKButton>
        <TKButton variant="outline">Outline</TKButton>
        <TKButton variant="plain">Plain</TKButton>
        <TKButton variant="destructive" icon="trash">
          Remove
        </TKButton>
        <TKButton loading>Processing</TKButton>
      </Row>
    </Section>
  ),
} satisfies Story;

export const IconButtons = {
  render: () => (
    <Row>
      <TKIconButton icon="bell" label="Notifications" badge />
      <TKIconButton icon="heart" label="Favorite" variant="tonal" active />
      <TKIconButton icon="share" label="Share" variant="plain" />
      <TKIconButton icon="settings" label="Settings" variant="surface" badge={3} />
    </Row>
  ),
} satisfies Story;

export const InlineActions = {
  render: () => (
    <Narrow>
      <TKInlineButtons
        items={[
          { id: "pay", label: "Pay", icon: "cart", selected: true },
          { id: "share", label: "Share", icon: "share" },
          { id: "remove", label: "Remove", icon: "trash", danger: true },
        ]}
      />
    </Narrow>
  ),
} satisfies Story;

export const MainActions = {
  render: () => (
    <Section>
      <Narrow>
        <TKMainButton label="Pay 24.90" onClick={noop} />
      </Narrow>
      <Narrow>
        <TKWalletConnectButton onClick={noop} />
      </Narrow>
      <Row>
        <TKSpinner size={22} />
        <TKSpinner size={30} />
      </Row>
    </Section>
  ),
} satisfies Story;
