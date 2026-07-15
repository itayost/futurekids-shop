'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { getConsent } from '@/lib/consent';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(getConsent() === 'accepted');

    const handleConsentChange = () => {
      setConsented(getConsent() === 'accepted');
    };

    window.addEventListener('consent-changed', handleConsentChange);
    return () => window.removeEventListener('consent-changed', handleConsentChange);
  }, []);

  if (!GA_ID || !consented) return null;

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
