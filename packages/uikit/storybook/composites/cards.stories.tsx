import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKBadge, TKCard, TKCardCell, TKCardChip } from "tg-mini-app-uikit";
import { AppScreen, Row } from "../story-helpers";

const meta = {
  title: "Composites/Cards",
  parameters: {
    docs: {
      description: {
        component: "Generic card primitives — a surface plus rows and chips — that other surfaces compose. Opinionated product/promo cards live under Templates.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const CardPrimitives = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <TKCard>
        <TKCardCell title="Wallet" subtitle="Main balance" before={<TKBadge tone="green">Live</TKBadge>} after="$12.4k" />
        <TKCardCell title="Receipts" subtitle="CloudStorage sync" after="24" compact />
        <Row>
          <TKCardChip selected>Primary</TKCardChip>
          <TKCardChip tone="orange">Pending</TKCardChip>
          <TKCardChip tone="gray">Muted</TKCardChip>
        </Row>
      </TKCard>
    </AppScreen>
  ),
} satisfies Story;
