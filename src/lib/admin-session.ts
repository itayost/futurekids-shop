import crypto from 'crypto';

// The admin session cookie: `<expiry ms>.<HMAC of the expiry>`. Only the server
// can mint one, it expires on its own, and changing ADMIN_PASSWORD logs every
// session out, since the signing key is derived from it (no extra env var).

export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function password(): string {
  return process.env.ADMIN_PASSWORD || '';
}

function signingKey(): Buffer {
  return crypto.createHmac('sha256', password()).update('admin-session-key').digest();
}

function mac(expiresAt: number): string {
  return crypto.createHmac('sha256', signingKey()).update(`admin-session:${expiresAt}`).digest('hex');
}

function sameText(a: string, b: string): boolean {
  // Hash first so the comparison is constant-time whatever the lengths.
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function passwordMatches(input: unknown): boolean {
  return password() !== '' && typeof input === 'string' && sameText(input, password());
}

export function signAdminSession(now: number): string {
  const expiresAt = now + ADMIN_SESSION_TTL_MS;
  return `${expiresAt}.${mac(expiresAt)}`;
}

export function verifyAdminSession(token: string | undefined, now: number): boolean {
  if (!token || password() === '') return false;
  const match = /^(\d{13})\.([0-9a-f]{64})$/.exec(token);
  if (!match) return false;
  const expiresAt = Number(match[1]);
  return now < expiresAt && sameText(match[2], mac(expiresAt));
}
