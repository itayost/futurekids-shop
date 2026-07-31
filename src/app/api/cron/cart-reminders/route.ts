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
import { isQuietHours } from '@/lib/quiet-hours';
import { sendWelcomeEmail } from '@/lib/send-welcome-email';

const MAX_SENDS_PER_RUN = 50;

// Up to 50 sequential Resend calls plus per-order queries can exceed the
// default function timeout; give the cron the full window.
export const maxDuration = 300;

// Hourly Vercel Cron (vercel.json): delivers welcome emails owed to members
// (deferred by Shabbat quiet hours or by a failed signup-time send), then
// emails a one-time reminder for checkouts that were started but never paid.
// A checkout attempt = an order stuck in PENDING/FAILED; the reminder goes
// out once it is 24h-7d old, unless the customer completed a later purchase
// or unsubscribed. All phases share the MAX_SENDS_PER_RUN email budget.
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Shabbat quiet hours (Friday 16:00 - Saturday 21:30 Israel time): send
  // nothing. Everything here is state-based ("still owed"), so the first run
  // after quiet hours delivers whatever accumulated.
  if (isQuietHours(new Date())) {
    return NextResponse.json({ quietHours: true });
  }

  try {
    // Phase 0: welcome emails owed to members (welcome_sent_at NULL) -
    // deferred by quiet hours or handed over after a failed signup-time send.
    let welcomeSent = 0;
    let welcomeFailed = 0;
    const owedWelcomes = await sql`
      SELECT email, first_name FROM club_members
      WHERE welcome_sent_at IS NULL AND unsubscribed_at IS NULL
      LIMIT ${MAX_SENDS_PER_RUN}
    `;
    for (const member of owedWelcomes) {
      // Atomic claim so overlapping runs never double-send; unsubscribed_at
      // is re-checked because a member can unsubscribe while earlier sends in
      // this loop are in flight. Like the reminders below, a send failure
      // after the claim loses the welcome, which beats sending it twice -
      // the popup already showed the coupon on screen.
      const claimed = await sql`
        UPDATE club_members SET welcome_sent_at = NOW()
        WHERE email = ${member.email} AND welcome_sent_at IS NULL
          AND unsubscribed_at IS NULL
        RETURNING email
      `;
      if (claimed.length === 0) continue;

      const ok = await sendWelcomeEmail({
        email: member.email as string,
        firstName: (member.first_name as string) || undefined,
      });
      if (ok) welcomeSent++;
      else welcomeFailed++;
    }

    // Welcome attempts count against the shared per-run email budget, so a
    // large owed-welcome backlog cannot push a single run past the send
    // volume the maxDuration window was sized for.
    const reminderBudget = MAX_SENDS_PER_RUN - welcomeSent - welcomeFailed;

    // Latest abandoned order per email; skip emails that purchased afterwards
    // and emails on the suppression list. orders.email is stored as typed by
    // the customer, while club_members.email is always lowercase, so every
    // email comparison here must go through LOWER().
    const candidates =
      reminderBudget > 0
        ? await sql`
            SELECT DISTINCT ON (LOWER(o.email))
                   o.id, o.email, o.first_name, o.total
            FROM orders o
            WHERE o.status IN ('PENDING', 'FAILED')
              AND o.reminder_sent_at IS NULL
              AND o.email IS NOT NULL AND o.email <> ''
              AND o.created_at BETWEEN NOW() - interval '7 days' AND NOW() - interval '24 hours'
              AND NOT EXISTS (
                SELECT 1 FROM orders paid
                WHERE LOWER(paid.email) = LOWER(o.email) AND paid.status = 'PAID'
                  AND paid.created_at >= o.created_at
              )
              AND NOT EXISTS (
                SELECT 1 FROM club_members m
                WHERE m.email = LOWER(o.email) AND m.unsubscribed_at IS NOT NULL
              )
            ORDER BY LOWER(o.email), o.created_at DESC
            LIMIT ${reminderBudget}
          `
        : [];

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
    const remaining = reminderBudget - sent;

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

    // Housekeeping: expired rate-limit windows are dead weight.
    await sql`DELETE FROM rate_limits WHERE window_start < NOW() - interval '1 day'`;

    return NextResponse.json({
      welcomeSent,
      welcomeFailed,
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
