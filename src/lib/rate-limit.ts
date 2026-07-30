import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';

// Postgres-backed fixed-window rate limiter (no extra infrastructure; volumes
// here are tiny). Fail-open: a DB hiccup must never lock customers out of
// signup, so errors count as allowed.

export function clientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function rateLimitAllows(params: {
  scope: string;
  ip: string;
  limit: number;
  windowSeconds: number;
}): Promise<boolean> {
  const key = `${params.scope}:${params.ip}`;
  try {
    const rows = await sql`
      INSERT INTO rate_limits (key, window_start, count)
      VALUES (${key}, NOW(), 1)
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN rate_limits.window_start < NOW() - make_interval(secs => ${params.windowSeconds})
          THEN 1 ELSE rate_limits.count + 1
        END,
        window_start = CASE
          WHEN rate_limits.window_start < NOW() - make_interval(secs => ${params.windowSeconds})
          THEN NOW() ELSE rate_limits.window_start
        END
      RETURNING count
    `;
    return Number(rows[0]?.count) <= params.limit;
  } catch (error) {
    console.error('Rate limit check failed (allowing):', error);
    return true;
  }
}
