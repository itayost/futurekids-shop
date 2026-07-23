import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL not set');
const sql = neon(url);

await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS street text`;
await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS house_number text`;
await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS apartment text`;

console.log('orders address columns ready');
