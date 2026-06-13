import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKCaption, TKRadioGroup, TKSelect, type TKOptionGroup, tkFlattenOptions, tkOptionItem } from "tg-mini-app-uikit";
import { Narrow, Section } from "../story-helpers";

const groupedOptions = [
  { label: "Europe", options: ["Lisbon", "Berlin"] },
  { label: "Asia", options: [{ value: "tbilisi", label: "Tbilisi" }, { value: "yerevan", label: "Yerevan" }] },
] satisfies TKOptionGroup[];

const flattened = tkFlattenOptions(groupedOptions);
const normalized = tkOptionItem({ value: "priority", label: "Priority" });

const meta = {
  title: "Foundation/Options",
  parameters: {
    docs: {
      description: {
        component: "Shared option and option-group contract reused by selects, radio groups, chips, and tabs.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const GroupedOptions = {
  render: () => (
    <Section>
      <Narrow>
        <TKSelect label="City" options={groupedOptions} defaultValue="Berlin" searchable />
        <TKRadioGroup options={flattened.slice(0, 3)} defaultValue="Lisbon" />
        <TKCaption>Normalized option: {normalized.label}</TKCaption>
      </Narrow>
    </Section>
  ),
} satisfies Story;
