import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKGallery } from "tg-mini-app-uikit";
import { AppScreen } from "../story-helpers";

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
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <div style={{ fontWeight: 700 }}>Featured</div>
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
    </AppScreen>
  ),
} satisfies Story;

/* ---------------- Gallery → viewer integration ---------------- */

const media = (hue: number, label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">` +
      `<rect width="100%" height="100%" fill="hsl(${hue} 55% 44%)"/>` +
      `<text x="48" y="744" font-family="sans-serif" font-size="64" fill="white" opacity=".9">${label}</text>` +
    `</svg>`,
  )}`;

const MEDIA = [
  { src: media(210, "Harbor"), alt: "Harbor at dusk" },
  { src: media(20, "Dunes"), alt: "Sand dunes" },
  { src: media(130, "Forest"), alt: "Forest trail" },
];

export const GalleryWithViewer = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <div style={{ fontWeight: 700 }}>Tap a slide to open the viewer</div>
      <TKGallery
        height={220}
        items={MEDIA}
        getKey={(m) => m.alt}
        renderItem={(m) => (
          <img
            src={m.src}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--tk-r-lg)", display: "block" }}
          />
        )}
        viewerImages={MEDIA}
        testId="gallery-viewer-story"
      />
    </AppScreen>
  ),
} satisfies Story;
