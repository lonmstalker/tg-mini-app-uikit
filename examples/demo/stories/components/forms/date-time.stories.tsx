import type { Meta } from "@storybook/react-vite";
import { TKCalendar, TKDateInput, TKInput, TKTimeInput } from "tg-mini-app-uikit";
import { Narrow, Section } from "../../story-helpers";

const meta = {
  title: "Components/Forms/Date & Time",
  parameters: {
    docs: {
      description: {
        component: "Date, time, and calendar inputs with native and custom Telegram Mini App patterns.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = Record<string, unknown>;

type TimeArgs = {
  hour12: boolean;
};

type CalendarArgs = {
  mode: "single" | "range";
};

export const TimeInput = {
  args: {
    hour12: false,
  },
  render: ({ hour12 }: TimeArgs) => (
    <Narrow>
      <TKTimeInput label={hour12 ? "Time 12h" : "Time 24h"} defaultValue="14:30" hour12={hour12} />
    </Narrow>
  ),
} satisfies Story;

export const DateInput = {
  render: () => (
    <Section>
      <Narrow>
        <TKDateInput label="Sheet date" defaultValue={new Date(2026, 5, 13)} sheetTitle="Choose date" />
      </Narrow>
      <Narrow>
        <TKInput label="Native date" type="date" defaultValue="2026-06-13" />
      </Narrow>
    </Section>
  ),
} satisfies Story;

export const Calendar = {
  args: {
    mode: "single",
  },
  argTypes: {
    mode: { control: "select", options: ["single", "range"] },
  },
  render: ({ mode }: CalendarArgs) => (
    <Narrow>
      <TKCalendar
        mode={mode}
        defaultValue={mode === "single" ? new Date(2026, 5, 13) : undefined}
        defaultRange={mode === "range" ? [new Date(2026, 5, 10), new Date(2026, 5, 14)] : undefined}
        defaultMonth={new Date(2026, 5, 1)}
      />
    </Narrow>
  ),
} satisfies Story;
