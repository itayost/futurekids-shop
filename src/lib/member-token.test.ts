import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { signMemberToken, verifyMemberToken } from './member-token';
import { signUnsubscribe } from './unsubscribe';

const EMAIL = 'user@example.com';

beforeEach(() => {
  process.env.UNSUBSCRIBE_SECRET = 'test-secret';
});

afterEach(() => {
  delete process.env.UNSUBSCRIBE_SECRET;
});

describe('member token', () => {
  test('round-trip verifies, case-insensitively', () => {
    expect(verifyMemberToken(EMAIL, signMemberToken(EMAIL))).toBe(true);
    expect(verifyMemberToken('User@Example.com', signMemberToken(EMAIL))).toBe(true);
  });

  test('rejects tampered token, wrong email, empty token, missing secret', () => {
    const token = signMemberToken(EMAIL);
    const tampered = (token[0] === 'a' ? 'b' : 'a') + token.slice(1);
    expect(verifyMemberToken(EMAIL, tampered)).toBe(false);
    expect(verifyMemberToken('other@example.com', token)).toBe(false);
    expect(verifyMemberToken(EMAIL, '')).toBe(false);
    delete process.env.UNSUBSCRIBE_SECRET;
    expect(verifyMemberToken(EMAIL, token)).toBe(false);
  });

  test('domain separation: member token differs from the unsubscribe signature', () => {
    expect(signMemberToken(EMAIL)).not.toBe(signUnsubscribe(EMAIL));
  });
});
