import { sql } from '@/lib/db';
import { sendEvent } from '@/lib/flashy';
import { normalizePhone } from '@/lib/meta-capi';

// Fetches a paid order plus its items and sends the Flashy Purchase event.
// Callers guard this behind the atomic PENDING -> PAID transition (same as
// purchase-event.ts), so it fires exactly once per order. Purchase is the exit
// condition of the abandoned-cart automation in Flashy, so it must fire for
// every order - club member or not.
export async function sendOrderFlashyPurchase(orderId: string): Promise<void> {
  const orderDetails = await sql`
    SELECT id, email, phone, total FROM orders WHERE id = ${orderId}
  `;
  if (orderDetails.length === 0) return;

  const o = orderDetails[0];
  if (!o.email) return;

  const orderItems = await sql`
    SELECT product_id FROM order_items WHERE order_id = ${orderId}
  `;

  await sendEvent('Purchase', {
    email: o.email as string,
    phone: o.phone ? normalizePhone(o.phone as string) : undefined,
    order_id: o.id as string,
    value: parseFloat(o.total),
    currency: 'ILS',
    content_ids: orderItems.map((i) => i.product_id as string),
  });
}
