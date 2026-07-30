import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getProductById } from '@/lib/products';
import { MAX_CART_ITEMS, normalizeCartItems } from '@/lib/cart-snapshot';
import { verifyMemberToken } from '@/lib/member-token';
import { clientIp, rateLimitAllows } from '@/lib/rate-limit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const RATE_LIMIT = 120;
const RATE_WINDOW_SECONDS = 60 * 60;

// Receives cart snapshots for identified club members. Names and prices are
// re-resolved from the catalog server-side; the client is trusted only for
// quantity. Writes require the member token issued at subscribe time, so
// knowing an email is not enough to plant or delete someone's cart; invalid
// tokens and non-members get the same success no-op as real members, so the
// endpoint cannot be used to probe which addresses are on the list.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!EMAIL_REGEX.test(email) || email.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length > MAX_CART_ITEMS) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const token = typeof body.token === 'string' ? body.token : '';
    if (!verifyMemberToken(email, token)) {
      return NextResponse.json({ success: true });
    }

    const allowed = await rateLimitAllows({
      scope: 'cart',
      ip: clientIp(request),
      limit: RATE_LIMIT,
      windowSeconds: RATE_WINDOW_SECONDS,
    });
    if (!allowed) {
      return NextResponse.json({ success: false }, { status: 429 });
    }

    const member = await sql`
      SELECT id FROM club_members WHERE email = ${email} AND unsubscribed_at IS NULL
    `;
    if (member.length === 0) {
      return NextResponse.json({ success: true });
    }

    const snapshot = normalizeCartItems(body.items, getProductById);
    if (!snapshot) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    if (snapshot.items.length === 0) {
      await sql`DELETE FROM member_carts WHERE email = ${email}`;
      return NextResponse.json({ success: true });
    }

    // updated_at and reminder_sent_at move only when the cart actually
    // changed, so merely visiting the site neither resets the idle clock nor
    // re-arms a sent reminder.
    await sql`
      INSERT INTO member_carts (email, items, total)
      VALUES (${email}, ${JSON.stringify(snapshot.items)}::jsonb, ${snapshot.total})
      ON CONFLICT (email) DO UPDATE SET
        items = EXCLUDED.items,
        total = EXCLUDED.total,
        updated_at = CASE
          WHEN member_carts.items IS DISTINCT FROM EXCLUDED.items THEN NOW()
          ELSE member_carts.updated_at
        END,
        reminder_sent_at = CASE
          WHEN member_carts.items IS DISTINCT FROM EXCLUDED.items THEN NULL
          ELSE member_carts.reminder_sent_at
        END
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Club cart sync error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
