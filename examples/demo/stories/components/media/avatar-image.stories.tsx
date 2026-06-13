import type { Meta } from "@storybook/react-vite";
import { TKAvatar, TKAvatarStack, TKGallery, TKImage, TKImg } from "tg-mini-app-uikit";
import { Grid, Row, Section } from "../../story-helpers";

const meta = {
  title: "Components/Media/Avatar & Image",
  parameters: {
    docs: {
      description: {
        component: "Avatar, avatar stacks, image placeholders, real media, and gallery containers.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = Record<string, unknown>;

export const Avatars = {
  render: () => (
    <Section>
      <Row>
        <TKAvatar initials="AK" />
        <TKAvatar initials="MS" status="online" />
        <TKAvatar initials="JD" status="offline" />
      </Row>
      <TKAvatarStack
        avatars={[
          { initials: "AK" },
          { initials: "MS" },
          { initials: "JD" },
          { initials: "LK" },
          { initials: "NP" },
        ]}
      />
    </Section>
  ),
} satisfies Story;

export const Images = {
  render: () => (
    <Grid>
      <TKImg label="Product placeholder" />
      <TKImage src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80" alt="Coffee" />
      <TKImage ratio="4 / 3" fit="contain" fallbackLabel="No image" />
    </Grid>
  ),
} satisfies Story;

export const Gallery = {
  render: () => (
    <TKGallery height={180}>
      <TKImage src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80" alt="Coffee" ratio="16 / 9" />
      <TKImg label="Loading item" ratio="16 / 9" />
      <TKImage src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" alt="Headphones" ratio="16 / 9" />
    </TKGallery>
  ),
} satisfies Story;
