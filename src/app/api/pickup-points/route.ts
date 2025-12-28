import { NextResponse } from 'next/server';
import { PickupPoint } from '@/types';

// Use Next.js route segment config for caching (1 hour)
export const revalidate = 3600;

const CHITA_API_URL = 'https://chita-il.com/RunCom.Server/WsSpotsList.aspx?PRGNAME=ws_spotslist&ARGUMENTS=-Aall';

function parseXmlToPickupPoints(xmlText: string): PickupPoint[] {
  const points: PickupPoint[] = [];

  // Extract all spot_detail blocks
  const spotRegex = /<spot_detail>([\s\S]*?)<\/spot_detail>/g;
  let match;

  while ((match = spotRegex.exec(xmlText)) !== null) {
    const spotXml = match[1];

    // Extract CDATA content for each field
    const extractField = (fieldName: string): string => {
      const regex = new RegExp(`<${fieldName}><!\\[CDATA\\[([^\\]]*?)\\]\\]><\\/${fieldName}>`);
      const fieldMatch = spotXml.match(regex);
      return fieldMatch ? fieldMatch[1].trim() : '';
    };

    const mesirotYn = extractField('mesirot_yn');
    // Only include points that accept deliveries
    if (mesirotYn !== 'y') continue;

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

    // Skip if missing essential fields
    if (point.code && point.name && point.city) {
      points.push(point);
    }
  }

  return points;
}

async function fetchPickupPoints(): Promise<PickupPoint[]> {
  const response = await fetch(CHITA_API_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch pickup points');
  }

  const xmlText = await response.text();
  return parseXmlToPickupPoints(xmlText);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city')?.toLowerCase();

    const allPoints = await fetchPickupPoints();

    // If city filter provided, filter points
    if (city) {
      const filteredPoints = allPoints.filter(
        (point) => point.city.toLowerCase().includes(city)
      );
      return NextResponse.json(filteredPoints);
    }

    // Return unique cities for autocomplete
    const cities = [...new Set(allPoints.map((p) => p.city))].sort();

    return NextResponse.json({ cities, points: allPoints });
  } catch (error) {
    console.error('Error fetching pickup points:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pickup points' },
      { status: 500 }
    );
  }
}
