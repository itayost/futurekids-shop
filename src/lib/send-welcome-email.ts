// Sends the members-club welcome email (coupon inside). Shared by the
// subscribe route and the cron's deferred-welcome delivery (phase 0) so the
// payload cannot drift between the two senders. Fail-soft like sendEmail:
// returns false on failure, never throws.

import { sendEmail } from '@/lib/email';
import { buildWelcomeEmailHtml, WELCOME_EMAIL_SUBJECT } from '@/lib/welcome-email';
import { buildUnsubscribeUrl } from '@/lib/unsubscribe';
import { CLUB_COUPON_CODE } from '@/lib/club-popup';

export function sendWelcomeEmail(params: {
  email: string;
  firstName?: string;
}): Promise<boolean> {
  const unsubscribeUrl = buildUnsubscribeUrl(params.email);
  return sendEmail({
    toEmail: params.email,
    toName: params.firstName,
    subject: WELCOME_EMAIL_SUBJECT,
    html: buildWelcomeEmailHtml({
      firstName: params.firstName,
      couponCode: CLUB_COUPON_CODE,
      unsubscribeUrl,
    }),
    unsubscribeUrl,
  });
}
