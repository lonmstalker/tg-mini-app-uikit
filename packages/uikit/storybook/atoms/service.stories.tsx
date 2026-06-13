import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKIcon, TKTappable, TKVisuallyHidden } from "tg-mini-app-uikit";
import { Grid, Section } from "../story-helpers";

const meta = {
  title: "Atoms/Service",
  parameters: {
    docs: {
      description: {
        component: "Low-level service atoms for tappable surfaces and accessible hidden labels.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const TappableSurface = {
  render: () => (
    <Grid>
      <TKTappable style={{ padding: 14, borderRadius: "var(--tk-r-md)", background: "var(--tk-surface)" }}>
        Tappable surface
      </TKTappable>
    </Grid>
  ),
} satisfies Story;

export const HiddenLabel = {
  render: () => (
    <Section>
      <button
        type="button"
        style={{
          display: "inline-flex",
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          borderRadius: "var(--tk-r-md)",
          background: "var(--tk-surface)",
          color: "var(--tk-text)",
          boxShadow: "var(--tk-shadow-sm)",
          cursor: "pointer",
        }}
      >
        <TKIcon name="bell" />
        <TKVisuallyHidden>Unread notifications</TKVisuallyHidden>
      </button>
    </Section>
  ),
} satisfies Story;
