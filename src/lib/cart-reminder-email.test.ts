import { describe, expect, test } from 'vitest';
import { buildCartReminderEmailHtml } from './cart-reminder-email';

const UNSUB = 'https://www.kidcode.org.il/api/club/unsubscribe?e=abc&t=def';

const ITEMS = [
  { name: 'בינה מלאכותית לילדים', quantity: 1, price: 75 },
  { name: 'חוברת פעילויות - הצפנה', quantity: 2, price: 30 },
];

describe('buildCartReminderEmailHtml', () => {
  test('lists every item with quantity and line totals', () => {
    const html = buildCartReminderEmailHtml({ items: ITEMS, total: 135, unsubscribeUrl: UNSUB });
    expect(html).toContain('בינה מלאכותית לילדים');
    expect(html).toContain('חוברת פעילויות - הצפנה');
    expect(html).toContain('x2');
    expect(html).toContain('&#8362;75');
    expect(html).toContain('&#8362;60');
    expect(html).toContain('&#8362;135');
  });

  test('is RTL and links to the shop and unsubscribe', () => {
    const html = buildCartReminderEmailHtml({ items: ITEMS, total: 135, unsubscribeUrl: UNSUB });
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('https://www.kidcode.org.il');
    expect(html).toContain(UNSUB);
  });

  test('mentions the club coupon', () => {
    const html = buildCartReminderEmailHtml({ items: ITEMS, total: 135, unsubscribeUrl: UNSUB });
    expect(html).toContain('CLUB10');
  });

  test('escapes HTML in item names and greets by name when given', () => {
    const html = buildCartReminderEmailHtml({
      firstName: 'דנה',
      items: [{ name: '<img src=x>', quantity: 1, price: 10 }],
      total: 10,
      unsubscribeUrl: UNSUB,
    });
    expect(html).toContain('היי דנה!');
    expect(html).not.toContain('<img src=x>');
  });
});
