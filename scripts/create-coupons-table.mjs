import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL not set');
const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS coupons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    discount_type text NOT NULL,
    discount_value numeric NOT NULL,
    min_subtotal numeric,
    max_uses integer,
    used_count integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    expires_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
  )
`;
await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code text`;
await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount numeric NOT NULL DEFAULT 0`;

console.log('coupons table + orders columns ready');
