import { test, expect } from '@playwright/test'

for (const theme of ['light', 'dark'] as const) {
  test(`${theme}：手机导航单行横向滚动，直达和前进后退保持选中工具可见`, async ({
    page,
    browserName,
  }) => {
    await page.addInitScript((value) => localStorage.setItem('dev-tools-theme', value), theme)
    const navigation = page.getByRole('navigation', { name: '工具导航' })
    const first = navigation.locator('a[href="#/url"]')
    const last = navigation.locator('a[href="#/json"]')
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 })
      await page.goto('./#/url')
      await expect(first).toHaveAttribute('aria-current', 'page')
      const layout = await navigation.evaluate((element) => {
        const links = Array.from(element.querySelectorAll('a'))
        const bounds = links.map((link) => link.getBoundingClientRect())
        return {
          direction: getComputedStyle(element).flexDirection,
          overflow: getComputedStyle(element).overflowX,
          overscroll: getComputedStyle(element).overscrollBehaviorX,
          hasOverflow: element.scrollWidth > element.clientWidth,
          heights: bounds.map((rect) => rect.height),
          tops: bounds.map((rect) => rect.top),
          wraps: links.map((link) => getComputedStyle(link).whiteSpace),
          pageHasOverflow: document.documentElement.scrollWidth > innerWidth,
        }
      })
      expect(layout.direction).toBe('row')
      expect(layout.overflow).toBe('auto')
      expect(layout.overscroll).toBe('none')
      expect(layout.hasOverflow).toBe(true)
      expect(layout.pageHasOverflow).toBe(false)
      expect(new Set(layout.tops).size).toBe(1)
      expect(layout.heights).toHaveLength(6)
      expect(layout.heights.every((height) => height >= 44)).toBe(true)
      expect(layout.wraps).toEqual(Array.from({ length: 6 }, () => 'nowrap'))

      await navigation.evaluate((element) => {
        element.scrollLeft = element.scrollWidth
      })
      await expect
        .poll(() => navigation.evaluate((element) => element.scrollLeft))
        .toBeGreaterThan(0)
      expect(await page.evaluate(() => ({ x: scrollX, y: scrollY }))).toEqual({ x: 0, y: 0 })
      await expect(last).toBeInViewport({ ratio: 1 })
      await last.click()
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('JSON 格式化')
      await expect(last).toHaveAttribute('aria-current', 'page')
      await page.goBack()
      await expect(first).toHaveAttribute('aria-current', 'page')
      await expect(first).toBeInViewport({ ratio: 1 })
      await page.goForward()
      await expect(last).toHaveAttribute('aria-current', 'page')
      await expect(last).toBeInViewport({ ratio: 1 })
      await page.reload()
      await expect(last).toHaveAttribute('aria-current', 'page')
      await expect(last).toBeInViewport({ ratio: 1 })
      expect(await page.evaluate(() => ({ x: scrollX, y: scrollY }))).toEqual({ x: 0, y: 0 })
    }

    await first.focus()
    await expect(first).toBeInViewport({ ratio: 1 })
    const links = navigation.getByRole('link')
    for (let index = 1; index < 6; index++) {
      // WebKit 的系统键盘设置默认跳过链接，Option+Tab 才会遍历所有可聚焦项。
      await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab')
      await expect(links.nth(index)).toBeFocused()
      await expect(links.nth(index)).toBeInViewport({ ratio: 1 })
    }
    await page.keyboard.press('Enter')
    await expect(last).toHaveAttribute('aria-current', 'page')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('桌面仍是完整纵向侧栏，手机断点以下才改为横向导航', async ({ page }) => {
  await page.goto('./#/url')
  const navigation = page.getByRole('navigation', { name: '工具导航' })
  for (const width of [767, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(navigation).toHaveCSS('flex-direction', width < 768 ? 'row' : 'column')
    const layout = await navigation.evaluate((element) => ({
      pageHasOverflow: document.documentElement.scrollWidth > innerWidth,
      navigationHasOverflow: element.scrollWidth > element.clientWidth,
      lefts: Array.from(element.querySelectorAll('a'), (link) => link.getBoundingClientRect().left),
    }))
    expect(layout.pageHasOverflow).toBe(false)
    if (width >= 768) {
      expect(layout.navigationHasOverflow).toBe(false)
      expect(new Set(layout.lefts).size).toBe(1)
    }
  }
})
