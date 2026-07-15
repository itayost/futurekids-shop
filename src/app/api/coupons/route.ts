import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { normalizeCode } from '@/lib/coupons';

async function isAdmin(): Promise<boolean> {
  const session = (await cookies()).get('admin_session');
  return session?.value === 'authenticated';
}

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  const coupons = await sql`SELECT * FROM coupons ORDER BY created_at DESC`;
  return NextResponse.json({ coupons });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const body = await request.json();
  const code = normalizeCode(body.code || '');
  if (!code) return NextResponse.json({ error: 'קוד חסר' }, { status: 400 });
  if (body.discount_type !== 'percent' && body.discount_type !== 'fixed') {
    return NextResponse.json({ error: 'סוג הנחה לא תקין' }, { status: 400 });
  }
  const value = Number(body.discount_value);
  if (!(value > 0)) return NextResponse.json({ error: 'ערך הנחה לא תקין' }, { status: 400 });

  const minSubtotal =
    body.min_subtotal !== undefined && body.min_subtotal !== null && body.min_subtotal !== ''
      ? Number(body.min_subtotal) : null;
  const maxUses =
    body.max_uses !== undefined && body.max_uses !== null && body.max_uses !== ''
      ? Number(body.max_uses) : null;
  const active = body.active !== false;
  const expiresAt = body.expires_at ? body.expires_at : null;

  try {
    const rows = await sql`
      INSERT INTO coupons (code, discount_type, discount_value, min_subtotal, max_uses, active, expires_at)
      VALUES (${code}, ${body.discount_type}, ${value}, ${minSubtotal}, ${maxUses}, ${active}, ${expiresAt})
      RETURNING *
    `;
    return NextResponse.json({ coupon: rows[0] });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: 'קוד קופון כבר קיים' }, { status: 409 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const rows = await sql`UPDATE coupons SET active = ${body.active} WHERE id = ${body.id} RETURNING *`;
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ coupon: rows[0] });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await sql`DELETE FROM coupons WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
