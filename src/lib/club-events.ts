import {
  CLUB_POPUP_STORAGE_KEY,
  getMemberEmail,
  parseClubPopupState,
} from '@/lib/club-popup';

// Fire-and-forget AddToCart event for identified club members, proxied through
// /api/club/event so the Flashy API key stays server-side. Silent no-op for
// guests and on any failure - cart behavior must never depend on it.
export function sendClubAddToCart(params: { contentIds: string[]; value: number }): void {
  if (typeof window === 'undefined') return;

  let email: string | null = null;
  try {
    email = getMemberEmail(parseClubPopupState(localStorage.getItem(CLUB_POPUP_STORAGE_KEY)));
  } catch {
    return;
  }
  if (!email) return;

  fetch('/api/club/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'AddToCart',
      email,
      content_ids: params.contentIds,
      value: params.value,
    }),
  }).catch(() => {
    // Ignore network failures; this is best-effort marketing telemetry.
  });
}
