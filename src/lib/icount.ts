// iCount API Client
// Documentation: https://api.icount.co.il/api/v3.php
// Based on official OpenAPI specs

const ICOUNT_API_BASE = 'https://api.icount.co.il/api/v3.php';

// ============ Types ============

export interface ICountCredentials {
  cid: string;
  user: string;
  pass: string;
}

export interface ICountAuthResponse {
  status: boolean;
  reason?: string;
  error_description?: string;
  sid?: string;
  cid?: string;
  user?: string;
  user_id?: number;
}

export interface ICountPayPageItem {
  description: string;
  description_he?: string;
  description_en?: string;
  unitprice?: number;        // Price excluding VAT
  unitprice_incl?: number;   // Price including VAT (takes precedence)
  quantity: number;
  sku?: string;
}

export interface ICountCreatePayPageRequest {
  // Auth (either sid OR cid+user+pass)
  sid?: string;
  cid?: string;
  user?: string;
  pass?: string;
  // Required
  page_name: string;
  currency_id: number;       // 1=ILS, 2=USD, 3=EUR
  items: ICountPayPageItem[];
  // Optional
  page_name_en?: string;
  header_text?: string;
  doctype?: string;          // 'invrec' for חשבונית מס קבלה
  success_url?: string;
  ipn_url?: string;
  require_phone?: boolean;
  require_fname_lname?: boolean;
  request_address?: boolean;
  page_lang?: string;        // 'he' | 'en' | 'auto'
  max_payments?: number;
}

export interface ICountCreatePayPageResponse {
  status: boolean;
  reason?: string;
  error_description?: string;
  paypage_id?: number;
}

export interface ICountGenerateSaleRequest {
  // Auth (either sid OR cid+user+pass)
  sid?: string;
  cid?: string;
  user?: string;
  pass?: string;
  // Required
  paypage_id: number;
  // Optional - dynamic items override paypage items
  items?: ICountPayPageItem[];
  currency_id?: number;
  currency_code?: string;    // 'ILS', 'USD', 'EUR'
  // Customer info
  client_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  vat_id?: string;
  // Address
  city?: string;
  street?: string;
  street_num?: string;
  zip?: string;
  country_code?: string;     // 2-letter code
  // URLs
  success_url?: string;
  failure_url?: string;
  cancel_url?: string;
  ipn_url?: string;          // Server-to-server notification URL
  // Other
  page_lang?: string;
  max_payments?: number;
  is_iframe?: boolean;
}

export interface ICountGenerateSaleResponse {
  status: boolean;
  reason?: string;
  error_description?: string;
  paypage_id?: string;
  sale_uniqid?: string;      // Unique sale identifier
  sale_sid?: string;
  sale_url?: string;         // URL to redirect customer (expires after 2 hours)
}

export interface ICountPayPageInfoRequest {
  sid?: string;
  cid?: string;
  user?: string;
  pass?: string;
  paypage_id: number;
}

export interface ICountPayPageInfoResponse {
  status: boolean;
  reason?: string;
  error_description?: string;
  paypage_id?: number;
  page_name?: string;
}

// IPN (Instant Payment Notification) payload from iCount
export interface ICountIPNPayload {
  sale_uniqid: string;
  paypage_id: string;
  doc_id?: string;
  doc_number?: string;
  doc_type?: string;
  client_name?: string;
  client_email?: string;
  total_sum?: string;
  currency?: string;
  status?: string;
  confirmation_code?: string;
  custom_fields?: Record<string, string>;
}

// ============ Helper Functions ============

function getCredentials(): ICountCredentials {
  const cid = process.env.ICOUNT_CID;
  const user = process.env.ICOUNT_USER;
  const pass = process.env.ICOUNT_PASS;

  if (!cid || !user || !pass) {
    throw new Error('Missing iCount credentials in environment variables');
  }

  return { cid, user, pass };
}

async function icountRequest<T>(
  endpoint: string,
  body: object
): Promise<T> {
  const response = await fetch(`${ICOUNT_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`iCount API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ============ Auth API ============

export async function icountLogin(): Promise<string> {
  const credentials = getCredentials();

  const data = await icountRequest<ICountAuthResponse>('/auth/login', credentials);

  if (!data.status || !data.sid) {
    throw new Error(data.error_description || 'iCount login failed');
  }

  return data.sid;
}

export async function icountLogout(sid: string): Promise<void> {
  await icountRequest('/auth/logout', { sid });
}

// ============ PayPage API ============

/**
 * Create a base PayPage template (one-time setup)
 * This creates a reusable payment page configuration
 */
export async function icountCreatePayPage(
  options: {
    pageName: string;
    doctype?: string;
    successUrl?: string;
    ipnUrl?: string;
  }
): Promise<ICountCreatePayPageResponse> {
  const credentials = getCredentials();

  // Create a minimal paypage - items will be passed dynamically via generate_sale
  return icountRequest<ICountCreatePayPageResponse>('/paypage/create', {
    ...credentials,
    page_name: options.pageName,
    page_name_en: options.pageName,
    currency_id: 1, // ILS
    items: [{ description: 'פריט', unitprice: 1, quantity: 1 }], // Placeholder, will be overridden
    doctype: options.doctype || 'invrec', // חשבונית מס קבלה
    success_url: options.successUrl,
    ipn_url: options.ipnUrl,
    require_phone: true,
    request_address: true,
    page_lang: 'he',
    max_payments: 3,
  });
}

/**
 * Generate a one-time sale URL for a specific transaction
 * The URL expires after 2 hours
 */
export async function icountGenerateSale(
  request: Omit<ICountGenerateSaleRequest, 'cid' | 'user' | 'pass'>
): Promise<ICountGenerateSaleResponse> {
  const credentials = getCredentials();

  return icountRequest<ICountGenerateSaleResponse>('/paypage/generate_sale', {
    ...credentials,
    ...request,
  });
}

/**
 * Get PayPage information
 */
export async function icountGetPayPageInfo(
  paypageId: number
): Promise<ICountPayPageInfoResponse> {
  const credentials = getCredentials();

  return icountRequest<ICountPayPageInfoResponse>('/paypage/info', {
    ...credentials,
    paypage_id: paypageId,
  });
}

/**
 * Get list of PayPages
 */
export async function icountGetPayPageList(): Promise<{
  status: boolean;
  reason?: string;
  error_description?: string;
  paypages?: Array<{ paypage_id: number; page_name: string }>;
}> {
  const credentials = getCredentials();

  return icountRequest('/paypage/get_list', credentials);
}

// ============ Convenience Functions ============

/**
 * Create a payment URL for a customer order
 * This is the main function to use for checkout
 */
export async function createPaymentUrl(options: {
  paypageId: number;
  items: Array<{ name: string; price: number; quantity: number }>;
  customer: {
    name: string;
    email: string;
    phone?: string;
    city?: string;
    street?: string;
    streetNum?: string;
  };
  orderId: string;
  successUrl: string;
  failureUrl: string;
  ipnUrl: string;
}): Promise<{ saleUrl: string; saleUniqid: string }> {
  const { paypageId, items, customer, successUrl, failureUrl, ipnUrl } = options;

  // Convert items to iCount format
  const icountItems: ICountPayPageItem[] = items.map((item) => ({
    description: item.name,
    unitprice_incl: item.price,  // Price including VAT
    quantity: item.quantity,
  }));

  const response = await icountGenerateSale({
    paypage_id: paypageId,
    items: icountItems,
    currency_code: 'ILS',
    client_name: customer.name,
    email: customer.email,
    phone: customer.phone,
    city: customer.city,
    street: customer.street,
    street_num: customer.streetNum,
    country_code: 'IL',
    success_url: successUrl,
    failure_url: failureUrl,
    ipn_url: ipnUrl,
    page_lang: 'he',
    max_payments: 1,
  });

  if (!response.status || !response.sale_url) {
    throw new Error(response.error_description || 'Failed to generate sale URL');
  }

  return {
    saleUrl: response.sale_url,
    saleUniqid: response.sale_uniqid || '',
  };
}

/**
 * Verify IPN payload has required fields
 */
export function verifyIPNPayload(payload: ICountIPNPayload): boolean {
  return !!(payload.sale_uniqid && payload.paypage_id);
}
