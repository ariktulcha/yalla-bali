import { test, expect } from '@playwright/test'

test.describe('Navigation - Desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('header is visible and sticky', async ({ page }) => {
    await page.goto('/')
    const header = page.locator('header')
    await expect(header).toBeVisible()
    const classes = await header.getAttribute('class')
    expect(classes).toContain('sticky')
  })

  test('logo links to homepage', async ({ page }) => {
    await page.goto('/hotels')
    const logo = page.locator('header a[href="/"]').first()
    await expect(logo).toBeVisible()
    await expect(logo).toContainText('יאללה')
    await expect(logo).toContainText('באלי')
  })

  test('desktop nav links are visible', async ({ page }) => {
    await page.goto('/')
    const desktopNav = page.locator('header .hidden.md\\:flex')
    await expect(desktopNav).toBeVisible()

    const expectedLinks = ['ויזה לבאלי', 'אטרקציות', 'אזורים', 'מלונות', 'מסעדות', 'מדריכים', 'תכנון טיול']
    for (const text of expectedLinks) {
      await expect(desktopNav.locator(`a:has-text("${text}")`)).toBeVisible()
    }
  })

  test('footer has all section links', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    const footerLinks = ['/visa', '/hotels', '/restaurants', '/attractions', '/nightlife', '/beaches', '/shopping', '/weather', '/faq', '/about', '/contact', '/plan', '/guides', '/areas']
    for (const href of footerLinks) {
      const link = footer.locator(`a[href="${href}"]`).first()
      await expect(link).toBeVisible()
    }
  })

  test('footer has social media links', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer.locator('a[href*="instagram.com"]')).toBeVisible()
    await expect(footer.locator('a[href*="facebook.com"]')).toBeVisible()
    await expect(footer.locator('a[href*="tiktok.com"]')).toBeVisible()
  })

  test('nav links navigate correctly', async ({ page }) => {
    await page.goto('/')
    await page.click('header a[href="/hotels"]')
    await expect(page).toHaveURL(/\/hotels/)
    const h1 = page.locator('h1')
    await expect(h1).toContainText('מלונות')
  })

  test('all internal links return 200', async ({ page }) => {
    await page.goto('/')
    const links = await page.locator('a[href^="/"]').all()
    const hrefs = new Set<string>()
    for (const link of links) {
      const href = await link.getAttribute('href')
      if (href) hrefs.add(href)
    }

    for (const href of hrefs) {
      const response = await page.goto(href)
      expect(response?.status(), `${href} returned ${response?.status()}`).toBeLessThan(400)
    }
  })
})

test.describe('Navigation - Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true })

  test('hamburger menu is visible on mobile', async ({ page }) => {
    await page.goto('/')
    const hamburger = page.locator('#mobile-menu-btn')
    await expect(hamburger).toBeVisible()
  })

  test('mobile menu opens on hamburger click', async ({ page }) => {
    await page.goto('/')
    const menu = page.locator('#mobile-menu')
    await expect(menu).toBeHidden()

    await page.click('#mobile-menu-btn')
    await expect(menu).toBeVisible()
  })

  test('mobile menu has all nav links', async ({ page }) => {
    await page.goto('/')
    await page.click('#mobile-menu-btn')
    const menu = page.locator('#mobile-menu')

    const expectedLinks = ['/visa', '/plan', '/guides', '/areas', '/attractions', '/hotels', '/restaurants', '/nightlife']
    for (const href of expectedLinks) {
      await expect(menu.locator(`a[href="${href}"]`)).toBeVisible()
    }
  })

  test('mobile menu closes on second click', async ({ page }) => {
    await page.goto('/')
    const menu = page.locator('#mobile-menu')
    await page.click('#mobile-menu-btn')
    await expect(menu).toBeVisible()
    await page.click('#mobile-menu-btn')
    await expect(menu).toBeHidden()
  })

  test('desktop nav is hidden on mobile', async ({ page }) => {
    await page.goto('/')
    const desktopNav = page.locator('header .hidden.md\\:flex')
    await expect(desktopNav).toBeHidden()
  })
})
