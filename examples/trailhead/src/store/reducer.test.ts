import { describe, expect, it } from "vitest";
import type { Booking } from "../data/mockApi";
import { createInitialState, reducer, toPersisted, type AppState } from "./reducer";

const booking = (id: string, over: Partial<Booking> = {}): Booking => ({
  id,
  experienceId: "sunrise-ridge",
  date: "2026-06-21",
  slot: "07:00",
  status: "paid",
  priceStars: 450,
  ...over,
});

const fresh = (): AppState => ({ ...createInitialState(), hydrated: true });

describe("store reducer", () => {
  it("seeds a fresh session with one booking and day-5 streak", () => {
    const s = createInitialState();
    expect(s.bookings).toHaveLength(1);
    expect(s.streak.dayOfWeek).toBe(5);
    expect(s.onboardingDone).toBe(false);
    expect(s.hydrated).toBe(false);
  });

  it("HYDRATE merges persisted slices and flips hydrated, preserving cart", () => {
    const start: AppState = { ...fresh(), cart: { experienceId: "granite-peak" }, hydrated: false };
    const next = reducer(start, {
      type: "HYDRATE",
      payload: { onboardingDone: true, streak: { xp: 50, dayOfWeek: 2 } },
    });
    expect(next.hydrated).toBe(true);
    expect(next.onboardingDone).toBe(true);
    expect(next.streak).toEqual({ xp: 50, dayOfWeek: 2 });
    expect(next.cart).toEqual({ experienceId: "granite-peak" });
  });

  it("ADD_BOOKING prepends and de-dupes by id", () => {
    const one = reducer(fresh(), { type: "ADD_BOOKING", payload: booking("bk-1") });
    expect(one.bookings[0].id).toBe("bk-1");
    const again = reducer(one, { type: "ADD_BOOKING", payload: booking("bk-1") });
    expect(again).toBe(one); // identity unchanged — no twin
    expect(again.bookings.filter((b) => b.id === "bk-1")).toHaveLength(1);
  });

  it("SET_BOOKING_STATUS flips only the targeted booking", () => {
    const withBk = reducer(fresh(), { type: "ADD_BOOKING", payload: booking("bk-1", { status: "paid" }) });
    const next = reducer(withBk, { type: "SET_BOOKING_STATUS", id: "bk-1", status: "checkedIn" });
    expect(next.bookings.find((b) => b.id === "bk-1")?.status).toBe("checkedIn");
    expect(next.bookings.find((b) => b.id === "bk-seed")?.status).toBe("paid");
  });

  it("SET_CART merges and RESET_CART clears", () => {
    const a = reducer(fresh(), { type: "SET_CART", payload: { experienceId: "blue-canyon" } });
    const b = reducer(a, { type: "SET_CART", payload: { slot: "10:00" } });
    expect(b.cart).toEqual({ experienceId: "blue-canyon", slot: "10:00" });
    expect(reducer(b, { type: "RESET_CART" }).cart).toEqual({});
  });

  it("ADD_XP accumulates", () => {
    const next = reducer(fresh(), { type: "ADD_XP", amount: 100 });
    expect(next.streak.xp).toBe(fresh().streak.xp + 100);
  });

  it("SET_WALLET and SET_THEME_PREF merge their slices", () => {
    const w = reducer(fresh(), { type: "SET_WALLET", payload: { connected: true, trailPassActive: true } });
    expect(w.wallet).toMatchObject({ connected: true, trailPassActive: true, address: null });
    const t = reducer(w, { type: "SET_THEME_PREF", payload: { accent: "#e5484d" } });
    expect(t.themePrefs.accent).toBe("#e5484d");
    expect(t.themePrefs.roundness).toBe(1); // untouched
  });

  it("COMPLETE_ONBOARDING and RESET_ONBOARDING toggle the flag", () => {
    const done = reducer(fresh(), { type: "COMPLETE_ONBOARDING" });
    expect(done.onboardingDone).toBe(true);
    expect(reducer(done, { type: "RESET_ONBOARDING" }).onboardingDone).toBe(false);
  });

  it("toPersisted projects exactly the durable slices (no cart/hydrated)", () => {
    const persisted = toPersisted(fresh());
    expect(Object.keys(persisted).sort()).toEqual(
      ["bookings", "onboardingDone", "pin", "streak", "themePrefs", "wallet"].sort(),
    );
  });

  it("is pure — an action never mutates the previous state", () => {
    const before = fresh();
    const snapshot = JSON.stringify(before);
    reducer(before, { type: "ADD_BOOKING", payload: booking("bk-9") });
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});
