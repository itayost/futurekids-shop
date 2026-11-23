import { products } from './products';
import { SALE } from './sale';

// Every dated price change on the site: the sitewide sale and each product's
// own promo. Prerendered pages carry both prices of anything dated, and a
// clock in <head> marks <html> with which windows are open, so CSS can show
// the right price with no deploy at either end and no flash on load.
export interface PriceWindow {
  attr: string;
  startsAt: number;
  endsAt: number;
}

// Product ids become attribute and class names, so only plain slugs qualify.
const SAFE_ID = /^[a-z0-9-]+$/;

export const promoAttr = (productId: string) => `data-promo-${productId}`;

// Elements shown only while a product's promo runs, or only while it does not.
export const whenPromo = (productId: string) => `when-promo-${productId}`;
export const whenNoPromo = (productId: string) => `when-no-promo-${productId}`;

export function priceWindows(): PriceWindow[] {
  const promos = products.flatMap((p) =>
    p.promo && SAFE_ID.test(p.id)
      ? [{ attr: promoAttr(p.id), startsAt: p.promo.startsAt, endsAt: p.promo.endsAt }]
      : []
  );
  return [{ attr: 'data-sale', startsAt: SALE.startsAt, endsAt: SALE.endsAt }, ...promos];
}

// Runs in <head> before first paint. Display only: the server re-checks every
// window at checkout.
export function priceClockScript(windows: PriceWindow[]): string {
  const data = JSON.stringify(windows.map((w) => [w.attr, w.startsAt, w.endsAt])).replace(/</g, '\\u003c');
  return `(function(){var w=${data};function t(){var n=Date.now(),r=document.documentElement,d=0;for(var i=0;i<w.length;i++){var a=w[i];r.toggleAttribute(a[0],n>=a[1]&&n<a[2]);var x=n<a[1]?a[1]-n:n<a[2]?a[2]-n:0;if(x>0&&(d===0||x<d))d=x}if(d>0)setTimeout(t,Math.min(d+50,2147483647))}t()})();`;
}

// The .when-promo-* / .when-no-promo-* rules for each product with a promo.
// The sitewide sale's .when-sale / .when-regular live in globals.css.
export function promoCss(productIds: string[]): string {
  return productIds
    .filter((id) => SAFE_ID.test(id))
    .map(
      (id) =>
        `html:not([${promoAttr(id)}]) .${whenPromo(id)}{display:none!important}` +
        `html[${promoAttr(id)}] .${whenNoPromo(id)}{display:none!important}`
    )
    .join('');
}

// Every moment at which some price changes, ascending.
export function priceBoundaries(windows: PriceWindow[]): number[] {
  return [...new Set(windows.flatMap((w) => [w.startsAt, w.endsAt]))].sort((a, b) => a - b);
}

// A stand-in for `now` that only changes when a price does: the latest
// boundary at or before now, or just before the first. Prices at the returned
// moment equal prices at now, so React state can hold it without re-rendering
// every second, and the server can render with it too.
export function priceMoment(boundaries: number[], now: number): number {
  let moment = boundaries.length > 0 ? boundaries[0] - 1 : 0;
  for (const b of boundaries) {
    if (b > now) break;
    moment = b;
  }
  return moment;
}

export const PRICE_WINDOWS = priceWindows();
export const PRICE_BOUNDARIES = priceBoundaries(PRICE_WINDOWS);
export const PRICE_CLOCK_SCRIPT = priceClockScript(PRICE_WINDOWS);
export const PROMO_CSS = promoCss(products.filter((p) => p.promo).map((p) => p.id));
