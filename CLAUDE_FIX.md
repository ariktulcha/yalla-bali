# Fix Task: Rewrite all [slug] pages to use Layout.astro

## Problem
All 7 [slug] pages (`restaurants/[slug].astro`, `hotels/[slug].astro`, etc.) are building their own full HTML document (`<html>`, `<head>`, `<body>`) instead of using `Layout.astro`. This causes:
1. No CSS / Tailwind (not imported)
2. No navigation header
3. No footer
4. No WhatsApp button
5. Opening hours shown as raw JSON string
6. Markdown not rendered as HTML

## Fix Required for ALL 7 pages:
- `src/pages/restaurants/[slug].astro`
- `src/pages/hotels/[slug].astro`
- `src/pages/attractions/[slug].astro`
- `src/pages/tours/[slug].astro`
- `src/pages/nightlife/[slug].astro`
- `src/pages/guides/[slug].astro`
- `src/pages/areas/[slug].astro`

## How to Fix Each Page

### Step 1: Replace imports
Remove: `import Head from ...`, `import SchemaOrg from ...`, `import WhatsAppButton from ...`
Add: `import Layout from '../../components/Layout.astro'`
Keep: `import Breadcrumb from ...` (still used), `import { supabaseAdmin, DESTINATION_ID } from ...`

### Step 2: Fix opening_hours display
The `opening_hours` field is stored as a JSON string like `["Monday: 9am-10pm", ...]`.
Parse it properly:
```ts
let hoursArray: string[] = []
if (restaurant.opening_hours) {
  try {
    const parsed = typeof restaurant.opening_hours === 'string' 
      ? JSON.parse(restaurant.opening_hours) 
      : restaurant.opening_hours
    hoursArray = Array.isArray(parsed) ? parsed : [restaurant.opening_hours]
  } catch {
    hoursArray = [restaurant.opening_hours]
  }
}
```
Then render as: `{hoursArray.map(h => <p>{h}</p>)}`

### Step 3: Fix markdown rendering
Install if not present: `npm install marked`
```ts
import { marked } from 'marked'
const contentHtml = restaurant.full_content ? marked(restaurant.full_content) : ''
```
Render with: `<div class="prose prose-invert prose-amber max-w-none" set:html={contentHtml} />`

### Step 4: Replace HTML structure
Remove the entire `<html>...</html>` wrapper.
Replace with Layout component:

```astro
<Layout
  title={pageTitle}
  description={pageDescription}
  canonical={`https://yalla-bali.co.il/restaurants/${restaurant.slug}`}
  ogImage={restaurant.image}
>
  <!-- SchemaOrg inside Layout slot -->
  <SchemaOrg schema={restaurantSchema} slot="head" />  
  
  <!-- Page content here (no <body>, no <main> wrapper - Layout provides it) -->
  <div class="max-w-4xl mx-auto px-4 py-8">
    <Breadcrumb items={breadcrumbItems} />
    ... rest of content ...
  </div>
</Layout>
```

Wait - check Layout.astro's interface first. It already has a `<main>` slot. Just put content inside `<Layout>...</Layout>`.

### Step 5: Check Layout.astro interface
Read `src/components/Layout.astro` to see what props it accepts (title, description, canonical, ogImage, etc.) and use them correctly.

## After all 7 pages are fixed:
1. Run `npm run build` — must pass with 0 errors
2. Start dev server: `npm run dev -- --port 4323`
3. Test these URLs respond with 200:
   - http://localhost:4323/restaurants/nobu-dubai
   - http://localhost:4323/nightlife/white-dubai
   - http://localhost:4323/hotels/atlantis-the-palm
4. Verify: dark background visible, nav present, footer present, CSS applied
5. Run: `git add -A && git commit -m "fix: rewire all [slug] pages to use Layout.astro + fix opening_hours + markdown" && git push`
6. Then run: `openclaw system event --text "Fix complete: all slug pages now use Layout.astro - CSS, nav and footer working" --mode now`
