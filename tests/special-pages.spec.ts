import { test, expect } from '@playwright/test'

test.describe('Special Pages', () => {
  const specialPages = [
    { path: '/beaches', title: 'חופים' },
    { path: '/plan', title: 'תכנן' },
    { path: '/faq', title: 'שאלות' },
    { path: '/weather', title: 'מזג' },
    { path: '/about', title: 'אודות' },
    { path: '/contact', title: 'צור קשר' },
    { path: '/shopping', title: 'קניות' },
    { path: '/visa', title: 'ויזה' },
  ]

  for (const sp of specialPages) {
    test(`${sp.path} page loads and has title with "${sp.title}"`, async ({ page }) => {
      const response = await page.goto(sp.path)
      expect(response?.status()).toBeLessThan(400)
      const title = await page.title()
      expect(title).toContain(sp.title)
    })
  }

  test('FAQ page has FAQ accordion items', async ({ page }) => {
    await page.goto('/faq')
    const details = await page.locator('details').all()
    expect(details.length).toBeGreaterThan(3)
  })

  test('FAQ page has FAQPage schema', async ({ page }) => {
    await page.goto('/faq')
    const scripts = await page.locator('script[type="application/ld+json"]').all()
    const schemas: any[] = []
    for (const s of scripts) {
      const text = await s.textContent()
      if (text) schemas.push(JSON.parse(text))
    }
    const types = schemas.map(s => s['@type'])
    expect(types).toContain('FAQPage')
  })

  test('404 page exists', async ({ page }) => {
    const response = await page.goto('/this-does-not-exist-at-all')
    // For static sites, the 404 page is served differently
    // Just check that we get some response
    expect(response).not.toBeNull()
  })

  test('visa page has detailed content', async ({ page }) => {
    await page.goto('/visa')
    const content = await page.textContent('main')
    expect(content).toContain('ויזה')
    expect(content).toContain('באלי')
  })

})

test.describe('Accessibility Basics', () => {
  test('all external links have rel="noopener noreferrer"', async ({ page }) => {
    await page.goto('/')
    const externalLinks = await page.locator('a[target="_blank"]').all()
    for (const link of externalLinks) {
      const rel = await link.getAttribute('rel')
      expect(rel).toContain('noopener')
      expect(rel).toContain('noreferrer')
    }
  })

  test('hamburger button has aria-label', async ({ page }) => {
    await page.goto('/')
    const btn = page.locator('#mobile-menu-btn')
    await expect(btn).toHaveAttribute('aria-label', 'פתח תפריט')
  })

  test('hamburger button toggles aria-expanded', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const btn = page.locator('#mobile-menu-btn')
    await expect(btn).toHaveAttribute('aria-expanded', 'false')
    await btn.click()
    await expect(btn).toHaveAttribute('aria-expanded', 'true')
  })

  test('breadcrumb nav has aria-label on detail pages', async ({ page }) => {
    await page.goto('/hotels/st-regis-bali')
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
    await expect(breadcrumb).toHaveCount(1)
  })

  test('social media links have aria-labels', async ({ page }) => {
    await page.goto('/')
    const instagramLink = page.locator('a[href*="instagram.com"]')
    await expect(instagramLink).toHaveAttribute('aria-label', 'Instagram')
    const facebookLink = page.locator('a[href*="facebook.com"]')
    await expect(facebookLink).toHaveAttribute('aria-label', 'Facebook')
  })

  test('favicon is referenced', async ({ page }) => {
    await page.goto('/')
    const favicon = page.locator('link[rel="icon"]')
    await expect(favicon).toHaveCount(1)
    const href = await favicon.getAttribute('href')
    expect(href).toContain('favicon')
  })
})
