import { describe, expect, it } from "vitest";
import { formatDate, formatMessage, resolveLang, selectPlural, toIsoDate } from "../src/index";

describe("formatMessage", () => {
  it("substitutes simple placeholders", () => {
    expect(formatMessage("Hi {name}, {count} new", { name: "Sora", count: 3 })).toBe("Hi Sora, 3 new");
    expect(formatMessage("nothing here", {})).toBe("nothing here");
  });

  it("selects English plural forms (incl. exact =0)", () => {
    const tpl = "{count, plural, =0 {no guides} one {# guide} other {# guides}}";
    expect(formatMessage(tpl, { count: 0 }, "en")).toBe("no guides");
    expect(formatMessage(tpl, { count: 1 }, "en")).toBe("1 guide");
    expect(formatMessage(tpl, { count: 7 }, "en")).toBe("7 guides");
  });

  it("selects Russian one/few/many forms — the case the kit formatter got wrong", () => {
    const tpl = "{count, plural, one {# гид} few {# гида} many {# гидов} other {# гида}}";
    expect(formatMessage(tpl, { count: 1 }, "ru")).toBe("1 гид");
    expect(formatMessage(tpl, { count: 2 }, "ru")).toBe("2 гида");
    expect(formatMessage(tpl, { count: 5 }, "ru")).toBe("5 гидов");
    expect(formatMessage(tpl, { count: 21 }, "ru")).toBe("21 гид"); // 21 → one in Russian
  });
});

describe("selectPlural", () => {
  it("returns CLDR categories per locale", () => {
    expect(selectPlural("ru", 1)).toBe("one");
    expect(selectPlural("ru", 3)).toBe("few");
    expect(selectPlural("ru", 5)).toBe("many");
    expect(selectPlural("en", 1)).toBe("one");
    expect(selectPlural("en", 2)).toBe("other");
  });
});

describe("resolveLang", () => {
  const supported = ["en", "ru"] as const;
  it("prefers a supported override", () => {
    expect(resolveLang({ code: "en-US", supported, fallback: "en", override: "ru" })).toBe("ru");
  });
  it("ignores an unsupported override and matches the regional code", () => {
    expect(resolveLang({ code: "ru-RU", supported, fallback: "en", override: "de" })).toBe("ru");
  });
  it("falls back when nothing matches", () => {
    expect(resolveLang({ code: "de-DE", supported, fallback: "en" })).toBe("en");
    expect(resolveLang({ supported, fallback: "en" })).toBe("en");
  });
});

describe("dates", () => {
  it("toIsoDate reads local Y/M/D (no UTC off-by-one)", () => {
    expect(toIsoDate(new Date(2026, 5, 21))).toBe("2026-06-21");
  });
  it("formatDate is locale-aware", () => {
    expect(formatDate("2026-06-21", "en")).toMatch(/Jun/);
    expect(formatDate("2026-06-21", "ru")).toMatch(/июн/);
  });
});
