import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKButton, TKCaption, TKChip, TKIcon, TKIconButton, TK_ICON_NAMES } from "tg-mini-app-uikit";
import { Grid, Section } from "../story-helpers";

const meta = {
  title: "Atoms/Icons",
  parameters: {
    docs: {
      description: {
        component: "Package icon atom and the canonical icon name set.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const IconGallery = {
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
              border: "1px solid var(--tk-sep)",
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

/**
 * REU-004: glyphs outside the built-in set. `TKIcon path` renders custom SVG
 * content with the kit's stroke conventions; every `icon`-style prop also
 * accepts a ready element (own SVG, emoji, image).
 */
export const CustomGlyphs = {
  render: () => {
    const debts = (
      <path d="M4 7h16v10H4zM4 11h16M8 15h3" />
    );
    return (
      <Section>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <TKIcon path={debts} label="Debts" />
          <TKIcon path={debts} filled={false} size={30} strokeWidth={1.6} />
          <TKIconButton icon={<TKIcon path={debts} size={18} />} label="Debts" />
          <TKButton icon={<TKIcon path={debts} size={16} />}>History</TKButton>
          <TKChip icon={<TKIcon path={debts} size={15} />}>Debts</TKChip>
        </div>
      </Section>
    );
  },
} satisfies Story;
