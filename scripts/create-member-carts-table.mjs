// Cart snapshots for identified club members, powering pre-checkout
// abandoned-cart reminders. One row per member email; updated_at moves only
// when the cart contents change. Idempotent.
// Run: node --env-file=.env.local scripts/create-member-carts-table.mjs
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL not set');
const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS member_carts (
    email text PRIMARY KEY,
    items jsonb NOT NULL,
    total numeric NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    reminder_sent_at timestamptz
  )
`;

console.log('member_carts table ready');
