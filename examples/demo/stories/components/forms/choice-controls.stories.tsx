import { useState } from "react";
import type { Meta } from "@storybook/react-vite";
import {
  TKCategoryTabs,
  TKCheckbox,
  TKChip,
  TKChipGroup,
  TKMultiselect,
  TKRadioGroup,
  TKRating,
  TKSegmented,
  TKSelectable,
  TKSlider,
  TKStepper,
  TKSwitch,
} from "tg-mini-app-uikit";
import { Narrow, Row, Section, options } from "../../story-helpers";

const meta = {
  title: "Components/Forms/Choice Controls",
  parameters: {
    docs: {
      description: {
        component: "Controls that choose between states, options, ranges, and quantities.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = Record<string, unknown>;

type SliderArgs = {
  variant: "single" | "range" | "disabled" | "stepped";
};

function MixedCheckboxExample() {
  const [checked, setChecked] = useState(false);
  const [mixed, setMixed] = useState(true);
  return (
    <TKCheckbox
      label={mixed ? "Partially selected" : "Selected"}
      checked={checked}
      indeterminate={mixed}
      onChange={(next) => {
        setMixed(false);
        setChecked(next);
      }}
    />
  );
}

export const BinaryControls = {
  render: () => (
    <Section>
      <Row>
        <TKCheckbox label="Selected" defaultChecked />
        <MixedCheckboxExample />
      </Row>
      <Narrow>
        <TKSwitch label="Notifications" defaultChecked />
      </Narrow>
      <Narrow>
        <TKSelectable label="Pickup today" subtitle="Ready in 20 minutes" defaultChecked icon="calendar" />
      </Narrow>
    </Section>
  ),
} satisfies Story;

export const OptionGroups = {
  render: () => (
    <Section>
      <TKRadioGroup options={options} />
      <TKSegmented options={options} />
      <TKCategoryTabs tabs={options} />
      <TKMultiselect label="Tags" options={options} selectAll defaultValue={["one"]} />
    </Section>
  ),
} satisfies Story;

export const Chips = {
  render: () => (
    <Section>
      <Row>
        <TKChip selected>Selected</TKChip>
        <TKChip icon="star">Featured</TKChip>
        <TKChip removable>Removable</TKChip>
      </Row>
      <TKChipGroup items={options} multi defaultValue={["one", "two"]} />
    </Section>
  ),
} satisfies Story;

export const Sliders = {
  args: {
    variant: "single",
  },
  argTypes: {
    variant: { control: "select", options: ["single", "range", "disabled", "stepped"] },
  },
  render: ({ variant }: SliderArgs) => (
    <Narrow>
      {variant === "range" ? (
        <TKSlider range label="Price range" min={0} max={500} step={25} defaultRange={[75, 320]} suffix="$" marks={[0, 250, 500]} />
      ) : variant === "disabled" ? (
        <TKSlider label="Disabled volume" defaultValue={50} disabled />
      ) : variant === "stepped" ? (
        <TKSlider label="Guests" min={1} max={6} step={1} defaultValue={3} suffix=" guests" marks={[1, 2, 3, 4, 5, 6]} />
      ) : (
        <TKSlider label="Discount" defaultValue={64} suffix="%" marks={[0, 25, 50, 75, 100]} />
      )}
    </Narrow>
  ),
} satisfies Story;

export const NumericAndRating = {
  render: () => (
    <Row>
      <TKStepper defaultValue={2} editable />
      <TKRating defaultValue={3.5} allowHalf />
    </Row>
  ),
} satisfies Story;
