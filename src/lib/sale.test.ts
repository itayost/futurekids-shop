import { describe, it, expect } from 'vitest';
import { isSaleActive, priceOf, salePriceOf, SALE } from './sale';
import { bundles, products, riddlesBook, getProductById } from './products';

const DURING = Date.parse('2026-11-27T12:00:00+02:00');
const AFTER = Date.parse('2026-11-29T09:00:00+02:00');

describe('isSaleActive', () => {
  it('is off one second before midnight on 26.11 Israel time', () =>
    expect(isSaleActive(Date.parse('2026-11-25T23:59:59+02:00'))).toBe(false));

  it('starts at midnight on Thursday 26.11 Israel time', () =>
    expect(isSaleActive(Date.parse('2026-11-26T00:00:00+02:00'))).toBe(true));

  it('is still on one second before the end of Saturday 28.11 Israel time', () =>
    expect(isSaleActive(Date.parse('2026-11-28T23:59:59+02:00'))).toBe(true));

  it('ends at midnight after Saturday 28.11 Israel time', () =>
    expect(isSaleActive(Date.parse('2026-11-29T00:00:00+02:00'))).toBe(false));
});

describe('SALE', () => {
  it('is 15% off', () => expect(SALE.percent).toBe(15));
  it('is called Black Friday', () => expect(SALE.name).toBe('בלאק פריידי'));
  it('names the days it runs', () => expect(SALE.dates).toBe('26-28 בנובמבר'));
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
    expect(priceOf(book, Date.parse('2026-11-25T12:00:00+02:00'))).toBe(75);
    expect(priceOf(book, AFTER)).toBe(75);
  });

  // The riddles book is already 15% off at its launch price, which runs past
  // the sale. The two never stack: it stays at ₪102 throughout.
  it('holds the riddles book at its ₪102 launch price during the sale', () =>
    expect(priceOf(riddlesBook, DURING)).toBe(102));

  it('keeps the riddles book at ₪102 after the sale until its launch price ends on 1.12', () => {
    expect(priceOf(riddlesBook, AFTER)).toBe(102);
    expect(priceOf(riddlesBook, Date.parse('2026-11-30T23:59:59+02:00'))).toBe(102);
    expect(priceOf(riddlesBook, Date.parse('2026-12-01T00:00:00+02:00'))).toBe(120);
  });
});
