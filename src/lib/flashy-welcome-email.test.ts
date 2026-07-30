import { describe, expect, test } from 'vitest';
import { buildWelcomeEmailHtml, WELCOME_EMAIL_SUBJECT } from './flashy-welcome-email';

describe('buildWelcomeEmailHtml', () => {
  test('contains the coupon code', () => {
    const html = buildWelcomeEmailHtml({ couponCode: 'CLUB10' });
    expect(html).toContain('CLUB10');
  });

  test('is RTL Hebrew', () => {
    const html = buildWelcomeEmailHtml({ couponCode: 'CLUB10' });
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('lang="he"');
  });

  test('links to the shop', () => {
    const html = buildWelcomeEmailHtml({ couponCode: 'CLUB10' });
    expect(html).toContain('https://www.kidcode.org.il');
  });

  test('greets by first name when given', () => {
    const html = buildWelcomeEmailHtml({ firstName: 'דנה', couponCode: 'CLUB10' });
    expect(html).toContain('היי דנה!');
  });

  test('falls back to a generic greeting without a first name', () => {
    const html = buildWelcomeEmailHtml({ couponCode: 'CLUB10' });
    expect(html).toContain('היי!');
    expect(html).not.toContain('undefined');
  });

  test('escapes HTML in the first name', () => {
    const html = buildWelcomeEmailHtml({ firstName: '<script>alert(1)</script>', couponCode: 'CLUB10' });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  test('subject mentions the club', () => {
    expect(WELCOME_EMAIL_SUBJECT).toContain('KidCode');
  });
});
