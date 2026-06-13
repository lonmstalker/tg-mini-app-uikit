import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TKCalendar,
  TKChipsInput,
  TKDateInput,
  TKFrame,
  TKMaskedInput,
  TKPhoneInput,
  TKPinInput,
  TKTimeInput,
} from "tg-mini-app-uikit";
import { Grid, Narrow, Section } from "../story-helpers";

const meta = {
  title: "Composites/Forms",
  parameters: {
    docs: {
      description: {
        component: "Reusable form composites: calendars, date and time fields, masked inputs, PIN entry, and chips input.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const CalendarAndDateInput = {
  render: () => (
    <TKFrame height={520}>
      <Section>
        <Narrow>
          <TKDateInput label="Delivery date" defaultValue={new Date(2026, 5, 13)} sheetTitle="Choose delivery date" />
        </Narrow>
        <Narrow>
          <TKCalendar defaultMonth={new Date(2026, 5, 1)} defaultValue={new Date(2026, 5, 13)} />
        </Narrow>
      </Section>
    </TKFrame>
  ),
} satisfies Story;

export const MaskedInputs = {
  render: () => (
    <TKFrame height={360}>
      <Section>
        <Grid>
          <TKMaskedInput label="Invite code" mask="##-##" defaultValue="1234" />
          <TKPhoneInput label="Phone number" defaultValue="+7 900 123-45-67" />
          <TKTimeInput label="Payout time" defaultValue="18:30" />
        </Grid>
      </Section>
    </TKFrame>
  ),
} satisfies Story;

export const PinAndChips = {
  render: () => (
    <TKFrame height={460}>
      <Section>
        <Narrow>
          <TKPinInput title={<strong>Wallet access</strong>} />
        </Narrow>
        <Narrow>
          <TKChipsInput label="Tags" defaultValue={["VIP", "Courier"]} placeholder="Add tag" />
        </Narrow>
      </Section>
    </TKFrame>
  ),
} satisfies Story;
