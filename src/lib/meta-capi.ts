import crypto from 'crypto';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const CAPI_URL = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`;

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // Add Israel country code if not present
  if (digits.startsWith('0')) return '972' + digits.slice(1);
  if (digits.startsWith('972')) return digits;
  return digits;
}

interface PurchaseEventData {
  event_id: string;
  value: number;
  content_ids: string[];
  contents: { id: string; quantity: number }[];
  num_items: number;
  user: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    city: string;
  };
  fbc?: string | null;
  fbp?: string | null;
  client_ip?: string | null;
  client_ua?: string | null;
}

export async function sendPurchaseEvent(data: PurchaseEventData) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.error('Meta CAPI: missing PIXEL_ID or ACCESS_TOKEN');
    return;
  }

  const userData: Record<string, string> = {
    country: sha256('il'),
  };

  if (data.user.email) userData.em = sha256(data.user.email);
  if (data.user.phone) userData.ph = sha256(normalizePhone(data.user.phone));
  if (data.user.firstName) userData.fn = sha256(data.user.firstName);
  if (data.user.lastName) userData.ln = sha256(data.user.lastName);
  if (data.user.city) userData.ct = sha256(data.user.city);
  if (data.fbc) userData.fbc = data.fbc;
  if (data.fbp) userData.fbp = data.fbp;
  if (data.client_ip) userData.client_ip_address = data.client_ip;
  if (data.client_ua) userData.client_user_agent = data.client_ua;

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: data.event_id,
        event_source_url: 'https://www.kidcode.org.il/payment/success',
        action_source: 'website',
        user_data: userData,
        custom_data: {
          value: data.value,
          currency: 'ILS',
          content_ids: data.content_ids,
          contents: data.contents,
          content_type: 'product',
          num_items: data.num_items,
        },
      },
    ],
    access_token: ACCESS_TOKEN,
  };

  try {
    const response = await fetch(CAPI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Meta CAPI error:', result);
    } else {
      console.log('Meta CAPI Purchase sent:', { event_id: data.event_id, events_received: result.events_received });
    }
  } catch (error) {
    console.error('Meta CAPI exception:', error);
  }
}
