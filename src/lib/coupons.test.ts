import { describe, it, expect } from 'vitest';
import {
  normalizeCode,
  parseCouponRow,
  computeCouponDiscount,
  validateCoupon,
  validateCouponForCart,
  parseCouponCartItems,
  type Coupon,
  type CouponCartLine,
} from './coupons';
import { getProductById } from './products';

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

// Cart lines as both routes build them: price and exclusion from the catalog.
const line = (productId: string, quantity = 1): CouponCartLine => {
  const product = getProductById(productId)!;
  return { productId, price: product.price, quantity, excludeFromCoupons: product.excludeFromCoupons };
};
const TRILOGY = ['ai-book', 'encryption-book', 'algorithms-book'];
const WORKBOOKS = ['ai-workbook', 'encryption-workbook', 'algorithms-workbook'];
const EXCLUDED_MESSAGE = 'הקופון אינו חל על ספרים שכבר נמכרים במחיר מבצע';

describe('validateCouponForCart', () => {
  it('a percent coupon discounts only the coupon-eligible products', () => {
    // ai-book 75 + riddles 102: 10% of 75 = 7.5 -> 8, the riddles book is untouched.
    const r = validateCouponForCart(base, [line('ai-book'), line('riddles-book-1')], now);
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(8);
  });

  it('a fixed coupon is capped by the eligible basis, not the whole cart', () => {
    // ai-workbook 30 + riddles 102: a 50 coupon can take at most the 30.
    const fixed: Coupon = { ...base, discount_type: 'fixed', discount_value: 50 };
    const r = validateCouponForCart(fixed, [line('ai-workbook'), line('riddles-book-1')], now);
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(30);
  });

  it('measures min_subtotal against the eligible basis only, and says so', () => {
    // 75 eligible + 102 excluded = 177 cart, but only 75 counts toward a 150 minimum.
    const r = validateCouponForCart({ ...base, min_subtotal: 150 }, [line('ai-book'), line('riddles-book-1')], now);
    expect(r.valid).toBe(false);
    expect(r.message).toBe('הקופון תקף בהזמנה מעל ₪150, לא כולל ספרים במחיר מבצע');
  });

  it('keeps the plain min_subtotal message when nothing is excluded', () =>
    expect(validateCouponForCart({ ...base, min_subtotal: 150 }, [line('ai-book')], now).message)
      .toBe('הקופון תקף בהזמנה מעל ₪150'));

  it('rejects a cart holding only excluded products with the sale-price message', () => {
    const r = validateCouponForCart(base, [line('riddles-book-1', 2)], now);
    expect(r).toEqual({ valid: false, discount: 0, code: null, message: EXCLUDED_MESSAGE });
  });

  it('still reports an unknown code as unknown on an excluded-only cart', () =>
    expect(validateCouponForCart(null, [line('riddles-book-1')], now).message).toBe('קוד קופון לא תקין'));

  it('applies the bundle discount before the coupon in a mixed cart', () => {
    // Researchers bundle: 225 + 90 - 45 = 270 eligible; 10% = 27. Riddles 102 excluded.
    const cart = [...TRILOGY, ...WORKBOOKS].map((id) => line(id)).concat(line('riddles-book-1'));
    const r = validateCouponForCart(base, cart, now);
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(27);
  });

  it('CLUB10 on the trilogy book bundle plus the riddles book discounts the bundle only', () => {
    // Books bundle: 225 - 15 = 210; 10% = 21 (not 10% of 312 = 31).
    const club10: Coupon = { ...base, code: 'CLUB10' };
    const cart = TRILOGY.map((id) => line(id)).concat(line('riddles-book-1'));
    const r = validateCouponForCart(club10, cart, now);
    expect(r).toEqual({ valid: true, discount: 21, code: 'CLUB10', message: 'הקופון הוחל' });
  });

  it('matches validateCoupon on a cart with no excluded products', () => {
    // 2 of everything: 630, packed as expert + books bundle = 100 off.
    const cart = [...TRILOGY, ...WORKBOOKS].map((id) => line(id, 2));
    expect(validateCouponForCart(base, cart, now)).toEqual(validateCoupon(base, 630, 100, now));
  });
});

describe('parseCouponCartItems', () => {
  it('resolves price and exclusion from the catalog, ignoring client prices', () =>
    expect(parseCouponCartItems([{ productId: 'riddles-book-1', quantity: 2, price: 1 }], getProductById))
      .toEqual([{ productId: 'riddles-book-1', price: 102, quantity: 2, excludeFromCoupons: true }]));
  it('drops an unknown (delisted) product, like the cart snapshot does', () =>
    expect(parseCouponCartItems([{ productId: 'nope', quantity: 1 }], getProductById)).toEqual([]));
  it('merges duplicate lines and caps the quantity like the cart snapshot does', () =>
    expect(parseCouponCartItems(
      [{ productId: 'ai-book', quantity: 60 }, { productId: 'ai-book', quantity: 60 }],
      getProductById
    )).toEqual([{ productId: 'ai-book', price: 75, quantity: 99, excludeFromCoupons: undefined }]));
  it.each([0, -1, 1.5, 'x', null])('rejects quantity %s', (quantity) =>
    expect(parseCouponCartItems([{ productId: 'ai-book', quantity }], getProductById)).toBeNull());
  it('rejects a payload that is not an array', () =>
    expect(parseCouponCartItems({ productId: 'ai-book' }, getProductById)).toBeNull());
  it('rejects a non-object entry', () =>
    expect(parseCouponCartItems(['ai-book'], getProductById)).toBeNull());
});
