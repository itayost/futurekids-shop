import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { buildWelcomeEmailHtml, WELCOME_EMAIL_SUBJECT } from '@/lib/welcome-email';
import { buildUnsubscribeUrl } from '@/lib/unsubscribe';
import { signMemberToken } from '@/lib/member-token';
import { clientIp, rateLimitAllows } from '@/lib/rate-limit';
import { CLUB_COUPON_CODE } from '@/lib/club-popup';

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
      SELECT id, unsubscribed_at FROM club_members WHERE email = ${email}
    `;
    if (existing.length > 0 && existing[0].unsubscribed_at === null) {
      // Already an active member: no second welcome email, but the response
      // shape matches the fresh-signup one (no membership oracle).
      return NextResponse.json({
        success: true,
        memberToken: signMemberToken(email),
        message: 'ברוכים הבאים למועדון!',
      });
    }

    await sql`
      INSERT INTO club_members (email, first_name)
      VALUES (${email}, ${firstName || null})
      ON CONFLICT (email) DO UPDATE
      SET unsubscribed_at = NULL,
          first_name = COALESCE(EXCLUDED.first_name, club_members.first_name)
    `;

    // A lost welcome email is non-fatal: the popup shows the coupon on screen.
    const emailSent = await sendEmail({
      toEmail: email,
      toName: firstName || undefined,
      subject: WELCOME_EMAIL_SUBJECT,
      html: buildWelcomeEmailHtml({
        firstName: firstName || undefined,
        couponCode: CLUB_COUPON_CODE,
        unsubscribeUrl: buildUnsubscribeUrl(email),
      }),
      unsubscribeUrl: buildUnsubscribeUrl(email),
    });
    if (!emailSent) {
      console.error('Club subscribe: welcome email send failed');
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
