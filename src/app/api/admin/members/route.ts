import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';

async function isAdmin(): Promise<boolean> {
  return (await cookies()).get('admin_session')?.value === 'authenticated';
}

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// Read-only club members listing for the admin dashboard, including each
// member's open cart snapshot (if any) and paid-order count.
export async function GET() {
  if (!(await isAdmin())) return unauthorized();

  try {
    const rows = await sql`
      SELECT m.email, m.first_name, m.created_at, m.unsubscribed_at, m.welcome_sent_at,
             mc.total AS cart_total, mc.updated_at AS cart_updated_at,
             (SELECT COUNT(*)::int FROM orders o
              WHERE LOWER(o.email) = m.email AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')) AS orders_count
      FROM club_members m
      LEFT JOIN member_carts mc ON mc.email = m.email
      ORDER BY m.created_at DESC
    `;

    const members = rows.map((row) => ({
      email: row.email as string,
      first_name: (row.first_name as string) || null,
      created_at: row.created_at as string,
      unsubscribed_at: (row.unsubscribed_at as string) || null,
      welcome_sent_at: (row.welcome_sent_at as string) || null,
      cart_total: row.cart_total != null ? parseFloat(row.cart_total) : null,
      cart_updated_at: (row.cart_updated_at as string) || null,
      orders_count: Number(row.orders_count) || 0,
    }));

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Admin members list error:', error);
    return NextResponse.json({ error: 'שגיאה בטעינת חברי המועדון' }, { status: 500 });
  }
}
