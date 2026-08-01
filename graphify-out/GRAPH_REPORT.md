# Graph Report - .  (2026-08-01)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 507 nodes · 972 edges · 40 communities (25 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4355eefa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 22
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 39

## God Nodes (most connected - your core abstractions)
1. `sql` - 42 edges
2. `Product` - 19 edges
3. `useCart()` - 17 edges
4. `compilerOptions` - 16 edges
5. `getConsent()` - 10 edges
6. `ClubPopup()` - 9 edges
7. `CompanionOffer` - 9 edges
8. `computeBundleDiscount()` - 9 edges
9. `POST()` - 8 edges
10. `GET()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `BundleContent()` --calls--> `useCart()`  [EXTRACTED]
  src/app/bundle/page.tsx → src/components/CartProvider.tsx
- `AddToCartButtonProps` --references--> `Product`  [EXTRACTED]
  src/components/AddToCartButton.tsx → src/types/index.ts
- `ProductPageCTAProps` --references--> `Product`  [EXTRACTED]
  src/components/ProductPageCTA.tsx → src/types/index.ts
- `MembersAdminPage()` --calls--> `buildMembersCsv()`  [EXTRACTED]
  src/app/admin/members/page.tsx → src/lib/members-csv.ts
- `GET()` --calls--> `sql`  [EXTRACTED]
  src/app/api/admin/orders/export/route.ts → src/lib/db.ts

## Import Cycles
- None detected.

## Communities (40 total, 15 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (43): JsonLd(), metadata, rubik, PaymentSuccessContent(), CartProvider(), ClubPopup(), readState(), writeState() (+35 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (39): eslint, eslint-config-next, lucide-react, @neondatabase/serverless, next, dependencies, lucide-react, @neondatabase/serverless (+31 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (26): GET(), isAdmin(), unauthorized(), DELETE(), GET(), isAdmin(), PATCH(), POST() (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (22): RFC-8058, GET(), htmlPage(), POST(), unsubscribe(), GET(), maxDuration, buildCartReminderEmailHtml() (+14 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (21): CheckoutRequest, OrderItem, POST(), POST(), BUNDLE_BOOK_IDS, BUNDLE_WORKBOOK_IDS, BundleItem, BundleResult (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (18): POST(), POST(), CartSnapshot, CartSnapshotItem, MAX_CART_ITEMS, normalizeCartItems(), parseMemberCartRow(), ProductLookup (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (13): BookWorkbookPairCardProps, colorClasses, CompanionOfferCTAProps, CompanionProductModal(), CompanionProductModalProps, colorClasses, ProductCardProps, ProductRelationshipService (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (19): RFC-4180, GET(), GET(), revalidate, fetchOnce(), fetchPickupPoints(), getCachedPickupPoints(), getPickupPoints() (+11 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (20): GET(), POST(), getCredentials(), ICountAuthResponse, icountCreatePayPage(), ICountCreatePayPageRequest, ICountCreatePayPageResponse, ICountCredentials (+12 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (14): BundleContent(), bundleIcons, sitemap(), BookComposite(), BookCompositeProps, books, bundle, bundles (+6 more)

### Community 11 - "Community 11"
Cohesion: 0.19
Nodes (14): CheckoutPage(), SHIPPING_OPTIONS, ShippingOption, PickupPointSelector(), PickupPointSelectorProps, PointWithDistance, calculateDistance(), formatDistance() (+6 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (13): args, buildPayload(), buildUserData(), fmtTime(), main(), missing, normalizePhone(), ONLY_ID (+5 more)

### Community 13 - "Community 13"
Cohesion: 0.23
Nodes (9): bookWorkbookPairs, bundleIcons, Home(), BookWorkbookPairCard(), useCart(), CompanionOfferCTA(), LogoMarquee(), pressLogos (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.27
Nodes (8): getCompanionProduct(), useCompanionOffer(), AddToCartButton(), AddToCartButtonProps, Cart(), ProductPageCTA(), ProductPageCTAProps, productRelationshipService

### Community 15 - "Community 15"
Cohesion: 0.27
Nodes (8): CartContext, ToastContainer(), ToastContainerProps, ToastProps, CartContextType, Order, OrderItem, Toast

### Community 16 - "Community 16"
Cohesion: 0.24
Nodes (8): colorClasses, ProductPage(), Props, ExamplePagesGallery(), ExamplePagesGalleryProps, SOURCE_LABELS, getProductBySlug(), ExamplePage

### Community 17 - "Community 17"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.33
Nodes (6): Member, MembersAdminPage(), buildMembersCsv(), escapeCsvField(), MemberCsvRow, BASE

### Community 19 - "Community 19"
Cohesion: 0.50
Nodes (4): AdminPage(), Order, OrderItem, STATUSES

## Knowledge Gaps
- **140 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+135 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sql` connect `Community 2` to `Community 8`, `Community 3`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Why does `computeBundleDiscount()` connect `Community 5` to `Community 0`, `Community 6`, `Community 15`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `Product` connect `Community 7` to `Community 10`, `Community 14`, `Community 15`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _140 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07422559906487435 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.13963963963963963 - nodes in this community are weakly interconnected._