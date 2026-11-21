import { test, expect } from '@playwright/test'

const themes = {
  light: {
    surface: 'rgb(255, 255, 255)',
    panel: 'rgb(245, 247, 251)',
    ink: 'rgb(23, 37, 59)',
    brand: 'rgb(23, 103, 188)',
    active: 'rgb(233, 242, 255)',
    danger: 'rgb(180, 35, 53)',
    errorSurface: 'rgb(255, 241, 242)',
    errorInk: 'rgb(168, 23, 50)',
    successSurface: 'rgb(236, 253, 243)',
    successInk: 'rgb(22, 101, 52)',
    jsonString: 'rgb(24, 112, 64)',
    jsonLiteral: 'rgb(147, 82, 179)',
  },
  dark: {
    surface: 'rgb(23, 33, 49)',
    panel: 'rgb(16, 24, 36)',
    ink: 'rgb(229, 237, 248)',
    brand: 'rgb(134, 187, 245)',
    active: 'rgb(34, 59, 88)',
    danger: 'rgb(255, 176, 186)',
    errorSurface: 'rgb(68, 37, 50)',
    errorInk: 'rgb(255, 193, 203)',
    successSurface: 'rgb(21, 55, 40)',
    successInk: 'rgb(164, 232, 190)',
    jsonString: 'rgb(154, 222, 174)',
    jsonLiteral: 'rgb(213, 178, 241)',
  },
}

for (const theme of ['light', 'dark'] as const) {
  test(`${theme}：Tailwind 主题、按钮状态、焦点、自绘下拉和 JSON 配色不回归`, async ({
    page,
  }, testInfo) => {
    const colors = themes[theme]
    await page.addInitScript((value) => localStorage.setItem('dev-tools-theme', value), theme)
    await page.goto('./#/url')
    const input = page.getByLabel('输入文本', { exact: true })
    const primary = page.getByRole('button', { name: '编码', exact: true })
    const secondary = page.getByRole('button', { name: '解码', exact: true })
    const copy = page.getByRole('button', { name: '复制文本', exact: true })
    await expect(page.getByRole('complementary')).toHaveCSS('background-color', colors.surface)
    await expect(input).toHaveCSS('background-color', colors.panel)
    await expect(primary).toHaveCSS('background-color', 'rgb(23, 103, 188)')
    await expect(primary).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(copy).toBeDisabled()
    await expect(copy).toHaveCSS('opacity', '0.5')
    await expect(page.getByRole('button', { name: '清空', exact: true })).toHaveCSS(
      'color',
      colors.danger,
    )
    // 触屏项目不具备 hover 媒体能力；三种桌面引擎分别核验悬停状态。
    if (!testInfo.project.use.isMobile) {
      await primary.hover()
      await expect(primary).toHaveCSS('background-color', 'rgb(16, 84, 158)')
      await secondary.hover()
      await expect(secondary).toHaveCSS('background-color', colors.panel)
      await expect(secondary).toHaveCSS('border-color', colors.brand)
      await expect(secondary).toHaveCSS('color', colors.ink)
    }
    await input.focus()
    await expect(input).toHaveCSS('border-color', colors.brand)
    await expect(input).not.toHaveCSS('box-shadow', 'none')
    await input.fill('hello')
    await primary.click()
    await expect(page.getByRole('status')).toHaveCSS('background-color', colors.successSurface)
    await expect(page.getByRole('status')).toHaveCSS('color', colors.successInk)

    await page.getByRole('link', { name: 'Hash 计算', exact: true }).click()
    const dropdown = page.getByRole('combobox', { name: '选择 Hash 算法' })
    await dropdown.click()
    const selected = page.getByRole('option', { selected: true })
    await expect(selected).toHaveCSS('color', colors.brand)
    await expect(selected).toHaveCSS('background-color', colors.active)
    await expect(dropdown.locator('svg')).toHaveCSS('rotate', '180deg')
    await dropdown.press('Escape')
    await expect(dropdown.locator('svg')).toHaveCSS('rotate', 'none')

    await page.getByRole('link', { name: 'JSON 格式化', exact: true }).click()
    const jsonInput = page.getByLabel('输入 JSON')
    await jsonInput.fill('{"text":"hello","enabled":true,"empty":null,"number":42}')
    const tree = page.getByRole('region', { name: 'JSON 树视图' })
    await expect(tree.getByText('"hello"', { exact: true })).toHaveCSS('color', colors.jsonString)
    await expect(tree.getByText('true', { exact: true })).toHaveCSS('color', colors.jsonLiteral)
    await expect(tree.getByText('null', { exact: true })).toHaveCSS('color', colors.jsonLiteral)
    await expect(tree.getByText('42', { exact: true })).toHaveCSS('color', colors.ink)
    await jsonInput.fill('{bad')
    await expect(page.getByRole('status')).toHaveCSS('background-color', colors.errorSurface)
    await expect(page.getByRole('status')).toHaveCSS('color', colors.errorInk)
    await page.getByRole('button', { name: '格式化', exact: true }).click()
    await expect(page.getByRole('alert')).toHaveCSS('background-color', colors.errorSurface)
    await expect(page.getByRole('alert')).toHaveCSS('color', colors.errorInk)
  })
}
