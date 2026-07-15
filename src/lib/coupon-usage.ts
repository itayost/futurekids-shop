import { sql } from '@/lib/db';

// Bump a coupon's used_count for a paid order. Safe to call only from the
// PENDING->PAID transition winner (fires at most once per order). If the order
// has no coupon_code, the subquery yields NULL and nothing is updated.
export async function incrementCouponUsageForOrder(orderId: string): Promise<void> {
  await sql`
    UPDATE coupons
    SET used_count = used_count + 1
    WHERE code = (SELECT coupon_code FROM orders WHERE id = ${orderId})
  `;
}
