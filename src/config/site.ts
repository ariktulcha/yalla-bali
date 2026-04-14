/**
 * Site configuration — THE ONE FILE to change per destination.
 *
 * When cloning for a new destination:
 * 1. Copy this file
 * 2. Change all values below
 * 3. Done — Layout, Head, footer, all read from here
 */

export const site = {
  brand: 'Yalla Bali',
  brandHe: 'יאללה באלי',
  brandAccent: 'באלי',           // The colored part of the logo
  brandPrefix: 'יאללה',          // The white part of the logo
  tagline: 'YOUR BALI GUIDE',
  taglineHe: 'המדריך הישראלי לבאלי',
  domain: 'ibalibali.com',
  destinationName: 'באלי',       // Used in "מלונות ב{destinationName}"
  destinationNameEn: 'Bali',

  socials: {
    instagram: 'https://instagram.com/yallabaliil',
    facebook: 'https://facebook.com/yallabaliil',
    tiktok: 'https://tiktok.com/@yallabaliil',
  },

  hasTours: false,

  // Desktop nav links
  nav: [
    { label: 'ויזה לבאלי', href: '/visa' },
    { label: 'אטרקציות', href: '/attractions' },
    { label: 'אזורים', href: '/areas' },
    { label: 'מלונות', href: '/hotels' },
    { label: 'מסעדות', href: '/restaurants' },
    { label: 'מדריכים', href: '/guides' },
    { label: 'תכנון טיול', href: '/plan' },
  ],

  // Mobile menu sections
  mobileMenu: [
    {
      title: 'ויזה ותכנון',
      links: [
        { label: 'ויזה לבאלי', href: '/visa' },
        { label: 'תכנון טיול', href: '/plan' },
        { label: 'מדריכים', href: '/guides' },
        { label: 'אזורים', href: '/areas' },
      ],
    },
    {
      title: 'גלו',
      links: [
        { label: 'אטרקציות', href: '/attractions' },
        { label: 'מלונות', href: '/hotels' },
        { label: 'מסעדות', href: '/restaurants' },
        { label: 'חיי לילה', href: '/nightlife' },
      ],
    },
  ],

  // Footer columns
  footer: {
    description: 'המדריך המלא שלכם לבאלי — מסעדות, מלונות, אטרקציות וחוויות בלתי נשכחות.',
    columns: [
      {
        title: 'ויזה וטיולים',
        links: [
          { label: 'ויזה לבאלי', href: '/visa' },
          { label: 'מלונות בבאלי', href: '/hotels' },
          { label: 'מסעדות בבאלי', href: '/restaurants' },
          { label: 'תכנון טיול', href: '/plan' },
          { label: 'מדריכים', href: '/guides' },
          { label: 'אזורים בבאלי', href: '/areas' },
        ],
      },
      {
        title: 'גלו',
        links: [
          { label: 'אטרקציות', href: '/attractions' },
          { label: 'חופים', href: '/beaches' },
          { label: 'מלונות', href: '/hotels' },
          { label: 'מסעדות', href: '/restaurants' },
          { label: 'חיי לילה', href: '/nightlife' },
          { label: 'שופינג ושווקים', href: '/shopping' },
        ],
      },
      {
        title: 'מידע',
        links: [
          { label: 'מזג אוויר בבאלי', href: '/weather' },
          { label: 'שאלות נפוצות', href: '/faq' },
          { label: 'אודות', href: '/about' },
          { label: 'צור קשר', href: '/contact' },
        ],
      },
    ],
  },

  // Default OG image path (relative to public/)
  defaultOgImage: '/images/heroes/hero-bali.webp',

  // Page title suffixes per entity type
  titleSuffix: {
    restaurant: 'מסעדות',
    hotel: 'מלונות',
    attraction: 'אטרקציות',
    nightlife: 'חיי לילה',
    tour: 'טיולים',
    guide: 'מדריכים',
    area: 'אזורים',
  },
} as const

// Helper: build page title with brand suffix.
// Strategy to keep title ≤ 70 chars:
//   1) Try full: prefix + entity-type suffix + brand
//   2) If too long, drop the entity-type suffix
//   3) If still too long, also strip "— name_en" tail from prefix (everything after " — ")
export function pageTitle(prefix: string, entityType?: keyof typeof site.titleSuffix): string {
  const fullSuffix = entityType ? ` | ${site.titleSuffix[entityType]} ב${site.destinationName}` : ''
  const brandSuffix = ` | ${site.brand}`

  const full = prefix + fullSuffix + brandSuffix
  if (full.length <= 70) return full

  const noMid = prefix + brandSuffix
  if (noMid.length <= 70) return noMid

  // Strip "— English name" tail (em-dash splitter used by entity templates)
  const heOnly = prefix.split(' — ')[0]
  return `${heOnly}${brandSuffix}`
}
