import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { icountLogin, icountCreatePaymentPage } from '@/lib/icount';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  items: OrderItem[];
  total: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.phone || !body.city || !body.address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // Step 1: Create order in database with PENDING status
    const orderResult = await sql`
      INSERT INTO orders (email, first_name, last_name, phone, address, city, total, status)
      VALUES (${body.email}, ${body.firstName}, ${body.lastName}, ${body.phone}, ${body.address}, ${body.city}, ${body.total}, 'PENDING')
      RETURNING id, created_at
    `;

    const order = orderResult[0];

    // Create order items
    for (const item of body.items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
        VALUES (${order.id}, ${item.productId}, ${item.name}, ${item.quantity}, ${item.price})
      `;
    }

    // Step 2: Login to iCount
    let session: string;
    try {
      session = await icountLogin();
    } catch (icountError) {
      console.error('iCount login failed:', icountError);
      // Order created but payment init failed - return orderId so it can be retried
      return NextResponse.json(
        {
          error: 'Payment service unavailable. Please try again.',
          orderId: order.id
        },
        { status: 503 }
      );
    }

    // Step 3: Create iCount payment page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/payment/success?orderId=${order.id}`;
    const failureUrl = `${baseUrl}/payment/failed?orderId=${order.id}`;

    const paymentResult = await icountCreatePaymentPage(
      session,
      {
        client_name: `${body.firstName} ${body.lastName}`,
        client_email: body.email,
        client_phone: body.phone,
        client_address: body.address,
        client_city: body.city,
      },
      body.items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      order.id,
      successUrl,
      failureUrl
    );

    if (!paymentResult.status || !paymentResult.payment_page_url) {
      console.error('iCount payment page creation failed:', paymentResult);
      return NextResponse.json(
        {
          error: paymentResult.error_description || 'Failed to create payment page',
          orderId: order.id
        },
        { status: 500 }
      );
    }

    // Return payment page URL for redirect
    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentUrl: paymentResult.payment_page_url,
      paymentId: paymentResult.payment_id,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    );
  }
}
