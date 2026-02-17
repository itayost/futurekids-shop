'use client';

import { useState, useEffect } from 'react';
import { getConsent, setConsent } from '@/lib/consent';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    setConsent('accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    setConsent('declined');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-4 animate-slide-up">
      <div className="container mx-auto max-w-2xl bg-white border-4 border-[#545454] rounded-2xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]">
        <div className="flex items-start gap-3">
          <Cookie className="w-6 h-6 text-pink-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              אתר זה משתמש בקוקיז לצורך שיפור חוויית הגלישה ומעקב שיווקי.
              לפרטים נוספים ניתן לעיין{' '}
              <Link href="/privacy" className="text-pink-500 underline font-bold hover:text-pink-600">
                במדיניות הפרטיות
              </Link>
              .
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                className="btn-retro bg-pink-400 hover:bg-pink-500 text-white px-5 py-2 rounded-lg font-bold text-sm border-2 border-[#545454] transition"
              >
                אני מסכים/ה
              </button>
              <button
                onClick={handleDecline}
                className="btn-retro bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-bold text-sm border-2 border-[#545454] transition"
              >
                לא, תודה
              </button>
            </div>
          </div>
          <button
            onClick={handleDecline}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            aria-label="סגירה"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
