// Builds the members-club welcome email. Pure function so it can be unit
// tested; the HTML is table-based with inline styles only, which is what email
// clients reliably render. Brand: cream background, charcoal ink, pink CTA.

export const WELCOME_EMAIL_SUBJECT = 'ברוכים הבאים למועדון KidCode - קוד הנחה בפנים';

const SITE_URL = 'https://www.kidcode.org.il';
const INK = '#545454';
const CREAM = '#fefce8';
const PINK = '#ec4899';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildWelcomeEmailHtml(params: {
  firstName?: string;
  couponCode: string;
}): string {
  const greeting = params.firstName ? `היי ${escapeHtml(params.firstName)}!` : 'היי!';
  const code = escapeHtml(params.couponCode);

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${WELCOME_EMAIL_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background-color:${CREAM};direction:rtl;text-align:right;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CREAM};padding:24px 0;">
<tr>
<td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border:4px solid ${INK};border-radius:24px;overflow:hidden;">
<tr>
<td style="background-color:#fbcfe8;border-bottom:4px solid ${INK};padding:28px 24px;text-align:center;">
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:${INK};letter-spacing:1px;">מועדון KidCode</p>
<h1 style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:900;color:${INK};">ברוכים הבאים למועדון!</h1>
</td>
</tr>
<tr>
<td style="padding:28px 24px;font-family:Arial,Helvetica,sans-serif;color:${INK};">
<p style="margin:0 0 12px;font-size:18px;font-weight:bold;">${greeting}</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;">
תודה שהצטרפת למועדון החברים של KidCode - ספרי מדע וטכנולוגיה לילדים.
מגיעה לך <strong>10% הנחה על ההזמנה הראשונה</strong> עם הקוד הבא:
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:0 0 20px;">
<div style="display:inline-block;border:3px dashed ${INK};border-radius:16px;background-color:${CREAM};padding:14px 32px;">
<span style="font-family:Courier,monospace;font-size:28px;font-weight:bold;letter-spacing:4px;color:${INK};direction:ltr;unicode-bidi:embed;">${code}</span>
</div>
</td>
</tr>
<tr>
<td align="center" style="padding:0 0 24px;">
<a href="${SITE_URL}" style="display:inline-block;background-color:${PINK};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:bold;text-decoration:none;border:3px solid ${INK};border-radius:12px;padding:14px 36px;">לקנייה באתר</a>
</td>
</tr>
</table>
<p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
איך משתמשים? מזינים את הקוד בשדה הקופון בעמוד התשלום וההנחה תחושב אוטומטית.
</p>
</td>
</tr>
<tr>
<td style="background-color:#f9fafb;border-top:2px solid ${INK};padding:16px 24px;text-align:center;">
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;line-height:1.6;">
KidCode - ספרי מדע וטכנולוגיה לילדים<br>
<a href="${SITE_URL}" style="color:${PINK};">${SITE_URL.replace('https://', '')}</a>
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
}
