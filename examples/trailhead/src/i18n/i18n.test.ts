import { describe, expect, it } from "vitest";
import { en } from "./en";
import { ru } from "./ru";

/*
 * Key-parity guard. The shared `Dict` type already makes a missing key a `tsc`
 * error, but this catches the runtime-only failure modes a type cannot: an
 * empty translation, or a stray key in one dictionary. Red the moment any
 * user-facing string is added to en.ts but not ru.ts.
 */
describe("i18n dictionaries", () => {
  it("en and ru have identical key sets", () => {
    const enKeys = Object.keys(en).sort();
    const ruKeys = Object.keys(ru).sort();
    expect(ruKeys).toEqual(enKeys);
  });

  it("no value is empty in either language", () => {
    for (const [key, value] of Object.entries(en)) {
      expect(value, `en[${key}] is empty`).not.toBe("");
    }
    for (const [key, value] of Object.entries(ru)) {
      expect(value, `ru[${key}] is empty`).not.toBe("");
    }
  });

  it("templated strings keep their placeholders in both languages", () => {
    const placeholders = (s: string) => (s.match(/\{(\w+)\}/g) ?? []).sort();
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(placeholders(ru[key]), `placeholders differ for ${key}`).toEqual(placeholders(en[key]));
    }
  });
});
