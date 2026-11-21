import { describe, expect, it } from 'vitest'
import { transformUrl } from './model'

describe('URL 转换', () => {
  it.each(['hello world', '中文 👋', ' a\nb ', 'https://example.com/?q=你好&x=1', 'a+b', '100%'])(
    '组件编码往返：%s',
    (text) => {
      expect(transformUrl(transformUrl(text, 'encode'), 'decode')).toBe(text)
    },
  )
  it('URI 编码保留网址结构', () => {
    expect(transformUrl('https://example.com/?q=中文&x=1', 'uri')).toBe(
      'https://example.com/?q=%E4%B8%AD%E6%96%87&x=1',
    )
  })
  it('不将加号擅自转换为空格', () => expect(transformUrl('a+b', 'decode')).toBe('a+b'))
  it.each(['', '  ', '\n'])('拒绝空输入：%j', (text) =>
    expect(() => transformUrl(text, 'encode')).toThrow(),
  )
  it.each(['%', '%ZZ', '%E4%B8', '%C0%AF'])('拒绝非法编码：%s', (text) =>
    expect(() => transformUrl(text, 'decode')).toThrow(),
  )
  it('拒绝不完整代理字符', () => expect(() => transformUrl('\ud800', 'encode')).toThrow())
})
