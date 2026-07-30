import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
  buildUnsubscribeUrl,
  decodeUnsubscribeEmail,
  signUnsubscribe,
  verifyUnsubscribe,
} from './unsubscribe';

const EMAIL = 'user@example.com';

beforeEach(() => {
  process.env.UNSUBSCRIBE_SECRET = 'test-secret';
});

afterEach(() => {
  delete process.env.UNSUBSCRIBE_SECRET;
});

describe('unsubscribe signing', () => {
  test('round-trip: signed email verifies', () => {
    expect(verifyUnsubscribe(EMAIL, signUnsubscribe(EMAIL))).toBe(true);
  });

  test('signature is case-insensitive on the email', () => {
    expect(verifyUnsubscribe('User@Example.com', signUnsubscribe(EMAIL))).toBe(true);
  });

  test('tampered signature is rejected', () => {
    const sig = signUnsubscribe(EMAIL);
    const tampered = (sig[0] === 'a' ? 'b' : 'a') + sig.slice(1);
    expect(verifyUnsubscribe(EMAIL, tampered)).toBe(false);
  });

  test('different email is rejected', () => {
    expect(verifyUnsubscribe('other@example.com', signUnsubscribe(EMAIL))).toBe(false);
  });

  test('empty signature and missing secret are rejected', () => {
    expect(verifyUnsubscribe(EMAIL, '')).toBe(false);
    delete process.env.UNSUBSCRIBE_SECRET;
    expect(verifyUnsubscribe(EMAIL, signUnsubscribe(EMAIL))).toBe(false);
  });
});

describe('unsubscribe url', () => {
  test('url decodes back to the email and carries a valid signature', () => {
    const url = new URL(buildUnsubscribeUrl(EMAIL));
    const decoded = decodeUnsubscribeEmail(url.searchParams.get('e') || '');
    expect(decoded).toBe(EMAIL);
    expect(verifyUnsubscribe(decoded as string, url.searchParams.get('t') || '')).toBe(true);
  });

  test('garbage encoded email decodes to null', () => {
    expect(decodeUnsubscribeEmail('%%%not-base64')).toBeNull();
    expect(decodeUnsubscribeEmail('aGVsbG8')).toBeNull();
  });
});
