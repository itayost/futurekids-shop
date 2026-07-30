// Server-only Flashy client (marketing platform, https://api.flashy.app).
// Fail-soft: never throws and returns false on any failure, so a Flashy outage
// or missing key can never break checkout or payment flows. Mirrors the
// conventions of meta-capi.ts. Client-side tracking (popups, AddToCart) runs
// through the Flashy site pixel instead - see FlashyTracking.tsx and
// flashy-pixel.ts.

const API_BASE = 'https://api.flashy.app';

export type FlashyEventName = 'AddToCart' | 'InitiateCheckout' | 'Purchase';

export async function sendEvent(
  event: FlashyEventName,
  body: { email: string } & Record<string, unknown>
): Promise<boolean> {
  const apiKey = process.env.FLASHY_API_KEY;
  if (!apiKey) {
    console.error('Flashy: missing FLASHY_API_KEY');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ event, body }),
    });

    if (!response.ok) {
      const detail = (await response.text().catch(() => '')).slice(0, 300);
      console.error(`Flashy: event ${event} failed with status ${response.status}: ${detail}`);
      return false;
    }

    const result = (await response.json()) as { success?: boolean };
    if (result.success !== true) {
      console.error(`Flashy: event ${event} returned success=false`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Flashy: event ${event} request error:`, error);
    return false;
  }
}
