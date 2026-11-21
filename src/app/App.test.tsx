import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { tools } from './registry'
import { THEME_KEY } from '../shared/browser/theme'

let media: EventTarget & { matches: boolean }

beforeEach(() => {
  localStorage.clear()
  history.replaceState(null, '', '#/url')
  document.documentElement.classList.remove('dark')
  media = Object.assign(new EventTarget(), { matches: false })
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => media),
  )
  vi.stubGlobal('scrollTo', vi.fn())
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function renderApp() {
  const view = render(<App />)
  return { ...view, themeButton: screen.getByRole('button', { name: /^主题：/ }) }
}

function systemTheme(isDark: boolean) {
  act(() => {
    media.matches = isDark
    media.dispatchEvent(new Event('change'))
  })
}

describe('简洁界面与统一图标', () => {
  it('六工具仅保留必要标签、操作与备案，导航统一用装饰 SVG', () => {
    renderApp()
    expect(screen.getByRole('contentinfo')).toHaveTextContent(/^沪ICP备2026013272号-1$/)
    const icons = screen.getByRole('navigation').querySelectorAll('svg')
    expect(icons).toHaveLength(6)
    for (const icon of icons) {
      expect(icon.tagName).toBe('svg')
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24')
      expect(icon).toHaveAttribute('stroke', 'currentColor')
      expect(icon).toHaveAttribute('stroke-width', '2')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    }
    for (const tool of tools) {
      fireEvent.click(screen.getByRole('link', { name: tool.title }))
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(tool.title)
      expect(screen.getByRole('main').querySelector('input, textarea')).not.toBeNull()
      expect(
        document.querySelector(
          '.eyebrow, .brand-subtitle, .tool-description, .privacy-badge, .field-meta, .shortcut-hint, .system-theme',
        ),
      ).toBeNull()
      expect(screen.getByRole('main').querySelector('.help-text')).toBeNull()
      expect(document.body.textContent).not.toMatch(/\p{Extended_Pictographic}/u)
    }
  })
})

describe('单按钮三态主题', () => {
  it('显示当前状态，按系统 → 亮色 → 暗色 → 系统循环，保存兼容旧键', () => {
    const { themeButton } = renderApp()
    expect(themeButton).toHaveTextContent('跟随系统')
    expect(themeButton).toHaveAccessibleName('主题：跟随系统，切换到亮色模式')
    expect(screen.getByRole('complementary').querySelectorAll('button')).toHaveLength(1)
    fireEvent.click(themeButton)
    expect(themeButton).toHaveTextContent('亮色模式')
    expect(themeButton).toHaveAccessibleName('主题：亮色模式，切换到暗色模式')
    expect(localStorage.getItem(THEME_KEY)).toBe('light')
    expect(document.documentElement).not.toHaveClass('dark')
    fireEvent.click(themeButton)
    expect(themeButton).toHaveTextContent('暗色模式')
    expect(localStorage.getItem(THEME_KEY)).toBe('dark')
    expect(document.documentElement).toHaveClass('dark')
    fireEvent.click(themeButton)
    expect(themeButton).toHaveTextContent('跟随系统')
    expect(localStorage.getItem(THEME_KEY)).toBeNull()
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('系统状态始终显示跟随系统，响应系统变化；手动模式不受影响', () => {
    media.matches = true
    const { themeButton } = renderApp()
    expect(document.documentElement).toHaveClass('dark')
    expect(themeButton).toHaveTextContent('跟随系统')
    systemTheme(false)
    expect(document.documentElement).not.toHaveClass('dark')
    systemTheme(true)
    expect(document.documentElement).toHaveClass('dark')
    fireEvent.click(themeButton)
    systemTheme(false)
    systemTheme(true)
    expect(themeButton).toHaveTextContent('亮色模式')
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it.each(['light', 'dark'] as const)('旧偏好 %s 恢复正确的文案和外观', (preference) => {
    localStorage.setItem(THEME_KEY, preference)
    const { themeButton } = renderApp()
    expect(themeButton).toHaveTextContent(preference === 'light' ? '亮色模式' : '暗色模式')
    expect(document.documentElement.classList.contains('dark')).toBe(preference === 'dark')
    expect(localStorage.getItem(THEME_KEY)).toBe(preference)
  })

  it('其他标签页修改或清除偏好时，按钮状态同步更新', () => {
    const { themeButton } = renderApp()
    localStorage.setItem(THEME_KEY, 'dark')
    fireEvent(window, new StorageEvent('storage', { key: THEME_KEY, newValue: 'dark' }))
    expect(themeButton).toHaveTextContent('暗色模式')
    expect(document.documentElement).toHaveClass('dark')
    localStorage.clear()
    fireEvent(window, new StorageEvent('storage', { key: null }))
    expect(themeButton).toHaveTextContent('跟随系统')
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('存储被拒绝仍可循环切换，不假报保存成功', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    const { themeButton } = renderApp()
    fireEvent.click(themeButton)
    expect(themeButton).toHaveTextContent('亮色模式')
    expect(screen.getByRole('alert')).toHaveTextContent('禁止保存')
    fireEvent.click(themeButton)
    expect(themeButton).toHaveTextContent('暗色模式')
    expect(document.documentElement).toHaveClass('dark')
    expect(screen.getByRole('alert')).toHaveTextContent('禁止保存')
  })

  it('卸载时清理系统主题和跨标签页监听', () => {
    const removeMediaListener = vi.spyOn(media, 'removeEventListener')
    const removeStorageListener = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderApp()
    unmount()
    expect(removeMediaListener).toHaveBeenCalledWith('change', expect.any(Function))
    expect(removeStorageListener).toHaveBeenCalledWith('storage', expect.any(Function))
  })
})
