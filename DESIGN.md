---
name: KidCode
description: Hebrew children's books that turn computer science and logic into games, sold from an outlined, hard-shadowed activity-workbook shop.
colors:
  ink: "#545454"
  ink-strong: "#3a3a3a"
  cream-paper: "#fefce8"
  paper: "#ffffff"
  field-fill: "#f9fafb"
  muted-text: "#6b7280"
  strike-gray: "#767676"
  marker-pink: "#ec4899"
  marker-pink-deep: "#db2777"
  marker-pink-soft: "#f472b6"
  pink-wash: "#fce7f3"
  subject-sky: "#0ea5e9"
  subject-sky-text: "#0284c7"
  sky-wash: "#e0f2fe"
  subject-green: "#10b981"
  subject-green-text: "#059669"
  green-wash: "#d1fae5"
  sun: "#facc15"
  riddles-orange: "#de8f47"
  riddles-navy: "#31508f"
  riddles-purple: "#84679a"
  riddles-green: "#6fae90"
  riddles-red: "#b83c3a"
  riddles-red-deep: "#9c2f2d"
typography:
  display:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.8rem + 2vw, 3rem)"
    fontWeight: 900
    lineHeight: 1.25
  headline:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 900
    lineHeight: 1.2
  title:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 900
    lineHeight: 1.4
  body:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.4
  riddles-display:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "clamp(3.75rem, 1rem + 11vw, 8rem)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.03em"
  riddles-hand:
    fontFamily: "Karantina, Rubik, sans-serif"
    fontSize: "clamp(1.625rem, 1rem + 3vw, 4rem)"
    fontWeight: 700
    lineHeight: 1
rounded:
  sm: "6px"
  lg: "8px"
  xl: "12px"
  riddles-button: "14px"
  2xl: "16px"
  riddles-card: "18px"
  3xl: "24px"
  full: "9999px"
spacing:
  gutter-mobile: "16px"
  gutter: "24px"
  card: "24px"
  section: "64px"
  section-lg: "80px"
components:
  button-primary:
    backgroundColor: "{colors.marker-pink}"
    textColor: "{colors.paper}"
    typography: "{typography.title}"
    rounded: "{rounded.xl}"
    padding: "16px 40px"
  button-primary-hover:
    backgroundColor: "{colors.marker-pink-deep}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.marker-pink}"
    typography: "{typography.title}"
    rounded: "{rounded.xl}"
    padding: "16px 40px"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "8px 20px"
  input-field:
    backgroundColor: "{colors.field-fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "12px"
  card-product:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "{spacing.card}"
  badge-new:
    backgroundColor: "{colors.riddles-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "4px 6px"
  riddles-button-preorder:
    backgroundColor: "{colors.riddles-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.riddles-button}"
    padding: "16px 24px"
  riddles-button-preorder-hover:
    backgroundColor: "{colors.riddles-red-deep}"
  riddles-price-ticket:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.riddles-card}"
    padding: "16px 24px"
---

# Design System: KidCode

## Overview

**Creative North Star: "The Activity Workbook"**

KidCode looks like the books it sells: a children's activity workbook laid open on a table. Every surface is a cut-out shape traced in a thick warm-gray ink line, lifted off a cream page by a solid offset shadow, and coloured with the flat, bright fills of a marker set. Buttons are chunky and physically pressable; the shadow is the button's depth, and it collapses when the button goes down. Nothing is glassy, blurred or gradient-lit. The system is right-to-left and Hebrew-first throughout.

The trilogy (AI, ciphers, algorithms) each owns one marker colour (sky, pink, green), and marker pink doubles as the site's action colour. Density is relaxed: big black-weight Rubik headings, generous section spacing, and content held in outlined cards rather than ruled lists.

The riddles series ("חידה! לכל המשפחה") is a named sub-theme, not a second world. It swaps the marker fills for its own cover palette (orange over navy, with purple and green family colours and a brick-red action) and adds one hand-lettered display face, Karantina, while keeping the ink outline, the hard shadow and the press behaviour exactly as the rest of the site has them.

**Key Characteristics:**
- Warm-gray ink (#545454) for outlines, shadows and body text; never pure black.
- Solid, zero-blur offset shadows down and to the right as the only UI depth.
- Rounded, outlined, flat-filled shapes; no square corners on interactive surfaces.
- Rubik at black weight for every heading; one marker colour per book subject.
- Pressable buttons that rise on hover and sink on press.
- Sub-palettes per book series are scoped to their surfaces and inherit the ink frame.

## Colors

A cream page, warm-gray ink, and flat marker fills, with each book series bringing its own palette inside the same ink frame.

### Primary
- **Marker Pink** (marker-pink): the site's action colour. Primary buttons, cart badge, active nav hover, the members-club band, and the pink trilogy book. Hover deepens to **Marker Pink Deep**. **Marker Pink Soft** is reserved for accents on ink backgrounds (footer top rule, link hover on the dark footer and mobile menu).
- **Pink Wash** (pink-wash): large tinted panels such as the club section and the pink book's media panel.

### Secondary
- **Subject Sky** (subject-sky, subject-sky-text, sky-wash): the blue trilogy book. Wash behind its cover image, the darker text tone for its "more" link, the full tone for its buttons.
- **Subject Green** (subject-green, subject-green-text, green-wash): the green trilogy book, used the same way; also success states.

### Tertiary
- **Sun** (sun): the highlighter yellow. Small, loud callouts: the riddles pre-order tape and ticket stub, focus outlines inside the riddles scope, text selection, and occasional site badges.

### Riddles series (sub-theme, scoped to the riddles page and its homepage promo)
- **Cover Orange** (riddles-orange): the cover's upper field. Closing panel, and the stamped shadow behind the hero and promo titles. The hero's upper field is Cream (#fdf3e1) and the homepage promo is Soft Orange (#ffedd5, Tailwind orange-100), matching the pastel grounds of the other book cards.
- **Cover Navy** (riddles-navy): the cover's lower field. Hero lower band, promo base band, the author panel, numerals and icons in fact lists, the series-number disc.
- **Word-Game Purple** (riddles-purple) and **Pattern Green** (riddles-green): the book's colour code for its word-game and numbers-and-patterns families; they appear only inside the book's own page images.
- **Brick Red** (riddles-red, hover riddles-red-deep): the series' action colour. Pre-order button, pre-order sticker, savings tag, strikethrough line, and the site-wide navbar "חדש" badge that points to the series.

### Neutral
- **Ink** (ink): outlines, hard shadows, default text colour, the dark nav cart button, footer and stats bands.
- **Ink Strong** (ink-strong): body text set directly on Cover Orange, where plain Ink loses contrast.
- **Cream Paper** (cream-paper): the page background.
- **Paper** (paper): card, ticket, nav and input-adjacent surfaces.
- **Field Fill** (field-fill): input backgrounds.
- **Muted Text** (muted-text): secondary copy and captions on white.
- **Strike Gray** (strike-gray): struck-through list prices.

### Named Rules
**The Ink-Not-Black Rule.** Outlines, shadows and default text are Ink (#545454). Pure black is not part of the palette.

**The One Subject, One Marker Rule.** Each trilogy book owns one hue and uses it in three tones only: the wash for its media panel, the -600 tone for its text link, the full tone for its button.

**The Series Scope Rule.** A series palette lives inside its series surfaces (the riddles tokens are declared on the riddles root wrapper). It never recolours trilogy, cart or checkout surfaces; the single exception is the navbar badge that points to the series.

## Typography

**Display Font:** Rubik (with system-ui, sans-serif)
**Body Font:** Rubik (with system-ui, sans-serif)
**Riddles Hand Font:** Karantina 700 (with Rubik), riddles surfaces only

**Character:** Rubik's soft, rounded Hebrew carries everything, from black-weight headlines to plain body copy, so the site reads friendly and solid rather than bookish. Karantina adds the hand-lettered voice of the riddles cover in short bursts.

### Hierarchy
- **Display** (900, 36px to 48px, line-height 1.25): page heroes on the main site.
- **Headline** (900, 30px to 40px, line-height 1.2): section headings ("ארגז הכלים לילדי העתיד", "הצצה לתוך הספר"). Riddles headings tighten letter-spacing to -0.02em.
- **Title** (900, 20px to 24px): card titles, prices, button labels.
- **Body** (400, 16px to 19px, line-height 1.625): descriptive copy, held to about 62ch on the riddles page.
- **Label** (700, 12px to 14px): meta lines, badges, field labels, small links.
- **Riddles Display** (900, 60px to 128px, line-height 0.9, -0.03em): the series title only, white with the ink stamp.
- **Riddles Hand** (Karantina 700, 26px to 64px, line-height 1): the subtitle, gallery captions and the arrival month on the ticket stub.

### Named Rules
**The Black-Weight Rule.** Headings and prices are Rubik 900; body is 400; labels and links are 700. Intermediate weights are rare.

**The Short-Hand Rule.** Karantina sets a few words at a time, never a sentence, never a price, never a button label, and only inside the riddles scope.

**The Stamped Title Rule.** White display type on a series colour field carries a solid ink text shadow (5px 5px 0, 4px on mobile), the same offset language as the boxes.

## Layout

Content sits in a centred container with 24px side gutters (16px on mobile for the riddles surfaces). Sections are separated by 64px to 80px of vertical space (riddles: 56px to 112px between blocks). The single breakpoint that changes composition is 768px: below it, two-column hero and card layouts stack, with the product image or cover ahead of the copy. Card grids run one, then two or three columns; the riddles gallery runs two columns on mobile and four on desktop, with alternate pages tilted (-1.5deg and 1.2deg) like pages laid on a table. Full-bleed bands (the ink stats band, the riddles hero) break the container to change the page's colour field. Direction is right-to-left everywhere; logical properties (border-s, text-start) are preferred.

## Elevation & Depth

Depth is entirely solid offset shadow in Ink, cast down and to the right with zero blur. There is no tonal elevation and no ambient shadow on UI. Larger or more important objects cast longer shadows; interaction lengthens or collapses them. The one native exception is the cut-out photographs of the physical books in the homepage hero, which carry a soft drop-shadow because they are objects, not UI.

### Shadow Vocabulary
- **Card** (`box-shadow: 6px 6px 0 0 #545454`): standard outlined cards, panels, tickets, gallery pages, riddles covers on mobile.
- **Card Large** (`box-shadow: 8px 8px 0 0 #545454`): hero media frames and the riddles homepage promo.
- **Retro Button** (`box-shadow: 4px 4px 0 0 #545454`; hover 5px with -1px lift; active 2px with 2px sink): every site button.
- **Riddles Press** (`box-shadow: 5px 5px 0 0 #545454`; hover 7px with -2px lift; active 1px with 4px sink): the riddles pre-order button.
- **Input Focus** (`box-shadow: 4px 4px 0 0 #545454`): an input gains a shadow on focus instead of a glow.
- **Feature** (10px to 14px offsets): the riddles closing panel and the desktop hero cover only.

### Named Rules
**The Zero-Blur Rule.** UI shadows are solid ink offsets. A blurred or coloured shadow on a card, button or input is off-system.

**The Shadow-Is-Depth Rule.** On a pressable element the shadow is its physical height: hover raises it, press removes it.

## Shapes

Everything interactive or contentful is a rounded shape traced in Ink. Stroke weight sets hierarchy: 4px for cards, panels, hero frames, nav and section borders; 2px to 3px for buttons, chips, inputs and badges. Corners scale with size: 6px to 8px on badges and small buttons, 12px on buttons and inputs, 16px to 24px on cards and bands (riddles: 14px buttons, 18px cards and tickets, 24px bands). Circles are used for count badges, the author portrait and the series-number disc. The riddles sub-theme adds two physical shapes: the ticket (a paper card with a dashed, perforated 4px divider before a Sun stub) and the sticker (a small red label rotated -8deg over a cover tilted -4deg).

## Components

### Buttons
Chunky, outlined, and pressable.
- **Shape:** gently rounded (12px), 2px Ink outline.
- **Primary:** Marker Pink fill, white black-weight label, 16px by 32px to 40px padding.
- **Hover / Focus:** fill deepens to Marker Pink Deep; Retro Button lift (see Elevation); press sinks into the page.
- **Secondary:** white fill with a Marker Pink label, same outline and shadow.
- **Ink:** Ink fill with white label, 8px corners, used for the navbar cart and menu controls.
- **Subject buttons:** product pages use the book's subject colour in place of pink.

### Chips and Badges
- **Count badge:** small Marker Pink circle with white bold numerals, bounces when the count changes.
- **"ספר חדש" badge:** Brick Red, white 11px black-weight label, 6px corners, 2px Ink outline, beside a nav link.
- **Riddles categories:** a plain bold text line separated by middots, no fill or outline. Coloured pills read as buttons that do nothing.

### Cards / Containers
- **Corner Style:** 16px (product cards), 24px (feature bands).
- **Background:** Paper, or a subject Wash for media panels inside the card.
- **Shadow Strategy:** Card shadow (6px); Card Large for hero frames.
- **Border:** 4px Ink.
- **Internal Padding:** 24px (16px for compact list cards).
- **Hover:** background shifts to the subject's lightest tint and the product image scales to 1.05.

### Inputs / Fields
- **Style:** 3px Ink outline, Field Fill background, 8px corners, 16px text (prevents iOS zoom).
- **Focus:** native outline removed; the Input Focus hard shadow appears.

### Navigation
White sticky bar with a 4px Ink bottom rule. Links are Rubik 700, Ink, turning Marker Pink on hover. The cart is an Ink button with a pink count badge. On mobile, a full-screen Ink overlay lists links in white 24px black weight, with a Marker Pink rule under its header.

### Riddles Price Ticket (signature)
A Paper card (18px corners, 4px Ink outline, Card shadow) split in two. The main part holds the price in 44px to 56px black-weight tabular figures, the list price struck through in Brick Red, and a red savings tag. A 4px dashed Ink divider leads to a Sun stub that gives the arrival month in Karantina. Used in the hero and the closing panel.

### Riddles Pre-order Tape (signature)
A Sun strip with 4px Ink top and bottom rules, rotated -1.2deg across the top of the hero, repeating the pre-order terms with Brick Red dot separators. It scrolls slowly (38s loop), pauses on hover, and stops under reduced motion.

## Do's and Don'ts

### Do:
- **Do** outline every card, button, chip, input and media frame in Ink: 4px for containers, 2px to 3px for controls.
- **Do** use the solid Ink offset shadows from the Elevation vocabulary, scaled to the object's importance.
- **Do** make every button pressable: lift on hover, sink on press, with a visible focus state.
- **Do** keep each trilogy book in its own marker colour, in wash, text and full tones.
- **Do** declare a new series palette as scoped tokens on the series' root wrapper, and keep the Ink frame around it.
- **Do** set white-on-pink and white-on-orange labels at large sizes and black weight; on orange, add the ink stamp shadow.
- **Do** honour prefers-reduced-motion on every looping or transforming animation.

### Don't:
- **Don't** use pure black for outlines, shadows or text.
- **Don't** use blurred, glowing or coloured shadows on UI surfaces; soft drop-shadows belong only to photographed book cut-outs.
- **Don't** use square corners or borderless floating panels for content.
- **Don't** let a series palette recolour trilogy, cart or checkout surfaces.
- **Don't** set Karantina for sentences, prices, buttons, or anywhere outside the riddles scope.
- **Don't** use gradients as atmosphere; the only gradient in the system is the hard-stopped orange-over-navy split of the riddles cover.
