import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKButton, TKPaymentSummary, TKSlotPicker } from "tg-mini-app-uikit";
import { AppScreen } from "../story-helpers";

const meta = {
  title: "Templates/Commerce",
  parameters: {
    docs: {
      description: {
        component: "Reusable commerce templates for booking slots and payment review surfaces.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const BookingCheckout = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <TKSlotPicker
        days={[
          { label: "Mon", date: "12" },
          { label: "Tue", date: "13" },
          { label: "Wed", date: "14" },
        ]}
        slots={["10:00", "12:00", "18:30"]}
        busy={["12:00"]}
      />
      <TKPaymentSummary
        rows={[
          { label: "Delivery", value: "$12" },
          { label: "Promo", value: "-$2", accent: true },
          { label: "Total", value: "$10", total: true },
        ]}
      >
        <TKButton full>Book slot</TKButton>
      </TKPaymentSummary>
    </AppScreen>
  ),
} satisfies Story;
