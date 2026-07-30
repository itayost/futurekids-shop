// Members-club contacts table (also serves as the email suppression list:
// unsubscribed reminder recipients get a row with unsubscribed_at set), plus
// the abandoned-cart reminder flag on orders. Idempotent.
// Run: node --env-file=.env.local scripts/create-club-members-table.mjs
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL not set');
const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS club_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    first_name text,
    created_at timestamptz NOT NULL DEFAULT now(),
    unsubscribed_at timestamptz,
    welcome_sent_at timestamptz
  )
`;
await sql`ALTER TABLE club_members ADD COLUMN IF NOT EXISTS welcome_sent_at timestamptz`;
await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz`;

console.log('club_members table + orders.reminder_sent_at ready');
