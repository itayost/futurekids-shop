import type { Product } from '@/types';
import { activePromo, discountedPrice } from './promo';

// The Shopping IL sale. Everything time-boxed reads from here, so it turns itself
// on and off with no deploy at either end, and goes inert once the window passes.
export const SALE = {
  percent: 15,
  // Midnight Israel time (UTC+2 in November) opening 4.11 and closing 5.11.
  startsAt: Date.parse('2026-11-04T00:00:00+02:00'),
  endsAt: Date.parse('2026-11-06T00:00:00+02:00'),
} as const;

export function isSaleActive(now: number): boolean {
  return now >= SALE.startsAt && now < SALE.endsAt;
}

// Rounded down to a whole shekel (the client's call): the site promises 15%, so
// rounding may only ever favour the customer.
export function salePriceOf(price: number): number {
  return discountedPrice(price, SALE.percent);
}

// What a product costs at a given moment. A product's own promo wins over the
// sitewide sale; the two never stack.
export function priceOf(product: Pick<Product, 'price' | 'excludeFromSale' | 'promo'>, now: number): number {
  const promo = activePromo(product, now);
  if (promo) return discountedPrice(product.price, promo.percent);
  return isSaleActive(now) && !product.excludeFromSale ? salePriceOf(product.price) : product.price;
}

// The prerendered pages carry both prices; the head clock in lib/price-clock.ts
// sets data-sale on <html> and .when-sale in globals.css shows the right one.
