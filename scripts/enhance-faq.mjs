/**
 * enhance-faq.mjs
 * Post-processes existing DB faq arrays for entity types where questions lack
 * the entity name or "באלי". Minimal intervention — only modifies 1-2 questions
 * per record to add entity/locale hooks, preserving the handwritten tone.
 *
 * Usage:
 *   node scripts/enhance-faq.mjs           # dry run
 *   node scripts/enhance-faq.mjs --apply
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
const DESTINATION_ID = 'bali'

const TABLES = ['restaurants', 'hotels', 'attractions', 'nightlife', 'tours', 'guides']

// Heuristic: if question mentions name or baliKey, it's fine. Otherwise, enhance.
function enhanceQuestion(q, entityName) {
  if (q.includes(entityName)) return { q, changed: false }

  // Strip trailing punctuation, append "ב{name} בבאלי?"
  const base = q.replace(/[?!.]+\s*$/u, '').trim()
  // Use context-appropriate preposition — simple heuristic
  return { q: `${base} ב${entityName} בבאלי?`, changed: true }
}

function ensureBaliInQuestion(q) {
  if (q.includes('באלי')) return { q, changed: false }
  const base = q.replace(/[?!.]+\s*$/u, '').trim()
  return { q: `${base} בבאלי?`, changed: true }
}

async function processRow(table, row) {
  const faq = Array.isArray(row.faq) ? row.faq : []
  if (faq.length === 0) return { skipped: true }

  const entityName = row.name_he || row.title_he || ''
  if (!entityName) return { skipped: true }

  // Check which constraints are already satisfied
  const hasName = faq.some(item => (item.q || '').includes(entityName))
  const hasBali = faq.some(item => (item.q || '').includes('באלי'))

  if (hasName && hasBali) return { skipped: true } // already good

  const newFaq = faq.map(item => ({ ...item }))
  let modified = false

  // Fix first question to include entity name if missing
  if (!hasName && newFaq[0]?.q) {
    const { q: newQ, changed } = enhanceQuestion(newFaq[0].q, entityName)
    if (changed) { newFaq[0].q = newQ; modified = true }
  }

  // Fix second question to include "באלי" if missing (or first if only 1 question)
  if (!hasBali) {
    const idx = newFaq.length > 1 ? 1 : 0
    if (newFaq[idx]?.q && !newFaq[idx].q.includes('באלי')) {
      const { q: newQ, changed } = ensureBaliInQuestion(newFaq[idx].q)
      if (changed) { newFaq[idx].q = newQ; modified = true }
    }
  }

  if (!modified) return { skipped: true }

  console.log(`  ${table}/${row.slug}:`)
  faq.forEach((orig, i) => {
    const changed = newFaq[i].q !== orig.q
    if (changed) console.log(`    [${i}] "${orig.q}" → "${newFaq[i].q}"`)
  })

  if (APPLY) {
    const { error } = await supa
      .from(table)
      .update({ faq: newFaq })
      .eq('destination_id', DESTINATION_ID)
      .eq('slug', row.slug)
    if (error) { console.log(`    ❌ ${error.message}`); return { error: true } }
  }

  return { updated: true }
}

async function main() {
  console.log(`🔧 ${APPLY ? 'APPLYING' : 'DRY RUN'}\n`)

  let total = 0
  for (const table of TABLES) {
    console.log(`── ${table} ──`)
    const { data, error } = await supa
      .from(table)
      .select('slug, name_he, faq')
      .eq('destination_id', DESTINATION_ID)
      .eq('published', true)

    if (error) { console.error(`❌ ${table}: ${error.message}`); continue }

    let tableTotal = 0
    for (const row of data || []) {
      const result = await processRow(table, row)
      if (result.updated) { tableTotal++; total++ }
    }
    console.log(`  → ${tableTotal} updated\n`)
  }

  console.log(`\nTotal FAQ records enhanced: ${total}`)
  if (!APPLY) console.log('\n💡 Run with --apply to write changes.')
}

main().catch(e => { console.error(e); process.exit(1) })
