import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useControllable } from "../src/internal/useControllable";

interface Props<T> {
  controlled: T | undefined;
  defaultValue: T;
  onChange?: (value: T) => void;
}

function setup<T>(initial: Props<T>) {
  return renderHook(({ controlled, defaultValue, onChange }: Props<T>) => useControllable(controlled, defaultValue, onChange), {
    initialProps: initial,
  });
}

describe("useControllable", () => {
  it("starts from defaultValue in uncontrolled mode", () => {
    const { result } = setup({ controlled: undefined, defaultValue: "a" });
    expect(result.current[0]).toBe("a");
  });

  it("updates internal state and reports onChange in uncontrolled mode", () => {
    const onChange = vi.fn();
    const { result } = setup({ controlled: undefined, defaultValue: 0, onChange });
    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("mirrors the controlled value and does not change it on set", () => {
    const onChange = vi.fn();
    const { result, rerender } = setup({ controlled: "x", defaultValue: "d", onChange });
    expect(result.current[0]).toBe("x");

    act(() => result.current[1]("y"));
    // controlled: value stays whatever the prop says, change is only reported
    expect(result.current[0]).toBe("x");
    expect(onChange).toHaveBeenCalledWith("y");

    rerender({ controlled: "y", defaultValue: "d", onChange });
    expect(result.current[0]).toBe("y");
  });

  it("uses the latest onChange callback, not the one from the first render", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = setup({ controlled: undefined, defaultValue: 0, onChange: first });
    rerender({ controlled: undefined, defaultValue: 0, onChange: second });
    act(() => result.current[1](1));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(1);
  });

  it("survives switching controlled -> uncontrolled", () => {
    const { result, rerender } = setup<string | undefined>({ controlled: "c", defaultValue: "d" });
    expect(result.current[0]).toBe("c");

    rerender({ controlled: undefined, defaultValue: "d" });
    // falls back to the internal state (still the default — controlled sets never touched it)
    expect(result.current[0]).toBe("d");

    act(() => result.current[1]("e"));
    expect(result.current[0]).toBe("e");
  });

  it("survives switching uncontrolled -> controlled", () => {
    const { result, rerender } = setup<string | undefined>({ controlled: undefined, defaultValue: "d" });
    act(() => result.current[1]("e"));
    expect(result.current[0]).toBe("e");

    rerender({ controlled: "c", defaultValue: "d" });
    expect(result.current[0]).toBe("c");

    act(() => result.current[1]("f"));
    expect(result.current[0]).toBe("c");
  });
});
