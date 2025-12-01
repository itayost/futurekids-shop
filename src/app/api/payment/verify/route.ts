import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

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

    // Update order status to PAID
    const result = await sql`
      UPDATE orders
      SET status = 'PAID',
          paid_at = NOW(),
          icount_doc_id = ${docId || paymentId || null}
      WHERE id = ${orderId} AND status = 'PENDING'
      RETURNING id, status
    `;

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
