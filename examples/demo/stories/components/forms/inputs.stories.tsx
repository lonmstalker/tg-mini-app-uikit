import { useState } from "react";
import type { Meta } from "@storybook/react-vite";
import {
  TKChipsInput,
  TKFileInput,
  TKFormField,
  TKFormInput,
  TKInput,
  TKMaskedInput,
  TKOTP,
  TKPhoneInput,
  TKPinInput,
  TKSearch,
  TKSelect,
  TKTextarea,
} from "tg-mini-app-uikit";
import { Narrow, Section, options } from "../../story-helpers";

const meta = {
  title: "Components/Forms/Inputs",
  parameters: {
    docs: {
      description: {
        component: "Text entry, search, select, phone, masked, upload, OTP, PIN, and chips inputs.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = Record<string, unknown>;

function EmailValidationExample() {
  const [value, setValue] = useState("anna@example");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  return (
    <TKFormInput
      label="Email"
      type="email"
      value={value}
      onChange={setValue}
      error={valid ? undefined : "Enter a valid email"}
    />
  );
}

const phoneCountries = {
  "+1": { label: "US +1", mask: "(###) ###-####", sample: "+1 415 555 0134" },
  "+44": { label: "UK +44", mask: "#### ### ###", sample: "+44 7700 900123" },
  "+7": { label: "RU +7", mask: "(###) ###-##-##", sample: "+7 999 123-45-67" },
};

function PhoneCountryExample() {
  const [country, setCountry] = useState<keyof typeof phoneCountries>("+1");
  const config = phoneCountries[country];
  return (
    <Section>
      <TKSelect
        label="Country code"
        value={country}
        onChange={(next) => setCountry(next as keyof typeof phoneCountries)}
        options={Object.entries(phoneCountries).map(([value, item]) => ({ value, label: item.label }))}
      />
      <TKPhoneInput key={country} label="Phone" defaultCountry={country} numberMask={config.mask} defaultValue={config.sample} />
    </Section>
  );
}

export const TextInputs = {
  render: () => (
    <Section>
      <TKInput label="Name" icon="user" defaultValue="Anna" hint="Editable text field" />
      <EmailValidationExample />
      <TKFormField label="Custom field" hint="Field wrapper">
        <TKInput placeholder="Wrapped input" />
      </TKFormField>
      <TKTextarea label="Comment" defaultValue="Delivery notes" maxLength={120} />
    </Section>
  ),
} satisfies Story;

export const SearchAndSelect = {
  render: () => (
    <Section>
      <Narrow>
        <TKSearch placeholder="Search products" expandOnFocus collapsedWidth={210} />
      </Narrow>
      <TKSelect label="Delivery" options={options} searchable />
    </Section>
  ),
} satisfies Story;

export const PhoneAndMasks = {
  render: () => (
    <Section>
      <PhoneCountryExample />
      <TKMaskedInput label="Card" mask="#### #### #### ####" defaultValue="4242424242424242" />
    </Section>
  ),
} satisfies Story;

export const CodesAndFiles = {
  render: () => (
    <Section>
      <TKOTP defaultValue="123" />
      <Narrow>
        <TKPinInput title="Enter PIN" />
      </Narrow>
      <TKChipsInput label="Skills" defaultValue={["React", "Telegram"]} placeholder="Add skill" />
      <TKFileInput label="Receipt" dropZone progress={64} buttonLabel="Upload receipt" />
    </Section>
  ),
} satisfies Story;
