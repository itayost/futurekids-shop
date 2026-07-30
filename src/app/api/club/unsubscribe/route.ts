import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { decodeUnsubscribeEmail, verifyUnsubscribe } from '@/lib/unsubscribe';

// One-click unsubscribe target for the links in every marketing email.
// Stateless HMAC link (see lib/unsubscribe.ts); works for club members and
// one-off cart-reminder recipients alike - non-members get a suppressed
// club_members row so future sends skip them.

function htmlPage(title: string, body: string, status: number): Response {
  return new Response(
    `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>
<body style="margin:0;background:#fefce8;font-family:Arial,Helvetica,sans-serif;direction:rtl;">
<div style="max-width:480px;margin:80px auto;background:#fff;border:4px solid #545454;border-radius:24px;padding:32px;text-align:center;">
<h1 style="margin:0 0 12px;color:#545454;font-size:24px;">${title}</h1>
<p style="margin:0 0 20px;color:#545454;font-size:15px;line-height:1.6;">${body}</p>
<a href="https://www.kidcode.org.il" style="display:inline-block;background:#ec4899;color:#fff;font-weight:bold;text-decoration:none;border:3px solid #545454;border-radius:12px;padding:12px 28px;">חזרה לאתר</a>
</div>
</body>
</html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

async function unsubscribe(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const email = decodeUnsubscribeEmail(searchParams.get('e') || '');
    const signature = searchParams.get('t') || '';

    if (!email || !verifyUnsubscribe(email, signature)) {
      return htmlPage('קישור לא תקין', 'הקישור להסרה אינו תקין או שפג תוקפו.', 400);
    }

    await sql`
      INSERT INTO club_members (email, unsubscribed_at)
      VALUES (${email}, NOW())
      ON CONFLICT (email) DO UPDATE SET unsubscribed_at = NOW()
    `;

    return htmlPage(
      'הוסרת מרשימת התפוצה',
      'לא נשלח אליך יותר דיוור מ-KidCode. אפשר להירשם מחדש בכל עת דרך האתר.',
      200
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return htmlPage('שגיאה', 'אירעה שגיאה, נסו שוב מאוחר יותר.', 500);
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  return unsubscribe(request);
}

// RFC 8058 one-click unsubscribe (List-Unsubscribe-Post) arrives as POST.
export async function POST(request: NextRequest): Promise<Response> {
  return unsubscribe(request);
}
