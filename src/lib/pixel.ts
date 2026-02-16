declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args);
  }
}

export function trackAddToCart(params: {
  content_name: string;
  content_ids: string[];
  value: number;
}) {
  fbq('track', 'AddToCart', {
    content_name: params.content_name,
    content_ids: params.content_ids,
    content_type: 'product',
    value: params.value,
    currency: 'ILS',
  });
}

export function trackInitiateCheckout(params: {
  content_ids: string[];
  num_items: number;
  value: number;
}) {
  fbq('track', 'InitiateCheckout', {
    content_ids: params.content_ids,
    num_items: params.num_items,
    value: params.value,
    currency: 'ILS',
  });
}

export function trackPurchase(params: {
  event_id: string;
  content_ids: string[];
  num_items: number;
  value: number;
}) {
  fbq('track', 'Purchase', {
    content_ids: params.content_ids,
    num_items: params.num_items,
    value: params.value,
    currency: 'ILS',
  }, { eventID: params.event_id });
}

export function getFbCookies(): { fbc: string | null; fbp: string | null } {
  if (typeof document === 'undefined') return { fbc: null, fbp: null };

  const cookies = document.cookie.split('; ');
  let fbc: string | null = null;
  let fbp: string | null = null;

  for (const cookie of cookies) {
    if (cookie.startsWith('_fbc=')) fbc = cookie.slice(5);
    if (cookie.startsWith('_fbp=')) fbp = cookie.slice(5);
  }

  return { fbc, fbp };
}
