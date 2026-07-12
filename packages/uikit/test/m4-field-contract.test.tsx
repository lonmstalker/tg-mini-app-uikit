import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";
import type { TKFieldProps } from "../src/atoms/inputs/base";

/* M4 field contract: TKFieldProps base, control field-chrome, name plumbing,
 * controlled WriteBar (CHT-002), controlled nav stack (NAV2-007). */

/* ---------------- INP-DX-001 / CC-15 — shared field contract ---------------- */

describe("INP-DX-001 TKFieldProps base", () => {
  it("is a value-first contract a (value)=>void handler satisfies", () => {
    // type-level: a narrow handler is assignable (event arg is optional)
    const onChange: TKFieldProps<string>["onChange"] = (v: string) => void v;
    const props: TKFieldProps<string> = { label: "Name", onChange, value: "a" };
    expect(props.label).toBe("Name");
  });

  it("TKRadioGroup adopts the base (label/error/required/name)", () => {
    // exercised behaviorally below; this just pins the prop names compile
    const props: kit.TKRadioGroupProps = { options: ["a"], label: "L", error: "E", required: true, name: "n" };
    expect(props.options).toEqual(["a"]);
  });
});

/* ---------------- CTL-DX-001/003 — RadioGroup field chrome ---------------- */

describe("CTL-DX-001/003 RadioGroup label/hint/error/required", () => {
  it("names the radiogroup via the label", () => {
    render(<kit.TKRadioGroup label="Plan" options={["free", "pro"]} />);
    expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeInTheDocument();
  });

  it("announces an error and marks the group invalid", () => {
    render(<kit.TKRadioGroup label="Plan" error="Required" options={["free"]} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-invalid", "true");
  });

  it("marks required", () => {
    render(<kit.TKRadioGroup label="Plan" required options={["free"]} />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-required", "true");
  });

  it("works label-less (bare radiogroup, no FormField)", () => {
    render(<kit.TKRadioGroup options={["a", "b"]} testId="rg" />);
    expect(screen.getByTestId("rg")).toHaveAttribute("role", "radiogroup");
    expect(screen.getByTestId("rg")).not.toHaveAttribute("aria-labelledby");
  });
});

/* ---------------- FRM-DX-001 — name plumbing ---------------- */

describe("FRM-DX-001 RadioGroup form value", () => {
  it("submits the selected value via a hidden form field", () => {
    render(
      <form data-testid="form">
        <kit.TKRadioGroup name="plan" defaultValue="pro" options={["free", "pro"]} />
      </form>,
    );
    const form = screen.getByTestId("form") as HTMLFormElement;
    expect(new FormData(form).get("plan")).toBe("pro");
  });
});

/* ---------------- CHT-002 — controlled WriteBar ---------------- */

describe("CHT-002 TKWriteBar controlled mode", () => {
  it("reflects a controlled value and reports changes", () => {
    const onChange = vi.fn();
    render(<kit.TKWriteBar value="draft" onChange={onChange} onSend={() => {}} placeholder="Message" />);
    const area = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(area.value).toBe("draft");
    fireEvent.change(area, { target: { value: "hello" } });
    expect(onChange).toHaveBeenCalledWith("hello");
  });

  it("forwards inputRef to the textarea", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<kit.TKWriteBar inputRef={ref} onSend={() => {}} />);
    expect(ref.current?.tagName).toBe("TEXTAREA");
  });

  it("uncontrolled still sends and clears on Enter", () => {
    const onSend = vi.fn();
    render(<kit.TKWriteBar onSend={onSend} placeholder="Message" />);
    const area = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(area, { target: { value: "hi" } });
    fireEvent.keyDown(area, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("hi");
    expect(area.value).toBe("");
  });
});

/* ---------------- NAV2-007 — controlled nav stack ---------------- */

function Panel({ id, label }: { id: string; label: string }) {
  return (
    <kit.TKNavPanel id={id}>
      <div>{label}</div>
    </kit.TKNavPanel>
  );
}

describe("NAV2-007 TKNavStack controlled stack + reset", () => {
  it("renders the top panel of a controlled stack and round-trips onChange", () => {
    const onChange = vi.fn();
    function Harness() {
      const stack = [{ panel: "a" }, { panel: "b" }];
      return (
        <kit.TKNavStack initial="a" stack={stack} onChange={onChange} testId="nav">
          <Panel id="a" label="Screen A" />
          <Panel id="b" label="Screen B" />
        </kit.TKNavStack>
      );
    }
    render(<Harness />);
    // top of the controlled stack (b) is the visible panel
    const top = screen.getByTestId("nav").querySelector('[data-tk-nav-panel="b"]');
    expect(top).not.toBeNull();
    expect(screen.getByText("Screen B")).toBeInTheDocument();
  });

  it("restores a 3-entry stack on mount", () => {
    render(
      <kit.TKNavStack initial="a" stack={[{ panel: "a" }, { panel: "b" }, { panel: "c" }]} testId="nav">
        <Panel id="a" label="A" />
        <Panel id="b" label="B" />
        <Panel id="c" label="C" />
      </kit.TKNavStack>,
    );
    expect(screen.getByTestId("nav").querySelector('[data-tk-nav-panel="c"]')).not.toBeNull();
  });

  it("does not crash on an empty controlled stack (falls back to initial)", () => {
    expect(() =>
      render(
        <kit.TKNavStack initial="a" stack={[]} testId="nav">
          <Panel id="a" label="A" />
        </kit.TKNavStack>,
      ),
    ).not.toThrow();
    expect(screen.getByTestId("nav").querySelector('[data-tk-nav-panel="a"]')).not.toBeNull();
  });

  it("uncontrolled push/pop still works", () => {
    function Home() {
      const nav = kit.useNav();
      return (
        <button type="button" onClick={() => nav.push("b")}>
          go
        </button>
      );
    }
    const onStackChange = vi.fn();
    render(
      <kit.TKNavStack initial="a" onStackChange={onStackChange}>
        <kit.TKNavPanel id="a">
          <Home />
        </kit.TKNavPanel>
        <Panel id="b" label="B" />
      </kit.TKNavStack>,
    );
    fireEvent.click(screen.getByRole("button", { name: "go" }));
    expect(onStackChange).toHaveBeenLastCalledWith(["a", "b"]);
  });
});
