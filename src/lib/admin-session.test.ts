import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ADMIN_SESSION_TTL_MS, passwordMatches, signAdminSession, verifyAdminSession } from './admin-session';

const NOW = Date.parse('2026-11-12T10:00:00+02:00');

describe('admin session', () => {
  const original = process.env.ADMIN_PASSWORD;
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'correct horse battery staple';
  });
  afterEach(() => {
    process.env.ADMIN_PASSWORD = original;
  });

  it('accepts a session it signed', () => expect(verifyAdminSession(signAdminSession(NOW), NOW)).toBe(true));

  // The old cookie value was the literal word, which anyone could set by hand.
  it('rejects the old forgeable cookie value', () => expect(verifyAdminSession('authenticated', NOW)).toBe(false));

  it('rejects a missing or empty token', () => {
    expect(verifyAdminSession(undefined, NOW)).toBe(false);
    expect(verifyAdminSession('', NOW)).toBe(false);
  });

  it('expires after its lifetime', () => {
    const token = signAdminSession(NOW);
    expect(verifyAdminSession(token, NOW + ADMIN_SESSION_TTL_MS - 1)).toBe(true);
    expect(verifyAdminSession(token, NOW + ADMIN_SESSION_TTL_MS)).toBe(false);
  });

  it('rejects a token whose expiry was pushed forward', () => {
    const [, mac] = signAdminSession(NOW).split('.');
    expect(verifyAdminSession(`${NOW + 10 * ADMIN_SESSION_TTL_MS}.${mac}`, NOW)).toBe(false);
  });

  it('rejects a tampered signature', () => {
    const token = signAdminSession(NOW);
    const flipped = token.slice(0, -1) + (token.endsWith('0') ? '1' : '0');
    expect(verifyAdminSession(flipped, NOW)).toBe(false);
  });

  it('logs everyone out when the password changes', () => {
    const token = signAdminSession(NOW);
    process.env.ADMIN_PASSWORD = 'a new password';
    expect(verifyAdminSession(token, NOW)).toBe(false);
  });

  it('signs nothing valid when no password is configured', () => {
    process.env.ADMIN_PASSWORD = '';
    expect(verifyAdminSession(signAdminSession(NOW), NOW)).toBe(false);
  });

  it('matches the password exactly', () => {
    expect(passwordMatches('correct horse battery staple')).toBe(true);
    expect(passwordMatches('correct horse battery stapl')).toBe(false);
    expect(passwordMatches('')).toBe(false);
    expect(passwordMatches(undefined)).toBe(false);
  });

  it('never matches when no password is configured', () => {
    process.env.ADMIN_PASSWORD = '';
    expect(passwordMatches('')).toBe(false);
  });
});
