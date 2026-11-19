import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const db = vi.hoisted(() => ({ statements: [] as { text: string; values: unknown[] }[], coupon: null as unknown }));
const icount = vi.hoisted(() => ({ items: [] as { name: string; price: number; quantity: number }[] }));

vi.mock('@/lib/db', () => ({
  sql: async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const text = strings.join('?');
    db.statements.push({ text, values });
    if (text.includes('INSERT INTO orders')) return [{ id: 'order-1', created_at: 'now' }];
    if (text.includes('FROM coupons')) return db.coupon ? [db.coupon] : [];
    return [];
  },
}));

vi.mock('@/lib/icount', () => ({
  createPaymentUrl: async (options: { items: typeof icount.items }) => {
    icount.items = options.items;
    return { saleUrl: 'https://pay.example.test', saleUniqid: 'sale-1' };
  },
}));

import { POST } from './route';

// The riddles book launch price runs 12.11 to the end of November 2026.
const DURING = Date.parse('2026-11-20T12:00:00+02:00');
const AFTER = Date.parse('2026-12-01T00:00:00+02:00');
// The days of the ended Shopping IL sale, now priced like any other day.
const SHOPPING_IL = Date.parse('2026-11-04T12:00:00+02:00');

const unit = (productId: string, quantity = 1) => ({ productId, name: 'ignored', price: 1, quantity });
const BOOKS = ['ai-book', 'encryption-book', 'algorithms-book'].map((id) => unit(id));
const WORKBOOKS = ['ai-workbook', 'encryption-workbook', 'algorithms-workbook'].map((id) => unit(id));

function checkout(items: unknown[], extra: Record<string, unknown> = {}) {
  const body = {
    firstName: 'a', lastName: 'b', email: 'a@example.test', phone: '050', city: 'c', address: 'd',
    shippingMethod: 'pickup-point', items, ...extra,
  };
  return POST(new Request('http://localhost/api/checkout', { method: 'POST', body: JSON.stringify(body) }) as NextRequest);
}

// The `total` value handed to the orders INSERT, by its place in the statement.
const orderTotal = () => db.statements.find((s) => s.text.includes('INSERT INTO orders'))?.values[9];
const itemPrices = () =>
  db.statements.filter((s) => s.text.includes('INSERT INTO order_items')).map((s) => s.values[4]);
const wroteOrder = () => db.statements.some((s) => s.text.includes('INSERT INTO orders'));

beforeEach(() => {
  db.statements = [];
  db.coupon = null;
  icount.items = [];
});

afterEach(() => vi.useRealTimers());

// Pickup ships free from ₪100 of products, so most carts below carry no shipping.
describe('POST /api/checkout during the riddles launch price', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['Date'], now: DURING }));

  it('holds the riddles book at ₪102 and stores it on the order', async () => {
    const res = await checkout([unit('riddles-book-1')]);
    expect(res.status).toBe(200);
    expect(orderTotal()).toBe(102);
    expect(itemPrices()).toEqual([102]);
  });

  it('charges the trilogy its list price', async () => {
    await checkout([unit('ai-book'), unit('ai-workbook')]);
    expect(orderTotal()).toBe(105);
    expect(itemPrices()).toEqual([75, 30]);
  });

  it('sends iCount lines that add up to the order total', async () => {
    await checkout([...BOOKS, ...WORKBOOKS, unit('riddles-book-1')]);
    const sum = icount.items.reduce((total, line) => total + line.price * line.quantity, 0);
    expect(orderTotal()).toBe(270 + 102);
    expect(sum).toBe(270 + 102);
  });

  it('ignores a price sent by the browser', async () => {
    await checkout([{ productId: 'riddles-book-1', quantity: 1, price: 1 }]);
    expect(itemPrices()).toEqual([102]);
  });

  it('rejects a coupon on the launch-priced book without writing an order', async () => {
    db.coupon = {
      id: '1', code: 'CLUB10', discount_type: 'percent', discount_value: 10,
      min_subtotal: null, max_uses: null, used_count: 0, active: true, expires_at: null,
    };
    const res = await checkout([unit('riddles-book-1')], { couponCode: 'CLUB10' });
    const body = await res.json();
    expect(res.status).toBe(409);
    expect(body.couponRejected).toBe(true);
    expect(body.total).toBe(102);
    expect(wroteOrder()).toBe(false);
  });
});

describe('POST /api/checkout on the days of the ended Shopping IL sale', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['Date'], now: SHOPPING_IL }));

  it('charges list price', async () => {
    await checkout([unit('ai-book'), unit('ai-workbook')]);
    expect(orderTotal()).toBe(105);
    expect(itemPrices()).toEqual([75, 30]);
  });

  it('takes a coupon', async () => {
    db.coupon = {
      id: '1', code: 'CLUB10', discount_type: 'percent', discount_value: 10,
      min_subtotal: null, max_uses: null, used_count: 0, active: true, expires_at: null,
    };
    const res = await checkout([unit('ai-book')], { couponCode: 'CLUB10' });
    expect(res.status).toBe(200);
    expect(orderTotal()).toBe(75 - 8 + 20);
  });
});

describe('POST /api/checkout after the launch price', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['Date'], now: AFTER }));

  it('charges the riddles book its list price again', async () => {
    await checkout([unit('riddles-book-1')]);
    expect(orderTotal()).toBe(120);
    expect(itemPrices()).toEqual([120]);
  });

  it('charges the regular bundle price', async () => {
    await checkout([...BOOKS, ...WORKBOOKS]);
    expect(orderTotal()).toBe(270);
  });

  // A tab left open past midnight still shows ₪102. Charging ₪120 without a
  // word is the one thing this must never do.
  it('stops before charging when the customer saw a different total', async () => {
    const res = await checkout([unit('riddles-book-1')], { expectedTotal: 102 });
    const body = await res.json();
    expect(res.status).toBe(409);
    expect(body).toEqual({ priceChanged: true, total: 120 });
    expect(wroteOrder()).toBe(false);
  });

  it('goes ahead once the customer has confirmed the new total', async () => {
    const res = await checkout([unit('riddles-book-1')], { expectedTotal: 120 });
    expect(res.status).toBe(200);
    expect(orderTotal()).toBe(120);
  });
});

describe('POST /api/checkout free shipping', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['Date'], now: AFTER }));

  const DELIVERY = { shippingMethod: 'delivery', address: undefined, street: 'Herzl', houseNumber: '1' };
  // The shipping_cost value handed to the orders INSERT, by its place in the statement.
  const orderShippingCost = () => db.statements.find((s) => s.text.includes('INSERT INTO orders'))?.values[11];
  const icountSum = () => icount.items.reduce((total, line) => total + line.price * line.quantity, 0);

  it('charges for a pickup point below ₪100', async () => {
    await checkout([unit('ai-book')]);
    expect(orderTotal()).toBe(75 + 20);
    expect(orderShippingCost()).toBe(20);
  });

  it('ships to a pickup point free from ₪100 and records the free shipping', async () => {
    await checkout([unit('ai-book'), unit('ai-workbook')]);
    expect(orderTotal()).toBe(105);
    expect(orderShippingCost()).toBe(0);
    expect(icount.items.map((line) => line.name)).not.toContain(expect.stringContaining('נקודת איסוף'));
    expect(icountSum()).toBe(105);
  });

  it('charges for home delivery below ₪300', async () => {
    await checkout([unit('ai-book'), unit('ai-workbook')], DELIVERY);
    expect(orderTotal()).toBe(105 + 40);
    expect(icountSum()).toBe(105 + 40);
  });

  it('delivers home free from ₪300', async () => {
    await checkout([unit('ai-book', 4)], DELIVERY);
    expect(orderTotal()).toBe(300);
    expect(icountSum()).toBe(300);
  });

  // The threshold is the products total before the coupon, so applying a
  // coupon can never make the order cost more than it did without one.
  it('keeps free shipping when a coupon takes the products under ₪100', async () => {
    db.coupon = {
      id: '1', code: 'CLUB10', discount_type: 'percent', discount_value: 10,
      min_subtotal: null, max_uses: null, used_count: 0, active: true, expires_at: null,
    };
    const res = await checkout([unit('ai-book'), unit('ai-workbook')], { couponCode: 'CLUB10' });
    expect(res.status).toBe(200);
    expect(orderTotal()).toBe(105 - 11);
    expect(icountSum()).toBe(105 - 11);
  });

  it('stops before charging when the page still showed paid shipping', async () => {
    const res = await checkout([unit('ai-book'), unit('ai-workbook')], { expectedTotal: 125 });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ priceChanged: true, total: 105 });
    expect(wroteOrder()).toBe(false);
  });
});
