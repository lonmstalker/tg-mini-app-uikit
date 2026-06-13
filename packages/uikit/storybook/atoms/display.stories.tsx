import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TKAvatar,
  TKAvatarStack,
  TKBadge,
  TKBlockquote,
  TKCounter,
  TKDot,
  TKImage,
  TKImg,
  TKSpoiler,
} from "tg-mini-app-uikit";
import { Grid, Narrow, Row, Section } from "../story-helpers";

const meta = {
  title: "Atoms/Display",
  parameters: {
    docs: {
      description: {
        component: "Atom badges, counters, avatars, media placeholders, spoilers, and quotes.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const BadgesAndCounters = {
  render: () => (
    <Section>
      <Row>
        <TKBadge>Default</TKBadge>
        <TKBadge tone="green" soft>
          Confirmed
        </TKBadge>
        <TKDot pulse />
        <TKCounter value={120} max={99} />
      </Row>
    </Section>
  ),
} satisfies Story;

export const Avatars = {
  render: () => (
    <Section>
      <Row>
        <TKAvatar initials="NK" status="online" />
        <TKAvatar initials="UI" tone="var(--tk-orange)" />
        <TKAvatarStack
          avatars={[
            { initials: "AK" },
            { initials: "BL" },
            { initials: "CM" },
            { initials: "DN" },
            { initials: "EO" },
          ]}
          max={3}
        />
      </Row>
    </Section>
  ),
} satisfies Story;

export const Media = {
  render: () => (
    <Grid>
      <Narrow>
        <TKImg label="Placeholder" ratio="16 / 9" />
      </Narrow>
      <Narrow>
        <TKImage fallbackLabel="Image fallback" ratio="16 / 9" />
      </Narrow>
    </Grid>
  ),
} satisfies Story;

export const SpoilerAndQuote = {
  render: () => (
    <Section>
      <Narrow>
        <p>
          Hidden code: <TKSpoiler>12345</TKSpoiler>
        </p>
        <TKBlockquote author="Anna">Telegram-style quote with an accent rail.</TKBlockquote>
      </Narrow>
    </Section>
  ),
} satisfies Story;
