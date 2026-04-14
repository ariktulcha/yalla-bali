/**
 * auto-expand-descriptions.mjs
 * Automatically generates meta_description for records where the existing
 * description is 80-119 chars (suboptimal). Appends a contextual suffix based
 * on entity type + area so each meta_description lands in the 120-165 sweet spot.
 *
 * Usage:
 *   node scripts/auto-expand-descriptions.mjs           # dry run
 *   node scripts/auto-expand-descriptions.mjs --apply
 *   node scripts/auto-expand-descriptions.mjs --table restaurants --apply
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

try {
  const env = readFileSync('.env', 'utf8')
  for (const line of env.split('\n')) {
    const [k, v] = line.split('=')
    if (k && v && !process.env[k.trim()]) process.env[k.trim()] = v.trim()
  }
} catch {}

const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const APPLY = process.argv.includes('--apply')
const argIdx = process.argv.indexOf('--table')
const ONLY_TABLE = argIdx >= 0 ? process.argv[argIdx + 1] : null
const DESTINATION_ID = 'bali'

const TARGET_MIN = 120
const TARGET_MAX = 165

// Suffix generators — each returns a string to append. They aim for 40-70 extra chars.
const suffixGenerators = {
  restaurants: (r) => {
    const area = r.area ? `ב${r.area}, באלי` : 'בבאלי'
    return ` מסעדה ${area} — תפריט, מחירים, שעות פתיחה וטיפים מעודכנים לסועדים ישראלים.`
  },
  hotels: (h) => {
    const area = h.area ? `ב${h.area}, באלי` : 'בבאלי'
    return ` מלון ${area} — תמונות, חוות דעת, מתקנים והזמנה ישירה דרך Booking.com.`
  },
  attractions: (a) => {
    const area = a.area ? `ב${a.area}, באלי` : 'בבאלי'
    return ` אטרקציה ${area} — מחירי כניסה, שעות פתיחה, טיפים לביקור והמלצות מסלול.`
  },
  nightlife: (v) => {
    const area = v.area ? `ב${v.area}, באלי` : 'בבאלי'
    return ` חיי לילה ${area} — דרס קוד, תמחור, שעות פתיחה ומידע על אירועים שוטפים.`
  },
  guides: () => {
    return ` מדריך מקיף לבאלי בעברית — מידע עדכני, טיפים מעשיים ותשובות לשאלות נפוצות.`
  },
  areas: (a) => {
    return ` אזור בבאלי — אטרקציות, מלונות ומסעדות מומלצים ב${a.name_he} עם מפה ומדריך מסלול.`
  },
  tours: (t) => {
    const area = t.area ? `ב${t.area}, באלי` : 'בבאלי'
    return ` טיול מאורגן ${area} — מחיר, משך, מסלול וטיפים. מדריך בעברית זמין.`
  },
}

const TABLES = ['restaurants', 'hotels', 'attractions', 'nightlife', 'guides', 'areas', 'tours']

function pickBase(row) {
  // Preserve existing meta_description if present; otherwise use description/excerpt
  return row.meta_description || row.description || row.excerpt || ''
}

function trim(str, max) {
  if (str.length <= max) return str
  return str.slice(0, max - 1).trim().replace(/[,.;:\-—]$/, '') + '…'
}

async function processTable(table) {
  const hasArea = !['areas', 'guides'].includes(table)
  const cols = ['slug', 'name_he', 'description', 'excerpt', 'meta_description']
  if (hasArea) cols.push('area')
  const { data, error } = await supa
    .from(table)
    .select(cols.join(', '))
    .eq('destination_id', DESTINATION_ID)
    .eq('published', true)

  if (error) { console.error(`❌ ${table}: ${error.message}`); return { table, updated: 0, skipped: 0 } }

  let updated = 0, skipped = 0
  const suffixGen = suffixGenerators[table]
  if (!suffixGen) return { table, updated: 0, skipped: 0 }

  for (const row of data || []) {
    const base = pickBase(row)
    if (!base) { skipped++; continue }
    if (base.length >= TARGET_MIN) { skipped++; continue } // already good
    if (base.length < 30) { skipped++; continue } // too minimal to safely expand

    const suffix = suffixGen(row)
    let combined = base.trim()
    // Ensure base ends with sentence terminator
    if (!/[.!?]$/.test(combined)) combined += '.'
    combined += suffix
    combined = trim(combined, TARGET_MAX)

    console.log(`  ${table}/${row.slug} (${base.length} → ${combined.length})`)
    if (process.env.VERBOSE) console.log(`    "${combined}"`)

    if (APPLY) {
      const { error: upErr } = await supa
        .from(table)
        .update({ meta_description: combined })
        .eq('destination_id', DESTINATION_ID)
        .eq('slug', row.slug)
      if (upErr) { console.log(`    ❌ ${upErr.message}`); continue }
    }
    updated++
  }

  return { table, updated, skipped }
}

async function main() {
  console.log(`🔧 ${APPLY ? 'APPLYING' : 'DRY RUN'}${ONLY_TABLE ? ` — only ${ONLY_TABLE}` : ''}\n`)

  const results = []
  for (const t of TABLES) {
    if (ONLY_TABLE && t !== ONLY_TABLE) continue
    console.log(`── ${t} ──`)
    results.push(await processTable(t))
    console.log('')
  }

  console.log('\n── Summary ──')
  let total = 0
  for (const r of results) {
    console.log(`${r.table}: ${r.updated} updated, ${r.skipped} skipped`)
    total += r.updated
  }
  console.log(`\nTotal updated: ${total}`)
  if (!APPLY) console.log('\n💡 Run with --apply to write changes.')
}

main().catch(e => { console.error(e); process.exit(1) })
