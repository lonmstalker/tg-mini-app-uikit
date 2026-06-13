import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src";
import { TKNavPanel, TKNavStack, useNav } from "../src/composites/nav";

function Home() {
  const nav = useNav();
  return (
    <button type="button" onClick={() => nav.push("details", { orderId: 7 })}>
      Open details
    </button>
  );
}

function Details() {
  const nav = useNav();
  const params = nav.params as { orderId?: number };
  return (
    <div>
      <span>Order {params.orderId}</span>
      <button type="button" onClick={() => nav.pop()}>
        Back to list
      </button>
    </div>
  );
}

describe("nav module reorganization", () => {
  it("publishes nav stack primitives from the composite category and root package", () => {
    expect(TKNavPanel).toBe(kit.TKNavPanel);
    expect(TKNavStack).toBe(kit.TKNavStack);
    expect(useNav).toBe(kit.useNav);
  });

  it("renders a navigation stack from the new composite category", () => {
    const onStackChange = vi.fn();
    render(
      <TKNavStack initial="home" onStackChange={onStackChange} testId="nav-stack">
        <TKNavPanel id="home">
          <Home />
        </TKNavPanel>
        <TKNavPanel id="details">
          <Details />
        </TKNavPanel>
      </TKNavStack>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open details" }));
    expect(screen.getByText("Order 7")).toBeInTheDocument();
    expect(onStackChange).toHaveBeenLastCalledWith(["home", "details"]);

    fireEvent.click(screen.getByRole("button", { name: "Back to list" }));
    expect(onStackChange).toHaveBeenLastCalledWith(["home"]);
    expect(screen.getByTestId("nav-stack").querySelector('[data-tk-nav-panel="home"]')).not.toBeNull();
  });
});
