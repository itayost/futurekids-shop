import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/send-welcome-email';
import { signMemberToken } from '@/lib/member-token';
import { clientIp, rateLimitAllows } from '@/lib/rate-limit';
import { isQuietHours } from '@/lib/quiet-hours';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 100;
const RATE_LIMIT = 10;
const RATE_WINDOW_SECONDS = 60 * 60;

// Joins a visitor to the members club: upserts the club_members row and sends
// the welcome email with the coupon code. An address that is already an
// active member gets no second email, but the response is identical either
// way so the endpoint cannot be used to probe who is on the list; an
// unsubscribed address that signs up again is reactivated (re-consent).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
    const honeypot = typeof body.website === 'string' ? body.website.trim() : '';

    // Bots fill the hidden field; answer success without doing anything.
    if (honeypot) {
      return NextResponse.json({ success: true, message: 'תודה!' });
    }

    if (!EMAIL_REGEX.test(email) || email.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json(
        { success: false, message: 'כתובת אימייל לא תקינה' },
        { status: 400 }
      );
    }
    if (firstName.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { success: false, message: 'שם ארוך מדי' },
        { status: 400 }
      );
    }

    const allowed = await rateLimitAllows({
      scope: 'subscribe',
      ip: clientIp(request),
      limit: RATE_LIMIT,
      windowSeconds: RATE_WINDOW_SECONDS,
    });
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'יותר מדי ניסיונות, נסו שוב מאוחר יותר' },
        { status: 429 }
      );
    }

    const existing = await sql`
      SELECT welcome_sent_at FROM club_members WHERE email = ${email}
    `;

    await sql`
      INSERT INTO club_members (email, first_name)
      VALUES (${email}, ${firstName || null})
      ON CONFLICT (email) DO UPDATE
      SET unsubscribed_at = NULL,
          first_name = COALESCE(EXCLUDED.first_name, club_members.first_name)
    `;

    // The welcome email is (re)sent on every signup - a member joining again
    // on a new device expects it - but at most once per 24h per address, so
    // repeated signups cannot bombard an inbox. A lost email is non-fatal:
    // the popup shows the coupon on screen.
    const lastWelcome = existing[0]?.welcome_sent_at
      ? new Date(existing[0].welcome_sent_at as string).getTime()
      : 0;
    const welcomeDue = Date.now() - lastWelcome > 24 * 60 * 60 * 1000;

    if (welcomeDue) {
      if (isQuietHours(new Date())) {
        // Shabbat quiet hours: no emails go out. Mark the welcome as owed
        // (welcome_sent_at NULL) so the hourly cron delivers it once quiet
        // hours end; the popup shows the coupon on screen meanwhile.
        await sql`UPDATE club_members SET welcome_sent_at = NULL WHERE email = ${email}`;
      } else {
        // Atomic claim (mirrors the cron's phase 0): the 24h cooldown is
        // re-checked in the same statement, so neither a concurrent signup
        // nor an overlapping cron run can double-send the welcome.
        const claimed = await sql`
          UPDATE club_members SET welcome_sent_at = NOW()
          WHERE email = ${email}
            AND (welcome_sent_at IS NULL OR welcome_sent_at < NOW() - interval '24 hours')
          RETURNING email
        `;
        if (claimed.length > 0) {
          const emailSent = await sendWelcomeEmail({
            email,
            firstName: firstName || undefined,
          });
          if (!emailSent) {
            // Hand the welcome back to the cron (phase 0 delivers every
            // welcome_sent_at NULL row), so a transient failure delays the
            // email by up to an hour instead of losing it.
            console.error('Club subscribe: welcome email send failed, deferred to cron');
            await sql`UPDATE club_members SET welcome_sent_at = NULL WHERE email = ${email}`;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      memberToken: signMemberToken(email),
      message: 'ברוכים הבאים למועדון!',
    });
  } catch (error) {
    console.error('Club subscribe error:', error);
    return NextResponse.json(
      { success: false, message: 'שגיאה בהרשמה למועדון' },
      { status: 500 }
    );
  }
}
