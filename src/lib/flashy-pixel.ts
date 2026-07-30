import { trackingAllowed } from '@/lib/consent';

// Client-side wrapper for the Flashy site pixel (loaded by FlashyTracking).
// Same shape as pixel.ts: every call funnels through a guard that no-ops when
// the script is absent or tracking was declined.

declare global {
  interface Window {
    flashy?: (...args: unknown[]) => void;
  }
}

function flashy(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.flashy && trackingAllowed()) {
    window.flashy(...args);
  }
}

export function flashyAddToCart(params: { content_ids: string[]; value: number }) {
  flashy('AddToCart', {
    content_ids: params.content_ids,
    value: params.value,
    currency: 'ILS',
  });
}

// Ties the anonymous browser session to a contact, so cart activity and
// dashboard popup targeting attach to the right person (e.g. at checkout,
// once the customer typed their email).
export function flashyIdentify(email: string) {
  flashy('setCustomer', { email });
}
