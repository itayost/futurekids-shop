import type { Product } from '@/types';

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
  return Math.floor((price * (100 - SALE.percent)) / 100);
}

export function priceOf(product: Pick<Product, 'price' | 'excludeFromSale'>, now: number): number {
  return isSaleActive(now) && !product.excludeFromSale ? salePriceOf(product.price) : product.price;
}

// A moment on the matching side of the window, for code that only knows whether
// the sale is on (React state) and must not read the clock while rendering.
export function saleMoment(active: boolean): number {
  return active ? SALE.startsAt : SALE.endsAt;
}

// Runs in <head> before first paint and sets data-sale on <html>. The public
// pages are prerendered, so they carry both prices and CSS shows the right one
// (see .when-sale in globals.css); this flips them with no flash and no mismatch.
// Display only: the server re-checks the window at checkout.
export const saleClockScript = `(function(){var s=${SALE.startsAt},e=${SALE.endsAt};function t(){var n=Date.now();document.documentElement.toggleAttribute('data-sale',n>=s&&n<e);var d=n<s?s-n:n<e?e-n:0;if(d>0)setTimeout(t,Math.min(d+50,2147483647))}t()})();`;
