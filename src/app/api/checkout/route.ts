import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { createPaymentUrl } from '@/lib/icount';
import { computeBundleDiscount } from '@/lib/bundle-discount';
import { normalizeCode, parseCouponRow, validateCoupon } from '@/lib/coupons';

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
  bundleDiscount?: number;
  bundleName?: string;
  couponCode?: string;
  shippingMethod?: 'pickup-point' | 'delivery';
  shippingCost?: number;
  total: number;
  pickupPointCode?: string;
  pickupPointName?: string;
  fbc?: string | null;
  fbp?: string | null;
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

    // Server-authoritative amounts — never trust client-sent totals.
    const subtotal = body.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const { bundleDiscount, bundleName } = computeBundleDiscount(
      body.items.map((it) => ({ productId: it.productId, quantity: it.quantity }))
    );

    let couponCode: string | null = null;
    let couponDiscount = 0;
    const rawCode = normalizeCode(body.couponCode || '');
    if (rawCode) {
      const couponRows = await sql`SELECT * FROM coupons WHERE code = ${rawCode} LIMIT 1`;
      const coupon = couponRows[0] ? parseCouponRow(couponRows[0] as Record<string, unknown>) : null;
      const check = validateCoupon(coupon, subtotal, bundleDiscount, new Date());
      if (check.valid) {
        couponCode = check.code;
        couponDiscount = check.discount;
      }
    }

    const shippingCost = body.shippingCost && body.shippingCost > 0 ? body.shippingCost : 0;
    const total = subtotal - bundleDiscount - couponDiscount + shippingCost;

    // Capture Meta tracking params for CAPI
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    const clientUa = request.headers.get('user-agent') || null;

    // Get PayPage ID from environment
    const paypageId = parseInt(process.env.ICOUNT_PAYPAGE_ID || '6');

    // Step 1: Create order in database with PENDING status
    const orderResult = await sql`
      INSERT INTO orders (email, first_name, last_name, phone, address, city, total, status, shipping_method, shipping_cost, pickup_point_code, pickup_point_name, bundle_discount, bundle_name, coupon_code, coupon_discount, fb_click_id, fb_browser_id, client_ip, client_ua)
      VALUES (${body.email}, ${body.firstName}, ${body.lastName}, ${body.phone}, ${body.address}, ${body.city}, ${total}, 'PENDING', ${body.shippingMethod || null}, ${shippingCost || null}, ${body.pickupPointCode || null}, ${body.pickupPointName || null}, ${bundleDiscount}, ${bundleName}, ${couponCode}, ${couponDiscount}, ${body.fbc || null}, ${body.fbp || null}, ${clientIp}, ${clientUa})
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

    // Step 2: Generate iCount payment URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.kidcode.org.il';
    const successUrl = `${baseUrl}/payment/success?orderId=${order.id}`;
    const failureUrl = `${baseUrl}/payment/failed?orderId=${order.id}`;
    const ipnUrl = `${baseUrl}/api/payment/ipn`;

    try {
      // Build items list for iCount
      const icountItems = body.items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      // Add discount lines (server-computed)
      if (bundleDiscount > 0) {
        icountItems.push({ name: 'הנחת מארז', price: -bundleDiscount, quantity: 1 });
      }
      if (couponDiscount > 0 && couponCode) {
        icountItems.push({ name: `קופון: ${couponCode}`, price: -couponDiscount, quantity: 1 });
      }

      // Add shipping cost
      if (body.shippingCost && body.shippingCost > 0) {
        let shippingLabel = 'משלוח';
        if (body.shippingMethod === 'delivery') {
          shippingLabel = 'משלוח עד הבית';
        } else if (body.shippingMethod === 'pickup-point') {
          shippingLabel = body.pickupPointName
            ? `נקודת איסוף: ${body.pickupPointName}`
            : 'נקודת איסוף';
        }
        icountItems.push({
          name: shippingLabel,
          price: body.shippingCost,
          quantity: 1,
        });
      }

      const { saleUrl, saleUniqid } = await createPaymentUrl({
        paypageId,
        items: icountItems,
        customer: {
          name: `${body.firstName} ${body.lastName}`,
          email: body.email,
          phone: body.phone,
          city: body.city,
          street: body.address,
        },
        orderId: order.id,
        successUrl,
        failureUrl,
        ipnUrl,
      });

      // Store sale_uniqid in order for later verification
      await sql`
        UPDATE orders SET icount_doc_id = ${saleUniqid} WHERE id = ${order.id}
      `;

      // Return payment page URL for redirect
      return NextResponse.json({
        success: true,
        orderId: order.id,
        paymentUrl: saleUrl,
        saleUniqid,
      });

    } catch (icountError) {
      console.error('iCount payment URL generation failed:', icountError);
      return NextResponse.json(
        {
          error: icountError instanceof Error ? icountError.message : 'Payment service unavailable',
          orderId: order.id
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    );
  }
}
