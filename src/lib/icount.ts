// iCount API Client
// Documentation: https://api.icount.co.il/api/v3.php

const ICOUNT_API_URL = 'https://api.icount.co.il/api/v3.php';

// Types
export interface ICountCredentials {
  cid: string;
  user: string;
  pass: string;
}

export interface ICountSession {
  sid: string;
}

export interface ICountDocItem {
  description: string;
  unitprice: number;
  quantity: number;
}

export interface ICountCustomer {
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_address?: string;
  client_city?: string;
}

export interface ICountPaymentPageRequest {
  sid: string;
  doctype: 'invrec'; // Tax Invoice Receipt (חשבונית מס קבלה)
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_address?: string;
  client_city?: string;
  items: ICountDocItem[];
  currency_code?: string;
  send_email?: boolean;
  success_url: string;
  failure_url: string;
  custom_data?: string; // We'll store orderId here
}

export interface ICountResponse<T = unknown> {
  status: boolean;
  error_description?: string;
  data?: T;
}

export interface ICountPaymentPageResponse {
  status: boolean;
  payment_page_url?: string;
  payment_id?: string;
  error_description?: string;
}

export interface ICountDocCreateResponse {
  status: boolean;
  doc_id?: string;
  doc_number?: string;
  doc_url?: string;
  error_description?: string;
}

// Get iCount credentials from environment
function getCredentials(): ICountCredentials {
  const cid = process.env.ICOUNT_CID;
  const user = process.env.ICOUNT_USER;
  const pass = process.env.ICOUNT_PASS;

  if (!cid || !user || !pass) {
    throw new Error('Missing iCount credentials in environment variables');
  }

  return { cid, user, pass };
}

// Login to iCount and get session ID
export async function icountLogin(): Promise<string> {
  const credentials = getCredentials();

  const response = await fetch(`${ICOUNT_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!data.status) {
    throw new Error(data.error_description || 'iCount login failed');
  }

  return data.sid;
}

// Create payment page URL for redirect flow
export async function icountCreatePaymentPage(
  session: string,
  customer: ICountCustomer,
  items: Array<{ name: string; price: number; quantity: number }>,
  orderId: string,
  successUrl: string,
  failureUrl: string
): Promise<ICountPaymentPageResponse> {
  const docItems: ICountDocItem[] = items.map((item) => ({
    description: item.name,
    unitprice: item.price,
    quantity: item.quantity,
  }));

  const response = await fetch(`${ICOUNT_API_URL}/payment_page/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sid: session,
      doctype: 'invrec',
      client_name: customer.client_name,
      client_email: customer.client_email,
      client_phone: customer.client_phone,
      client_address: customer.client_address,
      client_city: customer.client_city,
      items: docItems,
      currency_code: 'ILS',
      send_email: true,
      success_url: successUrl,
      failure_url: failureUrl,
      custom_data: orderId,
      lang: 'he',
    }),
  });

  return response.json();
}

// Create invoice/receipt document directly (for webhook callback)
export async function icountCreateDocument(
  session: string,
  customer: ICountCustomer,
  items: Array<{ name: string; price: number; quantity: number }>,
  paymentInfo: {
    cc_last_digits?: string;
    cc_type?: string;
    transaction_id?: string;
  }
): Promise<ICountDocCreateResponse> {
  const docItems: ICountDocItem[] = items.map((item) => ({
    description: item.name,
    unitprice: item.price,
    quantity: item.quantity,
  }));

  const response = await fetch(`${ICOUNT_API_URL}/doc/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sid: session,
      doctype: 'invrec',
      client_name: customer.client_name,
      client_email: customer.client_email,
      client_phone: customer.client_phone,
      client_address: customer.client_address,
      client_city: customer.client_city,
      items: docItems,
      currency_code: 'ILS',
      send_email: true,
      lang: 'he',
      paid: true,
      pay_method: 'cc',
      ...paymentInfo,
    }),
  });

  return response.json();
}

// Verify payment status
export async function icountGetPaymentStatus(
  session: string,
  paymentId: string
): Promise<ICountResponse> {
  const response = await fetch(`${ICOUNT_API_URL}/payment_page/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sid: session,
      payment_id: paymentId,
    }),
  });

  return response.json();
}

// Detect card type from card number (utility)
export function detectCardType(cardNumber: string): number {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 1; // Visa
  if (/^5[1-5]/.test(cleaned)) return 2; // MasterCard
  if (/^3[68]/.test(cleaned)) return 3; // Diners
  if (/^3[47]/.test(cleaned)) return 4; // Amex
  return 1; // Default to Visa
}
