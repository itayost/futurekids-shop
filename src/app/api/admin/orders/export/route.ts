import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { fetchPickupPoints } from '@/lib/pickup-points';
import { buildChitaCsv } from '@/lib/shipping-export';
import type { ExportOrder } from '@/lib/shipping-export';
import type { PickupPoint } from '@/types';

export async function GET(request: NextRequest) {
  // Admin auth (mirrors /api/admin/auth GET)
  const session = (await cookies()).get('admin_session');
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const type = new URL(request.url).searchParams.get('type');
  if (type !== 'delivery' && type !== 'pickup-point') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  try {
    // Only PAID orders need shipping labels created.
    const rows = await sql`
      SELECT o.id, o.first_name, o.last_name, o.phone, o.address, o.city,
             o.street, o.house_number, o.apartment,
             o.shipping_method, o.pickup_point_code, o.pickup_point_name,
             COALESCE(
               json_agg(json_build_object(
                 'productId', oi.product_id,
                 'productName', oi.product_name,
                 'quantity', oi.quantity,
                 'price', oi.price
               )) FILTER (WHERE oi.id IS NOT NULL),
               '[]'::json
             ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.shipping_method = ${type} AND o.status = 'PAID'
      GROUP BY o.id
      ORDER BY o.created_at ASC
    `;

    const orders = rows as unknown as ExportOrder[];

    // For pickup orders, resolve each point's address by its Chita code.
    let pointsByCode = new Map<string, PickupPoint>();
    if (type === 'pickup-point' && orders.length > 0) {
      try {
        const points = await fetchPickupPoints();
        pointsByCode = new Map(points.map((p) => [p.code, p]));
      } catch (error) {
        console.error('Failed to fetch pickup points for export:', error);
      }
    }

    const csv = buildChitaCsv(orders, type, pointsByCode);

    const label = type === 'delivery' ? 'home' : 'pickup';
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="chita-${label}-${date}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Shipping export error:', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}
