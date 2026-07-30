import { describe, expect, test } from 'vitest';
import { buildMembersCsv } from './members-csv';

const BASE = {
  email: 'user@example.com',
  first_name: 'דנה',
  created_at: '2026-07-30T12:00:00Z',
  unsubscribed_at: null,
};

describe('buildMembersCsv', () => {
  test('starts with a BOM and a Hebrew header row', () => {
    const csv = buildMembersCsv([]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('אימייל,שם פרטי,תאריך הצטרפות,סטטוס');
  });

  test('maps status and empty first name', () => {
    const csv = buildMembersCsv([
      BASE,
      { ...BASE, email: 'gone@example.com', first_name: null, unsubscribed_at: '2026-07-30T13:00:00Z' },
    ]);
    expect(csv).toContain('user@example.com,דנה');
    expect(csv).toContain('פעיל');
    expect(csv).toContain('gone@example.com,,');
    expect(csv).toContain('הוסר');
  });

  test('escapes commas, quotes and newlines per RFC 4180', () => {
    const csv = buildMembersCsv([
      { ...BASE, first_name: 'Cohen, "Dana"\nJr' },
    ]);
    expect(csv).toContain('"Cohen, ""Dana""\nJr"');
  });

  test('neutralizes Excel formula injection in member-supplied fields', () => {
    const csv = buildMembersCsv([
      { ...BASE, first_name: '=HYPERLINK("http://evil.example")' },
      { ...BASE, email: '+cmd@example.com', first_name: '@SUM(1)' },
    ]);
    expect(csv).not.toMatch(/(^|,)=HYPERLINK/m);
    expect(csv).toContain(`"'=HYPERLINK`);
    expect(csv).toContain(`'+cmd@example.com`);
    expect(csv).toContain(`'@SUM(1)`);
  });
});
