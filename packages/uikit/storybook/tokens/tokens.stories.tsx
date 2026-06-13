import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKCaption, TKText } from "tg-mini-app-uikit";
import { Grid, Section } from "../story-helpers";

const swatches = [
  ["Background", "var(--tk-bg)", "var(--tk-text)"],
  ["Surface", "var(--tk-surface)", "var(--tk-text)"],
  ["Accent", "var(--tk-accent)", "var(--tk-on-accent)"],
  ["Success", "var(--tk-green)", "var(--tk-on-accent)"],
  ["Warning", "var(--tk-orange)", "var(--tk-on-accent)"],
  ["Error", "var(--tk-red)", "var(--tk-on-accent)"],
] as const;

const meta = {
  title: "Tokens/Semantic Tokens",
  parameters: {
    docs: {
      description: {
        component: "Semantic CSS token surface for colors, radius, shadow, spacing, motion, and state colors.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const SemanticSwatches = {
  render: () => (
    <Section>
      <TKCaption uppercase>Semantic tokens</TKCaption>
      <Grid>
        {swatches.map(([label, background, color]) => (
          <div
            key={label}
            style={{
              minHeight: 82,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: 14,
              borderRadius: "var(--tk-r-md)",
              background,
              color,
              boxShadow: "var(--tk-shadow-sm)",
              border: "1px solid var(--tk-sep)",
            }}
          >
            <TKText weight={600}>{label}</TKText>
            <TKText size="caption" tone="secondary" style={{ color }}>
              {background}
            </TKText>
          </div>
        ))}
      </Grid>
    </Section>
  ),
} satisfies Story;
