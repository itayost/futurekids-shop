# Members Club - Design (self-hosted)

Date: 2026-07-30 (v3: fully self-hosted; v2 was Flashy-managed, v1 hybrid - both replaced same day by owner decision: Flashy free tier caps at 250 contacts, $40+/mo after)
Status: Approved

## Context / Problem

The shop had no email marketing. Wanted: (1) site-entry popup offering
members-club signup with 10% off, (2) welcome email with a coupon code,
(3) cart-abandonment reminder 24h later. Plus a public contact address
hello@kidcode.org.il (contact form target + shown on site).

Decision: no third-party marketing platform. Everything runs in this repo:
our popup, a `club_members` Postgres table, **Resend** for delivery (a
direct resend.com account - NOT the Vercel Marketplace integration, which
installs at the team level; the owner wanted strictly project-scoped setup),
and a **Vercel Cron** reading abandoned orders. Research notes: sending
through the Google Workspace mailbox itself was researched and rejected -
it stakes the business mailbox/domain reputation on marketing complaints,
App Passwords grant full mailbox access, and Gmail throttles automated
sending; pure "code-level" sending is impossible from Vercel (port 25
blocked, no sending IP reputation).

## Architecture

### Signup popup - `src/components/ClubPopup.tsx` + `src/lib/club-popup.ts`

Mounted in the root layout. Waits for the cookie banner to be answered
(`'consent-changed'`), then a 6s timer; localStorage key `club_popup`
(`dismissed` re-shows after 14 days, `joined` never); excluded paths
`/checkout`, `/payment`, `/success`, `/admin`; z-[80]; honeypot field;
success step shows a copyable CLUB10. Fires Meta pixel `Lead`
(consent-gated). Pure logic unit-tested in `club-popup.test.ts`.

### Data - `club_members` (script `scripts/create-club-members-table.mjs`)

`id, email UNIQUE, first_name, created_at, unsubscribed_at`. Doubles as the
suppression list: unsubscribed non-members (reminder recipients) get a row
with `unsubscribed_at` set. Plus `orders.reminder_sent_at` for the cron.

### Email - `src/lib/email.ts` (Resend REST, native fetch, no SDK)

Fail-soft (meta-capi.ts conventions): never throws, returns false, logs
without PII. Sends with `List-Unsubscribe` + one-click headers. Builders
(pure, tested): `src/lib/welcome-email.ts` (CLUB10 welcome) and
`src/lib/cart-reminder-email.ts` (item list + total + CLUB10 tip), both
table-based inline-styled RTL in the brand language.

### Unsubscribe - `src/lib/unsubscribe.ts` + `GET|POST /api/club/unsubscribe`

Stateless HMAC-signed links (`UNSUBSCRIBE_SECRET`, timing-safe verify):
`?e=<base64url(email)>&t=<hmac>` - no token rows; same format for members
and one-off reminder recipients. Route upserts `unsubscribed_at` and
returns a Hebrew RTL confirmation page; POST supports RFC 8058 one-click.
Re-subscribing through the popup clears the flag (explicit re-consent).

### Signup - `POST /api/club/subscribe`

Honeypot -> silent 200; validation -> Hebrew 400s; active member ->
`{alreadyMember: true}` with no resend; else upsert + await welcome email
(send failure still returns success - the popup shows the code on screen).

### Abandoned-cart reminder - `GET /api/cron/cart-reminders` + `vercel.json`

Hourly Vercel Cron (`CRON_SECRET` Bearer). A checkout attempt = an order in
`PENDING`/`FAILED`; reminder when it is 24h-7d old. Latest order per email
(`DISTINCT ON`), excludes emails with a later `PAID` order and suppressed
emails. Atomic claim (`UPDATE ... WHERE reminder_sent_at IS NULL RETURNING`)
prevents double-sends across overlapping runs; a post-claim send failure
loses the reminder (preferred over duplicates). Cap 50/run.

No marketing events are sent anywhere - the cron reads the DB directly.
Meta pixel/CAPI tracking is unchanged.

### Member cart snapshots (pre-checkout abandonment)

Identified club members also get reminders for carts that never reached
checkout. `CartProvider` debounce-syncs cart changes to `POST /api/club/cart`
(guest = silent no-op; localStorage last-synced guard avoids redundant
writes; `ClubPopup` force-syncs right after joining). The route re-resolves
names/prices from the catalog (`src/lib/cart-snapshot.ts` - deterministic
merged/sorted items, bundle discount applied) and upserts `member_carts`
(email PK, items jsonb, total, updated_at, reminder_sent_at) - `updated_at`
and `reminder_sent_at` move ONLY when contents actually changed
(`IS DISTINCT FROM`), so visiting neither resets the idle clock nor re-arms.
Non-members receive `{success:true}` no-op (no membership oracle). Cron phase
2 mails carts idle 24h-7d, max one reminder per 7 days, excluding anyone with
an orders row created after the cart's last change (the order path owns
them; all order-email comparisons use LOWER()). Snapshots are deleted on
purchase (both PENDING->PAID winner blocks via
`clearMemberCartForOrder`) and on unsubscribe.

## Env vars

`RESEND_API_KEY` (sending-only key from the direct resend.com account),
`EMAIL_FROM=hello@kidcode.org.il`, `EMAIL_FROM_NAME`, `UNSUBSCRIBE_SECRET`,
`CRON_SECRET` (Vercel sends it as Bearer on cron invocations).

## Out of scope

Per-member unique coupon codes; SMS; campaign/newsletter sending (if ever
needed: export `club_members` to any ESP, or Resend Broadcasts); admin UI
for the members list.

## Manual owner steps

1. Create a free resend.com account, add the kidcode.org.il domain (DNS
   DKIM/SPF records), create a sending-only API key, and set it as
   `RESEND_API_KEY` in `.env.local` + Vercel (project env only).
2. Confirm the hello@kidcode.org.il Workspace mailbox receives mail (it is
   the reply-to/contact address; Resend does the sending).
3. Activate formsubmit for hello@ (first contact-form submission sends a
   one-time confirmation link).
