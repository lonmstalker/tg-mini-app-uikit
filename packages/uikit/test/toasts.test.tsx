import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TKToastProvider, useTKToast, type TKToastOptions } from "../src/composites/overlays";

function ShowButton({ toast, name }: { toast: TKToastOptions; name: string }) {
  const api = useTKToast();
  return (
    <button type="button" onClick={() => api.show(toast)}>
      {name}
    </button>
  );
}

const LONG = 60_000;

describe("TKToastProvider", () => {
  it("evicts the oldest toast above max", async () => {
    const user = userEvent.setup();
    render(
      <TKToastProvider max={2}>
        <ShowButton name="one" toast={{ text: "toast-1", duration: LONG }} />
        <ShowButton name="two" toast={{ text: "toast-2", duration: LONG }} />
        <ShowButton name="three" toast={{ text: "toast-3", duration: LONG }} />
      </TKToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "one" }));
    await user.click(screen.getByRole("button", { name: "two" }));
    expect(screen.getByText("toast-1")).toBeInTheDocument();
    expect(screen.getByText("toast-2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "three" }));
    // N+1-th toast pushes the oldest one out immediately
    expect(screen.queryByText("toast-1")).not.toBeInTheDocument();
    expect(screen.getByText("toast-2")).toBeInTheDocument();
    expect(screen.getByText("toast-3")).toBeInTheDocument();
  });

  it("auto-dismisses after its duration", async () => {
    const user = userEvent.setup();
    render(
      <TKToastProvider>
        <ShowButton name="show" toast={{ text: "ephemeral", duration: 20 }} />
      </TKToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "show" }));
    expect(screen.getByText("ephemeral")).toBeInTheDocument();

    await waitFor(() => expect(screen.queryByText("ephemeral")).not.toBeInTheDocument(), {
      timeout: 2000,
    });
  });

  it("dismisses on action click and calls onAction", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <TKToastProvider>
        <ShowButton name="show" toast={{ text: "saved", action: "Undo", onAction, duration: LONG }} />
      </TKToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "show" }));
    await user.click(screen.getByText("Undo"));

    expect(onAction).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText("saved")).not.toBeInTheDocument(), {
      timeout: 2000,
    });
  });

  it("exposes success/error shortcuts", async () => {
    const user = userEvent.setup();
    function Shortcuts() {
      const api = useTKToast();
      return (
        <>
          <button type="button" onClick={() => api.success("all good")}>ok</button>
          <button type="button" onClick={() => api.error("all bad")}>fail</button>
        </>
      );
    }
    render(
      <TKToastProvider>
        <Shortcuts />
      </TKToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "ok" }));
    await user.click(screen.getByRole("button", { name: "fail" }));
    expect(screen.getByText("all good")).toBeInTheDocument();
    expect(screen.getByText("all bad")).toBeInTheDocument();
  });

  it("useTKToast throws outside the provider", () => {
    function Naked() {
      useTKToast();
      return null;
    }
    expect(() => render(<Naked />)).toThrow(/TKToastProvider/);
  });
});
