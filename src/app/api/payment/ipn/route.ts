import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// IPN (Instant Payment Notification) handler
// iCount calls this endpoint server-to-server when payment is completed
export async function POST(request: NextRequest) {
  try {
    // iCount sends data as form-urlencoded or JSON
    const contentType = request.headers.get('content-type') || '';

    let payload: Record<string, string>;

    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      // Handle form-urlencoded
      const formData = await request.formData();
      payload = Object.fromEntries(formData.entries()) as Record<string, string>;
    }

    console.log('IPN received:', JSON.stringify(payload, null, 2));

    // Extract relevant fields from IPN
    const saleUniqid = payload.sale_uniqid || payload.uniqid;
    const docId = payload.doc_id;
    const docNumber = payload.doc_number;
    const status = payload.status;
    const confirmationCode = payload.confirmation_code;

    if (!saleUniqid) {
      console.error('IPN missing sale_uniqid');
      return NextResponse.json({ error: 'Missing sale_uniqid' }, { status: 400 });
    }

    // Find order by sale_uniqid (stored in icount_doc_id during checkout)
    const orders = await sql`
      SELECT id, status FROM orders WHERE icount_doc_id = ${saleUniqid}
    `;

    if (orders.length === 0) {
      console.error('Order not found for sale_uniqid:', saleUniqid);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    // Update order with payment confirmation
    if (status === 'success' || confirmationCode) {
      await sql`
        UPDATE orders
        SET
          status = 'PAID',
          icount_doc_id = ${docId || saleUniqid},
          updated_at = NOW()
        WHERE id = ${order.id}
      `;

      console.log(`Order ${order.id} marked as PAID. Doc: ${docNumber || docId}`);
    } else {
      await sql`
        UPDATE orders
        SET
          status = 'FAILED',
          updated_at = NOW()
        WHERE id = ${order.id}
      `;

      console.log(`Order ${order.id} payment failed`);
    }

    // iCount expects a 200 OK response
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('IPN processing error:', error);
    return NextResponse.json({ error: 'IPN processing failed' }, { status: 500 });
  }
}

// Also handle GET for IPN verification/testing
export async function GET() {
  return NextResponse.json({
    message: 'IPN endpoint active',
    timestamp: new Date().toISOString()
  });
}
