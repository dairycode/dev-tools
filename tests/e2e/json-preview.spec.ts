import { test, expect } from '@playwright/test'

for (const theme of ['light', 'dark'] as const) {
  test(`${theme}：JSON 编辑、格式化和压缩直接更新旧树，不出现空白帧`, async ({ page }) => {
    await page.clock.install()
    await page.addInitScript((value) => localStorage.setItem('dev-tools-theme', value), theme)
    await page.goto('./#/json')
    const input = page.getByLabel('输入 JSON')
    const tree = page.getByRole('region', { name: 'JSON 树视图' })
    await input.fill('{"nested":{"oldValue":1},"keep":{"value":true}}')
    await expect(tree).toBeVisible()
    await page.getByRole('button', { name: '折叠 /keep', exact: true }).click()
    const monitor = await tree.evaluateHandle((node) => {
      const state = {
        node,
        missing: 0,
        detached: 0,
        observer: new MutationObserver(() => {
          if (!document.querySelector('[data-slot="json-tree"]')) state.missing++
          if (!node.isConnected) state.detached++
        }),
      }
      state.observer.observe(document.querySelector('main')!, { childList: true, subtree: true })
      return state
    })
    try {
      for (const name of ['格式化', '压缩']) {
        await page.getByRole('button', { name, exact: true }).click()
        await expect(tree.getByText('"oldValue"', { exact: true })).toBeVisible()
        // 覆盖完整防抖提交，而不是仅检查点击后的同步帧。
        await expect
          .poll(async () => input.inputValue())
          .toMatch(name === '格式化' ? /\n/ : /^\{[^\n]+\}$/)
        await page.clock.runFor(550)
        await expect(page.getByRole('button', { name: '展开 /keep', exact: true })).toBeVisible()
      }
      await input.fill('{"nested":{"newValue":2},"keep":{"value":false},"added":{"ready":true}}')
      await expect(tree.getByText('"newValue"', { exact: true })).toBeVisible()
      await expect(tree.getByText('"oldValue"', { exact: true })).toHaveCount(0)
      await expect(page.getByRole('button', { name: '展开 /keep', exact: true })).toBeVisible()
      await expect(page.getByRole('button', { name: '折叠 /added', exact: true })).toBeVisible()
      expect(
        await monitor.evaluate(({ node, missing, detached }) => ({
          connected: node.isConnected,
          missing,
          detached,
        })),
      ).toEqual({ connected: true, missing: 0, detached: 0 })
    } finally {
      await monitor.evaluate(({ observer }) => observer.disconnect())
      await monitor.dispose()
    }
    await input.fill('{bad')
    await expect(page.getByRole('main').getByRole('status')).toContainText('JSON 尚未有效')
    await expect(tree).toHaveCount(0)
    await input.fill('{"pending":1}')
    await page.getByRole('button', { name: '清空', exact: true }).click()
    await expect(input).toHaveValue('')
    await expect(tree).toHaveCount(0)
    await expect(page.getByRole('status')).toHaveCount(0)
  })
}

test('JSON 格式化保留结果滚动容器及已有滚动位置', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.clock.install()
  await page.goto('./#/json')
  const text = JSON.stringify(Array.from({ length: 100 }, (_, id) => ({ id, text: '内容' })))
  const input = page.getByLabel('输入 JSON')
  await input.fill(text)
  await page.getByRole('button', { name: '全部展开', exact: true }).click()
  const tree = page.locator('[data-slot="json-tree"]')
  const previous = await tree.evaluateHandle((node) => {
    node.scrollTop = 220
    return node
  })
  try {
    await page.getByRole('button', { name: '格式化', exact: true }).click()
    await page.clock.runFor(550)
    expect(
      await previous.evaluate((node) => ({ connected: node.isConnected, top: node.scrollTop })),
    ).toEqual({ connected: true, top: 220 })
    await expect(page.getByRole('button', { name: '折叠 /99', exact: true })).toHaveCount(1)
  } finally {
    await previous.dispose()
  }
})
