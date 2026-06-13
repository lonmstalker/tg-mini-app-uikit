import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKFrame, TKGallery } from "tg-mini-app-uikit";
import { Section } from "../story-helpers";

const meta = {
  title: "Composites/Carousel",
  parameters: {
    docs: {
      description: {
        component: "Swipe carousel with CSS scroll snap and page dots for product media, onboarding panels, and galleries.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const ProductSlides = {
  render: () => (
    <TKFrame height={420}>
      <Section>
        <TKGallery height={240} testId="carousel-story">
          {["Matte case", "Compact stand", "Travel strap"].map((title, index) => (
            <div
              key={title}
              style={{
                display: "grid",
                placeItems: "center",
                height: "100%",
                borderRadius: "var(--tk-r-lg)",
                background: index === 0 ? "var(--tk-accent-12)" : index === 1 ? "var(--tk-surface-2)" : "var(--tk-surface-3)",
                border: "1px solid var(--tk-sep)",
                color: "var(--tk-text)",
                fontWeight: 700,
              }}
            >
              {title}
            </div>
          ))}
        </TKGallery>
      </Section>
    </TKFrame>
  ),
} satisfies Story;
