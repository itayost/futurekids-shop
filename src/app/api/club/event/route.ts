import { NextRequest, NextResponse } from 'next/server';
import { getContact, isInClubList, sendEvent } from '@/lib/flashy';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_CONTENT_IDS = 20;
const MAX_CONTENT_ID_LENGTH = 64;

// Proxies the member AddToCart event to Flashy so the API key stays
// server-side. Only this single event name is allowed (InitiateCheckout and
// Purchase are fired server-side), and only for existing club members - so the
// endpoint cannot be used to create contacts or trigger emails to arbitrary
// addresses.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.event !== 'AddToCart') {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!EMAIL_REGEX.test(email) || email.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const contentIds: unknown = body.content_ids;
    const validContentIds =
      Array.isArray(contentIds) &&
      contentIds.length > 0 &&
      contentIds.length <= MAX_CONTENT_IDS &&
      contentIds.every(
        (id) => typeof id === 'string' && id.length > 0 && id.length <= MAX_CONTENT_ID_LENGTH
      );
    if (!validContentIds) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const value = Number(body.value);
    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const contact = await getContact(email);
    if (!isInClubList(contact)) {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    // Best-effort: respond success even if Flashy soft-fails; nothing
    // user-visible depends on this event.
    await sendEvent('AddToCart', {
      email,
      content_ids: contentIds as string[],
      value,
      currency: 'ILS',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Club event error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
