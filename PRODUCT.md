# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Israeli parents, grandparents and educators buying Hebrew books for children (and, for the riddles series, for the whole family). They usually arrive from social posts, WhatsApp shares, press mentions or ads, often on a phone, and decide in one visit whether a book is a good gift or a good shared activity.

## Product Purpose

KidCode (kidcode.org.il) is the online shop for books by ד"ר סתיו אלבר, illustrated by שמרית שולמן. The books make thinking and technology playful: they explain how things work and then hand the reader something to do. Success is a completed order (iCount payment) and, for the club, a subscribed member.

## Positioning

Written by a working Google software engineer and Technion lecturer, and illustrated by a recognisable hand-drawn style, the books turn real computer-science and logic ideas into games a child (or a family) actually plays, not into textbook exercises.

## Operating Context

- Catalog: the KidCode trilogy (בינה מלאכותית, סודות ההצפנה, אלגוריתמים) for ages 6-13, each with a companion activity workbook, sold alone or in three bundle tiers.
- New series: "חידה! לכל המשפחה", volume 1, a hardcover riddle book (104 color pages, hundreds of riddles in three families: משחקי מילים, הצפנה, מספרים ותבניות) for ages 7 and up, including adults. Sold as a pre-order: list price ₪120, pre-sale price ₪102, ships November 2026; pre-order buyers receive it first.
- Shipping in Israel via Chita pickup points (₪20) or home delivery (₪40). An order that includes a pre-order item ships whole, as one shipment, when the book is released (November 2026); in-stock items in that order wait for it.
- Coupons (e.g. the members-club CLUB10) never apply to pre-sale items.

## Capabilities and Constraints

- Next.js App Router on Vercel, Neon Postgres, iCount payment pages. Catalog lives in code (`src/lib/products.ts`).
- All UI is Hebrew, right-to-left.
- No stock management; pre-order status and ship date are catalog fields.

## Brand Commitments

- The site's established look: Rubik, thick #545454 outlines, hard offset shadows, chunky "retro" buttons, bright subject colors.
- Shimrit Shulman's hand-drawn illustration is the visual voice of the books; the riddles series has its own cover palette (orange and navy).
- Author credit on product surfaces: ד"ר סתיו אלבר ושמרית שולמן for the riddles series.

## Evidence on Hand

- Riddles book cover and 9 interior page images: `public/riddles/`.
- Trilogy covers, example pages, press logos (`public/press-logos/`), author photo (`public/Stav.png`).
- No customer reviews or sales figures for the riddles book exist yet; do not invent testimonials, ratings, or "sold out" claims.

## Product Principles

1. Show the inside of the book: real pages and real riddles convince better than adjectives.
2. Price honesty: pre-sale price, list price, ship date and coupon exclusion are always stated plainly.
3. Play first: every surface should feel like the books, something to try, not a catalog listing.
4. Hebrew-native: copy, layout direction and typography are written for Hebrew readers, never translated layouts.

## Accessibility & Inclusion

The site ships an accessibility widget (`src/components/AccessibilityWidget.tsx`); new surfaces must keep keyboard access, readable contrast on the bright palette, and alt text for every page image.
