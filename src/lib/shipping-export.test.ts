import { describe, expect, test } from 'vitest';
import {
  buildChitaCsv,
  contentsSummary,
  formatPhone,
  parseStreetAndHouse,
} from './shipping-export';
import type { ExportOrder, ExportOrderItem } from './shipping-export';

function item(productId: string, productName: string, quantity: number): ExportOrderItem {
  return { productId, productName, quantity, price: 0 };
}

describe('contentsSummary', () => {
  test('one book and one workbook of the same title', () => {
    const items = [
      item('algorithms-book', 'אלגוריתמים לילדים', 1),
      item('algorithms-workbook', 'חוברת פעילויות - אלגוריתמים', 1),
    ];
    expect(contentsSummary(items)).toBe('אלגו ס+ח');
  });

  test('quantities above one get a count prefix', () => {
    const items = [
      item('ai-book', 'בינה מלאכותית לילדים', 2),
      item('ai-workbook', 'חוברת פעילויות - בינה מלאכותית', 2),
    ];
    expect(contentsSummary(items)).toBe('בינה 2ס+2ח');
  });

  test('book only', () => {
    expect(contentsSummary([item('encryption-book', 'סודות ההצפנה לילדים', 1)])).toBe('הצפנה ס');
  });

  test('workbook only', () => {
    expect(contentsSummary([item('ai-workbook', 'חוברת פעילויות - בינה מלאכותית', 1)])).toBe(
      'בינה ח'
    );
  });

  test('multiple titles are comma separated', () => {
    const items = [
      item('ai-book', 'בינה מלאכותית לילדים', 1),
      item('encryption-book', 'סודות ההצפנה לילדים', 1),
      item('algorithms-book', 'אלגוריתמים לילדים', 1),
      item('ai-workbook', 'חוברת פעילויות - בינה מלאכותית', 1),
      item('encryption-workbook', 'חוברת פעילויות - סודות ההצפנה', 1),
      item('algorithms-workbook', 'חוברת פעילויות - אלגוריתמים', 1),
    ];
    expect(contentsSummary(items)).toBe('בינה ס+ח, הצפנה ס+ח, אלגו ס+ח');
  });

  test('unknown product falls back to its name', () => {
    const items = [item('mystery-book', 'ספר חדש', 1)];
    expect(contentsSummary(items)).toBe('ספר חדש ס');
  });

  test('empty items', () => {
    expect(contentsSummary([])).toBe('');
  });
});

describe('formatPhone', () => {
  test('hyphenates a 10-digit mobile so Excel keeps the leading 0', () => {
    expect(formatPhone('0501234567')).toBe('050-1234567');
  });

  test('restores a leading 0 dropped upstream', () => {
    expect(formatPhone('501234567')).toBe('050-1234567');
  });

  test('converts +972 prefix to local format', () => {
    expect(formatPhone('+972501234567')).toBe('050-1234567');
  });

  test('hyphenates a 9-digit landline', () => {
    expect(formatPhone('031234567')).toBe('03-1234567');
  });

  test('strips existing separators before formatting', () => {
    expect(formatPhone('050-123 4567')).toBe('050-1234567');
  });

  test('leaves unrecognized values untouched', () => {
    expect(formatPhone('12')).toBe('12');
    expect(formatPhone('')).toBe('');
  });
});

describe('parseStreetAndHouse', () => {
  test('splits street and house number', () => {
    expect(parseStreetAndHouse('בני ברית 2')).toEqual({ street: 'בני ברית', house: '2' });
  });
});

describe('buildChitaCsv', () => {
  const order: ExportOrder = {
    id: '1',
    first_name: 'דנה',
    last_name: 'כהן',
    phone: '0501234567',
    address: 'הרצל 5',
    city: 'תל אביב',
    shipping_method: 'delivery',
    pickup_point_code: null,
    pickup_point_name: null,
    items: [
      item('algorithms-book', 'אלגוריתמים לילדים', 1),
      item('algorithms-workbook', 'חוברת פעילויות - אלגוריתמים', 1),
    ],
  };

  test('row carries formatted phone and detailed notes', () => {
    const csv = buildChitaCsv([order], 'delivery', new Map());
    const row = csv.split('\r\n')[1];
    expect(row).toContain('050-1234567');
    expect(row).toContain('אלגו ס+ח');
  });

  test('notes with several titles stay a single CSV field', () => {
    const multi: ExportOrder = {
      ...order,
      items: [
        item('ai-book', 'בינה מלאכותית לילדים', 1),
        item('algorithms-book', 'אלגוריתמים לילדים', 1),
      ],
    };
    const csv = buildChitaCsv([multi], 'delivery', new Map());
    const row = csv.split('\r\n')[1];
    expect(row).toContain('"בינה ס, אלגו ס"');
  });
});
