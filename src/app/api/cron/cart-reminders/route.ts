import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import {
  buildCartReminderEmailHtml,
  CART_REMINDER_SUBJECT,
  type ReminderItem,
} from '@/lib/cart-reminder-email';
import { buildUnsubscribeUrl } from '@/lib/unsubscribe';
import { parseMemberCartRow } from '@/lib/cart-snapshot';

const MAX_SENDS_PER_RUN = 50;

// Hourly Vercel Cron (vercel.json): emails a one-time reminder for checkouts
// that were started but never paid. A checkout attempt = an order stuck in
// PENDING/FAILED; the reminder goes out once it is 24h-7d old, unless the
// customer completed a later purchase or unsubscribed.
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Latest abandoned order per email; skip emails that purchased afterwards
    // and emails on the suppression list.
    const candidates = await sql`
      SELECT DISTINCT ON (o.email)
             o.id, o.email, o.first_name, o.total
      FROM orders o
      WHERE o.status IN ('PENDING', 'FAILED')
        AND o.reminder_sent_at IS NULL
        AND o.email IS NOT NULL AND o.email <> ''
        AND o.created_at BETWEEN NOW() - interval '7 days' AND NOW() - interval '24 hours'
        AND NOT EXISTS (
          SELECT 1 FROM orders paid
          WHERE paid.email = o.email AND paid.status = 'PAID'
            AND paid.created_at >= o.created_at
        )
        AND NOT EXISTS (
          SELECT 1 FROM club_members m
          WHERE m.email = o.email AND m.unsubscribed_at IS NOT NULL
        )
      ORDER BY o.email, o.created_at DESC
      LIMIT ${MAX_SENDS_PER_RUN}
    `;

    let sent = 0;
    let skipped = 0;

    for (const order of candidates) {
      // Atomic claim so overlapping runs never double-send; a send failure
      // after the claim loses the reminder, which beats sending it twice.
      const claimed = await sql`
        UPDATE orders SET reminder_sent_at = NOW()
        WHERE id = ${order.id} AND reminder_sent_at IS NULL
        RETURNING id
      `;
      if (claimed.length === 0) {
        skipped++;
        continue;
      }

      const itemRows = await sql`
        SELECT product_name, quantity, price FROM order_items WHERE order_id = ${order.id}
      `;
      const items: ReminderItem[] = itemRows.map((row) => ({
        name: row.product_name as string,
        quantity: Number(row.quantity),
        price: parseFloat(row.price),
      }));
      if (items.length === 0) {
        skipped++;
        continue;
      }

      const email = (order.email as string).toLowerCase();
      const ok = await sendEmail({
        toEmail: email,
        toName: (order.first_name as string) || undefined,
        subject: CART_REMINDER_SUBJECT,
        html: buildCartReminderEmailHtml({
          firstName: (order.first_name as string) || undefined,
          items,
          total: parseFloat(order.total),
          unsubscribeUrl: buildUnsubscribeUrl(email),
        }),
        unsubscribeUrl: buildUnsubscribeUrl(email),
      });

      if (ok) sent++;
      else skipped++;
    }

    // Phase 2: member cart snapshots that never reached checkout. A cart is
    // eligible once idle for 24h (updated_at moves only on real changes);
    // anyone who progressed into checkout after the cart's last change is
    // owned by the order path above; hard cap of one reminder per 7 days.
    let cartSent = 0;
    let cartSkipped = 0;
    const remaining = MAX_SENDS_PER_RUN - sent;

    const cartCandidates =
      remaining > 0
        ? await sql`
            SELECT mc.email, m.first_name
            FROM member_carts mc
            JOIN club_members m ON m.email = mc.email AND m.unsubscribed_at IS NULL
            WHERE mc.updated_at BETWEEN NOW() - interval '7 days' AND NOW() - interval '24 hours'
              AND (mc.reminder_sent_at IS NULL OR mc.reminder_sent_at < NOW() - interval '7 days')
              AND NOT EXISTS (
                SELECT 1 FROM orders o
                WHERE LOWER(o.email) = mc.email AND o.created_at >= mc.updated_at
              )
            LIMIT ${remaining}
          `
        : [];

    for (const cart of cartCandidates) {
      const claimed = await sql`
        UPDATE member_carts SET reminder_sent_at = NOW()
        WHERE email = ${cart.email}
          AND (reminder_sent_at IS NULL OR reminder_sent_at < NOW() - interval '7 days')
        RETURNING items, total
      `;
      if (claimed.length === 0) {
        cartSkipped++;
        continue;
      }

      const snapshot = parseMemberCartRow(claimed[0]);
      if (!snapshot) {
        cartSkipped++;
        continue;
      }

      const email = cart.email as string;
      const firstName = (cart.first_name as string) || undefined;
      const ok = await sendEmail({
        toEmail: email,
        toName: firstName,
        subject: CART_REMINDER_SUBJECT,
        html: buildCartReminderEmailHtml({
          firstName,
          items: snapshot.items,
          total: snapshot.total,
          unsubscribeUrl: buildUnsubscribeUrl(email),
        }),
        unsubscribeUrl: buildUnsubscribeUrl(email),
      });

      if (ok) cartSent++;
      else cartSkipped++;
    }

    return NextResponse.json({
      sent,
      skipped,
      candidates: candidates.length,
      cartSent,
      cartSkipped,
      cartCandidates: cartCandidates.length,
    });
  } catch (error) {
    console.error('Cart reminders cron error:', error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
