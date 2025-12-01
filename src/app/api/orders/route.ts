import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CreateOrderRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  items: OrderItem[];
  total: number;
}

export async function GET() {
  try {
    const orders = await sql`
      SELECT
        o.id,
        o.email,
        o.first_name,
        o.last_name,
        o.phone,
        o.address,
        o.city,
        o.status,
        o.total,
        o.created_at,
        o.paid_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'productId', oi.product_id,
              'productName', oi.product_name,
              'quantity', oi.quantity,
              'price', oi.price
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

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

    // Create order
    const orderResult = await sql`
      INSERT INTO orders (email, first_name, last_name, phone, address, city, total)
      VALUES (${body.email}, ${body.firstName}, ${body.lastName}, ${body.phone}, ${body.address}, ${body.city}, ${body.total})
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

    return NextResponse.json({
      success: true,
      orderId: order.id,
      createdAt: order.created_at,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
