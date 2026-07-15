# Coupon System — Design Spec

Date: 2026-07-15
Repo: futurekids-shop (KidCode shop — Next.js 16 App Router, Neon Postgres, iCount, RTL Hebrew)

## Context / Problem

The shop currently supports one automatic discount: a reactive **bundle discount**
(`מארז`) computed in `src/components/CartProvider.tsx` from cart contents (15/45/115₪)
and passed to iCount as a negative line item (`הנחת מארז`) in
`src/app/api/checkout/route.ts`. The client wants promotable **coupon codes** (percentage
and fixed amount) for campaigns.

A coupon system on a live payment page must not trust client-sent amounts. Today the
checkout API trusts `body.total` / `body.bundleDiscount` verbatim. This spec adds coupons
**and** hardens the discount path so all discount math is authoritative on the server.

## Decisions (agreed)

- Discount types: **percentage** and **fixed amount** (no free shipping).
- Coupons **stack** on top of the automatic bundle discount.
- Per-coupon controls: **expiry date**, **active/inactive toggle**, **minimum order
  amount**, **max total uses**.
- Managed on a dedicated **`/admin/coupons`** page.
- Code entered **at checkout only**.
- Approach **A — server-authoritative**: the checkout API re-validates the coupon and
  recomputes subtotal + bundle discount + coupon discount server-side, ignoring
  client-sent numbers.

## Data Model

New table `coupons` (Neon; created via one-off SQL — no migration framework in repo):

| column | type | notes |
|--------|------|-------|
| id | text/uuid PK | |
| code | text unique | stored UPPERCASE, trimmed |
| discount_type | text | `'percent'` or `'fixed'` |
| discount_value | numeric | percent (e.g. 10) or shekels (e.g. 20) |
| min_subtotal | numeric null | minimum items subtotal to qualify |
| max_uses | integer null | null = unlimited |
| used_count | integer default 0 | incremented on payment |
| active | boolean default true | manual on/off |
| expires_at | timestamptz null | null = no expiry |
| created_at | timestamptz default now() | |

New columns on `orders`: `coupon_code text null`, `coupon_discount numeric default 0`.

## Discount Math (server = source of truth)

- `subtotal` = Σ(price × quantity) over items, recomputed server-side from `body.items`.
- `bundleDiscount` = recomputed server-side from items via shared `lib/bundle-discount.ts`
  (extracted from `CartProvider`), not trusted from the client.
- Coupon discount:
  - `percent`: `round(subtotal * value / 100)` — whole shekels; applied to the
    **pre-bundle** subtotal.
  - `fixed`: `value` shekels.
  - **Clamp**: `couponDiscount = min(couponDiscount, subtotal - bundleDiscount)` so the
    product total never goes below 0. Shipping is still charged.
- `total = subtotal - bundleDiscount - couponDiscount + shippingCost`.

## Validation Rules

One pure function `validateCoupon(coupon, subtotal)` in `lib/coupons.ts`, reused by the
preview endpoint and by checkout. Order of checks (first failure returns a Hebrew message):

1. coupon exists (lookup by `upper(code)`)
2. `active === true`
3. not expired (`expires_at` null or `> now`)
4. under usage cap (`max_uses` null or `used_count < max_uses`)
5. meets minimum (`subtotal >= min_subtotal` if set)
6. compute discount

Returns `{ valid, code, discountType, discountValue, discount, message }`.

## Flow

1. Customer types code in a `קוד קופון` field in the checkout order summary →
   `POST /api/coupons/validate { code, subtotal }` (public) → preview `{ valid, discount,
   message }`. UI shows the discount line or an error; stores `couponCode` locally.
2. On submit, `api/checkout/route.ts`:
   - recomputes `subtotal` and `bundleDiscount` server-side,
   - re-validates the coupon and recomputes `couponDiscount` (ignores any client number),
   - pushes a `קופון: <CODE>` negative line to iCount (reusing the `הנחת מארז` pattern),
   - persists `coupon_code` + `coupon_discount` on the order.
3. **Max-uses counting:** `used_count` increments **only on the PENDING→PAID transition**
   (in `api/payment/ipn/route.ts`, and `verify` for the browser-return path), so
   abandoned/pending carts do not consume uses.

### Edge cases / accepted limitations

- Concurrent redemption of the last available use: two orders could both reach PAID and
  exceed `max_uses` by one. Acceptable at this scale (documented, not guarded with locks).
- Increment must be idempotent per order: only fire inside the atomic PENDING→PAID update
  that already exists, so a re-fired IPN/verify does not double-count.
- Unknown/expired/inactive code at checkout → discount treated as 0 (order still proceeds
  without the coupon); the client preview should have already surfaced the error.

## Admin

- `src/app/admin/coupons/page.tsx` (client, cookie-gated like the orders admin): list
  coupons; create (code, type, value, min_subtotal, max_uses, expires_at, active); toggle
  active; delete. Neubrutalist styling (`input-brutal`, `btn-retro`).
- `src/app/api/coupons/route.ts`: GET list / POST create / PATCH update-or-toggle /
  DELETE — all guarded by the `admin_session` cookie check.
- Link/button from `src/app/admin/page.tsx` to `/admin/coupons`.

## Security hardening (absorbed into this work)

- Server-side recompute of subtotal + bundle + coupon in checkout (removes trust in
  client totals for the discount path).
- Add the `admin_session` cookie check to `/api/orders` (GET/PATCH/DELETE), which is
  currently unauthenticated, and to all new coupon-admin routes.

## Files

New:
- `src/lib/coupons.ts` — validation + discount computation (pure).
- `src/lib/bundle-discount.ts` — bundle detection/amount, extracted from `CartProvider`.
- `src/app/api/coupons/validate/route.ts` — public preview endpoint.
- `src/app/api/coupons/route.ts` — admin CRUD.
- `src/app/admin/coupons/page.tsx` — admin UI.
- `scripts/create-coupons-table.mjs` (or `.sql`) — DDL for `coupons` + `orders` columns.

Modified:
- `src/app/checkout/page.tsx` — coupon field + local state + fold into displayed total.
- `src/app/api/checkout/route.ts` — server recompute + coupon line + persist.
- `src/app/api/payment/ipn/route.ts`, `src/app/api/payment/verify/route.ts` — increment
  `used_count` on PAID.
- `src/app/api/orders/route.ts` — add admin auth.
- `src/components/CartProvider.tsx` — use shared `bundle-discount.ts`.
- `src/app/admin/page.tsx` — link to coupons.
- `src/types/index.ts` — `Coupon` type + coupon fields on order types.

## Testing

- Unit: `validateCoupon` (each rule + boundaries), discount math (percent rounding, fixed,
  clamp), `bundle-discount` parity with previous inline logic.
- End-to-end (dev server + curl): create a coupon via admin API → validate → checkout with
  the code → assert server recomputed the discount, the iCount sale carries the negative
  `קופון:` line, `coupon_code`/`coupon_discount` are stored, and `used_count` bumps only
  after the order is marked PAID. Verify `/api/orders` now returns 401 without the cookie.

## Out of scope (YAGNI)

- Free-shipping coupons, per-customer usage limits, product-specific coupons, coupon entry
  in the cart drawer, bulk code generation.
