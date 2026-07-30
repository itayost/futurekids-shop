// Fixed-window rate limiting counters (per scope+IP), backing
// src/lib/rate-limit.ts. Rows are pruned by the hourly cron. Idempotent.
// Run: node --env-file=.env.local scripts/create-rate-limits-table.mjs
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL not set');
const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS rate_limits (
    key text PRIMARY KEY,
    window_start timestamptz NOT NULL,
    count integer NOT NULL
  )
`;

console.log('rate_limits table ready');
