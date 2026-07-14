import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TKAvatar,
  TKAvatarStack,
  TKBadge,
  TKBlockquote,
  TKCounter,
  TKDot,
  TKEllipsis,
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

const LONG_TEXT =
  "Telegram Mini Apps let you build rich interfaces right inside a chat. This paragraph is deliberately long so the clamp has something to cut: the kit clamps it to a few lines with pure CSS, so the first paint is already collapsed and nothing shifts. Tap the accent button to smoothly expand the full text — content below slides down instead of jumping. With `collapsible` the text folds back up the same way, and with reduced motion every transition lands instantly.";

export const Ellipsis = {
  render: () => (
    <Section>
      <Narrow>
        <TKEllipsis>{LONG_TEXT}</TKEllipsis>
      </Narrow>
      <Narrow>
        <TKEllipsis lines={2} collapsible>
          {LONG_TEXT}
        </TKEllipsis>
      </Narrow>
    </Section>
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
