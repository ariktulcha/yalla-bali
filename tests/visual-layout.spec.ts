import { test, expect } from '@playwright/test'

test.describe('Visual & Layout - RTL Alignment', () => {
  test('text is right-aligned (RTL)', async ({ page }) => {
    await page.goto('/')
    const direction = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).direction
    })
    expect(direction).toBe('rtl')
  })

  test('RTL direction applies to all pages', async ({ page }) => {
    const pages = ['/hotels', '/restaurants', '/attractions', '/guides', '/visa', '/plan']
    for (const p of pages) {
      await page.goto(p)
      const direction = await page.evaluate(() => {
        return window.getComputedStyle(document.documentElement).direction
      })
      expect(direction).toBe('rtl')
    }
  })

  test('body text color is white', async ({ page }) => {
    await page.goto('/')
    const color = await page.evaluate(() => {
      return window.getComputedStyle(document.body).color
    })
    // white = rgb(255, 255, 255)
    expect(color).toContain('255')
  })

  test('body background is dark (#0D0D0D)', async ({ page }) => {
    await page.goto('/')
    const bg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    // #0D0D0D = rgb(13, 13, 13)
    expect(bg).toContain('13')
  })
})

test.describe('Visual & Layout - Responsive', () => {
  test('homepage renders without horizontal scroll on desktop', async ({ page }) => {
    page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    const hasHScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(hasHScroll).toBe(false)
  })

  test('homepage renders without horizontal scroll on mobile', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const hasHScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(hasHScroll).toBe(false)
  })

  test('list pages render without horizontal scroll on mobile', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 812 })
    const pages = ['/hotels', '/restaurants', '/attractions', '/nightlife']
    for (const p of pages) {
      await page.goto(p)
      const hasHScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(hasHScroll).toBe(false)
    }
  })

  test('images have alt attributes', async ({ page }) => {
    await page.goto('/')
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      expect(alt).not.toBeNull()
      expect(alt!.length).toBeGreaterThan(0)
    }
  })

  test('no broken external images on homepage', async ({ page }) => {
    await page.goto('/')
    const images = await page.locator('img').all()
    for (const img of images) {
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      const src = await img.getAttribute('src')
      // Only check external images (local asset images may not exist in dev)
      if (src && src.startsWith('http')) {
        expect(naturalWidth, `Image ${src} is broken`).toBeGreaterThan(0)
      }
    }
  })
})

test.describe('Visual & Layout - Dark Theme', () => {
  test('cards have dark background', async ({ page }) => {
    await page.goto('/hotels')
    // Wait for content to load
    await page.waitForLoadState('networkidle')
    const cards = await page.locator('[class*="bg-[#1A1208]"], [class*="bg-[#0A1A18]"]').all()
    // We expect list pages to have card-like elements
    expect(cards.length).toBeGreaterThan(0)
  })

  test('teal accent colors are used', async ({ page }) => {
    await page.goto('/')
    // Check that teal classes exist in the page
    const html = await page.content()
    expect(html).toContain('teal-500')
    expect(html).toContain('teal-400')
  })

  test('footer has dark background and border', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    const classes = await footer.getAttribute('class')
    expect(classes).toContain('bg-[#0D0D0D]')
    expect(classes).toContain('border-t')
  })
})
