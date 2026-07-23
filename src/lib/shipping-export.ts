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
  street: string | null;
  house_number: string | null;
  apartment: string | null;
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

// Short names per title, matching the shorthand used on the packing side
// (e.g. "אלגו ס+ח" = ספר + חוברת של אלגוריתמים).
const TITLE_SHORT: Record<string, string> = {
  ai: 'בינה',
  encryption: 'הצפנה',
  algorithms: 'אלגו',
};

// Per-title Hebrew shorthand of order contents, e.g. "אלגו ס+ח" or
// "בינה 2ס+2ח, הצפנה ס". ס = ספר, ח = חוברת; count prefix omitted when 1.
export function contentsSummary(items: ExportOrderItem[]): string {
  const byTitle = new Map<string, { books: number; workbooks: number }>();

  for (const item of items || []) {
    const isWorkbook =
      /workbook/i.test(item.productId) || (item.productName || '').includes('חוברת');
    const key = (item.productId || '').replace(/-(book|workbook)$/i, '');
    const label = TITLE_SHORT[key] || item.productName || item.productId || '?';
    const entry = byTitle.get(label) || { books: 0, workbooks: 0 };
    byTitle.set(label, {
      books: entry.books + (isWorkbook ? 0 : item.quantity),
      workbooks: entry.workbooks + (isWorkbook ? item.quantity : 0),
    });
  }

  const parts: string[] = [];
  for (const [label, { books, workbooks }] of byTitle) {
    const units: string[] = [];
    if (books > 0) units.push(`${books > 1 ? books : ''}ס`);
    if (workbooks > 0) units.push(`${workbooks > 1 ? workbooks : ''}ח`);
    if (units.length > 0) parts.push(`${label} ${units.join('+')}`);
  }
  return parts.join(', ');
}

// Format a phone with a hyphen (050-1234567) so Excel treats it as text and
// keeps the leading 0 instead of coercing it to a number.
export function formatPhone(phone: string): string {
  let digits = (phone || '').replace(/\D/g, '');
  if (digits.startsWith('972')) digits = '0' + digits.slice(3);
  if (digits.length === 9 && digits.startsWith('5')) digits = '0' + digits;
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  if (digits.length === 9 && digits.startsWith('0')) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  return phone || '';
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
    let apartment = '';
    let notes = contentsSummary(order.items);

    if (type === 'delivery') {
      cityName = order.city || '';
      if (order.street) {
        // Structured address columns (checkout collects street/house/apartment
        // separately since mid-2026).
        streetName = order.street;
        house = order.house_number || '';
        apartment = order.apartment || '';
      } else {
        // Legacy orders: only the free-text address column exists.
        const parsed = parseStreetAndHouse(order.address || '');
        streetName = parsed.street;
        house = parsed.house;
      }
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
      apartment, // דירה
      formatPhone(order.phone),
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
