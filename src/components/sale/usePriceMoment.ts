'use client';

import { useSyncExternalStore } from 'react';
import { PRICE_BOUNDARIES, priceMoment } from '@/lib/price-clock';

// setTimeout overflows past this; firing early is harmless because it re-arms.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const arm = () => {
    const now = Date.now();
    const next = PRICE_BOUNDARIES.find((b) => b > now);
    if (next === undefined) return;
    timer = setTimeout(() => {
      onChange();
      arm();
    }, Math.min(next - now + 50, MAX_TIMEOUT_MS));
  };
  arm();
  return () => clearTimeout(timer);
}

const getSnapshot = () => priceMoment(PRICE_BOUNDARIES, Date.now());
// The server renders as if every dated price had ended; carts are empty there.
const getServerSnapshot = () => priceMoment(PRICE_BOUNDARIES, Infinity);

// The moment to price at, for browser-state surfaces (cart, checkout, modals).
// It changes only when some price does, so a tab left open across a sale or
// promo boundary reprices on its own. Prerendered pages use the head clock.
export function usePriceMoment(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
