// Server-only Flashy client (marketing platform, https://api.flashy.app).
// Every function is fail-soft: it never throws and returns null/false on any
// failure, so a Flashy outage or missing key can never break checkout or
// payment flows. Mirrors the conventions of meta-capi.ts.

const API_BASE = 'https://api.flashy.app';

export type FlashyEventName = 'AddToCart' | 'InitiateCheckout' | 'Purchase';

export interface FlashyContact {
  contact_id: string;
  email: string;
  first_name?: string;
  lists?: Record<string, boolean>;
}

export function clubListId(): string {
  return process.env.FLASHY_CLUB_LIST_ID || '38818';
}

interface FlashyResult<T> {
  ok: boolean;
  data: T | null;
}

async function flashyFetch<T>(
  path: string,
  init?: { method?: 'GET' | 'POST' | 'PUT'; body?: unknown; silentStatuses?: number[] }
): Promise<FlashyResult<T>> {
  const apiKey = process.env.FLASHY_API_KEY;
  if (!apiKey) {
    console.error('Flashy: missing FLASHY_API_KEY');
    return { ok: false, data: null };
  }

  const method = init?.method || 'GET';

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    });

    if (!response.ok) {
      if (!init?.silentStatuses?.includes(response.status)) {
        const detail = (await response.text().catch(() => '')).slice(0, 300);
        console.error(
          `Flashy: ${method} ${path} failed with status ${response.status}: ${detail}`
        );
      }
      return { ok: false, data: null };
    }

    const result = (await response.json()) as { success?: boolean; data?: T };

    if (result.success !== true) {
      console.error(`Flashy: ${method} ${path} returned success=false`);
      return { ok: false, data: null };
    }

    return { ok: true, data: result.data ?? null };
  } catch (error) {
    console.error(`Flashy: ${method} ${path} request error:`, error);
    return { ok: false, data: null };
  }
}

export async function getContact(email: string): Promise<FlashyContact | null> {
  // Flashy answers 400 (not 404) when the contact does not exist - both just
  // mean "not found" here, so neither is worth logging.
  const { data } = await flashyFetch<FlashyContact>(
    `/contact/${encodeURIComponent(email)}?primary_key=email`,
    { silentStatuses: [400, 404] }
  );
  return data;
}

// A contact counts as a club member when it carries a truthy entry for the
// club list (the value is Flashy's marketing-eligibility flag).
export function isInClubList(contact: FlashyContact | null): boolean {
  return Boolean(contact?.lists?.[clubListId()]);
}

export async function upsertClubContact(params: {
  email: string;
  firstName?: string;
}): Promise<boolean> {
  const contact: Record<string, unknown> = {
    email: params.email,
    lists: { [clubListId()]: true },
  };
  if (params.firstName) {
    contact.first_name = params.firstName;
  }

  const { ok } = await flashyFetch('/contact', {
    method: 'POST',
    body: { primary_key: 'email', overwrite: true, contact },
  });
  return ok;
}

export async function sendTransactionalEmail(params: {
  toEmail: string;
  toName?: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const fromEmail = process.env.FLASHY_FROM_EMAIL;
  if (!fromEmail) {
    console.error('Flashy: missing FLASHY_FROM_EMAIL');
    return false;
  }

  const { ok } = await flashyFetch('/messages/email', {
    method: 'POST',
    body: {
      message: {
        html: params.html,
        subject: params.subject,
        from: { name: process.env.FLASHY_FROM_NAME || 'KidCode', email: fromEmail },
        to: { name: params.toName || '', email: params.toEmail },
      },
    },
  });
  return ok;
}

export async function sendEvent(
  event: FlashyEventName,
  body: { email: string } & Record<string, unknown>
): Promise<boolean> {
  const { ok } = await flashyFetch('/event', {
    method: 'POST',
    body: { event, body },
  });
  return ok;
}
