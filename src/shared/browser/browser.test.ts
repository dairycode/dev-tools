import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { copyText } from './clipboard'
import { downloadImage } from './download'
import { readTheme, saveTheme, THEME_KEY } from './theme'

beforeEach(() => {
  localStorage.clear()
  document.getSelection()?.removeAllRanges()
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('复制必须真实成功', () => {
  it('使用 Clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    await copyText('中文')
    expect(writeText).toHaveBeenCalledWith('中文')
  })
  it('API 拒绝后尝试 fallback 并恢复焦点', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    })
    const exec = vi.fn().mockReturnValue(true)
    vi.stubGlobal('document', document)
    Object.defineProperty(document, 'execCommand', {
      value: exec,
      configurable: true,
      writable: true,
    })
    const input = document.createElement('input')
    document.body.append(input)
    input.focus()
    await copyText('hello')
    expect(exec).toHaveBeenCalledWith('copy')
    expect(document.activeElement).toBe(input)
    expect(document.querySelector('textarea')).toBeNull()
  })
  it('HTTP 无 Clipboard API 时可回退', async () => {
    vi.stubGlobal('navigator', {})
    Object.defineProperty(document, 'execCommand', {
      value: vi.fn().mockReturnValue(true),
      configurable: true,
    })
    const paragraph = document.createElement('p')
    paragraph.textContent = 'selected'
    document.body.append(paragraph)
    const range = document.createRange()
    range.selectNodeContents(paragraph)
    document.getSelection()?.addRange(range)
    await copyText('hello')
    expect(document.getSelection()?.toString()).toBe('selected')
  })
  it('fallback 返回 false 时拒绝且清理临时节点', async () => {
    vi.stubGlobal('navigator', {})
    Object.defineProperty(document, 'execCommand', {
      value: vi.fn().mockReturnValue(false),
      configurable: true,
    })
    await expect(copyText('hello')).rejects.toThrow('复制未成功')
    expect(document.querySelector('textarea')).toBeNull()
  })
  it('fallback 抛错也清理', async () => {
    vi.stubGlobal('navigator', {})
    Object.defineProperty(document, 'execCommand', {
      value: vi.fn(() => {
        throw new Error('blocked')
      }),
      configurable: true,
    })
    await expect(copyText('hello')).rejects.toThrow('blocked')
    expect(document.querySelector('textarea')).toBeNull()
  })
})

describe('PNG 下载', () => {
  it('创建正确下载链接并清理', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe('qrcode.png')
      expect(this.href).toBe('data:image/png;base64,abc')
    })
    downloadImage('data:image/png;base64,abc', 'qrcode.png')
    expect(click).toHaveBeenCalledOnce()
    expect(document.querySelector('a')).toBeNull()
  })
  it('不接受其他下载数据', () => expect(() => downloadImage('javascript:alert(1)', 'x')).toThrow())
})

describe('主题存储', () => {
  it('默认系统主题，兼容旧键与无效值', () => {
    expect(readTheme()).toBe('system')
    localStorage.setItem(THEME_KEY, 'dark')
    expect(readTheme()).toBe('dark')
    localStorage.setItem(THEME_KEY, 'light')
    expect(readTheme()).toBe('light')
    localStorage.setItem(THEME_KEY, 'invalid')
    expect(readTheme()).toBe('system')
  })
  it('保存手动选择，跟随系统时删除旧记录', () => {
    expect(saveTheme('dark')).toBe(true)
    expect(readTheme()).toBe('dark')
    expect(saveTheme('light')).toBe(true)
    expect(readTheme()).toBe('light')
    expect(saveTheme('system')).toBe(true)
    expect(localStorage.getItem(THEME_KEY)).toBeNull()
  })
  it('读取存储被禁止时仍能运行', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(readTheme()).toBe('system')
  })
  it('保存失败不伪报持久化成功', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(saveTheme('dark')).toBe(false)
  })
})
