import { escapeHtml } from './welcome-email';

// Builds the abandoned-cart reminder email listing the actual order items.
// Same table-based inline-styled RTL visual language as the welcome email.

export const CART_REMINDER_SUBJECT = 'שכחת משהו בסל? המוצרים שלך מחכים';

const SITE_URL = 'https://www.kidcode.org.il';
const INK = '#545454';
const CREAM = '#fefce8';
const PINK = '#ec4899';

export interface ReminderItem {
  name: string;
  quantity: number;
  price: number;
}

export function buildCartReminderEmailHtml(params: {
  firstName?: string;
  items: ReminderItem[];
  total: number;
  unsubscribeUrl: string;
}): string {
  const greeting = params.firstName ? `היי ${escapeHtml(params.firstName)}!` : 'היי!';

  const itemRows = params.items
    .map(
      (item) => `<tr>
<td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${INK};text-align:right;">${escapeHtml(item.name)}${item.quantity > 1 ? ` <span style="color:#6b7280;">x${item.quantity}</span>` : ''}</td>
<td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:${INK};text-align:left;white-space:nowrap;">&#8362;${item.price * item.quantity}</td>
</tr>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${CART_REMINDER_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background-color:${CREAM};direction:rtl;text-align:right;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CREAM};padding:24px 0;">
<tr>
<td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border:4px solid ${INK};border-radius:24px;overflow:hidden;">
<tr>
<td style="border-bottom:4px solid ${INK};">
<img src="${SITE_URL}/emails/cart-reminder.jpg" alt="שכחת משהו בסל?" width="512" height="250" style="display:block;width:100%;height:auto;">
</td>
</tr>
<tr>
<td style="padding:28px 24px;font-family:Arial,Helvetica,sans-serif;color:${INK};">
<p style="margin:0 0 12px;font-size:18px;font-weight:bold;">${greeting}</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;">
שמנו לב שהשארת מוצרים בסל הקניות. הם עדיין מחכים לך:
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid ${INK};border-radius:12px;overflow:hidden;margin:0 0 8px;">
${itemRows}
<tr>
<td style="padding:12px;background-color:${CREAM};font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:${INK};text-align:right;">סך הכל</td>
<td style="padding:12px;background-color:${CREAM};font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:900;color:${INK};text-align:left;white-space:nowrap;">&#8362;${params.total}</td>
</tr>
</table>
<p style="margin:0 0 20px;font-size:13px;line-height:1.6;color:#6b7280;">
טיפ: חברי מועדון KidCode מקבלים 10% הנחה עם הקוד CLUB10 בעמוד התשלום.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:0 0 8px;">
<a href="${SITE_URL}" style="display:inline-block;background-color:${PINK};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:bold;text-decoration:none;border:3px solid ${INK};border-radius:12px;padding:14px 36px;">לחזרה לסל שלי</a>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="background-color:#f9fafb;border-top:2px solid ${INK};padding:16px 24px;text-align:center;">
<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;line-height:1.6;">
KidCode - ספרי מדע וטכנולוגיה לילדים<br>
<a href="${SITE_URL}" style="color:${PINK};">${SITE_URL.replace('https://', '')}</a>
</p>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9ca3af;">
<a href="${params.unsubscribeUrl}" style="color:#9ca3af;">להסרה מרשימת התפוצה</a>
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
