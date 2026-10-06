import { describe, it, expect } from 'vitest';
import { classifyOrderShipping, preorderShippingNote, type PreorderLookup } from './preorder';

// A fixed catalog, so these tests survive the book leaving pre-order.
const catalog: Record<string, { name: string; preorder?: { shipsBy: string } }> = {
  'ai-book': { name: 'בינה מלאכותית לילדים' },
  'ai-workbook': { name: 'חוברת פעילויות - בינה מלאכותית' },
  'riddles-book-1': { name: 'חידה! לכל המשפחה', preorder: { shipsBy: 'נובמבר 2026' } },
};
const lookup: PreorderLookup = (id) => catalog[id];

describe('classifyOrderShipping', () => {
  it('in-stock items only ship as one regular parcel', () =>
    expect(classifyOrderShipping(['ai-book', 'ai-workbook'], lookup)).toBe('regular'));
  it('pre-order items only wait for the release', () =>
    expect(classifyOrderShipping(['riddles-book-1'], lookup)).toBe('preorder-only'));
  it('a mix of both waits for the release and ships as one parcel', () =>
    expect(classifyOrderShipping(['ai-book', 'riddles-book-1'], lookup)).toBe('mixed'));
  it('an unknown (delisted) product counts as in stock', () =>
    expect(classifyOrderShipping(['gone-book', 'riddles-book-1'], lookup)).toBe('mixed'));
  it('an empty order is regular', () =>
    expect(classifyOrderShipping([], lookup)).toBe('regular'));
  it('uses the real catalog by default', () =>
    expect(classifyOrderShipping(['ai-book'])).toBe('regular'));
});

describe('preorderShippingNote', () => {
  it('says nothing for a regular cart', () =>
    expect(preorderShippingNote(['ai-book'], lookup)).toBeNull());
  it('explains the release date for a pre-order-only cart', () =>
    expect(preorderShippingNote(['riddles-book-1'], lookup))
      .toBe('רכישה מוקדמת: הספר יישלח עם צאתו בנובמבר 2026.'));
  it('tells a mixed cart that everything ships together on release, naming the book from the catalog', () =>
    expect(preorderShippingNote(['ai-book', 'riddles-book-1'], lookup))
      .toBe('רכישה מוקדמת: כל ההזמנה, כולל הספרים שבמלאי, תישלח במשלוח אחד עם צאת חידה! לכל המשפחה בנובמבר 2026.'));
});
