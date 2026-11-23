import { describe, it, expect } from 'vitest';
import { activePromo, discountedPrice, isCouponExcluded, type ProductPromo } from './promo';
import { priceOf } from './sale';
import { priceCart } from './cart-pricing';
import { validateCouponForCart, parseCouponCartItems, type Coupon } from './coupons';
import { getProductById, riddlesBook } from './products';

const PROMO: ProductPromo = {
  percent: 15,
  startsAt: Date.parse('2026-11-12T00:00:00+02:00'),
  endsAt: Date.parse('2026-12-01T00:00:00+02:00'),
  label: 'מחיר השקה עד סוף החודש',
  excludeFromCoupons: true,
};
const withPromo = { price: 120, promo: PROMO };

const BEFORE = Date.parse('2026-11-11T23:59:59+02:00');
const DURING = Date.parse('2026-11-20T12:00:00+02:00');
const LAST_SECOND = Date.parse('2026-11-30T23:59:59+02:00');
const AFTER = Date.parse('2026-12-01T00:00:00+02:00');

describe('discountedPrice', () => {
  it('takes 15% off ₪120 to land on ₪102', () => expect(discountedPrice(120, 15)).toBe(102));
  it('rounds down to a whole shekel, in the customer\'s favour', () => expect(discountedPrice(75, 15)).toBe(63));
});

describe('activePromo', () => {
  it('is off before the start', () => expect(activePromo(withPromo, BEFORE)).toBeNull());
  it('is on from the start', () => expect(activePromo(withPromo, PROMO.startsAt)).toBe(PROMO));
  it('is still on the last second of the month', () => expect(activePromo(withPromo, LAST_SECOND)).toBe(PROMO));
  it('ends at midnight into 1.12 Israel time', () => expect(activePromo(withPromo, AFTER)).toBeNull());
  it('is off for a product with no promo', () => expect(activePromo({}, DURING)).toBeNull());
});

describe('priceOf with a product promo', () => {
  it('charges the promo price inside the window', () => expect(priceOf(withPromo, DURING)).toBe(102));
  it('charges the list price outside it', () => {
    expect(priceOf(withPromo, BEFORE)).toBe(120);
    expect(priceOf(withPromo, AFTER)).toBe(120);
  });
});

describe('isCouponExcluded', () => {
  it('excludes a promo product from coupons while the promo runs', () =>
    expect(isCouponExcluded(withPromo, DURING)).toBe(true));
  it('takes coupons again once the promo ends', () => expect(isCouponExcluded(withPromo, AFTER)).toBe(false));
  it('honours a permanent exclusion with no promo', () =>
    expect(isCouponExcluded({ excludeFromCoupons: true }, AFTER)).toBe(true));
  it('lets a promo leave coupons on', () =>
    expect(isCouponExcluded({ promo: { ...PROMO, excludeFromCoupons: false } }, DURING)).toBe(false));
});

// The client's request of 12.11.2026: ₪102 instead of ₪120 until the end of
// November, and no coupons on top.
describe('the riddles book launch price', () => {
  const club: Coupon = {
    id: '1', code: 'CLUB10', discount_type: 'percent', discount_value: 10, min_subtotal: null,
    max_uses: null, used_count: 0, expires_at: null, active: true,
  };

  it('sells at ₪102 with ₪120 struck through until the end of November', () => {
    const cart = priceCart([{ productId: riddlesBook.id, quantity: 1, price: 0 }], DURING);
    expect(cart.lines[0].price).toBe(102);
    expect(cart.lines[0].regularPrice).toBe(120);
  });

  it('is back to ₪120 at midnight into 1.12', () =>
    expect(priceCart([{ productId: riddlesBook.id, quantity: 1, price: 0 }], AFTER).lines[0].price).toBe(120));

  it('takes no coupon during the launch price', () => {
    const lines = parseCouponCartItems([{ productId: riddlesBook.id, quantity: 1 }], getProductById, DURING)!;
    expect(validateCouponForCart(club, lines, new Date(DURING)).valid).toBe(false);
  });

  it('still lets a coupon discount the rest of the cart', () => {
    const lines = parseCouponCartItems(
      [{ productId: riddlesBook.id, quantity: 1 }, { productId: 'ai-book', quantity: 1 }],
      getProductById,
      DURING
    )!;
    // 10% of the ₪75 book only.
    expect(validateCouponForCart(club, lines, new Date(DURING))).toMatchObject({ valid: true, discount: 8 });
  });

  it('takes coupons again from 1.12', () => {
    const lines = parseCouponCartItems([{ productId: riddlesBook.id, quantity: 1 }], getProductById, AFTER)!;
    expect(validateCouponForCart(club, lines, new Date(AFTER)).valid).toBe(true);
  });
});
