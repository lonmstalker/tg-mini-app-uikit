import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKCheckbox, TKChip, TKChipGroup, TKRadioGroup, TKRating, TKSlider, TKStepper, TKSwitch } from "tg-mini-app-uikit";
import { Narrow, Row, Section, options } from "../story-helpers";

const meta = {
  title: "Atoms/Controls",
  parameters: {
    docs: {
      description: {
        component: "Atom selection, range, quantity, and rating controls.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

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
    </Section>
  ),
} satisfies Story;

export const OptionGroups = {
  render: () => (
    <Section>
      <TKRadioGroup options={options} />
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
  render: () => (
    <Narrow>
      <TKSlider label="Discount" defaultValue={64} suffix="%" marks={[0, 25, 50, 75, 100]} />
    </Narrow>
  ),
} satisfies Story;

export const StepperAndRating = {
  render: () => (
    <Row>
      <TKStepper defaultValue={2} editable />
      <TKRating defaultValue={3.5} allowHalf />
    </Row>
  ),
} satisfies Story;
