import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TKOTP } from "../src/atoms/inputs";

const getInput = () => screen.getByLabelText("One-time code") as HTMLInputElement;

describe("TKOTP", () => {
  it("accepts a full code via paste and fires onComplete once", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onComplete = vi.fn();
    render(<TKOTP length={5} onChange={onChange} onComplete={onComplete} successText="Verified" />);

    getInput().focus();
    await user.paste("12345");

    expect(getInput().value).toBe("12345");
    expect(onChange).toHaveBeenLastCalledWith("12345");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("12345");
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("keeps a partial paste without completing", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<TKOTP length={5} onComplete={onComplete} resendPrompt="No code?" />);

    getInput().focus();
    await user.paste("12");

    expect(getInput().value).toBe("12");
    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByText("No code?")).toBeInTheDocument();
  });

  it("filters out non-digit characters", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TKOTP length={5} onChange={onChange} />);

    getInput().focus();
    await user.paste("1a2-b3 ");

    expect(getInput().value).toBe("123");
    expect(onChange).toHaveBeenLastCalledWith("123");
  });

  it("truncates input longer than the code length", () => {
    const onChange = vi.fn();
    render(<TKOTP length={4} onChange={onChange} />);

    fireEvent.change(getInput(), { target: { value: "123456789" } });

    expect(getInput().value).toBe("1234");
    expect(onChange).toHaveBeenLastCalledWith("1234");
  });

  it("renders the typed digits in the cells", async () => {
    const user = userEvent.setup();
    render(<TKOTP length={4} />);

    getInput().focus();
    await user.paste("42");

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("fires onResend from the resend link", async () => {
    const user = userEvent.setup();
    const onResend = vi.fn();
    render(<TKOTP length={4} onResend={onResend} resendLabel="Send again" />);

    await user.click(screen.getByText("Send again"));
    expect(onResend).toHaveBeenCalledTimes(1);
  });
});
