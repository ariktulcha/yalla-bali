/**
 * fix-descriptions.mjs
 * Updates Supabase records with proper Hebrew descriptions (120-160 chars)
 * for the 14 records flagged as desc-too-short by the audit.
 *
 * Usage:
 *   node scripts/fix-descriptions.mjs           # dry run, shows what would change
 *   node scripts/fix-descriptions.mjs --apply   # actually writes to Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// Load .env
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

// Updates: { table, slug, meta_description }
// Each description is 120-160 chars, includes "באלי", direct and factual.
const updates = [
  // ── AREAS ────────────────────────────────────────────────────────────────
  {
    table: 'areas', slug: 'amed',
    meta_description: 'אמד באלי — יישוב דייגים שלו במזרח האי, ידוע בחופים שחורים מהר געש, אתרי צלילה ושנירקול מהיפים בבאלי ואווירה כפרית אותנטית.',
  },
  {
    table: 'areas', slug: 'canggu',
    meta_description: 'קאנגו באלי — אזור גלישה פופולרי בדרום-מערב, מרכז ל-digital nomads, מלא בביץ\' קלאבים, מסעדות vegan וחיי לילה תוססים על קצה הים.',
  },
  {
    table: 'areas', slug: 'jimbaran',
    meta_description: 'ג\'ימבארן באלי — מפרץ פסטורלי דרומית לדנפסר, מפורסם במסעדות הדגים על האש לאור שקיעה, חוף לבן וחווית טעמים אותנטית של באלי.',
  },
  {
    table: 'areas', slug: 'kuta',
    meta_description: 'קוטה באלי — לב התיירות בדרום האי, חוף ארוך לגלישה מתחילים, רחובות שופעי חנויות, חיי לילה תוססים וקרבה לנמל התעופה הבינלאומי.',
  },
  {
    table: 'areas', slug: 'nusa-dua',
    meta_description: 'נוסה דואה באלי — שכונת מלונות יוקרה בקצה הדרומי של האי, חופי לבן שקטים, ספא מפנקים ופארק מים — אידיאלית למשפחות וזוגות.',
  },
  {
    table: 'areas', slug: 'sanur',
    meta_description: 'סאנור באלי — עיירת חוף שקטה בחוף המזרחי, אווירה רגועה ומשפחתית, טיילת ארוכה, מסעדות מקומיות וגישה נוחה לאיי נוסה פנידה ולמבונגן.',
  },
  {
    table: 'areas', slug: 'seminyak',
    meta_description: 'סמיניאק באלי — אזור היוקרה והאופנה של דרום האי, מסעדות שף, ביץ\' קלאבים יוקרתיים, בוטיקים מעוצבים וחיי לילה ברמה בינלאומית.',
  },
  {
    table: 'areas', slug: 'ubud',
    meta_description: 'אובוד באלי — לב התרבות הבאלינזית במרכז האי, מוקפת שדות אורז ירוקים, סטודיו יוגה, מקדשים, יער הקופים וסצנת אומנות עשירה.',
  },
  {
    table: 'areas', slug: 'uluwatu',
    meta_description: 'אולוואטו באלי — חצי האי הדרומי המוקף צוקים מרהיבים, גלי גלישה מתקדמים, מקדש על קצה הצוק מעל האוקיינוס וביץ\' קלאבים נצפים.',
  },

  // ── HOTELS ───────────────────────────────────────────────────────────────
  {
    table: 'hotels', slug: 'the-seminyak-beach-resort',
    meta_description: 'דה סמינייק ביץ\' ריזורט באלי — מלון 5 כוכבים בלב סמינייק על קו החוף, חדרים מרווחים עם בריכה פרטית, ספא מפנק ושירות אישי ברמה גבוהה.',
  },

  // ── ATTRACTIONS ──────────────────────────────────────────────────────────
  {
    table: 'attractions', slug: 'sekumpul-waterfalls',
    meta_description: 'מפלי סקומפול בבאלי — אחד המפלים המרשימים באי, סדרת 7 מפלים בג\'ונגל בצפון, דורש טרק קל ומתגמל בנוף שמחזיר את כל המאמץ.',
  },

  // ── GUIDES ───────────────────────────────────────────────────────────────
  {
    table: 'guides', slug: 'evoa-bali',
    meta_description: 'eVOA לבאלי — המדריך השלם לוויזה האלקטרונית: איך מגישים בקשה, כמה זה עולה, כמה זמן זה לוקח, ומה ההבדל בין VOA רגיל לאלקטרוני.',
  },
  {
    table: 'guides', slug: 'kosher-food-bali',
    meta_description: 'אוכל כשר בבאלי — סקירת האפשרויות הזמינות לתיירים ישראלים: מסעדות עם תפריט כשר, מוצרים שאפשר להביא, וטיפים לשמירת כשרות באי.',
  },
  {
    table: 'guides', slug: 'vegetarian-vegan-bali',
    meta_description: 'אוכל צמחוני וטבעוני בבאלי — באלי היא גן עדן ל-vegan: מאות מסעדות, סצנת בריאות עשירה במיוחד באובוד וקאנגו, ומחירים נוחים לכל כיס.',
  },
]

async function main() {
  console.log(`🔧 ${APPLY ? 'APPLYING' : 'DRY RUN'} — ${updates.length} records to update\n`)

  for (const u of updates) {
    const len = u.meta_description.length
    const status = len >= 120 && len <= 165 ? '✅' : '⚠️'
    console.log(`${status} ${u.table}/${u.slug} (${len} chars)`)
    console.log(`   "${u.meta_description}"`)

    if (APPLY) {
      const { error } = await supa
        .from(u.table)
        .update({ meta_description: u.meta_description })
        .eq('destination_id', DESTINATION_ID)
        .eq('slug', u.slug)

      if (error) console.log(`   ❌ ERROR: ${error.message}`)
      else console.log(`   ✅ Updated`)
    }
    console.log('')
  }

  if (!APPLY) {
    console.log('\n💡 Run with --apply to actually write these changes to Supabase.')
  }
}

main().catch(err => { console.error(err); process.exit(1) })
