import { describe, it, expect } from 'vitest';
import { priceCart, repriceForReminder } from './cart-pricing';

// The riddles book launch price runs 12.11 to the end of November 2026.
const DURING = Date.parse('2026-11-20T12:00:00+02:00');
const AFTER = Date.parse('2026-12-01T09:00:00+02:00');
// The days of the ended Shopping IL sale, now priced like any other day.
const SHOPPING_IL = Date.parse('2026-11-04T12:00:00+02:00');

const line = (productId: string, quantity = 1, price = 0) => ({ productId, quantity, price });
const BOOKS = ['ai-book', 'encryption-book', 'algorithms-book'];
const WORKBOOKS = ['ai-workbook', 'encryption-workbook', 'algorithms-workbook'];
const set = (workbookQty: number) => [
  ...BOOKS.map((id) => line(id)),
  ...(workbookQty > 0 ? WORKBOOKS.map((id) => line(id, workbookQty)) : []),
];

describe('priceCart during the riddles launch price', () => {
  it('prices the riddles book at ₪102, 15% off its ₪120 list price', () => {
    const cart = priceCart([line('riddles-book-1')], DURING);
    expect(cart.total).toBe(102);
    expect(cart.saleSavings).toBe(18);
    expect(cart.lines[0].regularPrice).toBe(120);
  });

  it('leaves the trilogy at list price with no savings', () => {
    const cart = priceCart([line('ai-book'), line('ai-workbook')], DURING);
    expect(cart.lines.map((l) => l.price)).toEqual([75, 30]);
    expect(cart.total).toBe(105);
    expect(cart.saleSavings).toBe(0);
  });

  it('adds the riddles book to a discounted bundle without touching the bundle', () => {
    const cart = priceCart([...set(1), line('riddles-book-1')], DURING);
    expect(cart.total).toBe(270 + 102);
    expect(cart.saleSavings).toBe(18);
  });
});

describe('priceCart outside any promo', () => {
  it('charges list price with no savings', () => {
    const cart = priceCart([line('ai-book'), line('ai-workbook')], AFTER);
    expect(cart.total).toBe(105);
    expect(cart.saleSavings).toBe(0);
  });

  // The bundle tiers keep their regular discount on every day.
  it.each([
    ['books', 0, 210],
    ['researchers', 1, 270],
    ['experts', 2, 320],
  ])('charges the %s bundle its regular price', (_name, workbookQty, total) => {
    expect(priceCart(set(workbookQty), AFTER).total).toBe(total);
    expect(priceCart(set(workbookQty), SHOPPING_IL).total).toBe(total);
  });

  it('no longer discounts anything on the days of the ended Shopping IL sale', () => {
    const cart = priceCart([line('ai-book'), line('ai-workbook')], SHOPPING_IL);
    expect(cart.total).toBe(105);
    expect(cart.saleSavings).toBe(0);
  });

  it('charges the riddles book its ₪120 list price once the launch price ends', () => {
    const cart = priceCart([line('riddles-book-1')], AFTER);
    expect(cart.total).toBe(120);
    expect(cart.saleSavings).toBe(0);
  });

  // The bug this module exists for: a cart filled during the launch price sits
  // in localStorage with ₪102 on it, then shows ₪102 while iCount charges ₪120.
  it('ignores a stale price stored in the cart', () => {
    const cart = priceCart([line('riddles-book-1', 1, 102)], AFTER);
    expect(cart.lines[0].price).toBe(120);
    expect(cart.total).toBe(120);
  });

  it('keeps the stored price of a product no longer in the catalog', () => {
    const cart = priceCart([line('delisted', 2, 40)], AFTER);
    expect(cart.total).toBe(80);
  });

  it('keeps extra fields on each line', () => {
    const cart = priceCart([{ ...line('ai-book'), name: 'שם' }], AFTER);
    expect(cart.lines[0].name).toBe('שם');
  });
});

describe('repriceForReminder', () => {
  const item = (productId: string, price: number, quantity = 1) => ({ productId, name: productId, quantity, price });
  const pickup = { method: 'pickup-point', cost: 20 };

  // Abandoned on 30.11, reminded on 1.12: must not quote the ended launch price.
  // Both totals clear the ₪100 free pickup threshold.
  it('re-quotes a launch-priced order at list price after the launch price', () => {
    const result = repriceForReminder([item('riddles-book-1', 102)], 102, pickup, AFTER);
    expect(result.items[0].price).toBe(120);
    expect(result.total).toBe(120);
  });

  it('re-quotes a list-priced order at the launch price while it runs', () => {
    const result = repriceForReminder([item('riddles-book-1', 120)], 120, pickup, DURING);
    expect(result.items[0].price).toBe(102);
    expect(result.total).toBe(102);
  });

  // An order placed during the Shopping IL sale stored ₪63; today it costs ₪75,
  // still under the free pickup threshold.
  it('re-quotes an order priced during the ended Shopping IL sale', () => {
    const result = repriceForReminder([item('ai-book', 63)], 83, pickup, AFTER);
    expect(result.items[0].price).toBe(75);
    expect(result.total).toBe(95);
  });

  // A coupon order's total already reflects its discount; leave it alone when
  // nothing about the prices has moved.
  it('leaves the order total untouched when prices have not changed', () => {
    const result = repriceForReminder([item('ai-book', 75)], 87, pickup, AFTER);
    expect(result.total).toBe(87);
  });

  it('keeps an item that is no longer in the catalog at its stored price', () => {
    const result = repriceForReminder([item('delisted', 40)], 60, pickup, AFTER);
    expect(result.items[0].price).toBe(40);
    expect(result.total).toBe(60);
  });

  // ₪88 paid ₪20 to a pickup point during the sale; at list price the same
  // cart is ₪105, which ships free.
  it('re-checks free shipping at the new prices', () => {
    const result = repriceForReminder([item('ai-book', 63), item('ai-workbook', 25)], 108, pickup, AFTER);
    expect(result.total).toBe(105);
  });

  it('keeps the stored shipping cost for an order with no known method', () => {
    const result = repriceForReminder([item('ai-book', 63), item('ai-workbook', 25)], 108, { method: null, cost: 20 }, AFTER);
    expect(result.total).toBe(125);
  });
});
