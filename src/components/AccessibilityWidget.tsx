'use client';

import Script from 'next/script';

const USERWAY_ACCOUNT = '7ek953Xjr7';

/**
 * UserWay accessibility widget.
 *
 * Deliberately not gated on cookie consent: this is an accessibility aid
 * required of Israeli sites, not a marketing tracker, so it has to be
 * available to a visitor who declined tracking.
 */
export default function AccessibilityWidget() {
  return (
    <Script
      src="https://cdn.userway.org/widget.js"
      data-account={USERWAY_ACCOUNT}
      strategy="afterInteractive"
    />
  );
}
