import crypto from 'crypto';

// Ownership proof for member cart syncs: an HMAC over the member email,
// issued by the subscribe endpoint and presented with every cart snapshot -
// so knowing a member's email alone is not enough to plant or delete their
// cart. Reuses UNSUBSCRIBE_SECRET with domain separation (the 'member:'
// prefix), so no additional env var is needed.

function secret(): string {
  return process.env.UNSUBSCRIBE_SECRET || '';
}

export function signMemberToken(email: string): string {
  return crypto
    .createHmac('sha256', secret())
    .update(`member:${email.toLowerCase()}`)
    .digest('hex');
}

export function verifyMemberToken(email: string, token: string): boolean {
  if (!secret() || !token) return false;
  const expected = signMemberToken(email);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(token, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
