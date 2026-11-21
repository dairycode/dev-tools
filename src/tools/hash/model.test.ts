import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { calculateHash, type HashAlgorithm } from './model'

describe('Hash 标准向量', () => {
  for (const algorithm of ['md5', 'sha1', 'sha256', 'sha512'] satisfies HashAlgorithm[]) {
    it.each(['', 'abc', '中文 👋', ' a\nb '])(`${algorithm}：%j`, (text) => {
      expect(calculateHash(text, algorithm, false)).toBe(
        createHash(algorithm).update(text, 'utf8').digest('hex'),
      )
    })
    it(`${algorithm} 默认兼容旧版 trim`, () =>
      expect(calculateHash(' abc\n', algorithm)).toBe(calculateHash('abc', algorithm, false)))
  }
})
