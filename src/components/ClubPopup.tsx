'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, Check, Copy, Gift } from 'lucide-react';
import { getConsent } from '@/lib/consent';
import { trackLead } from '@/lib/pixel';
import { forceCartSync } from '@/lib/cart-sync';
import {
  CLUB_COUPON_CODE,
  CLUB_POPUP_STORAGE_KEY,
  POPUP_DELAY_MS,
  isExcludedPath,
  isPopupEligible,
  parseClubPopupState,
  type ClubPopupState,
} from '@/lib/club-popup';

function readState(): ClubPopupState | null {
  try {
    return parseClubPopupState(localStorage.getItem(CLUB_POPUP_STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeState(state: ClubPopupState): void {
  try {
    localStorage.setItem(CLUB_POPUP_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (e.g. private mode) - the popup will simply
    // reappear on the next visit.
  }
}

export default function ClubPopup() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Schedule the popup: only on eligible pages, only after the cookie banner
  // has been answered (consent.ts broadcasts 'consent-changed'), then a short
  // delay. Renders nothing until a client effect flips visibility, so there is
  // no hydration mismatch.
  useEffect(() => {
    if (visible) return;
    if (!isPopupEligible(readState(), Date.now(), pathname)) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const startTimer = () => {
      timer = setTimeout(() => setVisible(true), POPUP_DELAY_MS);
    };

    const onConsentChanged = () => startTimer();
    if (getConsent() === null) {
      window.addEventListener('consent-changed', onConsentChanged);
    } else {
      startTimer();
    }

    return () => {
      window.removeEventListener('consent-changed', onConsentChanged);
      if (timer) clearTimeout(timer);
    };
  }, [pathname, visible]);

  // Never keep the popup open on checkout/payment pages.
  useEffect(() => {
    if (visible && isExcludedPath(pathname)) {
      setVisible(false);
    }
  }, [pathname, visible]);

  const dismiss = useCallback(() => {
    // Joining already recorded its own state; don't downgrade it to dismissed.
    if (step !== 'success') {
      writeState({ status: 'dismissed', ts: Date.now() });
    }
    setVisible(false);
  }, [step]);

  useEffect(() => {
    if (!visible) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [visible, dismiss]);

  if (!visible) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const honeypot = new FormData(e.currentTarget).get('website');
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/club/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, website: honeypot }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        writeState({
          status: 'joined',
          ts: Date.now(),
          email: email.trim().toLowerCase(),
          token: typeof data.memberToken === 'string' ? data.memberToken : undefined,
        });
        // Capture a cart built before joining, now that the member is known.
        forceCartSync();
        trackLead();
        setStep('success');
      } else {
        setErrorMsg(data.message || 'שגיאה בהרשמה, נסו שוב');
      }
    } catch {
      setErrorMsg('שגיאה בהרשמה, נסו שוב');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(CLUB_COUPON_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable - the code is visible on screen anyway.
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#545454]/60 backdrop-blur-sm animate-fade-in"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="club-popup-title"
    >
      <div
        className="bg-white border-4 border-[#545454] rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto hard-shadow-lg animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-pink-100 to-amber-100 border-b-4 border-[#545454] p-6 rounded-t-2xl text-center">
          <button
            onClick={dismiss}
            className="absolute top-4 left-4 p-2 hover:bg-white/50 rounded-full transition-colors"
            aria-label="סגירה"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="inline-block bg-yellow-400 border-2 border-[#545454] px-4 py-1 rounded-full font-bold text-sm mb-3 transform -rotate-2">
            מועדון KidCode
          </div>
          <h2 id="club-popup-title" className="text-2xl font-black text-[#545454]">
            {step === 'form' ? '10% הנחה על ההזמנה הראשונה!' : 'איזה כיף שהצטרפת!'}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-gray-700 font-medium text-center">
                מצטרפים למועדון החברים, מקבלים קוד הנחה למייל ושומעים ראשונים על
                ספרים חדשים ומבצעים.
              </p>

              {/* Honeypot: off-screen (not display:none - some bots skip
                  those). The data-* attributes tell password managers to
                  leave it alone so a real signup is never silently dropped. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
              />

              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={100}
                placeholder="שם פרטי (לא חובה)"
                className="input-brutal w-full rounded-xl p-3 bg-gray-50"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={254}
                placeholder="email@example.com"
                dir="ltr"
                className="input-brutal w-full rounded-xl p-3 bg-gray-50 text-left"
              />

              {errorMsg && <p className="text-red-600 font-bold text-sm">{errorMsg}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="btn-retro w-full bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-xl font-black text-lg border-2 border-[#545454] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Gift className="w-5 h-5" />
                {submitting ? 'רק רגע...' : 'קבלו 10% הנחה'}
              </button>

              <button
                type="button"
                onClick={dismiss}
                className="text-gray-500 hover:text-gray-700 font-bold py-1 w-full transition-colors underline underline-offset-4 text-sm"
              >
                לא תודה
              </button>

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                בהצטרפות למועדון אני מאשר/ת קבלת דיוור מ-KidCode. אפשר להסיר את
                ההרשמה בכל עת.
              </p>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="inline-flex bg-emerald-500 rounded-full p-2 border-2 border-[#545454]">
                <Check className="w-6 h-6 text-white" strokeWidth={3} />
              </div>
              <p className="text-gray-700 font-medium">
                זה קוד ההנחה שלך - אפשר להשתמש בו כבר עכשיו:
              </p>
              <button
                onClick={copyCode}
                className="mx-auto flex items-center justify-center gap-3 border-3 border-dashed border-[#545454] rounded-2xl bg-[#fefce8] px-8 py-4 hover:bg-amber-50 transition-colors"
                aria-label="העתקת קוד הקופון"
              >
                <span className="font-mono text-2xl font-black tracking-widest" dir="ltr">
                  {CLUB_COUPON_CODE}
                </span>
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <p className="text-xs text-gray-500">
                מזינים את הקוד בשדה הקופון בעמוד התשלום.
              </p>
              <button
                onClick={() => setVisible(false)}
                className="btn-retro w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-black border-2 border-[#545454]"
              >
                להמשיך בקנייה
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
