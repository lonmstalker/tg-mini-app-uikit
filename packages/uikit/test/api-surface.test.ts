import { describe, expect, expectTypeOf, it } from "vitest";
import * as kit from "../src/index";
import type { TKMainButtonProps, TKMainButtonStatus } from "../src/buttons";
import type { TKSliderProps } from "../src/controls";
import type { TKSelectProps } from "../src/inputs";
import type { TKOption, TKOptionItem } from "../src/options";
import type { TKNativeButtonParams } from "../src/telegram";

describe("public API surface", () => {
  it("keeps the set of named exports stable", () => {
    expect(Object.keys(kit).sort()).toMatchSnapshot();
  });

  it("TKOption accepts a plain string or an item object", () => {
    expectTypeOf<string>().toExtend<TKOption>();
    expectTypeOf<TKOptionItem>().toExtend<TKOption>();
    expectTypeOf<{ value: string; label?: string; disabled?: boolean }>().toExtend<TKOption>();
    expectTypeOf<{ value: number }>().not.toExtend<TKOption>();
    expectTypeOf(kit.tkOptionItem).parameter(0).toEqualTypeOf<TKOption>();
    expectTypeOf(kit.tkOptionItem("a").value).toEqualTypeOf<string>();
  });

  it("tkOptionItem normalizes both option forms at runtime", () => {
    expect(kit.tkOptionItem("ru")).toEqual({ value: "ru", label: "ru" });
    expect(kit.tkOptionItem({ value: "ru" })).toEqual({ value: "ru", label: "ru" });
    expect(kit.tkOptionItem({ value: "ru", label: "Русский" })).toEqual({ value: "ru", label: "Русский" });
  });

  it("selection components take TKOption[]", () => {
    expectTypeOf<TKSelectProps["options"]>().toEqualTypeOf<TKOption[]>();
  });

  it("TKSlider value and onChange are numeric", () => {
    expectTypeOf<TKSliderProps["value"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<NonNullable<TKSliderProps["onChange"]>>().parameter(0).toEqualTypeOf<number>();
  });

  it("TKMainButton onClick may return a promise and status is the 3-state machine", () => {
    expectTypeOf<NonNullable<TKMainButtonProps["onClick"]>>().returns.toEqualTypeOf<void | Promise<unknown>>();
    expectTypeOf<TKMainButtonStatus>().toEqualTypeOf<"idle" | "loading" | "success">();
  });

  it("useMainButton takes declarative params and reports support", () => {
    expectTypeOf(kit.useMainButton).parameter(0).toEqualTypeOf<TKNativeButtonParams>();
    expectTypeOf(kit.useMainButton).returns.toEqualTypeOf<{ isSupported: boolean }>();
    expectTypeOf<TKNativeButtonParams["position"]>().toEqualTypeOf<"left" | "right" | "top" | "bottom" | undefined>();
  });
});
