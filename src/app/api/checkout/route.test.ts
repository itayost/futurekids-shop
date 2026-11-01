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

const DURING = Date.parse('2026-11-04T12:00:00+02:00');
const AFTER = Date.parse('2026-11-06T00:00:00+02:00');

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

describe('POST /api/checkout during the sale', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['Date'], now: DURING }));

  it('charges the sale price and stores it on the order', async () => {
    const res = await checkout([unit('ai-book'), unit('ai-workbook')]);
    expect(res.status).toBe(200);
    expect(orderTotal()).toBe(88 + 20);
    expect(itemPrices()).toEqual([63, 25]);
  });

  it('sends iCount lines that add up to the order total', async () => {
    await checkout([...BOOKS, ...WORKBOOKS]);
    const sum = icount.items.reduce((total, line) => total + line.price * line.quantity, 0);
    expect(orderTotal()).toBe(229 + 20);
    expect(sum).toBe(229 + 20);
  });

  it('holds the riddles book at ₪102', async () => {
    await checkout([unit('riddles-book-1')]);
    expect(orderTotal()).toBe(102 + 20);
  });

  it('ignores a price sent by the browser', async () => {
    await checkout([{ productId: 'ai-book', quantity: 1, price: 1 }]);
    expect(itemPrices()).toEqual([63]);
  });

  it('rejects a coupon without writing an order', async () => {
    db.coupon = {
      id: '1', code: 'CLUB10', discount_type: 'percent', discount_value: 10,
      min_subtotal: null, max_uses: null, used_count: 0, active: true, expires_at: null,
    };
    const res = await checkout([unit('ai-book')], { couponCode: 'CLUB10' });
    const body = await res.json();
    expect(res.status).toBe(409);
    expect(body.couponRejected).toBe(true);
    expect(body.total).toBe(63 + 20);
    expect(wroteOrder()).toBe(false);
  });
});

describe('POST /api/checkout after the sale', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['Date'], now: AFTER }));

  it('charges list price again', async () => {
    await checkout([unit('ai-book'), unit('ai-workbook')]);
    expect(orderTotal()).toBe(105 + 20);
    expect(itemPrices()).toEqual([75, 30]);
  });

  it('charges the regular bundle price again', async () => {
    await checkout([...BOOKS, ...WORKBOOKS]);
    expect(orderTotal()).toBe(270 + 20);
  });

  // A tab left open past midnight still shows ₪83. Charging ₪95 without a word
  // is the one thing this must never do.
  it('stops before charging when the customer saw a different total', async () => {
    const res = await checkout([unit('ai-book')], { expectedTotal: 83 });
    const body = await res.json();
    expect(res.status).toBe(409);
    expect(body).toEqual({ priceChanged: true, total: 95 });
    expect(wroteOrder()).toBe(false);
  });

  it('goes ahead once the customer has confirmed the new total', async () => {
    const res = await checkout([unit('ai-book')], { expectedTotal: 95 });
    expect(res.status).toBe(200);
    expect(orderTotal()).toBe(95);
  });
});
