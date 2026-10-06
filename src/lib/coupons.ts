import type { Product } from '@/types';
import { computeBundleDiscount } from './bundle-discount';
import { normalizeCartItems } from './cart-snapshot';

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

// The single definition of "what this order is worth": the products after the
// bundle discount, before shipping. Both the min_subtotal gate and the discount
// itself are measured against it, so a coupon advertised as valid over ₪300
// cannot be granted on a cart the customer pays ₪230 for.
export function priceAfterBundleDiscount(subtotal: number, bundleDiscount: number): number {
  return Math.max(0, subtotal - bundleDiscount);
}

// A percent coupon discounts what the customer would actually pay for the
// products, i.e. the subtotal after the bundle discount - never the full
// list price. Discounts stack on the remaining price, they do not compound
// off the original one.
export function computeCouponDiscount(
  coupon: Pick<Coupon, 'discount_type' | 'discount_value'>,
  subtotal: number,
  bundleDiscount: number
): number {
  const priceAfterBundle = priceAfterBundleDiscount(subtotal, bundleDiscount);
  if (priceAfterBundle === 0 || coupon.discount_value <= 0) return 0;

  const raw =
    coupon.discount_type === 'percent'
      // A percent that rounds down to nothing would make validateCoupon call a
      // perfectly good coupon inapplicable, so a live coupon is worth a shekel
      // at the very least.
      ? Math.max(1, Math.round((priceAfterBundle * coupon.discount_value) / 100))
      : coupon.discount_value;

  return Math.max(0, Math.min(raw, priceAfterBundle));
}

const fail = (message: string): CouponValidation => ({ valid: false, discount: 0, code: null, message });

// What is wrong with the code itself, whatever the cart holds; a usable
// coupon comes back narrowed.
function checkCouponCode(coupon: Coupon | null, now: Date): { coupon: Coupon } | { error: string } {
  if (!coupon) return { error: 'קוד קופון לא תקין' };
  if (!coupon.active) return { error: 'הקופון אינו פעיל' };
  if (coupon.expires_at && new Date(coupon.expires_at) <= now) return { error: 'תוקף הקופון פג' };
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) return { error: 'הקופון מוצה' };
  return { coupon };
}

// Prices a usable coupon against its basis: the min_subtotal gate, then the discount.
function priceCoupon(coupon: Coupon, subtotal: number, bundleDiscount: number): CouponValidation {
  if (coupon.min_subtotal != null && priceAfterBundleDiscount(subtotal, bundleDiscount) < coupon.min_subtotal)
    return fail(`הקופון תקף בהזמנה מעל ₪${coupon.min_subtotal}`);

  const discount = computeCouponDiscount(coupon, subtotal, bundleDiscount);
  if (discount <= 0) return fail('הקופון אינו חל על הזמנה זו');

  return { valid: true, discount, code: coupon.code, message: 'הקופון הוחל' };
}

export function validateCoupon(
  coupon: Coupon | null,
  subtotal: number,
  bundleDiscount: number,
  now: Date
): CouponValidation {
  const checked = checkCouponCode(coupon, now);
  if ('error' in checked) return fail(checked.error);
  return priceCoupon(checked.coupon, subtotal, bundleDiscount);
}

// One cart line priced from the catalog. Products flagged excludeFromCoupons
// (pre-sale books, already discounted) are paid for in full and never count
// toward a coupon.
export interface CouponCartLine {
  productId: string;
  price: number;
  quantity: number;
  excludeFromCoupons?: boolean;
}

type CouponProductLookup = (id: string) => Pick<Product, 'id' | 'name' | 'price' | 'excludeFromCoupons'> | undefined;

const EXCLUDED_MESSAGE = 'הקופון אינו חל על ספרים שכבר נמכרים במחיר מבצע';

// The coupon basis is the coupon-eligible products only, after the bundle
// discount, before shipping. Bundles are built from trilogy titles alone, so
// the bundle discount always belongs to the eligible part of the cart. The
// validate route and checkout both go through here, so the price the customer
// is quoted and the price they are charged cannot disagree.
export function validateCouponForCart(
  coupon: Coupon | null,
  lines: CouponCartLine[],
  now: Date
): CouponValidation {
  // Problems with the code itself (unknown, expired, used up) are reported
  // first; the messages below are for a code that is fine but meets a cart
  // whose sale-priced books do not count toward it.
  const checked = checkCouponCode(coupon, now);
  if ('error' in checked) return fail(checked.error);
  const usable = checked.coupon;

  const eligible = lines.filter((it) => !it.excludeFromCoupons);
  const hasExcluded = eligible.length < lines.length;
  const eligibleSubtotal = eligible.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const { bundleDiscount } = computeBundleDiscount(
    eligible.map((it) => ({ productId: it.productId, quantity: it.quantity }))
  );

  if (hasExcluded) {
    const eligibleBasis = priceAfterBundleDiscount(eligibleSubtotal, bundleDiscount);
    if (eligibleBasis === 0) return fail(EXCLUDED_MESSAGE);
    if (usable.min_subtotal != null && eligibleBasis < usable.min_subtotal)
      return fail(`הקופון תקף בהזמנה מעל ₪${usable.min_subtotal}, לא כולל ספרים במחיר מבצע`);
  }

  return priceCoupon(usable, eligibleSubtotal, bundleDiscount);
}

// Client cart payload for a coupon preview, parsed by the same rules as the
// member cart snapshot (catalog prices, merged duplicates, capped quantities,
// unknown products dropped); exclusion comes from the catalog too. Malformed
// payloads return null.
export function parseCouponCartItems(raw: unknown, getProduct: CouponProductLookup): CouponCartLine[] | null {
  const snapshot = normalizeCartItems(raw, getProduct);
  if (!snapshot) return null;
  return snapshot.items.map(({ productId, price, quantity }) => ({
    productId,
    price,
    quantity,
    excludeFromCoupons: getProduct(productId)?.excludeFromCoupons,
  }));
}
