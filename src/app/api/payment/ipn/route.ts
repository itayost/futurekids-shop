import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendPurchaseEvent } from '@/lib/meta-capi';

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

      // Send Purchase event to Meta Conversions API (non-blocking)
      const orderDetails = await sql`
        SELECT o.id, o.email, o.first_name, o.last_name, o.phone, o.city, o.total,
               o.fb_click_id, o.fb_browser_id, o.client_ip, o.client_ua
        FROM orders o WHERE o.id = ${order.id}
      `;
      const orderItems = await sql`
        SELECT product_id, quantity FROM order_items WHERE order_id = ${order.id}
      `;

      if (orderDetails.length > 0) {
        const o = orderDetails[0];
        sendPurchaseEvent({
          event_id: o.id,
          value: parseFloat(o.total),
          content_ids: orderItems.map((i) => i.product_id as string),
          contents: orderItems.map((i) => ({
            id: i.product_id as string,
            quantity: Number(i.quantity),
          })),
          num_items: orderItems.reduce((sum, i) => sum + Number(i.quantity), 0),
          user: {
            email: o.email,
            phone: o.phone,
            firstName: o.first_name,
            lastName: o.last_name,
            city: o.city,
          },
          fbc: o.fb_click_id,
          fbp: o.fb_browser_id,
          client_ip: o.client_ip,
          client_ua: o.client_ua,
        }).catch((err: unknown) => console.error('Meta CAPI failed:', err));
      }
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
