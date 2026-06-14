import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKWalletConnectButton, TKWalletStatusCell } from "tg-mini-app-uikit";
import { AppScreen } from "../story-helpers";

const meta = {
  title: "Templates/Wallet",
  parameters: {
    docs: {
      description: {
        component: "Wallet templates for connection prompts and connected-account status rows.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const WalletStates = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <TKWalletConnectButton />
      <TKWalletConnectButton connected walletName="Tonkeeper" address="EQB0...9Kz" />
      <TKWalletStatusCell connected walletName="Wallet" address="EQB0...9Kz" />
    </AppScreen>
  ),
} satisfies Story;
