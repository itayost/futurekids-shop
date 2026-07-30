import {
  CLUB_POPUP_STORAGE_KEY,
  getMemberEmail,
  parseClubPopupState,
} from './club-popup';

// Best-effort cart snapshot sync for identified club members, so the reminder
// cron can catch carts that never reach checkout. Silent no-op for guests and
// on any failure - the cart itself must never depend on it.

const CART_STORAGE_KEY = 'futurekids-cart';
const SYNCED_STORAGE_KEY = 'futurekids-cart-synced';
const SYNC_DEBOUNCE_MS = 4000;

interface SyncItem {
  productId: string;
  quantity: number;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function memberEmail(): string | null {
  try {
    return getMemberEmail(parseClubPopupState(localStorage.getItem(CLUB_POPUP_STORAGE_KEY)));
  } catch {
    return null;
  }
}

function fingerprint(items: SyncItem[]): string {
  return JSON.stringify(
    [...items]
      .sort((a, b) => (a.productId < b.productId ? -1 : 1))
      .map((it) => ({ productId: it.productId, quantity: it.quantity }))
  );
}

function send(items: SyncItem[], force: boolean): void {
  const email = memberEmail();
  if (!email) return;

  const fp = fingerprint(items);
  if (!force) {
    try {
      // Skip the request when this exact cart state was already synced (the
      // mount effect fires on every page load); written only after success so
      // failures retry on the next change.
      if (localStorage.getItem(SYNCED_STORAGE_KEY) === fp) return;
    } catch {
      // Storage unavailable - sync anyway.
    }
  }

  fetch('/api/club/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, items }),
    keepalive: true,
  })
    .then((res) => {
      if (res.ok) {
        try {
          localStorage.setItem(SYNCED_STORAGE_KEY, fp);
        } catch {
          // Ignore - worst case is a redundant sync later.
        }
      }
    })
    .catch(() => {
      // Best-effort only.
    });
}

// Debounced sync on cart changes (called from CartProvider's persist effect).
export function scheduleCartSync(items: { productId: string; quantity: number }[]): void {
  if (typeof window === 'undefined') return;
  const payload = items.map((it) => ({ productId: it.productId, quantity: it.quantity }));
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => send(payload, false), SYNC_DEBOUNCE_MS);
}

// Immediate sync reading the persisted cart directly, bypassing the guard.
// Used right after joining the club, when the server row does not exist yet.
export function forceCartSync(): void {
  if (typeof window === 'undefined') return;

  let items: SyncItem[] = [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    if (Array.isArray(parsed)) {
      items = parsed.flatMap((entry) => {
        if (typeof entry !== 'object' || entry === null) return [];
        const it = entry as Record<string, unknown>;
        if (typeof it.productId !== 'string' || typeof it.quantity !== 'number') return [];
        return [{ productId: it.productId, quantity: it.quantity }];
      });
    }
  } catch {
    return;
  }

  send(items, true);
}
