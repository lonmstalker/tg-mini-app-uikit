import type { Meta } from "@storybook/react-vite";
import {
  TKBadge,
  TKBannerCard,
  TKBookingCard,
  TKPaymentSummary,
  TKProductCardA,
  TKProductCardB,
  TKSlotPicker,
  TKWalletConnectButton,
  TKWalletStatusCell,
} from "tg-mini-app-uikit";
import { Grid, Narrow, Section, noop } from "../story-helpers";

const meta = {
  title: "Patterns/Commerce",
  parameters: {
    docs: {
      description: {
        component: "Reusable commerce, booking, checkout, and wallet blocks built from lower-level UIKit components.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = Record<string, unknown>;

export const ProductCards = {
  render: () => (
    <Grid>
      <TKProductCardA title="Stone mug" price="$24" onAdd={noop} />
      <TKProductCardB title="Desk lamp" price="$89" oldPrice="$119" rating="4.8" reviews="128" discount="-25%" onAdd={noop} />
      <TKBannerCard title="Spring sale" text="Up to 40% off on selected goods" cta="Browse" onCta={noop} />
    </Grid>
  ),
} satisfies Story;

export const Booking = {
  render: () => (
    <Section>
      <TKBookingCard
        initials="AK"
        name="Anna Karlova"
        subtitle="Haircut appointment"
        status={<TKBadge tone="green">Confirmed</TKBadge>}
        date="13 Jun"
        time="14:30"
        actionLabel="Open"
      />
      <TKSlotPicker
        days={[
          { label: "Today", date: "13 Jun" },
          { label: "Tomorrow", date: "14 Jun" },
        ]}
        slots={["10:00", "12:00", "14:00", "18:00"]}
        busy={["12:00"]}
      />
    </Section>
  ),
} satisfies Story;

export const Checkout = {
  render: () => (
    <Narrow>
      <TKPaymentSummary
        rows={[
          { label: "Subtotal", value: "$42" },
          { label: "Promo", value: "-$4", accent: true },
          { label: "Delivery", value: "$4" },
          { label: "Total", value: "$42", total: true },
        ]}
      >
        <TKWalletConnectButton onClick={noop} />
      </TKPaymentSummary>
    </Narrow>
  ),
} satisfies Story;

export const Wallet = {
  render: () => (
    <Section>
      <TKWalletConnectButton connected walletName="TON Space" address="UQDx...1a9f" onClick={noop} />
      <TKWalletStatusCell connected walletName="TON Space" address="UQDx...1a9f" status={<TKBadge tone="green">Ready</TKBadge>} />
    </Section>
  ),
} satisfies Story;
