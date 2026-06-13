import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TKFileInput,
  TKFormField,
  TKFormInput,
  TKInput,
  TKMultiselect,
  TKOTP,
  TKSearch,
  TKSelect,
  TKSelectable,
  TKTextarea,
} from "tg-mini-app-uikit";
import { Narrow, Row, Section, options } from "../story-helpers";

const meta = {
  title: "Atoms/Inputs",
  parameters: {
    docs: {
      description: {
        component: "Atom text, search, choice, file, and one-time-code inputs.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const TextFields = {
  render: () => (
    <Section>
      <Narrow>
        <TKInput label="Email" placeholder="name@example.com" defaultValue="nikita@example.com" clearable />
        <TKFormInput label="Company" placeholder="Acme" prefix="@" suffix=".app" />
        <TKFormField label="Read-only preview" hint="Custom field composition">
          <div style={{ padding: "12px 14px", borderRadius: "var(--tk-r-md)", background: "var(--tk-surface)" }}>
            Form field content
          </div>
        </TKFormField>
      </Narrow>
    </Section>
  ),
} satisfies Story;

export const SearchAndTextarea = {
  render: () => (
    <Section>
      <Narrow>
        <TKSearch placeholder="Search catalog" expandOnFocus />
        <TKTextarea label="Message" defaultValue="Telegram Mini App ready." maxLength={120} />
      </Narrow>
    </Section>
  ),
} satisfies Story;

export const ChoiceInputs = {
  render: () => (
    <Section>
      <Narrow>
        <TKSelect label="City" options={["Lisbon", "Berlin", "Belgrade"]} searchable />
        <TKMultiselect label="Preferences" options={options} selectAll />
        <TKSelectable label="Make this the default" subtitle="Applies to future sessions" defaultChecked />
      </Narrow>
    </Section>
  ),
} satisfies Story;

export const FileAndOtp = {
  render: () => (
    <Section>
      <Row>
        <Narrow>
          <TKFileInput buttonLabel="Upload receipt" emptyLabel="No receipt selected" progress={42} />
        </Narrow>
        <TKOTP length={5} defaultValue="12" resendLabel="Send again" />
      </Row>
    </Section>
  ),
} satisfies Story;
