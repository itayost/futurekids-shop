import crypto from 'crypto';

// Stateless signed unsubscribe links: the link carries the email (base64url)
// plus an HMAC, so no per-recipient token rows are needed and the same link
// format works for club members and one-off cart-reminder recipients.

function secret(): string {
  return process.env.UNSUBSCRIBE_SECRET || '';
}

export function signUnsubscribe(email: string): string {
  return crypto.createHmac('sha256', secret()).update(email.toLowerCase()).digest('hex');
}

export function verifyUnsubscribe(email: string, signature: string): boolean {
  if (!secret() || !signature) return false;
  const expected = signUnsubscribe(email);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function buildUnsubscribeUrl(email: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.kidcode.org.il';
  const encoded = Buffer.from(email.toLowerCase(), 'utf8').toString('base64url');
  return `${baseUrl}/api/club/unsubscribe?e=${encoded}&t=${signUnsubscribe(email)}`;
}

export function decodeUnsubscribeEmail(encoded: string): string | null {
  try {
    const email = Buffer.from(encoded, 'base64url').toString('utf8');
    return email.includes('@') ? email : null;
  } catch {
    return null;
  }
}
