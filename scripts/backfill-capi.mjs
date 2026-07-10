// One-off backfill: resend Meta CAPI Purchase events for already-PAID orders.
//
// Why this exists: for a stretch of orders the server-side CAPI event never
// fired (browser verify path won the PENDING->PAID race and broke the IPN
// lookup), so Meta undercounted purchases. Every event uses event_id = order.id
// and Meta deduplicates on event_id + event_name, so resending every PAID order
// in the window is idempotent: already-counted orders are dropped, missing ones
// are added. Run within ~48h of the purchases (dedup window) and within 7 days
// (CAPI rejects older events).
//
// Usage:
//   vercel env pull .env.local
//   node --env-file=.env.local scripts/backfill-capi.mjs                 # dry run
//   node --env-file=.env.local scripts/backfill-capi.mjs --send          # resend
//   node --env-file=.env.local scripts/backfill-capi.mjs --from=2026-07-08 --to=2026-07-11
//   node --env-file=.env.local scripts/backfill-capi.mjs --id=<order-uuid> --send
//
// This script only mirrors src/lib/meta-capi.ts; it does not import or touch any
// live code. The one deliberate difference: event_time is the real order time
// (not "now") so the campaign-day report lines up.

import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;

const missing = [
  ['DATABASE_URL', DATABASE_URL],
  ['NEXT_PUBLIC_META_PIXEL_ID', PIXEL_ID],
  ['META_CAPI_ACCESS_TOKEN', ACCESS_TOKEN],
]
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length > 0) {
  console.error(`Missing env vars: ${missing.join(', ')}`);
  console.error('Run `vercel env pull .env.local` then re-run with `node --env-file=.env.local`.');
  process.exit(1);
}

// ---- CLI args --------------------------------------------------------------

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};

const SEND = flag('send');
const ONLY_ID = opt('id');

const DAY_MS = 24 * 60 * 60 * 1000;
const from = opt('from') ? new Date(`${opt('from')}T00:00:00Z`) : new Date(Date.now() - 4 * DAY_MS);
const to = opt('to') ? new Date(`${opt('to')}T23:59:59Z`) : new Date();

// ---- Meta payload helpers (mirror of src/lib/meta-capi.ts) -----------------

const CAPI_URL = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`;

function sha256(value) {
  return crypto.createHash('sha256').update(String(value).toLowerCase().trim()).digest('hex');
}

function normalizePhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('0')) return '972' + digits.slice(1);
  if (digits.startsWith('972')) return digits;
  return digits;
}

function buildUserData(o) {
  const userData = { country: sha256('il') };
  if (o.email) userData.em = sha256(o.email);
  if (o.phone) userData.ph = sha256(normalizePhone(o.phone));
  if (o.first_name) userData.fn = sha256(o.first_name);
  if (o.last_name) userData.ln = sha256(o.last_name);
  if (o.city) userData.ct = sha256(o.city);
  if (o.fb_click_id) userData.fbc = o.fb_click_id;
  if (o.fb_browser_id) userData.fbp = o.fb_browser_id;
  if (o.client_ip) userData.client_ip_address = o.client_ip;
  if (o.client_ua) userData.client_user_agent = o.client_ua;
  return userData;
}

function buildPayload(o, items) {
  return {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(new Date(o.event_at).getTime() / 1000),
        event_id: o.id,
        event_source_url: 'https://www.kidcode.org.il/payment/success',
        action_source: 'website',
        user_data: buildUserData(o),
        custom_data: {
          value: parseFloat(o.total),
          currency: 'ILS',
          content_ids: items.map((i) => i.product_id),
          contents: items.map((i) => ({ id: i.product_id, quantity: Number(i.quantity) })),
          content_type: 'product',
          num_items: items.reduce((sum, i) => sum + Number(i.quantity), 0),
        },
      },
    ],
    access_token: ACCESS_TOKEN,
  };
}

async function sendOne(o, items) {
  const response = await fetch(CAPI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildPayload(o, items)),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(`Graph API ${response.status}: ${JSON.stringify(result)}`);
  }
  return result;
}

// ---- Main ------------------------------------------------------------------

const sql = neon(DATABASE_URL);

function fmtTime(d) {
  return new Date(d).toISOString().replace('T', ' ').slice(0, 16);
}

async function main() {
  const orders = ONLY_ID
    ? await sql`
        SELECT o.id, o.email, o.first_name, o.last_name, o.phone, o.city, o.total,
               o.fb_click_id, o.fb_browser_id, o.client_ip, o.client_ua,
               COALESCE(o.paid_at, o.created_at) AS event_at
        FROM orders o
        WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED') AND o.id = ${ONLY_ID}
      `
    : await sql`
        SELECT o.id, o.email, o.first_name, o.last_name, o.phone, o.city, o.total,
               o.fb_click_id, o.fb_browser_id, o.client_ip, o.client_ua,
               COALESCE(o.paid_at, o.created_at) AS event_at
        FROM orders o
        WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
          AND COALESCE(o.paid_at, o.created_at) BETWEEN ${from.toISOString()} AND ${to.toISOString()}
        ORDER BY event_at
      `;

  const scope = ONLY_ID ? `order ${ONLY_ID}` : `${fmtTime(from)} .. ${fmtTime(to)} UTC`;
  console.log(`\nMode: ${SEND ? 'SEND' : 'DRY RUN'}   Scope: ${scope}`);
  console.log(`Paid orders found (PAID/SHIPPED/DELIVERED): ${orders.length}\n`);

  if (orders.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  let sent = 0;
  let failed = 0;

  for (const o of orders) {
    const items = await sql`
      SELECT product_id, quantity FROM order_items WHERE order_id = ${o.id}
    `;
    const itemCount = items.reduce((sum, i) => sum + Number(i.quantity), 0);
    const line = `${fmtTime(o.event_at)}  ${String(o.total).padStart(8)} ILS  ${String(itemCount).padStart(2)} items  ${o.email}  ${o.id}`;

    if (!SEND) {
      console.log('  ' + line);
      continue;
    }

    try {
      const result = await sendOne(o, items);
      sent++;
      console.log(`  OK   received=${result.events_received}  ${line}`);
    } catch (err) {
      failed++;
      console.error(`  FAIL ${err instanceof Error ? err.message : String(err)}  ${line}`);
    }
  }

  if (!SEND) {
    console.log(`\nDry run only. Re-run with --send to resend these ${orders.length} order(s) to CAPI.`);
    console.log('Meta deduplicates on event_id, so already-counted orders are dropped automatically.');
  } else {
    console.log(`\nDone. Sent: ${sent}   Failed: ${failed}`);
  }
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
