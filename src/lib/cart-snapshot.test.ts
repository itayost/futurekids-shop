import { describe, expect, test } from 'vitest';
import { normalizeCartItems, parseMemberCartRow, recomputeSnapshotTotal } from './cart-snapshot';

const CATALOG: Record<string, { id: string; name: string; price: number }> = {
  'ai-book': { id: 'ai-book', name: 'בינה מלאכותית לילדים', price: 75 },
  'encryption-book': { id: 'encryption-book', name: 'סודות ההצפנה לילדים', price: 75 },
  'algorithms-book': { id: 'algorithms-book', name: 'אלגוריתמים לילדים', price: 75 },
  'ai-workbook': { id: 'ai-workbook', name: 'חוברת בינה מלאכותית', price: 30 },
};
const lookup = (id: string) => CATALOG[id];

describe('normalizeCartItems', () => {
  test('rejects malformed payloads', () => {
    expect(normalizeCartItems('nope', lookup)).toBeNull();
    expect(normalizeCartItems([{ productId: 'ai-book' }], lookup)).toBeNull();
    expect(normalizeCartItems([{ productId: 'ai-book', quantity: 0 }], lookup)).toBeNull();
    expect(normalizeCartItems([{ productId: 'ai-book', quantity: 1.5 }], lookup)).toBeNull();
    expect(normalizeCartItems([{ productId: 7, quantity: 1 }], lookup)).toBeNull();
    expect(
      normalizeCartItems(Array.from({ length: 31 }, () => ({ productId: 'ai-book', quantity: 1 })), lookup)
    ).toBeNull();
  });

  test('uses catalog names and prices, ignoring client-sent values', () => {
    const result = normalizeCartItems(
      [{ productId: 'ai-book', quantity: 2, price: 1, name: 'זיוף' }],
      lookup
    );
    expect(result).toEqual({
      items: [{ productId: 'ai-book', name: 'בינה מלאכותית לילדים', quantity: 2, price: 75 }],
      total: 150,
    });
  });

  test('drops unknown products instead of rejecting the payload', () => {
    const result = normalizeCartItems(
      [
        { productId: 'deleted-product', quantity: 1 },
        { productId: 'ai-book', quantity: 1 },
      ],
      lookup
    );
    expect(result?.items.map((it) => it.productId)).toEqual(['ai-book']);
  });

  test('merges duplicates, clamps quantity, and sorts deterministically', () => {
    const a = normalizeCartItems(
      [
        { productId: 'ai-workbook', quantity: 1 },
        { productId: 'ai-book', quantity: 60 },
        { productId: 'ai-book', quantity: 60 },
      ],
      lookup
    );
    const b = normalizeCartItems(
      [
        { productId: 'ai-book', quantity: 99 },
        { productId: 'ai-workbook', quantity: 1 },
      ],
      lookup
    );
    expect(a?.items).toEqual(b?.items);
    expect(a?.items[0].productId).toBe('ai-book');
    expect(a?.items[0].quantity).toBe(99);
  });

  test('applies the bundle discount to the total', () => {
    const result = normalizeCartItems(
      [
        { productId: 'ai-book', quantity: 1 },
        { productId: 'encryption-book', quantity: 1 },
        { productId: 'algorithms-book', quantity: 1 },
      ],
      lookup
    );
    expect(result?.total).toBe(75 * 3 - 15);
  });

  test('empty carts are valid and empty', () => {
    expect(normalizeCartItems([], lookup)).toEqual({ items: [], total: 0 });
    expect(normalizeCartItems([{ productId: 'gone', quantity: 1 }], lookup)).toEqual({
      items: [],
      total: 0,
    });
  });
});

describe('parseMemberCartRow', () => {
  const validItems = [{ productId: 'ai-book', name: 'ספר', quantity: 1, price: 75 }];

  test('parses a valid row, coercing numeric strings', () => {
    expect(parseMemberCartRow({ items: validItems, total: '75' })).toEqual({
      items: validItems,
      total: 75,
    });
  });

  test('rejects rows with malformed or empty items', () => {
    expect(parseMemberCartRow({ items: [], total: 0 })).toBeNull();
    expect(parseMemberCartRow({ items: 'nope', total: 0 })).toBeNull();
    expect(parseMemberCartRow({ items: [{ name: 'x' }], total: 0 })).toBeNull();
    expect(parseMemberCartRow({ items: validItems, total: 'NaN' })).toBeNull();
  });
});

describe('recomputeSnapshotTotal', () => {
  // A stored snapshot keeps the total that the discount rules produced on the
  // day it was saved. Reminder emails quote that number, so it has to be
  // recomputed against today's rules or the email advertises a price checkout
  // will not honour.
  const expertBundle = [
    { productId: 'ai-book', name: 'a', quantity: 1, price: 75 },
    { productId: 'encryption-book', name: 'b', quantity: 1, price: 75 },
    { productId: 'algorithms-book', name: 'c', quantity: 1, price: 75 },
    { productId: 'ai-workbook', name: 'd', quantity: 2, price: 30 },
    { productId: 'encryption-workbook', name: 'e', quantity: 2, price: 30 },
    { productId: 'algorithms-workbook', name: 'f', quantity: 2, price: 30 },
  ];

  test('re-prices a snapshot stored under the old discount ladder', () => {
    // Saved as 405 - 115 = 290 back when the expert bundle gave 115 off.
    expect(recomputeSnapshotTotal({ items: expertBundle, total: 290 })).toBe(320);
  });

  test('uses the prices stored in the snapshot, so the email still adds up', () => {
    const oldPrices = expertBundle.map((it) => ({ ...it, price: it.price - 5 }));
    // 3*70 + 6*25 = 360, minus the 85 expert bundle.
    expect(recomputeSnapshotTotal({ items: oldPrices, total: 999 })).toBe(275);
  });

  test('leaves a snapshot with no bundle untouched', () => {
    const single = [{ productId: 'ai-book', name: 'a', quantity: 2, price: 75 }];
    expect(recomputeSnapshotTotal({ items: single, total: 150 })).toBe(150);
  });

  test('never returns a negative total', () => {
    expect(recomputeSnapshotTotal({ items: [], total: 0 })).toBe(0);
  });
});
