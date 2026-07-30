# Members Club (Flashy) - Design

Date: 2026-07-30
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
- **Welcome email is sent from our server** through Flashy's transactional API
  (`POST /messages/email`) with inline RTL HTML - deterministic, no dashboard
  dependency. Sender: hello@kidcode.org.il (requires one-time domain
  authentication in Flashy).
- **Abandonment reminder is a Flashy dashboard automation** (owner decision).
  The site's job is to emit Flashy events; the automation does the 24h wait,
  Purchase exit condition, and the reminder email.
- Club list: Flashy "Main List", id 38818 (configurable via
  `FLASHY_CLUB_LIST_ID`).

## Architecture

### Flashy client - `src/lib/flashy.ts`

Server-only, fail-soft: never throws, logs and returns null/false on any
failure, no-ops without `FLASHY_API_KEY`. Flashy can therefore never break
checkout or payment. Functions: `getContact`, `isInClubList`,
`upsertClubContact`, `sendTransactionalEmail`, `sendEvent`.

### Signup flow

`ClubPopup.tsx` (mounted in the root layout) -> `POST /api/club/subscribe` ->
Flashy contact upsert onto the club list -> welcome email
(`src/lib/flashy-welcome-email.ts`). Idempotent: an address already on the list
gets `alreadyMember: true` and no second email. Honeypot field (`website`) for
bots; strict validation; Hebrew soft-error messages.

### Popup behavior - `src/lib/club-popup.ts` (pure) + `ClubPopup.tsx`

- localStorage key `club_popup`: `{status: 'dismissed'|'joined', ts, email?}`.
- Dismissed re-shows after 14 days; joined never shows again.
- Excluded paths: `/checkout`, `/payment`, `/success`, `/admin`.
- Never on screen with the cookie banner: waits for `'consent-changed'` (or
  consent already answered), then a 6s timer. z-[80], above the banner.
- Success step shows CLUB10 with copy-to-clipboard, so a lost email is
  non-fatal. Fires the Meta pixel `Lead` event (consent-gated).

### Events feeding the abandonment automation

| Event | Where | Who |
|---|---|---|
| `AddToCart` | client -> `POST /api/club/event` proxy -> Flashy | identified club members only |
| `InitiateCheckout` | server, `/api/checkout` after order INSERT | every checkout starter (email known) |
| `Purchase` | server, both PENDING->PAID winner blocks (verify + IPN), via `src/lib/flashy-purchase.ts` | every paid order - the automation exit condition |

`/api/club/event` whitelists exactly one event name and requires the email to
already be a club member in Flashy (`getContact` gate) - otherwise the open
proxy could be used to create contacts or trigger automation emails to
arbitrary addresses.

### Privacy

`/privacy` gained a mailing section (data collected, Flashy as processor,
unsubscribe), the `club_popup` storage entry, and Flashy in the third-parties
list. Joining the club through the form is the explicit mailing consent
(separate from the analytics cookie consent).

## Env vars

`FLASHY_API_KEY` (secret), `FLASHY_CLUB_LIST_ID`, `FLASHY_FROM_EMAIL`,
`FLASHY_FROM_NAME`.

## Out of scope

- Per-member unique coupon codes and per-customer usage limits.
- SMS (account has no credits).
- A local subscribers table - Flashy is the single source of truth.
- Rate limiting infrastructure (recommended: Vercel WAF rule on `/api/club/*`).

## Manual owner setup (required before launch)

1. Create the hello@kidcode.org.il mailbox/forwarding at the domain provider.
2. Flashy: authenticate the kidcode.org.il sending domain (DKIM/SPF DNS
   records) and approve hello@ as a sender.
3. Build the abandoned-cart automation in the Flashy dashboard: event trigger
   AddToCart (and/or InitiateCheckout) -> wait 24h -> exit on Purchase -> send
   reminder email. Limit re-entry (e.g. once per 7 days). Consider restricting
   sends to club-list members (Israeli spam law).
4. Activate formsubmit for hello@ (first contact-form submission sends a
   one-time confirmation link).
5. Set the four env vars in Vercel (Production + Preview).
