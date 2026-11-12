import { describe, it, expect } from 'vitest';
import { isSaleActive, priceOf, salePriceOf } from './sale';
import { bundles, products, riddlesBook, getProductById } from './products';

const DURING = Date.parse('2026-11-04T12:00:00+02:00');
const AFTER = Date.parse('2026-11-06T09:00:00+02:00');

describe('isSaleActive', () => {
  it('is off one second before midnight on 4.11 Israel time', () =>
    expect(isSaleActive(Date.parse('2026-11-03T23:59:59+02:00'))).toBe(false));

  it('starts at midnight on 4.11 Israel time', () =>
    expect(isSaleActive(Date.parse('2026-11-04T00:00:00+02:00'))).toBe(true));

  it('is still on one second before the end of 5.11 Israel time', () =>
    expect(isSaleActive(Date.parse('2026-11-05T23:59:59+02:00'))).toBe(true));

  it('ends at midnight after 5.11 Israel time', () =>
    expect(isSaleActive(Date.parse('2026-11-06T00:00:00+02:00'))).toBe(false));
});

describe('salePriceOf', () => {
  it.each([
    [75, 63],
    [30, 25],
    [210, 178],
    [270, 229],
    [320, 272],
  ])('rounds 15%% off %i down to %i', (list, sale) => expect(salePriceOf(list)).toBe(sale));

  // The site promises 15%, so rounding may only ever favour the customer.
  it('never gives less than 15% off anything in the catalog', () => {
    const prices = [...products.map((p) => p.price), ...bundles.map((b) => b.price)];
    for (const price of prices) {
      expect(salePriceOf(price)).toBeLessThanOrEqual(price * 0.85);
    }
  });

  it('always lands on a whole shekel', () => {
    for (const { price } of products) expect(Number.isInteger(salePriceOf(price))).toBe(true);
  });
});

describe('priceOf', () => {
  const book = getProductById('ai-book')!;

  it('charges the sale price during the sale', () => expect(priceOf(book, DURING)).toBe(63));

  it('charges the list price before and after the sale', () => {
    expect(priceOf(book, Date.parse('2026-11-01T12:00:00+02:00'))).toBe(75);
    expect(priceOf(book, AFTER)).toBe(75);
  });

  // 15% off the ₪120 list price lands exactly on ₪102, its price until now.
  it('sells the riddles book at ₪102 during the sale', () =>
    expect(priceOf(riddlesBook, DURING)).toBe(102));

  it('returns the riddles book to ₪120 at midnight when the sale ends', () => {
    expect(priceOf(riddlesBook, Date.parse('2026-11-05T23:59:59+02:00'))).toBe(102);
    expect(priceOf(riddlesBook, Date.parse('2026-11-06T00:00:00+02:00'))).toBe(120);
  });
});
