import { type ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";
import { TKLocaleProvider, ruLocale } from "../src/foundation/i18n";

/* M10-D — controls MEDIUM: CTL-005 (slider accessible names), CTL-006 (stepper
 * editable clamp/commit), CTL-011 (slider track touch-action). */

const ru = (ui: ReactNode) => <TKLocaleProvider locale={ruLocale}>{ui}</TKLocaleProvider>;

describe("CTL-005 TKSlider accessible names", () => {
  it("[D-A11Y] single slider is named by its label", () => {
    render(<kit.TKSlider label="Volume" value={30} />);
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
  });

  it("[D-A11Y] range thumbs get distinct min/max names", () => {
    render(ru(<kit.TKSlider range label="Цена" defaultRange={[10, 90]} />));
    expect(screen.getByRole("slider", { name: "Цена минимум" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Цена максимум" })).toBeInTheDocument();
  });

  it("[D-A11Y] a slider without label warns in dev", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<kit.TKSlider value={50} />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/TKSlider.*label/i);
    warn.mockRestore();
  });

  it("[D-API] a labelled slider does not warn", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<kit.TKSlider range label="Range" defaultRange={[0, 100]} />);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("CTL-006 TKStepper editable input", () => {
  it("[D-TG] declares numeric keypad + done hint", () => {
    render(<kit.TKStepper editable defaultValue={5} />);
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("enterkeyhint", "done");
  });

  it("[D-STATE] an over-max draft is clamped + committed on change", () => {
    const onChange = vi.fn();
    render(<kit.TKStepper editable defaultValue={5} min={0} max={10} onChange={onChange} />);
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "999" } });
    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(input.value).toBe("10");
  });

  it("[D-EDGE] a below-min draft clamps to min", () => {
    const onChange = vi.fn();
    render(<kit.TKStepper editable defaultValue={5} min={0} max={10} onChange={onChange} />);
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "-5" } });
    expect(onChange).toHaveBeenLastCalledWith(0);
    expect(input.value).toBe("0");
  });

  it("[D-EDGE] clearing the field reverts to the last valid value on blur (no data loss)", () => {
    const onChange = vi.fn();
    render(<kit.TKStepper editable defaultValue={7} min={1} max={20} onChange={onChange} />);
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(input.value).toBe("7"); // reverts to committed, not clobbered to min
    expect(onChange).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalledWith(Number.NaN);
  });
});

describe("CTL-011 TKSlider track yields vertical pans", () => {
  it("[D-TG] single slider track is touch-action: pan-y (not none)", () => {
    render(<kit.TKSlider label="Brightness" value={40} />);
    expect((screen.getByRole("slider") as HTMLElement).style.touchAction).toBe("pan-y");
  });

  it("[D-TG] range slider track is touch-action: pan-y", () => {
    render(<kit.TKSlider range label="Span" defaultRange={[20, 80]} />);
    // Thumbs ride full-width transform rails: thumb → rail → track.
    const track = screen.getAllByRole("slider")[0].parentElement!.parentElement as HTMLElement;
    expect(track.style.touchAction).toBe("pan-y");
  });
});
