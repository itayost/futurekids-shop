# Members Club (Flashy) - Design

Date: 2026-07-30 (revised same day: popup moved from custom code to Flashy)
Status: Approved

## Context / Problem

The shop has no email marketing. The owner opened a Flashy account (Israeli
omnichannel marketing platform) and wants three things:

1. A site-entry popup offering members-club signup with 10% off.
2. A welcome email carrying the coupon code.
3. A cart-abandonment reminder 24 hours later.

Additionally, a new public sender/contact address hello@kidcode.org.il replaces
the personal Gmail as the contact-form target and is displayed on the site.

## Decisions (agreed)

- **Shared coupon code CLUB10** (percent, 10, no expiry/min/max) seeded via
  `scripts/create-club-coupon.mjs`. Reuses the existing coupon system as-is.
- **The popup is managed in the Flashy dashboard** (owner decision, revised
  from an initial custom-coded popup): the site embeds Flashy's pixel
  (thunder.js), which renders whatever popup is configured in Flashy. The
  owner controls copy, design, timing and targeting without deploys.
- **Welcome email is a Flashy automation** (trigger: joined the list via the
  popup), built in the Flashy email editor with the CLUB10 code.
- **Abandonment reminder is a Flashy dashboard automation**. The site emits
  events; the automation does the 24h wait, Purchase exit condition, and the
  reminder email.
- Club list: Flashy "Main List", id 38818.

## Architecture

### Flashy site pixel - `src/components/FlashyTracking.tsx`

Loads thunder.js with the numeric account id (`NEXT_PUBLIC_FLASHY_ACCOUNT_ID`,
13437 - Flashy rejects non-numeric ids). Consent-gated exactly like
MetaPixel/GoogleAnalytics (opt-out model, `'consent-changed'` listener), fires
PageView on SPA navigations. This script is what fetches and renders the
dashboard-managed popups (`api.flashy.app/thunder/popups`).

### Client events - `src/lib/flashy-pixel.ts`

Safe wrapper over `window.flashy` (no-ops when absent or tracking declined):

- `flashyAddToCart` - fired from `CartProvider.addItem`/`addItems` for every
  visitor; Flashy ties anonymous activity to the contact once identified.
- `flashyIdentify` - `flashy('setCustomer', {email})` at checkout submit, so
  browser activity and popup targeting attach to the right contact.

### Server events - `src/lib/flashy.ts` (REST, fail-soft)

`sendEvent` never throws and no-ops without `FLASHY_API_KEY`, so Flashy can
never break checkout or payment:

| Event | Where |
|---|---|
| `InitiateCheckout` | `/api/checkout` after the order INSERT (email known) |
| `Purchase` | both PENDING->PAID winner blocks (verify + IPN) via `src/lib/flashy-purchase.ts` - exactly once per order, the automation exit condition |

### Privacy

`/privacy` documents the mailing section, Flashy as processor, and Flashy's
cookies (`anonymous_id`, `flashy_attribution` - verified in the browser).
Joining the club through the popup is the explicit mailing consent; declining
the cookie banner removes the pixel (and with it the popup).

## Env vars

`NEXT_PUBLIC_FLASHY_ACCOUNT_ID` (13437, numeric only), `FLASHY_API_KEY`
(secret, server events). `FLASHY_CLUB_LIST_ID` / `FLASHY_FROM_EMAIL` /
`FLASHY_FROM_NAME` remain set in Vercel but are currently unused by code
(kept for future transactional sends).

## Out of scope

- Per-member unique coupon codes and per-customer usage limits.
- SMS (account has no credits).
- A local subscribers table - Flashy is the single source of truth.
- Rate limiting infrastructure (recommended: Vercel WAF rule if custom club
  endpoints ever return).

## Manual owner setup (required before launch)

1. Create the hello@kidcode.org.il mailbox/forwarding at the domain provider.
2. Flashy: authenticate the kidcode.org.il sending domain (DKIM/SPF DNS
   records) and approve hello@ as a sender.
3. Build the signup popup in the Flashy dashboard (offer: 10% off first order,
   joins list 38818).
4. Build the welcome automation: trigger = joined the list -> send email with
   the CLUB10 code.
5. Build the abandoned-cart automation: event trigger AddToCart (and/or
   InitiateCheckout) -> wait 24h -> exit on Purchase -> send reminder email.
   Limit re-entry (e.g. once per 7 days). Consider restricting sends to
   club-list members (Israeli spam law).
6. Activate formsubmit for hello@ (first contact-form submission sends a
   one-time confirmation link).
