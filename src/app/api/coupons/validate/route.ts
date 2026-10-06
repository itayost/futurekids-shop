import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { normalizeCode, parseCouponCartItems, parseCouponRow, validateCouponForCart } from '@/lib/coupons';
import { getProductById } from '@/lib/products';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = normalizeCode(body.code || '');

    if (!code) {
      return NextResponse.json({ valid: false, discount: 0, code: null, message: 'יש להזין קוד קופון' });
    }

    // Prices and coupon eligibility come from the catalog; the client sends
    // only what is in the cart.
    const lines = parseCouponCartItems(body.items, getProductById);
    if (!lines) {
      return NextResponse.json({ valid: false, discount: 0, code: null, message: 'הסל אינו תקין, נסו לרענן את העמוד' });
    }

    const rows = await sql`SELECT * FROM coupons WHERE code = ${code} LIMIT 1`;
    const coupon = rows[0] ? parseCouponRow(rows[0] as Record<string, unknown>) : null;
    const result = validateCouponForCart(coupon, lines, new Date());
    return NextResponse.json(result);
  } catch (error) {
    console.error('Coupon validate error:', error);
    return NextResponse.json(
      { valid: false, discount: 0, code: null, message: 'שגיאה בבדיקת הקופון' },
      { status: 500 }
    );
  }
}
