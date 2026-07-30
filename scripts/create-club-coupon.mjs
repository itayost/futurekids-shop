// Seeds the shared members-club coupon (10% off). Idempotent.
// Run: node --env-file=.env.local scripts/create-club-coupon.mjs
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL not set');
const sql = neon(url);

const result = await sql`
  INSERT INTO coupons (code, discount_type, discount_value, active)
  VALUES ('CLUB10', 'percent', 10, true)
  ON CONFLICT (code) DO NOTHING
  RETURNING code
`;

console.log(result.length > 0 ? 'CLUB10 coupon created' : 'CLUB10 coupon already exists');
