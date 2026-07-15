import type { PickupPoint } from '@/types';

export interface ExportOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface ExportOrder {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  shipping_method: string | null;
  pickup_point_code: string | null;
  pickup_point_name: string | null;
  items: ExportOrderItem[];
}

// Chita column headers, verbatim — 15 real fields interleaved with literal ^
// separator columns (which must never be removed).
const HEADER =
  "שם,^,קוד ישוב,^,שם ישוב,^,קוד רחוב,^,שם רחוב,^,בית,^,כניסה,^,קומה,^,דירה,^,טלפון ראשי,^,טלפון משני,^,אס' לקוח,^,אריזות,^,הערות מקור או יעד,^,הערות משלוח";

// Split a free-text address into street name (no number) and house number.
// Handles "בני ברית 2" -> {בני ברית, 2}, "רמז 12א" -> {רמז, 12א}.
// Drops anything after a comma (e.g. ", דירה 1") since apt fields stay empty.
export function parseStreetAndHouse(address: string): { street: string; house: string } {
  const primary = (address || '').split(',')[0].trim();
  const match = primary.match(/^(.*\S)\s+(\d+\s*[א-תa-zA-Z]?)\s*$/);
  if (match) {
    return { street: match[1].trim(), house: match[2].replace(/\s+/g, '') };
  }
  return { street: primary, house: '' };
}

// Short Hebrew summary of order contents, e.g. "3 ספרים + 3 חוברות".
export function contentsSummary(items: ExportOrderItem[]): string {
  let books = 0;
  let workbooks = 0;
  for (const item of items || []) {
    const isWorkbook =
      /workbook/i.test(item.productId) || (item.productName || '').includes('חוברת');
    if (isWorkbook) workbooks += item.quantity;
    else books += item.quantity;
  }
  const parts: string[] = [];
  if (books > 0) parts.push(`${books} ${books === 1 ? 'ספר' : 'ספרים'}`);
  if (workbooks > 0) parts.push(`${workbooks} ${workbooks === 1 ? 'חוברת' : 'חוברות'}`);
  return parts.join(' + ');
}

// RFC4180-style escaping: quote a field only if it contains comma/quote/newline.
function csvField(value: string): string {
  const v = value ?? '';
  if (/[",\r\n]/.test(v)) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}

// Interleave the literal ^ separator column between each real field.
function buildRow(fields: string[]): string {
  const cells: string[] = [];
  fields.forEach((field, index) => {
    cells.push(csvField(field));
    if (index < fields.length - 1) cells.push('^');
  });
  return cells.join(',');
}

export function buildChitaCsv(
  orders: ExportOrder[],
  type: 'delivery' | 'pickup-point',
  pointsByCode: Map<string, PickupPoint>
): string {
  const rows: string[] = [HEADER];

  for (const order of orders) {
    const name = `${order.first_name} ${order.last_name}`.trim();
    let cityName = '';
    let streetName = '';
    let house = '';
    let notes = contentsSummary(order.items);

    if (type === 'delivery') {
      cityName = order.city || '';
      const parsed = parseStreetAndHouse(order.address || '');
      streetName = parsed.street;
      house = parsed.house;
    } else {
      // pickup-point: the parcel goes to the distribution point, so use the
      // point's own address (looked up by code from Chita).
      const point = order.pickup_point_code
        ? pointsByCode.get(order.pickup_point_code)
        : undefined;
      if (point) {
        cityName = point.city || '';
        streetName = point.street || '';
        house = point.house || '';
      } else {
        // Fallback: don't lose the point identity if the lookup failed.
        const label = order.pickup_point_name || order.pickup_point_code || '';
        if (label) notes = notes ? `${notes} | נקודה: ${label}` : `נקודה: ${label}`;
      }
    }

    // Field order matches HEADER (^ columns inserted by buildRow):
    // שם, קוד ישוב, שם ישוב, קוד רחוב, שם רחוב, בית, כניסה, קומה, דירה,
    // טלפון ראשי, טלפון משני, אס' לקוח, אריזות, הערות מקור או יעד, הערות משלוח
    const fields = [
      name,
      '', // קוד ישוב — always empty
      cityName,
      '', // קוד רחוב — always empty
      streetName,
      house,
      '', // כניסה
      '', // קומה
      '', // דירה
      order.phone || '',
      '', // טלפון משני
      '', // אס' לקוח
      '', // אריזות
      '', // הערות מקור או יעד
      notes,
    ];
    rows.push(buildRow(fields));
  }

  // CRLF line endings, trailing newline, to match the courier's format.
  return rows.join('\r\n') + '\r\n';
}
