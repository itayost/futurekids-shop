import { describe, it, expect } from 'vitest';
import { normalizeCode, parseCouponRow, computeCouponDiscount, validateCoupon, type Coupon } from './coupons';

const base: Coupon = {
  id: '1', code: 'SAVE10', discount_type: 'percent', discount_value: 10,
  min_subtotal: null, max_uses: null, used_count: 0, active: true, expires_at: null,
};
const now = new Date('2026-07-15T00:00:00Z');

describe('normalizeCode', () => {
  it('trims and uppercases', () => expect(normalizeCode('  save10 ')).toBe('SAVE10'));
});

describe('parseCouponRow', () => {
  it('coerces string numerics from the DB to numbers', () => {
    const row = {
      id: 'abc', code: 'SAVE10', discount_type: 'percent', discount_value: '10',
      min_subtotal: '150', max_uses: 100, used_count: 3, active: true, expires_at: null,
    };
    const c = parseCouponRow(row);
    expect(c.discount_value).toBe(10);
    expect(c.min_subtotal).toBe(150);
    expect(c.used_count).toBe(3);
  });
});

describe('computeCouponDiscount', () => {
  it('percent rounds to whole shekels', () =>
    expect(computeCouponDiscount({ discount_type: 'percent', discount_value: 10 }, 315, 0)).toBe(32));
  it('fixed is flat', () =>
    expect(computeCouponDiscount({ discount_type: 'fixed', discount_value: 20 }, 315, 0)).toBe(20));
  it('clamps so product total never goes negative', () =>
    expect(computeCouponDiscount({ discount_type: 'fixed', discount_value: 500 }, 315, 45)).toBe(270));
  it('percent applies to the price after the bundle discount, not the subtotal', () =>
    // 630 - 85 = 545, 10% = 54.5 -> 55 (not 63, which would be 10% of the subtotal)
    expect(computeCouponDiscount({ discount_type: 'percent', discount_value: 10 }, 630, 85)).toBe(55));
  it('percent is zero once the bundle discount covers the whole subtotal', () =>
    expect(computeCouponDiscount({ discount_type: 'percent', discount_value: 10 }, 315, 315)).toBe(0));
  it('rounds a tiny percent up to a shekel rather than down to nothing', () =>
    // 1% of 30 is 0.3. Rounding that to 0 would make validateCoupon report a
    // perfectly good coupon as inapplicable.
    expect(computeCouponDiscount({ discount_type: 'percent', discount_value: 1 }, 30, 0)).toBe(1));
  it('does not invent a discount for a 0% coupon', () =>
    expect(computeCouponDiscount({ discount_type: 'percent', discount_value: 0 }, 315, 0)).toBe(0));
});

describe('validateCoupon', () => {
  it('rejects unknown code', () =>
    expect(validateCoupon(null, 100, 0, now).valid).toBe(false));
  it('rejects inactive', () =>
    expect(validateCoupon({ ...base, active: false }, 315, 0, now).valid).toBe(false));
  it('rejects expired', () =>
    expect(validateCoupon({ ...base, expires_at: '2026-07-14T00:00:00Z' }, 315, 0, now).valid).toBe(false));
  it('rejects when used up', () =>
    expect(validateCoupon({ ...base, max_uses: 5, used_count: 5 }, 315, 0, now).valid).toBe(false));
  it('rejects below minimum', () =>
    expect(validateCoupon({ ...base, min_subtotal: 400 }, 315, 0, now).valid).toBe(false));
  // The minimum has to mean the same thing the discount applies to, otherwise a
  // coupon advertised as "over 300" is granted on a cart the customer pays 230 for.
  it('measures min_subtotal against the price after the bundle discount', () => {
    const r = validateCoupon({ ...base, min_subtotal: 300 }, 315, 85, now);
    expect(r.valid).toBe(false);
    expect(r.message).toBe('הקופון תקף בהזמנה מעל ₪300');
  });
  it('accepts when the post-bundle price clears the minimum', () =>
    expect(validateCoupon({ ...base, min_subtotal: 200 }, 315, 85, now).valid).toBe(true));
  it('reports a valid coupon as applicable even when the discount rounds to a shekel', () => {
    const r = validateCoupon({ ...base, discount_value: 1 }, 30, 0, now);
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(1);
  });
  it('accepts a valid coupon and returns discount', () => {
    const r = validateCoupon(base, 315, 0, now);
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(32);
    expect(r.code).toBe('SAVE10');
  });
  it('discounts the post-bundle price when a bundle is in the cart', () => {
    const r = validateCoupon(base, 630, 85, now);
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(55);
  });
});
