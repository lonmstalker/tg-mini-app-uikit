/*
 * Pure checkout math. Kept out of components so the Trail Pass discount can be
 * unit-tested directly and reused by both the booking summary (M2) and the
 * wallet cell (M4). All amounts are integer Telegram Stars.
 */

export const TRAIL_PASS_RATE = 0.15;
export const DEMO_MAX_CHARGE_STARS = 1;

export interface LineItem {
  /** i18n key for the row label (resolved by the caller). */
  labelKey: string;
  /** Signed Stars (negative for a discount). */
  stars: number;
  /** Optional placeholder vars for the label template. */
  vars?: Record<string, string | number>;
}

export interface Checkout {
  subtotal: number;
  discount: number;
  demoCap: number;
  total: number;
  trailPassApplied: boolean;
}

/** Trail Pass discount on a subtotal, rounded to whole Stars (never negative). */
export function trailPassDiscount(subtotalStars: number, active: boolean): number {
  if (!active || subtotalStars <= 0) return 0;
  return Math.round(subtotalStars * TRAIL_PASS_RATE);
}

/**
 * Reduces a base price to the checkout totals. The wallet's Trail Pass is shown
 * as a real accounting line, then the public demo caps the final charge to a
 * deliberately tiny amount so testers do not accidentally spend a large sum.
 */
export function computeCheckout(baseStars: number, trailPassActive: boolean): Checkout {
  const subtotal = Math.max(0, Math.round(baseStars));
  const discount = trailPassDiscount(subtotal, trailPassActive);
  const discounted = Math.max(0, subtotal - discount);
  const total = Math.min(discounted, DEMO_MAX_CHARGE_STARS);
  const demoCap = discounted - total;
  return {
    subtotal,
    discount,
    demoCap,
    total,
    trailPassApplied: discount > 0,
  };
}

/** The summary rows for a booking, derived from the checkout. */
export function checkoutLineItems(experienceTitle: string, checkout: Checkout): LineItem[] {
  const items: LineItem[] = [
    { labelKey: "checkout.lineExperience", stars: checkout.subtotal, vars: { title: experienceTitle } },
  ];
  if (checkout.trailPassApplied) {
    items.push({ labelKey: "checkout.lineTrailPass", stars: -checkout.discount });
  }
  if (checkout.demoCap > 0) {
    items.push({ labelKey: "checkout.lineDemoCap", stars: -checkout.demoCap });
  }
  return items;
}
