import type { PickupPoint } from '@/types';

const CHITA_API_URL =
  'https://chita-il.com/RunCom.Server/WsSpotsList.aspx?PRGNAME=ws_spotslist&ARGUMENTS=-Aall';

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

export async function fetchPickupPoints(): Promise<PickupPoint[]> {
  const response = await fetch(CHITA_API_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch pickup points');
  }

  const xmlText = await response.text();
  return parseXmlToPickupPoints(xmlText);
}
