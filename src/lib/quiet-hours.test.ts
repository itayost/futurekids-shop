import { describe, expect, test } from 'vitest';
import { isQuietHours } from './quiet-hours';

// Fixed instants; Israel is UTC+3 (IDT) in summer and UTC+2 (IST) in winter.

describe('isQuietHours', () => {
  test('summer (IDT): starts Friday 16:00, ends Saturday 21:30', () => {
    expect(isQuietHours(new Date('2026-07-31T12:59:00Z'))).toBe(false); // Fri 15:59
    expect(isQuietHours(new Date('2026-07-31T13:00:00Z'))).toBe(true); // Fri 16:00
    expect(isQuietHours(new Date('2026-07-31T20:59:00Z'))).toBe(true); // Fri 23:59
    expect(isQuietHours(new Date('2026-07-31T21:01:00Z'))).toBe(true); // Sat 00:01
    expect(isQuietHours(new Date('2026-08-01T18:29:00Z'))).toBe(true); // Sat 21:29
    expect(isQuietHours(new Date('2026-08-01T18:30:00Z'))).toBe(false); // Sat 21:30
  });

  test('winter (IST): same wall-clock boundaries', () => {
    expect(isQuietHours(new Date('2026-01-16T13:59:00Z'))).toBe(false); // Fri 15:59
    expect(isQuietHours(new Date('2026-01-16T14:00:00Z'))).toBe(true); // Fri 16:00
    expect(isQuietHours(new Date('2026-01-17T19:29:00Z'))).toBe(true); // Sat 21:29
    expect(isQuietHours(new Date('2026-01-17T19:30:00Z'))).toBe(false); // Sat 21:30
  });

  test('weekdays are never quiet', () => {
    expect(isQuietHours(new Date('2026-07-29T13:00:00Z'))).toBe(false); // Wed afternoon
    expect(isQuietHours(new Date('2026-08-02T13:00:00Z'))).toBe(false); // Sun afternoon
    expect(isQuietHours(new Date('2026-07-30T23:00:00Z'))).toBe(false); // Fri 02:00 (early morning)
  });
});
