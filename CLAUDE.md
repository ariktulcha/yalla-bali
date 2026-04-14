# Yalla Bali — Astro Rebuild Brief

## Context
You are rebuilding the yalla-bali tourism website from scratch using Astro + Supabase.
The existing Next.js project is at ~/Projects/yalla-bali — use it as a REFERENCE for:
- Special page content (markdown text, UI sections)
- Component logic and data structures
- Existing styling patterns

The existing Bali site (different content types, same approach) is at ~/Projects/bali-website.

## Stack
- **Astro 5** (latest) with TypeScript
- **Tailwind CSS v4** via `@astrojs/tailwind`
- **Cloudflare Pages adapter** (`@astrojs/cloudflare`) — output: 'static'
- **Supabase** `@supabase/supabase-js` — server-side only (never expose service key to client)
- **@astrojs/sitemap** for auto sitemap

## Supabase Config
Secrets live in `.env` (gitignored) — see `.env.example` for the full list of required vars:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` (server-side only, never exposed to the client)
- `DESTINATION_ID=bali`

Create `src/lib/supabase.ts` with a server-side admin client that reads from these env vars.

## Supabase Tables
All tables have `destination_id` text column. Always filter `.eq('destination_id', DESTINATION_ID)`.

Tables: `restaurants`, `hotels`, `attractions`, `tours`, `nightlife`, `guides`, `areas`

Key field names (Supabase):
- `name_he` — Hebrew name (main display name)
- `name_en` — English name
- `slug` — URL slug
- `excerpt` — short description
- `description` — medium description
- `full_content` — full markdown content
- `image` — main image URL
- `published` — boolean (always filter `.eq('published', true)`)
- `area` — area name string
- `metadata` — jsonb for destination-specific fields

## Page Structure to Build

### Dynamic [slug] pages (fetch from Supabase)
- `src/pages/restaurants/[slug].astro`
- `src/pages/hotels/[slug].astro`
- `src/pages/attractions/[slug].astro`
- `src/pages/tours/[slug].astro`
- `src/pages/nightlife/[slug].astro`
- `src/pages/guides/[slug].astro`
- `src/pages/areas/[slug].astro`

For each: use `getStaticPaths()` to fetch all slugs from Supabase, fetch full data for rendering.

### List pages (fetch from Supabase)
- `src/pages/restaurants/index.astro`
- `src/pages/hotels/index.astro`
- `src/pages/attractions/index.astro`
- `src/pages/tours/index.astro`
- `src/pages/nightlife/index.astro`
- `src/pages/guides/index.astro`
- `src/pages/areas/index.astro`

### Category pages (static routes, Supabase data)
- `src/pages/restaurants/kosher/index.astro` — filter cuisine_category='kosher' or metadata
- `src/pages/restaurants/fine-dining/index.astro`
- `src/pages/restaurants/japanese/index.astro`
- `src/pages/restaurants/meat/index.astro`
- `src/pages/hotels/5-stars/index.astro` — filter star_rating=5
- `src/pages/hotels/beach/index.astro`
- `src/pages/hotels/family/index.astro`
- `src/pages/hotels/luxury/index.astro`
- `src/pages/nightlife/bars/index.astro`
- `src/pages/nightlife/beach-clubs/index.astro`
- `src/pages/nightlife/clubs/index.astro`
- `src/pages/nightlife/rooftop/index.astro`
- `src/pages/attractions/free/index.astro`
- `src/pages/attractions/kids/index.astro`

Each category page: fetch filtered items from Supabase + show FAQ section + intro text.
Category text/FAQ can be hardcoded for now (or read from metadata if you create a category_pages table — your choice).

### Special pages (port from existing Next.js code)
Read ~/Projects/yalla-bali/src/app/ for content, port to Astro:
- `src/pages/index.astro` — homepage
- `src/pages/beaches.astro`
- `src/pages/plan.astro`
- `src/pages/faq.astro`
- `src/pages/weather.astro`
- `src/pages/about.astro`
- `src/pages/contact.astro`
- `src/pages/shopping.astro`
- `src/pages/visa.astro`

## Components to Build

```
src/components/
  Layout.astro          ← base layout: <html lang="he" dir="rtl">, nav, footer
  Head.astro            ← full SEO meta: title, description, og:image, canonical, hreflang
  SchemaOrg.astro       ← renders JSON-LD <script type="application/ld+json">
  WhatsAppButton.astro  ← fixed bottom-right WhatsApp CTA (number from env or destinations table)
  FAQSection.astro      ← FAQ accordion with FAQPage schema
  Breadcrumb.astro      ← breadcrumb nav + BreadcrumbList schema
  Cards/
    RestaurantCard.astro
    HotelCard.astro
    AttractionCard.astro
    NightlifeCard.astro
    GuideCard.astro
    AreaCard.astro
    TourCard.astro
```

## SEO & GEO Requirements (CRITICAL)

### Every page MUST have:
1. **Unique `<title>`** — e.g. "מסעדת נובו באלי — מסעדות יפניות | Yalla Bali"
2. **`<meta name="description">`** — 150-160 chars, Hebrew, direct and factual
3. **`<link rel="canonical">`** — absolute URL
4. **Open Graph tags** — og:title, og:description, og:image, og:url
5. **JSON-LD Schema** — appropriate type (see below)
6. **`<html lang="he" dir="rtl">`**

### Schema.org per page type:
- Restaurant page: `Restaurant` schema with name, address, servesCuisine, priceRange + `FAQPage` if has FAQ
- Hotel page: `Hotel` + `FAQPage`
- Attraction: `TouristAttraction` + `FAQPage`
- Guide/Article: `Article` with author, datePublished, headline + `FAQPage`
- Area: `Place` + `FAQPage`
- Tour: `Product` or `Event` + `FAQPage`
- List pages: `ItemList` with all items
- All pages: `BreadcrumbList`
- Homepage: `WebSite` + `Organization`

### Keyword Density in Entity Pages (CRITICAL)
On every single/detail page ([slug] pages), the entity name (hotel name, restaurant name, attraction name, etc.) MUST appear in:
- **H2 section headings** — never use generic headings like "מיקום" or "שעות פתיחה". Always include the entity name:
  - BAD: `<h2>מתקנים ושירותים</h2>`
  - GOOD: `<h2>מתקנים ושירותים בהילטון באלי דה ווק</h2>`
  - BAD: `<h2>שעות פתיחה</h2>`
  - GOOD: `<h2>שעות פתיחה — מסעדת נובו באלי</h2>`
- **FAQ questions and answers** — every Q&A must mention the entity name + "באלי":
  - BAD: "כמה עולה לילה?"
  - GOOD: "כמה עולה לילה במלון הילטון באלי דה ווק?"
- **CTA text** — "מוכנים להזמין?" → "מוכנים להזמין את הילטון באלי?"
- **WhatsApp pre-filled messages** — include the entity name

This rule applies to ALL entity types: hotels, restaurants, attractions, nightlife, tours, guides, areas.
The goal: every section heading on the page reinforces the primary keyword (entity name + באלי) for search engines.

### GEO Optimization:
- Use clear, direct Hebrew language — no fluff
- Structure content with proper H1→H2→H3 hierarchy
- FAQ sections use `<details>`/`<summary>` or clear Q&A markup
- Every important piece of info should be in its own labeled section
- Avoid burying facts in long paragraphs — use lists and structured markup

## Design System
Dark theme with dual-accent color scheme. Colors from existing site:
- Background: #0D0D0D (main), #1A1208 (card)
- Primary accent: teal-500 (#0D9488) — used in Layout/Nav/borders
- Secondary accent: amber-500 (#F59E0B), amber-400 — used in homepage/tours
- Text: white, white/80, white/60, white/40
- Borders: teal-500/20, teal-500/10 (or amber for amber-themed sections)

Font: system-ui + Inter for Latin, system RTL fonts for Hebrew.

Direction: RTL (`dir="rtl"`) on html element.

Keep the existing visual style — dark luxury feel, gold accents. Cards with hover effects.
Navigation: logo + main sections + WhatsApp CTA.
Footer: links, social, copyright.

## WhatsApp Integration
WhatsApp number for Bali: `972528211665`
CTA text: `היי, אני מתכנן טיול לבאלי 🏙️`
Show as: floating button bottom-right (gold color) + inline CTAs within pages.

## Analytics
Add Google Analytics placeholder in Layout.astro:
```astro
{import.meta.env.GA_MEASUREMENT_ID && (
  <script async src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.GA_MEASUREMENT_ID}`}></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '{import.meta.env.GA_MEASUREMENT_ID}');
  </script>
)}
```

## astro.config.mjs
```js
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  output: 'static',
  site: 'https://ibalibali.com',
  integrations: [
    tailwind(),
    sitemap(),
  ],
  // adapter: cloudflare(), // uncomment when deploying to Cloudflare Pages
})
```

## Quality Checklist
Before finishing, verify:
- [ ] `npm run build` succeeds with zero errors
- [ ] All 7 [slug] pages have `getStaticPaths()` fetching from Supabase
- [ ] All list pages render items from Supabase
- [ ] Schema.org JSON-LD present on every page type
- [ ] RTL direction on html element
- [ ] WhatsApp button visible on all pages
- [ ] No hardcoded data (except special pages) — everything from Supabase
- [ ] `.env.example` created with all required vars

## When Done
Run: `openclaw system event --text "Done: yalla-bali Astro build complete — ready for review" --mode now`

