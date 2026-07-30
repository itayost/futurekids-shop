import { NextRequest, NextResponse } from 'next/server';
import {
  getContact,
  isInClubList,
  sendTransactionalEmail,
  upsertClubContact,
} from '@/lib/flashy';
import { buildWelcomeEmailHtml, WELCOME_EMAIL_SUBJECT } from '@/lib/flashy-welcome-email';
import { CLUB_COUPON_CODE } from '@/lib/club-popup';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 100;

// Joins a visitor to the members club: creates/updates the Flashy contact on
// the club list and sends the welcome email with the coupon code. An address
// that is already on the list gets no second email (idempotent).
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

    const existing = await getContact(email);
    if (isInClubList(existing)) {
      return NextResponse.json({
        success: true,
        alreadyMember: true,
        message: `הכתובת כבר רשומה למועדון. קוד ההנחה: ${CLUB_COUPON_CODE}`,
      });
    }

    const created = await upsertClubContact({ email, firstName: firstName || undefined });
    if (!created) {
      return NextResponse.json(
        { success: false, message: 'ההרשמה נכשלה, נסו שוב מאוחר יותר' },
        { status: 502 }
      );
    }

    // A lost welcome email is non-fatal: the popup shows the coupon on screen.
    const emailSent = await sendTransactionalEmail({
      toEmail: email,
      toName: firstName || undefined,
      subject: WELCOME_EMAIL_SUBJECT,
      html: buildWelcomeEmailHtml({
        firstName: firstName || undefined,
        couponCode: CLUB_COUPON_CODE,
      }),
    });
    if (!emailSent) {
      console.error('Club subscribe: welcome email send failed');
    }

    return NextResponse.json({ success: true, message: 'ברוכים הבאים למועדון!' });
  } catch (error) {
    console.error('Club subscribe error:', error);
    return NextResponse.json(
      { success: false, message: 'שגיאה בהרשמה למועדון' },
      { status: 500 }
    );
  }
}
