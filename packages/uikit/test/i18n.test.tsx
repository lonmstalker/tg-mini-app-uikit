import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  TKActionSheet,
  TKLocaleProvider,
  TKMainButton,
  TKMultiselect,
  TKOTP,
  TKSearch,
  TKSheet,
  TKStepper,
  ruLocale,
  tkFormat,
  type TKLocale,
} from "../src/index";

describe("M1 TKLocaleProvider", () => {
  it("renders English defaults without a provider", () => {
    render(<TKActionSheet open items={[{ label: "Do" }]} />);
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders Russian strings under the ru preset", () => {
    render(
      <TKLocaleProvider locale={ruLocale}>
        <TKActionSheet open items={[{ label: "Do" }]} />
        <TKMultiselect options={["a"]} />
        <TKSearch />
      </TKLocaleProvider>,
    );
    // "Отмена" renders both in the action sheet and the search cancel button
    expect(screen.getAllByText("Отмена").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Выберите варианты")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Поиск")).toBeInTheDocument();
  });

  it("a component-level prop wins over the provider", () => {
    render(
      <TKLocaleProvider locale={ruLocale}>
        <TKActionSheet open items={[{ label: "Do" }]} cancelLabel="Abort" />
      </TKLocaleProvider>,
    );
    expect(screen.getByText("Abort")).toBeInTheDocument();
    expect(screen.queryByText("Отмена")).not.toBeInTheDocument();
  });

  it("partial locale overrides fall back to English", () => {
    const partial: Partial<TKLocale> = { cancel: "Stop it" };
    render(
      <TKLocaleProvider locale={partial}>
        <TKActionSheet open items={[{ label: "Do" }]} />
        <TKMultiselect options={["a"]} />
      </TKLocaleProvider>,
    );
    expect(screen.getByText("Stop it")).toBeInTheDocument();
    expect(screen.getByText("Select options")).toBeInTheDocument();
  });

  it("localizes aria labels (Sheet close, Stepper, OTP)", () => {
    // The Sheet is a modal: it now inerts the background (OVL-006), so unrelated
    // controls can't be live siblings of an open sheet — check it on its own,
    // then the rest in a fresh mount.
    const { unmount } = render(
      <TKLocaleProvider locale={ruLocale}>
        <TKSheet open title="T" />
      </TKLocaleProvider>,
    );
    expect(screen.getByRole("button", { name: "Закрыть" })).toBeInTheDocument();
    unmount();
    render(
      <TKLocaleProvider locale={ruLocale}>
        <TKStepper />
        <TKOTP />
      </TKLocaleProvider>,
    );
    expect(screen.getByRole("button", { name: "Уменьшить" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Увеличить" })).toBeInTheDocument();
    expect(screen.getByLabelText("Одноразовый код")).toBeInTheDocument();
  });

  it("localizes the MainButton success label", () => {
    render(
      <TKLocaleProvider locale={ruLocale}>
        <TKMainButton label="Pay" status="success" />
      </TKLocaleProvider>,
    );
    expect(screen.getByText("Готово")).toBeInTheDocument();
  });

  it("tkFormat fills {placeholders}", () => {
    expect(tkFormat("{value} of {max}", { value: 2, max: 5 })).toBe("2 of 5");
  });
});
