import { describe, it, expect } from 'vitest';
import { priceCart, repriceForReminder } from './cart-pricing';

const DURING = Date.parse('2026-11-04T12:00:00+02:00');
const AFTER = Date.parse('2026-11-06T09:00:00+02:00');

const line = (productId: string, quantity = 1, price = 0) => ({ productId, quantity, price });
const BOOKS = ['ai-book', 'encryption-book', 'algorithms-book'];
const WORKBOOKS = ['ai-workbook', 'encryption-workbook', 'algorithms-workbook'];
const set = (workbookQty: number) => [
  ...BOOKS.map((id) => line(id)),
  ...(workbookQty > 0 ? WORKBOOKS.map((id) => line(id, workbookQty)) : []),
];

describe('priceCart during the sale', () => {
  it('prices a book and its workbook at 63 + 25', () => {
    const cart = priceCart([line('ai-book'), line('ai-workbook')], DURING);
    expect(cart.lines.map((l) => l.price)).toEqual([63, 25]);
    expect(cart.total).toBe(88);
    expect(cart.saleSavings).toBe(17);
  });

  it('exposes the list price so the UI can strike it through', () => {
    const cart = priceCart([line('ai-book')], DURING);
    expect(cart.lines[0].regularPrice).toBe(75);
  });

  // The advertised sale price of each bundle must be what the cart really charges.
  it.each([
    ['books', 0, 178, 32],
    ['researchers', 1, 229, 41],
    ['experts', 2, 272, 48],
  ])('charges the %s bundle its advertised price', (_name, workbookQty, total, savings) => {
    const cart = priceCart(set(workbookQty), DURING);
    expect(cart.total).toBe(total);
    expect(cart.saleSavings).toBe(savings);
  });

  it('keeps the riddles book at ₪102 with no sale savings', () => {
    const cart = priceCart([line('riddles-book-1')], DURING);
    expect(cart.total).toBe(102);
    expect(cart.saleSavings).toBe(0);
    expect(cart.lines[0].regularPrice).toBe(102);
  });

  it('adds the riddles book to a discounted bundle without touching either', () => {
    const cart = priceCart([...set(1), line('riddles-book-1')], DURING);
    expect(cart.total).toBe(229 + 102);
    expect(cart.saleSavings).toBe(41);
  });
});

describe('priceCart outside the sale', () => {
  it('charges list price with no savings', () => {
    const cart = priceCart([line('ai-book'), line('ai-workbook')], AFTER);
    expect(cart.total).toBe(105);
    expect(cart.saleSavings).toBe(0);
  });

  it('charges the regular bundle price', () => expect(priceCart(set(1), AFTER).total).toBe(270));

  // The bug this module exists for: a cart filled during the sale sits in
  // localStorage with ₪63 on it, then shows ₪63 while iCount charges ₪75.
  it('ignores a stale price stored in the cart', () => {
    const cart = priceCart([line('ai-book', 1, 63)], AFTER);
    expect(cart.lines[0].price).toBe(75);
    expect(cart.total).toBe(75);
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

  // Abandoned on 5.11, reminded on 6.11: must not quote the ended sale price.
  it('re-quotes a sale-priced order at list price after the sale', () => {
    const result = repriceForReminder([item('ai-book', 63)], 83, 20, AFTER);
    expect(result.items[0].price).toBe(75);
    expect(result.total).toBe(95);
  });

  it('re-quotes a list-priced order at the sale price during the sale', () => {
    const result = repriceForReminder([item('ai-book', 75)], 95, 20, DURING);
    expect(result.items[0].price).toBe(63);
    expect(result.total).toBe(83);
  });

  // A coupon order's total already reflects its discount; leave it alone when
  // nothing about the prices has moved.
  it('leaves the order total untouched when prices have not changed', () => {
    const result = repriceForReminder([item('ai-book', 75)], 87, 20, AFTER);
    expect(result.total).toBe(87);
  });

  it('keeps an item that is no longer in the catalog at its stored price', () => {
    const result = repriceForReminder([item('delisted', 40)], 60, 20, AFTER);
    expect(result.items[0].price).toBe(40);
    expect(result.total).toBe(60);
  });
});
