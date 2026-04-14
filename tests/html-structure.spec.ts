import { test, expect } from '@playwright/test'

test.describe('HTML Structure & RTL', () => {
  test('homepage has lang="he" and dir="rtl"', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang', 'he')
    await expect(html).toHaveAttribute('dir', 'rtl')
  })

  test('all main pages have RTL direction', async ({ page }) => {
    const pages = [
      '/hotels',
      '/restaurants',
      '/attractions',
      '/nightlife',
      '/guides',
      '/areas',
      '/tours',
      '/visa',
      '/plan',
      '/faq',
      '/about',
      '/contact',
      '/beaches',
      '/weather',
      '/shopping',
    ]
    for (const p of pages) {
      await page.goto(p)
      const html = page.locator('html')
      await expect(html).toHaveAttribute('dir', 'rtl', { message: `Page ${p} missing dir="rtl"` })
      await expect(html).toHaveAttribute('lang', 'he', { message: `Page ${p} missing lang="he"` })
    }
  })

  test('homepage has correct DOCTYPE', async ({ page }) => {
    await page.goto('/')
    const doctype = await page.evaluate(() => {
      const dt = document.doctype
      return dt ? dt.name : null
    })
    expect(doctype).toBe('html')
  })

  test('meta charset is utf-8', async ({ page }) => {
    await page.goto('/')
    const charset = page.locator('meta[charset]')
    await expect(charset).toHaveAttribute('charset', 'utf-8')
  })

  test('viewport meta tag is present', async ({ page }) => {
    await page.goto('/')
    const viewport = page.locator('meta[name="viewport"]')
    await expect(viewport).toHaveCount(1)
    const content = await viewport.getAttribute('content')
    expect(content).toContain('width=device-width')
  })

  test('body has dark background class', async ({ page }) => {
    await page.goto('/')
    const body = page.locator('body')
    const classes = await body.getAttribute('class')
    expect(classes).toContain('bg-[#0D0D0D]')
  })

  test('heading hierarchy is correct on homepage', async ({ page }) => {
    await page.goto('/')
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
    const h1Text = await page.locator('h1').textContent()
    expect(h1Text).toContain('באלי')
  })

  test('no duplicate H1 tags on list pages', async ({ page }) => {
    const listPages = ['/hotels', '/restaurants', '/attractions', '/nightlife', '/guides', '/areas']
    for (const p of listPages) {
      await page.goto(p)
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBeLessThanOrEqual(1)
    }
  })
})
