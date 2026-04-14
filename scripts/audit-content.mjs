/**
 * audit-content.mjs
 * Comprehensive SEO + content quality audit for all built HTML pages in dist/
 *
 * Usage:
 *   npm run build          # first build the site
 *   node scripts/audit-content.mjs
 *
 * Outputs:
 *   - audit-report.json (structured)
 *   - audit-report.md   (human-readable)
 */

import { readdir, readFile, writeFile, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import * as cheerio from 'cheerio'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')

// ─── Config ─────────────────────────────────────────────────────────────────
const SITE_URL = 'https://ibalibali.com'

const TITLE_MIN = 30
const TITLE_MAX = 70
const DESC_MIN = 80   // CLAUDE.md: 150-160 ideal, but seo.ts uses 80 as min
const DESC_IDEAL_MIN = 120
const DESC_IDEAL_MAX = 165

// Other destination names that should NOT appear (copy-paste protection)
const FORBIDDEN_TERMS = [
  'דובאי', 'Dubai',
  'פריז', 'Paris',
  'ניו יורק', 'New York',
  'מילאנו', 'Milano', 'Milan',
  'ברצלונה', 'Barcelona',
  'אתונה', 'Athens',
  'רומא', 'Rome',
  'לונדון', 'London',
  'אמסטרדם', 'Amsterdam',
  'Lorem ipsum', 'TODO', 'PLACEHOLDER', 'FIXME',
]

// Entity page route patterns
const ENTITY_ROUTES = [
  /^restaurants\/[^/]+$/,
  /^hotels\/[^/]+$/,
  /^attractions\/[^/]+$/,
  /^tours\/[^/]+$/,
  /^nightlife\/[^/]+$/,
  /^guides\/[^/]+$/,
  /^areas\/[^/]+$/,
]

// Excluded routes from entity checks (category/list pages share the same root)
const NON_ENTITY_SUBPATHS = [
  'restaurants/kosher', 'restaurants/fine-dining', 'restaurants/japanese', 'restaurants/meat',
  'hotels/5-stars', 'hotels/beach', 'hotels/family', 'hotels/luxury',
  'hotels/canggu', 'hotels/ubud', 'hotels/seminyak', 'hotels/kuta',
  'hotels/jimbaran', 'hotels/uluwatu', 'hotels/sanur', 'hotels/nusa-dua',
  'nightlife/bars', 'nightlife/beach-clubs', 'nightlife/clubs', 'nightlife/rooftop',
  'attractions/free', 'attractions/kids',
]

// ─── Helpers ────────────────────────────────────────────────────────────────

async function* walkHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walkHtml(full)
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      yield full
    }
  }
}

function routeFromPath(htmlPath) {
  // /dist/restaurants/foo/index.html → restaurants/foo
  // /dist/index.html → /
  const rel = relative(DIST, htmlPath).replace(/\\/g, '/')
  if (rel === 'index.html') return '/'
  return rel.replace(/\/index\.html$/, '').replace(/\.html$/, '')
}

function isEntityPage(route) {
  if (NON_ENTITY_SUBPATHS.includes(route)) return false
  return ENTITY_ROUTES.some(rx => rx.test(route))
}

function entityType(route) {
  const m = route.match(/^([^/]+)\/[^/]+$/)
  return m ? m[1] : null
}

function hebrewRatio(text) {
  if (!text) return 0
  const stripped = text.replace(/\s/g, '')
  if (!stripped.length) return 0
  const heb = stripped.match(/[\u0590-\u05FF]/g) || []
  return heb.length / stripped.length
}

// ─── Audit a single page ────────────────────────────────────────────────────

function auditPage(html, route) {
  const $ = cheerio.load(html)
  const issues = []
  const add = (severity, code, message) => issues.push({ severity, code, message })

  // ── 1. <html lang/dir>
  const lang = $('html').attr('lang')
  const dir = $('html').attr('dir')
  if (lang !== 'he') add('error', 'html-lang', `<html lang> = "${lang}", expected "he"`)
  if (dir !== 'rtl') add('error', 'html-dir', `<html dir> = "${dir}", expected "rtl"`)

  // ── 2. <title>
  const title = $('title').first().text().trim()
  if (!title) add('error', 'title-missing', '<title> is missing or empty')
  else {
    if (title.length < TITLE_MIN) add('warning', 'title-short', `Title length ${title.length} (<${TITLE_MIN})`)
    if (title.length > TITLE_MAX) add('warning', 'title-long', `Title length ${title.length} (>${TITLE_MAX})`)
  }

  // ── 3. meta description
  const desc = $('meta[name="description"]').attr('content')?.trim() || ''
  if (!desc) add('error', 'desc-missing', 'meta description is missing')
  else {
    if (desc.length < DESC_MIN) add('error', 'desc-too-short', `Description length ${desc.length} (<${DESC_MIN})`)
    else if (desc.length < DESC_IDEAL_MIN) add('warning', 'desc-short', `Description length ${desc.length} (<${DESC_IDEAL_MIN} ideal)`)
    if (desc.length > DESC_IDEAL_MAX) add('warning', 'desc-long', `Description length ${desc.length} (>${DESC_IDEAL_MAX})`)
  }

  // ── 4. canonical
  const canonical = $('link[rel="canonical"]').attr('href') || ''
  if (!canonical) add('error', 'canonical-missing', 'canonical link is missing')
  else if (!canonical.startsWith('https://')) add('error', 'canonical-not-absolute', `canonical "${canonical}" is not absolute`)

  // ── 5. Open Graph
  const ogChecks = ['og:title', 'og:description', 'og:url', 'og:image', 'og:locale']
  for (const prop of ogChecks) {
    const val = $(`meta[property="${prop}"]`).attr('content')
    if (!val) add('error', `og-missing:${prop}`, `${prop} is missing`)
  }

  // ── 6. JSON-LD schema
  const ldScripts = $('script[type="application/ld+json"]').toArray()
  if (ldScripts.length === 0) add('error', 'schema-missing', 'No JSON-LD schema found')

  const schemas = []
  for (const el of ldScripts) {
    const raw = $(el).contents().text()
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) schemas.push(...parsed)
      else schemas.push(parsed)
    } catch (e) {
      add('error', 'schema-invalid', `JSON-LD parse failed: ${e.message.slice(0, 60)}`)
    }
  }

  const schemaTypes = schemas.map(s => s['@type']).filter(Boolean)
  const hasBreadcrumb = schemaTypes.includes('BreadcrumbList')
  if (!hasBreadcrumb && route !== '/') add('warning', 'schema-no-breadcrumb', 'No BreadcrumbList schema')

  // ── 7. H1 / H2 hierarchy
  const h1s = $('h1').toArray()
  if (h1s.length === 0) add('error', 'h1-missing', 'No <h1> on page')
  else if (h1s.length > 1) add('error', 'h1-multiple', `Multiple <h1> tags found (${h1s.length})`)

  const h2s = $('h2').toArray().map(el => $(el).text().trim())
  if (h2s.length < 2) add('warning', 'h2-few', `Only ${h2s.length} <h2> tags`)

  // ── 8. img alt
  const imgs = $('img').toArray()
  let imgsWithoutAlt = 0
  for (const img of imgs) {
    const alt = $(img).attr('alt')
    if (alt === undefined || alt.trim() === '') imgsWithoutAlt++
  }
  if (imgsWithoutAlt > 0) add('warning', 'img-no-alt', `${imgsWithoutAlt} <img> tags without alt`)

  // ── 9. Hebrew content ratio (main content only)
  const bodyText = $('main').text() || $('body').text()
  const ratio = hebrewRatio(bodyText)
  if (ratio < 0.5) add('warning', 'hebrew-low', `Hebrew character ratio ${(ratio * 100).toFixed(0)}% (<50%)`)

  // ── 10. Forbidden terms (other destinations / placeholders)
  const fullText = $('body').text()
  for (const term of FORBIDDEN_TERMS) {
    if (fullText.includes(term)) {
      const sev = ['Lorem ipsum', 'TODO', 'PLACEHOLDER', 'FIXME'].includes(term) ? 'error' : 'warning'
      add(sev, 'forbidden-term', `Found forbidden term "${term}"`)
    }
  }

  // ── 11. Entity-page–specific checks
  if (isEntityPage(route)) {
    const h1Text = $('h1').first().text().trim()
    const entityName = h1Text

    // Strip "באלי" suffix from h1 to get cleaner entity name for matching
    const baseName = entityName.replace(/\s*באלי\s*$/u, '').trim()

    // Build "name tokens" for fuzzy matching — drop parentheticals, split on separators,
    // keep Hebrew tokens of length ≥ 2. This catches short variations used in DB copy.
    const stripped = baseName.replace(/\([^)]*\)/g, '').replace(/[|—–-]/g, ' ')
    const nameTokens = stripped.split(/\s+/).filter(t => t.length >= 2 && /[\u0590-\u05FF]/.test(t))
    const matchesName = (text) => {
      if (!text) return false
      if (baseName && text.includes(baseName)) return true
      // Fuzzy: at least 1 Hebrew token from the name appears
      return nameTokens.some(tok => text.includes(tok))
    }

    // 11.1 H2s should mention entity name (fuzzy)
    const h2Mentions = h2s.filter(h => matchesName(h)).length
    const h2Pct = h2s.length ? (h2Mentions / h2s.length) : 0
    if (h2s.length > 0 && h2Pct < 0.4) {
      add('warning', 'entity-h2-density', `Only ${h2Mentions}/${h2s.length} H2s mention entity name (${(h2Pct * 100).toFixed(0)}%)`)
    }

    // 11.2 FAQ schema present?
    const hasFaq = schemaTypes.includes('FAQPage')
    if (!hasFaq) add('warning', 'entity-no-faq-schema', 'Entity page has no FAQPage schema')

    // 11.3 FAQ count + entity mentions (fuzzy for name)
    const faqSchema = schemas.find(s => s['@type'] === 'FAQPage')
    if (faqSchema?.mainEntity) {
      const questions = faqSchema.mainEntity.map(q => q.name || '')
      if (questions.length < 3) add('warning', 'entity-faq-few', `Only ${questions.length} FAQ questions (<3)`)

      const entityInQuestions = questions.filter(q => matchesName(q)).length
      if (entityInQuestions < 2) {
        add('warning', 'entity-faq-no-name', `Only ${entityInQuestions}/${questions.length} FAQs mention entity name`)
      }

      // "באלי" can also appear in the answer text — still flag if no question mentions it,
      // but also check answers for a looser signal.
      const baliInQuestions = questions.filter(q => q.includes('באלי')).length
      const baliInAnswers = faqSchema.mainEntity.some(item => (item.acceptedAnswer?.text || '').includes('באלי'))
      if (baliInQuestions < 1 && !baliInAnswers) {
        add('warning', 'entity-faq-no-bali', 'No FAQ question or answer mentions "באלי"')
      }
    }

    // 11.4 Schema type matches page type
    const expected = {
      restaurants: 'Restaurant',
      hotels: 'Hotel',
      attractions: 'TouristAttraction',
      tours: 'Product',
      nightlife: 'LocalBusiness',
      guides: 'Article',
      areas: 'Place',
    }
    const expectedType = expected[entityType(route)]
    if (expectedType && !schemaTypes.includes(expectedType)) {
      add('error', 'entity-schema-wrong', `Expected ${expectedType} schema, got [${schemaTypes.join(', ')}]`)
    }
  }

  return { route, issues, title, descLength: desc.length, schemaTypes }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  // Ensure dist exists
  try {
    await stat(DIST)
  } catch {
    console.error('❌ dist/ not found. Run `npm run build` first.')
    process.exit(1)
  }

  console.log('🔍 Scanning HTML files in dist/...')
  const results = []
  const titles = new Map() // for dup detection
  let count = 0

  for await (const file of walkHtml(DIST)) {
    const html = await readFile(file, 'utf8')
    const route = routeFromPath(file)
    const result = auditPage(html, route)
    results.push(result)

    // Title duplication tracking
    if (result.title) {
      const list = titles.get(result.title) || []
      list.push(route)
      titles.set(result.title, list)
    }

    count++
    if (count % 50 === 0) console.log(`  ...scanned ${count}`)
  }

  // Detect duplicate titles
  for (const [t, routes] of titles.entries()) {
    if (routes.length > 1) {
      for (const r of routes) {
        const result = results.find(x => x.route === r)
        result.issues.push({
          severity: 'warning',
          code: 'title-duplicate',
          message: `Title shared with ${routes.length - 1} other page(s): "${t.slice(0, 60)}..."`,
        })
      }
    }
  }

  // ── Aggregate stats
  const total = results.length
  const errors = results.filter(r => r.issues.some(i => i.severity === 'error'))
  const warnings = results.filter(r => r.issues.some(i => i.severity === 'warning'))
  const clean = results.filter(r => r.issues.length === 0)

  const issueCounts = {}
  for (const r of results) {
    for (const i of r.issues) {
      const key = `${i.severity}:${i.code}`
      issueCounts[key] = (issueCounts[key] || 0) + 1
    }
  }
  const sortedIssues = Object.entries(issueCounts).sort((a, b) => b[1] - a[1])

  // ── Write JSON report
  const jsonReport = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      clean: clean.length,
      withErrors: errors.length,
      withWarnings: warnings.length,
    },
    topIssues: sortedIssues.slice(0, 20).map(([key, count]) => ({ key, count })),
    pages: results.map(r => ({
      route: r.route,
      title: r.title,
      descLength: r.descLength,
      schemaTypes: r.schemaTypes,
      issues: r.issues,
    })),
  }
  await writeFile(join(ROOT, 'audit-report.json'), JSON.stringify(jsonReport, null, 2))

  // ── Write Markdown report
  const md = []
  md.push('# Yalla Bali — Content & SEO Audit Report')
  md.push(`\nGenerated: ${jsonReport.timestamp}\n`)
  md.push('## Summary\n')
  md.push(`- **Total pages scanned**: ${total}`)
  md.push(`- **Clean (no issues)**: ${clean.length} (${((clean.length / total) * 100).toFixed(1)}%)`)
  md.push(`- **With errors**: ${errors.length}`)
  md.push(`- **With warnings**: ${warnings.length}`)
  md.push('')

  md.push('## Top Issues\n')
  md.push('| Severity:Code | Count |')
  md.push('|---|---|')
  for (const [key, count] of sortedIssues) {
    md.push(`| ${key} | ${count} |`)
  }
  md.push('')

  if (errors.length) {
    md.push('## Pages with Errors\n')
    for (const r of errors.slice(0, 50)) {
      md.push(`### \`${r.route}\``)
      const errs = r.issues.filter(i => i.severity === 'error')
      for (const e of errs) md.push(`- 🔴 **${e.code}**: ${e.message}`)
      md.push('')
    }
    if (errors.length > 50) md.push(`\n_... and ${errors.length - 50} more_\n`)
  }

  if (warnings.length) {
    md.push('## Pages with Warnings (sample)\n')
    for (const r of warnings.slice(0, 20)) {
      const warns = r.issues.filter(i => i.severity === 'warning')
      if (warns.length === 0) continue
      md.push(`### \`${r.route}\``)
      for (const w of warns) md.push(`- 🟡 **${w.code}**: ${w.message}`)
      md.push('')
    }
    if (warnings.length > 20) md.push(`\n_... and ${warnings.length - 20} more_\n`)
  }

  await writeFile(join(ROOT, 'audit-report.md'), md.join('\n'))

  // ── Console summary
  console.log('\n──────────────────────────────────────────')
  console.log(`📊 Audit complete: ${total} pages scanned`)
  console.log(`   ✅ Clean:     ${clean.length}`)
  console.log(`   🔴 Errors:    ${errors.length}`)
  console.log(`   🟡 Warnings:  ${warnings.length}`)
  console.log('──────────────────────────────────────────')
  console.log('\nTop 10 issues:')
  for (const [key, count] of sortedIssues.slice(0, 10)) {
    console.log(`   ${count.toString().padStart(4)} × ${key}`)
  }
  console.log('\nReports written:')
  console.log('   audit-report.json')
  console.log('   audit-report.md')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
