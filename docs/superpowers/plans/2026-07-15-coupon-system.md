# Coupon System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add promotable coupon codes (percentage / fixed amount) that stack on the automatic bundle discount, managed from a dedicated admin page and applied at checkout — with all discount math authoritative on the server.

**Architecture:** A `coupons` table in Neon; pure validation/discount logic in `src/lib/coupons.ts`; the bundle-discount logic extracted to `src/lib/bundle-discount.ts` so client and server share one source of truth. A public preview endpoint feeds the checkout UI; the checkout API re-validates and recomputes subtotal + bundle + coupon server-side (never trusting client numbers) and passes discounts to iCount as negative line items. `used_count` increments only when an order reaches PAID.

**Tech Stack:** Next.js 16 App Router (route handlers, server components), `@neondatabase/serverless` (tagged-template `sql`), iCount PayPage, Tailwind v4, Vitest (added here for the pure-logic unit tests).

## Global Constraints

- TypeScript strict; no `any` in committed code.
- All UI text Hebrew, RTL. No emojis in code/comments.
- Discounts pass to iCount as negative line items (existing pattern: `{ name, price: -amount, quantity: 1 }`).
- Neon `sql` is a tagged template — interpolated `${}` values are parameterized; never string-concatenate SQL.
- No migration framework: schema changes run via a one-off script in `scripts/`.
- Percentage discount applies to the **pre-bundle items subtotal**, rounded to whole shekels.
- Coupon discount is clamped so `couponDiscount ≤ subtotal − bundleDiscount` (product total never negative); shipping still charged.
- `used_count` increments only on the PENDING→PAID transition.
- Admin routes are gated by the `admin_session` cookie (`value === 'authenticated'`).
- Dev server may bind to a port other than 3000 if 3000 is busy — read the actual port from the dev log before curling.

---

### Task 1: Add Vitest + extract bundle-discount to a shared lib

**Files:**
- Modify: `package.json` (add `vitest` devDependency + `test` script)
- Create: `src/lib/bundle-discount.ts`
- Test: `src/lib/bundle-discount.test.ts`
- Modify: `src/components/CartProvider.tsx:115-155` (use the shared lib)

**Interfaces:**
- Produces: `computeBundleDiscount(items: BundleItem[]): { bundleDiscount: number; bundleName: string | null }`, `interface BundleItem { productId: string; quantity: number }`

- [ ] **Step 1: Add Vitest**

Run: `npm i -D vitest`
Then add to `package.json` `"scripts"`: `"test": "vitest run"`.

- [ ] **Step 2: Write the failing test**

Create `src/lib/bundle-discount.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computeBundleDiscount } from './bundle-discount';

const all3Books = [
  { productId: 'ai-book', quantity: 1 },
  { productId: 'encryption-book', quantity: 1 },
  { productId: 'algorithms-book', quantity: 1 },
];
const oneOfEachWorkbook = [
  { productId: 'ai-workbook', quantity: 1 },
  { productId: 'encryption-workbook', quantity: 1 },
  { productId: 'algorithms-workbook', quantity: 1 },
];

describe('computeBundleDiscount', () => {
  it('no discount without all 3 books', () => {
    expect(computeBundleDiscount([{ productId: 'ai-book', quantity: 1 }]))
      .toEqual({ bundleDiscount: 0, bundleName: null });
  });
  it('15 for 3 books only', () => {
    expect(computeBundleDiscount(all3Books))
      .toEqual({ bundleDiscount: 15, bundleName: 'מארז הספרים' });
  });
  it('45 for 3 books + 1 of each workbook', () => {
    expect(computeBundleDiscount([...all3Books, ...oneOfEachWorkbook]))
      .toEqual({ bundleDiscount: 45, bundleName: 'מארז החוקרים הצעירים' });
  });
  it('115 for 3 books + 2 of each workbook', () => {
    const two = oneOfEachWorkbook.map((w) => ({ ...w, quantity: 2 }));
    expect(computeBundleDiscount([...all3Books, ...two]))
      .toEqual({ bundleDiscount: 115, bundleName: 'מארז המומחים' });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/bundle-discount.test.ts`
Expected: FAIL — cannot find module `./bundle-discount`.

- [ ] **Step 4: Implement the lib**

Create `src/lib/bundle-discount.ts`:

```ts
export interface BundleItem {
  productId: string;
  quantity: number;
}

export interface BundleResult {
  bundleDiscount: number;
  bundleName: string | null;
}

const BUNDLE_BOOK_IDS = ['ai-book', 'encryption-book', 'algorithms-book'];
const BUNDLE_WORKBOOK_IDS = ['ai-workbook', 'encryption-workbook', 'algorithms-workbook'];

export function computeBundleDiscount(items: BundleItem[]): BundleResult {
  const qty = (id: string) =>
    items.filter((i) => i.productId === id).reduce((sum, i) => sum + i.quantity, 0);

  const hasAllBooks = BUNDLE_BOOK_IDS.every((id) => qty(id) >= 1);
  const minWorkbook = Math.min(...BUNDLE_WORKBOOK_IDS.map(qty));

  if (hasAllBooks) {
    if (minWorkbook >= 2) return { bundleDiscount: 115, bundleName: 'מארז המומחים' };
    if (minWorkbook >= 1) return { bundleDiscount: 45, bundleName: 'מארז החוקרים הצעירים' };
    return { bundleDiscount: 15, bundleName: 'מארז הספרים' };
  }
  return { bundleDiscount: 0, bundleName: null };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/bundle-discount.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Refactor CartProvider to use the shared lib**

In `src/components/CartProvider.tsx`: add `import { computeBundleDiscount } from '@/lib/bundle-discount';` near the other imports. Replace the block from `// Bundle detection...` (the `BUNDLE_BOOK_IDS` / `getItemQuantity` / `hasAllBooks` / `if (hasAllBooks) {...}` section, currently ~lines 115-150) with:

```ts
  // Bundle detection (shared with the checkout server so both agree)
  const { bundleDiscount, bundleName } = computeBundleDiscount(
    items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
  );
```

Leave the lines below it (`const hasBundle = bundleDiscount > 0;`, `subtotal`, `total`, `itemCount`) unchanged.

- [ ] **Step 7: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: no type errors; build succeeds.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/lib/bundle-discount.ts src/lib/bundle-discount.test.ts src/components/CartProvider.tsx
git commit -m "refactor: extract bundle-discount into shared lib with tests"
```

---

### Task 2: Coupon validation + discount lib (pure)

**Files:**
- Create: `src/lib/coupons.ts`
- Test: `src/lib/coupons.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type DiscountType = 'percent' | 'fixed'`
  - `interface Coupon { id: string; code: string; discount_type: DiscountType; discount_value: number; min_subtotal: number | null; max_uses: number | null; used_count: number; active: boolean; expires_at: string | null }`
  - `interface CouponValidation { valid: boolean; discount: number; message: string; code: string | null }`
  - `normalizeCode(code: string): string`
  - `parseCouponRow(row: Record<string, unknown>): Coupon` — coerces Neon's string `numeric` columns to numbers
  - `computeCouponDiscount(coupon: Pick<Coupon,'discount_type'|'discount_value'>, subtotal: number, bundleDiscount: number): number`
  - `validateCoupon(coupon: Coupon | null, subtotal: number, bundleDiscount: number, now: Date): CouponValidation`

- [ ] **Step 1: Write the failing test**

Create `src/lib/coupons.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { normalizeCode, parseCouponRow, computeCouponDiscount, validateCoupon, type Coupon } from './coupons';

const base: Coupon = {
  id: '1', code: 'SAVE10', discount_type: 'percent', discount_value: 10,
  min_subtotal: null, max_uses: null, used_count: 0, active: true, expires_at: null,
};
const now = new Date('2026-07-15T00:00:00Z');

describe('normalizeCode', () => {
  it('trims and uppercases', () => expect(normalizeCode('  save10 ')).toBe('SAVE10'));
});

describe('parseCouponRow', () => {
  it('coerces string numerics from the DB to numbers', () => {
    const row = {
      id: 'abc', code: 'SAVE10', discount_type: 'percent', discount_value: '10',
      min_subtotal: '150', max_uses: 100, used_count: 3, active: true, expires_at: null,
    };
    const c = parseCouponRow(row);
    expect(c.discount_value).toBe(10);
    expect(c.min_subtotal).toBe(150);
    expect(c.used_count).toBe(3);
  });
});

describe('computeCouponDiscount', () => {
  it('percent rounds to whole shekels', () =>
    expect(computeCouponDiscount({ discount_type: 'percent', discount_value: 10 }, 315, 0)).toBe(32));
  it('fixed is flat', () =>
    expect(computeCouponDiscount({ discount_type: 'fixed', discount_value: 20 }, 315, 0)).toBe(20));
  it('clamps so product total never goes negative', () =>
    expect(computeCouponDiscount({ discount_type: 'fixed', discount_value: 500 }, 315, 45)).toBe(270));
});

describe('validateCoupon', () => {
  it('rejects unknown code', () =>
    expect(validateCoupon(null, 100, 0, now).valid).toBe(false));
  it('rejects inactive', () =>
    expect(validateCoupon({ ...base, active: false }, 315, 0, now).valid).toBe(false));
  it('rejects expired', () =>
    expect(validateCoupon({ ...base, expires_at: '2026-07-14T00:00:00Z' }, 315, 0, now).valid).toBe(false));
  it('rejects when used up', () =>
    expect(validateCoupon({ ...base, max_uses: 5, used_count: 5 }, 315, 0, now).valid).toBe(false));
  it('rejects below minimum', () =>
    expect(validateCoupon({ ...base, min_subtotal: 400 }, 315, 0, now).valid).toBe(false));
  it('accepts a valid coupon and returns discount', () => {
    const r = validateCoupon(base, 315, 0, now);
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(32);
    expect(r.code).toBe('SAVE10');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/coupons.test.ts`
Expected: FAIL — cannot find module `./coupons`.

- [ ] **Step 3: Implement the lib**

Create `src/lib/coupons.ts`:

```ts
export type DiscountType = 'percent' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_subtotal: number | null;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
}

export interface CouponValidation {
  valid: boolean;
  discount: number;
  message: string;
  code: string | null;
}

export function normalizeCode(code: string): string {
  return (code || '').trim().toUpperCase();
}

// Neon returns `numeric` columns as strings; coerce a raw DB row to a Coupon.
export function parseCouponRow(row: Record<string, unknown>): Coupon {
  return {
    id: String(row.id),
    code: String(row.code),
    discount_type: row.discount_type as DiscountType,
    discount_value: Number(row.discount_value),
    min_subtotal: row.min_subtotal == null ? null : Number(row.min_subtotal),
    max_uses: row.max_uses == null ? null : Number(row.max_uses),
    used_count: Number(row.used_count),
    active: Boolean(row.active),
    expires_at: row.expires_at == null ? null : String(row.expires_at),
  };
}

export function computeCouponDiscount(
  coupon: Pick<Coupon, 'discount_type' | 'discount_value'>,
  subtotal: number,
  bundleDiscount: number
): number {
  const raw =
    coupon.discount_type === 'percent'
      ? Math.round((subtotal * coupon.discount_value) / 100)
      : coupon.discount_value;
  const maxAllowed = Math.max(0, subtotal - bundleDiscount);
  return Math.max(0, Math.min(raw, maxAllowed));
}

export function validateCoupon(
  coupon: Coupon | null,
  subtotal: number,
  bundleDiscount: number,
  now: Date
): CouponValidation {
  const fail = (message: string): CouponValidation => ({ valid: false, discount: 0, code: null, message });

  if (!coupon) return fail('קוד קופון לא תקין');
  if (!coupon.active) return fail('הקופון אינו פעיל');
  if (coupon.expires_at && new Date(coupon.expires_at) <= now) return fail('תוקף הקופון פג');
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) return fail('הקופון מוצה');
  if (coupon.min_subtotal != null && subtotal < coupon.min_subtotal)
    return fail(`הקופון תקף בהזמנה מעל ₪${coupon.min_subtotal}`);

  const discount = computeCouponDiscount(coupon, subtotal, bundleDiscount);
  if (discount <= 0) return fail('הקופון אינו חל על הזמנה זו');

  return { valid: true, discount, code: coupon.code, message: 'הקופון הוחל' };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/coupons.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/coupons.ts src/lib/coupons.test.ts
git commit -m "feat: coupon validation and discount logic with tests"
```

---

### Task 3: Create the DB schema

**Files:**
- Create: `scripts/create-coupons-table.mjs`

- [ ] **Step 1: Write the DDL script**

Create `scripts/create-coupons-table.mjs`:

```js
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL not set');
const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS coupons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    discount_type text NOT NULL,
    discount_value numeric NOT NULL,
    min_subtotal numeric,
    max_uses integer,
    used_count integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    expires_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
  )
`;
await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code text`;
await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount numeric NOT NULL DEFAULT 0`;

console.log('coupons table + orders columns ready');
```

- [ ] **Step 2: Run it against Neon**

Run: `node --env-file=.env.local scripts/create-coupons-table.mjs`
Expected: prints `coupons table + orders columns ready`.
(If the Node version predates `--env-file`, prefix with the var: `DATABASE_URL="$(grep -m1 '^DATABASE_URL=' .env.local | cut -d= -f2-)" node scripts/create-coupons-table.mjs`.)

- [ ] **Step 3: Verify the schema**

Run:
```bash
node --env-file=.env.local -e "import('@neondatabase/serverless').then(async ({neon})=>{const sql=neon(process.env.DATABASE_URL);console.log(await sql\`SELECT column_name FROM information_schema.columns WHERE table_name='coupons' ORDER BY column_name\`);})"
```
Expected: lists `active, code, created_at, discount_type, discount_value, expires_at, id, max_uses, min_subtotal, used_count`.

- [ ] **Step 4: Commit**

```bash
git add scripts/create-coupons-table.mjs
git commit -m "chore: coupons table DDL script"
```

---

### Task 4: Coupon preview endpoint

**Files:**
- Create: `src/app/api/coupons/validate/route.ts`

**Interfaces:**
- Consumes: `normalizeCode`, `validateCoupon`, `Coupon` from `@/lib/coupons`; `sql` from `@/lib/db`.
- Produces: `POST /api/coupons/validate` accepting `{ code, subtotal, bundleDiscount }` → `CouponValidation` JSON.

- [ ] **Step 1: Implement the route**

Create `src/app/api/coupons/validate/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { normalizeCode, parseCouponRow, validateCoupon } from '@/lib/coupons';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = normalizeCode(body.code || '');
    const subtotal = Number(body.subtotal) || 0;
    const bundleDiscount = Number(body.bundleDiscount) || 0;

    if (!code) {
      return NextResponse.json({ valid: false, discount: 0, code: null, message: 'יש להזין קוד קופון' });
    }

    const rows = await sql`SELECT * FROM coupons WHERE code = ${code} LIMIT 1`;
    const coupon = rows[0] ? parseCouponRow(rows[0] as Record<string, unknown>) : null;
    const result = validateCoupon(coupon, subtotal, bundleDiscount, new Date());
    return NextResponse.json(result);
  } catch (error) {
    console.error('Coupon validate error:', error);
    return NextResponse.json(
      { valid: false, discount: 0, code: null, message: 'שגיאה בבדיקת הקופון' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Seed a test coupon + verify**

Start dev server: `npm run dev` (note the port from the output; assume 3000 below, else substitute).
Seed a coupon:
```bash
node --env-file=.env.local -e "import('@neondatabase/serverless').then(async ({neon})=>{const sql=neon(process.env.DATABASE_URL);await sql\`INSERT INTO coupons (code,discount_type,discount_value) VALUES ('SAVE10','percent',10) ON CONFLICT (code) DO NOTHING\`;console.log('seeded');})"
```
Verify valid:
```bash
curl -s -X POST http://localhost:3000/api/coupons/validate -H "Content-Type: application/json" -d '{"code":"save10","subtotal":315,"bundleDiscount":0}'
```
Expected: `{"valid":true,"discount":32,"code":"SAVE10","message":"הקופון הוחל"}`
Verify invalid:
```bash
curl -s -X POST http://localhost:3000/api/coupons/validate -H "Content-Type: application/json" -d '{"code":"NOPE","subtotal":315,"bundleDiscount":0}'
```
Expected: `{"valid":false,...,"message":"קוד קופון לא תקין"}`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/coupons/validate/route.ts
git commit -m "feat: coupon preview endpoint"
```

---

### Task 5: Admin coupon CRUD API

**Files:**
- Create: `src/app/api/coupons/route.ts`

**Interfaces:**
- Produces: `GET /api/coupons` (list), `POST` (create), `PATCH` (toggle active), `DELETE ?id=` — all admin-cookie gated. Create accepts `{ code, discount_type, discount_value, min_subtotal?, max_uses?, active?, expires_at? }`.

- [ ] **Step 1: Implement the route**

Create `src/app/api/coupons/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { normalizeCode } from '@/lib/coupons';

async function isAdmin(): Promise<boolean> {
  const session = (await cookies()).get('admin_session');
  return session?.value === 'authenticated';
}

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  const coupons = await sql`SELECT * FROM coupons ORDER BY created_at DESC`;
  return NextResponse.json({ coupons });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const body = await request.json();
  const code = normalizeCode(body.code || '');
  if (!code) return NextResponse.json({ error: 'קוד חסר' }, { status: 400 });
  if (body.discount_type !== 'percent' && body.discount_type !== 'fixed') {
    return NextResponse.json({ error: 'סוג הנחה לא תקין' }, { status: 400 });
  }
  const value = Number(body.discount_value);
  if (!(value > 0)) return NextResponse.json({ error: 'ערך הנחה לא תקין' }, { status: 400 });

  const minSubtotal =
    body.min_subtotal !== undefined && body.min_subtotal !== null && body.min_subtotal !== ''
      ? Number(body.min_subtotal) : null;
  const maxUses =
    body.max_uses !== undefined && body.max_uses !== null && body.max_uses !== ''
      ? Number(body.max_uses) : null;
  const active = body.active !== false;
  const expiresAt = body.expires_at ? body.expires_at : null;

  try {
    const rows = await sql`
      INSERT INTO coupons (code, discount_type, discount_value, min_subtotal, max_uses, active, expires_at)
      VALUES (${code}, ${body.discount_type}, ${value}, ${minSubtotal}, ${maxUses}, ${active}, ${expiresAt})
      RETURNING *
    `;
    return NextResponse.json({ coupon: rows[0] });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: 'קוד קופון כבר קיים' }, { status: 409 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const rows = await sql`UPDATE coupons SET active = ${body.active} WHERE id = ${body.id} RETURNING *`;
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ coupon: rows[0] });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await sql`DELETE FROM coupons WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Verify auth + CRUD**

With dev server running:
```bash
# no auth -> 401
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/coupons
# create with auth
curl -s -X POST http://localhost:3000/api/coupons -H "Content-Type: application/json" -H "Cookie: admin_session=authenticated" -d '{"code":"WELCOME20","discount_type":"fixed","discount_value":20,"min_subtotal":150}'
# list
curl -s -H "Cookie: admin_session=authenticated" http://localhost:3000/api/coupons | head -c 400
```
Expected: `401`; then a created coupon JSON; then a list including `WELCOME20`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/coupons/route.ts
git commit -m "feat: admin coupon CRUD API"
```

---

### Task 6: Admin coupons page

**Files:**
- Create: `src/app/admin/coupons/page.tsx`
- Modify: `src/app/admin/page.tsx` (add a link to `/admin/coupons` near the header)

**Interfaces:**
- Consumes: `Coupon` type from `@/lib/coupons`; `GET/POST/PATCH/DELETE /api/coupons`.

- [ ] **Step 1: Implement the coupons admin page**

Create `src/app/admin/coupons/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Ticket, Trash2, Plus } from 'lucide-react';
import type { Coupon } from '@/lib/coupons';

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '', discount_type: 'percent', discount_value: '',
    min_subtotal: '', max_uses: '', expires_at: '',
  });

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/coupons');
    if (res.ok) {
      const data = await res.json();
      setCoupons(data.coupons || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ code: '', discount_type: 'percent', discount_value: '', min_subtotal: '', max_uses: '', expires_at: '' });
      load();
    } else {
      const data = await res.json();
      setError(data.error || 'שגיאה ביצירת קופון');
    }
  };

  const toggle = async (c: Coupon) => {
    await fetch('/api/coupons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id, active: !c.active }),
    });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Ticket className="w-8 h-8" />
            קופונים
          </h1>
          <Link href="/admin" className="inline-flex items-center gap-1 font-bold text-gray-600 hover:text-[#545454]">
            <ChevronRight className="w-5 h-5" />
            חזרה להזמנות
          </Link>
        </div>

        {/* Create form */}
        <form onSubmit={create} className="bg-white border-4 border-[#545454] rounded-xl p-4 hard-shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="קוד (למשל SAVE10)" className="input-brutal rounded-lg p-3 bg-gray-50" />
          <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="input-brutal rounded-lg p-3 bg-gray-50">
            <option value="percent">אחוז (%)</option>
            <option value="fixed">סכום קבוע (₪)</option>
          </select>
          <input required type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder="ערך ההנחה" className="input-brutal rounded-lg p-3 bg-gray-50" />
          <input type="number" value={form.min_subtotal} onChange={(e) => setForm({ ...form, min_subtotal: e.target.value })} placeholder="מינימום הזמנה (אופציונלי)" className="input-brutal rounded-lg p-3 bg-gray-50" />
          <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="מקסימום שימושים (אופציונלי)" className="input-brutal rounded-lg p-3 bg-gray-50" />
          <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="input-brutal rounded-lg p-3 bg-gray-50" />
          <button type="submit" className="btn-retro bg-pink-500 text-white font-bold rounded-lg px-4 py-3 border-2 border-[#545454] flex items-center justify-center gap-2 md:col-span-3">
            <Plus className="w-5 h-5" />
            צור קופון
          </button>
          {error && <p className="text-red-600 font-bold md:col-span-3">{error}</p>}
        </form>

        {/* List */}
        {loading ? (
          <p className="text-center text-gray-500 font-bold">טוען...</p>
        ) : coupons.length === 0 ? (
          <p className="text-center text-gray-500 font-bold">אין קופונים עדיין</p>
        ) : (
          <div className="space-y-3">
            {coupons.map((c) => (
              <div key={c.id} className="bg-white border-4 border-[#545454] rounded-xl p-4 hard-shadow flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-black text-lg">{c.code}</span>
                  <span className="text-gray-600 mr-2">
                    {c.discount_type === 'percent' ? `${c.discount_value}%` : `₪${c.discount_value}`}
                  </span>
                  {c.min_subtotal != null && <span className="text-sm text-gray-500 mr-2">מעל ₪{c.min_subtotal}</span>}
                  {c.max_uses != null && <span className="text-sm text-gray-500 mr-2">{c.used_count}/{c.max_uses} שימושים</span>}
                  {c.expires_at && <span className="text-sm text-gray-500 mr-2">עד {new Date(c.expires_at).toLocaleDateString('he-IL')}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggle(c)} className={`font-bold rounded-lg px-3 py-2 border-2 border-[#545454] ${c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.active ? 'פעיל' : 'כבוי'}
                  </button>
                  <button onClick={() => remove(c.id)} className="text-red-600 hover:text-red-800 p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add a link from the orders admin**

In `src/app/admin/page.tsx`, in the header row (the `flex justify-between items-center mb-8` block with the `התנתק` button), add a link before the logout button. Import `Ticket` and `Link`, then place:

```tsx
<Link href="/admin/coupons" className="inline-flex items-center gap-1 font-bold text-gray-600 hover:text-[#545454]">
  <Ticket className="w-5 h-5" />
  קופונים
</Link>
```

(Add `Ticket` to the existing `lucide-react` import and `import Link from 'next/link';` at the top if not present.)

- [ ] **Step 3: Typecheck + build + smoke test**

Run: `npx tsc --noEmit && npm run build`
Then with dev server running: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/coupons` → expect `200` (the client gate handles auth in-browser).

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/coupons/page.tsx src/app/admin/page.tsx
git commit -m "feat: admin coupons management page"
```

---

### Task 7: Server-authoritative checkout (recompute subtotal + bundle + coupon)

**Files:**
- Modify: `src/app/api/checkout/route.ts`

**Interfaces:**
- Consumes: `computeBundleDiscount` from `@/lib/bundle-discount`; `normalizeCode`, `validateCoupon`, `Coupon` from `@/lib/coupons`.
- Produces: orders now persisted with server-computed `total`, `bundle_discount`, `bundle_name`, `coupon_code`, `coupon_discount`; iCount sale carries negative bundle + coupon lines.

- [ ] **Step 1: Add `couponCode` to the request interface**

In `src/app/api/checkout/route.ts`, add to `interface CheckoutRequest` (after `bundleName?`):

```ts
  couponCode?: string;
```

- [ ] **Step 2: Add imports**

At the top, add:

```ts
import { computeBundleDiscount } from '@/lib/bundle-discount';
import { normalizeCode, parseCouponRow, validateCoupon } from '@/lib/coupons';
```

- [ ] **Step 3: Recompute all amounts server-side (replace client trust)**

After the items validation (`if (!body.items || body.items.length === 0) {...}`) and before `// Capture Meta tracking params`, insert:

```ts
    // Server-authoritative amounts — never trust client-sent totals.
    const subtotal = body.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const { bundleDiscount, bundleName } = computeBundleDiscount(
      body.items.map((it) => ({ productId: it.productId, quantity: it.quantity }))
    );

    let couponCode: string | null = null;
    let couponDiscount = 0;
    const rawCode = normalizeCode(body.couponCode || '');
    if (rawCode) {
      const couponRows = await sql`SELECT * FROM coupons WHERE code = ${rawCode} LIMIT 1`;
      const coupon = couponRows[0] ? parseCouponRow(couponRows[0] as Record<string, unknown>) : null;
      const check = validateCoupon(coupon, subtotal, bundleDiscount, new Date());
      if (check.valid) {
        couponCode = check.code;
        couponDiscount = check.discount;
      }
    }

    const shippingCost = body.shippingCost && body.shippingCost > 0 ? body.shippingCost : 0;
    const total = subtotal - bundleDiscount - couponDiscount + shippingCost;
```

- [ ] **Step 4: Persist coupon fields + server total in the INSERT**

Replace the `INSERT INTO orders (...) VALUES (...)` statement with (adds `coupon_code, coupon_discount`, and uses the server `total`, `bundleDiscount`, `bundleName`):

```ts
    const orderResult = await sql`
      INSERT INTO orders (email, first_name, last_name, phone, address, city, total, status, shipping_method, shipping_cost, pickup_point_code, pickup_point_name, bundle_discount, bundle_name, coupon_code, coupon_discount, fb_click_id, fb_browser_id, client_ip, client_ua)
      VALUES (${body.email}, ${body.firstName}, ${body.lastName}, ${body.phone}, ${body.address}, ${body.city}, ${total}, 'PENDING', ${body.shippingMethod || null}, ${shippingCost || null}, ${body.pickupPointCode || null}, ${body.pickupPointName || null}, ${bundleDiscount}, ${bundleName}, ${couponCode}, ${couponDiscount}, ${body.fbc || null}, ${body.fbp || null}, ${clientIp}, ${clientUa})
      RETURNING id, created_at
    `;
```

- [ ] **Step 5: Use server amounts for the iCount lines**

Replace the bundle-discount block (`if (body.bundleDiscount && body.bundleDiscount > 0) {...}`) with:

```ts
      // Add discount lines (server-computed)
      if (bundleDiscount > 0) {
        icountItems.push({ name: 'הנחת מארז', price: -bundleDiscount, quantity: 1 });
      }
      if (couponDiscount > 0 && couponCode) {
        icountItems.push({ name: `קופון: ${couponCode}`, price: -couponDiscount, quantity: 1 });
      }
```

(Leave the shipping-cost block below it unchanged — it already uses `body.shippingCost` / `body.shippingMethod`.)

- [ ] **Step 6: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: passes.

- [ ] **Step 7: Verify server recompute end-to-end**

With dev server running and coupon `SAVE10` seeded (10%), POST a checkout with a forged low total and confirm the server ignores it. Use a real book id/price so bundle logic is exercised minimally:

```bash
curl -s -X POST http://localhost:3000/api/checkout -H "Content-Type: application/json" -d '{"firstName":"בדיקה","lastName":"קופון","email":"t@t.com","phone":"0500000000","city":"תל אביב","address":"הרצל 1","items":[{"productId":"ai-book","name":"בינה מלאכותית לילדים","price":75,"quantity":1}],"couponCode":"save10","shippingMethod":"delivery","shippingCost":40,"total":1}' | head -c 300
```
Then inspect the created order:
```bash
node --env-file=.env.local -e "import('@neondatabase/serverless').then(async ({neon})=>{const sql=neon(process.env.DATABASE_URL);console.log(await sql\`SELECT total, coupon_code, coupon_discount, bundle_discount FROM orders ORDER BY created_at DESC LIMIT 1\`);})"
```
Expected: `coupon_code='SAVE10'`, `coupon_discount=8` (10% of 75 = 7.5 → 8), `total = 75 - 0 - 8 + 40 = 107` (NOT 1). Delete the test order afterward if desired.

- [ ] **Step 8: Commit**

```bash
git add src/app/api/checkout/route.ts
git commit -m "feat: server-authoritative checkout totals with coupon support"
```

---

### Task 8: Coupon field on the checkout page

**Files:**
- Modify: `src/app/checkout/page.tsx`

- [ ] **Step 1: Add coupon state + apply handler**

In `src/app/checkout/page.tsx`, after the `formData` state (around line 34), add:

```ts
  const [couponInput, setCouponInput] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
```

Change `const finalTotal = total + shippingCost;` to:

```ts
  const finalTotal = total + shippingCost - couponDiscount;
```

Add the apply handler after `handleChange`:

```ts
  const applyCoupon = async () => {
    setCouponMsg(null);
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponInput, subtotal, bundleDiscount }),
    });
    const data = await res.json();
    if (data.valid) {
      setCouponDiscount(data.discount);
      setCouponApplied(true);
    } else {
      setCouponDiscount(0);
      setCouponApplied(false);
    }
    setCouponMsg(data.message);
  };
```

- [ ] **Step 2: Send the coupon code in the checkout POST**

In the `fetch('/api/checkout', ...)` body object, add after `bundleName,`:

```ts
          couponCode: couponApplied ? couponInput : undefined,
```

- [ ] **Step 3: Add the coupon input + summary line to the order summary**

In the order summary, inside `<div className="border-t-2 border-[#545454] pt-4 space-y-2">`, immediately AFTER the Bundle Discount block (the `{hasBundle && (...)}`) and BEFORE the Shipping block, add the coupon UI + line:

```tsx
                {/* Coupon input */}
                <div className="flex gap-2 py-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="קוד קופון"
                    className="input-brutal flex-1 rounded-lg p-2 bg-gray-50 text-sm"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="btn-retro bg-[#545454] text-white font-bold rounded-lg px-4 py-2 border-2 border-[#545454] text-sm"
                  >
                    החל
                  </button>
                </div>
                {couponMsg && (
                  <p className={`text-sm ${couponApplied ? 'text-emerald-600' : 'text-red-600'}`}>{couponMsg}</p>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span>הנחת קופון:</span>
                    <span className="font-bold">-₪{couponDiscount}</span>
                  </div>
                )}
```

- [ ] **Step 4: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: passes.

- [ ] **Step 5: Manual verify**

With dev server running, open `/checkout` with items in the cart (add via the shop), enter `SAVE10`, click החל → discount line appears and total drops. Enter a bad code → red error message, total unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/app/checkout/page.tsx
git commit -m "feat: coupon code field on checkout"
```

---

### Task 9: Increment usage on payment

**Files:**
- Create: `src/lib/coupon-usage.ts`
- Modify: `src/app/api/payment/ipn/route.ts`, `src/app/api/payment/verify/route.ts`

**Interfaces:**
- Produces: `incrementCouponUsageForOrder(orderId: string): Promise<void>`

- [ ] **Step 1: Implement the helper**

Create `src/lib/coupon-usage.ts`:

```ts
import { sql } from '@/lib/db';

// Bump a coupon's used_count for a paid order. Safe to call only from the
// PENDING->PAID transition winner (fires at most once per order). If the order
// has no coupon_code, the subquery yields NULL and nothing is updated.
export async function incrementCouponUsageForOrder(orderId: string): Promise<void> {
  await sql`
    UPDATE coupons
    SET used_count = used_count + 1
    WHERE code = (SELECT coupon_code FROM orders WHERE id = ${orderId})
  `;
}
```

- [ ] **Step 2: Call it from the IPN winner**

In `src/app/api/payment/ipn/route.ts`, add the import: `import { incrementCouponUsageForOrder } from '@/lib/coupon-usage';`. Inside `if (paidResult.length > 0) {`, after the `sendOrderPurchaseEvent(...)` call, add:

```ts
        incrementCouponUsageForOrder(order.id).catch((err: unknown) =>
          console.error('Coupon usage bump failed (ipn):', err)
        );
```

- [ ] **Step 3: Call it from the verify winner**

In `src/app/api/payment/verify/route.ts`, add the import: `import { incrementCouponUsageForOrder } from '@/lib/coupon-usage';`. Inside `if (result.length > 0) {`, after the `sendOrderPurchaseEvent(...)` call, add:

```ts
      incrementCouponUsageForOrder(orderId).catch((err: unknown) =>
        console.error('Coupon usage bump failed (verify):', err)
      );
```

- [ ] **Step 4: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: passes.

- [ ] **Step 5: Verify the increment**

With dev server running: create a coupon with a code, create an order carrying it (Task 7 curl but with a fresh coupon), note the order id, then simulate the browser verify:
```bash
# capture the order id from the checkout response, then:
curl -s -X POST http://localhost:3000/api/payment/verify -H "Content-Type: application/json" -d '{"orderId":"<ORDER_ID>"}'
node --env-file=.env.local -e "import('@neondatabase/serverless').then(async ({neon})=>{const sql=neon(process.env.DATABASE_URL);console.log(await sql\`SELECT code, used_count FROM coupons WHERE code='SAVE10'\`);})"
```
Expected: `used_count` incremented by 1. Running verify again for the same order does NOT increment again (the transition already flipped to PAID).

- [ ] **Step 6: Commit**

```bash
git add src/lib/coupon-usage.ts src/app/api/payment/ipn/route.ts src/app/api/payment/verify/route.ts
git commit -m "feat: increment coupon usage on paid transition"
```

---

### Task 10: Protect the orders API

**Files:**
- Modify: `src/app/api/orders/route.ts`

- [ ] **Step 1: Add an admin gate to GET/PATCH/DELETE**

In `src/app/api/orders/route.ts`, add at the top:

```ts
import { cookies } from 'next/headers';

async function isAdmin(): Promise<boolean> {
  const session = (await cookies()).get('admin_session');
  return session?.value === 'authenticated';
}
```

At the start of each of the `GET`, `PATCH`, and `DELETE` handlers (before any DB work), add:

```ts
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
```

(Leave `POST` unchanged — it creates a single order and exposes no data.)

- [ ] **Step 2: Verify**

With dev server running:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/orders                                   # expect 401
curl -s -o /dev/null -w "%{http_code}\n" -H "Cookie: admin_session=authenticated" http://localhost:3000/api/orders  # expect 200
```

- [ ] **Step 3: Confirm the admin page still loads orders**

The admin page fetches `/api/orders` from the browser, which carries the cookie — open `/admin`, log in, confirm orders still list.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/orders/route.ts
git commit -m "fix: require admin auth on orders API (GET/PATCH/DELETE)"
```

---

### Task 11: Full run tests + deploy

- [ ] **Step 1: Run the unit suite**

Run: `npm run test`
Expected: all bundle-discount + coupon tests pass.

- [ ] **Step 2: Final typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: passes.

- [ ] **Step 3: Clean up any test rows**

Delete test coupons/orders created during verification if you don't want them in production data:
```bash
node --env-file=.env.local -e "import('@neondatabase/serverless').then(async ({neon})=>{const sql=neon(process.env.DATABASE_URL);await sql\`DELETE FROM orders WHERE email='t@t.com'\`;console.log('cleaned');})"
```
(Keep real promo coupons.)

- [ ] **Step 4: Merge + deploy**

```bash
git checkout main && git merge --no-ff <feature-branch> -m "Merge branch '<feature-branch>'"
git push origin main
vercel --prod --yes
```

- [ ] **Step 5: Post-deploy smoke check**

On production: `/admin/coupons` create a real coupon → add books to cart → `/checkout` apply the code → confirm the discount line + lowered total → complete a small real payment (or trust the earlier dev-server verification) → confirm the order stores `coupon_code`/`coupon_discount` and the coupon's `used_count` rises after PAID.

---

## Notes / accepted limitations

- Concurrent redemption of the last available use can exceed `max_uses` by one (no row locks). Acceptable at this scale.
- The preview endpoint clamps using the client-sent `bundleDiscount`; the authoritative clamp happens again server-side at checkout, so a tampered preview cannot change what's charged.
- `PATCH /api/coupons` only toggles `active` (edit-in-place beyond that is out of scope; delete + recreate to change values).
