// A time-boxed price on one product, e.g. a launch price. It turns itself on
// and off by date with no deploy at either end.
export interface ProductPromo {
  percent: number;
  // Window in epoch ms: on from startsAt, off from endsAt.
  startsAt: number;
  endsAt: number;
  // Shown next to the price, e.g. 'מחיר השקה עד סוף החודש'.
  label: string;
  // Already discounted, so no coupon applies to it on top while it runs.
  excludeFromCoupons: boolean;
}

interface Promotable {
  promo?: ProductPromo;
}

// Rounded down to a whole shekel: the site states a percent off, so rounding
// may only ever favour the customer.
export function discountedPrice(price: number, percent: number): number {
  return Math.floor((price * (100 - percent)) / 100);
}

export function activePromo(product: Promotable, now: number): ProductPromo | null {
  const { promo } = product;
  return promo && now >= promo.startsAt && now < promo.endsAt ? promo : null;
}

// What a product costs at a given moment: its promo price while the promo
// runs, its list price otherwise.
export function priceOf(product: Promotable & { price: number }, now: number): number {
  const promo = activePromo(product, now);
  return promo ? discountedPrice(product.price, promo.percent) : product.price;
}

export function isCouponExcluded(product: Promotable & { excludeFromCoupons?: boolean }, now: number): boolean {
  return Boolean(product.excludeFromCoupons || activePromo(product, now)?.excludeFromCoupons);
}
