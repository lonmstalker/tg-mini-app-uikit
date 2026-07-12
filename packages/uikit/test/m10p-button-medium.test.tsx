import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M10-P — button MEDIUM: BTN-005 (IconButton native passthrough), BTN-006 (badge
 * clamp/hide), BTN-009 (loading announcement + decorative spinner). */

describe("BTN-005 TKIconButton forwards native button props", () => {
  it("[D-API] type/title/name + onKeyDown reach the DOM button", () => {
    const onKeyDown = vi.fn();
    render(<kit.TKIconButton icon="plus" label="Go" type="submit" title="Add" name="go" onKeyDown={onKeyDown} />);
    const btn = screen.getByRole("button", { name: "Go" });
    expect(btn.getAttribute("type")).toBe("submit");
    expect(btn.getAttribute("title")).toBe("Add");
    expect(btn.getAttribute("name")).toBe("go");
    fireEvent.keyDown(btn, { key: "Enter" });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it("[D-API] type='submit' submits its form", () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <kit.TKIconButton icon="plus" label="Submit" type="submit" />
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe("BTN-006 TKIconButton badge clamps + hides", () => {
  it("[D-RESP] badge=0 renders no bubble; 1280 shows 99+; 5 shows 5", () => {
    const { rerender } = render(<kit.TKIconButton icon="bell" label="N" badge={0} />);
    expect(screen.queryByText("0")).toBeNull();
    rerender(<kit.TKIconButton icon="bell" label="N" badge={1280} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
    rerender(<kit.TKIconButton icon="bell" label="N" badge={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});

describe("BTN-009 loading is announced; spinner is decorative", () => {
  it("[D-A11Y] a loading button exposes a polite 'Loading…' status", () => {
    render(<kit.TKButton loading>Save</kit.TKButton>);
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status).toHaveTextContent(/loading/i);
  });

  it("[D-A11Y] a standalone spinner is aria-hidden by default; a label opts in", () => {
    const { rerender, container } = render(<kit.TKSpinner testId="sp" />);
    expect(screen.getByTestId("sp").getAttribute("aria-hidden")).toBe("true");
    rerender(<kit.TKSpinner testId="sp" label="Loading" />);
    expect(container.querySelector("[aria-hidden]")).toBeNull();
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });
});
