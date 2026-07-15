import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { normalizeCode, parseCouponRow, validateCoupon } from '@/lib/coupons';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = normalizeCode(body.code || '');
    const subtotal = Number(body.subtotal) || 0;
    const bundleDiscount = Number(body.bundleDiscount) || 0;

    if (!code) {
      return NextResponse.json({ valid: false, discount: 0, code: null, message: 'יש להזין קוד קופון' });
    }

    const rows = await sql`SELECT * FROM coupons WHERE code = ${code} LIMIT 1`;
    const coupon = rows[0] ? parseCouponRow(rows[0] as Record<string, unknown>) : null;
    const result = validateCoupon(coupon, subtotal, bundleDiscount, new Date());
    return NextResponse.json(result);
  } catch (error) {
    console.error('Coupon validate error:', error);
    return NextResponse.json(
      { valid: false, discount: 0, code: null, message: 'שגיאה בבדיקת הקופון' },
      { status: 500 }
    );
  }
}
