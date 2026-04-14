import { test, expect } from '@playwright/test'

test.describe('SEO - Meta Tags', () => {
  const pages = [
    { path: '/', titleContains: 'באלי' },
    { path: '/hotels', titleContains: 'מלונות' },
    { path: '/restaurants', titleContains: 'מסעדות' },
    { path: '/attractions', titleContains: 'אטרקציות' },
    { path: '/nightlife', titleContains: 'לילה' },
    { path: '/guides', titleContains: 'מדריכים' },
    { path: '/areas', titleContains: 'אזורים' },
    { path: '/visa', titleContains: 'ויזה' },
    { path: '/faq', titleContains: 'שאלות' },
    { path: '/plan', titleContains: 'תכנן' },
    { path: '/beaches', titleContains: 'חופים' },
    { path: '/weather', titleContains: 'מזג' },
  ]

  for (const p of pages) {
    test(`${p.path} has correct title containing "${p.titleContains}"`, async ({ page }) => {
      await page.goto(p.path)
      const title = await page.title()
      expect(title).toContain(p.titleContains)
      expect(title.length).toBeGreaterThan(10)
    })
  }

  test('homepage has meta description', async ({ page }) => {
    await page.goto('/')
    const desc = page.locator('meta[name="description"]')
    await expect(desc).toHaveCount(1)
    const content = await desc.getAttribute('content')
    expect(content!.length).toBeGreaterThan(50)
    expect(content!.length).toBeLessThan(200)
  })

  test('all main pages have meta description', async ({ page }) => {
    const paths = ['/', '/hotels', '/restaurants', '/attractions', '/nightlife', '/guides', '/areas', '/visa']
    for (const p of paths) {
      await page.goto(p)
      const desc = page.locator('meta[name="description"]')
      await expect(desc).toHaveCount(1)
      const content = await desc.getAttribute('content')
      expect(content!.length).toBeGreaterThan(20)
    }
  })

  test('canonical URL is present on all pages', async ({ page }) => {
    const paths = ['/', '/hotels', '/restaurants', '/attractions', '/visa']
    for (const p of paths) {
      await page.goto(p)
      const canonical = page.locator('link[rel="canonical"]')
      await expect(canonical).toHaveCount(1)
      const href = await canonical.getAttribute('href')
      expect(href).toContain('ibalibali.com')
    }
  })
})

test.describe('SEO - Open Graph', () => {
  test('homepage has all OG tags', async ({ page }) => {
    await page.goto('/')
    const ogTitle = page.locator('meta[property="og:title"]')
    const ogDesc = page.locator('meta[property="og:description"]')
    const ogUrl = page.locator('meta[property="og:url"]')
    const ogImage = page.locator('meta[property="og:image"]')
    const ogType = page.locator('meta[property="og:type"]')
    const ogLocale = page.locator('meta[property="og:locale"]')

    await expect(ogTitle).toHaveCount(1)
    await expect(ogDesc).toHaveCount(1)
    await expect(ogUrl).toHaveCount(1)
    await expect(ogImage).toHaveCount(1)
    await expect(ogType).toHaveCount(1)
    await expect(ogLocale).toHaveCount(1)

    expect(await ogLocale.getAttribute('content')).toBe('he_IL')
    expect(await ogImage.getAttribute('content')).toContain('http')
  })

  test('OG image is absolute URL on all pages', async ({ page }) => {
    const paths = ['/', '/hotels', '/restaurants', '/attractions']
    for (const p of paths) {
      await page.goto(p)
      const ogImage = page.locator('meta[property="og:image"]')
      const content = await ogImage.getAttribute('content')
      expect(content).toMatch(/^https?:\/\//)
    }
  })

  test('Twitter card meta tags present', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1)
    await expect(page.locator('meta[name="twitter:title"]')).toHaveCount(1)
    await expect(page.locator('meta[name="twitter:description"]')).toHaveCount(1)
    await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(1)
  })
})

test.describe('SEO - JSON-LD Schema', () => {
  test('homepage has WebSite and Organization schemas', async ({ page }) => {
    await page.goto('/')
    const scripts = await page.locator('script[type="application/ld+json"]').all()
    expect(scripts.length).toBeGreaterThanOrEqual(2)

    const schemas: any[] = []
    for (const s of scripts) {
      const text = await s.textContent()
      if (text) schemas.push(JSON.parse(text))
    }

    const types = schemas.map(s => s['@type'])
    expect(types).toContain('WebSite')
    expect(types).toContain('Organization')
  })

  test('list pages have ItemList schema', async ({ page }) => {
    const listPages = ['/hotels', '/restaurants', '/attractions', '/nightlife', '/guides', '/areas']
    for (const p of listPages) {
      await page.goto(p)
      const scripts = await page.locator('script[type="application/ld+json"]').all()
      const schemas: any[] = []
      for (const s of scripts) {
        const text = await s.textContent()
        if (text) schemas.push(JSON.parse(text))
      }
      const types = schemas.map(s => s['@type'])
      expect(types).toContain('ItemList')
    }
  })

  test('all pages have BreadcrumbList schema', async ({ page }) => {
    const paths = ['/hotels', '/restaurants', '/attractions', '/nightlife', '/guides']
    for (const p of paths) {
      await page.goto(p)
      const scripts = await page.locator('script[type="application/ld+json"]').all()
      const schemas: any[] = []
      for (const s of scripts) {
        const text = await s.textContent()
        if (text) schemas.push(JSON.parse(text))
      }
      const types = schemas.map(s => s['@type'])
      expect(types).toContain('BreadcrumbList')
    }
  })

  test('hreflang tags present', async ({ page }) => {
    await page.goto('/')
    const heHreflang = page.locator('link[hreflang="he"]')
    const heILHreflang = page.locator('link[hreflang="he-IL"]')
    const defaultHreflang = page.locator('link[hreflang="x-default"]')
    await expect(heHreflang).toHaveCount(1)
    await expect(heILHreflang).toHaveCount(1)
    await expect(defaultHreflang).toHaveCount(1)
  })
})
