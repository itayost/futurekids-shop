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
  it('accepts a valid coupon and returns discount', () => {
    const r = validateCoupon(base, 315, 0, now);
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(32);
    expect(r.code).toBe('SAVE10');
  });
});
