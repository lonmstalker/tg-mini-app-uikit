import type { Meta } from "@storybook/react-vite";
import { TKBlockquote, TKCaption, TKIcon, TK_ICON_NAMES, TKSpoiler, TKTappable, TKText, TKTitle, TKVisuallyHidden } from "tg-mini-app-uikit";
import { Grid, Section } from "../story-helpers";

const meta = {
  title: "Tokens/Typography & Accessibility",
  parameters: {
    docs: {
      description: {
        component: "Text, icon, tappable, and accessibility utilities. These are primitives used by higher-level components.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = Record<string, unknown>;

export const TextScale = {
  render: () => (
    <Section>
      <TKTitle>Checkout</TKTitle>
      <TKTitle level={3}>Delivery details</TKTitle>
      <TKText>Telegram body copy with the default text token.</TKText>
      <TKText tone="secondary">Secondary copy for hints and metadata.</TKText>
      <TKCaption>Caption text</TKCaption>
    </Section>
  ),
} satisfies Story;

export const Icons = {
  render: () => (
    <Section>
      <Grid style={{ gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))", gap: 10 }}>
        {TK_ICON_NAMES.map((name) => (
          <div
            key={name}
            style={{
              display: "grid",
              minWidth: 0,
              minHeight: 78,
              alignContent: "center",
              justifyItems: "center",
              gap: 8,
              padding: "10px 8px",
              border: "1px solid var(--tk-separator)",
              borderRadius: "var(--tk-r-sm)",
              background: "var(--tk-surface)",
              color: "var(--tk-text)",
            }}
          >
            <TKIcon name={name} />
            <TKCaption
              style={{
                maxWidth: "100%",
                overflowWrap: "anywhere",
                textAlign: "center",
                lineHeight: 1.15,
              }}
            >
              {name}
            </TKCaption>
          </div>
        ))}
      </Grid>
    </Section>
  ),
} satisfies Story;

export const TextPrimitives = {
  render: () => (
    <Grid>
      <TKTappable style={{ padding: 14, borderRadius: "var(--tk-r-md)", background: "var(--tk-surface)" }}>
        Tappable surface
      </TKTappable>
      <TKSpoiler>Hidden invoice details</TKSpoiler>
      <TKBlockquote author="Telegram user" icon="quote">
        The checkout feels native inside Mini Apps.
      </TKBlockquote>
    </Grid>
  ),
} satisfies Story;

export const AccessibilityUtilities = {
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
