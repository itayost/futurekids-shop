'use client';

import { useSyncExternalStore } from 'react';
import { SALE, isSaleActive } from '@/lib/sale';

// setTimeout overflows past this; firing early is harmless because it re-arms.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const arm = () => {
    const now = Date.now();
    const next = now < SALE.startsAt ? SALE.startsAt : now < SALE.endsAt ? SALE.endsAt : null;
    if (next === null) return;
    timer = setTimeout(() => {
      onChange();
      arm();
    }, Math.min(next - now + 50, MAX_TIMEOUT_MS));
  };
  arm();
  return () => clearTimeout(timer);
}

// For browser-state surfaces (cart, checkout, modals), which reprice on their own
// when a tab stays open across the boundary. Prerendered pages use .when-sale.
export function useSaleActive(): boolean {
  return useSyncExternalStore(subscribe, () => isSaleActive(Date.now()), () => false);
}
