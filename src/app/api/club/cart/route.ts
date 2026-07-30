import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getProductById } from '@/lib/products';
import { MAX_CART_ITEMS, normalizeCartItems } from '@/lib/cart-snapshot';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

// Receives cart snapshots for identified club members. Names and prices are
// re-resolved from the catalog server-side; the client is trusted only for
// quantity. Non-members get the same success response as members so the
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
