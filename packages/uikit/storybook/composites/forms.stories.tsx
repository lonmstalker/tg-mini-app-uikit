import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  TKCalendar,
  TKChipsInput,
  TKDateInput,
  TKMaskedInput,
  TKNativeField,
  TKPhoneInput,
  TKPinInput,
  TKTimeInput,
  type TKDateRange,
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

function RangeCalendarDemo() {
  const [range, setRange] = useState<TKDateRange | null>([
    new Date(2026, 5, 10),
    new Date(2026, 5, 13),
  ]);
  const format = (date: Date) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
  const status = range ? `${format(range[0])} – ${format(range[1])}` : "Choose the end date";

  return (
    <AppScreen>
      <Narrow style={{ display: "grid", gap: "var(--tk-sp-3)" }}>
        <p style={{ margin: 0, color: "var(--tk-text-2)", fontSize: "var(--tk-fz-caption)" }}>
          Tap the start and end dates, or press and drag across the calendar.
        </p>
        <TKCalendar
          mode="range"
          range={range}
          onRangeChange={setRange}
          month={new Date(2026, 5, 1)}
          partSelectors={false}
        />
        <p data-testid="calendar-range-status" role="status" style={{ margin: 0, color: "var(--tk-text-2)" }}>
          Selected range: {status}
        </p>
      </Narrow>
    </AppScreen>
  );
}

export const CalendarRangeDrag = {
  parameters: { fullBleed: true },
  render: () => <RangeCalendarDemo />,
} satisfies Story;

/** TKNativeField is fully controlled — the story owns the value. */
function NativeMonthField() {
  const [month, setMonth] = useState("2026-07");
  return (
    <TKNativeField
      type="month"
      icon="calendar"
      label="Billing month"
      value={month}
      onChange={setMonth}
      hint="TKNativeField wraps any native input type"
    />
  );
}

export const NativePickers = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <Narrow>
        {/* native renders the OS date/time picker + on-screen keyboard. */}
        <TKDateInput native label="Birthday" defaultValue={new Date(2000, 0, 1)} hint="Opens the OS date picker" />
        <TKTimeInput native label="Reminder" defaultValue="09:30" hint="Opens the OS time picker" />
        {/* The shared field chrome under both: any `<input type>` the OS owns,
            wearing the kit's label/hint/error wiring. */}
        <NativeMonthField />
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
        {/* No country given: the default derives from the locale (REU-011) — a
            Russian TKLocale gives +7 with the Russian mask; otherwise this is a
            free unmasked international input. */}
        <TKPhoneInput label="Phone (locale default: free input)" placeholder="+371 2 123 4567" />
      </Narrow>
    </AppScreen>
  ),
} satisfies Story;

function VariablePin() {
  // The kit can't know whether a code is right — feedback is consumer-driven:
  // pass `success`/`error` after your own verify. Here any confirmed code passes.
  const [success, setSuccess] = useState(false);
  return (
    <TKPinInput
      title={<strong>Variable PIN — any confirmed code passes</strong>}
      length={4}
      maxLength={8}
      success={success}
      onComplete={() => {
        setSuccess(false);
        setTimeout(() => setSuccess(true), 0);
      }}
    />
  );
}

function PinWithError() {
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  return (
    <TKPinInput
      title={
        <span>
          <strong>Wallet access</strong> — 1234 pops green, a wrong code shakes
        </span>
      }
      error={error}
      success={success}
      onBiometricRequest={() => undefined}
      onComplete={(pin) => {
        // Mirrors a real verify round-trip: clear the previous outcome first, then
        // resolve async so the false→true transition re-fires the feedback.
        setError(false);
        setSuccess(false);
        setTimeout(() => (pin === "1234" ? setSuccess(true) : setError(true)), 0);
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
        <VariablePin />
      </Narrow>
      <Narrow>
        <TKChipsInput label="Tags" defaultValue={["VIP", "Courier"]} placeholder="Add tag" />
      </Narrow>
    </AppScreen>
  ),
} satisfies Story;
