import type { Meta } from "@storybook/react-vite";
import { TKBadge, TKCard, TKCardCell, TKCardChip, TKIcon, TKLeaderboard, TKStatTile, TKWalletStatusCell, TKXPHeader } from "tg-mini-app-uikit";
import { Grid, Narrow, Row, Section } from "../story-helpers";

const meta = {
  title: "Templates/Dashboard",
  parameters: {
    docs: {
      description: {
        component: "Dashboard and profile templates built from cards, stat tiles, wallet rows, XP headers, and leaderboard patterns.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = Record<string, unknown>;

export const StatDashboard = {
  render: () => (
    <Section>
      <Grid>
        <TKStatTile label="Revenue" value="$12.4k" delta="+8%" />
        <TKStatTile label="Orders" value="184" delta="+12" />
        <TKStatTile label="Refunds" value="3" delta="-2" />
      </Grid>
      <Narrow>
        <TKCard>
          <TKCardCell title="Express delivery" subtitle="Arrives today" before={<TKIcon name="location" />} after={<TKBadge>Fast</TKBadge>} />
        </TKCard>
      </Narrow>
      <Row>
        <TKCardChip selected>Popular</TKCardChip>
        <TKCardChip tone="green">Eco</TKCardChip>
      </Row>
    </Section>
  ),
} satisfies Story;

export const ProfileDashboard = {
  render: () => (
    <Section>
      <TKXPHeader name="Anna" initials="AK" level={8} xp={72} hint="280 XP to level 9" />
      <TKLeaderboard
        rows={[
          { rank: 1, initials: "AK", name: "Anna", points: "8,420", you: true },
          { rank: 2, initials: "MS", name: "Maksim", points: "7,910" },
          { rank: 3, initials: "JD", name: "Julia", points: "7,120" },
        ]}
      />
      <TKWalletStatusCell connected walletName="TON Space" address="UQDx...1a9f" status={<TKBadge tone="green">Ready</TKBadge>} />
    </Section>
  ),
} satisfies Story;
