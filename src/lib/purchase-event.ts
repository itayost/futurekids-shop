import { sql } from '@/lib/db';
import { sendPurchaseEvent } from '@/lib/meta-capi';

// Fetches a paid order plus its items and sends the Meta CAPI Purchase event.
// Callers guard this behind the atomic PENDING -> PAID transition so it fires
// exactly once per order, regardless of which path (browser verify or iCount
// IPN) confirms the payment first. The client-side pixel and this server event
// share the same event_id (the order id), so Meta deduplicates the pair.
export async function sendOrderPurchaseEvent(orderId: string): Promise<void> {
  const orderDetails = await sql`
    SELECT o.id, o.email, o.first_name, o.last_name, o.phone, o.city, o.total,
           o.fb_click_id, o.fb_browser_id, o.client_ip, o.client_ua
    FROM orders o WHERE o.id = ${orderId}
  `;

  if (orderDetails.length === 0) return;

  const orderItems = await sql`
    SELECT product_id, quantity FROM order_items WHERE order_id = ${orderId}
  `;

  const o = orderDetails[0];

  await sendPurchaseEvent({
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
  });
}
