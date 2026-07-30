import { sql } from '@/lib/db';

// Removes the member's cart snapshot once their order is paid. Load-bearing:
// the success page clears the localStorage cart directly, so no client sync
// fires after purchase. Callers run this fire-and-forget inside the atomic
// PENDING -> PAID winner blocks (verify + IPN).
export async function clearMemberCartForOrder(orderId: string): Promise<void> {
  await sql`
    DELETE FROM member_carts
    WHERE email = (SELECT LOWER(email) FROM orders WHERE id = ${orderId})
  `;
}
