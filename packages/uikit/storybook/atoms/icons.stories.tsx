import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKCaption, TKIcon, TK_ICON_NAMES } from "tg-mini-app-uikit";
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
