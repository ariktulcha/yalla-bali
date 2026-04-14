/**
 * audit-supabase.mjs
 * Identifies records in Supabase with content-quality issues that block SEO.
 *
 * Usage:
 *   node scripts/audit-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// Load .env manually since dotenv may not be installed
try {
  const env = readFileSync('.env', 'utf8')
  for (const line of env.split('\n')) {
    const [k, v] = line.split('=')
    if (k && v && !process.env[k.trim()]) process.env[k.trim()] = v.trim()
  }
} catch {}

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const DESTINATION_ID = process.env.DESTINATION_ID || 'bali'

const supa = createClient(SUPABASE_URL, SUPABASE_KEY)

const TABLES = ['restaurants', 'hotels', 'attractions', 'tours', 'nightlife', 'guides', 'areas']

const DESC_MIN = 80
const DESC_IDEAL = 120

async function auditTable(table) {
  const { data, error } = await supa
    .from(table)
    .select('slug, name_he, description, excerpt, meta_description, full_content')
    .eq('destination_id', DESTINATION_ID)
    .eq('published', true)

  if (error) {
    console.error(`❌ ${table}: ${error.message}`)
    return []
  }

  return (data || []).map(row => {
    const desc = row.meta_description || row.description || row.excerpt || ''
    return {
      table,
      slug: row.slug,
      name_he: row.name_he,
      desc_length: desc.length,
      desc_source: row.meta_description ? 'meta_description'
                : row.description ? 'description'
                : row.excerpt ? 'excerpt' : 'NONE',
      has_full_content: !!row.full_content,
      full_content_starts_with_h1: row.full_content ? /^#\s+\S/.test(row.full_content.trim()) : false,
    }
  })
}

async function main() {
  console.log(`🔎 Auditing Supabase tables for ${DESTINATION_ID}...\n`)

  const allResults = []
  for (const table of TABLES) {
    const rows = await auditTable(table)
    allResults.push(...rows)
    console.log(`  ${table}: ${rows.length} rows`)
  }

  console.log('\n──────────────────────────────────────────')
  console.log('🔴 CRITICAL: Description < 80 chars')
  console.log('──────────────────────────────────────────')
  const tooShort = allResults.filter(r => r.desc_length < DESC_MIN)
  for (const r of tooShort) {
    console.log(`  ${r.table}/${r.slug} — ${r.desc_length} chars (${r.desc_source}) — "${r.name_he}"`)
  }
  console.log(`\n  Total: ${tooShort.length} records need description expansion`)

  console.log('\n──────────────────────────────────────────')
  console.log('🟡 WARNING: Description 80-119 chars (suboptimal)')
  console.log('──────────────────────────────────────────')
  const short = allResults.filter(r => r.desc_length >= DESC_MIN && r.desc_length < DESC_IDEAL)
  console.log(`  Total: ${short.length} records (samples below)`)
  for (const r of short.slice(0, 15)) {
    console.log(`  ${r.table}/${r.slug} — ${r.desc_length} chars`)
  }

  console.log('\n──────────────────────────────────────────')
  console.log('🔴 H1 conflict: full_content starts with `# `')
  console.log('──────────────────────────────────────────')
  const h1conflict = allResults.filter(r => r.full_content_starts_with_h1)
  for (const r of h1conflict) {
    console.log(`  ${r.table}/${r.slug}`)
  }
  console.log(`\n  Total: ${h1conflict.length} records have H1 in markdown content`)

  // Group counts
  console.log('\n──────────────────────────────────────────')
  console.log('📊 Summary by table')
  console.log('──────────────────────────────────────────')
  const byTable = {}
  for (const r of allResults) {
    if (!byTable[r.table]) byTable[r.table] = { total: 0, short: 0, tooShort: 0, h1: 0 }
    byTable[r.table].total++
    if (r.desc_length < DESC_MIN) byTable[r.table].tooShort++
    else if (r.desc_length < DESC_IDEAL) byTable[r.table].short++
    if (r.full_content_starts_with_h1) byTable[r.table].h1++
  }
  console.log('Table         | Total | TooShort | Short | H1 in MD')
  console.log('--------------|-------|----------|-------|---------')
  for (const [t, s] of Object.entries(byTable)) {
    console.log(`${t.padEnd(13)} | ${String(s.total).padStart(5)} | ${String(s.tooShort).padStart(8)} | ${String(s.short).padStart(5)} | ${String(s.h1).padStart(7)}`)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
