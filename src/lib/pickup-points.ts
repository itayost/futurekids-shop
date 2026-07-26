import type { PickupPoint } from '@/types';
import { sql } from '@/lib/db';

const CHITA_API_URL =
  'https://chita-il.com/RunCom.Server/WsSpotsList.aspx?PRGNAME=ws_spotslist&ARGUMENTS=-Aall';

const FETCH_TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 2;

export function parseXmlToPickupPoints(xmlText: string): PickupPoint[] {
  const points: PickupPoint[] = [];

  const spotRegex = /<spot_detail>([\s\S]*?)<\/spot_detail>/g;
  let match;

  while ((match = spotRegex.exec(xmlText)) !== null) {
    const spotXml = match[1];

    const extractField = (fieldName: string): string => {
      const regex = new RegExp(`<${fieldName}><!\\[CDATA\\[([^\\]]*?)\\]\\]><\\/${fieldName}>`);
      const fieldMatch = spotXml.match(regex);
      return fieldMatch ? fieldMatch[1].trim() : '';
    };

    // Only include points that accept deliveries
    if (extractField('mesirot_yn') !== 'y') continue;

    const point: PickupPoint = {
      code: extractField('n_code'),
      name: extractField('name'),
      city: extractField('city'),
      street: extractField('street'),
      house: extractField('house'),
      remarks: extractField('remarks'),
      latitude: extractField('latitude'),
      longitude: extractField('longitude'),
    };

    if (point.code && point.name && point.city) {
      points.push(point);
    }
  }

  return points;
}

async function fetchOnce(): Promise<PickupPoint[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(CHITA_API_URL, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Chita API responded with status ${response.status}`);
    }

    const xmlText = await response.text();
    return parseXmlToPickupPoints(xmlText);
  } finally {
    clearTimeout(timeout);
  }
}

// Fetch live from Chita with a timeout and one retry. Throws on failure.
export async function fetchPickupPoints(): Promise<PickupPoint[]> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fetchOnce();
    } catch (error) {
      lastError = error;
      console.error(`Chita fetch attempt ${attempt}/${MAX_ATTEMPTS} failed:`, error);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Failed to fetch pickup points');
}

// Persist the latest successful fetch as a single-row JSONB backup.
export async function savePickupPointsToCache(points: PickupPoint[]): Promise<void> {
  await sql`
    INSERT INTO pickup_points_cache (id, points, updated_at)
    VALUES (1, ${JSON.stringify(points)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE
      SET points = EXCLUDED.points, updated_at = now()
  `;
}

// Read the backup. Returns [] when the cache has never been populated.
export async function getCachedPickupPoints(): Promise<PickupPoint[]> {
  const rows = await sql`SELECT points FROM pickup_points_cache WHERE id = 1`;
  const cached = rows[0]?.points;
  return Array.isArray(cached) ? (cached as PickupPoint[]) : [];
}

// Resilient accessor: live Chita when available, DB backup otherwise.
export async function getPickupPoints(): Promise<PickupPoint[]> {
  try {
    const points = await fetchPickupPoints();

    // An empty result means Chita is effectively broken - fall back.
    if (points.length === 0) {
      console.error('Chita returned an empty list, falling back to cached pickup points');
      return getCachedPickupPoints();
    }

    // Refresh the backup on every successful fetch (fire-and-forget on write error).
    try {
      await savePickupPointsToCache(points);
    } catch (cacheError) {
      console.error('Failed to update pickup points cache:', cacheError);
    }

    return points;
  } catch (error) {
    console.error('Chita fetch failed, falling back to cached pickup points:', error);
    return getCachedPickupPoints();
  }
}
