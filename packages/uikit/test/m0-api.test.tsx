import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, type ComponentType } from "react";
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as kit from "../src/index";
import { MINIMAL_PROPS } from "./helpers/minimal-props";
import { discoverComponents } from "./helpers/components";

const componentByName = (name: string) =>
  (kit as Record<string, unknown>)[name] as ComponentType<Record<string, unknown>>;

/* ---------------- M0.1 forwardRef ---------------- */

const REF_COMPONENTS = [
  "TKButton",
  "TKIconButton",
  "TKMainButton",
  "TKChip",
  "TKCheckbox",
  "TKSwitch",
  "TKTappable",
  "TKInput",
  "TKTextarea",
  "TKSearch",
  "TKSelect",
  "TKMultiselect",
  "TKOTP",
  "TKFileInput",
  "TKCard",
  "TKCardCell",
  "TKCardChip",
  "TKCell",
  "TKSheet",
  "TKDialog",
  "TKActionSheet",
];

describe("M0.1 forwardRef", () => {
  it.each(REF_COMPONENTS)("%s forwards ref to a DOM element", (name) => {
    const Component = componentByName(name);
    const ref = createRef<HTMLElement>();
    render(<Component {...(MINIMAL_PROPS[name] ?? {})} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it.each(["TKInput", "TKTextarea", "TKSearch", "TKOTP"])(
    "%s forwards ref to the form control itself (react-hook-form)",
    (name) => {
      const Component = componentByName(name);
      const ref = createRef<HTMLElement>();
      render(<Component {...(MINIMAL_PROPS[name] ?? {})} ref={ref} />);
      expect(["INPUT", "TEXTAREA"]).toContain(ref.current?.tagName);
    },
  );
});

/* ---------------- M0.2 polymorphism ---------------- */

describe("M0.2 polymorphism as/href", () => {
  it("TKButton renders an anchor with as='a'", () => {
    render(
      <kit.TKButton as="a" href="https://example.com">
        Open
      </kit.TKButton>,
    );
    const link = screen.getByRole("link", { name: "Open" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("TKTappable renders an anchor with as='a'", () => {
    render(
      <kit.TKTappable as="a" href="https://example.com" label="Go">
        Go
      </kit.TKTappable>,
    );
    expect(screen.getByRole("link", { name: "Go" }).tagName).toBe("A");
  });

  it("TKCell renders an anchor root with as='a'", () => {
    const { container } = render(<kit.TKCell as="a" href="https://example.com" title="Row" />);
    const root = container.querySelector("a");
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("href", "https://example.com");
  });

  it("TKCardCell renders an anchor root with as='a'", () => {
    const { container } = render(<kit.TKCardCell as="a" href="https://example.com" title="Card" />);
    expect(container.querySelector("a")).toHaveAttribute("href", "https://example.com");
  });

  it("href without as='a' is a type error", () => {
    // @ts-expect-error — href is only valid together with as="a"
    void (<kit.TKButton href="https://example.com">Open</kit.TKButton>);
  });
});

/* ---------------- M0.3 native DOM passthrough ---------------- */

describe("M0.3 DOM handlers and attributes", () => {
  it("TKButton passes pointer handlers, id and aria-*", () => {
    const down = vi.fn();
    const up = vi.fn();
    render(
      <kit.TKButton id="b1" aria-describedby="hint" onPointerDown={down} onPointerUp={up}>
        Hi
      </kit.TKButton>,
    );
    const btn = screen.getByRole("button", { name: "Hi" });
    expect(btn).toHaveAttribute("id", "b1");
    expect(btn).toHaveAttribute("aria-describedby", "hint");
    fireEvent.pointerDown(btn);
    fireEvent.pointerUp(btn);
    expect(down).toHaveBeenCalledOnce();
    expect(up).toHaveBeenCalledOnce();
  });

  it("TKIconButton passes focus/blur handlers", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<kit.TKIconButton icon="check" label="act" onFocus={onFocus} onBlur={onBlur} />);
    const btn = screen.getByRole("button", { name: "act" });
    fireEvent.focus(btn);
    fireEvent.blur(btn);
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it("TKInput chains user onFocus/onBlur with internal focus state and passes id", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<kit.TKInput id="name" placeholder="Name" onFocus={onFocus} onBlur={onBlur} />);
    const input = screen.getByPlaceholderText("Name");
    expect(input).toHaveAttribute("id", "name");
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it("TKCell passes pointer handlers", () => {
    const down = vi.fn();
    render(<kit.TKCell title="Row" onPointerDown={down} testId="cell" />);
    fireEvent.pointerDown(screen.getByTestId("cell"));
    expect(down).toHaveBeenCalledOnce();
  });
});

/* ---------------- M0.4 loading / icon button sizes ---------------- */

describe("M0.4 TKButton loading & TKIconButton sizes", () => {
  it("TKButton loading shows a spinner, sets aria-busy and blocks clicks", () => {
    const onClick = vi.fn();
    render(
      <kit.TKButton loading onClick={onClick}>
        Pay
      </kit.TKButton>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
    // label stays in the DOM so the width does not jump
    expect(btn.textContent).toContain("Pay");
  });

  it("TKIconButton supports size variants sm|md|lg and legacy numbers", () => {
    const { rerender } = render(<kit.TKIconButton icon="check" label="act" size="sm" testId="ib" />);
    expect(screen.getByTestId("ib").style.width).toBe("32px");
    rerender(<kit.TKIconButton icon="check" label="act" size="lg" testId="ib" />);
    expect(screen.getByTestId("ib").style.width).toBe("48px");
    rerender(<kit.TKIconButton icon="check" label="act" size={40} testId="ib" />);
    expect(screen.getByTestId("ib").style.width).toBe("40px");
  });
});

/* ---------------- M0.5 testId ---------------- */

const NO_TESTID = new Set([
  "TKTelegramProvider", // renders no DOM of its own
  "TKToastProvider", // provider; the toast region is internal
  "TKLocaleProvider", // renders no DOM of its own
]);

const TESTID_PROPS: Record<string, Record<string, unknown>> = {
  ...MINIMAL_PROPS,
  TKPopper: { open: true, anchorRef: { current: null } },
};

const allComponents = discoverComponents(kit)
  .map(([name]) => name)
  .filter((name) => !NO_TESTID.has(name));

describe("M0.5 testId renders data-testid", () => {
  it("discovers the component exports", () => {
    expect(allComponents.length).toBeGreaterThan(50);
  });

  it.each(allComponents)("%s renders data-testid", (name) => {
    const Component = componentByName(name);
    let props = TESTID_PROPS[name] ?? {};
    if (name === "TKPopper") {
      const anchor = document.createElement("div");
      document.body.appendChild(anchor);
      props = { ...props, anchorRef: { current: anchor } };
    }
    const { baseElement } = render(<Component {...props} testId="probe" />);
    expect(baseElement.querySelector('[data-testid="probe"]')).not.toBeNull();
  });
});

/* ---------------- M0.6 / M0.7 tokens ---------------- */

describe("M0.6/M0.7 token scales and @layer", () => {
  const css = readFileSync(resolve(__dirname, "../src/styles/tokens.css"), "utf8");

  it("defines the spacing scale --tk-sp-1..8", () => {
    for (let i = 1; i <= 8; i++) expect(css).toContain(`--tk-sp-${i}:`);
  });

  it("defines the z-index scale", () => {
    for (const z of ["base", "sticky", "header", "overlay", "sheet", "dialog", "popper", "toast"]) {
      expect(css).toContain(`--tk-z-${z}:`);
    }
  });

  it("wraps the stylesheet in @layer tk", () => {
    expect(css).toMatch(/@layer tk\s*\{/);
  });

  it.each(["overlays.tsx", "inputs.tsx"])("%s uses the z-index scale instead of magic numbers", (file) => {
    const src = readFileSync(resolve(__dirname, `../src/${file}`), "utf8");
    expect(src).not.toMatch(/zIndex:\s*(10|11|12|20|30|40)\b/);
  });
});

/* ---------------- M0.8 Escape / Enter in overlays ---------------- */

describe("M0.8 overlay keyboard behavior", () => {
  it("TKDialog closes on Escape and confirms on Enter", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<kit.TKDialog open title="Sure?" onClose={onClose} onConfirm={onConfirm} />);
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onConfirm).toHaveBeenCalledOnce();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("TKSheet closes on Escape", () => {
    const onClose = vi.fn();
    render(<kit.TKSheet open title="Sheet" onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("TKActionSheet closes on Escape", () => {
    const onClose = vi.fn();
    render(<kit.TKActionSheet open items={[{ label: "Do" }]} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("TKPopper closes on Escape", () => {
    const onClose = vi.fn();
    const anchor = document.createElement("div");
    document.body.appendChild(anchor);
    render(
      <kit.TKPopper open anchorRef={{ current: anchor }} onClose={onClose}>
        Pop
      </kit.TKPopper>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
