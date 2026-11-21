import { test, expect, type Page } from '@playwright/test'

const tools = ['url', 'base64', 'hash', 'timestamp', 'qrcode', 'json'] as const

async function openTool(page: Page, id: string) {
  await page.goto(`./#/${id}`)
  await expect(page.locator('main input, main textarea').first()).toBeVisible()
}

for (const viewport of [
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
]) {
  for (const theme of ['light', 'dark'] as const) {
    test(`${viewport.width}×${viewport.height} ${theme}：六工具初始内容完整一屏展示`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport)
      await page.addInitScript((value) => localStorage.setItem('dev-tools-theme', value), theme)
      await openTool(page, 'url')
      let editorTop: number | undefined
      for (const id of tools) {
        await page.getByRole('navigation').locator(`a[href="#/${id}"]`).click()
        await expect(page.locator(`a[href="#/${id}"]`)).toHaveAttribute('aria-current', 'page')
        const bounds = await page.evaluate(() => {
          const controls = Array.from(
            document.querySelectorAll<HTMLElement>(
              'main input, main textarea, main button, main [data-slot="qr-preview"], main dl',
            ),
          )
          const root = document.documentElement
          const footer = document.querySelector('footer')?.getBoundingClientRect()
          const workspace = document.querySelector<HTMLElement>('main > section')!
          const heading = document.querySelector('h1')!.getBoundingClientRect()
          const card = document.querySelector('[data-slot="tool-card"]')!.getBoundingClientRect()
          const editor = document.querySelector('textarea')?.getBoundingClientRect()
          return {
            workspaceWidth: workspace.getBoundingClientRect().width,
            headingTop: heading.top,
            headingLeft: heading.left,
            cardTop: card.top,
            cardLeft: card.left,
            editorTop: editor?.top,
            editorHeight: editor?.height,
            scrollHeight: root.scrollHeight,
            viewportHeight: innerHeight,
            hasHorizontalOverflow: root.scrollWidth > innerWidth,
            footerBottom: footer?.bottom,
            hasTruncatedSelect: Array.from(
              document.querySelectorAll('[data-slot="select-value"]'),
            ).some((value) => value.scrollWidth > value.clientWidth),
            clippedControls: controls
              .filter((control) => {
                const rect = control.getBoundingClientRect()
                return (
                  rect.top < 0 ||
                  rect.bottom > innerHeight + 1 ||
                  rect.left < 0 ||
                  rect.right > innerWidth + 1 ||
                  control.clientWidth === 0
                )
              })
              .map((control) => control.id || control.textContent),
          }
        })
        expect(bounds, id).toMatchObject({
          hasHorizontalOverflow: false,
          hasTruncatedSelect: false,
          clippedControls: [],
        })
        expect(bounds.workspaceWidth, id).toBeLessThanOrEqual(960)
        expect(bounds.headingTop, id).toBeCloseTo(
          Math.min(96, Math.max(32, viewport.height * 0.2 - 96)),
          1,
        )
        expect(bounds.cardTop - bounds.headingTop, id).toBeCloseTo(60, 1)
        expect(bounds.cardLeft, id).toBeCloseTo(bounds.headingLeft, 1)
        if (bounds.editorTop !== undefined) {
          editorTop ??= bounds.editorTop
          expect(bounds.editorTop, id).toBeCloseTo(editorTop, 1)
          expect(bounds.editorHeight, id).toBeCloseTo(
            Math.min(256, Math.max(180, viewport.height * 0.3)),
            1,
          )
        }
        expect(bounds.scrollHeight, id).toBeLessThanOrEqual(bounds.viewportHeight + 1)
        expect(bounds.footerBottom, id).toBeLessThanOrEqual(bounds.viewportHeight + 1)
        if (id === 'timestamp') {
          await expect(page.locator('main dl button')).toHaveCount(12)
          await expect(
            page.getByRole('region', { name: '日期转换为时间戳', exact: true }),
          ).toBeVisible()
        }
        if (id === 'timestamp' || id === 'qrcode') {
          await page.screenshot({ path: testInfo.outputPath(`${id}.png`), animations: 'disabled' })
        }
      }
    })
  }
}

test.describe('桌面滚轮与长内容', () => {
  // Playwright 不支持 mobile WebKit 的 mouse.wheel；滚轮用桌面上下文，手机另验可达性。
  test.use({ isMobile: false, hasTouch: false })

  test('边界不继续滚出空白，长文本仍能滚动页面和输入区，清空后恢复一屏', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await openTool(page, 'url')
    for (const selector of ['html', 'body', 'aside', 'textarea']) {
      expect(
        await page
          .locator(selector)
          .evaluate((element) => getComputedStyle(element).overscrollBehaviorY),
      ).toBe('none')
    }
    const input = page.getByLabel('输入文本', { exact: true })
    await input.fill(
      Array.from({ length: 200 }, (_, index) => `第 ${index} 行：长内容可滚动`).join('\n'),
    )
    expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(
      true,
    )
    expect(await input.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(
      true,
    )
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.mouse.move(600, 70)
    await page.mouse.wheel(0, 250)
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await page.mouse.wheel(0, 1000)
    await expect
      .poll(() =>
        page.evaluate(() => ({
          position: scrollY,
          limit: document.documentElement.scrollHeight - innerHeight,
        })),
      )
      .toEqual(
        await page.evaluate(() => ({
          position: document.documentElement.scrollHeight - innerHeight,
          limit: document.documentElement.scrollHeight - innerHeight,
        })),
      )
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.mouse.move(600, 70)
    await page.mouse.wheel(0, -1000)
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
    await input.evaluate((element) => {
      element.scrollTop = 0
    })
    // Firefox 会短暂锁定连续滚轮手势的目标；用键盘验证输入区，避免与上一段页面滚轮串扰。
    await input.focus()
    await input.press(process.platform === 'darwin' ? 'Meta+ArrowUp' : 'Control+Home')
    await input.press('PageDown')
    await expect.poll(() => input.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
    await page.getByRole('button', { name: '清空', exact: true }).click()
    await expect(input).toHaveValue('')
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight)).toBe(720)
  })

  test('长 JSON 结果可滚动查看，内层到边界不带动页面，清空可恢复', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await openTool(page, 'json')
    const input = page.getByLabel('输入 JSON')
    await input.fill(
      JSON.stringify({
        items: Array.from({ length: 150 }, (_, id) => ({ id, text: '测试长内容' })),
      }),
    )
    await page.getByRole('button', { name: '全部展开', exact: true }).click()
    const tree = page.locator('[data-slot="json-tree"]')
    expect(
      await tree.evaluate((element) => ({
        hasOverflow: element.scrollHeight > element.clientHeight,
        overscroll: getComputedStyle(element).overscrollBehaviorY,
      })),
    ).toEqual({ hasOverflow: true, overscroll: 'none' })
    expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(
      true,
    )
    await tree.hover()
    await page.mouse.wheel(0, 300)
    await expect.poll(() => tree.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
    await tree.evaluate((element) => {
      element.scrollTop = element.scrollHeight
    })
    const pageTop = await page.evaluate(() => scrollY)
    await page.mouse.wheel(0, 1000)
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(pageTop)
    await page.getByRole('button', { name: '清空', exact: true }).click()
    await expect(tree).toHaveCount(0)
    await expect(input).toHaveValue('')
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight)).toBe(720)
  })
})

test('手机与放大后的窄窗口不压缩或裁剪长表单，全部操作可滚动到达', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openTool(page, 'timestamp')
  const reverse = page.getByRole('region', { name: '日期转换为时间戳', exact: true })
  expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(true)
  await reverse.getByRole('button', { name: '当前时间', exact: true }).click()
  await expect(reverse.getByRole('button', { name: '复制ISO 格式' })).not.toHaveText('—')
  await page.getByRole('contentinfo').scrollIntoViewIfNeeded()
  await expect(page.getByRole('contentinfo')).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.setViewportSize({ width: 800, height: 600 })
  await page.reload()
  await reverse.getByRole('button', { name: '当前时间', exact: true }).click()
  await page.getByRole('contentinfo').scrollIntoViewIfNeeded()
  await expect(page.getByRole('contentinfo')).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
