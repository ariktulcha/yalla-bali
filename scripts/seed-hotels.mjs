import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split('\n').filter(l => l.includes('=')).map(l => {
    const [k, ...v] = l.split('=')
    return [k.trim(), v.join('=').trim()]
  })
)
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
const AFFILIATE_ID = process.env.BOOKING_AFFILIATE_ID || env.BOOKING_AFFILIATE_ID || ''

function bookingUrl(nameEn) {
  const u = new URL('https://www.booking.com/searchresults.html')
  u.searchParams.set('ss', `${nameEn} Bali`)
  u.searchParams.set('lang', 'he')
  u.searchParams.set('aid', AFFILIATE_ID)
  return u.toString()
}

const IMG = [
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
  'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=1200&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
]
const pickImg = i => IMG[i % IMG.length]

// Build hotel rows. Fields align with existing schema observed in Supabase.
function row(data, idx) {
  const {
    slug, name_he, name_en, area, star_rating, price_range,
    excerpt, amenities = ['בריכה', 'אינטרנט'],
    family_friendly = false, beach_access = false, rating = null,
    address, featured = false,
  } = data
  return {
    destination_id: 'bali',
    slug,
    name_he,
    name_en,
    area,
    star_rating,
    price_range,
    excerpt,
    amenities,
    family_friendly,
    beach_access,
    rating,
    address: address || `${name_en}, Bali, Indonesia`,
    image: pickImg(idx),
    booking_url: bookingUrl(name_en),
    published: true,
    featured,
    meta_title: `${name_he} — ${area.charAt(0).toUpperCase() + area.slice(1)} | Yalla Bali`,
    meta_description: `${excerpt} מלון ${star_rating} כוכבים ב${area === 'canggu' ? 'קאנגו' : area === 'ubud' ? 'אובוד' : area === 'seminyak' ? 'סמינייק' : area === 'kuta' ? 'קוטה' : area === 'sanur' ? 'סנור' : area === 'nusa-dua' ? 'נוסה דואה' : area === 'uluwatu' ? 'אולוואטו' : 'ג\'ימברן'}, באלי.`,
  }
}

const HOTELS = [
  // ============ CANGGU (12) ============
  { slug: 'como-uma-canggu', name_he: 'קומו אומה קאנגו', name_en: 'COMO Uma Canggu', area: 'canggu', star_rating: 5, price_range: 4, rating: 4.8,
    excerpt: 'מלון יוקרה על חוף ברוואה עם בריכה אינסוף, ספא COMO Shambhala וסטודיו סורף פרטי.',
    amenities: ['בריכה','ספא','חדר כושר','מסעדה','חוף פרטי','סטודיו יוגה'], beach_access: true, featured: true },
  { slug: 'the-slow-canggu', name_he: 'דה סלואו', name_en: 'The Slow', area: 'canggu', star_rating: 5, price_range: 4, rating: 4.7,
    excerpt: 'בוטיק של 12 חדרים עם אוסף אמנות, מסעדה חגיגית ואווירה של בית פרטי ברחוב בטו בולונג.',
    amenities: ['בריכה','מסעדה','בר','אמנות','אינטרנט'] },
  { slug: 'hotel-tugu-bali', name_he: 'הוטל טוגו באלי', name_en: 'Hotel Tugu Bali', area: 'canggu', star_rating: 5, price_range: 3, rating: 4.7,
    excerpt: 'מלון-מוזיאון על חוף בטו בולונג, מלא עתיקות בלינזיות, עם ספא מרהיב ורומנטיקה של פעם.',
    amenities: ['בריכה','ספא','מסעדה','חוף','אמנות'], beach_access: true },
  { slug: 'theanna-eco-villa-canggu', name_he: 'תאנה אקו וילה וספא', name_en: 'Theanna Eco Villa & Spa', area: 'canggu', star_rating: 4, price_range: 3, rating: 4.6,
    excerpt: 'וילות פרטיות עם בריכה ירוקה בלב שדות אורז בקאנגו — שקט, פרטי, סגנון אקו.',
    amenities: ['בריכה פרטית','ספא','שדות אורז','מסעדה'] },
  { slug: 'amadea-resort-canggu', name_he: 'אמדיאה ריזורט קאנגו', name_en: 'Amadea Resort Villas Seminyak Bali', area: 'canggu', star_rating: 4, price_range: 3, rating: 4.5,
    excerpt: 'ריזורט עם וילות פרטיות ובריכת ים-רכב גדולה במרחק הליכה מחוף באטו בולונג.',
    amenities: ['בריכה','ספא','מסעדה','חדר כושר'], family_friendly: true },
  { slug: 'aston-canggu-beach', name_he: 'אסטון קאנגו ביץ׳ ריזורט', name_en: 'Aston Canggu Beach Resort', area: 'canggu', star_rating: 4, price_range: 3, rating: 4.4,
    excerpt: 'מלון משפחתי על חוף באטו בולונג עם בריכות, מועדון ילדים וגישה ישירה לחוף.',
    amenities: ['בריכה','מועדון ילדים','מסעדה','חוף'], family_friendly: true, beach_access: true },
  { slug: 'the-haven-suites-berawa', name_he: 'דה הייבן סוויטס ברוואה', name_en: 'The Haven Suites Bali Berawa', area: 'canggu', star_rating: 4, price_range: 3, rating: 4.4,
    excerpt: 'סוויטות מרווחות עם מטבחונים, בריכה גדולה ומרחק של שתי דקות הליכה לחוף ברוואה.',
    amenities: ['בריכה','מטבחון','ספא','מסעדה'], family_friendly: true },
  { slug: 'amertis-villas-canggu', name_he: 'אמרטיס וילות קאנגו', name_en: 'Ametis Villa Canggu', area: 'canggu', star_rating: 4, price_range: 3, rating: 4.6,
    excerpt: 'וילות פרטיות בוטיק עם בריכה אישית — רומנטי, שקט, צמוד לחוף ברוואה.',
    amenities: ['בריכה פרטית','מטבחון','ארוחת בוקר'] },
  { slug: 'frii-bali-echo-beach', name_he: 'פרי באלי אקו ביץ׳', name_en: 'FRii Bali Echo Beach', area: 'canggu', star_rating: 3, price_range: 2, rating: 4.3,
    excerpt: 'מלון מודרני ונגיש במיקום מעולה באזור אקו ביץ׳, בריכת גג ועיצוב צעיר.',
    amenities: ['בריכת גג','בר','אינטרנט'], beach_access: true },
  { slug: 'm-boutique-hostel-canggu', name_he: 'אם בוטיק הוסטל קאנגו', name_en: 'M Boutique Hostel Canggu', area: 'canggu', star_rating: 2, price_range: 1, rating: 4.4,
    excerpt: 'הוסטל בוטיק עם חדרים פרטיים ודורמים, בריכה ואווירה חברתית — מושלם לנוודים.',
    amenities: ['בריכה','מטבח משותף','אינטרנט'] },
  { slug: 'puri-canggu-villas', name_he: 'פורי קאנגו וילות', name_en: 'Puri Canggu Villas', area: 'canggu', star_rating: 3, price_range: 2, rating: 4.3,
    excerpt: 'וילות קומפקטיות עם בריכה פרטית ומחיר חברתי — ערך מעולה לכסף במיקום מרכזי.',
    amenities: ['בריכה פרטית','מטבחון','ארוחת בוקר'] },
  { slug: 'batu-bolong-suites', name_he: 'באטו בולונג סוויטס', name_en: 'Batu Bolong Suites', area: 'canggu', star_rating: 3, price_range: 2, rating: 4.2,
    excerpt: 'סוויטות מודרניות ברחוב הראשי של באטו בולונג, בריכה ומרחק הליכה לכל מקום.',
    amenities: ['בריכה','מטבחון','אינטרנט'] },

  // ============ UBUD (12) ============
  { slug: 'four-seasons-sayan', name_he: 'פור סיזנס סייאן אובוד', name_en: 'Four Seasons Resort Bali at Sayan', area: 'ubud', star_rating: 5, price_range: 4, rating: 4.9,
    excerpt: 'ריזורט אגדי מעל נהר איוס — וילות עם בריכה פרטית, ספא מרהיב וארכיטקטורה של ג׳ון הרדי.',
    amenities: ['בריכה','ספא','וילה פרטית','חדר כושר','מסעדה'], featured: true },
  { slug: 'mandapa-ritz-carlton', name_he: 'מנדפה ריץ׳ קרלטון ריזרב', name_en: 'Mandapa, A Ritz-Carlton Reserve', area: 'ubud', star_rating: 5, price_range: 4, rating: 4.9,
    excerpt: 'כפר יוקרתי על גדות איוס עם וילות בריכה פרטית ושירות של ריץ׳ קרלטון ריזרב.',
    amenities: ['בריכה','ספא','בריכה פרטית','מסעדה','יוגה'], featured: true },
  { slug: 'como-shambhala-estate', name_he: 'קומו שאמבהאלה אסטייט', name_en: 'COMO Shambhala Estate', area: 'ubud', star_rating: 5, price_range: 4, rating: 4.8,
    excerpt: 'מקלט wellness הוליסטי מעל נהר איוס — תפריט תזונתי, יוגה, ספא ועיצוב מדהים.',
    amenities: ['בריכה','ספא','יוגה','wellness','מסעדה'] },
  { slug: 'alila-ubud', name_he: 'אלילה אובוד', name_en: 'Alila Ubud', area: 'ubud', star_rating: 5, price_range: 3, rating: 4.7,
    excerpt: 'אבן דרך ארכיטקטונית בקצה עמק איוס — בריכה אינסוף מהוללת ואווירה של עידן נעלם.',
    amenities: ['בריכה אינסוף','ספא','יוגה','מסעדה'] },
  { slug: 'viceroy-bali', name_he: 'וייסרוי באלי אובוד', name_en: 'Viceroy Bali', area: 'ubud', star_rating: 5, price_range: 4, rating: 4.8,
    excerpt: 'וילות חמישה כוכבים עם בריכה פרטית על רכס פטאנו — מקום השקיעה המפורסם מ-Eat Pray Love.',
    amenities: ['בריכה פרטית','ספא','מסעדה שף','חדר כושר'] },
  { slug: 'capella-ubud', name_he: 'קאפלה אובוד', name_en: 'Capella Ubud', area: 'ubud', star_rating: 5, price_range: 4, rating: 4.9,
    excerpt: 'אוהלי ספארי יוקרתיים בתוך יער גשם — חוויית גלמפינג שאין לה אח ורע.',
    amenities: ['בריכה פרטית','ספא','גלמפינג','מסעדה'] },
  { slug: 'kamandalu-ubud', name_he: 'קמאנדלו אובוד', name_en: 'Kamandalu Ubud', area: 'ubud', star_rating: 5, price_range: 3, rating: 4.7,
    excerpt: 'ריזורט עם וילות בריכה פרטית מוקפות שדות אורז — שקט מוחלט, ספא וטיפוח מעולה.',
    amenities: ['בריכה פרטית','ספא','יוגה','מסעדה'] },
  { slug: 'padma-resort-ubud', name_he: 'פדמה ריזורט אובוד', name_en: 'Padma Resort Ubud', area: 'ubud', star_rating: 5, price_range: 3, rating: 4.7,
    excerpt: 'ריזורט משפחתי עם בריכה ענקית, מועדון ילדים מהשובים באי והרבה פעילויות ג׳ונגל.',
    amenities: ['בריכה','ספא','מועדון ילדים','חדר כושר','מסעדה'], family_friendly: true },
  { slug: 'bambu-indah', name_he: 'במבו אינדה', name_en: 'Bambu Indah', area: 'ubud', star_rating: 4, price_range: 3, rating: 4.6,
    excerpt: 'אוסף של בתים אנטיקים מצ׳ה שהוסבו לחדרי בוטיק — ייחודי, אורגני, בין שדות אורז.',
    amenities: ['בריכה','יוגה','מסעדה','אמנות'] },
  { slug: 'komaneka-keramas', name_he: 'קומנקה קרמאס', name_en: 'Komaneka at Keramas Beach', area: 'ubud', star_rating: 4, price_range: 3, rating: 4.6,
    excerpt: 'וילות מודרניות עם בריכה פרטית בין שדות אורז, שייכות לרשת קומנקה המצוינת של אובוד.',
    amenities: ['בריכה פרטית','ספא','מסעדה'] },
  { slug: 'goya-boutique-ubud', name_he: 'גויה בוטיק ריזורט אובוד', name_en: 'Goya Boutique Resort', area: 'ubud', star_rating: 4, price_range: 2, rating: 4.5,
    excerpt: 'בוטיק קטן ובלתי רשמי בכפר פנסטנן — עיצוב בלינזי אותנטי, בריכה חמימה ומחיר מצוין.',
    amenities: ['בריכה','ספא','ארוחת בוקר','מסעדה'] },
  { slug: 'artini-resort-ubud', name_he: 'ארתיני ריזורט אובוד', name_en: 'Artini Bisma Ubud', area: 'ubud', star_rating: 3, price_range: 2, rating: 4.4,
    excerpt: 'מלון חביב במרכז אובוד, בריכה קטנה ומיקום מושלם להליכות שוק וכפר פיליאטאן.',
    amenities: ['בריכה','ארוחת בוקר','אינטרנט'] },

  // ============ SEMINYAK (8) ============
  { slug: 'como-seminyak', name_he: 'קומו סמינייק', name_en: 'COMO Seminyak', area: 'seminyak', star_rating: 5, price_range: 4, rating: 4.8,
    excerpt: 'מלון חמישה כוכבים על חוף סמינייק עם עיצוב מפורט, ספא אגדי וסטנדרט COMO הידוע.',
    amenities: ['בריכה','ספא','מסעדה','חוף','חדר כושר'], beach_access: true, featured: true },
  { slug: 'anantara-seminyak', name_he: 'אננטרה סמינייק ריזורט', name_en: 'Anantara Seminyak Bali Resort', area: 'seminyak', star_rating: 5, price_range: 3, rating: 4.7,
    excerpt: 'מלון סוויטות עם גישה ישירה לחוף, בריכה אינסוף וספא מרגיע ממש בלב סמינייק.',
    amenities: ['בריכה אינסוף','ספא','חוף','מסעדה'], beach_access: true },
  { slug: 'hotel-indigo-seminyak', name_he: 'הוטל אינדיגו סמינייק', name_en: 'Hotel Indigo Bali Seminyak Beach', area: 'seminyak', star_rating: 5, price_range: 3, rating: 4.7,
    excerpt: 'מלון צבעוני ובעל אישיות עם בריכות רבות, גישה לחוף ועיצוב בלינזי-מודרני.',
    amenities: ['בריכה','ספא','מסעדה','חוף','חדר כושר'], beach_access: true, family_friendly: true },
  { slug: 'double-six-seminyak', name_he: 'דאבל סיקס לאקשרי הוטל', name_en: 'Double-Six Luxury Hotel Seminyak', area: 'seminyak', star_rating: 5, price_range: 3, rating: 4.6,
    excerpt: 'סוויטות מפואטות על חוף דאבל סיקס, בר גג עם נוף מרהיב וספא מפנק.',
    amenities: ['בריכה','ספא','בר גג','חוף','מסעדה'], beach_access: true },
  { slug: 'the-haven-seminyak', name_he: 'דה הייבן סמינייק', name_en: 'The Haven Bali Seminyak', area: 'seminyak', star_rating: 4, price_range: 3, rating: 4.5,
    excerpt: 'מלון בוטיק מודרני עם בריכה גדולה במיקום מעולה — דקה הליכה לרחוב סאייני ראיה.',
    amenities: ['בריכה','ספא','מסעדה','חדר כושר'], family_friendly: true },
  { slug: 'impiana-seminyak', name_he: 'אימפיאנה סמינייק', name_en: 'Impiana Private Villas Seminyak', area: 'seminyak', star_rating: 5, price_range: 3, rating: 4.6,
    excerpt: 'וילות פרטיות עם בריכה אישית במרחק דקות הליכה מחוף סמינייק והרחוב הראשי.',
    amenities: ['בריכה פרטית','ספא','מסעדה'] },
  { slug: 'pullman-bali-legian', name_he: 'פולמן באלי לגיאן ניראוואנה', name_en: 'Pullman Bali Legian Beach', area: 'seminyak', star_rating: 5, price_range: 3, rating: 4.5,
    excerpt: 'מלון על חוף לגיאן עם בריכה חלונית גדולה, מועדון ילדים ועמדת סורף ישירה לחוף.',
    amenities: ['בריכה','ספא','מועדון ילדים','חוף'], beach_access: true, family_friendly: true },
  { slug: 'bali-mandira-legian', name_he: 'באלי מנדירה ביץ׳ ריזורט', name_en: 'Bali Mandira Beach Resort & Spa', area: 'seminyak', star_rating: 4, price_range: 3, rating: 4.5,
    excerpt: 'ריזורט משפחתי ידוע על חוף לגיאן עם בריכות רבות, ספא וגינה טרופית גדולה.',
    amenities: ['בריכה','ספא','מסעדה','חוף'], beach_access: true, family_friendly: true },

  // ============ KUTA (12) ============
  { slug: 'sheraton-kuta', name_he: 'שרתון באלי קוטה ריזורט', name_en: 'Sheraton Bali Kuta Resort', area: 'kuta', star_rating: 5, price_range: 3, rating: 4.6,
    excerpt: 'מלון חמישה כוכבים על חוף קוטה עם בריכה אינסוף ישירה לים ומועדון ילדים.',
    amenities: ['בריכה אינסוף','ספא','מסעדה','חוף','מועדון ילדים'], beach_access: true, family_friendly: true, featured: true },
  { slug: 'pullman-kuta-beach', name_he: 'פולמן באלי קוטה ביץ׳', name_en: 'Pullman Bali Kuta Beach', area: 'kuta', star_rating: 5, price_range: 3, rating: 4.6,
    excerpt: 'מלון מודרני על חוף קוטה, בר גג עם נוף שקיעה ובריכות גדולות עם חלקים רדודים לילדים.',
    amenities: ['בריכה','ספא','בר גג','חוף','מסעדה'], beach_access: true, family_friendly: true },
  { slug: 'grand-inna-kuta', name_he: 'גרנד אינה קוטה', name_en: 'Grand Inna Kuta', area: 'kuta', star_rating: 4, price_range: 2, rating: 4.3,
    excerpt: 'מלון וותיק על חוף קוטה במיקום מעולה, גינה טרופית ובריכה משפחתית.',
    amenities: ['בריכה','מסעדה','חוף','גינה'], beach_access: true, family_friendly: true },
  { slug: 'mercure-kuta', name_he: 'מרקיור קוטה באלי', name_en: 'Mercure Kuta Bali', area: 'kuta', star_rating: 4, price_range: 2, rating: 4.4,
    excerpt: 'מלון אמין של רשת Accor, מרחק של דקות הליכה לחוף ולקניון Beachwalk.',
    amenities: ['בריכה','מסעדה','חדר כושר','אינטרנט'], family_friendly: true },
  { slug: 'fave-hotel-kuta-square', name_he: 'פייב הוטל קוטה סקוור', name_en: 'favehotel Kuta Square', area: 'kuta', star_rating: 3, price_range: 2, rating: 4.3,
    excerpt: 'מלון קומפקטי וצעיר ליד קוטה סקוור — מיקום מעולה במחיר חברתי.',
    amenities: ['בריכה','אינטרנט','ארוחת בוקר'] },
  { slug: 'ibis-styles-kuta-circle', name_he: 'איביס סטיילס קוטה סירקל', name_en: 'ibis Styles Bali Kuta Circle', area: 'kuta', star_rating: 3, price_range: 2, rating: 4.3,
    excerpt: 'מלון צעיר וצבעוני של Accor, בריכה קטנה וקרבה להאוס Ground Zero Memorial.',
    amenities: ['בריכה','ארוחת בוקר','אינטרנט'] },
  { slug: 'ramada-bintang-bali', name_he: 'ראמדה בינטאנג באלי', name_en: 'Ramada Bintang Bali Resort', area: 'kuta', star_rating: 4, price_range: 2, rating: 4.3,
    excerpt: 'ריזורט ישן-טוב עם גינה ענקית, בריכת ילדים וחוף קוטה מעבר לגדר.',
    amenities: ['בריכה','ספא','חוף','מסעדה'], beach_access: true, family_friendly: true },
  { slug: 'bali-garden-beach-resort', name_he: 'באלי גארדן ביץ׳ ריזורט', name_en: 'Bali Garden Beach Resort', area: 'kuta', star_rating: 4, price_range: 2, rating: 4.4,
    excerpt: 'ריזורט משפחתי עם בריכות רדודות לילדים וגישה ישירה לחוף קוטה.',
    amenities: ['בריכה','מסעדה','חוף','מועדון ילדים'], beach_access: true, family_friendly: true },
  { slug: 'all-seasons-resort-kuta', name_he: 'אול סיזנס ריזורט קוטה', name_en: 'ibis Bali Kuta', area: 'kuta', star_rating: 3, price_range: 2, rating: 4.2,
    excerpt: 'מלון מודרני ופשוט של רשת Accor, בריכה במרכז המלון ומיקום ליד Discovery Mall.',
    amenities: ['בריכה','ארוחת בוקר','אינטרנט'] },
  { slug: 'kuta-paradiso-hotel', name_he: 'קוטה פרדיסו', name_en: 'Kuta Paradiso Hotel', area: 'kuta', star_rating: 5, price_range: 2, rating: 4.5,
    excerpt: 'מלון חמישה כוכבים בגודל חברותי, בריכה יפהפייה ומרחק קצר מקניון Beachwalk.',
    amenities: ['בריכה','ספא','מסעדה','חדר כושר'], family_friendly: true },
  { slug: 'bintang-kuta-hotel', name_he: 'בינטאנג קוטה הוטל', name_en: 'Bintang Kuta Hotel', area: 'kuta', star_rating: 3, price_range: 2, rating: 4.2,
    excerpt: 'בחירה תקציבית טובה במיקום מעולה ברחוב פנטאי קוטה, בריכה וארוחת בוקר כלולה.',
    amenities: ['בריכה','ארוחת בוקר','אינטרנט'] },
  { slug: 'vouk-hotel-suites-kuta', name_he: 'ווק סוויטס', name_en: 'VOUK Hotel Suites Kuta', area: 'kuta', star_rating: 4, price_range: 2, rating: 4.4,
    excerpt: 'סוויטות מודרניות עם בריכת גג, מרחק הליכה לאייקון Beachwalk ולחוף קוטה.',
    amenities: ['בריכת גג','חדר כושר','אינטרנט'] },

  // ============ SANUR (12) ============
  { slug: 'hyatt-regency-sanur', name_he: 'היאט ריג׳נסי סנור', name_en: 'Hyatt Regency Bali', area: 'sanur', star_rating: 5, price_range: 3, rating: 4.7,
    excerpt: 'ריזורט חמישה כוכבים על חוף סנור, גינות ענק, שלוש בריכות ומרכז ספא מרהיב.',
    amenities: ['בריכה','ספא','מועדון ילדים','מסעדה','חוף'], beach_access: true, family_friendly: true, featured: true },
  { slug: 'fairmont-sanur-beach', name_he: 'פיירמונט סנור ביץ׳', name_en: 'Fairmont Sanur Beach Bali', area: 'sanur', star_rating: 5, price_range: 3, rating: 4.6,
    excerpt: 'מלון סוויטות יוקרתי עם בריכות גדולות, חדרים משפחתיים וחוף פרטי בלב סנור.',
    amenities: ['בריכה','ספא','חוף','סוויטות','מועדון ילדים'], beach_access: true, family_friendly: true },
  { slug: 'maya-sanur-resort', name_he: 'מאיה סנור ריזורט וספא', name_en: 'Maya Sanur Resort & Spa', area: 'sanur', star_rating: 5, price_range: 3, rating: 4.7,
    excerpt: 'עיצוב מודרני, בריכת לגונה מרהיבה וספא מפנק — אחד המלונות המעוצבים בסנור.',
    amenities: ['בריכה','ספא','מסעדה','חדר כושר','חוף'], beach_access: true },
  { slug: 'tandjung-sari-sanur', name_he: 'טנג׳ונג סארי', name_en: 'Tandjung Sari Hotel', area: 'sanur', star_rating: 5, price_range: 3, rating: 4.6,
    excerpt: 'מלון-בוטיק אגדי מ-1962 עם בונגלוס בלינזיים אותנטיים על חוף סנור.',
    amenities: ['בריכה','ספא','חוף','מסעדה'], beach_access: true },
  { slug: 'puri-santrian-sanur', name_he: 'פורי סנטריאן', name_en: 'Puri Santrian', area: 'sanur', star_rating: 4, price_range: 2, rating: 4.6,
    excerpt: 'ריזורט משפחתי ותיק עם שלוש בריכות וחוף פרטי — ערך מצוין ברחוב סינדו.',
    amenities: ['בריכה','מסעדה','חוף','ספא'], beach_access: true, family_friendly: true },
  { slug: 'segara-village-sanur', name_he: 'סגארה וילג׳ הוטל', name_en: 'Segara Village Hotel', area: 'sanur', star_rating: 4, price_range: 2, rating: 4.5,
    excerpt: 'מלון כפר בסגנון בלינזי עם בונגלוס, גינות טרופיות ובריכות בין קוקוסים.',
    amenities: ['בריכה','מסעדה','חוף','גינה'], beach_access: true, family_friendly: true },
  { slug: 'artotel-sanur', name_he: 'ארטוטל סנור', name_en: 'Artotel Sanur', area: 'sanur', star_rating: 4, price_range: 2, rating: 4.4,
    excerpt: 'מלון אמנות מודרני עם בריכת גג ועיצוב אומנותי בלב סנור, רחוב Danau Tamblingan.',
    amenities: ['בריכת גג','אמנות','ארוחת בוקר','אינטרנט'] },
  { slug: 'mercure-resort-sanur', name_he: 'מרקיור ריזורט סנור', name_en: 'Mercure Resort Sanur', area: 'sanur', star_rating: 4, price_range: 2, rating: 4.3,
    excerpt: 'ריזורט של רשת Accor במיקום מעולה, בריכה גדולה וגישה ישירה לחוף סנור.',
    amenities: ['בריכה','חוף','מסעדה','חדר כושר'], beach_access: true, family_friendly: true },
  { slug: 'swiss-belresort-sanur', name_he: 'סוויס בל ריזורט סנור', name_en: 'Swiss-Belresort Watu Jimbar Sanur', area: 'sanur', star_rating: 4, price_range: 2, rating: 4.4,
    excerpt: 'ריזורט מודרני, בריכה גדולה ומרחק של 10 דקות הליכה לחוף — מחיר-ערך מעולה.',
    amenities: ['בריכה','מסעדה','חדר כושר','ספא'], family_friendly: true },
  { slug: 'sanur-ayu-hotel', name_he: 'סנור איו הוטל', name_en: 'Sanur Ayu Hotel', area: 'sanur', star_rating: 3, price_range: 2, rating: 4.3,
    excerpt: 'מלון משפחתי תקציבי במרכז סנור עם בריכה קטנה ויציאה לרחוב הראשי.',
    amenities: ['בריכה','ארוחת בוקר','אינטרנט'] },
  { slug: 'the-sanur-beach-suites', name_he: 'דה סנור ביץ׳ סוויטס', name_en: 'Sanur Beach Suites', area: 'sanur', star_rating: 4, price_range: 2, rating: 4.4,
    excerpt: 'סוויטות רחבות עם מטבחון ובריכה במרחק רגלי מחוף המזח והסירות לנוסה פנידה.',
    amenities: ['בריכה','מטבחון','חוף','אינטרנט'] },
  { slug: 'griya-santrian-sanur', name_he: 'גריה סנטריאן', name_en: 'Griya Santrian Resort', area: 'sanur', star_rating: 4, price_range: 2, rating: 4.5,
    excerpt: 'ריזורט חמים ומשפחתי עם בריכה לילדים, בריכת מבוגרים וגישה ישירה לחוף סנור.',
    amenities: ['בריכה','חוף','מסעדה'], beach_access: true, family_friendly: true },

  // ============ NUSA DUA (12) ============
  { slug: 'grand-hyatt-nusa-dua', name_he: 'גרנד היאט באלי', name_en: 'Grand Hyatt Bali', area: 'nusa-dua', star_rating: 5, price_range: 4, rating: 4.7,
    excerpt: 'כפר של ריזורטים אגדיים עם 5 בריכות, לגונה מלאכותית, מסלולי הליכה וחוף פרטי ארוך.',
    amenities: ['בריכה','ספא','חוף','מועדון ילדים','מסעדה'], beach_access: true, family_friendly: true, featured: true },
  { slug: 'ritz-carlton-nusa-dua', name_he: 'ריץ׳ קרלטון באלי', name_en: 'The Ritz-Carlton, Bali', area: 'nusa-dua', star_rating: 5, price_range: 4, rating: 4.8,
    excerpt: 'וילות על צוק בחצי האי בינוא עם נוף מרהיב לאוקיינוס הודי ושירות ריץ׳ קרלטון מלא.',
    amenities: ['בריכה','ספא','חוף','וילה פרטית','מסעדה'], beach_access: true, family_friendly: true },
  { slug: 'sofitel-nusa-dua', name_he: 'סופיטל באלי נוסה דואה', name_en: 'Sofitel Bali Nusa Dua Beach Resort', area: 'nusa-dua', star_rating: 5, price_range: 3, rating: 4.7,
    excerpt: 'ריזורט צרפתי מפואר עם לגונת בריכה בת 10,000 מ״ר — אחד היפים בנוסה דואה.',
    amenities: ['בריכה','ספא','חוף','מסעדה','חדר כושר'], beach_access: true, family_friendly: true },
  { slug: 'westin-nusa-dua', name_he: 'וסטין באלי', name_en: 'The Westin Resort Nusa Dua', area: 'nusa-dua', star_rating: 5, price_range: 3, rating: 4.6,
    excerpt: 'ריזורט משפחתי של מריוט עם 2 בריכות, מועדון ילדים מצוין ומתחם ספא גדול.',
    amenities: ['בריכה','ספא','חוף','מועדון ילדים','חדר כושר'], beach_access: true, family_friendly: true },
  { slug: 'melia-bali-nusa-dua', name_he: 'מליה באלי', name_en: 'Melia Bali', area: 'nusa-dua', star_rating: 5, price_range: 3, rating: 4.5,
    excerpt: 'ריזורט מפואר בגינות טרופיות עם לגונת בריכה ושירות All Inclusive אופציונלי.',
    amenities: ['בריכה','ספא','חוף','מסעדה','מועדון ילדים'], beach_access: true, family_friendly: true },
  { slug: 'novotel-nusa-dua', name_he: 'נובוטל באלי נוסה דואה', name_en: 'Novotel Bali Nusa Dua Hotel & Residences', area: 'nusa-dua', star_rating: 4, price_range: 3, rating: 4.5,
    excerpt: 'סוויטות עם מטבחון במיקום מצוין, מועדון ילדים, בריכה גדולה וקרבה לקניון Bali Collection.',
    amenities: ['בריכה','מטבחון','מועדון ילדים','ספא'], family_friendly: true },
  { slug: 'conrad-bali', name_he: 'קונרד באלי', name_en: 'Conrad Bali', area: 'nusa-dua', star_rating: 5, price_range: 3, rating: 4.6,
    excerpt: 'ריזורט מפואר של הילטון עם בריכת לגונה ענקית וחוף פרטי ארוך ברצועת טאנג׳ונג בנוא.',
    amenities: ['בריכה','ספא','חוף','מסעדה','חדר כושר'], beach_access: true, family_friendly: true },
  { slug: 'hilton-bali-resort', name_he: 'הילטון באלי ריזורט', name_en: 'Hilton Bali Resort', area: 'nusa-dua', star_rating: 5, price_range: 3, rating: 4.7,
    excerpt: 'ריזורט-צוק ייחודי עם מעלית לחוף סוואון פרטי, בריכות רבות ונוף מרהיב.',
    amenities: ['בריכה','ספא','חוף פרטי','מסעדה','מועדון ילדים'], beach_access: true, family_friendly: true },
  { slug: 'inaya-putri-bali', name_he: 'איניה פוטרי באלי', name_en: 'INAYA Putri Bali', area: 'nusa-dua', star_rating: 5, price_range: 3, rating: 4.5,
    excerpt: 'ריזורט עם עיצוב בלינזי מסורתי, גינות נרחבות ובריכה גדולה ישירה לים.',
    amenities: ['בריכה','ספא','חוף','מסעדה'], beach_access: true, family_friendly: true },
  { slug: 'amarterra-villas-nusa-dua', name_he: 'אמרטרה וילות נוסה דואה', name_en: 'Amarterra Villas Bali Nusa Dua', area: 'nusa-dua', star_rating: 5, price_range: 3, rating: 4.6,
    excerpt: 'וילות פרטיות עם בריכה אישית בתוך קומפלקס נוסה דואה — פרטיות מלאה בחמישה כוכבים.',
    amenities: ['בריכה פרטית','ספא','מסעדה'] },
  { slug: 'ayodya-resort-bali', name_he: 'איודיה ריזורט באלי', name_en: 'Ayodya Resort Bali', area: 'nusa-dua', star_rating: 5, price_range: 3, rating: 4.5,
    excerpt: 'ריזורט אדיר בגודל של כפר מלכותי, עם לגונה מלאכותית, חוף פרטי ופעילויות רבות.',
    amenities: ['בריכה','ספא','חוף','מסעדה','מועדון ילדים'], beach_access: true, family_friendly: true },
  { slug: 'courtyard-marriott-nusa-dua', name_he: 'קורטיארד מריוט נוסה דואה', name_en: 'Courtyard Bali Nusa Dua Resort', area: 'nusa-dua', star_rating: 4, price_range: 2, rating: 4.4,
    excerpt: 'מלון מודרני במחיר הגיוני, בריכה יפה, ומרחק הליכה קצרה לחוף ולקניון.',
    amenities: ['בריכה','מסעדה','חדר כושר','ספא'], family_friendly: true },

  // ============ ULUWATU (13) ============
  { slug: 'alila-villas-uluwatu', name_he: 'אלילה וילות אולוואטו', name_en: 'Alila Villas Uluwatu', area: 'uluwatu', star_rating: 5, price_range: 4, rating: 4.8,
    excerpt: 'וילות פרטיות עם בריכה אישית על צוקי אולוואטו — עיצוב מינימליסטי-יוקרתי מדהים.',
    amenities: ['בריכה פרטית','ספא','מסעדה','חדר כושר'], featured: true },
  { slug: 'six-senses-uluwatu', name_he: 'סיקס סנסס אולוואטו', name_en: 'Six Senses Uluwatu, Bali', area: 'uluwatu', star_rating: 5, price_range: 4, rating: 4.8,
    excerpt: 'וילות צוק יוקרתיות של סיקס סנסס עם נוף פנורמי, ספא wellness מעולה והליכות צוק.',
    amenities: ['בריכה פרטית','ספא','wellness','מסעדה'], featured: true },
  { slug: 'raffles-bali', name_he: 'רפלס באלי', name_en: 'Raffles Bali', area: 'uluwatu', star_rating: 5, price_range: 4, rating: 4.9,
    excerpt: 'ריזורט all-villa על מפרץ ג׳ימברן — יוקרה אמיתית של רפלס, בטלרים לכל וילה וספא מפנק.',
    amenities: ['בריכה פרטית','ספא','בטלר','מסעדה'] },
  { slug: 'renaissance-uluwatu', name_he: 'רנסאנס אולוואטו', name_en: 'Renaissance Bali Uluwatu Resort & Spa', area: 'uluwatu', star_rating: 5, price_range: 3, rating: 4.6,
    excerpt: 'ריזורט מרהיב על צוק עם בריכת אינסוף אייקונית ונוף 180° לאוקיינוס ההודי.',
    amenities: ['בריכה אינסוף','ספא','מסעדה','חדר כושר'], family_friendly: true },
  { slug: 'the-edge-uluwatu', name_he: 'דה אדג׳ באלי', name_en: 'The Edge Bali', area: 'uluwatu', star_rating: 5, price_range: 4, rating: 4.7,
    excerpt: 'מתחם וילות על קצה צוק, כולל בריכת זכוכית צפה מפורסמת וגישה פרטית לחוף.',
    amenities: ['בריכה פרטית','ספא','חוף פרטי','מסעדה'] },
  { slug: 'radisson-blu-uluwatu', name_he: 'רדיסון בלו אולוואטו', name_en: 'Radisson Blu Bali Uluwatu', area: 'uluwatu', star_rating: 5, price_range: 3, rating: 4.6,
    excerpt: 'וילות עם בריכה פרטית על צוק אולוואטו — מותג עולמי במחיר נגיש יחסית לאזור.',
    amenities: ['בריכה פרטית','ספא','מסעדה','חדר כושר'], family_friendly: true },
  { slug: 'karma-kandara-uluwatu', name_he: 'קרמה קנדרה', name_en: 'Karma Kandara', area: 'uluwatu', star_rating: 5, price_range: 3, rating: 4.6,
    excerpt: 'וילות פרטיות עם גישה לרכבל לחוף נסתר — אחד החופים היפים ביותר באולוואטו.',
    amenities: ['בריכה פרטית','ספא','חוף פרטי','מסעדה'] },
  { slug: 'suarga-padang-padang', name_he: 'סוארגה פאדנג פאדנג', name_en: 'Suarga Padang Padang', area: 'uluwatu', star_rating: 4, price_range: 3, rating: 4.5,
    excerpt: 'מלון אקולוגי עם בריכה על צוק מעל חוף פאדנג פאדנג ומרחק הליכה לחוף.',
    amenities: ['בריכה','ספא','מסעדה','חוף'], beach_access: true },
  { slug: 'padang-padang-inn', name_he: 'פאדנג פאדנג אין', name_en: 'Padang Padang Inn', area: 'uluwatu', star_rating: 3, price_range: 2, rating: 4.3,
    excerpt: 'מלון גלשנים במיקום מצוין מעל חוף פאדנג פאדנג — פרקטי, פשוט ובמחיר חברתי.',
    amenities: ['בריכה','ארוחת בוקר','אינטרנט'] },
  { slug: 'the-oneeighty-uluwatu', name_he: 'דה 180 אולוואטו', name_en: 'The OneEighty', area: 'uluwatu', star_rating: 4, price_range: 3, rating: 4.6,
    excerpt: 'וילות עם נוף 180° לשקיעה, בר גג עם הבריכת הזכוכית המפורסמת של הצוק.',
    amenities: ['בריכה','בר','מסעדה','חדר כושר'] },
  { slug: 'rock-n-reef-bingin', name_he: 'רוק אנד ריף בינגין', name_en: 'Rock N Reef Bingin', area: 'uluwatu', star_rating: 3, price_range: 2, rating: 4.5,
    excerpt: 'בונגלוס סורף פשוטים ואותנטיים על צוק בינגין — מקום לאנשים שרוצים לחיות את החוף.',
    amenities: ['מסעדה','חוף','אינטרנט'], beach_access: true },
  { slug: 'temple-lodge-bingin', name_he: 'טמפל לודג׳ בינגין', name_en: 'The Temple Lodge', area: 'uluwatu', star_rating: 3, price_range: 2, rating: 4.6,
    excerpt: 'בוטיק יוצא דופן עם עיצוב של אומנות, מעל גולי בינגין וחוף דרימלנד.',
    amenities: ['בריכה','ארוחת בוקר','אמנות'] },
  { slug: 'uluwatu-cottages', name_he: 'אולוואטו קוטאג׳ים', name_en: 'Uluwatu Cottages', area: 'uluwatu', star_rating: 3, price_range: 2, rating: 4.4,
    excerpt: 'קוטאג׳ים חמודים עם בריכה בלב אולוואטו — נהדרים לזוגות שמחפשים שקט ופרטיות.',
    amenities: ['בריכה','ארוחת בוקר','אינטרנט'] },

  // ============ JIMBARAN (13) ============
  { slug: 'four-seasons-jimbaran-bay', name_he: 'פור סיזנס ריזורט ג׳ימברן בי', name_en: 'Four Seasons Resort Bali at Jimbaran Bay', area: 'jimbaran', star_rating: 5, price_range: 4, rating: 4.9,
    excerpt: 'אבן דרך של יוקרה בבאלי — וילות פרטיות עם בריכה על צלע הגבעה ונוף מפרץ מדהים.',
    amenities: ['בריכה פרטית','ספא','חוף','מסעדה','חדר כושר'], beach_access: true, featured: true },
  { slug: 'intercontinental-jimbaran', name_he: 'אינטרקונטיננטל באלי', name_en: 'InterContinental Bali Resort', area: 'jimbaran', star_rating: 5, price_range: 3, rating: 4.7,
    excerpt: 'ריזורט משפחתי אגדי על חוף ג׳ימברן עם 4 בריכות, 14 הקטר של גינות ומועדון ילדים ענק.',
    amenities: ['בריכה','ספא','חוף','מועדון ילדים','מסעדה'], beach_access: true, family_friendly: true, featured: true },
  { slug: 'ayana-villas-jimbaran', name_he: 'איאנה וילות', name_en: 'AYANA Villas Bali', area: 'jimbaran', star_rating: 5, price_range: 4, rating: 4.8,
    excerpt: 'וילות חמישה כוכבים בפלוס עם בריכה פרטית, בתוך מתחם AYANA עם גישה ל-Rock Bar המפורסם.',
    amenities: ['בריכה פרטית','ספא','חוף','מסעדה'] },
  { slug: 'rimba-jimbaran', name_he: 'רימבה ג׳ימברן', name_en: 'RIMBA Jimbaran Bali by AYANA', area: 'jimbaran', star_rating: 5, price_range: 3, rating: 4.6,
    excerpt: 'מלון אחות של AYANA עם 3 בריכות אינסוף על צוק, גישה לחוף AYANA וספא אקווה.',
    amenities: ['בריכה','ספא','חוף','מסעדה'], beach_access: true, family_friendly: true },
  { slug: 'keraton-jimbaran', name_he: 'קראטון ג׳ימברן ריזורט', name_en: 'Keraton Jimbaran Beach Resort', area: 'jimbaran', star_rating: 4, price_range: 3, rating: 4.5,
    excerpt: 'ריזורט בסגנון ארמון מלכותי על חוף ג׳ימברן עם 3 בריכות וגישה ישירה לדייגים.',
    amenities: ['בריכה','ספא','חוף','מסעדה'], beach_access: true, family_friendly: true },
  { slug: 'belmond-jimbaran-puri', name_he: 'ג׳ימברן פורי באלי', name_en: 'Jimbaran Puri, A Belmond Hotel', area: 'jimbaran', star_rating: 5, price_range: 4, rating: 4.8,
    excerpt: 'בונגלוס פרטיים על חוף ג׳ימברן עם אווירה אינטימית, ספא ומסעדת חוף יוקרתית.',
    amenities: ['בריכה','ספא','חוף','מסעדה'], beach_access: true },
  { slug: 'mövenpick-jimbaran', name_he: 'מובנפיק ריזורט ג׳ימברן', name_en: 'Movenpick Resort & Spa Jimbaran', area: 'jimbaran', star_rating: 5, price_range: 3, rating: 4.5,
    excerpt: 'ריזורט משפחתי עם לגונת בריכה ענקית, מחלקת ילדים מעולה וגלידת מובנפיק חינם יומית.',
    amenities: ['בריכה','ספא','מועדון ילדים','מסעדה'], family_friendly: true },
  { slug: 'jimbaran-bay-beach-resort', name_he: 'ג׳ימברן בי ביץ׳ ריזורט', name_en: 'Jimbaran Bay Beach Resort & Spa', area: 'jimbaran', star_rating: 4, price_range: 2, rating: 4.3,
    excerpt: 'מלון משפחתי במחיר הוגן, בריכה גדולה ומרחק של 5 דקות הליכה לחוף הדגים של ג׳ימברן.',
    amenities: ['בריכה','ספא','מסעדה','חדר כושר'], family_friendly: true },
  { slug: 'jimbaran-cliff-villas', name_he: 'ג׳ימברן קליף וילות', name_en: 'Jimbaran Cliff Villas', area: 'jimbaran', star_rating: 4, price_range: 3, rating: 4.5,
    excerpt: 'וילות קטנות עם בריכה פרטית מעל מפרץ ג׳ימברן — רומנטי, שקט, עם נוף נדיר.',
    amenities: ['בריכה פרטית','מסעדה','ארוחת בוקר'] },
  { slug: 'the-kayana-beach-villas', name_he: 'דה קאיאנה ג׳ימברן וילות', name_en: 'The Kayana Beach Villas Jimbaran', area: 'jimbaran', star_rating: 4, price_range: 3, rating: 4.4,
    excerpt: 'וילות פרטיות אלגנטיות במרחק הליכה מחוף מואיה — בוטיק שקט.',
    amenities: ['בריכה פרטית','ספא','ארוחת בוקר'] },
  { slug: 'sthala-jimbaran', name_he: 'סטלה באלי ריזורט', name_en: 'Sthala, A Tribute Portfolio Hotel Ubud Bali', area: 'jimbaran', star_rating: 5, price_range: 3, rating: 4.6,
    excerpt: 'מלון בסגנון בלינזי מסורתי עם בריכה גדולה ומרחק של 8 דקות נסיעה לחוף.',
    amenities: ['בריכה','ספא','מסעדה'], family_friendly: true },
  { slug: 'jimbaran-puri-pool-villas', name_he: 'ג׳ימברן פורי בריכה וילות', name_en: 'Jimbaran Puri Pool Villas', area: 'jimbaran', star_rating: 4, price_range: 3, rating: 4.5,
    excerpt: 'וילות עם בריכה פרטית באחד הרחובות השקטים של ג׳ימברן — כולל ארוחת בוקר יומית.',
    amenities: ['בריכה פרטית','ארוחת בוקר','מסעדה'] },
  { slug: 'taman-wana-jimbaran', name_he: 'טאמאן וואנה ג׳ימברן', name_en: 'Taman Wana Jimbaran Hotel', area: 'jimbaran', star_rating: 3, price_range: 2, rating: 4.3,
    excerpt: 'מלון פשוט ותקציבי עם בריכה, 10 דקות הליכה לחוף ג׳ימברן — טוב ליחידים וזוגות צעירים.',
    amenities: ['בריכה','ארוחת בוקר','אינטרנט'] },
]

const rows = HOTELS.map((h, i) => row(h, i))

// Pre-flight: check for existing slugs to avoid conflicts
const { data: existing } = await supabase
  .from('hotels')
  .select('slug')
  .eq('destination_id', 'bali')
const existingSlugs = new Set((existing || []).map(r => r.slug))
const collisions = rows.filter(r => existingSlugs.has(r.slug))
if (collisions.length > 0) {
  console.error('Slug collisions (will upsert and overwrite):')
  collisions.forEach(r => console.error(' -', r.slug))
}

console.log(`Upserting ${rows.length} hotels...`)
const { data, error } = await supabase
  .from('hotels')
  .upsert(rows, { onConflict: 'destination_id,slug' })
  .select('slug, area')

if (error) {
  console.error('ERROR:', error)
  process.exit(1)
}

console.log(`Upserted ${data.length} rows.`)

// Print count per area (including pre-existing)
const { data: all } = await supabase
  .from('hotels')
  .select('area')
  .eq('destination_id', 'bali')
  .eq('published', true)
const counts = {}
for (const h of (all || [])) {
  const a = (h.area || 'unknown').toLowerCase()
  counts[a] = (counts[a] || 0) + 1
}
console.log('\nFinal hotel count per area:')
Object.entries(counts).sort().forEach(([k, v]) => console.log(`  ${k}: ${v}`))
