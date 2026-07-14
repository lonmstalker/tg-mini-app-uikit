import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  TKCalendar,
  TKChipsInput,
  TKDateInput,
  TKMaskedInput,
  TKPhoneInput,
  TKPinInput,
  TKTimeInput,
} from "tg-mini-app-uikit";
import { AppScreen, Grid, Narrow } from "../story-helpers";

const meta = {
  title: "Composites/Forms",
  parameters: {
    docs: {
      description: {
        component: "Reusable form composites: calendars, date and time fields (sheet or native), masked & phone inputs, PIN entry, and chips input.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const CalendarAndDateInput = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <Narrow>
        <TKDateInput label="Delivery date" defaultValue={new Date(2026, 5, 13)} sheetTitle="Choose delivery date" />
      </Narrow>
      <Narrow>
        <TKCalendar defaultMonth={new Date(2026, 5, 1)} defaultValue={new Date(2026, 5, 13)} />
      </Narrow>
    </AppScreen>
  ),
} satisfies Story;

export const NativePickers = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <Narrow>
        {/* native renders the OS date/time picker + on-screen keyboard. */}
        <TKDateInput native label="Birthday" defaultValue={new Date(2000, 0, 1)} hint="Opens the OS date picker" />
        <TKTimeInput native label="Reminder" defaultValue="09:30" hint="Opens the OS time picker" />
      </Narrow>
    </AppScreen>
  ),
} satisfies Story;

export const MaskedInputs = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <Grid>
        <TKMaskedInput label="Invite code" mask="##-##" defaultValue="1234" />
        <TKTimeInput label="Payout time" defaultValue="18:30" />
      </Grid>
      <Narrow>
        {/* Country picker (native <select>) + national number — dial any country. */}
        <TKPhoneInput label="Phone number" countrySelect defaultCountry="RU" defaultValue="+7 900 123-45-67" />
        <TKPhoneInput label="Phone (type the code)" defaultCountry="+44" placeholder="+44…" />
      </Narrow>
    </AppScreen>
  ),
} satisfies Story;

function PinWithError() {
  const [error, setError] = useState(false);
  return (
    <TKPinInput
      title={
        <span>
          <strong>Wallet access</strong> — correct PIN is 1234, a wrong code shakes
        </span>
      }
      error={error}
      onBiometricRequest={() => undefined}
      onComplete={(pin) => {
        // Mirrors a real verify round-trip: clear the previous error first, then
        // reject async so the false→true transition re-fires the shake/haptic.
        setError(false);
        if (pin !== "1234") setTimeout(() => setError(true), 0);
      }}
    />
  );
}

export const PinAndChips = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <Narrow>
        <PinWithError />
      </Narrow>
      <Narrow>
        <TKPinInput title={<strong>Variable PIN</strong>} length={4} maxLength={8} />
      </Narrow>
      <Narrow>
        <TKChipsInput label="Tags" defaultValue={["VIP", "Courier"]} placeholder="Add tag" />
      </Narrow>
    </AppScreen>
  ),
} satisfies Story;
