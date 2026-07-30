// Pure state + eligibility logic for the members-club popup. No window access
// here so it stays unit-testable; ClubPopup.tsx owns the localStorage I/O.

export const CLUB_POPUP_STORAGE_KEY = 'club_popup';
export const CLUB_COUPON_CODE = 'CLUB10';
export const POPUP_DELAY_MS = 6000;
export const DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000;

const EXCLUDED_PATH_PREFIXES = ['/checkout', '/payment', '/success', '/admin'];

export interface ClubPopupState {
  status: 'dismissed' | 'joined';
  ts: number;
  email?: string;
}

// Safe parse of the stored state; anything malformed becomes null and gets
// overwritten on the next write.
export function parseClubPopupState(raw: string | null): ClubPopupState | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const candidate = parsed as Record<string, unknown>;
    if (candidate.status !== 'dismissed' && candidate.status !== 'joined') return null;
    if (typeof candidate.ts !== 'number' || !Number.isFinite(candidate.ts)) return null;

    const state: ClubPopupState = { status: candidate.status, ts: candidate.ts };
    if (typeof candidate.email === 'string' && candidate.email) {
      return { ...state, email: candidate.email };
    }
    return state;
  } catch {
    return null;
  }
}

export function isExcludedPath(pathname: string): boolean {
  return EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isPopupEligible(
  state: ClubPopupState | null,
  now: number,
  pathname: string
): boolean {
  if (isExcludedPath(pathname)) return false;
  if (!state) return true;
  if (state.status === 'joined') return false;
  return now - state.ts >= DISMISS_TTL_MS;
}

export function getMemberEmail(state: ClubPopupState | null): string | null {
  if (state?.status !== 'joined') return null;
  return state.email ?? null;
}
