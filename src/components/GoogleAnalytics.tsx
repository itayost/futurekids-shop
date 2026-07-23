'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { getConsent } from '@/lib/consent';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(getConsent() !== 'declined');

    const handleConsentChange = () => {
      const declined = getConsent() === 'declined';
      setAllowed(!declined);
      if (declined && GA_ID) {
        // Documented GA opt-out flag: stops an already-loaded gtag from sending.
        (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true;
      }
    };

    window.addEventListener('consent-changed', handleConsentChange);
    return () => window.removeEventListener('consent-changed', handleConsentChange);
  }, []);

  if (!GA_ID || !allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `,
        }}
      />
    </>
  );
}
