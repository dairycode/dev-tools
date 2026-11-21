import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const baseURL = process.env.CAPTURE_URL ?? process.env.BASELINE_URL
if (!baseURL) throw new Error('请设置 CAPTURE_URL，指向待截图的服务')
const version = process.env.CAPTURE_VERSION === 'after' ? 'after' : 'before'
const output = `docs/screenshots/${version}`
const browser = await chromium.launch(
  process.env.CAPTURE_CHANNEL ? { channel: process.env.CAPTURE_CHANNEL } : {},
)
const tools = [
  ['url', 'URL编码/解码', '#url-input', 'https://example.com/?q=中文&x=1'],
  ['base64', 'Base64编码/解码', '#base64-input', 'Hello，开发者 👋'],
  ['hash', 'Hash编码', '#input-text', 'hello world'],
  ['timestamp', '时间戳转换', null, null],
  ['qrcode', '二维码生成', '#qr-input', 'https://example.com'],
  [
    'json',
    'JSON格式化',
    '#json-input',
    '{"name":"开发工具包","items":[1,true,null],"nested":{"hello":"world"}}',
  ],
]
const timings = []
try {
  for (const [size, viewport] of [
    ['desktop', { width: 1440, height: 1000 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport,
        colorScheme: theme,
        locale: 'zh-CN',
        timezoneId: 'Asia/Shanghai',
      })
      await context.addInitScript((value) => localStorage.setItem('dev-tools-theme', value), theme)
      const page = await context.newPage()
      await page.goto(baseURL)
      await page.getByRole('navigation').waitFor()
      timings.push({
        size,
        theme,
        navigation: await page.evaluate(() => ({
          domContentLoaded:
            performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd ?? null,
          resources: performance.getEntriesByType('resource').length,
        })),
      })
      for (const [id, label, input, value] of tools) {
        if (version === 'before')
          await page.locator('.sidebar-nav .nav-item').filter({ hasText: label }).click()
        else await page.getByRole('navigation').locator(`a[href="#/${id}"]`).click()
        const selector = version === 'after' && id === 'hash' ? '#hash-input' : input
        if (version === 'after' && id === 'timestamp')
          await page.locator('#timestamp-input').waitFor()
        if (selector && value) await page.locator(selector).fill(value)
        if (id === 'qrcode') {
          await page.getByRole('button', { name: '生成二维码', exact: true }).click()
          if (version === 'after') await page.getByAltText('生成的二维码').waitFor()
        }
        if (id === 'json') await page.getByText('root', { exact: true }).waitFor()
        if (version === 'after') {
          const dismiss = page.getByRole('button', { name: '关闭提示', exact: true })
          if (await dismiss.isVisible()) await dismiss.click()
        }
        await page.waitForTimeout(150)
        await mkdir(output, { recursive: true })
        await page.screenshot({
          path: `${output}/${id}-${size}-${theme}.png`,
          fullPage: true,
        })
        if (version === 'after' && (await page.getByRole('combobox').count())) {
          const dropdown = page.getByRole('combobox')
          await dropdown.click()
          await page.getByRole('listbox').waitFor()
          await page.screenshot({
            path: `${output}/${id}-${size}-${theme}-dropdown.png`,
            animations: 'disabled',
          })
          await dropdown.press('Escape')
        }
      }
      await context.close()
    }
  }
  await writeFile(`${output}/timings.json`, JSON.stringify(timings, null, 2) + '\n')
} finally {
  await browser.close()
}
