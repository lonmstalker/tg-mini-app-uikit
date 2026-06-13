import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TKMainButton } from "../src/atoms/buttons";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("TKMainButton state machine", () => {
  it("runs idle -> loading -> success -> idle on a resolved promise", async () => {
    const user = userEvent.setup();
    const d = deferred<void>();
    render(
      <TKMainButton label="Pay" successLabel="Paid" successDuration={30} onClick={() => d.promise} />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Pay");

    await user.click(button);
    // loading: label replaced by the spinner
    expect(button).not.toHaveTextContent("Pay");
    expect(screen.queryByText("Paid")).not.toBeInTheDocument();

    d.resolve();
    await waitFor(() => expect(button).toHaveTextContent("Paid"));
    await waitFor(() => expect(button).toHaveTextContent("Pay"));
  });

  it("returns to idle without success on a rejected promise", async () => {
    const user = userEvent.setup();
    const d = deferred<void>();
    render(<TKMainButton label="Pay" successLabel="Paid" onClick={() => d.promise} />);

    const button = screen.getByRole("button");
    await user.click(button);
    expect(button).not.toHaveTextContent("Pay");

    d.reject(new Error("declined"));
    await waitFor(() => expect(button).toHaveTextContent("Pay"));
    expect(screen.queryByText("Paid")).not.toBeInTheDocument();
  });

  it("ignores clicks while loading", async () => {
    const user = userEvent.setup();
    const d = deferred<void>();
    const onClick = vi.fn(() => d.promise);
    render(<TKMainButton label="Pay" onClick={onClick} />);

    const button = screen.getByRole("button");
    await user.click(button);
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    d.resolve();
  });

  it("stays idle when onClick returns nothing", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<TKMainButton label="Pay" onClick={onClick} />);

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button")).toHaveTextContent("Pay");
  });

  it("lets a controlled status drive the rendering", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn(() => Promise.resolve());
    const { rerender } = render(
      <TKMainButton label="Pay" successLabel="Paid" status="idle" onClick={onClick} />,
    );
    const button = screen.getByRole("button");

    await user.click(button);
    // controlled: the internal machine is bypassed, status stays as given
    expect(button).toHaveTextContent("Pay");
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<TKMainButton label="Pay" successLabel="Paid" status="success" onClick={onClick} />);
    expect(button).toHaveTextContent("Paid");

    rerender(<TKMainButton label="Pay" successLabel="Paid" status="loading" onClick={onClick} />);
    await user.click(button);
    // non-idle: clicks are not forwarded
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not run onClick when disabled", () => {
    const onClick = vi.fn();
    render(<TKMainButton label="Pay" disabled onClick={onClick} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
