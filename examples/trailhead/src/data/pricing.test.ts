import { describe, expect, it } from "vitest";
import { TRAIL_PASS_RATE, checkoutLineItems, computeCheckout, trailPassDiscount } from "./pricing";

describe("pricing — Trail Pass discount", () => {
  it("applies 15% only when the pass is active", () => {
    expect(trailPassDiscount(450, false)).toBe(0);
    expect(trailPassDiscount(450, true)).toBe(Math.round(450 * TRAIL_PASS_RATE)); // 68
    expect(trailPassDiscount(450, true)).toBe(68);
  });

  it("rounds to whole Stars and never goes negative", () => {
    expect(trailPassDiscount(0, true)).toBe(0);
    expect(trailPassDiscount(-100, true)).toBe(0);
    expect(trailPassDiscount(333, true)).toBe(50); // 49.95 → 50
  });

  it("computeCheckout applies Trail Pass accounting before the 1 Star demo cap", () => {
    const without = computeCheckout(450, false);
    expect(without).toEqual({ subtotal: 450, discount: 0, demoCap: 449, total: 1, trailPassApplied: false });

    const withPass = computeCheckout(450, true);
    expect(withPass).toEqual({ subtotal: 450, discount: 68, demoCap: 381, total: 1, trailPassApplied: true });
    expect(withPass.discount).toBeGreaterThan(without.discount);
  });

  it("builds line items: base always, applied discounts, and the demo safety cap", () => {
    const plain = checkoutLineItems("Sunrise Ridge", computeCheckout(450, false));
    expect(plain).toHaveLength(2);
    expect(plain[0]).toMatchObject({ labelKey: "checkout.lineExperience", stars: 450 });
    expect(plain[1]).toMatchObject({ labelKey: "checkout.lineDemoCap", stars: -449 });

    const discounted = checkoutLineItems("Sunrise Ridge", computeCheckout(450, true));
    expect(discounted).toHaveLength(3);
    expect(discounted[1]).toMatchObject({ labelKey: "checkout.lineTrailPass", stars: -68 });
    expect(discounted[2]).toMatchObject({ labelKey: "checkout.lineDemoCap", stars: -381 });
    // Line items sum to the total.
    expect(discounted.reduce((sum, i) => sum + i.stars, 0)).toBe(1);
  });
});
