const STORAGE_KEY = 'cookie_consent';

export type ConsentValue = 'accepted' | 'declined';

export function getConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY) as ConsentValue | null;
}

export function setConsent(value: ConsentValue): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new Event('consent-changed'));
}

export function hasConsent(): boolean {
  return getConsent() === 'accepted';
}
