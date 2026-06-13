import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKLocaleProvider, TKMainButton, TKSearch, TKSelect, ruLocale } from "tg-mini-app-uikit";
import { Narrow, Section } from "../story-helpers";

const meta = {
  title: "Foundation/I18n",
  parameters: {
    docs: {
      description: {
        component: "Locale provider contract for user-facing default strings and component fallbacks.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const LocalizedControls = {
  render: () => (
    <TKLocaleProvider locale={ruLocale}>
      <Section>
        <Narrow>
          <TKSearch />
          <TKSelect label="Город" options={["Москва", "Казань", "Ереван"]} />
          <TKMainButton label="Готово" />
        </Narrow>
      </Section>
    </TKLocaleProvider>
  ),
} satisfies Story;
