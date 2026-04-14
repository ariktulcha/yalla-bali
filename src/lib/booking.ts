const AFFILIATE_ID =
  import.meta.env.BOOKING_AFFILIATE_ID ?? process.env.BOOKING_AFFILIATE_ID ?? ''

export function withBookingAffiliate(url: string): string {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('booking.com')) return url
    if (AFFILIATE_ID) u.searchParams.set('aid', AFFILIATE_ID)
    return u.toString()
  } catch {
    return url
  }
}

export function buildBookingSearchUrl(hotelName: string): string {
  const u = new URL('https://www.booking.com/searchresults.html')
  u.searchParams.set('ss', `${hotelName} Bali`)
  u.searchParams.set('lang', 'he')
  if (AFFILIATE_ID) u.searchParams.set('aid', AFFILIATE_ID)
  return u.toString()
}
