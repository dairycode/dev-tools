import { test as base, expect, type Locator, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFile } from 'node:fs/promises'
import { PNG } from 'pngjs'
import jsQR from 'jsqr'

const test = base.extend({
  page: async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await use(page)
    expect(errors, '页面不应出现未处理异常').toEqual([])
  },
})

const toolCases = [
  {
    id: 'url',
    title: 'URL 编码/解码',
    input: '#url-input',
    value: 'https://example.com/?q=中文&x=1',
  },
  { id: 'base64', title: 'Base64 编码/解码', input: '#base64-input', value: 'Hello，开发者 👋' },
  { id: 'hash', title: 'Hash 计算', input: '#hash-input', value: 'hello world' },
  { id: 'timestamp', title: '时间戳转换', input: null, value: '' },
  { id: 'qrcode', title: '二维码生成', input: '#qr-input', value: 'https://example.com' },
  {
    id: 'json',
    title: 'JSON 格式化',
    input: '#json-input',
    value: '{"name":"开发工具包","items":[1,true,null],"nested":{"hello":"world"}}',
  },
]

async function openTool(page: Page, id: string) {
  await page.goto(`./#/${id}`)
  await expect(page.locator('.tool-card').first()).toBeVisible()
  await expect(page.locator('main input, main textarea').first()).toBeVisible()
}

async function chooseOption(scope: Page | Locator, label: string, option: string) {
  await scope.getByRole('combobox', { name: label, exact: true }).click()
  await scope.getByRole('option', { name: option, exact: true }).click()
}

for (const theme of ['light', 'dark'] as const) {
  for (const tool of toolCases) {
    test(`${tool.id} ${theme}：界面、布局与无障碍`, async ({ page }, testInfo) => {
      await page.addInitScript((value) => localStorage.setItem('dev-tools-theme', value), theme)
      await page.clock.setFixedTime(new Date('2026-04-17T12:34:56Z'))
      await openTool(page, tool.id)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(tool.title)
      await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(6)
      await expect(page.locator('.tool-nav svg.icon')).toHaveCount(6)
      await expect(page.locator('.sidebar-footer button')).toHaveCount(1)
      await expect(
        page.locator(
          '.eyebrow, .brand-subtitle, .tool-description, .privacy-badge, .field-meta, .shortcut-hint, .system-theme',
        ),
      ).toHaveCount(0)
      expect(await page.locator('body').innerText()).not.toMatch(/\p{Extended_Pictographic}/u)
      await expect(page.getByRole('contentinfo')).toHaveText('沪ICP备2026013272号-1')
      await expect(page.getByRole('button', { name: /^主题：/ })).toHaveText(
        theme === 'dark' ? '暗色模式' : '亮色模式',
      )
      if (tool.input) await page.locator(tool.input).fill(tool.value)
      if (tool.id === 'qrcode') {
        await page.getByRole('button', { name: '生成二维码', exact: true }).click()
        await expect(page.getByAltText('生成的二维码')).toBeVisible()
      }
      if (tool.id === 'json')
        await expect(page.getByRole('region', { name: 'JSON 树视图' })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      await expect(page.locator('html')).toHaveClass(theme === 'dark' ? /dark/ : '')
      await expect(page.locator('select')).toHaveCount(0)
      const accessibility = await new AxeBuilder({ page }).analyze()
      expect(accessibility.violations).toEqual([])
      await page.screenshot({
        path: testInfo.outputPath(`${tool.id}-${theme}.png`),
        fullPage: true,
        animations: 'disabled',
      })
      const dropdown = page.getByRole('combobox')
      if (await dropdown.count()) {
        if (testInfo.project.use.isMobile) await dropdown.tap()
        else await dropdown.click()
        const list = page.getByRole('listbox')
        await expect(list).toBeVisible()
        await expect(dropdown).toBeFocused()
        const geometry = await dropdown.evaluate((element) => {
          const control = element.getBoundingClientRect()
          const arrow = element.querySelector('svg')?.getBoundingClientRect()
          const menu = document.querySelector('[role="listbox"]')?.getBoundingClientRect()
          if (!arrow || !menu) throw new Error('下拉箭头或弹层不存在')
          return {
            arrowRight: control.right - arrow.right,
            arrowCenter: Math.abs(control.y + control.height / 2 - arrow.y - arrow.height / 2),
            isInsideViewport:
              menu.left >= 0 &&
              menu.right <= innerWidth &&
              menu.top >= 0 &&
              menu.bottom <= innerHeight,
            widthDifference: Math.abs(menu.width - control.width),
          }
        })
        expect(geometry.arrowRight).toBeGreaterThanOrEqual(16)
        expect(geometry.arrowRight).toBeLessThanOrEqual(18)
        expect(geometry.arrowCenter).toBeLessThan(1)
        expect(geometry.isInsideViewport).toBe(true)
        expect(geometry.widthDifference).toBeLessThan(1)
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
        await expect(list).toBeVisible()
        await page.screenshot({
          path: testInfo.outputPath(`${tool.id}-${theme}-dropdown.png`),
          animations: 'disabled',
        })
        await dropdown.press('Escape')
      }
    })
  }
}

test('URL：编码、解码、URI、非法输入、快捷键与清空', async ({ page }) => {
  await openTool(page, 'url')
  const input = page.getByLabel('输入文本', { exact: true })
  await input.fill('中文 + /?')
  await input.press('Control+Enter')
  await expect(input).toHaveValue(encodeURIComponent('中文 + /?'))
  await page.getByRole('button', { name: '解码', exact: true }).click()
  await expect(input).toHaveValue('中文 + /?')
  await input.fill('https://example.com/?q=中文&x=1')
  await page.getByRole('button', { name: 'URI编码', exact: true }).click()
  await expect(input).toHaveValue(encodeURI('https://example.com/?q=中文&x=1'))
  await input.fill('%ZZ')
  await page.getByRole('button', { name: '解码', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(input).toHaveValue('%ZZ')
  await page.getByRole('button', { name: '清空', exact: true }).click()
  await expect(input).toHaveValue('')
})

test('Base64：Unicode、Latin-1 兼容、无效输入保留', async ({ page }) => {
  await openTool(page, 'base64')
  const input = page.getByLabel('输入文本', { exact: true })
  await input.fill('中文 👋')
  await input.press('Meta+Enter')
  await expect(input).toHaveValue('5Lit5paHIPCfkYs=')
  await page.getByRole('button', { name: '解码', exact: true }).click()
  await expect(input).toHaveValue('中文 👋')
  await chooseOption(page, '字符编码', 'Latin-1')
  await input.fill('é')
  await page.getByRole('button', { name: '编码', exact: true }).click()
  await expect(input).toHaveValue('6Q==')
  await page.getByRole('button', { name: '解码', exact: true }).click()
  await expect(input).toHaveValue('é')
  await input.fill('invalid!')
  await page.getByRole('button', { name: '解码', exact: true }).click()
  await expect(input).toHaveValue('invalid!')
  await expect(page.getByRole('alert')).toBeVisible()
})

test('Hash：实时、四种算法、原文选项与清空', async ({ page }) => {
  await openTool(page, 'hash')
  await page.getByLabel('输入文本', { exact: true }).fill(' abc ')
  const output = page.getByRole('button', { name: '点击复制 Hash 值' })
  await expect(output).toHaveText('900150983cd24fb0d6963f7d28e17f72')
  await chooseOption(page, '选择 Hash 算法', 'SHA-1')
  await expect(output).toHaveText('a9993e364706816aba3e25717850c26c9cd0d89d')
  await chooseOption(page, '选择 Hash 算法', 'SHA-256')
  await expect(output).toHaveText(
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  )
  await chooseOption(page, '选择 Hash 算法', 'SHA-512')
  await expect(output).toHaveText(/^[0-9a-f]{128}$/)
  await page.getByRole('checkbox').uncheck()
  await expect(output).not.toHaveText(
    'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
  )
  await page.getByRole('button', { name: '清空', exact: true }).click()
  await expect(output).toHaveCount(0)
})

test('时间戳：0、负数、单位、日期双向转换、分别清空', async ({ page }) => {
  await openTool(page, 'timestamp')
  const forward = page.getByRole('region', { name: '时间戳转换为日期', exact: true })
  await forward.getByLabel('时间戳', { exact: true }).fill('0')
  await forward.getByRole('button', { name: '转换', exact: true }).click()
  await expect(forward.getByRole('button', { name: '复制ISO 格式' })).toHaveText(
    '1970-01-01T00:00:00.000Z',
  )
  await chooseOption(forward, '单位', '毫秒')
  await forward.getByLabel('时间戳', { exact: true }).fill('-1')
  await forward.getByLabel('时间戳', { exact: true }).press('Control+Enter')
  await expect(forward.getByRole('button', { name: '复制毫秒时间戳' })).toHaveText('-1')
  await forward.getByLabel('时间戳', { exact: true }).fill('123oops')
  await forward.getByRole('button', { name: '转换', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  const reverse = page.getByRole('region', { name: '日期转换为时间戳', exact: true })
  await reverse.getByLabel('日期（本地时区）').fill('2024-01-02')
  await reverse.getByLabel('时间', { exact: true }).fill('03:04:05')
  await reverse.getByRole('button', { name: '转换', exact: true }).click()
  await expect(reverse.getByRole('button', { name: '复制ISO 格式' })).toHaveText(
    '2024-01-01T19:04:05.000Z',
  )
  await forward.getByRole('button', { name: '清空', exact: true }).click()
  await expect(forward.getByLabel('时间戳', { exact: true })).toHaveValue('')
  await expect(reverse.getByLabel('日期（本地时区）')).toHaveValue('2024-01-02')
})

test('当前时间不混用 UTC 与本地日期', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.clock.setFixedTime(new Date('2024-01-01T20:30:40Z'))
  await openTool(page, 'timestamp')
  await expect(page.getByLabel('日期（本地时区）')).toHaveValue('2024-01-02')
  await page.getByRole('button', { name: '当前时间', exact: true }).click()
  await expect(page.getByLabel('日期（本地时区）')).toHaveValue('2024-01-02')
})

test('二维码：生成、下载、真实解码、变更与失败不保留旧图', async ({ page }) => {
  await openTool(page, 'qrcode')
  const downloadButton = page.getByRole('button', { name: '下载二维码' })
  await expect(downloadButton).toBeDisabled()
  await page.getByLabel('输入内容').fill('https://example.com/?q=中文')
  await page.getByRole('button', { name: '生成二维码', exact: true }).click()
  await expect(page.getByAltText('生成的二维码')).toBeVisible()
  const waiting = page.waitForEvent('download')
  await downloadButton.click()
  const download = await waiting
  expect(download.suggestedFilename()).toBe('qrcode.png')
  const file = await download.path()
  expect(file).not.toBeNull()
  if (!file) throw new Error('下载未生成文件')
  const png = PNG.sync.read(await readFile(file))
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)
  expect(decoded?.data).toBe('https://example.com/?q=中文')
  await page.getByLabel('输入内容').fill('中'.repeat(5000))
  await expect(downloadButton).toBeDisabled()
  await page.getByRole('button', { name: '生成二维码', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(downloadButton).toBeDisabled()
  await expect(page.getByAltText('生成的二维码')).toHaveCount(0)
})

test('JSON：精度、树操作、根节点、快捷键和非法输入', async ({ page }) => {
  await openTool(page, 'json')
  const input = page.getByLabel('输入 JSON')
  const text = '{"id":42,"id":900719925474099312345,"a.b":{},"a":{"b":{}},"items":[true,null]}'
  await input.fill(text)
  await expect(page.getByRole('region', { name: 'JSON 树视图' })).toBeVisible()
  await input.press('Control+Enter')
  await expect(input).toHaveValue(/900719925474099312345/)
  await page.getByRole('button', { name: '压缩', exact: true }).click()
  await expect(input).toHaveValue(text)
  await page.getByRole('button', { name: '全部折叠', exact: true }).click()
  await expect(page.getByRole('button', { name: '展开 root', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  await page.getByRole('button', { name: '全部展开', exact: true }).click()
  await expect(page.getByRole('button', { name: '折叠 /a.b', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '折叠 /a/b', exact: true })).toBeVisible()
  await input.fill('null')
  await expect(page.locator('.json-value')).toHaveText('null')
  await input.fill('{bad')
  await page.getByRole('button', { name: '格式化', exact: true }).click()
  await expect(input).toHaveValue('{bad')
  await expect(page.getByRole('alert')).toBeVisible()
})

test('JSON：大输入保护不妨碍格式化与页面操作', async ({ page }) => {
  await openTool(page, 'json')
  const input = page.getByLabel('输入 JSON')
  await input.fill(JSON.stringify(Array.from({ length: 3000 }, (_, index) => ({ id: index }))))
  await expect(page.getByText(/超大或过深数据暂不展开树视图/)).toBeVisible()
  await page.getByRole('button', { name: '格式化', exact: true }).click()
  await expect(input).toHaveValue(/\n {2}\{/)
  await page.getByRole('button', { name: '清空', exact: true }).click()
  await expect(input).toHaveValue('')
})

test('导航：直达、刷新、前进后退、未知路径与输入重置', async ({ page }) => {
  await openTool(page, 'url')
  await page.getByLabel('输入文本', { exact: true }).fill('private text')
  const historyLength = await page.evaluate(() => history.length)
  await page.getByRole('link', { name: 'URL 编码/解码', exact: true }).click()
  expect(await page.evaluate(() => history.length)).toBe(historyLength)
  await expect(page.getByLabel('输入文本', { exact: true })).toHaveValue('private text')
  await page.getByRole('link', { name: 'Base64 编码/解码' }).click()
  await expect(page).toHaveURL(/#\/base64$/)
  await page.reload()
  await expect(page.getByLabel('字符编码')).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('URL 编码/解码')
  await expect(page.getByLabel('输入文本', { exact: true })).toHaveValue('')
  await page.goForward()
  await expect(page.getByLabel('字符编码')).toBeVisible()
  await page.goto('./#/not-a-tool')
  await expect(page).toHaveURL(/#\/url$/)
})

test('首次切换所有工具无需额外脚本，每次下一帧即可操作且不闪加载提示', async ({ page }) => {
  await openTool(page, 'url')
  const scriptRequests: string[] = []
  await page.route(/\.js(?:\?|$)/u, (route) => {
    scriptRequests.push(route.request().url())
    return route.abort()
  })
  const screens = await page.evaluate(
    async (tools) => {
      const loadingMessages: string[] = []
      const observer = new MutationObserver((records) => {
        for (const record of records)
          for (const node of Array.from(record.addedNodes)) {
            if (node.textContent?.includes('工具加载中')) loadingMessages.push(node.textContent)
          }
      })
      observer.observe(document.querySelector('main') ?? document.body, {
        childList: true,
        subtree: true,
      })
      try {
        const results = []
        for (const tool of tools) {
          document.querySelector<HTMLAnchorElement>(`a[href="#/${tool.id}"]`)?.click()
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
          results.push({
            title: document.querySelector('h1')?.textContent,
            hasInput: document.querySelector(tool.input ?? '#timestamp-input') !== null,
            hasCard: document.querySelector('.tool-card') !== null,
          })
        }
        return { results, loadingMessages }
      } finally {
        observer.disconnect()
      }
    },
    [...toolCases.slice(1), toolCases[0]!],
  )
  expect(screens.loadingMessages).toEqual([])
  expect(screens.results).toEqual(
    [...toolCases.slice(1), toolCases[0]!].map((tool) => ({
      title: tool.title,
      hasInput: true,
      hasCard: true,
    })),
  )
  expect(scriptRequests).toEqual([])
})

test('自绘下拉框：键盘确认、取消、Tab 焦点和外部点击', async ({ page }) => {
  await openTool(page, 'hash')
  const dropdown = page.getByRole('combobox', { name: '选择 Hash 算法' })
  await page.getByLabel('输入文本', { exact: true }).focus()
  await page.keyboard.press('Tab')
  await expect(dropdown).toBeFocused()
  await dropdown.press('End')
  await page.evaluate(() => window.dispatchEvent(new Event('scroll')))
  await expect(dropdown).toHaveAttribute('aria-activedescendant', 'hash-algorithm-options-3')
  await dropdown.press('Enter')
  await expect(dropdown).toHaveText('SHA-512')
  await expect(dropdown).toBeFocused()
  await dropdown.press('Home')
  await dropdown.press('Escape')
  await expect(dropdown).toHaveText('SHA-512')
  await dropdown.press('ArrowUp')
  await dropdown.press('ArrowUp')
  await dropdown.press('Tab')
  await expect(dropdown).toHaveText('SHA-256')
  // Safari 的系统键盘设置可跳过原生 checkbox，不强制覆盖浏览器的焦点顺序。
  await expect(dropdown).not.toBeFocused()
  await expect(page.getByRole('listbox')).toHaveCount(0)
  await dropdown.click()
  await page.getByRole('heading', { level: 1 }).click()
  await expect(page.getByRole('listbox')).toHaveCount(0)
  await expect(dropdown).toHaveText('SHA-256')
})

test('主题：单按钮三态循环、键盘、系统响应与刷新持久化', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await openTool(page, 'url')
  const toggle = page.getByRole('button', { name: /^主题：/ })
  await expect(toggle).toHaveText('跟随系统')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await toggle.press('Enter')
  await expect(toggle).toHaveText('亮色模式')
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await page.reload()
  await expect(toggle).toHaveText('亮色模式')
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  expect(await page.evaluate(() => localStorage.getItem('dev-tools-theme'))).toBe('light')
  await toggle.press('Space')
  await expect(toggle).toHaveText('暗色模式')
  await expect(page.locator('html')).toHaveClass(/dark/)
  expect(await page.evaluate(() => localStorage.getItem('dev-tools-theme'))).toBe('dark')
  await toggle.click()
  await expect(toggle).toHaveText('跟随系统')
  expect(await page.evaluate(() => localStorage.getItem('dev-tools-theme'))).toBeNull()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await expect(toggle).toHaveText('跟随系统')
  await page.reload()
  await expect(toggle).toHaveText('跟随系统')
  await expect(page.locator('html')).not.toHaveClass(/dark/)
})

test('禁用存储仍能使用、复制失败不假报成功', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'getItem', {
      value() {
        throw new Error('denied')
      },
    })
    Object.defineProperty(Storage.prototype, 'setItem', {
      value() {
        throw new Error('denied')
      },
    })
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('denied')) },
      configurable: true,
    })
    document.execCommand = () => false
  })
  await openTool(page, 'url')
  await page.getByLabel('输入文本', { exact: true }).fill('keep me')
  await page.getByRole('button', { name: '复制文本' }).click()
  await expect(page.getByRole('alert')).toHaveText(/复制失败/)
  await expect(page.getByLabel('输入文本', { exact: true })).toHaveValue('keep me')
  const toggle = page.getByRole('button', { name: /^主题：/ })
  await toggle.click()
  await expect(toggle).toHaveText('亮色模式')
  await toggle.click()
  await expect(toggle).toHaveText('暗色模式')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.getByRole('alert')).toHaveText(/禁止保存/)
})

test('隐私：输入不进入 URL、持久化或外部网络', async ({ page, baseURL }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  const secret = 'sensitive-input-724563'
  await openTool(page, 'base64')
  await page.getByLabel('输入文本', { exact: true }).fill(secret)
  await page.getByRole('button', { name: '编码', exact: true }).click()
  expect(page.url()).not.toContain(secret)
  expect(await page.evaluate(() => ({ ...localStorage, ...sessionStorage }))).toEqual({})
  expect(requests.every((url) => url.startsWith(new URL(baseURL ?? '').origin))).toBe(true)
  expect(requests.join(' ')).not.toContain(secret)
})

test('Docker：健康检查、缓存、MIME、缺失资源与安全头', async ({ request }) => {
  test.skip(process.env.E2E_CONTAINER !== '1', '此项只针对真实容器执行')
  const health = await request.get('./healthz')
  expect(health.status()).toBe(200)
  expect(await health.text()).toBe('ok\n')
  const index = await request.get('./')
  expect(index.headers()['cache-control']).toBe('no-cache')
  expect(index.headers()['x-content-type-options']).toBe('nosniff')
  const source = await index.text()
  const script = source.match(/src="([^"]+\.js)"/u)?.[1]
  expect(script).toBeTruthy()
  if (!script) throw new Error('生产入口脚本不存在')
  const asset = await request.get(script, { headers: { 'Accept-Encoding': 'gzip' } })
  expect(asset.status()).toBe(200)
  expect(asset.headers()['content-type']).toMatch(/javascript/)
  expect(asset.headers()['cache-control']).toContain('immutable')
  expect(asset.headers()['content-encoding']).toBe('gzip')
  const missing = await request.get('./assets/not-found.js')
  expect(missing.status()).toBe(404)
  expect(missing.headers()['cache-control']).toBe('no-cache')
})
