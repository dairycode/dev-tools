import { describe, expect, it } from 'vitest'
import { encodeBase64, decodeBase64 } from './model'

describe('Base64', () => {
  it.each(['hello', '中文 👋', 'é\u0000\n', ' a\nb ', '😀'.repeat(20_000)])(
    'UTF-8 往返：%s',
    (text) => {
      expect(decodeBase64(encodeBase64(text))).toBe(text)
    },
  )
  it('兼容 ASCII 标准结果', () => expect(encodeBase64('hello')).toBe('aGVsbG8='))
  it('Latin-1 保留旧版字节语义', () => {
    expect(encodeBase64('é', 'latin1')).toBe('6Q==')
    expect(decodeBase64('6Q==', 'latin1')).toBe('é')
    expect(encodeBase64('é')).toBe('w6k=')
  })
  it('提示无效 UTF-8 而不是替换损坏数据', () =>
    expect(() => decodeBase64('6Q==')).toThrow('Latin-1'))
  it('Latin-1 不接受超出字节范围的字符', () =>
    expect(() => encodeBase64('中文', 'latin1')).toThrow())
  it('允许编码文本外部的空白', () => expect(decodeBase64(' aGVsbG8=\n')).toBe('hello'))
  it.each(['', ' ', 'a', 'abc', '====', 'a===', 'aGVs bG8=', 'aGVsbG8!', 'aGVsbG8==='])(
    '拒绝非法 Base64：%j',
    (text) => expect(() => decodeBase64(text)).toThrow(),
  )
  it.each(['', '  ', '\n'])('拒绝空编码输入：%j', (text) =>
    expect(() => encodeBase64(text)).toThrow(),
  )
})
