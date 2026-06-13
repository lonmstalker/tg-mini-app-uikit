import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TKBadge,
  TKBannerCard,
  TKBookingCard,
  TKCard,
  TKCardCell,
  TKCardChip,
  TKFrame,
  TKProductCardA,
  TKProductCardB,
  TKStatTile,
} from "tg-mini-app-uikit";
import { Grid, Row, Section } from "../story-helpers";

const meta = {
  title: "Composites/Cards",
  parameters: {
    docs: {
      description: {
        component: "Reusable card composites for product, booking, stat, banner, and generic row layouts.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const CardPrimitives = {
  render: () => (
    <TKFrame height={360}>
      <Section>
        <TKCard>
          <TKCardCell title="Wallet" subtitle="Main balance" before={<TKBadge tone="green">Live</TKBadge>} after="$12.4k" />
          <TKCardCell title="Receipts" subtitle="CloudStorage sync" after="24" compact />
          <Row>
            <TKCardChip selected>Primary</TKCardChip>
            <TKCardChip tone="orange">Pending</TKCardChip>
            <TKCardChip tone="gray">Muted</TKCardChip>
          </Row>
        </TKCard>
      </Section>
    </TKFrame>
  ),
} satisfies Story;

export const ProductCards = {
  render: () => (
    <TKFrame height={520}>
      <Section>
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
      </Section>
    </TKFrame>
  ),
} satisfies Story;

export const PromotionalCards = {
  render: () => (
    <TKFrame height={520}>
      <Section>
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
        <TKStatTile label="Revenue" value="$12.4k" delta="+8%" />
      </Section>
    </TKFrame>
  ),
} satisfies Story;
