import { describe, expect, it } from 'vitest'
import { createQrMatrix } from './model'

describe('二维码矩阵', () => {
  it.each(['https://example.com', '中文 👋', ' a\nb '])('编码内容：%s', (text) => {
    const code = createQrMatrix(text)
    expect(code.modules.size).toBeGreaterThanOrEqual(21)
    expect(code.modules.data.length).toBe(code.modules.size ** 2)
  })
  it.each(['', ' '])('拒绝空内容', (text) => expect(() => createQrMatrix(text)).toThrow())
  it('容量超限时明确失败', () => expect(() => createQrMatrix('中'.repeat(5000))).toThrow())
})
