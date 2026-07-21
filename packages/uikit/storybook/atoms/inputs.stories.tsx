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
import { Narrow, Section, options } from "../story-helpers";

const meta = {
  title: "Atoms/Inputs",
  parameters: {
    docs: {
      description: {
        component: "Atom text, search, choice, file, and one-time-code inputs. Each domain has its own story.",
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
        {/* type="email" turns on the email keyboard and a built-in format check on blur. */}
        <TKInput type="email" label="Email" placeholder="name@example.com" defaultValue="nikita@example.com" />
        {/* Forced error state so the validation styling is visible at a glance. */}
        <TKInput type="email" label="Email · invalid" defaultValue="nikita@" error="Enter a valid email address" clearable={false} />
        <TKFormInput label="Company" placeholder="Acme Inc." defaultValue="Acme Inc." />
        {/* A real use for the prefix slot: a fixed, muted URL stem. */}
        <TKInput
          label="Workspace handle"
          placeholder="acme"
          prefix={<span style={{ color: "var(--tk-text-3)" }}>t.me/</span>}
          hint="Public link for your Mini App"
        />
        <TKFormField label="Read-only preview" hint="Custom field composition">
          <div style={{ padding: "12px 14px", borderRadius: "var(--tk-r-md)", background: "var(--tk-surface)" }}>
            Form field content
          </div>
        </TKFormField>
      </Narrow>
    </Section>
  ),
} satisfies Story;

export const Search = {
  render: () => (
    <Section>
      <Narrow>
        <TKSearch placeholder="Search catalog" expandOnFocus />
      </Narrow>
    </Section>
  ),
} satisfies Story;

export const TextArea = {
  render: () => (
    <Section>
      <Narrow>
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

export const DropdownEscapesClipping = {
  parameters: {
    docs: {
      description: {
        story:
          "Select dropdowns portal to the nearest `.tk` root / `[data-tk-portal-root]` host (REU-010), so an `overflow: hidden` card cannot clip the option list.",
      },
    },
  },
  render: () => (
    <Section>
      <Narrow>
        {/* the classic clipping trap: a short overflow:hidden card */}
        <div
          style={{
            overflow: "hidden",
            height: 120,
            padding: 16,
            borderRadius: "var(--tk-r-lg)",
            boxShadow: "inset 0 0 0 1px var(--tk-sep)",
          }}
        >
          <TKSelect label="City (clipped card)" options={["Lisbon", "Berlin", "Belgrade"]} />
        </div>
      </Narrow>
    </Section>
  ),
} satisfies Story;

export const FileUpload = {
  render: () => (
    <Section>
      <Narrow>
        <TKFileInput buttonLabel="Upload receipt" emptyLabel="No receipt selected" progress={42} />
      </Narrow>
    </Section>
  ),
} satisfies Story;

export const OneTimeCode = {
  render: () => (
    <Section>
      <Narrow>
        <TKOTP length={5} defaultValue="12" resendLabel="Send again" />
      </Narrow>
    </Section>
  ),
} satisfies Story;
