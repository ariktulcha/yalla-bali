import { test, expect } from '@playwright/test'

test.describe('Entity Pages - Hotels', () => {
  test('hotel list page renders hotel cards', async ({ page }) => {
    await page.goto('/hotels')
    await page.waitForLoadState('networkidle')
    // Should have multiple hotel cards with links
    const hotelLinks = await page.locator('a[href^="/hotels/"]').all()
    expect(hotelLinks.length).toBeGreaterThan(3)
  })

  test('hotel detail page has correct structure', async ({ page }) => {
    // Pick a known hotel slug from the build output
    await page.goto('/hotels/st-regis-bali')

    // H1 with hotel name
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
    const h1Text = await h1.textContent()
    expect(h1Text!.length).toBeGreaterThan(3)

    // Schema.org Hotel type
    const scripts = await page.locator('script[type="application/ld+json"]').all()
    const schemas: any[] = []
    for (const s of scripts) {
      const text = await s.textContent()
      if (text) schemas.push(JSON.parse(text))
    }
    const types = schemas.map(s => s['@type'])
    expect(types.some(t => t === 'Hotel' || t === 'LodgingBusiness')).toBeTruthy()

    // Breadcrumb
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible()
  })

  test('hotel category pages exist and render', async ({ page }) => {
    const categories = ['/hotels/5-stars', '/hotels/beach', '/hotels/family', '/hotels/luxury']
    for (const cat of categories) {
      const response = await page.goto(cat)
      expect(response?.status()).toBeLessThan(400)
      const h1 = page.locator('h1')
      await expect(h1).toHaveCount(1)
    }
  })
})

test.describe('Entity Pages - Restaurants', () => {
  test('restaurant list page renders cards', async ({ page }) => {
    await page.goto('/restaurants')
    const links = await page.locator('a[href^="/restaurants/"]').all()
    expect(links.length).toBeGreaterThan(3)
  })

  test('restaurant category pages exist', async ({ page }) => {
    const categories = ['/restaurants/kosher', '/restaurants/fine-dining', '/restaurants/japanese', '/restaurants/meat']
    for (const cat of categories) {
      const response = await page.goto(cat)
      expect(response?.status()).toBeLessThan(400)
    }
  })
})

test.describe('Entity Pages - Attractions', () => {
  test('attraction list page renders cards', async ({ page }) => {
    await page.goto('/attractions')
    const links = await page.locator('a[href^="/attractions/"]').all()
    expect(links.length).toBeGreaterThan(3)
  })

  test('attraction detail page has schema', async ({ page }) => {
    await page.goto('/attractions/tanah-lot')
    const scripts = await page.locator('script[type="application/ld+json"]').all()
    const schemas: any[] = []
    for (const s of scripts) {
      const text = await s.textContent()
      if (text) schemas.push(JSON.parse(text))
    }
    const types = schemas.map(s => s['@type'])
    expect(types.some(t => t === 'TouristAttraction' || t === 'Place')).toBeTruthy()
  })

  test('attraction category pages exist', async ({ page }) => {
    const categories = ['/attractions/free', '/attractions/kids']
    for (const cat of categories) {
      const response = await page.goto(cat)
      expect(response?.status()).toBeLessThan(400)
    }
  })
})

test.describe('Entity Pages - Nightlife', () => {
  test('nightlife list page renders cards', async ({ page }) => {
    await page.goto('/nightlife')
    const links = await page.locator('a[href^="/nightlife/"]').all()
    expect(links.length).toBeGreaterThan(3)
  })

  test('nightlife category pages exist', async ({ page }) => {
    const categories = ['/nightlife/bars', '/nightlife/beach-clubs', '/nightlife/clubs', '/nightlife/rooftop']
    for (const cat of categories) {
      const response = await page.goto(cat)
      expect(response?.status()).toBeLessThan(400)
    }
  })
})

test.describe('Entity Pages - Guides', () => {
  test('guides list page renders cards', async ({ page }) => {
    await page.goto('/guides')
    const links = await page.locator('a[href^="/guides/"]').all()
    expect(links.length).toBeGreaterThan(3)
  })

  test('guide detail page has Article schema', async ({ page }) => {
    await page.goto('/guides/visa-bali-israelis')
    const scripts = await page.locator('script[type="application/ld+json"]').all()
    const schemas: any[] = []
    for (const s of scripts) {
      const text = await s.textContent()
      if (text) schemas.push(JSON.parse(text))
    }
    const types = schemas.map(s => s['@type'])
    expect(types.some(t => t === 'Article' || t === 'BlogPosting')).toBeTruthy()
  })
})

test.describe('Entity Pages - Areas', () => {
  test('areas list page renders cards', async ({ page }) => {
    await page.goto('/areas')
    const links = await page.locator('a[href^="/areas/"]').all()
    expect(links.length).toBeGreaterThan(3)
  })

  test('area detail page loads correctly', async ({ page }) => {
    await page.goto('/areas/ubud')
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
    const h1Text = await h1.textContent()
    expect(h1Text!.length).toBeGreaterThan(2)
  })
})

test.describe('Entity Pages - Tours', () => {
  test('tours list page loads', async ({ page }) => {
    const response = await page.goto('/tours')
    expect(response?.status()).toBeLessThan(400)
  })
})
