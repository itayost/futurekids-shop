export type DiscountType = 'percent' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_subtotal: number | null;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
}

export interface CouponValidation {
  valid: boolean;
  discount: number;
  message: string;
  code: string | null;
}

export function normalizeCode(code: string): string {
  return (code || '').trim().toUpperCase();
}

// Neon returns `numeric` columns as strings; coerce a raw DB row to a Coupon.
export function parseCouponRow(row: Record<string, unknown>): Coupon {
  return {
    id: String(row.id),
    code: String(row.code),
    discount_type: row.discount_type as DiscountType,
    discount_value: Number(row.discount_value),
    min_subtotal: row.min_subtotal == null ? null : Number(row.min_subtotal),
    max_uses: row.max_uses == null ? null : Number(row.max_uses),
    used_count: Number(row.used_count),
    active: Boolean(row.active),
    expires_at: row.expires_at == null ? null : String(row.expires_at),
  };
}

export function computeCouponDiscount(
  coupon: Pick<Coupon, 'discount_type' | 'discount_value'>,
  subtotal: number,
  bundleDiscount: number
): number {
  const raw =
    coupon.discount_type === 'percent'
      ? Math.round((subtotal * coupon.discount_value) / 100)
      : coupon.discount_value;
  const maxAllowed = Math.max(0, subtotal - bundleDiscount);
  return Math.max(0, Math.min(raw, maxAllowed));
}

export function validateCoupon(
  coupon: Coupon | null,
  subtotal: number,
  bundleDiscount: number,
  now: Date
): CouponValidation {
  const fail = (message: string): CouponValidation => ({ valid: false, discount: 0, code: null, message });

  if (!coupon) return fail('קוד קופון לא תקין');
  if (!coupon.active) return fail('הקופון אינו פעיל');
  if (coupon.expires_at && new Date(coupon.expires_at) <= now) return fail('תוקף הקופון פג');
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) return fail('הקופון מוצה');
  if (coupon.min_subtotal != null && subtotal < coupon.min_subtotal)
    return fail(`הקופון תקף בהזמנה מעל ₪${coupon.min_subtotal}`);

  const discount = computeCouponDiscount(coupon, subtotal, bundleDiscount);
  if (discount <= 0) return fail('הקופון אינו חל על הזמנה זו');

  return { valid: true, discount, code: coupon.code, message: 'הקופון הוחל' };
}
