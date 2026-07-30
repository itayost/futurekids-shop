import { describe, expect, test } from 'vitest';
import { normalizeCartItems, parseMemberCartRow } from './cart-snapshot';

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
