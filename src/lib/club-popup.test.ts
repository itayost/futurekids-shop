import { describe, expect, test } from 'vitest';
import {
  DISMISS_TTL_MS,
  getMemberEmail,
  getMemberIdentity,
  isPopupEligible,
  parseClubPopupState,
} from './club-popup';

const NOW = 1_800_000_000_000;

describe('parseClubPopupState', () => {
  test('returns null for null input', () => {
    expect(parseClubPopupState(null)).toBeNull();
  });

  test('returns null for garbage JSON', () => {
    expect(parseClubPopupState('not-json{')).toBeNull();
  });

  test('returns null for empty object', () => {
    expect(parseClubPopupState('{}')).toBeNull();
  });

  test('returns null for unknown status', () => {
    expect(parseClubPopupState(JSON.stringify({ status: 'maybe', ts: NOW }))).toBeNull();
  });

  test('returns null when ts is not a finite number', () => {
    expect(parseClubPopupState(JSON.stringify({ status: 'dismissed', ts: 'yesterday' }))).toBeNull();
  });

  test('parses a dismissed state', () => {
    expect(parseClubPopupState(JSON.stringify({ status: 'dismissed', ts: NOW }))).toEqual({
      status: 'dismissed',
      ts: NOW,
    });
  });

  test('parses a joined state with email', () => {
    const raw = JSON.stringify({ status: 'joined', ts: NOW, email: 'user@example.com' });
    expect(parseClubPopupState(raw)).toEqual({
      status: 'joined',
      ts: NOW,
      email: 'user@example.com',
    });
  });

  test('drops a non-string email', () => {
    const raw = JSON.stringify({ status: 'joined', ts: NOW, email: 42 });
    expect(parseClubPopupState(raw)).toEqual({ status: 'joined', ts: NOW });
  });

  test('carries the member token through', () => {
    const raw = JSON.stringify({ status: 'joined', ts: NOW, email: 'user@example.com', token: 'abc' });
    expect(parseClubPopupState(raw)).toEqual({
      status: 'joined',
      ts: NOW,
      email: 'user@example.com',
      token: 'abc',
    });
  });
});

describe('isPopupEligible', () => {
  test('eligible on regular pages with no prior state', () => {
    expect(isPopupEligible(null, NOW, '/')).toBe(true);
    expect(isPopupEligible(null, NOW, '/products/ai-book')).toBe(true);
  });

  test.each(['/checkout', '/payment', '/payment/success', '/success', '/admin', '/admin/coupons'])(
    'not eligible on excluded path %s',
    (pathname) => {
      expect(isPopupEligible(null, NOW, pathname)).toBe(false);
    }
  );

  test('a path merely starting with an excluded word is still eligible', () => {
    expect(isPopupEligible(null, NOW, '/checkout-guide')).toBe(true);
    expect(isPopupEligible(null, NOW, '/successful-stories')).toBe(true);
  });

  test('not eligible while a dismissal is fresh', () => {
    const state = { status: 'dismissed' as const, ts: NOW - DISMISS_TTL_MS + 60_000 };
    expect(isPopupEligible(state, NOW, '/')).toBe(false);
  });

  test('eligible again once the dismissal expired', () => {
    const state = { status: 'dismissed' as const, ts: NOW - DISMISS_TTL_MS - 1 };
    expect(isPopupEligible(state, NOW, '/')).toBe(true);
  });

  test('never eligible after joining, no matter how old', () => {
    const state = { status: 'joined' as const, ts: NOW - 10 * DISMISS_TTL_MS };
    expect(isPopupEligible(state, NOW, '/')).toBe(false);
  });
});

describe('getMemberEmail', () => {
  test('null state has no email', () => {
    expect(getMemberEmail(null)).toBeNull();
  });

  test('dismissed state has no email', () => {
    expect(getMemberEmail({ status: 'dismissed', ts: NOW })).toBeNull();
  });

  test('joined without email returns null', () => {
    expect(getMemberEmail({ status: 'joined', ts: NOW })).toBeNull();
  });

  test('joined with email returns it', () => {
    expect(getMemberEmail({ status: 'joined', ts: NOW, email: 'user@example.com' })).toBe(
      'user@example.com'
    );
  });
});

describe('getMemberIdentity', () => {
  test('requires joined status with both email and token', () => {
    expect(getMemberIdentity(null)).toBeNull();
    expect(getMemberIdentity({ status: 'dismissed', ts: NOW })).toBeNull();
    expect(getMemberIdentity({ status: 'joined', ts: NOW, email: 'a@b.co' })).toBeNull();
    expect(getMemberIdentity({ status: 'joined', ts: NOW, token: 'abc' })).toBeNull();
    expect(getMemberIdentity({ status: 'joined', ts: NOW, email: 'a@b.co', token: 'abc' })).toEqual({
      email: 'a@b.co',
      token: 'abc',
    });
  });
});
