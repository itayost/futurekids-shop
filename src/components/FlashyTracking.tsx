'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { getConsent } from '@/lib/consent';

const ACCOUNT_ID = process.env.NEXT_PUBLIC_FLASHY_ACCOUNT_ID;

function subscribeToConsent(onChange: () => void) {
  window.addEventListener('consent-changed', onChange);
  return () => window.removeEventListener('consent-changed', onChange);
}

// Loads the Flashy site pixel (thunder.js). Beyond visitor tracking, this
// script is what renders the popups managed in the Flashy dashboard, so the
// members-club signup popup is controlled entirely from Flashy.
export default function FlashyTracking() {
  const allowed = useSyncExternalStore(
    subscribeToConsent,
    () => getConsent() !== 'declined',
    () => false
  );
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);

  // PageView on client-side navigations; the initial one fires in the snippet.
  useEffect(() => {
    if (previousPathname.current !== null && previousPathname.current !== pathname) {
      if (allowed && window.flashy) {
        window.flashy('PageView');
      }
    }
    previousPathname.current = pathname;
  }, [pathname, allowed]);

  // Flashy requires a numeric account id; the digits check also keeps the
  // inline script safe to interpolate.
  if (!ACCOUNT_ID || !/^\d+$/.test(ACCOUNT_ID) || !allowed) return null;

  return (
    <Script
      id="flashy-tracking"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          'use strict'; (function (a, b, c) { if (!a.flashy) { a.flashy = function () { a.flashy.event && a.flashy.event(arguments), a.flashy.queue.push(arguments) }, a.flashy.queue = []; var d = document.getElementsByTagName('script')[0], e = document.createElement(b); e.src = c, e.async = !0, d.parentNode.insertBefore(e, d) } })(window, 'script', 'https://js.flashyapp.com/thunder.js'),
          flashy('init', ${ACCOUNT_ID});
          flashy('PageView');
        `,
      }}
    />
  );
}
