import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKBadge, TKBannerCard, TKBookingCard, TKProductCardA, TKProductCardB, TKStatTile } from "tg-mini-app-uikit";
import { AppScreen, Grid } from "../story-helpers";

const meta = {
  title: "Templates/Cards",
  parameters: {
    docs: {
      description: {
        component: "Opinionated, domain-specific card templates: product, banner, booking, and stat cards assembled from the card primitives.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const ProductCards = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <Grid>
        <TKProductCardA title="Camera" price="$199" img="camera" onAdd={() => undefined} />
        <TKProductCardB
          title="Travel tripod"
          price="$49"
          oldPrice="$79"
          rating="4.8"
          reviews="124"
          discount="-20%"
          img="tripod"
        />
      </Grid>
    </AppScreen>
  ),
} satisfies Story;

export const PromotionalCards = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <TKBannerCard title="Weekend bonus" text="Double rewards for Telegram Mini App checkout." cta="Open" />
      <TKBookingCard
        initials="AK"
        avatarTone="var(--tk-accent)"
        name="Anna"
        subtitle="Dentist appointment"
        status={<TKBadge tone="green">Confirmed</TKBadge>}
        date="13 Jun"
        time="18:30"
        actionLabel="Details"
      />
      {/* REU-002: bars are explicit consumer data — omitted bars render no sparkline. */}
      <TKStatTile label="Revenue" value="$12.4k" delta="+8%" bars={[5, 8, 6, 10, 9, 13, 12]} />
      <TKStatTile label="No sparkline" value="$1.2k" delta="-2%" up={false} />
    </AppScreen>
  ),
} satisfies Story;
