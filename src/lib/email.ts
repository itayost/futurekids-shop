// Server-only email sending via Resend's REST API (native fetch, no SDK -
// the repo keeps runtime dependencies minimal). Fail-soft like meta-capi.ts:
// never throws, logs without PII, returns false on any failure - so email can
// never break a user-facing flow.

const RESEND_URL = 'https://api.resend.com/emails';

export async function sendEmail(params: {
  toEmail: string;
  toName?: string;
  subject: string;
  html: string;
  unsubscribeUrl?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  if (!apiKey || !fromEmail) {
    console.error('Email: missing RESEND_API_KEY or EMAIL_FROM');
    return false;
  }

  const fromName = process.env.EMAIL_FROM_NAME || 'KidCode';

  const payload: Record<string, unknown> = {
    from: `${fromName} <${fromEmail}>`,
    to: [params.toName ? `${params.toName} <${params.toEmail}>` : params.toEmail],
    subject: params.subject,
    html: params.html,
  };
  if (params.unsubscribeUrl) {
    payload.headers = {
      'List-Unsubscribe': `<${params.unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    };
  }

  try {
    const response = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = (await response.text().catch(() => '')).slice(0, 300);
      console.error(`Email: send failed with status ${response.status}: ${detail}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Email: send request error:', error);
    return false;
  }
}
