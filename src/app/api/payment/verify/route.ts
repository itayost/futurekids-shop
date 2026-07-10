import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendOrderPurchaseEvent } from '@/lib/purchase-event';

// This route verifies payment and updates order status
// Called from the success page after iCount redirect

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId, docId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      );
    }

    // Only overwrite icount_doc_id when the redirect actually carried a value.
    // Otherwise keep the sale_uniqid stored at checkout, which the IPN handler
    // relies on to look the order up as a fallback path.
    const docValue = docId || paymentId || null;

    // Update order status to PAID. The status = 'PENDING' guard makes this an
    // atomic transition: only the first request (browser verify or IPN) to flip
    // the order wins the returned row and is responsible for sending CAPI.
    const result = await sql`
      UPDATE orders
      SET status = 'PAID',
          paid_at = NOW(),
          icount_doc_id = COALESCE(${docValue}::text, icount_doc_id)
      WHERE id = ${orderId} AND status = 'PENDING'
      RETURNING id, status
    `;

    // Won the PENDING -> PAID transition: fire the Purchase event exactly once.
    if (result.length > 0) {
      sendOrderPurchaseEvent(orderId).catch((err: unknown) =>
        console.error('Meta CAPI failed (verify):', err)
      );
    }

    if (result.length === 0) {
      // Order not found or already processed
      const existingOrder = await sql`
        SELECT id, status FROM orders WHERE id = ${orderId}
      `;

      if (existingOrder.length === 0) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // Order already paid - that's fine
      if (existingOrder[0].status === 'PAID') {
        return NextResponse.json({
          success: true,
          alreadyPaid: true,
          orderId: existingOrder[0].id,
        });
      }

      return NextResponse.json(
        { error: 'Could not update order status' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result[0].id,
      status: result[0].status,
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
