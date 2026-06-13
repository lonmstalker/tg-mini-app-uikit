import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKBadge, TKButton, TKProvider, tkThemeVars } from "tg-mini-app-uikit";
import { Grid, Section } from "../story-helpers";

const meta = {
  title: "Foundation/Theme",
  parameters: {
    docs: {
      description: {
        component: "Theme provider contract for color scheme, accent, radius, type scale, and motion knobs.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const ProviderThemes = {
  render: () => (
    <Grid>
      <TKProvider theme="light" style={tkThemeVars({ accent: "#2481cc", roundness: 0.85 })} testId="foundation-theme-light">
        <Section style={{ padding: 16 }}>
          <TKBadge tone="accent">Light provider</TKBadge>
          <TKButton>Primary action</TKButton>
        </Section>
      </TKProvider>
      <TKProvider theme="dark" accent="#3ddc97" motion="smooth" testId="foundation-theme-dark">
        <Section style={{ padding: 16 }}>
          <TKBadge tone="green">Dark provider</TKBadge>
          <TKButton>Confirm</TKButton>
        </Section>
      </TKProvider>
    </Grid>
  ),
} satisfies Story;
